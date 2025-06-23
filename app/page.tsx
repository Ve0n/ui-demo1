"use client"

import { DataProvider } from "@/contexts/data-context"
import { DashboardHome } from "@/components/dashboard-home"

export default function Home() {
  return (
    <DataProvider>
      <DashboardHome />
    </DataProvider>
  )
}
