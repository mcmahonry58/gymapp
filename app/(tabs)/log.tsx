import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useWorkoutStore } from '../../store/workoutStore';
import { Colors } from '../../constants/colors';

const GREEN = '#4CAF82';
const BLUE = '#4A90D9';
const PURPLE = '#9B6FD4';
const ORANGE = '#E08C3A';

export default function LogScreen() {
  const router = useRouter();
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);

  function handleStartWorkout() {
    startWorkout();
    router.push('/workout/active');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Log</Text>

      {activeWorkout ? (
        <LogOption
          color={BLUE}
          title="Resume Workout"
          subtitle="You have an active workout"
          onPress={() => router.push('/workout/active')}
        />
      ) : (
        <LogOption
          color={BLUE}
          title="Start Workout"
          subtitle="Log sets and exercises"
          onPress={handleStartWorkout}
        />
      )}

      <LogOption
        color={GREEN}
        title="Log Meal"
        subtitle="Track calories and macros"
        onPress={() => router.push('/nutrition/add-meal')}
      />

      <LogOption
        color={PURPLE}
        title="Log Sleep"
        subtitle="Bedtime, wake time, quality"
        onPress={() => router.push('/sleep/log-sleep')}
      />

      <LogOption
        color={ORANGE}
        title="Wellness Check-in"
        subtitle="Mood and energy levels"
        onPress={() => router.push('/wellness/checkin')}
      />
    </View>
  );
}

function LogOption({
  color,
  title,
  subtitle,
  onPress,
}: {
  color: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.option} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={styles.optionText}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    padding: 20,
  },
  heading: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionText: {
    gap: 3,
  },
  optionTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  optionSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
});
