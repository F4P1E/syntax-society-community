"use client"

import { format } from "date-fns"
import { Workflow, MoreVertical, Trash2, Edit, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Flow {
  id: string
  title: string
  description: string | null
  created_at: string
  updated_at: string
}

interface FlowListProps {
  flows: Flow[]
  onSelect: (flow: Flow) => void
  onEdit: (flow: Flow) => void
  onDelete: (id: string) => void
  onDuplicate: (flow: Flow) => void
}

export function FlowList({ flows, onSelect, onEdit, onDelete, onDuplicate }: FlowListProps) {
  if (flows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Workflow className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">No flows yet</h3>
        <p className="text-sm text-muted-foreground">Create your first workflow to get started</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-6">
      {flows.map((flow) => (
        <Card key={flow.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelect(flow)}>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="truncate">{flow.title}</CardTitle>
                {flow.description && (
                  <CardDescription className="line-clamp-2 mt-1">{flow.description}</CardDescription>
                )}
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
                      onEdit(flow)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onDuplicate(flow)
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(flow.id)
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Workflow className="h-3 w-3" />
              <span>Updated {format(new Date(flow.updated_at), "MMM d, yyyy")}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
