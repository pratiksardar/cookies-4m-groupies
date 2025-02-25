/*
  # Add comments table and related functionality

  1. New Tables
    - `comments`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, references profiles)
      - `artist_id` (uuid, references artists)
      - `content` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on comments table
    - Add policies for reading and creating comments
*/

-- Create comments table
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) NOT NULL,
  artist_id uuid REFERENCES artists(id) NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Comments are viewable by everyone
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

-- Users can create comments
CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_id
      AND profiles.wallet_address = auth.uid()::text
    )
  );

-- Create index for better query performance
CREATE INDEX idx_comments_artist_id ON comments(artist_id);
CREATE INDEX idx_comments_profile_id ON comments(profile_id);