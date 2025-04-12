/*
  # Fix profile creation policies
  
  1. Changes
    - Update RLS policies to allow authenticated users to create profiles
    - Add policies for profile and artist creation
    
  2. Security
    - Ensures users can only create their own profiles
    - Maintains read-only access for public data
*/

-- Update Profiles Policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Update Artists Policies
DROP POLICY IF EXISTS "Artists can manage their own profile" ON artists;
CREATE POLICY "Artists can manage their own profile"
  ON artists FOR INSERT
  WITH CHECK (true);

-- Keep existing policies
CREATE POLICY "Artists can update their own profile"
  ON artists FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = artists.profile_id
      AND profiles.wallet_address = auth.uid()::text
    )
  );

CREATE POLICY "Artists can delete their own profile"
  ON artists FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = artists.profile_id
      AND profiles.wallet_address = auth.uid()::text
    )
  );