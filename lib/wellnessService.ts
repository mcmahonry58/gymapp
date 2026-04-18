import { supabase } from './supabase';

export async function saveWellnessCheckin(mood: number, energy: number): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const today = new Date().toISOString().split('T')[0];

  const { error } = await supabase.from('wellness_checkins').insert({
    user_id: user.id,
    logged_date: today,
    mood,
    energy,
  });

  if (error) throw error;
}
