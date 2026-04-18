import { supabase } from './supabase';
import { ActiveWorkout } from '../types/workout';

export async function saveWorkout(workout: ActiveWorkout): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: log, error: logError } = await supabase
    .from('workout_logs')
    .insert({
      user_id: user.id,
      started_at: workout.startedAt.toISOString(),
      finished_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (logError) throw logError;

  const sets = workout.exercises.flatMap((exercise, exerciseIndex) =>
    exercise.sets.map((set, setIndex) => ({
      workout_log_id: log.id,
      movement_id: exercise.movement.id,
      exercise_order: exerciseIndex,
      set_order: setIndex,
      reps: parseInt(set.reps) || null,
      weight_kg: parseFloat(set.weight) || null,
      completed: set.completed,
    }))
  );

  if (sets.length > 0) {
    const { error: setsError } = await supabase.from('workout_log_sets').insert(sets);
    if (setsError) throw setsError;
  }
}
