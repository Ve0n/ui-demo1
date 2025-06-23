"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

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

// LocalStorage keys
const STORAGE_KEYS = {
  SCHEMAS: "data-dashboard-schemas",
  RELATIONSHIPS: "data-dashboard-relationships",
  LOADED_DATA: "data-dashboard-loaded-data",
}

// Helper functions for localStorage operations
const loadFromStorage = (key: string, defaultValue: any): any => {
  if (typeof window === "undefined") return defaultValue

  try {
    const stored = localStorage.getItem(key)
    if (!stored) return defaultValue

    const parsed = JSON.parse(stored)

    // Handle Date objects in schemas
    if (key === STORAGE_KEYS.SCHEMAS && Array.isArray(parsed)) {
      return parsed.map((schema) => ({
        ...schema,
        createdAt: new Date(schema.createdAt),
      }))
    }

    return parsed
  } catch (error) {
    console.error(`Error loading from localStorage key ${key}:`, error)
    return defaultValue
  }
}

const saveToStorage = (key: string, data: any): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Error saving to localStorage key ${key}:`, error)
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [schemas, setSchemas] = useState<Schema[]>([])
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [loadedData, setLoadedData] = useState<LoadedData[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const loadedSchemas = loadFromStorage(STORAGE_KEYS.SCHEMAS, [])
    const loadedRelationships = loadFromStorage(STORAGE_KEYS.RELATIONSHIPS, [])
    const loadedDatasets = loadFromStorage(STORAGE_KEYS.LOADED_DATA, [])

    setSchemas(loadedSchemas)
    setRelationships(loadedRelationships)
    setLoadedData(loadedDatasets)
    setIsLoaded(true)
  }, [])

  // Save schemas to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(STORAGE_KEYS.SCHEMAS, schemas)
    }
  }, [schemas, isLoaded])

  // Save relationships to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(STORAGE_KEYS.RELATIONSHIPS, relationships)
    }
  }, [relationships, isLoaded])

  // Save loaded data to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(STORAGE_KEYS.LOADED_DATA, loadedData)
    }
  }, [loadedData, isLoaded])

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
    // Also remove related relationships and loaded data
    setRelationships((prev) => prev.filter((r) => r.sourceField.schemaId !== id && r.targetField.schemaId !== id))
    setLoadedData((prev) => prev.filter((d) => d.schemaId !== id))
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

  // Don't render until data is loaded from localStorage
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </div>
    )
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
