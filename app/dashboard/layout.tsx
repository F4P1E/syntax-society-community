import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import type { Profile } from "@/lib/types"
import Image from "next/image"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/signin")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden md:flex md:w-64 md:flex-col">
        <Sidebar />
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="md:hidden flex items-center gap-2 p-4 border-b">
          <MobileNav />
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Syntax Society" width={120} height={32} className="h-8 w-auto" />
          </div>
        </div>

        <DashboardHeader user={profile as Profile | null} />

        <main className="flex-1 overflow-y-auto bg-secondary/10">{children}</main>
      </div>
    </div>
  )
}
