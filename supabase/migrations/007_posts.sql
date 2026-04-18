create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  content text not null check (char_length(content) >= 1 and char_length(content) <= 1000),
  workout_log_id uuid references public.workout_logs(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "posts are public" on public.posts
  for select using (true);

create policy "users can create posts" on public.posts
  for insert with check (auth.uid() = user_id);

create policy "users can delete own posts" on public.posts
  for delete using (auth.uid() = user_id);

create index posts_created_at_desc on public.posts (created_at desc);
create index posts_user_id on public.posts (user_id);
