/*
  # Update Gallery Access Policies

  1. Changes
    - Allow public access to view artists and artworks
    - Update existing policies to allow unauthenticated access
  
  2. Security
    - Maintains write protection (only authenticated users can modify data)
    - Read-only access for public users
*/

-- Update Artists Policies
DROP POLICY IF EXISTS "Artist profiles are viewable by everyone" ON artists;
CREATE POLICY "Artist profiles are viewable by everyone"
  ON artists FOR SELECT
  USING (true);

-- Update Artworks Policies
DROP POLICY IF EXISTS "Artworks are viewable by everyone" ON artworks;
CREATE POLICY "Artworks are viewable by everyone"
  ON artworks FOR SELECT
  USING (true);

-- Update Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);