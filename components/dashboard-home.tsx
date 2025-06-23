"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useData } from "@/contexts/data-context"
import { FileJson, GitBranch, Database, Upload } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function DashboardHome() {
  const { schemas, relationships, loadedData } = useData()

  const stats = [
    {
      title: "Schemas",
      value: schemas.length,
      description: "JSON schemas uploaded",
      icon: FileJson,
      href: "/schemas",
    },
    {
      title: "Relationships",
      value: relationships.length,
      description: "Field relationships defined",
      icon: GitBranch,
      href: "/relationships",
    },
    {
      title: "Data Sources",
      value: loadedData.length,
      description: "Data files loaded",
      icon: Upload,
      href: "/data-loading",
    },
    {
      title: "Active Connections",
      value: loadedData.reduce((acc, data) => acc + data.relationships.length, 0),
      description: "Relationship matches found",
      icon: Database,
      href: "/visualization",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Management Dashboard</h1>
        <p className="text-muted-foreground">
          Manage JSON schemas, define relationships, and visualize data connections
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <Link href={stat.href}>
                <Button variant="outline" size="sm" className="mt-2">
                  View Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/schemas">
              <Button className="w-full justify-start">
                <FileJson className="mr-2 h-4 w-4" />
                Upload New Schema
              </Button>
            </Link>
            <Link href="/relationships">
              <Button variant="outline" className="w-full justify-start">
                <GitBranch className="mr-2 h-4 w-4" />
                Define Relationships
              </Button>
            </Link>
            <Link href="/data-loading">
              <Button variant="outline" className="w-full justify-start">
                <Upload className="mr-2 h-4 w-4" />
                Load Data Files
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest schemas and relationships</CardDescription>
          </CardHeader>
          <CardContent>
            {schemas.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No schemas uploaded yet. Start by uploading your first JSON schema.
              </p>
            ) : (
              <div className="space-y-2">
                {schemas.slice(-3).map((schema) => (
                  <div key={schema.id} className="flex items-center space-x-2">
                    <FileJson className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{schema.name}</span>
                    <span className="text-xs text-muted-foreground">{schema.createdAt.toLocaleDateString()}</span>
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
