"use client"

import { useState, useEffect } from "react"
import { Plus, ArrowLeft, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FlowList } from "@/components/flows/flow-list"
import { FlowCanvas } from "@/components/flows/flow-canvas"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client"
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

interface Flow {
  id: string
  title: string
  description: string | null
  flow_data: any
  created_by: string
  created_at: string
  updated_at: string
}

export default function FlowsPage() {
  const router = useRouter()
  const [flows, setFlows] = useState<Flow[]>([])
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFlow, setEditingFlow] = useState<Flow | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ title: "", description: "" })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFlows()
  }, [])

  const loadFlows = async () => {
    try {
      if (!isSupabaseConfigured()) {
        setError("Supabase is not configured. Please connect Supabase integration.")
        setLoading(false)
        return
      }

      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("Auth error:", userError)
        setError("Failed to authenticate. Please sign in again.")
        setLoading(false)
        return
      }

      if (!user) {
        setError("No user found. Please sign in.")
        setLoading(false)
        return
      }

      const { data, error: flowsError } = await supabase
        .from("flows")
        .select("*")
        .or(`created_by.eq.${user.id},is_public.eq.true`)
        .order("updated_at", { ascending: false })

      if (flowsError) {
        console.error("Failed to load flows:", flowsError)
        setError("Failed to load flows. Please try again.")
        setFlows([])
      } else {
        setFlows(data || [])
        setError(null)
      }
    } catch (error) {
      console.error("Failed to load flows:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFlow = () => {
    setEditingFlow(null)
    setFormData({ title: "", description: "" })
    setDialogOpen(true)
  }

  const handleSaveFlowDetails = async () => {
    try {
      if (!isSupabaseConfigured()) {
        alert("Supabase is not configured. Please connect Supabase integration.")
        return
      }

      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        alert("Failed to authenticate. Please sign in again.")
        return
      }

      if (editingFlow) {
        const { error } = await supabase.from("flows").update(formData).eq("id", editingFlow.id)

        if (error) {
          console.error("Failed to update flow:", error)
          alert("Failed to update flow. Please try again.")
          return
        }
      } else {
        const { data, error } = await supabase
          .from("flows")
          .insert({
            ...formData,
            created_by: user.id,
            flow_data: { nodes: [], connections: [] },
          })
          .select()
          .single()

        if (error) {
          console.error("Failed to create flow:", error)
          alert("Failed to create flow. Please try again.")
          return
        }

        if (data) {
          setSelectedFlow(data)
        }
      }

      await loadFlows()
      setDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to save flow:", error)
      alert("An unexpected error occurred. Please try again.")
    }
  }

  const handleSaveFlowData = async (flowData: any) => {
    if (!selectedFlow) return

    try {
      if (!isSupabaseConfigured()) {
        alert("Supabase is not configured. Please connect Supabase integration.")
        return
      }

      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.from("flows").update({ flow_data: flowData }).eq("id", selectedFlow.id)

      if (error) {
        console.error("Failed to save flow:", error)
        alert("Failed to save flow. Please try again.")
        return
      }

      await loadFlows()
      router.refresh()
    } catch (error) {
      console.error("Failed to save flow:", error)
      alert("An unexpected error occurred. Please try again.")
    }
  }

  const handleEditFlow = (flow: Flow) => {
    setEditingFlow(flow)
    setFormData({ title: flow.title, description: flow.description || "" })
    setDialogOpen(true)
  }

  const handleDeleteFlow = async (id: string) => {
    if (!confirm("Are you sure you want to delete this flow?")) return

    try {
      if (!isSupabaseConfigured()) {
        alert("Supabase is not configured. Please connect Supabase integration.")
        return
      }

      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.from("flows").delete().eq("id", id)

      if (error) {
        console.error("Failed to delete flow:", error)
        alert("Failed to delete flow. Please try again.")
        return
      }

      await loadFlows()
      if (selectedFlow?.id === id) {
        setSelectedFlow(null)
      }
      router.refresh()
    } catch (error) {
      console.error("Failed to delete flow:", error)
      alert("An unexpected error occurred. Please try again.")
    }
  }

  const handleDuplicateFlow = async (flow: Flow) => {
    try {
      if (!isSupabaseConfigured()) {
        alert("Supabase is not configured. Please connect Supabase integration.")
        return
      }

      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        alert("Failed to authenticate. Please sign in again.")
        return
      }

      const { error } = await supabase.from("flows").insert({
        title: `${flow.title} (Copy)`,
        description: flow.description,
        flow_data: flow.flow_data,
        created_by: user.id,
      })

      if (error) {
        console.error("Failed to duplicate flow:", error)
        alert("Failed to duplicate flow. Please try again.")
        return
      }

      await loadFlows()
      router.refresh()
    } catch (error) {
      console.error("Failed to duplicate flow:", error)
      alert("An unexpected error occurred. Please try again.")
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

  if (error) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Unable to Load Flows</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadFlows}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  if (selectedFlow) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b p-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedFlow(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{selectedFlow.title}</h1>
              {selectedFlow.description && <p className="text-muted-foreground mt-1">{selectedFlow.description}</p>}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <FlowCanvas flowData={selectedFlow.flow_data} onSave={handleSaveFlowData} />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Flow Builder</h1>
            <p className="text-muted-foreground mt-1">Design and visualize your workflows</p>
          </div>
          <Button onClick={handleCreateFlow}>
            <Plus className="h-4 w-4 mr-2" />
            New Flow
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <FlowList
          flows={flows}
          onSelect={setSelectedFlow}
          onEdit={handleEditFlow}
          onDelete={handleDeleteFlow}
          onDuplicate={handleDuplicateFlow}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFlow ? "Edit Flow" : "Create New Flow"}</DialogTitle>
            <DialogDescription>
              {editingFlow ? "Update the flow details below" : "Enter details for your new workflow"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Onboarding Process"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your workflow..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFlowDetails} disabled={!formData.title.trim()}>
              {editingFlow ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
