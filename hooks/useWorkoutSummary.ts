import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface WorkoutSummary {
  workoutCount: number;
  totalSets: number;
  completedSets: number;
}

export function useWorkoutSummary() {
  const [summary, setSummary] = useState<WorkoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: logs, error: logsError } = await supabase
      .from('workout_logs')
      .select('id')
      .gte('created_at', todayStart.toISOString());

    if (logsError) {
      setError(logsError.message);
      setLoading(false);
      return;
    }

    if (!logs || logs.length === 0) {
      setSummary({ workoutCount: 0, totalSets: 0, completedSets: 0 });
      setLoading(false);
      return;
    }

    const logIds = logs.map((l) => l.id);

    const { data: sets, error: setsError } = await supabase
      .from('workout_log_sets')
      .select('completed')
      .in('workout_log_id', logIds);

    if (setsError) {
      setError(setsError.message);
      setLoading(false);
      return;
    }

    setSummary({
      workoutCount: logs.length,
      totalSets: sets?.length ?? 0,
      completedSets: sets?.filter((s) => s.completed).length ?? 0,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { summary, loading, error, refetch: fetch };
}
