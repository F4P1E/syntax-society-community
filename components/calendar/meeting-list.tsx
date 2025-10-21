"use client"

import { format } from "date-fns"
import { Clock, MapPin, Video, MoreVertical, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Meeting } from "@/lib/types"

interface MeetingListProps {
  meetings: Meeting[]
  selectedDate: Date
  onEdit: (meeting: Meeting) => void
  onDelete: (id: string) => void
}

export function MeetingList({ meetings, selectedDate, onEdit, onDelete }: MeetingListProps) {
  const filteredMeetings = meetings.filter((meeting) => {
    const meetingDate = new Date(meeting.start_time)
    return (
      meetingDate.getDate() === selectedDate.getDate() &&
      meetingDate.getMonth() === selectedDate.getMonth() &&
      meetingDate.getFullYear() === selectedDate.getFullYear()
    )
  })

  const sortedMeetings = filteredMeetings.sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
  )

  if (sortedMeetings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meetings for {format(selectedDate, "MMMM d, yyyy")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">No meetings scheduled for this day</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meetings for {format(selectedDate, "MMMM d, yyyy")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedMeetings.map((meeting) => (
          <div key={meeting.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-2">{meeting.title}</h3>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>
                      {format(new Date(meeting.start_time), "h:mm a")} - {format(new Date(meeting.end_time), "h:mm a")}
                    </span>
                  </div>

                  {meeting.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{meeting.location}</span>
                    </div>
                  )}

                  {meeting.meeting_link && (
                    <div className="flex items-center gap-2 text-sm">
                      <Video className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <a
                        href={meeting.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        Join meeting
                      </a>
                    </div>
                  )}
                </div>

                {meeting.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{meeting.description}</p>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(meeting)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(meeting.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
