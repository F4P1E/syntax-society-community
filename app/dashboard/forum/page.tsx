"use client"

import { useState, useEffect } from "react"
import { Plus, MessageSquare, Eye, Pin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import type { ForumPost } from "@/lib/types"

interface Category {
  id: string
  name: string
  description: string | null
  slug: string
}

interface PostWithProfile extends ForumPost {
  profiles?: {
    full_name: string | null
    avatar_url: string | null
  }
  reply_count?: number
}

export default function ForumPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [posts, setPosts] = useState<PostWithProfile[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
    loadPosts()
  }, [selectedCategory])

  const loadCategories = async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase.from("forum_categories").select("*").order("name")

      if (error) throw error

      setCategories(data || [])
    } catch (error) {
      console.error("Failed to load categories:", error)
    }
  }

  const loadPosts = async () => {
    try {
      const supabase = getSupabaseBrowserClient()

      let query = supabase
        .from("forum_posts")
        .select(
          `
          *,
          profiles:author_id (full_name, avatar_url)
        `,
        )
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory)
      }

      const { data, error } = await query

      if (error) throw error

      // Get reply counts
      const postsWithCounts = await Promise.all(
        (data || []).map(async (post) => {
          const { count } = await supabase
            .from("forum_replies")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id)

          return { ...post, reply_count: count || 0 }
        }),
      )

      setPosts(postsWithCounts)
    } catch (error) {
      console.error("Failed to load posts:", error)
    } finally {
      setLoading(false)
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
          <h1 className="text-3xl font-bold tracking-tight">Community Forum</h1>
          <p className="text-muted-foreground mt-1">Discuss, share, and connect with the community</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/forum/new">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Link>
        </Button>
      </div>

      <Tabs value={selectedCategory || "all"} onValueChange={(v) => setSelectedCategory(v === "all" ? null : v)}>
        <TabsList>
          <TabsTrigger value="all">All Posts</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory || "all"} className="space-y-4 mt-6">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No posts yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Be the first to start a discussion</p>
                <Button asChild>
                  <Link href="/dashboard/forum/new">Create Post</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {post.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                        <Link href={`/dashboard/forum/${post.id}`}>
                          <CardTitle className="hover:text-primary transition-colors cursor-pointer">
                            {post.title}
                          </CardTitle>
                        </Link>
                      </div>
                      <CardDescription className="line-clamp-2">{post.content}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.reply_count} replies</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.views} views</span>
                      </div>
                      <span>
                        by {post.profiles?.full_name || "Anonymous"} •{" "}
                        {format(new Date(post.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
