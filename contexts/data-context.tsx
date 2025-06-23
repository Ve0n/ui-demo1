"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface Schema {
  id: string
  name: string
  content: any
  fields: SchemaField[]
  createdAt: Date
}

export interface SchemaField {
  name: string
  type: string
  path: string
  schemaId: string
}

export interface Relationship {
  id: string
  name: string
  sourceField: SchemaField
  targetField: SchemaField
  type: "one-to-one" | "one-to-many" | "many-to-many"
  description?: string
}

export interface LoadedData {
  schemaId: string
  data: any[]
  relationships: ProcessedRelationship[]
}

export interface ProcessedRelationship {
  relationshipId: string
  matches: Array<{
    sourceRecord: any
    targetRecord: any
    confidence: number
  }>
}

interface DataContextType {
  schemas: Schema[]
  relationships: Relationship[]
  loadedData: LoadedData[]
  addSchema: (schema: Omit<Schema, "id" | "createdAt">) => void
  removeSchema: (id: string) => void
  addRelationship: (relationship: Omit<Relationship, "id">) => void
  removeRelationship: (id: string) => void
  addLoadedData: (data: LoadedData) => void
  clearLoadedData: () => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [schemas, setSchemas] = useState<Schema[]>([])
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [loadedData, setLoadedData] = useState<LoadedData[]>([])

  const addSchema = (schema: Omit<Schema, "id" | "createdAt">) => {
    const newSchema: Schema = {
      ...schema,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setSchemas((prev) => [...prev, newSchema])
  }

  const removeSchema = (id: string) => {
    setSchemas((prev) => prev.filter((s) => s.id !== id))
    setRelationships((prev) => prev.filter((r) => r.sourceField.schemaId !== id && r.targetField.schemaId !== id))
  }

  const addRelationship = (relationship: Omit<Relationship, "id">) => {
    const newRelationship: Relationship = {
      ...relationship,
      id: Date.now().toString(),
    }
    setRelationships((prev) => [...prev, newRelationship])
  }

  const removeRelationship = (id: string) => {
    setRelationships((prev) => prev.filter((r) => r.id !== id))
  }

  const addLoadedData = (data: LoadedData) => {
    setLoadedData((prev) => {
      const existing = prev.findIndex((d) => d.schemaId === data.schemaId)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = data
        return updated
      }
      return [...prev, data]
    })
  }

  const clearLoadedData = () => {
    setLoadedData([])
  }

  return (
    <DataContext.Provider
      value={{
        schemas,
        relationships,
        loadedData,
        addSchema,
        removeSchema,
        addRelationship,
        removeRelationship,
        addLoadedData,
        clearLoadedData,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
