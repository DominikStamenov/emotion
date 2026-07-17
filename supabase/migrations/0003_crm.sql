begin;

create type public.inquiry_status as enum (
  'new',
  'reviewing',
  'qualified',
  'closed',
  'spam'
);

create type public.lead_status as enum (
  'new',
  'contacted',
  'qualified',
  'nurturing',
  'converted',
  'lost'
);

create type public.opportunity_stage as enum (
  'new_inquiry',
  'reviewing',
  'qualified',
  'discovery_scheduled',
  'proposal',
  'negotiation',
  'won',
  'lost'
);

create type public.activity_type as enum (
  'email',
  'call',
  'meeting',
  'note',
  'stage_change',
  'system'
);

create type public.task_status as enum (
  'open',
  'in_progress',
  'completed',
  'cancelled'
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  industry text,
  size_label text,
  billing_details jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  first_name text,
  last_name text,
  email text,
  phone text,
  job_title text,
  locale text,
  source text,
  consent_at timestamptz,
  marketing_consent_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index contacts_email_unique_idx
  on public.contacts (lower(email))
  where email is not null;

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.contacts(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  name text not null,
  email text not null,
  company text,
  message text not null,
  requested_services text[] not null default '{}',
  budget_range text,
  timeframe text,
  source text not null default 'website',
  status public.inquiry_status not null default 'new',
  consent_at timestamptz not null,
  marketing_consent boolean not null default false,
  attribution jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  assigned_to uuid references public.profiles(id) on delete set null,
  processed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid references public.inquiries(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  status public.lead_status not null default 'new',
  score integer not null default 0 check (score between 0 and 100),
  qualification jsonb not null default '{}'::jsonb,
  source text,
  owner_id uuid references public.profiles(id) on delete set null,
  next_action text,
  next_action_at timestamptz,
  converted_at timestamptz,
  lost_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  title text not null,
  stage public.opportunity_stage not null default 'new_inquiry',
  estimated_value numeric(14, 2) check (estimated_value is null or estimated_value >= 0),
  currency text not null default 'EUR' check (char_length(currency) = 3),
  probability integer not null default 10 check (probability between 0 and 100),
  owner_id uuid references public.profiles(id) on delete set null,
  next_step text,
  next_step_at timestamptz,
  expected_close_at date,
  won_at timestamptz,
  lost_at timestamptz,
  lost_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  activity_type public.activity_type not null,
  subject text not null,
  body text,
  contact_id uuid references public.contacts(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status public.task_status not null default 'open',
  priority integer not null default 2 check (priority between 1 and 4),
  assignee_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  contact_id uuid references public.contacts(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.normalize_contact_email()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.email = nullif(lower(trim(new.email)), '');
  return new;
end;
$$;

create trigger contacts_normalize_email
before insert or update of email on public.contacts
for each row execute function public.normalize_contact_email();

create trigger organizations_set_updated_at before update on public.organizations
for each row execute function public.set_updated_at();
create trigger contacts_set_updated_at before update on public.contacts
for each row execute function public.set_updated_at();
create trigger inquiries_set_updated_at before update on public.inquiries
for each row execute function public.set_updated_at();
create trigger leads_set_updated_at before update on public.leads
for each row execute function public.set_updated_at();
create trigger opportunities_set_updated_at before update on public.opportunities
for each row execute function public.set_updated_at();
create trigger tasks_set_updated_at before update on public.tasks
for each row execute function public.set_updated_at();
create trigger notes_set_updated_at before update on public.notes
for each row execute function public.set_updated_at();

create index inquiries_status_idx on public.inquiries (status, created_at desc);
create index leads_pipeline_idx on public.leads (status, owner_id, next_action_at);
create index opportunities_pipeline_idx on public.opportunities (stage, owner_id, next_step_at);
create index activities_contact_idx on public.activities (contact_id, occurred_at desc);
create index activities_opportunity_idx on public.activities (opportunity_id, occurred_at desc);
create index tasks_assignee_idx on public.tasks (assignee_id, status, due_at);

alter table public.organizations enable row level security;
alter table public.contacts enable row level security;
alter table public.inquiries enable row level security;
alter table public.leads enable row level security;
alter table public.opportunities enable row level security;
alter table public.activities enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;

create policy organizations_crm_access on public.organizations
for all to authenticated using (public.can_access_crm())
with check (public.can_access_crm());
create policy contacts_crm_access on public.contacts
for all to authenticated using (public.can_access_crm())
with check (public.can_access_crm());
create policy inquiries_crm_access on public.inquiries
for all to authenticated using (public.can_access_crm())
with check (public.can_access_crm());
create policy leads_crm_access on public.leads
for all to authenticated using (public.can_access_crm())
with check (public.can_access_crm());
create policy opportunities_crm_access on public.opportunities
for all to authenticated using (public.can_access_crm())
with check (public.can_access_crm());
create policy activities_crm_access on public.activities
for all to authenticated using (public.can_access_crm())
with check (public.can_access_crm());
create policy tasks_crm_access on public.tasks
for all to authenticated using (public.can_access_crm())
with check (public.can_access_crm());
create policy notes_crm_access on public.notes
for all to authenticated using (public.can_access_crm())
with check (public.can_access_crm());

grant select, insert, update, delete on public.organizations, public.contacts,
  public.inquiries, public.leads, public.opportunities, public.activities,
  public.tasks, public.notes to authenticated;

commit;
