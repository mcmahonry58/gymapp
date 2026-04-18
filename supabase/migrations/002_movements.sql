-- Movements table (seeded exercise library)
create table public.movements (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  instructions text,
  muscle_groups text[] not null default '{}',
  equipment text[] not null default '{}',
  is_member_only boolean not null default false,
  video_url text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.movements enable row level security;

-- All authenticated users can read movements
create policy "Authenticated users can read movements"
  on public.movements for select
  to authenticated
  using (true);

-- Only admins can insert/update/delete (enforced at app layer via Edge Functions)
-- No insert/update/delete policies for regular users

-- Indexes for filtering
create index idx_movements_muscle_groups on public.movements using gin (muscle_groups);
create index idx_movements_equipment on public.movements using gin (equipment);
create index idx_movements_name on public.movements using gin (to_tsvector('english', name));
