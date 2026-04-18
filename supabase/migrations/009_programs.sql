create table public.programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  weeks_count int not null,
  is_member_only boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.program_weeks (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  week_number int not null,
  name text,
  unique(program_id, week_number)
);

create table public.program_sessions (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references public.program_weeks(id) on delete cascade,
  session_number int not null,
  name text not null,
  unique(week_id, session_number)
);

create table public.program_session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.program_sessions(id) on delete cascade,
  movement_id uuid not null references public.movements(id),
  sets int not null,
  reps text not null,
  rest_seconds int,
  order_index int not null
);

create table public.user_program_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  program_id uuid not null references public.programs(id),
  status text not null default 'active' check (status in ('active', 'completed', 'paused')),
  current_week int not null default 1,
  current_session int not null default 1,
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz
);

create unique index one_active_enrollment on public.user_program_enrollments(user_id) where status = 'active';

alter table public.programs enable row level security;
alter table public.program_weeks enable row level security;
alter table public.program_sessions enable row level security;
alter table public.program_session_exercises enable row level security;
alter table public.user_program_enrollments enable row level security;

create policy "programs are public" on public.programs for select using (true);
create policy "program_weeks are public" on public.program_weeks for select using (true);
create policy "program_sessions are public" on public.program_sessions for select using (true);
create policy "program_exercises are public" on public.program_session_exercises for select using (true);

create policy "users can view own enrollments" on public.user_program_enrollments
  for select using (auth.uid() = user_id);
create policy "users can enroll" on public.user_program_enrollments
  for insert with check (auth.uid() = user_id);
create policy "users can update own enrollment" on public.user_program_enrollments
  for update using (auth.uid() = user_id);

DO $$
DECLARE
  v_prog_id uuid; v_week_id uuid; v_sess_id uuid; week_num int;
