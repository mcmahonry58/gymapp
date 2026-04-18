alter table public.users
  add column if not exists expo_push_token text;

create policy "users can update own profile" on public.users
  for update using (auth.uid() = id);
