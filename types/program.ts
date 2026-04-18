export interface Program {
  id: string;
  name: string;
  description: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  weeks_count: number;
  is_member_only: boolean;
}

export interface ProgramExercise {
  id: string;
  sets: number;
  reps: string;
  rest_seconds: number | null;
  order_index: number;
  movements: { id: string; name: string; muscle_groups: string[] };
}

export interface ProgramSession {
  id: string;
  session_number: number;
  name: string;
  program_session_exercises: ProgramExercise[];
}

export interface UserEnrollment {
  id: string;
  program_id: string;
  status: 'active' | 'completed' | 'paused';
  current_week: number;
  current_session: number;
  enrolled_at: string;
  programs: Program;
}