BEGIN
  -- BEGINNER STRENGTH
  INSERT INTO public.programs (name, description, difficulty, weeks_count)
  VALUES ('Beginner Strength',
    'A 4-week barbell program. Train 3 days/week with alternating A and B sessions.',
    'beginner', 4)
  RETURNING id INTO v_prog_id;
  FOR week_num IN 1..4 LOOP
    INSERT INTO public.program_weeks (program_id, week_number, name)
    VALUES (v_prog_id, week_num, 'Week ' || week_num) RETURNING id INTO v_week_id;
    INSERT INTO public.program_sessions (week_id, session_number, name)
    VALUES (v_week_id, 1, 'Session A') RETURNING id INTO v_sess_id;
    INSERT INTO public.program_session_exercises (session_id, movement_id, sets, reps, order_index)
    SELECT v_sess_id, id, 3, '5', 1 FROM public.movements WHERE name = 'Barbell Back Squat';
    INSERT INTO public.program_session_exercises (session_id, movement_id, sets, reps, order_index)
    SELECT v_sess_id, id, 3, '5', 2 FROM public.movements WHERE name = 'Barbell Bench Press';
    INSERT INTO public.program_session_exercises (session_id, movement_id, sets, reps, order_index)
    SELECT v_sess_id, id, 3, '5', 3 FROM public.movements WHERE name = 'Barbell Bent Over Row';
    INSERT INTO public.program_sessions (week_id, session_number, name)
    VALUES (v_week_id, 2, 'Session B') RETURNING id INTO v_sess_id;
    INSERT INTO public.program_session_exercises (session_id, movement_id, sets, reps, order_index)
    SELECT v_sess_id, id, 1, '5', 1 FROM public.movements WHERE name = 'Barbell Deadlift';
    INSERT INTO public.program_session_exercises (session_id, movement_id, sets, reps, order_index)
    SELECT v_sess_id, id, 3, '5', 2 FROM public.movements WHERE name = 'Barbell Overhead Press';
    INSERT INTO public.program_session_exercises (session_id, movement_id, sets, reps, order_index)
    SELECT v_sess_id, id, 3, 'AMRAP', 3 FROM public.movements WHERE name = 'Pull Up';
  END LOOP;

  -- BEGINNER CARDIO
  INSERT INTO public.programs (name, description, difficulty, weeks_count)
  VALUES ('Beginner Cardio',
    'Build your cardiovascular base over 4 weeks. Three sessions per week.',
    'beginner', 4)
  RETURNING id INTO v_prog_id;
  FOR week_num IN 1..4 LOOP
    INSERT INTO public.program_weeks (program_id, week_number, name)
    VALUES (v_prog_id, week_num, 'Week ' || week_num) RETURNING id INTO v_week_id;
    INSERT INTO public.program_sessions (week_id, session_number, name)
    VALUES (v_week_id, 1, 'Steady State Run') RETURNING id INTO v_sess_id;
    INSERT INTO public.program_session_exercises (session_id, movement_id, sets, reps, order_index)
    SELECT v_sess_id, id, 1, (week_num * 5 + 15) || ' min', 1 FROM public.movements WHERE name = 'Treadmill Run';
    INSERT INTO public.program_sessions (week_id, session_number, name)
    VALUES (v_week_id, 2, 'Rowing Intervals') RETURNING id INTO v_sess_id;
    INSERT INTO public.program_session_exercises (session_id, movement_id, sets, reps, order_index)
    SELECT v_sess_id, id, week_num + 3, '500m', 1 FROM public.movements WHERE name = 'Rowing Machine';
    INSERT INTO public.program_sessions (week_id, session_number, name)
    VALUES (v_week_id, 3, 'Bike & Core') RETURNING id INTO v_sess_id;
    INSERT INTO public.program_session_exercises (session_id, movement_id, sets, reps, order_index)
    SELECT v_sess_id, id, 1, '20 min', 1 FROM public.movements WHERE name = 'Stationary Bike';
    INSERT INTO public.program_session_exercises (session_id, movement_id, sets, reps, order_index)
    SELECT v_sess_id, id, 3, '30 sec', 2 FROM public.movements WHERE name = 'Plank';
    INSERT INTO public.program_session_exercises (session_id, movement_id, sets, reps, order_index)
    SELECT v_sess_id, id, 3, '12', 3 FROM public.movements WHERE name = 'Leg Raise';
  END LOOP;

  -- FLEXIBILITY & CORE
  INSERT INTO public.programs (name, description, difficulty, weeks_count)
  VALUES ('Flexibility & Core',
    'Improve mobility and build a strong foundation. Two sessions per week.',
    'beginner', 4)
  RETURNING id INTO v_prog_id;
  FOR week_num IN 1..4 LOOP
    INSERT INTO public.program_weeks (program_id, week_number, name)
    VALUES (v_prog_id, week_num, 'Week ' || week_num) RETURNING id INTO v_week_id;
    INSERT INTO public.program_sessions (week_id, session_number, name)
    VALUES (v_week_id, 1, 'Core Foundation') RETURNING id INTO v_sess_id;
    INSERT INTO public.program_session_exercises (session_id, movement_id, sets, reps, order_index)
    SELECT v_sess_id, id, 3, '30 sec', 1 FROM public.movements WHERE name = 'Plank';
    INSERT INTO public.program_session_exercises (session_id, movement_id, sets, reps, order_index)
    SELECT v_sess_id, id, 3, '10', 2 FROM public.movements WHERE name = 'Dead Bug';
    INSERT INTO public.program_session_exercises (session_id, movement_id, sets, reps, order_index)
    SELECT v_sess_id, id, 3, '12', 3 FROM public.movements WHERE name = 'Crunch';
    INSERT INTO public.program_sessions (week_id, session_number, name)
    VALUES (v_week_id, 2, 'Hip & Leg Mobility') RETURNING id INTO v_sess_id;
    INSERT INTO public.program_session_exercises (session_id, movement_id, sets, reps, order_index)
    SELECT v_sess_id, id, 3, '12', 1 FROM public.movements WHERE name = 'Hip Thrust';
    INSERT INTO public.program_session_exercises (session_id, movement_id, sets, reps, order_index)
    SELECT v_sess_id, id, 3, '10 each', 2 FROM public.movements WHERE name = 'Bulgarian Split Squat';
    INSERT INTO public.program_session_exercises (session_id, movement_id, sets, reps, order_index)
    SELECT v_sess_id, id, 3, '12', 3 FROM public.movements WHERE name = 'Leg Curl';
  END LOOP;
END $$;
