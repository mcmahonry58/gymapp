import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { WellnessCheckin } from '../types/wellness';

export function useWellnessCheckin() {
  const [checkin, setCheckin] = useState<WellnessCheckin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const today = new Date().toISOString().split('T')[0];
    const { data, error: err } = await supabase
      .from('wellness_checkins')
      .select('*')
      .eq('logged_date', today)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (err) {
      setError(err.message);
    } else {
      setCheckin(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { checkin, loading, error, refetch: fetch };
}
