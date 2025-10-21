"use client"

import { useState, useEffect } from "react"
import { Plus, FileText, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NoteList } from "@/components/notes/note-list"
import { NoteEditor } from "@/components/notes/note-editor"
import { WhiteboardCanvas } from "@/components/notes/whiteboard-canvas"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Note } from "@/lib/types"
import { useRouter } from "next/navigation"

export default function NotesPage() {
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [whiteboards, setWhiteboards] = useState<any[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [selectedWhiteboard, setSelectedWhiteboard] = useState<any | null>(null)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("notes")

  useEffect(() => {
    loadNotes()
    loadWhiteboards()
  }, [])

  const loadNotes = async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .or(`created_by.eq.${user.id},is_public.eq.true`)
        .order("updated_at", { ascending: false })

      if (error) throw error

      setNotes(data || [])
    } catch (error) {
      console.error("Failed to load notes:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadWhiteboards = async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from("whiteboards")
        .select("*")
        .or(`created_by.eq.${user.id},is_public.eq.true`)
        .order("updated_at", { ascending: false })

      if (error) throw error

      setWhiteboards(data || [])
      if (data && data.length > 0) {
        setSelectedWhiteboard(data[0])
      }
    } catch (error) {
      console.error("Failed to load whiteboards:", error)
    }
  }

  const handleCreateNote = () => {
    setIsCreating(true)
    setEditingNote(null)
    setSelectedNote(null)
  }

  const handleSaveNote = async (noteData: Partial<Note>) => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    if (editingNote) {
      const { error } = await supabase.from("notes").update(noteData).eq("id", editingNote.id)

      if (error) throw error
    } else {
      const { error } = await supabase.from("notes").insert({
        ...noteData,
        created_by: user.id,
      })

      if (error) throw error
    }

    await loadNotes()
    setIsCreating(false)
    setEditingNote(null)
    router.refresh()
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setIsCreating(true)
  }

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return

    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from("notes").delete().eq("id", id)

    if (error) {
      console.error("Failed to delete note:", error)
      return
    }

    await loadNotes()
    if (selectedNote?.id === id) {
      setSelectedNote(null)
    }
    router.refresh()
  }

  const handleSaveWhiteboard = async (canvasData: any) => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    if (selectedWhiteboard) {
      await supabase.from("whiteboards").update({ canvas_data: canvasData }).eq("id", selectedWhiteboard.id)
    } else {
      const { data } = await supabase
        .from("whiteboards")
        .insert({
          title: "New Whiteboard",
          canvas_data: canvasData,
          created_by: user.id,
        })
        .select()
        .single()

      if (data) {
        setSelectedWhiteboard(data)
        await loadWhiteboards()
      }
    }
  }

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
    <div className="h-full flex flex-col">
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notes & Whiteboard</h1>
            <p className="text-muted-foreground mt-1">Capture ideas and collaborate visually</p>
          </div>
          {activeTab === "notes" && (
            <Button onClick={handleCreateNote}>
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-6 mt-4 w-fit">
          <TabsTrigger value="notes" className="gap-2">
            <FileText className="h-4 w-4" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="whiteboard" className="gap-2">
            <Palette className="h-4 w-4" />
            Whiteboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="flex-1 mt-0">
          <div className="grid lg:grid-cols-2 h-full">
            <div className="border-r overflow-y-auto">
              <NoteList
                notes={notes}
                selectedNote={selectedNote}
                onSelect={setSelectedNote}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
              />
            </div>

            <div className="bg-card">
              {isCreating ? (
                <NoteEditor
                  note={editingNote}
                  onSave={handleSaveNote}
                  onCancel={() => {
                    setIsCreating(false)
                    setEditingNote(null)
                  }}
                />
              ) : selectedNote ? (
                <div className="p-6 overflow-y-auto h-full">
                  <h2 className="text-2xl font-bold mb-4">{selectedNote.title}</h2>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed">{selectedNote.content}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center p-8">
                  <div>
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No note selected</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select a note from the list or create a new one
                    </p>
                    <Button onClick={handleCreateNote}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Note
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="whiteboard" className="flex-1 mt-0">
          <WhiteboardCanvas canvasData={selectedWhiteboard?.canvas_data} onSave={handleSaveWhiteboard} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
