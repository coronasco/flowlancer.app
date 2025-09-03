-- Client Portal Schema for Supabase
-- Updated script to handle existing tables

-- First add share_token column to existing projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS share_token text;

-- Create unique index for share_token if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'projects_share_token_key') THEN
        CREATE UNIQUE INDEX projects_share_token_key ON public.projects(share_token);
    END IF;
END
$$;

-- Client comments table - create only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'client_comments') THEN
        CREATE TABLE public.client_comments (
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
    END IF;
END
$$;

-- Client feedback table - create only if it doesn't exist  
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'client_feedback') THEN
        CREATE TABLE public.client_feedback (
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
          CONSTRAINT client_feedback_rating_check CHECK ((rating >= 1) AND (rating <= 5))
        ) TABLESPACE pg_default;
    END IF;
END
$$;

-- Indexes for better performance (create only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'client_comments_project_id_idx') THEN
        CREATE INDEX client_comments_project_id_idx ON public.client_comments(project_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'client_comments_task_id_idx') THEN
        CREATE INDEX client_comments_task_id_idx ON public.client_comments(task_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'client_comments_share_token_idx') THEN
        CREATE INDEX client_comments_share_token_idx ON public.client_comments(share_token);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'client_feedback_project_id_idx') THEN
        CREATE INDEX client_feedback_project_id_idx ON public.client_feedback(project_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'client_feedback_share_token_idx') THEN
        CREATE INDEX client_feedback_share_token_idx ON public.client_feedback(share_token);
    END IF;
END
$$;

-- RLS (Row Level Security) policies if needed
-- ALTER TABLE public.client_comments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.client_feedback ENABLE ROW LEVEL SECURITY;
