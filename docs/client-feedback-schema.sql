-- Client Feedback Table Schema for Supabase
-- This table should already exist, but here's the complete schema for reference

-- Check if table exists and create if needed
CREATE TABLE IF NOT EXISTS public.client_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  share_token text NOT NULL,
  client_name text NOT NULL,
  client_email text NULL,
  rating integer NOT NULL,
  comment text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT client_feedback_pkey PRIMARY KEY (id),
  CONSTRAINT client_feedback_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
  CONSTRAINT client_feedback_rating_check CHECK (
    (
      (rating >= 1)
      AND (rating <= 5)
    )
  )
) TABLESPACE pg_default;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_feedback_project_id ON client_feedback(project_id);
CREATE INDEX IF NOT EXISTS idx_client_feedback_share_token ON client_feedback(share_token);
CREATE INDEX IF NOT EXISTS idx_client_feedback_created_at ON client_feedback(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE client_feedback ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (for client portal feedback submissions)
CREATE POLICY IF NOT EXISTS "Allow public feedback submissions" ON client_feedback
FOR INSERT 
TO anon
WITH CHECK (true);

-- Create policy to allow authenticated users to view feedback for their projects
CREATE POLICY IF NOT EXISTS "Allow users to view their project feedback" ON client_feedback
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = client_feedback.project_id 
    AND projects.user_email = auth.jwt() ->> 'email'
  )
);

-- Insert some sample data if needed (optional - remove if not needed)
-- Note: Replace with actual project IDs and share tokens from your database
/*
INSERT INTO client_feedback (project_id, share_token, client_name, client_email, rating, comment) VALUES
('your-project-id-here', 'your-share-token-here', 'John Smith', 'john@example.com', 5, 'Excellent work! Very professional and delivered on time.'),
('your-project-id-here', 'your-share-token-here', 'Sarah Johnson', 'sarah@example.com', 4, 'Great communication and quality work. Would recommend!');
*/
