-- Client Comments Table Schema for Supabase
-- This table should already exist, but here's the complete schema for reference

-- Check if table exists and create if needed
CREATE TABLE IF NOT EXISTS public.client_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  task_id uuid NULL,
  share_token text NOT NULL,
  client_name text NOT NULL,
  client_email text NULL,
  comment text NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT client_comments_pkey PRIMARY KEY (id),
  CONSTRAINT client_comments_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
  CONSTRAINT client_comments_task_id_fkey FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_comments_project_id ON client_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_client_comments_task_id ON client_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_client_comments_share_token ON client_comments(share_token);
CREATE INDEX IF NOT EXISTS idx_client_comments_created_at ON client_comments(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE client_comments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (for client portal comment submissions)
CREATE POLICY IF NOT EXISTS "Allow public comment submissions" ON client_comments
FOR INSERT 
TO anon
WITH CHECK (true);

-- Create policy to allow authenticated users to view comments for their projects
CREATE POLICY IF NOT EXISTS "Allow users to view their project comments" ON client_comments
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = client_comments.project_id 
    AND projects.user_email = auth.jwt() ->> 'email'
  )
);

-- Insert some sample data if needed (optional - remove if not needed)
-- Note: Replace with actual project IDs, task IDs, and share tokens from your database
/*
INSERT INTO client_comments (project_id, task_id, share_token, client_name, client_email, comment) VALUES
('your-project-id-here', 'your-task-id-here', 'your-share-token-here', 'John Smith', 'john@example.com', 'This task looks great! Just a small suggestion on the color scheme.'),
('your-project-id-here', NULL, 'your-share-token-here', 'Sarah Johnson', 'sarah@example.com', 'Overall progress is excellent. Looking forward to the final result!');
*/
