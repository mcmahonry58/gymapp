import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useWorkoutStore } from '../../store/workoutStore';
import { saveWorkout } from '../../lib/workoutService';
import { Colors } from '../../constants/colors';
import { WorkoutExercise, WorkoutSet } from '../../types/workout';

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const { activeWorkout, cancelWorkout, addSet, removeSet, updateSet, toggleSetComplete } =
    useWorkoutStore();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!activeWorkout) router.back();
  }, [activeWorkout, router]);

  function handleCancel() {
    Alert.alert('Cancel Workout', 'Discard this workout?', [
      { text: 'Keep Going', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          cancelWorkout();
          router.back();
        },
      },
    ]);
  }

  async function handleFinish() {
    if (!activeWorkout) return;
    if (activeWorkout.exercises.length === 0) {
      Alert.alert('No exercises', 'Add at least one exercise before finishing.');
      return;
    }
    setSaving(true);
    try {
      await saveWorkout(activeWorkout);
      cancelWorkout();
      router.replace('/(tabs)/log');
    } catch {
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (!activeWorkout) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Active Workout</Text>
        <TouchableOpacity onPress={handleFinish} style={styles.headerButton} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={Colors.textPrimary} size="small" />
          ) : (
            <Text style={styles.finishText}>Finish</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeWorkout.exercises.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No exercises yet</Text>
            <Text style={styles.emptyHint}>Tap Add Exercise to get started</Text>
          </View>
        ) : (
          activeWorkout.exercises.map((exercise) => (
            <ExerciseBlock
              key={exercise.id}
              exercise={exercise}
              onAddSet={() => addSet(exercise.id)}
              onRemoveSet={(setId) => removeSet(exercise.id, setId)}
              onUpdateSet={(setId, field, value) => updateSet(exercise.id, setId, field, value)}
              onToggleSet={(setId) => toggleSetComplete(exercise.id, setId)}
            />
          ))
        )}

        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() => router.push('/workout/add-exercise')}
        >
          <Text style={styles.addExerciseText}>+ Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function ExerciseBlock({
  exercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onToggleSet,
}: {
  exercise: WorkoutExercise;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onUpdateSet: (setId: string, field: 'reps' | 'weight', value: string) => void;
  onToggleSet: (setId: string) => void;
}) {
  return (
    <View style={styles.exerciseBlock}>
      <Text style={styles.exerciseName}>{exercise.movement.name}</Text>

      {/* Set column headers */}
      <View style={styles.setHeader}>
        <Text style={[styles.setHeaderText, styles.setNumCol]}>Set</Text>
        <Text style={[styles.setHeaderText, styles.setInputCol]}>Reps</Text>
        <Text style={[styles.setHeaderText, styles.setInputCol]}>kg</Text>
        <View style={styles.setCheckCol} />
      </View>

      {exercise.sets.map((s, index) => (
        <SetRow
          key={s.id}
          set={s}
          index={index}
          onRemove={() => onRemoveSet(s.id)}
          onUpdate={(field, value) => onUpdateSet(s.id, field, value)}
          onToggle={() => onToggleSet(s.id)}
        />
      ))}

      <TouchableOpacity style={styles.addSetButton} onPress={onAddSet}>
        <Text style={styles.addSetText}>+ Add Set</Text>
      </TouchableOpacity>
    </View>
  );
}

function SetRow({
  set,
  index,
  onRemove,
  onUpdate,
  onToggle,
}: {
  set: WorkoutSet;
  index: number;
  onRemove: () => void;
  onUpdate: (field: 'reps' | 'weight', value: string) => void;
  onToggle: () => void;
}) {
  return (
    <View style={[styles.setRow, set.completed && styles.setRowComplete]}>
      <Text style={[styles.setNumCol, styles.setNum]}>{index + 1}</Text>
      <TextInput
        style={[styles.setInputCol, styles.setInput]}
        value={set.reps}
        onChangeText={(v) => onUpdate('reps', v)}
        placeholder="—"
        placeholderTextColor={Colors.textSecondary}
        keyboardType="numeric"
        maxLength={4}
      />
      <TextInput
        style={[styles.setInputCol, styles.setInput]}
        value={set.weight}
        onChangeText={(v) => onUpdate('weight', v)}
        placeholder="—"
        placeholderTextColor={Colors.textSecondary}
        keyboardType="decimal-pad"
        maxLength={6}
      />
      <TouchableOpacity style={styles.setCheckCol} onPress={onToggle}>
        <View style={[styles.checkBox, set.completed && styles.checkBoxDone]}>
          {set.completed && <Text style={styles.checkMark}>✓</Text>}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    minWidth: 64,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  finishText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'right',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyHint: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  exerciseBlock: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exerciseName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  setHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  setHeaderText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
  },
  setRowComplete: {
    opacity: 0.45,
  },
  setNumCol: {
    width: 32,
  },
  setInputCol: {
    flex: 1,
    marginRight: 8,
  },
  setCheckCol: {
    width: 36,
    alignItems: 'flex-end',
  },
  setNum: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  setInput: {
    backgroundColor: Colors.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: 10,
    paddingVertical: 7,
    textAlign: 'center',
  },
  checkBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxDone: {
    backgroundColor: Colors.chipActiveBg,
    borderColor: Colors.chipActiveBg,
  },
  checkMark: {
    color: Colors.chipActiveText,
    fontSize: 14,
    fontWeight: '600',
  },
  addSetButton: {
    marginTop: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  addSetText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  addExerciseButton: {
    marginTop: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  addExerciseText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
});
