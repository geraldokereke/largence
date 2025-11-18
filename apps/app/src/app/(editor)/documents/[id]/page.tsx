"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@largence/components/ui/button"
import { Input } from "@largence/components/ui/input"
import { Spinner } from "@largence/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@largence/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@largence/components/ui/dropdown-menu"
import { 
  ArrowLeft, 
  Download, 
  Save, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  List,
  ListOrdered,
  Undo,
  Redo,
  FileText,
  FileDown,
  PenTool,
  Strikethrough,
  Subscript,
  Superscript,
  Link,
  Image,
  Palette,
  Type,
  Indent,
  Outdent
} from "lucide-react"
import { Separator } from "@largence/components/ui/separator"

export default function DocumentEditorPreviewPage() {
  const router = useRouter()
  const params = useParams()
  const editorRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [title, setTitle] = useState("")
  const [fontSize, setFontSize] = useState("16")
  const [fontFamily, setFontFamily] = useState("Arial")
  const [content, setContent] = useState("")
  const [status, setStatus] = useState<"DRAFT" | "FINAL" | "ARCHIVED">("DRAFT")
  const [document, setDocument] = useState<any>(null)

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setDocument(data)
          setTitle(data.title)
          setContent(data.content)
          setStatus(data.status)
        } else {
          toast.error("Failed to load document", {
            description: "The document could not be loaded. Please try again."
          })
          router.push("/documents")
        }
      } catch (error) {
        console.error("Error loading document:", error)
        toast.error("Error loading document", {
          description: "An unexpected error occurred while loading the document."
        })
        router.push("/documents")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchDocument()
    }
  }, [params.id, router])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/documents/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          status,
        }),
      })

      if (response.ok) {
        const updated = await response.json()
        setDocument(updated)
        toast.success("Document saved successfully", {
          description: "Your changes have been saved."
        })
      } else {
        toast.error("Failed to save document", {
          description: "Please check your connection and try again."
        })
      }
    } catch (error) {
      console.error("Error saving document:", error)
      toast.error("Error saving document", {
        description: "An unexpected error occurred while saving."
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const link = window.document.createElement("a")
    link.href = url
    link.download = `${title}.html`
    window.document.body.appendChild(link)
    link.click()
    window.document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    // Enable design mode for better contentEditable support
    if (editorRef.current) {
      document.execCommand('defaultParagraphSeparator', false, 'p')
    }
  }, [])

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      editorRef.current.focus()
      // Update content state after command
      setContent(editorRef.current.innerHTML)
    }
  }

  const handleFontSizeChange = (size: string) => {
    setFontSize(size)
    // Use font size 7 then wrap selection in span
    document.execCommand("fontSize", false, "7")
    const fontElements = editorRef.current?.querySelectorAll('font[size="7"]')
    fontElements?.forEach((element) => {
      const span = document.createElement("span")
      span.style.fontSize = `${size}px`
      span.innerHTML = element.innerHTML
      element.parentNode?.replaceChild(span, element)
    })
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML)
    }
  }

  const handleFontFamilyChange = (family: string) => {
    setFontFamily(family)
    execCommand("fontName", family)
  }

  const handleTextColor = (color: string) => {
    execCommand("foreColor", color)
  }

  const handleHighlight = (color: string) => {
    execCommand("hiliteColor", color)
  }

  const insertLink = () => {
    const url = prompt("Enter URL:")
    if (url) {
      execCommand("createLink", url)
    }
  }

  const insertImage = () => {
    const url = prompt("Enter image URL:")
    if (url) {
      execCommand("insertImage", url)
    }
  }

  const handleExportHTML = () => {
    const blob = new Blob([content], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const link = window.document.createElement("a")
    link.href = url
    link.download = `${title}.html`
    window.document.body.appendChild(link)
    link.click()
    window.document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      // Create a printable version
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
                h1 { font-size: 24px; margin-bottom: 20px; }
                h2 { font-size: 20px; margin-top: 30px; margin-bottom: 15px; }
                p { margin-bottom: 15px; }
                hr { margin: 30px 0; border: none; border-top: 1px solid #ccc; }
              </style>
            </head>
            <body>
              ${content}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    } finally {
      setExporting(false)
    }
  }

  const handleExportDOCX = async () => {
    setExporting(true)
    try {
      // For now, download as HTML with .doc extension (compatible with Word)
      const blob = new Blob([`
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>${title}</title></head>
        <body>${content}</body>
        </html>
      `], { type: "application/msword" })
      const url = URL.createObjectURL(blob)
      const link = window.document.createElement("a")
      link.href = url
      link.download = `${title}.doc`
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  const handleSendToDocuSign = async () => {
    setExporting(true)
    try {
      // This would integrate with DocuSign API
      toast.info("DocuSign Integration", {
        description: "DocuSign API integration is required. Contact your administrator to enable this feature."
      })
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner size="sm" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen w-screen">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4 gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/documents")}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="border-l h-6 shrink-0" />
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-medium text-lg border-0 focus-visible:ring-0 px-0 h-auto flex-1 min-w-0"
              placeholder="Document title"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Select 
              value={status} 
              onValueChange={(val: any) => {
                setStatus(val)
                // Auto-save when status changes
                setTimeout(() => handleSave(), 100)
              }}
            >
              <SelectTrigger className="w-32 h-9 rounded-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    Draft
                  </div>
                </SelectItem>
                <SelectItem value="FINAL">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Final
                  </div>
                </SelectItem>
                <SelectItem value="ARCHIVED">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gray-500" />
                    Archived
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={exporting} className="h-9 rounded-sm">
                  {exporting ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Exporting
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleExportHTML}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as HTML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportDOCX}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export as DOCX
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSendToDocuSign}>
                  <PenTool className="h-4 w-4 mr-2" />
                  Send to DocuSign
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={handleSave} disabled={saving} className="h-9 rounded-sm">
              {saving ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Saving
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 px-4 py-2 border-t bg-muted/30 overflow-x-auto">
          {/* Undo/Redo */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand("undo")}
            className="h-8 w-8 p-0 rounded-sm shrink-0"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand("redo")}
            className="h-8 w-8 p-0 rounded-sm shrink-0"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Font Family */}
          <Select value={fontFamily} onValueChange={handleFontFamilyChange}>
            <SelectTrigger className="w-36 h-8 rounded-sm text-xs shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Courier New">Courier New</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="Verdana">Verdana</SelectItem>
              <SelectItem value="Helvetica">Helvetica</SelectItem>
            </SelectContent>
          </Select>

          {/* Font Size */}
          <Select value={fontSize} onValueChange={handleFontSizeChange}>
            <SelectTrigger className="w-20 h-8 rounded-sm text-xs shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="14">14</SelectItem>
              <SelectItem value="16">16</SelectItem>
              <SelectItem value="18">18</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="24">24</SelectItem>
              <SelectItem value="28">28</SelectItem>
              <SelectItem value="32">32</SelectItem>
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Text Formatting */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand("bold")}
            className="h-8 w-8 p-0 rounded-sm shrink-0"
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand("italic")}
            className="h-8 w-8 p-0 rounded-sm shrink-0"
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand("underline")}
            className="h-8 w-8 p-0 rounded-sm shrink-0"
            title="Underline (Ctrl+U)"
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand("strikeThrough")}
            className="h-8 w-8 p-0 rounded-sm shrink-0"
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Text Color */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-sm shrink-0"
                title="Text Color"
              >
                <Type className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <div className="grid grid-cols-6 gap-1 p-2">
                {["#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc",
                  "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#0000ff",
                  "#9900ff", "#ff00ff", "#990000", "#cc6600", "#cccc00", "#009900",
                  "#009999", "#000099", "#660099", "#990099"].map((color) => (
                  <button
                    key={color}
                    className="h-6 w-6 rounded-sm border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => handleTextColor(color)}
                  />
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Highlight Color */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-sm shrink-0"
                title="Highlight"
              >
                <Palette className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <div className="grid grid-cols-6 gap-1 p-2">
                {["transparent", "#ffff00", "#00ff00", "#00ffff", "#ff00ff", "#ff0000",
                  "#0000ff", "#ffcc99", "#ffff99", "#ccffcc", "#ccffff", "#ffccff"].map((color) => (
                  <button
                    key={color}
                    className="h-6 w-6 rounded-sm border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => handleHighlight(color)}
                  />
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Alignment */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand("justifyLeft")}
            className="h-8 w-8 p-0 rounded-sm shrink-0"
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand("justifyCenter")}
            className="h-8 w-8 p-0 rounded-sm shrink-0"
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand("justifyRight")}
            className="h-8 w-8 p-0 rounded-sm shrink-0"
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand("justifyFull")}
            className="h-8 w-8 p-0 rounded-sm shrink-0"
            title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Lists and Indentation */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand("insertUnorderedList")}
            className="h-8 w-8 p-0 rounded-sm shrink-0"
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand("insertOrderedList")}
            className="h-8 w-8 p-0 rounded-sm shrink-0"
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand("indent")}
            className="h-8 w-8 p-0 rounded-sm shrink-0"
            title="Increase Indent"
          >
            <Indent className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand("outdent")}
            className="h-8 w-8 p-0 rounded-sm shrink-0"
            title="Decrease Indent"
          >
            <Outdent className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Insert Link/Image */}
          <Button
            variant="ghost"
            size="sm"
            onClick={insertLink}
            className="h-8 w-8 p-0 rounded-sm shrink-0"
            title="Insert Link"
          >
            <Link className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={insertImage}
            className="h-8 w-8 p-0 rounded-sm shrink-0"
            title="Insert Image"
          >
            <Image className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Heading Styles */}
          <Select onValueChange={(value) => execCommand("formatBlock", value)}>
            <SelectTrigger className="w-32 h-8 rounded-sm text-xs shrink-0">
              <SelectValue placeholder="Normal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="p">Normal</SelectItem>
              <SelectItem value="h1">Heading 1</SelectItem>
              <SelectItem value="h2">Heading 2</SelectItem>
              <SelectItem value="h3">Heading 3</SelectItem>
              <SelectItem value="h4">Heading 4</SelectItem>
              <SelectItem value="h5">Heading 5</SelectItem>
              <SelectItem value="h6">Heading 6</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto p-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          {/* Document Info Bar */}
          <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Document ID: {params.id ? String(params.id).slice(0, 8) : 'N/A'}</span>
              <span>•</span>
              <span>Created: {document?.createdAt ? new Date(document.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                status === "DRAFT" ? "bg-yellow-500" :
                status === "FINAL" ? "bg-green-500" :
                "bg-gray-500"
              }`} />
              <span className="font-medium">{status}</span>
            </div>
          </div>

          {/* HTML Preview/Editor */}
          <div
            ref={editorRef}
            className="prose prose-sm max-w-none border rounded-sm p-12 bg-white shadow-sm min-h-[600px] focus:outline-none focus:ring-2 focus:ring-primary/20"
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => setContent(e.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  )
}
