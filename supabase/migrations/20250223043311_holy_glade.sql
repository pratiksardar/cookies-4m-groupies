/*
  # Allow public access to data
  
  1. Changes
    - Update RLS policies to allow public access to read-only operations
    - Remove authentication requirement for SELECT operations
    
  2. Security
    - Maintains write protection (INSERT, UPDATE, DELETE still require auth)
    - Only allows read access to public data
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

-- Update Stakes Policies
DROP POLICY IF EXISTS "Stakes are viewable by everyone" ON stakes;
CREATE POLICY "Stakes are viewable by everyone"
  ON stakes FOR SELECT
  USING (true);

-- Update Purchases Policies
DROP POLICY IF EXISTS "Purchases are viewable by everyone" ON purchases;
CREATE POLICY "Purchases are viewable by everyone"
  ON purchases FOR SELECT
  USING (true);

-- Update Donations Policies
DROP POLICY IF EXISTS "Donations are viewable by everyone" ON donations;
CREATE POLICY "Donations are viewable by everyone"
  ON donations FOR SELECT
  USING (true);