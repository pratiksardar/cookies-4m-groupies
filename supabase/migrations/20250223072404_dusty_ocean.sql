/*
  # Fix Comments and Storage Configuration

  1. Updates
    - Create comments table with proper structure
    - Set up RLS policies for comments
    - Configure storage buckets and policies

  2. Security
    - Enable RLS for comments table
    - Set up proper access control
*/

-- Create comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) NOT NULL,
  artist_id uuid REFERENCES artists(id) NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
DROP POLICY IF EXISTS "Users can create comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;

-- Create new policies for comments
CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_artist_id ON comments(artist_id);
CREATE INDEX IF NOT EXISTS idx_comments_profile_id ON comments(profile_id);

-- Storage configuration
DO $$
BEGIN
  -- Create buckets if they don't exist
  INSERT INTO storage.buckets (id, name, public)
  VALUES 
    ('avatars', 'avatars', true),
    ('artworks', 'artworks', true)
  ON CONFLICT (id) DO NOTHING;

  -- Drop existing storage policies
  DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload avatar images" ON storage.objects;
  DROP POLICY IF EXISTS "Artwork images are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload artwork images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;

  -- Create new storage policies
  CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('avatars', 'artworks'));

  CREATE POLICY "Authenticated Upload"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id IN ('avatars', 'artworks'));

  CREATE POLICY "Owner Delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (auth.uid() = owner);
END $$;