"use client"

import { DataProvider } from "@/contexts/data-context"
import { RelationshipManager } from "@/components/relationship-manager"

export default function RelationshipsPage() {
  return (
    <DataProvider>
      <RelationshipManager />
    </DataProvider>
  )
}
