"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import type { Meeting } from "@/lib/types"

interface CreateMeetingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (meeting: Partial<Meeting>) => Promise<void>
  editMeeting?: Meeting | null
  defaultDate?: Date
}

export function CreateMeetingDialog({
  open,
  onOpenChange,
  onSubmit,
  editMeeting,
  defaultDate,
}: CreateMeetingDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: editMeeting?.title || "",
    description: editMeeting?.description || "",
    start_time: editMeeting?.start_time
      ? new Date(editMeeting.start_time).toISOString().slice(0, 16)
      : defaultDate
        ? new Date(defaultDate.setHours(9, 0)).toISOString().slice(0, 16)
        : "",
    end_time: editMeeting?.end_time
      ? new Date(editMeeting.end_time).toISOString().slice(0, 16)
      : defaultDate
        ? new Date(defaultDate.setHours(10, 0)).toISOString().slice(0, 16)
        : "",
    location: editMeeting?.location || "",
    meeting_link: editMeeting?.meeting_link || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit({
        ...formData,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
      })
      onOpenChange(false)
      setFormData({
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        location: "",
        meeting_link: "",
      })
    } catch (error) {
      console.error("Failed to save meeting:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editMeeting ? "Edit Meeting" : "Create New Meeting"}</DialogTitle>
          <DialogDescription>
            {editMeeting ? "Update the meeting details below" : "Schedule a new meeting with your team"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Team standup"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Discuss project updates and blockers"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">End Time *</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Conference Room A or Remote"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting_link">Meeting Link</Label>
            <Input
              id="meeting_link"
              type="url"
              value={formData.meeting_link}
              onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
              placeholder="https://zoom.us/j/..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : editMeeting ? "Update Meeting" : "Create Meeting"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
