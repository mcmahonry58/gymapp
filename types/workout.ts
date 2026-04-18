import { Movement } from './movement';

export interface WorkoutSet {
  id: string;
  reps: string;
  weight: string;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  movement: Movement;
  sets: WorkoutSet[];
}

export interface ActiveWorkout {
  id: string;
  startedAt: Date;
  exercises: WorkoutExercise[];
}
