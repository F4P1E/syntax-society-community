"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save, X } from "lucide-react"
import type { Note } from "@/lib/types"

interface NoteEditorProps {
  note: Note | null
  onSave: (note: Partial<Note>) => Promise<void>
  onCancel: () => void
}

export function NoteEditor({ note, onSave, onCancel }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || "")
  const [content, setContent] = useState(note?.content || "")
  const [isPublic, setIsPublic] = useState(note?.is_public || false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setTitle(note?.title || "")
    setContent(note?.content || "")
    setIsPublic(note?.is_public || false)
  }, [note])

  const handleSave = async () => {
    if (!title.trim()) return

    setSaving(true)
    try {
      await onSave({
        title: title.trim(),
        content: content.trim(),
        is_public: isPublic,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 flex items-center justify-between gap-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="text-lg font-semibold border-0 focus-visible:ring-0 px-0"
        />
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
          <Button onClick={handleSave} disabled={saving || !title.trim()}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your note..."
          className="min-h-full border-0 focus-visible:ring-0 resize-none text-base leading-relaxed"
        />
      </div>

      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="public-toggle" className="text-sm text-muted-foreground">
            Make this note public
          </Label>
          <Switch id="public-toggle" checked={isPublic} onCheckedChange={setIsPublic} />
        </div>
      </div>
    </div>
  )
}
