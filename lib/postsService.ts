import { supabase } from './supabase';

export async function createPost(content: string, workoutLogId?: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('posts').insert({
    user_id: user.id,
    content,
    workout_log_id: workoutLogId ?? null,
  });

  if (error) throw error;
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) throw error;
}
