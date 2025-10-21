"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CalendarView } from "@/components/calendar/calendar-view"
import { MeetingList } from "@/components/calendar/meeting-list"
import { CreateMeetingDialog } from "@/components/calendar/create-meeting-dialog"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Meeting } from "@/lib/types"
import { useRouter } from "next/navigation"

export default function CalendarPage() {
  const router = useRouter()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMeeting, setEditMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMeetings()
  }, [])

  const loadMeetings = async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .or(`created_by.eq.${user.id},id.in.(select meeting_id from meeting_participants where user_id = ${user.id})`)
        .order("start_time", { ascending: true })

      if (error) throw error

      setMeetings(data || [])
    } catch (error) {
      console.error("Failed to load meetings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMeeting = async (meetingData: Partial<Meeting>) => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    if (editMeeting) {
      const { error } = await supabase.from("meetings").update(meetingData).eq("id", editMeeting.id)

      if (error) throw error
    } else {
      const { error } = await supabase.from("meetings").insert({
        ...meetingData,
        created_by: user.id,
      })

      if (error) throw error
    }

    await loadMeetings()
    setEditMeeting(null)
    router.refresh()
  }

  const handleEditMeeting = (meeting: Meeting) => {
    setEditMeeting(meeting)
    setDialogOpen(true)
  }

  const handleDeleteMeeting = async (id: string) => {
    if (!confirm("Are you sure you want to delete this meeting?")) return

    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from("meetings").delete().eq("id", id)

    if (error) {
      console.error("Failed to delete meeting:", error)
      return
    }

    await loadMeetings()
    router.refresh()
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditMeeting(null)
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1">Manage your meetings and schedule</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Meeting
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <CalendarView meetings={meetings} onDateSelect={setSelectedDate} selectedDate={selectedDate} />
        <MeetingList
          meetings={meetings}
          selectedDate={selectedDate}
          onEdit={handleEditMeeting}
          onDelete={handleDeleteMeeting}
        />
      </div>

      <CreateMeetingDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={handleCreateMeeting}
        editMeeting={editMeeting}
        defaultDate={selectedDate}
      />
    </div>
  )
}
