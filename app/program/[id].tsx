import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useEnrollment } from '../../hooks/useEnrollment';
import { enrollInProgram } from '../../lib/programService';
import { Colors } from '../../constants/colors';

const TEAL = '#2DB6CA';

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: '#4CAF82',
  intermediate: '#E08C3A',
  advanced: '#E05555',
};

interface ProgramDetail {
  id: string;
  name: string;
  description: string | null;
  difficulty: string;
  weeks_count: number;
  program_weeks: {
    week_number: number;
    name: string | null;
    program_sessions: { session_number: number; name: string }[];
  }[];
}

export default function ProgramDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { enrollment, loading: enrollmentLoading, refetch: refetchEnrollment } = useEnrollment();
  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    async function fetchProgram() {
      const { data } = await supabase
        .from('programs')
        .select('*, program_weeks(week_number, name, program_sessions(session_number, name))')
        .eq('id', id)
        .single();
      if (data) {
        const p = data as unknown as ProgramDetail;
        p.program_weeks.sort((a, b) => a.week_number - b.week_number);
        p.program_weeks.forEach((w) => {
          w.program_sessions.sort((a, b) => a.session_number - b.session_number);
        });
        setProgram(p);
      }
      setLoading(false);
    }
    if (id) fetchProgram();
  }, [id]);

  async function handleEnroll() {
    if (!id) return;
    setEnrolling(true);
    try {
      await enrollInProgram(id);
      await refetchEnrollment();
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not enroll');
    }
    setEnrolling(false);
  }

  const isEnrolled = enrollment?.program_id === id && enrollment.status === 'active';
  const isCompleted = enrollment?.program_id === id && enrollment.status === 'completed';
  const hasOtherActiveEnrollment = !!enrollment && enrollment.program_id !== id && enrollment.status === 'active';

  if (loading || enrollmentLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.textPrimary} />
      </View>
    );
  }

  if (!program) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Program not found</Text>
      </View>
    );
  }

  const diffColor = DIFFICULTY_COLOR[program.difficulty] ?? '#888';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.name}>{program.name}</Text>

        <View style={styles.meta}>
          <View style={[styles.difficultyBadge, { backgroundColor: diffColor + '22', borderColor: diffColor + '55' }]}>
            <Text style={[styles.difficultyText, { color: diffColor }]}>
              {capitalize(program.difficulty)}
            </Text>
          </View>
          <Text style={styles.weeksText}>{program.weeks_count} weeks</Text>
        </View>

        {program.description ? (
          <Text style={styles.description}>{program.description}</Text>
        ) : null}

        <Text style={styles.sectionLabel}>Program Overview</Text>
        {program.program_weeks.map((week) => (
          <View key={week.week_number} style={styles.weekBlock}>
            <Text style={styles.weekTitle}>Week {week.week_number}</Text>
            {week.program_sessions.map((session) => (
              <View key={session.session_number} style={styles.sessionRow}>
                <Text style={styles.sessionNumber}>{session.session_number}</Text>
                <Text style={styles.sessionName}>{session.name}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        {isCompleted ? (
          <View style={[styles.button, styles.disabledButton]}>
            <Text style={styles.disabledButtonText}>Completed</Text>
          </View>
        ) : isEnrolled ? (
          <TouchableOpacity
            style={[styles.button, styles.continueButton]}
            onPress={() => router.push('/program/session')}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>
              Continue — Week {enrollment!.current_week}, Session {enrollment!.current_session}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, (enrolling || hasOtherActiveEnrollment) && styles.disabledButton]}
            onPress={handleEnroll}
            disabled={enrolling || hasOtherActiveEnrollment}
            activeOpacity={0.8}
          >
            <Text style={[styles.primaryButtonText, hasOtherActiveEnrollment && styles.disabledButtonText]}>
              {enrolling ? 'Enrolling...' : hasOtherActiveEnrollment ? 'Already in another program' : 'Enroll'}
            </Text>
          </TouchableOpacity>
        )}
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
  name: { color: Colors.textPrimary, fontSize: 26, fontWeight: '700', marginBottom: 12 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  difficultyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  difficultyText: { fontSize: 12, fontWeight: '600' },
  weeksText: { color: Colors.textSecondary, fontSize: 14 },
  description: { color: Colors.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 24 },
  sectionLabel: {
    color: Colors.textSecondary, fontSize: 12, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
  },
  weekBlock: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: Colors.border,
  },
  weekTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  sessionNumber: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.border,
    color: Colors.textSecondary, fontSize: 12, fontWeight: '600',
    textAlign: 'center', lineHeight: 22,
  },
  sessionName: { color: Colors.textSecondary, fontSize: 14 },
  errorText: { color: Colors.textSecondary, fontSize: 15 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, paddingBottom: 36, backgroundColor: Colors.bg,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  button: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  primaryButton: { backgroundColor: TEAL },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  continueButton: { borderWidth: 1, borderColor: TEAL },
  continueButtonText: { color: TEAL, fontSize: 16, fontWeight: '600' },
  disabledButton: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  disabledButtonText: { color: Colors.textSecondary, fontSize: 16, fontWeight: '600' },
});
