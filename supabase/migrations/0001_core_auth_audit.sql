begin;

create extension if not exists pgcrypto with schema extensions;

create type public.app_role as enum (
  'owner',
  'admin',
  'editor',
  'sales',
  'viewer'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  role public.app_role not null default 'viewer',
  active boolean not null default false,
  last_seen_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'display_name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
    and active = true
  limit 1;
$$;

create or replace function public.has_app_role(required_roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() = any(required_roles), false);
$$;

create or replace function public.can_manage_content()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_app_role(array[
    'owner'::public.app_role,
    'admin'::public.app_role,
    'editor'::public.app_role
  ]);
$$;

create or replace function public.can_access_crm()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_app_role(array[
    'owner'::public.app_role,
    'admin'::public.app_role,
    'sales'::public.app_role
  ]);
$$;

create or replace function public.can_use_ai()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_app_role(array[
    'owner'::public.app_role,
    'admin'::public.app_role,
    'editor'::public.app_role,
    'sales'::public.app_role
  ]);
$$;

revoke all on function public.current_app_role() from public;
revoke all on function public.has_app_role(public.app_role[]) from public;
revoke all on function public.can_manage_content() from public;
revoke all on function public.can_access_crm() from public;
revoke all on function public.can_use_ai() from public;

grant execute on function public.current_app_role() to authenticated;
grant execute on function public.has_app_role(public.app_role[]) to authenticated;
grant execute on function public.can_manage_content() to authenticated;
grant execute on function public.can_access_crm() to authenticated;
grant execute on function public.can_use_ai() to authenticated;

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb not null default '{}'::jsonb,
  ip_hash text,
  created_at timestamptz not null default timezone('utc', now())
);

create index audit_logs_entity_idx
  on public.audit_logs (entity_type, entity_id, created_at desc);

create index audit_logs_actor_idx
  on public.audit_logs (actor_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_select_self_or_admin
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.has_app_role(array[
    'owner'::public.app_role,
    'admin'::public.app_role
  ])
);

create policy profiles_manage_admin
on public.profiles
for all
to authenticated
using (public.has_app_role(array[
  'owner'::public.app_role,
  'admin'::public.app_role
]))
with check (public.has_app_role(array[
  'owner'::public.app_role,
  'admin'::public.app_role
]));

create policy site_settings_public_read
on public.site_settings
for select
to anon, authenticated
using (is_public = true);

create policy site_settings_internal_read
on public.site_settings
for select
to authenticated
using (public.current_app_role() is not null);

create policy site_settings_manage_admin
on public.site_settings
for all
to authenticated
using (public.has_app_role(array[
  'owner'::public.app_role,
  'admin'::public.app_role
]))
with check (public.has_app_role(array[
  'owner'::public.app_role,
  'admin'::public.app_role
]));

create policy audit_logs_read_admin
on public.audit_logs
for select
to authenticated
using (public.has_app_role(array[
  'owner'::public.app_role,
  'admin'::public.app_role
]));

grant select on public.profiles to authenticated;
grant insert, update, delete on public.profiles to authenticated;
grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;
grant select on public.audit_logs to authenticated;

insert into public.site_settings (key, value, is_public)
values (
  'identity',
  jsonb_build_object(
    'domain', 'emotion.com',
    'contactEmail', 'info@emotion.com'
  ),
  true
)
on conflict (key) do update
set value = excluded.value,
    is_public = excluded.is_public;

commit;
