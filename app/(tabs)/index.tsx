import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useWorkoutSummary } from '../../hooks/useWorkoutSummary';
import { useWorkoutStore } from '../../store/workoutStore';
import { useNutritionLogs } from '../../hooks/useNutritionLogs';
import { useSleepLog, sleepDurationHours, formatDuration } from '../../hooks/useSleepLog';
import { useWellnessCheckin } from '../../hooks/useWellnessCheckin';
import { Colors } from '../../constants/colors';

const BLUE = '#4A90D9';
const GREEN = '#4CAF82';
const PURPLE = '#9B6FD4';
const ORANGE = '#E08C3A';

export default function HomeScreen() {
  const router = useRouter();
  const { summary: workoutSummary, loading: workoutLoading } = useWorkoutSummary();
  const { totals, loading: nutritionLoading } = useNutritionLogs();
  const { log: sleepLog, loading: sleepLoading } = useSleepLog();
  const { checkin, loading: wellnessLoading } = useWellnessCheckin();
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);

  function handleStartWorkout() {
    startWorkout();
    router.push('/workout/active');
  }

  const hasNutrition = totals.calories > 0 || totals.protein_g > 0 || totals.carbs_g > 0 || totals.fat_g > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Today</Text>

      {/* Workout card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.dot, { backgroundColor: BLUE }]} />
          <Text style={styles.cardTitle}>Workout</Text>
        </View>
        {workoutLoading ? (
          <ActivityIndicator color={Colors.textSecondary} style={{ marginTop: 12 }} />
        ) : workoutSummary && workoutSummary.workoutCount > 0 ? (
          <View style={styles.cardBody}>
            <View style={styles.statRow}>
              <Stat value={String(workoutSummary.workoutCount)} label={workoutSummary.workoutCount === 1 ? 'session' : 'sessions'} />
              <Stat value={String(workoutSummary.totalSets)} label={workoutSummary.totalSets === 1 ? 'set' : 'sets'} />
              <Stat value={String(workoutSummary.completedSets)} label="completed" />
            </View>
            {activeWorkout && (
              <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/workout/active')}>
                <Text style={styles.secondaryButtonText}>Resume workout</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.cardBody}>
            <Text style={styles.emptyText}>No workout logged today</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleStartWorkout}>
              <Text style={styles.primaryButtonText}>Start Workout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Nutrition card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.dot, { backgroundColor: GREEN }]} />
          <Text style={styles.cardTitle}>Nutrition</Text>
        </View>
        {nutritionLoading ? (
          <ActivityIndicator color={Colors.textSecondary} style={{ marginTop: 12 }} />
        ) : hasNutrition ? (
          <View style={styles.cardBody}>
            <View style={styles.statRow}>
              <Stat value={String(totals.calories)} label="kcal" />
              <Stat value={`${totals.protein_g.toFixed(0)}g`} label="protein" />
              <Stat value={`${totals.carbs_g.toFixed(0)}g`} label="carbs" />
              <Stat value={`${totals.fat_g.toFixed(0)}g`} label="fat" />
            </View>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/nutrition/add-meal')}>
              <Text style={styles.secondaryButtonText}>Log another meal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cardBody}>
            <Text style={styles.emptyText}>No meals logged today</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/nutrition/add-meal')}>
              <Text style={styles.primaryButtonText}>Log Meal</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Sleep card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.dot, { backgroundColor: PURPLE }]} />
          <Text style={styles.cardTitle}>Sleep</Text>
        </View>
        {sleepLoading ? (
          <ActivityIndicator color={Colors.textSecondary} style={{ marginTop: 12 }} />
        ) : sleepLog ? (
          <View style={styles.cardBody}>
            <View style={styles.statRow}>
              <Stat value={formatDuration(sleepDurationHours(sleepLog))} label="duration" />
              <Stat value={`${sleepLog.quality}/5`} label="quality" />
            </View>
          </View>
        ) : (
          <View style={styles.cardBody}>
            <Text style={styles.emptyText}>No sleep logged today</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/sleep/log-sleep')}>
              <Text style={styles.primaryButtonText}>Log Sleep</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Wellness card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.dot, { backgroundColor: ORANGE }]} />
          <Text style={styles.cardTitle}>Wellness</Text>
        </View>
        {wellnessLoading ? (
          <ActivityIndicator color={Colors.textSecondary} style={{ marginTop: 12 }} />
        ) : checkin ? (
          <View style={styles.cardBody}>
            <View style={styles.statRow}>
              <Stat value={`${checkin.mood}/5`} label="mood" />
              <Stat value={`${checkin.energy}/5`} label="energy" />
            </View>
          </View>
        ) : (
          <View style={styles.cardBody}>
            <Text style={styles.emptyText}>No check-in today</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/wellness/checkin')}>
              <Text style={styles.primaryButtonText}>Check In</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function PlaceholderCard({ title, color }: { title: string; color: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.emptyText}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  cardBody: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
  },
  stat: {
    gap: 2,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '600',
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: Colors.chipActiveBg,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  primaryButtonText: {
    color: Colors.chipActiveText,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
});
