"use client"

import { format } from "date-fns"
import { FileText, Lock, Globe, MoreVertical, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { Note } from "@/lib/types"

interface NoteListProps {
  notes: Note[]
  selectedNote: Note | null
  onSelect: (note: Note) => void
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
}

export function NoteList({ notes, selectedNote, onSelect, onEdit, onDelete }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">No notes yet</h3>
        <p className="text-sm text-muted-foreground">Create your first note to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 p-4">
      {notes.map((note) => (
        <div
          key={note.id}
          className={cn(
            "border rounded-lg p-4 cursor-pointer transition-colors hover:bg-accent/50",
            selectedNote?.id === note.id && "bg-accent border-primary",
          )}
          onClick={() => onSelect(note)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">{note.title}</h3>
                {note.is_public ? (
                  <Globe className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                ) : (
                  <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                )}
              </div>
              {note.content && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{note.content}</p>}
              <p className="text-xs text-muted-foreground">
                {format(new Date(note.updated_at), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(note)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(note.id)
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  )
}
