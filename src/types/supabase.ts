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