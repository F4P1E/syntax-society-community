import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, FileText, Workflow, FolderKanban, MessageSquare, Cloud, Users } from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Syntax Society" width={180} height={40} className="h-10 w-auto" priority />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/auth/signin" className="text-sm font-medium hover:text-primary transition-colors">
              Sign In
            </Link>
            <Button asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
              Your All-in-One Collaborative Platform
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty leading-relaxed">
              Combine productivity, team collaboration, and community interaction in one unified environment. Built for
              modern teams who value efficiency and connection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/signup">
                  Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A comprehensive suite of tools designed to streamline your workflow and enhance collaboration
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Meeting Calendar</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Schedule and manage meetings with integrated calendar sync and reminders
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Notes & Whiteboard</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Collaborative note-taking and visual brainstorming in real-time
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Workflow className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Flow Builder</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Design and visualize workflows with intuitive drag-and-drop interface
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FolderKanban className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Project Management</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Track tasks and progress with powerful Kanban boards
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Community Forum</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Engage in discussions and share knowledge with your team
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Cloud className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">File Storage</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Secure cloud storage with organized folder structure
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">User Profiles</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Customizable profiles with avatars, skills, and portfolio links
              </p>
            </div>

            <div className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-primary/60" />
              </div>
              <h3 className="font-semibold text-lg mb-2">And More</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Real-time collaboration, notifications, and seamless integrations
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20">
          <div className="bg-primary text-primary-foreground rounded-2xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of teams already using Syntax Society to collaborate better
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/signup">
                Create Your Account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="Syntax Society" width={150} height={35} className="h-8 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground">© 2025 Syntax Society Community. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
