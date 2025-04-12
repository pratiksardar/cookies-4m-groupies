/*
  # Add Storage Buckets for Media Files

  1. Storage Buckets
    - `avatars` bucket for profile pictures
    - `artworks` bucket for artwork media files

  2. Security
    - Public access for viewing files
    - Authenticated access for uploading files
    - Size limits and file type restrictions
*/

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('artworks', 'artworks', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for avatars bucket
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
    AND octet_length(content) < 5242880 -- 5MB file size limit
  );

-- Set up storage policies for artworks bucket
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
    AND octet_length(content) < 10485760 -- 10MB file size limit
  );

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own uploads"
  ON storage.objects FOR DELETE
  USING (auth.uid() = owner);