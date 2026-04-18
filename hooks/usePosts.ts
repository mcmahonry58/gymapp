import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Post } from '../types/post';

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('posts')
      .select('id, content, created_at, workout_log_id, user_id, users(display_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(20);

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setPosts((data as unknown as Post[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { posts, loading, error, refetch: fetch };
}
