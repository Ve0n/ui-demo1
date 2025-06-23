"use client"

import { DataProvider } from "@/contexts/data-context"
import { DataLoader } from "@/components/data-loader"

export default function DataLoadingPage() {
  return (
    <DataProvider>
      <DataLoader />
    </DataProvider>
  )
}
