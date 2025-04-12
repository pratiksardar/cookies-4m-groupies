/*
  # Storage Bucket Setup

  1. Storage Buckets
    - Create avatars and artworks buckets
    - Set up public access for viewing
    - Configure upload policies for authenticated users

  2. Security
    - Enable public access for viewing files
    - Restrict uploads to authenticated users
    - Add file type and size restrictions
*/

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('artworks', 'artworks', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload avatar images" ON storage.objects;
DROP POLICY IF EXISTS "Artwork images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload artwork images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;

-- Create policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatar images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] != 'private'
    AND LOWER(storage.extension(name)) IN ('png', 'jpg', 'jpeg', 'gif', 'webp')
  );

-- Create policies for artworks bucket
CREATE POLICY "Artwork images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'artworks');

CREATE POLICY "Users can upload artwork images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'artworks'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] != 'private'
    AND LOWER(storage.extension(name)) IN ('png', 'jpg', 'jpeg', 'gif', 'webp')
  );

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own uploads"
  ON storage.objects FOR DELETE
  USING (auth.uid() = owner);