"use client"

import { DataProvider } from "@/contexts/data-context"
import { SchemaManagement } from "@/components/schema-management"

export default function SchemasPage() {
  return (
    <DataProvider>
      <SchemaManagement />
    </DataProvider>
  )
}
