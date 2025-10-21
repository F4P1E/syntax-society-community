-- Drop existing policies first to avoid conflicts
DO $$ 
BEGIN
  -- Drop all existing policies if they exist
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can view meetings they're invited to" ON public.meetings;
  DROP POLICY IF EXISTS "Users can create meetings" ON public.meetings;
  DROP POLICY IF EXISTS "Meeting creators can update their meetings" ON public.meetings;
  DROP POLICY IF EXISTS "Meeting creators can delete their meetings" ON public.meetings;
  DROP POLICY IF EXISTS "Users can view public notes or their own notes" ON public.notes;
  DROP POLICY IF EXISTS "Users can create notes" ON public.notes;
  DROP POLICY IF EXISTS "Note creators can update their notes" ON public.notes;
  DROP POLICY IF EXISTS "Note creators can delete their notes" ON public.notes;
  DROP POLICY IF EXISTS "Users can view projects they're members of" ON public.projects;
  DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
  DROP POLICY IF EXISTS "Project creators can update their projects" ON public.projects;
  DROP POLICY IF EXISTS "Users can view tasks in their projects" ON public.tasks;
  DROP POLICY IF EXISTS "Project members can create tasks" ON public.tasks;
  DROP POLICY IF EXISTS "Project members can update tasks" ON public.tasks;
  DROP POLICY IF EXISTS "Anyone can view forum categories" ON public.forum_categories;
  DROP POLICY IF EXISTS "Anyone can view forum posts" ON public.forum_posts;
  DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.forum_posts;
  DROP POLICY IF EXISTS "Post authors can update their posts" ON public.forum_posts;
  DROP POLICY IF EXISTS "Anyone can view forum replies" ON public.forum_replies;
  DROP POLICY IF EXISTS "Authenticated users can create replies" ON public.forum_replies;
  DROP POLICY IF EXISTS "Users can view their own files" ON public.files;
  DROP POLICY IF EXISTS "Users can upload files" ON public.files;
  DROP POLICY IF EXISTS "Users can update their own files" ON public.files;
  DROP POLICY IF EXISTS "Users can delete their own files" ON public.files;
  DROP POLICY IF EXISTS "Users can view their own folders" ON public.folders;
  DROP POLICY IF EXISTS "Users can create folders" ON public.folders;
  DROP POLICY IF EXISTS "Users can update their own folders" ON public.folders;
  DROP POLICY IF EXISTS "Users can delete their own folders" ON public.folders;
  -- Added drop statements for flows and whiteboards policies
  DROP POLICY IF EXISTS "Users can view public flows or their own flows" ON public.flows;
  DROP POLICY IF EXISTS "Users can create flows" ON public.flows;
  DROP POLICY IF EXISTS "Flow creators can update their flows" ON public.flows;
  DROP POLICY IF EXISTS "Flow creators can delete their flows" ON public.flows;
  DROP POLICY IF EXISTS "Users can view public whiteboards or their own whiteboards" ON public.whiteboards;
  DROP POLICY IF EXISTS "Users can create whiteboards" ON public.whiteboards;
  DROP POLICY IF EXISTS "Whiteboard creators can update their whiteboards" ON public.whiteboards;
  DROP POLICY IF EXISTS "Whiteboard creators can delete their whiteboards" ON public.whiteboards;
END $$;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Meetings policies
CREATE POLICY "Users can view meetings they're invited to"
  ON public.meetings FOR SELECT
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.meeting_participants
      WHERE meeting_id = meetings.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create meetings"
  ON public.meetings FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Meeting creators can update their meetings"
  ON public.meetings FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Meeting creators can delete their meetings"
  ON public.meetings FOR DELETE
  USING (auth.uid() = created_by);

-- Notes policies
CREATE POLICY "Users can view public notes or their own notes"
  ON public.notes FOR SELECT
  USING (
    is_public = true OR
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.note_collaborators
      WHERE note_id = notes.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create notes"
  ON public.notes FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Note creators can update their notes"
  ON public.notes FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Note creators can delete their notes"
  ON public.notes FOR DELETE
  USING (auth.uid() = created_by);

-- Projects policies
CREATE POLICY "Users can view projects they're members of"
  ON public.projects FOR SELECT
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = projects.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Project creators can update their projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = created_by);

-- Tasks policies
CREATE POLICY "Users can view tasks in their projects"
  ON public.tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = tasks.project_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can create tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = tasks.project_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can update tasks"
  ON public.tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = tasks.project_id AND user_id = auth.uid()
    )
  );

-- Forum policies
CREATE POLICY "Anyone can view forum categories"
  ON public.forum_categories FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view forum posts"
  ON public.forum_posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON public.forum_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Post authors can update their posts"
  ON public.forum_posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Anyone can view forum replies"
  ON public.forum_replies FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create replies"
  ON public.forum_replies FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Files policies
CREATE POLICY "Users can view their own files"
  ON public.files FOR SELECT
  USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can upload files"
  ON public.files FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own files"
  ON public.files FOR UPDATE
  USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own files"
  ON public.files FOR DELETE
  USING (auth.uid() = uploaded_by);

-- Flows policies
CREATE POLICY "Users can view public flows or their own flows"
  ON public.flows FOR SELECT
  USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can create flows"
  ON public.flows FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Flow creators can update their flows"
  ON public.flows FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Flow creators can delete their flows"
  ON public.flows FOR DELETE
  USING (auth.uid() = created_by);

-- Whiteboards policies
CREATE POLICY "Users can view public whiteboards or their own whiteboards"
  ON public.whiteboards FOR SELECT
  USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can create whiteboards"
  ON public.whiteboards FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Whiteboard creators can update their whiteboards"
  ON public.whiteboards FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Whiteboard creators can delete their whiteboards"
  ON public.whiteboards FOR DELETE
  USING (auth.uid() = created_by);
