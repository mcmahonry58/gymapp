import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Movement } from '../types/movement';

export function useMovements() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('movements')
      .select('id, name, description, muscle_groups, equipment, is_member_only')
      .order('name');
    if (err) {
      setError(err.message);
    } else {
      setMovements(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  return { movements, loading, error, refetch: fetchMovements };
}
