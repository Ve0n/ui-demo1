"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useData, type LoadedData, type ProcessedRelationship } from "@/contexts/data-context"
import { Upload, Play } from "lucide-react"

export function DataLoader() {
  const { schemas, relationships, addLoadedData } = useData()
  const [selectedSchema, setSelectedSchema] = useState("")
  const [uploadedData, setUploadedData] = useState<any[]>([])
  const [customScript, setCustomScript] = useState(`// Custom data loading script
// Return an array of data objects
async function loadData() {
  // Example: Load multiple files or fetch from API
  const data = [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" }
  ];
  
  return data;
}

// Execute the function
return await loadData();`)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)
        setUploadedData(Array.isArray(data) ? data : [data])
      } catch (error) {
        alert("Invalid JSON file format")
      }
    }
    reader.readAsText(file)
  }

  const executeCustomScript = async () => {
    try {
      // Create a function from the script
      const scriptFunction = new Function(customScript)
      const result = await scriptFunction()
      setUploadedData(Array.isArray(result) ? result : [result])
    } catch (error) {
      alert("Error executing script: " + (error as Error).message)
    }
  }

  const processRelationships = (data: any[], schemaId: string): ProcessedRelationship[] => {
    const processedRelationships: ProcessedRelationship[] = []

    // Find relationships involving this schema
    const relevantRelationships = relationships.filter(
      (rel) => rel.sourceField.schemaId === schemaId || rel.targetField.schemaId === schemaId,
    )

    relevantRelationships.forEach((rel) => {
      const matches: Array<{
        sourceRecord: any
        targetRecord: any
        confidence: number
      }> = []

      // Simple relationship matching logic
      data.forEach((record) => {
        const sourceValue = getNestedValue(record, rel.sourceField.path)
        const targetValue = getNestedValue(record, rel.targetField.path)

        if (sourceValue !== undefined && targetValue !== undefined) {
          matches.push({
            sourceRecord: { [rel.sourceField.path]: sourceValue },
            targetRecord: { [rel.targetField.path]: targetValue },
            confidence: 1.0, // Simple exact match confidence
          })
        }
      })

      if (matches.length > 0) {
        processedRelationships.push({
          relationshipId: rel.id,
          matches,
        })
      }
    })

    return processedRelationships
  }

  const getNestedValue = (obj: any, path: string): any => {
    return path.split(".").reduce((current, key) => current?.[key], obj)
  }

  const handleLoadData = () => {
    if (!selectedSchema || uploadedData.length === 0) return

    const processedRelationships = processRelationships(uploadedData, selectedSchema)

    const loadedData: LoadedData = {
      schemaId: selectedSchema,
      data: uploadedData,
      relationships: processedRelationships,
    }

    addLoadedData(loadedData)
    alert(`Data loaded successfully! Found ${processedRelationships.length} relationship matches.`)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Loading</h1>
        <p className="text-muted-foreground">Upload data files or use custom scripts to load data for your schemas</p>
      </div>

      {schemas.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No schemas available. Please upload schemas first to load data.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Data Loading Methods</CardTitle>
                <CardDescription>Choose how to load your data</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">File Upload</TabsTrigger>
                    <TabsTrigger value="script">Custom Script</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="space-y-4">
                    <div>
                      <Label htmlFor="data-file">Upload JSON Data File</Label>
                      <Input id="data-file" type="file" accept=".json" onChange={handleFileUpload} />
                    </div>

                    {uploadedData.length > 0 && (
                      <div>
                        <Label>Data Preview</Label>
                        <div className="mt-2 p-3 bg-muted rounded text-sm">
                          <p className="font-medium mb-2">{uploadedData.length} records loaded</p>
                          <pre className="text-xs overflow-auto max-h-40">
                            {JSON.stringify(uploadedData.slice(0, 3), null, 2)}
                            {uploadedData.length > 3 && "\n... and more"}
                          </pre>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="script" className="space-y-4">
                    <div>
                      <Label htmlFor="custom-script">Custom JavaScript Logic</Label>
                      <Textarea
                        id="custom-script"
                        value={customScript}
                        onChange={(e) => setCustomScript(e.target.value)}
                        rows={15}
                        className="font-mono text-sm"
                      />
                    </div>

                    <Button onClick={executeCustomScript} className="w-full">
                      <Play className="mr-2 h-4 w-4" />
                      Execute Script
                    </Button>

                    {uploadedData.length > 0 && (
                      <div>
                        <Label>Script Output</Label>
                        <div className="mt-2 p-3 bg-muted rounded text-sm">
                          <p className="font-medium mb-2">{uploadedData.length} records generated</p>
                          <pre className="text-xs overflow-auto max-h-40">
                            {JSON.stringify(uploadedData.slice(0, 3), null, 2)}
                            {uploadedData.length > 3 && "\n... and more"}
                          </pre>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Schema Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Target Schema</Label>
                  <Select value={selectedSchema} onValueChange={setSelectedSchema}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a schema" />
                    </SelectTrigger>
                    <SelectContent>
                      {schemas.map((schema) => (
                        <SelectItem key={schema.id} value={schema.id}>
                          {schema.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedSchema && (
                  <div>
                    <Label>Schema Fields</Label>
                    <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                      {schemas
                        .find((s) => s.id === selectedSchema)
                        ?.fields.map((field, index) => (
                          <div key={index} className="text-xs p-2 bg-muted rounded">
                            <span className="font-mono">{field.path}</span>
                            <span className="text-muted-foreground ml-2">({field.type})</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleLoadData}
                  className="w-full"
                  disabled={!selectedSchema || uploadedData.length === 0}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Load Data & Process Relationships
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relationship Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">When data is loaded, the system will automatically:</p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Match field values based on defined relationships</li>
                  <li>• Calculate relationship confidence scores</li>
                  <li>• Extract connected data patterns</li>
                  <li>• Prepare data for visualization</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
