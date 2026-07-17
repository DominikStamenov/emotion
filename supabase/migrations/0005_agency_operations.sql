begin;

create type public.proposal_status as enum (
  'draft',
  'sent',
  'accepted',
  'rejected',
  'expired'
);
create type public.engagement_status as enum (
  'planning',
  'active',
  'on_hold',
  'completed',
  'cancelled'
);
create type public.deliverable_status as enum (
  'planned',
  'in_progress',
  'review',
  'approved',
  'delivered'
);
create type public.job_status as enum (
  'queued',
  'running',
  'completed',
  'failed',
  'cancelled'
);
create type public.email_delivery_status as enum (
  'queued',
  'sent',
  'delivered',
  'bounced',
  'complained',
  'failed'
);

create table public.redirects (
  id uuid primary key default gen_random_uuid(),
  source_path text not null unique check (source_path like '/%'),
  target_path text not null,
  status_code smallint not null default 308 check (status_code in (301, 302, 307, 308)),
  active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.content_tags (
  entity_type text not null,
  entity_id uuid not null,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (entity_type, entity_id, tag_id)
);

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  media_asset_id uuid not null references public.media_assets(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  label text,
  is_private boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  version integer not null default 1 check (version > 0),
  title text not null,
  status public.proposal_status not null default 'draft',
  content jsonb not null default '{}'::jsonb,
  amount numeric(14, 2) check (amount is null or amount >= 0),
  currency text not null default 'EUR' check (char_length(currency) = 3),
  sent_at timestamptz,
  expires_at timestamptz,
  accepted_at timestamptz,
  rejected_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (opportunity_id, version)
);

create table public.engagements (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references public.opportunities(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  primary_contact_id uuid references public.contacts(id) on delete set null,
  title text not null,
  status public.engagement_status not null default 'planning',
  start_date date,
  target_end_date date,
  completed_at timestamptz,
  budget numeric(14, 2) check (budget is null or budget >= 0),
  currency text not null default 'EUR' check (char_length(currency) = 3),
  summary text,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.deliverables (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  title text not null,
  description text,
  status public.deliverable_status not null default 'planned',
  position integer not null default 0,
  due_at timestamptz,
  delivered_at timestamptz,
  approved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.client_portal_access (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  access_role text not null default 'client',
  active boolean not null default true,
  invited_at timestamptz not null default timezone('utc', now()),
  last_accessed_at timestamptz,
  unique (engagement_id, user_id)
);

create table public.legal_documents (
  id uuid primary key default gen_random_uuid(),
  document_type text not null,
  locale text not null default 'en',
  version integer not null check (version > 0),
  title text not null,
  content jsonb not null default '{}'::jsonb,
  status public.content_status not null default 'draft',
  effective_at timestamptz,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (document_type, locale, version)
);

create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.contacts(id) on delete set null,
  inquiry_id uuid references public.inquiries(id) on delete set null,
  legal_document_id uuid references public.legal_documents(id) on delete set null,
  visitor_session_hash text,
  consent_type text not null,
  granted boolean not null,
  ip_hash text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.web_events (
  id bigint generated always as identity primary key,
  event_name text not null,
  path text not null,
  visitor_session_hash text,
  contact_id uuid references public.contacts(id) on delete set null,
  inquiry_id uuid references public.inquiries(id) on delete set null,
  referrer text,
  attribution jsonb not null default '{}'::jsonb,
  properties jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc', now())
);

create table public.automation_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null,
  status public.job_status not null default 'queued',
  payload jsonb not null default '{}'::jsonb,
  result jsonb,
  attempts integer not null default 0 check (attempts >= 0),
  max_attempts integer not null default 3 check (max_attempts > 0),
  run_at timestamptz not null default timezone('utc', now()),
  started_at timestamptz,
  completed_at timestamptz,
  last_error text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.email_deliveries (
  id uuid primary key default gen_random_uuid(),
  template_key text not null,
  recipient_hash text not null,
  provider_message_id text,
  status public.email_delivery_status not null default 'queued',
  inquiry_id uuid references public.inquiries(id) on delete set null,
  conversation_id uuid references public.ai_conversations(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.rate_limit_buckets (
  key_hash text not null,
  action text not null,
  window_started_at timestamptz not null default timezone('utc', now()),
  request_count integer not null default 0 check (request_count >= 0),
  blocked_until timestamptz,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (key_hash, action)
);

create or replace function public.consume_rate_limit(
  p_key_hash text,
  p_action text,
  p_max_requests integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_time timestamptz := timezone('utc', now());
  allowed boolean;
begin
  if p_max_requests < 1 or p_window_seconds < 1 then
    raise exception 'Invalid rate limit configuration';
  end if;

  insert into public.rate_limit_buckets (
    key_hash,
    action,
    window_started_at,
    request_count,
    updated_at
  )
  values (p_key_hash, p_action, current_time, 1, current_time)
  on conflict (key_hash, action) do update
  set
    window_started_at = case
      when rate_limit_buckets.window_started_at
        + make_interval(secs => p_window_seconds) <= current_time
      then current_time
      else rate_limit_buckets.window_started_at
    end,
    request_count = case
      when rate_limit_buckets.window_started_at
        + make_interval(secs => p_window_seconds) <= current_time
      then 1
      else rate_limit_buckets.request_count + 1
    end,
    blocked_until = case
      when rate_limit_buckets.window_started_at
        + make_interval(secs => p_window_seconds) <= current_time
      then null
      when rate_limit_buckets.request_count + 1 > p_max_requests
      then current_time + make_interval(secs => p_window_seconds)
      else rate_limit_buckets.blocked_until
    end,
    updated_at = current_time
  returning
    request_count <= p_max_requests
    and (blocked_until is null or blocked_until <= current_time)
  into allowed;

  return allowed;
end;
$$;

create or replace function public.submit_public_inquiry(
  p_name text,
  p_email text,
  p_company text,
  p_message text,
  p_requested_services text[],
  p_budget_range text,
  p_timeframe text,
  p_marketing_consent boolean,
  p_attribution jsonb,
  p_metadata jsonb,
  p_ip_hash text,
  p_user_agent text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(trim(p_email));
  normalized_company text := nullif(trim(p_company), '');
  contact_uuid uuid;
  organization_uuid uuid;
  inquiry_uuid uuid;
begin
  if char_length(trim(p_name)) < 2
    or char_length(normalized_email) < 5
    or char_length(trim(p_message)) < 20 then
    raise exception 'Invalid inquiry';
  end if;

  select id into contact_uuid
  from public.contacts
  where lower(email) = normalized_email
  limit 1;

  if normalized_company is not null then
    select id into organization_uuid
    from public.organizations
    where lower(name) = lower(normalized_company)
    order by created_at
    limit 1;

    if organization_uuid is null then
      insert into public.organizations (name)
      values (normalized_company)
      returning id into organization_uuid;
    end if;
  end if;

  if contact_uuid is null then
    insert into public.contacts (
      organization_id,
      first_name,
      email,
      source,
      consent_at,
      marketing_consent_at
    )
    values (
      organization_uuid,
      trim(p_name),
      normalized_email,
      'website',
      timezone('utc', now()),
      case when p_marketing_consent then timezone('utc', now()) end
    )
    returning id into contact_uuid;
  else
    update public.contacts
    set
      organization_id = coalesce(organization_id, organization_uuid),
      first_name = coalesce(nullif(first_name, ''), trim(p_name)),
      consent_at = timezone('utc', now()),
      marketing_consent_at = case
        when p_marketing_consent then timezone('utc', now())
        else marketing_consent_at
      end
    where id = contact_uuid;
  end if;

  insert into public.inquiries (
    contact_id,
    organization_id,
    name,
    email,
    company,
    message,
    requested_services,
    budget_range,
    timeframe,
    source,
    consent_at,
    marketing_consent,
    attribution,
    metadata
  )
  values (
    contact_uuid,
    organization_uuid,
    trim(p_name),
    normalized_email,
    normalized_company,
    trim(p_message),
    coalesce(p_requested_services, '{}'),
    nullif(trim(p_budget_range), ''),
    nullif(trim(p_timeframe), ''),
    'website',
    timezone('utc', now()),
    p_marketing_consent,
    coalesce(p_attribution, '{}'::jsonb),
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into inquiry_uuid;

  insert into public.consent_records (
    contact_id,
    inquiry_id,
    consent_type,
    granted,
    ip_hash,
    user_agent,
    metadata
  )
  values (
    contact_uuid,
    inquiry_uuid,
    'inquiry_processing',
    true,
    p_ip_hash,
    p_user_agent,
    jsonb_build_object('marketing', p_marketing_consent)
  );

  return inquiry_uuid;
end;
$$;

create index content_tags_entity_idx on public.content_tags (entity_type, entity_id);
create index attachments_entity_idx on public.attachments (entity_type, entity_id);
create index proposals_opportunity_idx on public.proposals (opportunity_id, status);
create index engagements_status_idx on public.engagements (status, owner_id);
create index deliverables_engagement_idx on public.deliverables (engagement_id, position);
create index consent_records_subject_idx on public.consent_records (contact_id, inquiry_id, created_at desc);
create index web_events_lookup_idx on public.web_events (event_name, occurred_at desc);
create index web_events_session_idx on public.web_events (visitor_session_hash, occurred_at desc);
create index automation_jobs_queue_idx on public.automation_jobs (status, run_at);
create index email_deliveries_status_idx on public.email_deliveries (status, created_at desc);

create trigger redirects_set_updated_at before update on public.redirects
for each row execute function public.set_updated_at();
create trigger tags_set_updated_at before update on public.tags
for each row execute function public.set_updated_at();
create trigger proposals_set_updated_at before update on public.proposals
for each row execute function public.set_updated_at();
create trigger engagements_set_updated_at before update on public.engagements
for each row execute function public.set_updated_at();
create trigger deliverables_set_updated_at before update on public.deliverables
for each row execute function public.set_updated_at();
create trigger legal_documents_set_updated_at before update on public.legal_documents
for each row execute function public.set_updated_at();
create trigger automation_jobs_set_updated_at before update on public.automation_jobs
for each row execute function public.set_updated_at();
create trigger email_deliveries_set_updated_at before update on public.email_deliveries
for each row execute function public.set_updated_at();
create trigger rate_limit_buckets_set_updated_at before update on public.rate_limit_buckets
for each row execute function public.set_updated_at();

create or replace function public.capture_content_revision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_revision integer;
begin
  select coalesce(max(revision), 0) + 1
  into next_revision
  from public.content_revisions
  where entity_type = tg_table_name
    and entity_id = old.id;

  insert into public.content_revisions (
    entity_type,
    entity_id,
    revision,
    snapshot,
    created_by
  )
  values (
    tg_table_name,
    old.id,
    next_revision,
    to_jsonb(old),
    auth.uid()
  );

  return new;
end;
$$;

create trigger pages_capture_revision before update on public.pages
for each row execute function public.capture_content_revision();
create trigger services_capture_revision before update on public.services
for each row execute function public.capture_content_revision();
create trigger projects_capture_revision before update on public.projects
for each row execute function public.capture_content_revision();
create trigger testimonials_capture_revision before update on public.testimonials
for each row execute function public.capture_content_revision();
create trigger people_capture_revision before update on public.people
for each row execute function public.capture_content_revision();
create trigger insights_capture_revision before update on public.insights
for each row execute function public.capture_content_revision();

create or replace function public.capture_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  old_data jsonb;
  new_data jsonb;
  record_id text;
begin
  if tg_op <> 'INSERT' then
    old_data = to_jsonb(old);
  end if;
  if tg_op <> 'DELETE' then
    new_data = to_jsonb(new);
  end if;

  record_id = coalesce(new_data ->> 'id', old_data ->> 'id');

  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    before_data,
    after_data
  )
  values (
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    record_id,
    old_data,
    new_data
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create trigger pages_audit after insert or update or delete on public.pages
for each row execute function public.capture_audit_log();
create trigger projects_audit after insert or update or delete on public.projects
for each row execute function public.capture_audit_log();
create trigger insights_audit after insert or update or delete on public.insights
for each row execute function public.capture_audit_log();
create trigger inquiries_audit after insert or update or delete on public.inquiries
for each row execute function public.capture_audit_log();
create trigger leads_audit after insert or update or delete on public.leads
for each row execute function public.capture_audit_log();
create trigger opportunities_audit after insert or update or delete on public.opportunities
for each row execute function public.capture_audit_log();
create trigger proposals_audit after insert or update or delete on public.proposals
for each row execute function public.capture_audit_log();
create trigger engagements_audit after insert or update or delete on public.engagements
for each row execute function public.capture_audit_log();
create trigger legal_documents_audit after insert or update or delete on public.legal_documents
for each row execute function public.capture_audit_log();

create or replace function public.capture_opportunity_stage_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.stage is distinct from new.stage then
    insert into public.activities (
      activity_type,
      subject,
      opportunity_id,
      actor_id,
      metadata
    )
    values (
      'stage_change',
      'Opportunity stage changed',
      new.id,
      auth.uid(),
      jsonb_build_object('from', old.stage, 'to', new.stage)
    );
  end if;

  return new;
end;
$$;

create trigger opportunities_capture_stage
after update of stage on public.opportunities
for each row execute function public.capture_opportunity_stage_change();

alter table public.redirects enable row level security;
alter table public.tags enable row level security;
alter table public.content_tags enable row level security;
alter table public.attachments enable row level security;
alter table public.proposals enable row level security;
alter table public.engagements enable row level security;
alter table public.deliverables enable row level security;
alter table public.client_portal_access enable row level security;
alter table public.legal_documents enable row level security;
alter table public.consent_records enable row level security;
alter table public.web_events enable row level security;
alter table public.automation_jobs enable row level security;
alter table public.email_deliveries enable row level security;
alter table public.rate_limit_buckets enable row level security;

create policy redirects_public_read on public.redirects
for select to anon, authenticated using (active = true);
create policy redirects_manage on public.redirects
for all to authenticated using (public.can_manage_content())
with check (public.can_manage_content());

create policy tags_public_read on public.tags
for select to anon, authenticated using (true);
create policy tags_manage on public.tags
for all to authenticated using (public.can_manage_content())
with check (public.can_manage_content());
create policy content_tags_public_read on public.content_tags
for select to anon, authenticated using (true);
create policy content_tags_manage on public.content_tags
for all to authenticated using (public.can_manage_content())
with check (public.can_manage_content());

create policy attachments_internal_access on public.attachments
for all to authenticated
using (public.can_manage_content() or public.can_access_crm())
with check (public.can_manage_content() or public.can_access_crm());

create policy proposals_crm_access on public.proposals
for all to authenticated using (public.can_access_crm())
with check (public.can_access_crm());
create policy engagements_crm_access on public.engagements
for all to authenticated using (public.can_access_crm())
with check (public.can_access_crm());
create policy deliverables_crm_access on public.deliverables
for all to authenticated using (public.can_access_crm())
with check (public.can_access_crm());
create policy client_portal_access_admin on public.client_portal_access
for all to authenticated
using (public.has_app_role(array['owner'::public.app_role, 'admin'::public.app_role]))
with check (public.has_app_role(array['owner'::public.app_role, 'admin'::public.app_role]));

create policy legal_documents_public_read on public.legal_documents
for select to anon, authenticated
using (status = 'published' and published_at <= timezone('utc', now()));
create policy legal_documents_internal_read on public.legal_documents
for select to authenticated using (public.current_app_role() is not null);
create policy legal_documents_manage on public.legal_documents
for all to authenticated using (public.can_manage_content())
with check (public.can_manage_content());

create policy consent_records_crm_access on public.consent_records
for all to authenticated using (public.can_access_crm())
with check (public.can_access_crm());
create policy web_events_internal_read on public.web_events
for select to authenticated using (public.can_access_crm());
create policy automation_jobs_admin_access on public.automation_jobs
for all to authenticated
using (public.has_app_role(array['owner'::public.app_role, 'admin'::public.app_role]))
with check (public.has_app_role(array['owner'::public.app_role, 'admin'::public.app_role]));
create policy email_deliveries_crm_access on public.email_deliveries
for select to authenticated using (public.can_access_crm());

grant select on public.redirects, public.tags, public.content_tags,
  public.legal_documents to anon, authenticated;
grant insert, update, delete on public.redirects, public.tags,
  public.content_tags, public.legal_documents to authenticated;
grant select, insert, update, delete on public.attachments, public.proposals,
  public.engagements, public.deliverables, public.client_portal_access,
  public.consent_records, public.automation_jobs to authenticated;
grant select on public.web_events, public.email_deliveries to authenticated;
grant usage, select on sequence public.web_events_id_seq to authenticated;

create unique index if not exists leads_inquiry_unique_idx
on public.leads (inquiry_id)
where inquiry_id is not null;

create unique index if not exists opportunities_lead_unique_idx
on public.opportunities (lead_id)
where lead_id is not null;

create or replace function public.qualify_inquiry(
  p_inquiry_id uuid,
  p_owner_id uuid default null
)
returns uuid
language plpgsql
set search_path = public
as $$
declare
  v_inquiry public.inquiries%rowtype;
  v_lead_id uuid;
  v_opportunity_id uuid;
  v_owner_id uuid := coalesce(p_owner_id, auth.uid());
begin
  if not public.can_access_crm() then
    raise exception 'CRM access required' using errcode = '42501';
  end if;

  if p_owner_id is not null
     and p_owner_id <> auth.uid()
     and not public.has_app_role(array['owner'::public.app_role, 'admin'::public.app_role]) then
    raise exception 'Only administrators can assign another owner' using errcode = '42501';
  end if;

  select * into v_inquiry
  from public.inquiries
  where id = p_inquiry_id
  for update;

  if not found then
    raise exception 'Inquiry not found' using errcode = 'P0002';
  end if;

  if v_inquiry.status in ('closed', 'spam') then
    raise exception 'Closed or spam inquiries cannot be qualified';
  end if;

  select id into v_lead_id
  from public.leads
  where inquiry_id = p_inquiry_id;

  if v_lead_id is null then
    insert into public.leads (
      inquiry_id,
      contact_id,
      organization_id,
      status,
      score,
      source,
      owner_id,
      next_action
    ) values (
      p_inquiry_id,
      v_inquiry.contact_id,
      v_inquiry.organization_id,
      'qualified',
      60,
      v_inquiry.source,
      v_owner_id,
      'Schedule discovery conversation'
    )
    returning id into v_lead_id;
  end if;

  select id into v_opportunity_id
  from public.opportunities
  where lead_id = v_lead_id;

  if v_opportunity_id is null then
    insert into public.opportunities (
      lead_id,
      contact_id,
      organization_id,
      title,
      stage,
      probability,
      owner_id,
      next_step
    ) values (
      v_lead_id,
      v_inquiry.contact_id,
      v_inquiry.organization_id,
      coalesce(nullif(v_inquiry.company, ''), v_inquiry.name) || ' — digital engagement',
      'qualified',
      35,
      v_owner_id,
      'Discovery and opportunity framing'
    )
    returning id into v_opportunity_id;
  end if;

  update public.inquiries
  set status = 'qualified',
      assigned_to = v_owner_id,
      processed_at = timezone('utc', now())
  where id = p_inquiry_id;

  insert into public.activities (
    activity_type,
    subject,
    contact_id,
    organization_id,
    lead_id,
    opportunity_id,
    actor_id,
    metadata
  ) values (
    'stage_change',
    'Inquiry qualified and moved to CRM pipeline',
    v_inquiry.contact_id,
    v_inquiry.organization_id,
    v_lead_id,
    v_opportunity_id,
    v_owner_id,
    jsonb_build_object('inquiry_id', p_inquiry_id)
  );

  return v_opportunity_id;
end;
$$;

revoke all on function public.consume_rate_limit(text, text, integer, integer)
from public;
revoke all on function public.submit_public_inquiry(
  text,
  text,
  text,
  text,
  text[],
  text,
  text,
  boolean,
  jsonb,
  jsonb,
  text,
  text
) from public;
revoke all on function public.qualify_inquiry(uuid, uuid) from public;
grant execute on function public.consume_rate_limit(text, text, integer, integer)
to service_role;
grant execute on function public.submit_public_inquiry(
  text,
  text,
  text,
  text,
  text[],
  text,
  text,
  boolean,
  jsonb,
  jsonb,
  text,
  text
) to service_role;
grant execute on function public.qualify_inquiry(uuid, uuid) to authenticated;

commit;
