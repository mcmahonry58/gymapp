import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useEnrollment } from '../../hooks/useEnrollment';
import { completeSession } from '../../lib/programService';
import { ProgramSession } from '../../types/program';
import { Colors } from '../../constants/colors';

const TEAL = '#2DB6CA';

export default function ProgramSessionScreen() {
  const router = useRouter();
  const { enrollment, loading: enrollmentLoading, refetch: refetchEnrollment } = useEnrollment();
  const [session, setSession] = useState<ProgramSession | null>(null);
  const [totalSessionsInWeek, setTotalSessionsInWeek] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    if (enrollment && enrollment.status === 'active') fetchSession();
    else if (!enrollmentLoading) setLoading(false);
  }, [enrollment, enrollmentLoading]);

  async function fetchSession() {
    if (!enrollment) return;

    const { data: weekData } = await supabase
      .from('program_weeks')
      .select('id, program_sessions(id, session_number, name)')
      .eq('program_id', enrollment.program_id)
      .eq('week_number', enrollment.current_week)
      .single();

    if (weekData) {
      const sessions = (weekData as unknown as { program_sessions: { id: string; session_number: number; name: string }[] }).program_sessions;
      sessions.sort((a, b) => a.session_number - b.session_number);
      setTotalSessionsInWeek(sessions.length);

      const currentSess = sessions.find((s) => s.session_number === enrollment.current_session);
      if (currentSess) {
        const { data: sessData } = await supabase
          .from('program_sessions')
          .select('id, session_number, name, program_session_exercises(id, sets, reps, rest_seconds, order_index, movements(id, name, muscle_groups))')
          .eq('id', currentSess.id)
          .single();
        if (sessData) {
          const s = sessData as unknown as ProgramSession;
          s.program_session_exercises.sort((a, b) => a.order_index - b.order_index);
          setSession(s);
        }
      }
    }
    setLoading(false);
  }

  async function handleFinish() {
    if (!enrollment || !session) return;
    setFinishing(true);
    try {
      const isLast =
        enrollment.current_session >= totalSessionsInWeek &&
        enrollment.current_week >= enrollment.programs.weeks_count;

      await completeSession(
        enrollment.id,
        enrollment.programs.weeks_count,
        totalSessionsInWeek,
        enrollment.current_week,
        enrollment.current_session,
      );
      await refetchEnrollment();

      if (isLast) {
        Alert.alert('Program Complete!', "You've finished the program. Great work!", [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        router.back();
      }
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not complete session');
    }
    setFinishing(false);
  }

  if (enrollmentLoading || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.textPrimary} />
      </View>
    );
  }

  if (!enrollment || enrollment.status !== 'active') {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No active program</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Session not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>
          Week {enrollment.current_week} · Session {enrollment.current_session}
        </Text>
        <Text style={styles.sessionName}>{session.name}</Text>

        {session.program_session_exercises.map((ex) => (
          <View key={ex.id} style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{ex.movements.name}</Text>
            <Text style={styles.exerciseSets}>{ex.sets} × {ex.reps}</Text>
            {ex.movements.muscle_groups.length > 0 && (
              <Text style={styles.exerciseMuscles}>
                {ex.movements.muscle_groups.map(capitalize).join(' · ')}
              </Text>
            )}
            {ex.rest_seconds ? (
              <Text style={styles.exerciseRest}>Rest: {ex.rest_seconds}s</Text>
            ) : null}
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.finishButton}
          onPress={handleFinish}
          disabled={finishing}
          activeOpacity={0.8}
        >
          <Text style={styles.finishButtonText}>
            {finishing ? 'Saving...' : 'Finish Session'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  content: { padding: 20 },
  header: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500', marginBottom: 4 },
  sessionName: { color: Colors.textPrimary, fontSize: 24, fontWeight: '700', marginBottom: 20 },
  exerciseCard: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: Colors.border, gap: 4,
  },
  exerciseName: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600' },
  exerciseSets: { color: TEAL, fontSize: 18, fontWeight: '700' },
  exerciseMuscles: { color: Colors.textSecondary, fontSize: 13 },
  exerciseRest: { color: Colors.textSecondary, fontSize: 12 },
  errorText: { color: Colors.textSecondary, fontSize: 15 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, paddingBottom: 36, backgroundColor: Colors.bg,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  finishButton: {
    backgroundColor: TEAL, borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  finishButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
