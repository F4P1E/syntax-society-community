import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, FileText, Workflow, FolderKanban, MessageSquare, Cloud, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single()

  // Fetch counts for dashboard stats
  const [{ count: meetingsCount }, { count: notesCount }, { count: projectsCount }, { count: filesCount }] =
    await Promise.all([
      supabase.from("meetings").select("*", { count: "exact", head: true }).eq("created_by", user!.id),
      supabase.from("notes").select("*", { count: "exact", head: true }).eq("created_by", user!.id),
      supabase.from("projects").select("*", { count: "exact", head: true }).eq("created_by", user!.id),
      supabase.from("files").select("*", { count: "exact", head: true }).eq("uploaded_by", user!.id),
    ])

  const stats = [
    { name: "Meetings", value: meetingsCount || 0, icon: Calendar, href: "/dashboard/calendar" },
    { name: "Notes", value: notesCount || 0, icon: FileText, href: "/dashboard/notes" },
    { name: "Projects", value: projectsCount || 0, icon: FolderKanban, href: "/dashboard/projects" },
    { name: "Files", value: filesCount || 0, icon: Cloud, href: "/dashboard/files" },
  ]

  const quickActions = [
    { name: "Schedule Meeting", icon: Calendar, href: "/dashboard/calendar" },
    { name: "Create Note", icon: FileText, href: "/dashboard/notes" },
    { name: "New Flow", icon: Workflow, href: "/dashboard/flows" },
    { name: "Start Project", icon: FolderKanban, href: "/dashboard/projects" },
    { name: "Browse Forum", icon: MessageSquare, href: "/dashboard/forum" },
    { name: "Upload File", icon: Cloud, href: "/dashboard/files" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {profile?.full_name || profile?.email?.split("@")[0]}
        </h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your workspace today</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.name}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.name}
                  variant="outline"
                  className="justify-start gap-2 h-auto py-3 bg-transparent"
                  asChild
                >
                  <Link href={action.href}>
                    <action.icon className="h-4 w-4" />
                    <span className="text-sm">{action.name}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Welcome to Syntax Society!</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Start by exploring the features or creating your first project
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Invite team members</p>
                  <p className="text-xs text-muted-foreground mt-1">Collaborate better by inviting your team to join</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Learn how to make the most of Syntax Society</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Schedule Meetings</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Create and manage meetings with integrated calendar features
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FolderKanban className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Manage Projects</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Track tasks and progress with powerful project boards
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Join Discussions</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Engage with your community in the forum</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
