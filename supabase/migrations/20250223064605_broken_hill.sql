/*
  # Fix Storage Bucket Policies

  1. Storage Buckets
    - Ensure `avatars` and `artworks` buckets exist
    - Add policies only if they don't exist
    - Set proper file size limits and type restrictions

  2. Security
    - Public access for viewing files
    - Authenticated access for uploading files
    - Safe policy creation with existence checks
*/

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('artworks', 'artworks', true)
ON CONFLICT (id) DO NOTHING;

-- Helper function to check if a policy exists
CREATE OR REPLACE FUNCTION policy_exists(policy_name text, table_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = policy_name
    AND tablename = table_name
  );
END;
$$ LANGUAGE plpgsql;

DO $$ 
BEGIN
  -- Avatar policies
  IF NOT policy_exists('Avatar images are publicly accessible', 'objects') THEN
    CREATE POLICY "Avatar images are publicly accessible"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'avatars');
  END IF;

  IF NOT policy_exists('Users can upload avatar images', 'objects') THEN
    CREATE POLICY "Users can upload avatar images"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] != 'private'
        AND LOWER(storage.extension(name)) IN ('png', 'jpg', 'jpeg', 'gif', 'webp')
        AND octet_length(content) < 5242880 -- 5MB file size limit
      );
  END IF;

  -- Artwork policies
  IF NOT policy_exists('Artwork images are publicly accessible', 'objects') THEN
    CREATE POLICY "Artwork images are publicly accessible"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'artworks');
  END IF;

  IF NOT policy_exists('Users can upload artwork images', 'objects') THEN
    CREATE POLICY "Users can upload artwork images"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'artworks'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] != 'private'
        AND LOWER(storage.extension(name)) IN ('png', 'jpg', 'jpeg', 'gif', 'webp')
        AND octet_length(content) < 10485760 -- 10MB file size limit
      );
  END IF;

  -- Delete policy
  IF NOT policy_exists('Users can delete their own uploads', 'objects') THEN
    CREATE POLICY "Users can delete their own uploads"
      ON storage.objects FOR DELETE
      USING (auth.uid() = owner);
  END IF;
END $$;