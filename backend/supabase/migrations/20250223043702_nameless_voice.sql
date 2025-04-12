/*
  # Add avatars storage bucket
  
  1. Changes
    - Create a new storage bucket for avatar images
    - Set up public access policies
    
  2. Security
    - Allow authenticated users to upload avatars
    - Make avatars publicly readable
*/

-- Enable storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Set up storage policies
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatar images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
  );