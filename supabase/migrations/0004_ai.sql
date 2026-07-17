begin;

create extension if not exists vector with schema extensions;

create type public.knowledge_visibility as enum ('public', 'internal');
create type public.ai_conversation_status as enum (
  'active',
  'handoff_requested',
  'closed',
  'blocked'
);
create type public.ai_message_role as enum (
  'system',
  'user',
  'assistant',
  'tool'
);

create table public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_id uuid,
  title text not null,
  content text not null,
  content_hash text not null,
  locale text not null default 'en',
  visibility public.knowledge_visibility not null default 'public',
  status public.content_status not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  embedding extensions.vector(1536),
  embedded_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (source_type, source_id, content_hash)
);

create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  channel text not null default 'web',
  status public.ai_conversation_status not null default 'active',
  visitor_session_hash text,
  contact_id uuid references public.contacts(id) on delete set null,
  inquiry_id uuid references public.inquiries(id) on delete set null,
  owner_id uuid references public.profiles(id) on delete set null,
  summary text,
  qualification jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  last_message_at timestamptz,
  handoff_requested_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role public.ai_message_role not null,
  content text not null,
  citations jsonb not null default '[]'::jsonb,
  safety jsonb not null default '{}'::jsonb,
  model text,
  prompt_version text,
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.ai_feedback (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.ai_messages(id) on delete cascade,
  rating smallint check (rating in (-1, 1)),
  reason text,
  submitted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.prompt_versions (
  id uuid primary key default gen_random_uuid(),
  prompt_key text not null,
  version integer not null check (version > 0),
  template text not null,
  configuration jsonb not null default '{}'::jsonb,
  active boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (prompt_key, version)
);

create unique index prompt_versions_active_unique_idx
  on public.prompt_versions (prompt_key)
  where active = true;

create index knowledge_documents_lookup_idx
  on public.knowledge_documents (visibility, status, locale);
create index ai_conversations_status_idx
  on public.ai_conversations (status, last_message_at desc);
create index ai_messages_conversation_idx
  on public.ai_messages (conversation_id, created_at);

create trigger knowledge_documents_set_updated_at
before update on public.knowledge_documents
for each row execute function public.set_updated_at();
create trigger ai_conversations_set_updated_at
before update on public.ai_conversations
for each row execute function public.set_updated_at();

alter table public.knowledge_documents enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_feedback enable row level security;
alter table public.prompt_versions enable row level security;

create policy knowledge_documents_internal_read on public.knowledge_documents
for select to authenticated
using (public.can_use_ai());
create policy knowledge_documents_manage on public.knowledge_documents
for all to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

create policy ai_conversations_internal_access on public.ai_conversations
for all to authenticated
using (
  public.can_access_crm()
  or (
    channel = 'internal'
    and owner_id = auth.uid()
    and public.can_use_ai()
  )
)
with check (
  public.can_access_crm()
  or (
    channel = 'internal'
    and owner_id = auth.uid()
    and public.can_use_ai()
  )
);
create policy ai_messages_internal_access on public.ai_messages
for all to authenticated
using (
  public.can_access_crm()
  or exists (
    select 1
    from public.ai_conversations conversation
    where conversation.id = ai_messages.conversation_id
      and conversation.channel = 'internal'
      and conversation.owner_id = auth.uid()
      and public.can_use_ai()
  )
)
with check (
  public.can_access_crm()
  or exists (
    select 1
    from public.ai_conversations conversation
    where conversation.id = ai_messages.conversation_id
      and conversation.channel = 'internal'
      and conversation.owner_id = auth.uid()
      and public.can_use_ai()
  )
);
create policy ai_feedback_internal_access on public.ai_feedback
for all to authenticated
using (public.can_use_ai())
with check (public.can_use_ai());

create policy prompt_versions_internal_read on public.prompt_versions
for select to authenticated
using (public.can_use_ai());
create policy prompt_versions_manage on public.prompt_versions
for all to authenticated
using (public.has_app_role(array[
  'owner'::public.app_role,
  'admin'::public.app_role
]))
with check (public.has_app_role(array[
  'owner'::public.app_role,
  'admin'::public.app_role
]));

grant select, insert, update, delete on public.knowledge_documents,
  public.ai_conversations, public.ai_messages, public.ai_feedback,
  public.prompt_versions to authenticated;

create or replace function public.match_knowledge_documents(
  query_embedding extensions.vector(1536),
  match_count integer default 8,
  include_internal boolean default false,
  requested_locale text default 'en'
)
returns table (
  id uuid,
  title text,
  content text,
  metadata jsonb,
  similarity double precision
)
language sql
stable
set search_path = public, extensions
as $$
  select
    knowledge_documents.id,
    knowledge_documents.title,
    knowledge_documents.content,
    knowledge_documents.metadata,
    1 - (knowledge_documents.embedding <=> query_embedding) as similarity
  from public.knowledge_documents
  where knowledge_documents.status = 'published'
    and knowledge_documents.embedding is not null
    and knowledge_documents.locale = requested_locale
    and (
      knowledge_documents.visibility = 'public'
      or (include_internal and public.can_use_ai())
    )
  order by knowledge_documents.embedding <=> query_embedding
  limit greatest(1, least(match_count, 20));
$$;

revoke all on function public.match_knowledge_documents(
  extensions.vector,
  integer,
  boolean,
  text
) from public;

grant execute on function public.match_knowledge_documents(
  extensions.vector,
  integer,
  boolean,
  text
) to authenticated;

grant execute on function public.match_knowledge_documents(
  extensions.vector,
  integer,
  boolean,
  text
) to service_role;

commit;
