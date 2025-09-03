-- Feed comments table
CREATE TABLE public.feed_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  user_email text NOT NULL,
  text text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT feed_comments_pkey PRIMARY KEY (id),
  CONSTRAINT feed_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES feed_posts (id) ON DELETE CASCADE,
  CONSTRAINT feed_comments_text_check CHECK ((char_length(text) <= 300))
) TABLESPACE pg_default;

-- Feed likes table
CREATE TABLE public.feed_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  user_email text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT feed_likes_pkey PRIMARY KEY (id),
  CONSTRAINT feed_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES feed_posts (id) ON DELETE CASCADE,
  CONSTRAINT feed_likes_unique_user_post UNIQUE (post_id, user_email)
) TABLESPACE pg_default;

-- Add indexes for better performance
CREATE INDEX idx_feed_comments_post_id ON public.feed_comments (post_id);
CREATE INDEX idx_feed_comments_created_at ON public.feed_comments (created_at DESC);
CREATE INDEX idx_feed_likes_post_id ON public.feed_likes (post_id);
CREATE INDEX idx_feed_likes_user_email ON public.feed_likes (user_email);

-- Optional: Add user profiles table reference if needed
-- This assumes you have user profiles with avatars
-- ALTER TABLE feed_posts ADD COLUMN user_avatar_url text;
-- ALTER TABLE feed_comments ADD COLUMN user_avatar_url text;
