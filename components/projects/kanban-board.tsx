"use client"

import type React from "react"

import { useState } from "react"
import { Plus, MoreVertical, Trash2, Edit, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { Task } from "@/lib/types"

interface KanbanBoardProps {
  tasks: Task[]
  onCreateTask: (status: Task["status"]) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (id: string) => void
  onUpdateTaskStatus: (taskId: string, newStatus: Task["status"]) => void
}

const columns: { id: Task["status"]; title: string; color: string }[] = [
  { id: "todo", title: "To Do", color: "bg-slate-100 dark:bg-slate-800" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-100 dark:bg-blue-900/30" },
  { id: "done", title: "Done", color: "bg-green-100 dark:bg-green-900/30" },
]

export function KanbanBoard({ tasks, onCreateTask, onEditTask, onDeleteTask, onUpdateTaskStatus }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null)

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (status: Task["status"]) => {
    if (draggedTask) {
      onUpdateTaskStatus(draggedTask, status)
      setDraggedTask(null)
    }
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
      {columns.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.id)

        return (
          <div
            key={column.id}
            className={cn("rounded-lg p-4 flex flex-col", column.color)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{column.title}</h3>
                <Badge variant="secondary" className="rounded-full">
                  {columnTasks.length}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onCreateTask(column.id)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {columnTasks.map((task) => (
                <Card
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                  className="cursor-move hover:shadow-md transition-shadow"
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-medium leading-tight">{task.title}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditTask(task)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDeleteTask(task.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-2">
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={cn("text-xs", getPriorityColor(task.priority))}>
                        {task.priority}
                      </Badge>

                      {task.due_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(task.due_date), "MMM d")}</span>
                        </div>
                      )}

                      {task.assigned_to && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {columnTasks.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">No tasks yet</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
