"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { EmptyState } from "@largence/components/empty-state"
import { Button } from "@largence/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@largence/components/ui/card"
import { Skeleton } from "@largence/components/ui/skeleton"
import { FileText, MoreVertical, Download, Edit, Trash2, Sparkles } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@largence/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

interface Document {
  id: string
  title: string
  content: string
  status: "DRAFT" | "FINAL" | "ARCHIVED"
  documentType: string
  jurisdiction: string
  createdAt: string
  updatedAt: string
}

export default function DocumentsPage() {
  const { userId } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchDocuments()
    }
  }, [userId])

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents")
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "FINAL":
        return "text-green-600 bg-green-50 border-green-200"
      case "ARCHIVED":
        return "text-gray-600 bg-gray-50 border-gray-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="mb-2">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="mb-2">
          <h1 className="text-2xl font-semibold font-display">Documents</h1>
          <p className="text-sm text-muted-foreground">
            Manage and organize your legal documents
          </p>
        </div>

        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Get started by generating your first AI-powered legal document"
          primaryAction={{
            label: "Generate Document",
            onClick: () => router.push("/create"),
          }}
          secondaryAction={null}
          showTemplates={false}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-display">Documents</h1>
          <p className="text-sm text-muted-foreground">
            Manage and organize your legal documents
          </p>
        </div>
        <Button onClick={() => router.push("/create")}>
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Document
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card
              key={doc.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/documents/${doc.id}`)}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex-1">
                  <CardTitle className="text-base font-medium line-clamp-1">
                    {doc.title}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {doc.documentType} • {doc.jurisdiction}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/documents/${doc.id}`)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: Implement download
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: Implement delete
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div
                  className={`inline-flex items-center rounded-sm border px-2 py-1 text-xs font-medium mb-3 ${getStatusColor(
                    doc.status
                  )}`}
                >
                  {doc.status}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {doc.content.replace(/<[^>]*>/g, "").substring(0, 120)}...
                </p>
                <p className="text-xs text-muted-foreground">
                  Updated {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
    </div>
  )
}

