// Add Comment type to existing types
export interface Comment {
  id: string;
  profile_id: string;
  artist_id: string;
  content: string;
  created_at: string;
  profile?: {
    username: string;
    avatar_url?: string;
  };
}

export interface Profile {
  id: string;
  wallet_address: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Artist {
  id: string;
  profile_id: string;
  wallet_address: string;
  category: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Artwork {
  id: string;
  artist_id: string;
  title: string;
  description?: string;
  media_url: string;
  media_type: string;
  nft_contract_address?: string;
  nft_token_id?: string;
  price?: number;
  currency?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Stake {
  id: string;
  staker_id: string;
  artist_id: string;
  amount: number;
  stablecoin_address: string;
  cookies_earned: number;
  start_date: string;
  end_date?: string;
  status: 'active' | 'ended';
  created_at: string;
  updated_at: string;
}