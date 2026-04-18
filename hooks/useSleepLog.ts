import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { SleepLog } from '../types/sleep';

export function useSleepLog() {
  const [log, setLog] = useState<SleepLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const today = new Date().toISOString().split('T')[0];
    const { data, error: err } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('logged_date', today)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (err) {
      setError(err.message);
    } else {
      setLog(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { log, loading, error, refetch: fetch };
}

export function sleepDurationHours(log: SleepLog): number {
  const start = new Date(log.sleep_start).getTime();
  const end = new Date(log.sleep_end).getTime();
  return (end - start) / (1000 * 60 * 60);
}

export function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
