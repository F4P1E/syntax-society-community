"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MessageSquare, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import Link from "next/link"
import { format } from "date-fns"

interface PostWithProfile {
  id: string
  title: string
  content: string
  author_id: string
  views: number
  created_at: string
  profiles?: {
    full_name: string | null
    avatar_url: string | null
    email: string
  }
}

interface ReplyWithProfile {
  id: string
  content: string
  author_id: string
  created_at: string
  profiles?: {
    full_name: string | null
    avatar_url: string | null
    email: string
  }
}

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [post, setPost] = useState<PostWithProfile | null>(null)
  const [replies, setReplies] = useState<ReplyWithProfile[]>([])
  const [replyContent, setReplyContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadPost()
    loadReplies()
    incrementViews()
  }, [resolvedParams.id])

  const loadPost = async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from("forum_posts")
        .select(
          `
          *,
          profiles:author_id (full_name, avatar_url, email)
        `,
        )
        .eq("id", resolvedParams.id)
        .single()

      if (error) throw error

      setPost(data)
    } catch (error) {
      console.error("Failed to load post:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadReplies = async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from("forum_replies")
        .select(
          `
          *,
          profiles:author_id (full_name, avatar_url, email)
        `,
        )
        .eq("post_id", resolvedParams.id)
        .order("created_at", { ascending: true })

      if (error) throw error

      setReplies(data || [])
    } catch (error) {
      console.error("Failed to load replies:", error)
    }
  }

  const incrementViews = async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      await supabase.rpc("increment_post_views", { post_id: resolvedParams.id })
    } catch (error) {
      // Silently fail - views are not critical
    }
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim()) return

    setSubmitting(true)

    try {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from("forum_replies").insert({
        post_id: resolvedParams.id,
        content: replyContent.trim(),
        author_id: user.id,
      })

      if (error) throw error

      setReplyContent("")
      await loadReplies()
      router.refresh()
    } catch (error) {
      console.error("Failed to submit reply:", error)
    } finally {
      setSubmitting(false)
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

  if (!post) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Post not found</h3>
            <Button asChild>
              <Link href="/dashboard/forum">Back to Forum</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    }
    return email[0].toUpperCase()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/forum">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={post.profiles?.avatar_url || undefined} />
              <AvatarFallback>
                {getInitials(post.profiles?.full_name || null, post.profiles?.email || "U")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{post.profiles?.full_name || "Anonymous"}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(post.created_at), "MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed">{post.content}</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Replies ({replies.length})</h2>
        </div>

        {replies.map((reply) => (
          <Card key={reply.id}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={reply.profiles?.avatar_url || undefined} />
                  <AvatarFallback>
                    {getInitials(reply.profiles?.full_name || null, reply.profiles?.email || "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{reply.profiles?.full_name || "Anonymous"}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(reply.created_at), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap leading-relaxed">{reply.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Add a Reply</h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitReply} className="space-y-4">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              className="leading-relaxed"
            />
            <Button type="submit" disabled={submitting || !replyContent.trim()}>
              <Send className="h-4 w-4 mr-2" />
              {submitting ? "Posting..." : "Post Reply"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
