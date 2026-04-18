import { create } from 'zustand';
import { Movement } from '../types/movement';
import { ActiveWorkout, WorkoutExercise, WorkoutSet } from '../types/workout';

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function emptySet(): WorkoutSet {
  return { id: uid(), reps: '', weight: '', completed: false };
}

interface WorkoutStore {
  activeWorkout: ActiveWorkout | null;
  startWorkout: () => void;
  cancelWorkout: () => void;
  addExercise: (movement: Movement) => void;
  removeExercise: (exerciseId: string) => void;
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  updateSet: (exerciseId: string, setId: string, field: 'reps' | 'weight', value: string) => void;
  toggleSetComplete: (exerciseId: string, setId: string) => void;
}

export const useWorkoutStore = create<WorkoutStore>((set) => ({
  activeWorkout: null,

  startWorkout: () =>
    set({
      activeWorkout: { id: uid(), startedAt: new Date(), exercises: [] },
    }),

  cancelWorkout: () => set({ activeWorkout: null }),

  addExercise: (movement: Movement) =>
    set((state) => {
      if (!state.activeWorkout) return state;
      const exercise: WorkoutExercise = {
        id: uid(),
        movement,
        sets: [emptySet()],
      };
      return {
        activeWorkout: {
          ...state.activeWorkout,
          exercises: [...state.activeWorkout.exercises, exercise],
        },
      };
    }),

  removeExercise: (exerciseId: string) =>
    set((state) => {
      if (!state.activeWorkout) return state;
      return {
        activeWorkout: {
          ...state.activeWorkout,
          exercises: state.activeWorkout.exercises.filter((e) => e.id !== exerciseId),
        },
      };
    }),

  addSet: (exerciseId: string) =>
    set((state) => {
      if (!state.activeWorkout) return state;
      return {
        activeWorkout: {
          ...state.activeWorkout,
          exercises: state.activeWorkout.exercises.map((e) =>
            e.id === exerciseId ? { ...e, sets: [...e.sets, emptySet()] } : e
          ),
        },
      };
    }),

  removeSet: (exerciseId: string, setId: string) =>
    set((state) => {
      if (!state.activeWorkout) return state;
      return {
        activeWorkout: {
          ...state.activeWorkout,
          exercises: state.activeWorkout.exercises.map((e) =>
            e.id === exerciseId
              ? { ...e, sets: e.sets.filter((s) => s.id !== setId) }
              : e
          ),
        },
      };
    }),

  updateSet: (exerciseId: string, setId: string, field: 'reps' | 'weight', value: string) =>
    set((state) => {
      if (!state.activeWorkout) return state;
      return {
        activeWorkout: {
          ...state.activeWorkout,
          exercises: state.activeWorkout.exercises.map((e) =>
            e.id === exerciseId
              ? {
                  ...e,
                  sets: e.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)),
                }
              : e
          ),
        },
      };
    }),

  toggleSetComplete: (exerciseId: string, setId: string) =>
    set((state) => {
      if (!state.activeWorkout) return state;
      return {
        activeWorkout: {
          ...state.activeWorkout,
          exercises: state.activeWorkout.exercises.map((e) =>
            e.id === exerciseId
              ? {
                  ...e,
                  sets: e.sets.map((s) =>
                    s.id === setId ? { ...s, completed: !s.completed } : s
                  ),
                }
              : e
          ),
        },
      };
    }),
}));
