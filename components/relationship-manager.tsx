"use client"

import { useState, useCallback, useEffect } from "react"
import ReactFlow, {
  type Node,
  type Edge,
  addEdge,
  type Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  ReactFlowProvider,
} from "reactflow"
import "reactflow/dist/style.css"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useData, type SchemaField } from "@/contexts/data-context"
import { Plus, Trash2 } from "lucide-react"

export function RelationshipManager() {
  return (
    <ReactFlowProvider>
      <RelationshipManagerContent />
    </ReactFlowProvider>
  )
}

function RelationshipManagerContent() {
  const { schemas, relationships, addRelationship, removeRelationship } = useData()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedSourceField, setSelectedSourceField] = useState<SchemaField | null>(null)
  const [selectedTargetField, setSelectedTargetField] = useState<SchemaField | null>(null)
  const [relationshipName, setRelationshipName] = useState("")
  const [relationshipType, setRelationshipType] = useState<"one-to-one" | "one-to-many" | "many-to-many">("one-to-one")

  // Initialize nodes from schemas
  const initializeNodes = useCallback(() => {
    const newNodes: Node[] = []
    let yOffset = 0

    schemas.forEach((schema, schemaIndex) => {
      // Schema header node
      newNodes.push({
        id: `schema-${schema.id}`,
        type: "default",
        position: { x: schemaIndex * 400, y: yOffset },
        data: {
          label: (
            <div className="p-2 bg-blue-50 border-2 border-blue-200 rounded">
              <div className="font-bold text-blue-800">{schema.name}</div>
              <div className="text-xs text-blue-600">{schema.fields.length} fields</div>
            </div>
          ),
        },
        style: { background: "transparent", border: "none" },
      })

      // Field nodes
      schema.fields.forEach((field, fieldIndex) => {
        newNodes.push({
          id: `field-${schema.id}-${field.path}`,
          type: "default",
          position: { x: schemaIndex * 400, y: yOffset + 80 + fieldIndex * 60 },
          data: {
            label: (
              <div className="p-2 bg-gray-50 border border-gray-200 rounded text-sm">
                <div className="font-medium">{field.name}</div>
                <div className="text-xs text-gray-500">{field.type}</div>
              </div>
            ),
          },
          style: { width: 200 },
        })
      })

      yOffset = Math.max(yOffset, 80 + schema.fields.length * 60 + 100)
    })

    setNodes(newNodes)
  }, [schemas, setNodes])

  // Initialize edges from relationships
  const initializeEdges = useCallback(() => {
    const newEdges: Edge[] = relationships.map((rel) => ({
      id: rel.id,
      source: `field-${rel.sourceField.schemaId}-${rel.sourceField.path}`,
      target: `field-${rel.targetField.schemaId}-${rel.targetField.path}`,
      label: rel.name,
      type: "smoothstep",
      style: { stroke: "#3b82f6", strokeWidth: 2 },
      labelStyle: { fill: "#3b82f6", fontWeight: 600 },
    }))
    setEdges(newEdges)
  }, [relationships, setEdges])

  // Initialize when schemas change
  useEffect(() => {
    initializeNodes()
    initializeEdges()
  }, [schemas, relationships, initializeNodes, initializeEdges])

  const onConnect = useCallback((params: Connection) => {
    const sourceField = findFieldByNodeId(params.source!)
    const targetField = findFieldByNodeId(params.target!)

    if (sourceField && targetField) {
      setSelectedSourceField(sourceField)
      setSelectedTargetField(targetField)
    }
  }, [])

  const findFieldByNodeId = (nodeId: string): SchemaField | null => {
    const parts = nodeId.split("-")
    if (parts.length < 3) return null

    const schemaId = parts[1]
    const fieldPath = parts.slice(2).join("-")

    const schema = schemas.find((s) => s.id === schemaId)
    return schema?.fields.find((f) => f.path === fieldPath) || null
  }

  const handleCreateRelationship = () => {
    if (!selectedSourceField || !selectedTargetField || !relationshipName.trim()) return

    addRelationship({
      name: relationshipName,
      sourceField: selectedSourceField,
      targetField: selectedTargetField,
      type: relationshipType,
    })

    // Add edge to flow
    const newEdge: Edge = {
      id: `rel-${Date.now()}`,
      source: `field-${selectedSourceField.schemaId}-${selectedSourceField.path}`,
      target: `field-${selectedTargetField.schemaId}-${selectedTargetField.path}`,
      label: relationshipName,
      type: "smoothstep",
      style: { stroke: "#3b82f6", strokeWidth: 2 },
      labelStyle: { fill: "#3b82f6", fontWeight: 600 },
    }

    setEdges((eds) => addEdge(newEdge, eds))

    // Reset form
    setSelectedSourceField(null)
    setSelectedTargetField(null)
    setRelationshipName("")
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Relationship Manager</h1>
        <p className="text-muted-foreground">Define and visualize relationships between schema fields</p>
      </div>

      {schemas.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No schemas available. Please upload schemas first to define relationships.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Visual Relationship Mapper</CardTitle>
                <CardDescription>Connect fields by dragging lines between them</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ height: "600px" }}>
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                  >
                    <Controls />
                    <Background variant="dots" gap={12} size={1} />
                  </ReactFlow>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Relationship</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedSourceField && selectedTargetField ? (
                  <>
                    <div>
                      <Label>Source Field</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedSourceField.path} ({selectedSourceField.type})
                      </p>
                    </div>
                    <div>
                      <Label>Target Field</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedTargetField.path} ({selectedTargetField.type})
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="rel-name">Relationship Name</Label>
                      <Input
                        id="rel-name"
                        value={relationshipName}
                        onChange={(e) => setRelationshipName(e.target.value)}
                        placeholder="e.g., 'user_orders'"
                      />
                    </div>
                    <div>
                      <Label>Relationship Type</Label>
                      <Select value={relationshipType} onValueChange={(value: any) => setRelationshipType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one-to-one">One to One</SelectItem>
                          <SelectItem value="one-to-many">One to Many</SelectItem>
                          <SelectItem value="many-to-many">Many to Many</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleCreateRelationship} className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Relationship
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Connect two fields in the diagram above to create a relationship
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Relationships</CardTitle>
              </CardHeader>
              <CardContent>
                {relationships.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No relationships defined yet</p>
                ) : (
                  <div className="space-y-2">
                    {relationships.map((rel) => (
                      <div key={rel.id} className="p-2 border rounded text-sm">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{rel.name}</div>
                          <Button variant="ghost" size="sm" onClick={() => removeRelationship(rel.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {rel.sourceField.path} → {rel.targetField.path}
                        </div>
                        <div className="text-xs text-blue-600">{rel.type}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
