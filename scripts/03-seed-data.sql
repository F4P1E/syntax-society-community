-- Insert default forum categories
INSERT INTO public.forum_categories (name, description, slug) VALUES
  ('General Discussion', 'General topics and conversations', 'general'),
  ('Announcements', 'Important updates and announcements', 'announcements'),
  ('Help & Support', 'Get help from the community', 'help-support'),
  ('Feature Requests', 'Suggest new features', 'feature-requests'),
  ('Show & Tell', 'Share your projects and achievements', 'show-tell')
ON CONFLICT (slug) DO NOTHING;

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
