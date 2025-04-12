/*
  # Add mock data for artists and artworks

  1. Sample Data
    - Creates 5 sample profiles
    - Creates 5 artists with different categories
    - Creates 15 artworks across the artists
  
  2. Data Details
    - Profiles with usernames and bios
    - Artists with various categories and social links
    - Artworks with titles, descriptions, and media
*/

-- Insert sample profiles
INSERT INTO profiles (id, wallet_address, username, bio, avatar_url, created_at)
VALUES
  ('d290f1ee-6c54-4b01-90e6-d701748f0851', '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 'vitalik', 'Digital artist exploring the intersection of blockchain and creativity', 'https://images.unsplash.com/photo-1636716642701-01a9df2b3101?w=500', NOW()),
  ('d290f1ee-6c54-4b01-90e6-d701748f0852', '0x2152BE2A9c0797bbF08b6Ee86506C8c3E4a8B4c1', 'pixelmaster', 'Creating vibrant pixel art and retro-inspired digital pieces', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500', NOW()),
  ('d290f1ee-6c54-4b01-90e6-d701748f0853', '0x3152BE2A9c0797bbF08b6Ee86506C8c3E4a8B4c2', 'neonwave', 'Blending traditional photography with digital manipulation', 'https://images.unsplash.com/photo-1634926878768-2a5b3c42f139?w=500', NOW()),
  ('d290f1ee-6c54-4b01-90e6-d701748f0854', '0x4152BE2A9c0797bbF08b6Ee86506C8c3E4a8B4c3', '3dart_guru', 'Exploring the boundaries of 3D art and animation', 'https://images.unsplash.com/photo-1638803040283-7a5ffd48dad9?w=500', NOW()),
  ('d290f1ee-6c54-4b01-90e6-d701748f0855', '0x5152BE2A9c0797bbF08b6Ee86506C8c3E4a8B4c4', 'cryptosketch', 'Illustrator specializing in fantasy and sci-fi concepts', 'https://images.unsplash.com/photo-1634193295627-1cdddf751ebf?w=500', NOW());

-- Insert sample artists
INSERT INTO artists (id, profile_id, category, instagram_url, twitter_url, website_url, verified, total_sales, total_donations, total_stakes)
VALUES
  ('9f7b5896-2a6c-4c43-a5d9-a54c9c6f6d81', 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'Digital Art', 'https://instagram.com/vitalik', 'https://twitter.com/vitalik', 'https://vitalik.art', true, 15.5, 2.3, 100.0),
  ('9f7b5896-2a6c-4c43-a5d9-a54c9c6f6d82', 'd290f1ee-6c54-4b01-90e6-d701748f0852', 'Illustration', 'https://instagram.com/pixelmaster', 'https://twitter.com/pixelmaster', 'https://pixelmaster.art', true, 8.2, 1.5, 50.0),
  ('9f7b5896-2a6c-4c43-a5d9-a54c9c6f6d83', 'd290f1ee-6c54-4b01-90e6-d701748f0853', 'Photography', 'https://instagram.com/neonwave', 'https://twitter.com/neonwave', 'https://neonwave.art', false, 3.7, 0.8, 25.0),
  ('9f7b5896-2a6c-4c43-a5d9-a54c9c6f6d84', 'd290f1ee-6c54-4b01-90e6-d701748f0854', '3D Art', 'https://instagram.com/3dart_guru', 'https://twitter.com/3dart_guru', 'https://3dart.guru', true, 12.1, 3.2, 75.0),
  ('9f7b5896-2a6c-4c43-a5d9-a54c9c6f6d85', 'd290f1ee-6c54-4b01-90e6-d701748f0855', 'Animation', 'https://instagram.com/cryptosketch', 'https://twitter.com/cryptosketch', 'https://cryptosketch.art', false, 6.4, 1.1, 30.0);

-- Insert sample artworks
INSERT INTO artworks (id, artist_id, title, description, media_url, media_type, price, currency, is_available)
VALUES
  -- Vitalik's artworks
  ('b5f8d450-7c1d-4c3c-a7d5-73f2f37e2c81', '9f7b5896-2a6c-4c43-a5d9-a54c9c6f6d81', 'Ethereum Dreams', 'A digital representation of the Ethereum ecosystem', 'https://images.unsplash.com/photo-1634926878768-2a5b3c42f139?w=800', 'image', 2.5, 'ETH', true),
  ('b5f8d450-7c1d-4c3c-a7d5-73f2f37e2c82', '9f7b5896-2a6c-4c43-a5d9-a54c9c6f6d81', 'Digital Frontier', 'Exploring the boundaries of digital art', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800', 'image', 1.8, 'ETH', true),
  ('b5f8d450-7c1d-4c3c-a7d5-73f2f37e2c83', '9f7b5896-2a6c-4c43-a5d9-a54c9c6f6d81', 'Crypto Genesis', 'The birth of cryptocurrency visualized', 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800', 'image', 3.2, 'ETH', true),

  -- Pixelmaster's artworks
  ('b5f8d450-7c1d-4c3c-a7d5-73f2f37e2c84', '9f7b5896-2a6c-4c43-a5d9-a54c9c6f6d82', 'Pixel Paradise', '8-bit inspired landscape', 'https://images.unsplash.com/photo-1633355444132-695d5876cd00?w=800', 'image', 1.2, 'ETH', true),
  ('b5f8d450-7c1d-4c3c-a7d5-73f2f37e2c85', '9f7b5896-2a6c-4c43-a5d9-a54c9c6f6d82', 'Retro Gaming', 'Homage to classic video games', 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=800', 'image', 0.8, 'ETH', true),
  ('b5f8d450-7c1d-4c3c-a7d5-73f2f37e2c86', '9f7b5896-2a6c-4c43-a5d9-a54c9c6f6d82', '8-bit Adventure', 'A pixel art journey', 'https://images.unsplash.com/photo-1633354931133-49c144dc2275?w=800', 'image', 1.5, 'ETH', true),

  -- Neonwave's artworks
  ('b5f8d450-7c1d-4c3c-a7d5-73f2f37e2c87', '9f7b5896-2a6c-4c43-a5d9-a54c9c6f6d83', 'City Lights', 'Urban photography with a cyberpunk twist', 'https://images.unsplash.com/photo-1634193295627-1cdddf751ebf?w=800', 'image', 0.9, 'ETH', true),
  ('b5f8d450-7c1d-4c3c-a7d5-73f2f37e2c88', '9f7b5896-2a6c-4c43-a5d9-a54c9c6f6d83', 'Neon Dreams', 'Long exposure photography of city nights', 'https://images.unsplash.com/photo-1633355444132-695d5876cd00?w=800', 'image', 1.1, 'ETH', true),
  ('b5f8d450-7c1d-4c3c-a7d5-73f2f37e2c89', '9f7b5896-2a6c-4c43-a5d9-a54c9c6f6d83', 'Digital Rain', 'Matrix-inspired photography series', 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=800', 'image', 1.3, 'ETH', true),

  -- 3D Art Guru's artworks
  ('b5f8d450-7c1d-4c3c-a7d5-73f2f37e2c90', '9f7b5896-2a6c-4c43-a5d9-a54c9c6f6d84', 'Abstract Reality', '3D abstract art exploration', 'https://images.unsplash.com/photo-1634193295627-1cdddf751ebf?w=800', 'image', 2.1, 'ETH', true),
  ('b5f8d450-7c1d-4c3c-a7d5-73f2f37e2c91', '9f7b5896-2a6c-4c43-a5d9-a54c9c6f6d84', 'Future City', 'Futuristic cityscape in 3D', 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800', 'image', 2.8, 'ETH', true),
  ('b5f8d450-7c1d-4c3c-a7d5-73f2f37e2c92', '9f7b5896-2a6c-4c43-a5d9-a54c9c6f6d84', 'Sacred Geometry', '3D geometric patterns', 'https://images.unsplash.com/photo-1633354931133-49c144dc2275?w=800', 'image', 1.7, 'ETH', true),

  -- Cryptosketch's artworks
  ('b5f8d450-7c1d-4c3c-a7d5-73f2f37e2c93', '9f7b5896-2a6c-4c43-a5d9-a54c9c6f6d85', 'Crypto Creatures', 'Fantasy creatures in the blockchain world', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800', 'image', 1.4, 'ETH', true),
  ('b5f8d450-7c1d-4c3c-a7d5-73f2f37e2c94', '9f7b5896-2a6c-4c43-a5d9-a54c9c6f6d85', 'NFT Warriors', 'Collection of warrior character concepts', 'https://images.unsplash.com/photo-1634926878768-2a5b3c42f139?w=800', 'image', 1.6, 'ETH', true),
  ('b5f8d450-7c1d-4c3c-a7d5-73f2f37e2c95', '9f7b5896-2a6c-4c43-a5d9-a54c9c6f6d85', 'Blockchain Beasts', 'Mythical creatures inspired by blockchain', 'https://images.unsplash.com/photo-1636716642701-01a9df2b3101?w=800', 'image', 2.0, 'ETH', true);