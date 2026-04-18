export interface Post {
  id: string;
  user_id: string;
  content: string;
  workout_log_id: string | null;
  created_at: string;
  users?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}
