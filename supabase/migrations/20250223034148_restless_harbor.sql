/*
  # Web3 Art Platform Schema

  1. New Tables
    - `profiles`
      - Core user profile data for both artists and collectors
      - Stores wallet addresses and basic info
    
    - `artists`
      - Artist-specific information
      - Links to profile for basic data
      - Includes portfolio and social media details
    
    - `artworks`
      - Artwork information including NFT metadata
      - Links to artist
      - Includes pricing and availability
    
    - `stakes`
      - Staking records for $COOKIES earning
      - Tracks user stakes and artist support
    
    - `purchases`
      - NFT purchase history
      - Transaction records between users and artists
    
    - `donations`
      - Direct stablecoin donations
      - Tracks support from users to artists

  2. Security
    - RLS enabled on all tables
    - Policies for appropriate access control
*/

-- Profiles table for both artists and users
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  email text,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Artists table extending profiles
CREATE TABLE artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) NOT NULL,
  category text NOT NULL,
  instagram_url text,
  twitter_url text,
  website_url text,
  verified boolean DEFAULT false,
  total_sales numeric(20,2) DEFAULT 0,
  total_donations numeric(20,2) DEFAULT 0,
  total_stakes numeric(20,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Artworks table
CREATE TABLE artworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid REFERENCES artists(id) NOT NULL,
  title text NOT NULL,
  description text,
  media_url text NOT NULL,
  media_type text NOT NULL, -- 'image', 'video', etc.
  nft_contract_address text,
  nft_token_id text,
  price numeric(20,2),
  currency text DEFAULT 'ETH',
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Stakes table
CREATE TABLE stakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staker_id uuid REFERENCES profiles(id) NOT NULL,
  artist_id uuid REFERENCES artists(id) NOT NULL,
  amount numeric(20,2) NOT NULL,
  stablecoin_address text NOT NULL,
  cookies_earned numeric(20,2) DEFAULT 0,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Purchases table
CREATE TABLE purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid REFERENCES profiles(id) NOT NULL,
  artwork_id uuid REFERENCES artworks(id) NOT NULL,
  transaction_hash text NOT NULL,
  price numeric(20,2) NOT NULL,
  currency text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Donations table
CREATE TABLE donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid REFERENCES profiles(id) NOT NULL,
  artist_id uuid REFERENCES artists(id) NOT NULL,
  amount numeric(20,2) NOT NULL,
  currency text NOT NULL,
  transaction_hash text NOT NULL,
  message text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = wallet_address);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = wallet_address);

-- Artists Policies
CREATE POLICY "Artist profiles are viewable by everyone"
  ON artists FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Artists can manage their own profile"
  ON artists FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = artists.profile_id
      AND profiles.wallet_address = auth.uid()::text
    )
  );

-- Artworks Policies
CREATE POLICY "Artworks are viewable by everyone"
  ON artworks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Artists can manage their own artworks"
  ON artworks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM artists
      WHERE artists.id = artworks.artist_id
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = artists.profile_id
        AND profiles.wallet_address = auth.uid()::text
      )
    )
  );

-- Stakes Policies
CREATE POLICY "Stakes are viewable by involved parties"
  ON stakes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE (profiles.id = stakes.staker_id OR profiles.id IN (
        SELECT profile_id FROM artists WHERE id = stakes.artist_id
      ))
      AND profiles.wallet_address = auth.uid()::text
    )
  );

CREATE POLICY "Users can create stakes"
  ON stakes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = stakes.staker_id
      AND profiles.wallet_address = auth.uid()::text
    )
  );

-- Purchases Policies
CREATE POLICY "Purchases are viewable by involved parties"
  ON purchases FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = purchases.buyer_id
      AND profiles.wallet_address = auth.uid()::text
    ) OR
    EXISTS (
      SELECT 1 FROM artworks
      JOIN artists ON artworks.artist_id = artists.id
      JOIN profiles ON artists.profile_id = profiles.id
      WHERE artworks.id = purchases.artwork_id
      AND profiles.wallet_address = auth.uid()::text
    )
  );

-- Donations Policies
CREATE POLICY "Donations are viewable by everyone"
  ON donations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create donations"
  ON donations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = donations.donor_id
      AND profiles.wallet_address = auth.uid()::text
    )
  );

-- Create indexes for better query performance
CREATE INDEX idx_profiles_wallet_address ON profiles(wallet_address);
CREATE INDEX idx_artworks_artist_id ON artworks(artist_id);
CREATE INDEX idx_stakes_staker_id ON stakes(staker_id);
CREATE INDEX idx_stakes_artist_id ON stakes(artist_id);
CREATE INDEX idx_purchases_buyer_id ON purchases(buyer_id);
CREATE INDEX idx_purchases_artwork_id ON purchases(artwork_id);
CREATE INDEX idx_donations_donor_id ON donations(donor_id);
CREATE INDEX idx_donations_artist_id ON donations(artist_id);