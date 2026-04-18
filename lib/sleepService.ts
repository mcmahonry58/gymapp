import { supabase } from './supabase';

export async function saveSleepLog(
  bedHour: number,
  bedMinute: number,
  wakeHour: number,
  wakeMinute: number,
  quality: number
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const today = new Date().toISOString().split('T')[0];

  const sleepEnd = new Date();
  sleepEnd.setHours(wakeHour, wakeMinute, 0, 0);

  const sleepStart = new Date(sleepEnd);
  sleepStart.setHours(bedHour, bedMinute, 0, 0);
  // if bedtime is after wake time, it was the previous day
  if (sleepStart >= sleepEnd) {
    sleepStart.setDate(sleepStart.getDate() - 1);
  }

  const { error } = await supabase.from('sleep_logs').insert({
    user_id: user.id,
    logged_date: today,
    sleep_start: sleepStart.toISOString(),
    sleep_end: sleepEnd.toISOString(),
    quality,
  });

  if (error) throw error;
}
