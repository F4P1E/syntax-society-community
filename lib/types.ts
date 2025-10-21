export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  skills: string[] | null
  links: any
  created_at: string
  updated_at: string
}

export interface Meeting {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  location: string | null
  meeting_link: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  title: string
  content: string | null
  created_by: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  title: string
  description: string | null
  status: "active" | "completed" | "archived"
  deadline: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  status: "todo" | "in_progress" | "done"
  priority: "low" | "medium" | "high"
  assigned_to: string | null
  due_date: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface ForumPost {
  id: string
  category_id: string
  title: string
  content: string
  author_id: string
  is_pinned: boolean
  views: number
  created_at: string
  updated_at: string
}

export interface FileItem {
  id: string
  name: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  folder_id: string | null
  uploaded_by: string
  created_at: string
  updated_at: string
}
