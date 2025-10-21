"use client"

import { useState, useEffect } from "react"
import { Plus, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProjectList } from "@/components/projects/project-list"
import { KanbanBoard } from "@/components/projects/kanban-board"
import { TaskDialog } from "@/components/projects/task-dialog"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Project, Task } from "@/lib/types"

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [defaultTaskStatus, setDefaultTaskStatus] = useState<Task["status"]>("todo")
  const [loading, setLoading] = useState(true)
  const [projectFormData, setProjectFormData] = useState({
    title: "",
    description: "",
    status: "active" as Project["status"],
    deadline: "",
  })

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (selectedProject) {
      loadTasks(selectedProject.id)
    }
  }, [selectedProject])

  const loadProjects = async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .or(`created_by.eq.${user.id}`)
        .order("updated_at", { ascending: false })

      if (error) throw error

      setProjects(data || [])
    } catch (error) {
      console.error("Failed to load projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadTasks = async (projectId: string) => {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setTasks(data || [])
    } catch (error) {
      console.error("Failed to load tasks:", error)
    }
  }

  const handleCreateProject = () => {
    setEditingProject(null)
    setProjectFormData({ title: "", description: "", status: "active", deadline: "" })
    setProjectDialogOpen(true)
  }

  const handleSaveProject = async () => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const projectData = {
      ...projectFormData,
      deadline: projectFormData.deadline ? new Date(projectFormData.deadline).toISOString() : null,
    }

    if (editingProject) {
      const { error } = await supabase.from("projects").update(projectData).eq("id", editingProject.id)

      if (error) throw error
    } else {
      const { error } = await supabase.from("projects").insert({
        ...projectData,
        created_by: user.id,
      })

      if (error) throw error
    }

    await loadProjects()
    setProjectDialogOpen(false)
    router.refresh()
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setProjectFormData({
      title: project.title,
      description: project.description || "",
      status: project.status,
      deadline: project.deadline ? new Date(project.deadline).toISOString().slice(0, 10) : "",
    })
    setProjectDialogOpen(true)
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project? All tasks will be deleted.")) return

    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from("projects").delete().eq("id", id)

    if (error) {
      console.error("Failed to delete project:", error)
      return
    }

    await loadProjects()
    if (selectedProject?.id === id) {
      setSelectedProject(null)
    }
    router.refresh()
  }

  const handleCreateTask = (status: Task["status"]) => {
    setEditingTask(null)
    setDefaultTaskStatus(status)
    setTaskDialogOpen(true)
  }

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (!selectedProject) return

    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    if (editingTask) {
      const { error } = await supabase.from("tasks").update(taskData).eq("id", editingTask.id)

      if (error) throw error
    } else {
      const { error } = await supabase.from("tasks").insert({
        ...taskData,
        project_id: selectedProject.id,
        created_by: user.id,
      })

      if (error) throw error
    }

    await loadTasks(selectedProject.id)
    setEditingTask(null)
    router.refresh()
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setTaskDialogOpen(true)
  }

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return

    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from("tasks").delete().eq("id", id)

    if (error) {
      console.error("Failed to delete task:", error)
      return
    }

    if (selectedProject) {
      await loadTasks(selectedProject.id)
    }
    router.refresh()
  }

  const handleUpdateTaskStatus = async (taskId: string, newStatus: Task["status"]) => {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId)

    if (error) {
      console.error("Failed to update task status:", error)
      return
    }

    if (selectedProject) {
      await loadTasks(selectedProject.id)
    }
    router.refresh()
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

  if (selectedProject) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b p-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedProject(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{selectedProject.title}</h1>
              {selectedProject.description && (
                <p className="text-muted-foreground mt-1">{selectedProject.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-hidden">
          <KanbanBoard
            tasks={tasks}
            onCreateTask={handleCreateTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        </div>

        <TaskDialog
          open={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          onSubmit={handleSaveTask}
          editTask={editingTask}
          defaultStatus={defaultTaskStatus}
        />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground mt-1">Manage your projects and track progress</p>
          </div>
          <Button onClick={handleCreateProject}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ProjectList
          projects={projects}
          onSelect={setSelectedProject}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
        />
      </div>

      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProject ? "Edit Project" : "Create New Project"}</DialogTitle>
            <DialogDescription>
              {editingProject ? "Update the project details below" : "Enter details for your new project"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={projectFormData.title}
                onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
                placeholder="Website Redesign"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={projectFormData.description}
                onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                placeholder="Describe your project..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={projectFormData.status}
                  onValueChange={(value) =>
                    setProjectFormData({ ...projectFormData, status: value as Project["status"] })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={projectFormData.deadline}
                  onChange={(e) => setProjectFormData({ ...projectFormData, deadline: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setProjectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProject} disabled={!projectFormData.title.trim()}>
              {editingProject ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
