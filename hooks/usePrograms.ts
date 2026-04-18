import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Program } from '../types/program';

export function usePrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetch() {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('programs')
      .select('*')
      .order('name');
    if (err) {
      setError(err.message);
    } else {
      setPrograms((data ?? []) as Program[]);
    }
    setLoading(false);
  }

  useEffect(() => { fetch(); }, []);

  return { programs, loading, error, refetch: fetch };
}
