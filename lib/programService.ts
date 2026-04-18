import { supabase } from './supabase';

export async function enrollInProgram(programId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('user_program_enrollments')
    .insert({ user_id: user.id, program_id: programId });
  if (error) throw error;
}

export async function completeSession(
  enrollmentId: string,
  programWeeksCount: number,
  totalSessionsInWeek: number,
  currentWeek: number,
  currentSession: number,
): Promise<void> {
  let nextWeek = currentWeek;
  let nextSession = currentSession + 1;
  let status: 'active' | 'completed' = 'active';

  if (nextSession > totalSessionsInWeek) {
    nextSession = 1;
    nextWeek = currentWeek + 1;
  }

  if (nextWeek > programWeeksCount) {
    status = 'completed';
  }

  const update: Record<string, unknown> = { current_week: nextWeek, current_session: nextSession, status };
  if (status === 'completed') update.completed_at = new Date().toISOString();

  const { error } = await supabase
    .from('user_program_enrollments')
    .update(update)
    .eq('id', enrollmentId);
  if (error) throw error;
}
