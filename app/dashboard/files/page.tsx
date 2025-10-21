"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Upload, File, MoreVertical, Trash2, Download, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface FileItem {
  id: string
  name: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  created_at: string
}

export default function FilesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("uploaded_by", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setFiles(data || [])
    } catch (error) {
      console.error("Failed to load files:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown"
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from("files").upload(fileName, file)

      if (uploadError) throw uploadError

      // Save metadata to database
      const { error: dbError } = await supabase.from("files").insert({
        name: file.name,
        file_path: fileName,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: user.id,
      })

      if (dbError) throw dbError

      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully.`,
      })

      setUploadDialogOpen(false)
      loadFiles()
    } catch (error) {
      console.error("Upload failed:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (file: FileItem) => {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase.storage.from("files").download(file.file_path)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement("a")
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Download started",
        description: `Downloading ${file.name}`,
      })
    } catch (error) {
      console.error("Download failed:", error)
      toast({
        title: "Download failed",
        description: "Failed to download file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (file: FileItem) => {
    if (!confirm(`Are you sure you want to delete ${file.name}?`)) return

    try {
      const supabase = getSupabaseBrowserClient()

      // Delete from storage
      const { error: storageError } = await supabase.storage.from("files").remove([file.file_path])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase.from("files").delete().eq("id", file.id)

      if (dbError) throw dbError

      toast({
        title: "File deleted",
        description: `${file.name} has been deleted.`,
      })

      loadFiles()
    } catch (error) {
      console.error("Delete failed:", error)
      toast({
        title: "Delete failed",
        description: "Failed to delete file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">File Storage</h1>
          <p className="text-muted-foreground mt-1">Manage your files and documents</p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload File</DialogTitle>
              <DialogDescription>Choose a file to upload to your storage</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">File</Label>
                <Input id="file" type="file" onChange={handleFileUpload} disabled={uploading} className="mt-2" />
              </div>
              {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <File className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">{files.length === 0 ? "No files yet" : "No files found"}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {files.length === 0 ? "Upload your first file to get started" : "Try a different search term"}
            </p>
            {files.length === 0 && (
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredFiles.map((file) => (
            <Card key={file.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <File className="h-5 w-5 text-primary" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownload(file)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(file)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="font-semibold truncate mb-1">{file.name}</h3>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</p>
                <p className="text-xs text-muted-foreground mt-1">{format(new Date(file.created_at), "MMM d, yyyy")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
