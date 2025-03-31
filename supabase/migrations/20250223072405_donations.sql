-- Create donations table
CREATE TABLE donations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    donor_address TEXT NOT NULL,
    artist_address TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    token_address TEXT NOT NULL,
    transaction_hash TEXT NOT NULL UNIQUE,
    block_number BIGINT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on donor and artist addresses for faster lookups
CREATE INDEX idx_donations_donor ON donations(donor_address);
CREATE INDEX idx_donations_artist ON donations(artist_address);

-- Add RLS policies
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to view donations
CREATE POLICY "Anyone can view donations"
ON donations FOR SELECT
TO authenticated
USING (true);

-- Policy to allow insert only if authenticated
CREATE POLICY "Users can insert donations"
ON donations FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_donations_updated_at
    BEFORE UPDATE ON donations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 