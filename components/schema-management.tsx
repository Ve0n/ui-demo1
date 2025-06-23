"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useData, type Schema, type SchemaField } from "@/contexts/data-context"
import { Upload, FileJson, Trash2, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function SchemaManagement() {
  const { schemas, addSchema, removeSchema } = useData()
  const [schemaName, setSchemaName] = useState("")
  const [schemaContent, setSchemaContent] = useState("")
  const [selectedSchema, setSelectedSchema] = useState<Schema | null>(null)

  const extractFields = (obj: any, path = "", schemaId: string): SchemaField[] => {
    const fields: SchemaField[] = []

    if (typeof obj === "object" && obj !== null) {
      Object.keys(obj).forEach((key) => {
        const currentPath = path ? `${path}.${key}` : key
        const value = obj[key]

        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          fields.push({
            name: key,
            type: "object",
            path: currentPath,
            schemaId,
          })
          fields.push(...extractFields(value, currentPath, schemaId))
        } else {
          fields.push({
            name: key,
            type: Array.isArray(value) ? "array" : typeof value,
            path: currentPath,
            schemaId,
          })
        }
      })
    }

    return fields
  }

  const handleSchemaUpload = () => {
    if (!schemaName.trim() || !schemaContent.trim()) return

    try {
      const parsedContent = JSON.parse(schemaContent)
      const tempId = Date.now().toString()
      const fields = extractFields(parsedContent, "", tempId)

      addSchema({
        name: schemaName,
        content: parsedContent,
        fields,
      })

      setSchemaName("")
      setSchemaContent("")
    } catch (error) {
      alert("Invalid JSON format. Please check your schema.")
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setSchemaContent(content)
      setSchemaName(file.name.replace(".json", ""))
    }
    reader.readAsText(file)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Schema Management</h1>
        <p className="text-muted-foreground">Upload and manage JSON schemas for your datasets</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload New Schema</CardTitle>
            <CardDescription>Add a JSON schema to define your data structure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="schema-name">Schema Name</Label>
              <Input
                id="schema-name"
                value={schemaName}
                onChange={(e) => setSchemaName(e.target.value)}
                placeholder="Enter schema name"
              />
            </div>

            <div>
              <Label htmlFor="file-upload">Upload JSON File</Label>
              <Input id="file-upload" type="file" accept=".json" onChange={handleFileUpload} />
            </div>

            <div>
              <Label htmlFor="schema-content">JSON Schema Content</Label>
              <Textarea
                id="schema-content"
                value={schemaContent}
                onChange={(e) => setSchemaContent(e.target.value)}
                placeholder="Paste your JSON schema here..."
                rows={10}
              />
            </div>

            <Button onClick={handleSchemaUpload} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Upload Schema
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Schemas</CardTitle>
            <CardDescription>Manage your uploaded schemas</CardDescription>
          </CardHeader>
          <CardContent>
            {schemas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No schemas uploaded yet. Upload your first schema to get started.
              </p>
            ) : (
              <div className="space-y-2">
                {schemas.map((schema) => (
                  <div key={schema.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileJson className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{schema.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {schema.fields.length} fields • {schema.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedSchema(schema)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{schema.name}</DialogTitle>
                            <DialogDescription>Schema fields and structure</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Fields ({schema.fields.length})</h4>
                              <div className="space-y-1 max-h-60 overflow-y-auto">
                                {schema.fields.map((field, index) => (
                                  <div key={index} className="flex justify-between text-sm p-2 bg-muted rounded">
                                    <span className="font-mono">{field.path}</span>
                                    <span className="text-muted-foreground">{field.type}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Raw Schema</h4>
                              <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                                {JSON.stringify(schema.content, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm" onClick={() => removeSchema(schema.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
