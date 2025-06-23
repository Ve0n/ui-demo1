"use client"

import { DataProvider } from "@/contexts/data-context"
import { DataVisualization } from "@/components/data-visualization"

export default function VisualizationPage() {
  return (
    <DataProvider>
      <DataVisualization />
    </DataProvider>
  )
}
