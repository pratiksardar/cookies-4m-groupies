/*
  # Fix RLS policies for comments and storage

  1. Updates
    - Modify comments RLS policy to allow authenticated users to create comments
    - Update storage policies to handle file uploads correctly

  2. Security
    - Ensure proper access control for comments
    - Configure storage bucket policies
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can create comments" ON comments;

-- Create new comments policy for authenticated users
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Update storage buckets configuration
DO $$
BEGIN
  -- Create buckets if they don't exist
  INSERT INTO storage.buckets (id, name, public)
  VALUES 
    ('avatars', 'avatars', true),
    ('artworks', 'artworks', true)
  ON CONFLICT (id) DO NOTHING;

  -- Drop existing storage policies to avoid conflicts
  DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload avatar images" ON storage.objects;
  DROP POLICY IF EXISTS "Artwork images are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload artwork images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;

  -- Create new storage policies
  CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

  CREATE POLICY "Users can upload avatar images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'avatars');

  CREATE POLICY "Artwork images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'artworks');

  CREATE POLICY "Users can upload artwork images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'artworks');

  CREATE POLICY "Users can delete their own uploads"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (auth.uid() = owner);
END $$;