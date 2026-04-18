import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { UserEnrollment } from '../types/program';

export function useEnrollment() {
  const [enrollment, setEnrollment] = useState<UserEnrollment | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from('user_program_enrollments')
      .select('*, programs(*)')
      .eq('user_id', user.id)
      .order('enrolled_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    setEnrollment(data ? (data as unknown as UserEnrollment) : null);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { enrollment, loading, refetch: fetch };
}
