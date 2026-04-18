import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { NutritionLog, NutritionTotals } from '../types/nutrition';

export function useNutritionLogs() {
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const today = new Date().toISOString().split('T')[0];
    const { data, error: err } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('logged_date', today)
      .order('created_at');
    if (err) {
      setError(err.message);
    } else {
      setLogs(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const totals = useMemo<NutritionTotals>(
    () =>
      logs.reduce(
        (acc, log) => ({
          calories: acc.calories + (log.calories ?? 0),
          protein_g: acc.protein_g + (log.protein_g ?? 0),
          carbs_g: acc.carbs_g + (log.carbs_g ?? 0),
          fat_g: acc.fat_g + (log.fat_g ?? 0),
        }),
        { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
      ),
    [logs]
  );

  return { logs, totals, loading, error, refetch: fetch };
}
