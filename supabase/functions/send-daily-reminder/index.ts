import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

Deno.serve(async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: usersWithTokens } = await supabase
    .from('users')
    .select('id, expo_push_token')
    .not('expo_push_token', 'is', null);

  const { data: workoutUsers } = await supabase
    .from('workout_logs')
    .select('user_id')
    .gte('created_at', todayStart.toISOString());

  const workoutUserIds = new Set((workoutUsers ?? []).map((u: any) => u.user_id));

  const messages = (usersWithTokens ?? [])
    .filter((u: any) => !workoutUserIds.has(u.id))
    .map((u: any) => ({
      to: u.expo_push_token,
      title: 'Time to train',
      body: "You haven't logged a workout today. Keep it going!",
      sound: 'default',
    }));

  if (messages.length > 0) {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });
  }

  return new Response(JSON.stringify({ sent: messages.length }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
