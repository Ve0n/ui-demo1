"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/contexts/data-context"
import { Database, GitBranch, Eye, BarChart3 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function DataVisualization() {
  const { schemas, relationships, loadedData } = useData()
  const [selectedDataset, setSelectedDataset] = useState("")

  const selectedData = loadedData.find((data) => data.schemaId === selectedDataset)
  const selectedSchema = schemas.find((schema) => schema.id === selectedDataset)

  const getRelationshipStats = () => {
    if (!selectedData) return { total: 0, active: 0, matches: 0 }

    const total = relationships.filter(
      (rel) => rel.sourceField.schemaId === selectedDataset || rel.targetField.schemaId === selectedDataset,
    ).length

    const active = selectedData.relationships.length
    const matches = selectedData.relationships.reduce((acc, rel) => acc + rel.matches.length, 0)

    return { total, active, matches }
  }

  const stats = getRelationshipStats()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Visualization</h1>
        <p className="text-muted-foreground">Explore loaded data and relationship connections</p>
      </div>

      {loadedData.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Database className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No data loaded yet. Please load data files first to visualize relationships.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dataset Selection</CardTitle>
              <CardDescription>Choose a dataset to explore its relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a dataset to visualize" />
                </SelectTrigger>
                <SelectContent>
                  {loadedData.map((data) => {
                    const schema = schemas.find((s) => s.id === data.schemaId)
                    return (
                      <SelectItem key={data.schemaId} value={data.schemaId}>
                        {schema?.name || "Unknown Schema"} ({data.data.length} records)
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedData && selectedSchema && (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedData.data.length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Defined Relationships</CardTitle>
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Relationships</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.active}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Relationship Matches</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.matches}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Sample</CardTitle>
                    <CardDescription>First few records from {selectedSchema.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedData.data.slice(0, 5).map((record, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="text-sm font-medium mb-2">Record {index + 1}</div>
                          <div className="grid gap-2">
                            {Object.entries(record)
                              .slice(0, 4)
                              .map(([key, value]) => (
                                <div key={key} className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">{key}:</span>
                                  <span className="font-mono">{JSON.stringify(value)}</span>
                                </div>
                              ))}
                            {Object.keys(record).length > 4 && (
                              <div className="text-xs text-muted-foreground">
                                ... and {Object.keys(record).length - 4} more fields
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {selectedData.data.length > 5 && (
                        <div className="text-sm text-muted-foreground text-center">
                          ... and {selectedData.data.length - 5} more records
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Relationship Analysis</CardTitle>
                    <CardDescription>Discovered relationships in your data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedData.relationships.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No relationship matches found in the loaded data.</p>
                    ) : (
                      <div className="space-y-4">
                        {selectedData.relationships.map((processedRel, index) => {
                          const relationship = relationships.find((r) => r.id === processedRel.relationshipId)
                          if (!relationship) return null

                          return (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium">{relationship.name}</div>
                                <Badge variant="secondary">{processedRel.matches.length} matches</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground mb-2">
                                {relationship.sourceField.path} → {relationship.targetField.path}
                              </div>
                              <div className="text-xs text-blue-600 mb-2">{relationship.type}</div>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="mr-2 h-3 w-3" />
                                    View Matches
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>{relationship.name} - Data Matches</DialogTitle>
                                    <DialogDescription>Relationship matches found in the data</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {processedRel.matches.slice(0, 10).map((match, matchIndex) => (
                                      <div key={matchIndex} className="p-2 bg-muted rounded text-sm">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <div className="font-medium text-xs text-muted-foreground">Source</div>
                                            <pre className="text-xs">{JSON.stringify(match.sourceRecord, null, 2)}</pre>
                                          </div>
                                          <div>
                                            <div className="font-medium text-xs text-muted-foreground">Target</div>
                                            <pre className="text-xs">{JSON.stringify(match.targetRecord, null, 2)}</pre>
                                          </div>
                                        </div>
                                        <div className="mt-2 text-xs text-green-600">
                                          Confidence: {(match.confidence * 100).toFixed(1)}%
                                        </div>
                                      </div>
                                    ))}
                                    {processedRel.matches.length > 10 && (
                                      <div className="text-xs text-muted-foreground text-center">
                                        ... and {processedRel.matches.length - 10} more matches
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Schema Structure</CardTitle>
                  <CardDescription>Fields and types in {selectedSchema.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {selectedSchema.fields.map((field, index) => (
                      <div key={index} className="p-2 border rounded text-sm">
                        <div className="font-mono font-medium">{field.path}</div>
                        <div className="text-xs text-muted-foreground">{field.type}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  )
}
