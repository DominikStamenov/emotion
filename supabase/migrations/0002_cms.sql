begin;

create type public.content_status as enum (
  'draft',
  'scheduled',
  'published',
  'archived'
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  path text not null,
  filename text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  alt_text text,
  focal_point jsonb,
  rights jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (bucket, path)
);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  locale text not null default 'en',
  title text not null,
  summary text,
  page_type text not null default 'page',
  status public.content_status not null default 'draft',
  seo jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (locale, slug)
);

create table public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  section_type text not null,
  position integer not null check (position >= 0),
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (page_id, position)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  locale text not null default 'en',
  title text not null,
  short_description text,
  content jsonb not null default '{}'::jsonb,
  position integer not null default 0,
  status public.content_status not null default 'draft',
  seo jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (locale, slug)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  locale text not null default 'en',
  title text not null,
  client_name text,
  summary text,
  year integer,
  content jsonb not null default '{}'::jsonb,
  cover_asset_id uuid references public.media_assets(id) on delete set null,
  status public.content_status not null default 'draft',
  is_seed boolean not null default false,
  verified_at timestamptz,
  seo jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (locale, slug)
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  person_name text not null,
  person_role text,
  company_name text,
  company_url text,
  status public.content_status not null default 'draft',
  position integer not null default 0,
  is_seed boolean not null default false,
  is_verified boolean not null default false,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.people (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  role_title text,
  biography text,
  portrait_asset_id uuid references public.media_assets(id) on delete set null,
  links jsonb not null default '[]'::jsonb,
  position integer not null default 0,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.insights (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  locale text not null default 'en',
  title text not null,
  excerpt text,
  content jsonb not null default '{}'::jsonb,
  cover_asset_id uuid references public.media_assets(id) on delete set null,
  author_profile_id uuid references public.profiles(id) on delete set null,
  status public.content_status not null default 'draft',
  seo jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (locale, slug)
);

create table public.insight_categories (
  insight_id uuid not null references public.insights(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (insight_id, category_id)
);

create table public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  navigation_key text not null,
  parent_id uuid references public.navigation_items(id) on delete cascade,
  label text not null,
  href text not null,
  position integer not null default 0,
  is_external boolean not null default false,
  is_active boolean not null default true,
  locale text not null default 'en',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.content_revisions (
  id bigint generated always as identity primary key,
  entity_type text not null,
  entity_id uuid not null,
  revision integer not null check (revision > 0),
  snapshot jsonb not null,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (entity_type, entity_id, revision)
);

create index pages_publication_idx on public.pages (status, published_at);
create index services_publication_idx on public.services (status, published_at, position);
create index projects_publication_idx on public.projects (status, published_at);
create index testimonials_publication_idx on public.testimonials (status, published_at, position);
create index insights_publication_idx on public.insights (status, published_at);
create index navigation_items_lookup_idx on public.navigation_items (navigation_key, locale, position);
create index content_revisions_entity_idx on public.content_revisions (entity_type, entity_id, revision desc);

create trigger media_assets_set_updated_at before update on public.media_assets
for each row execute function public.set_updated_at();
create trigger pages_set_updated_at before update on public.pages
for each row execute function public.set_updated_at();
create trigger page_sections_set_updated_at before update on public.page_sections
for each row execute function public.set_updated_at();
create trigger services_set_updated_at before update on public.services
for each row execute function public.set_updated_at();
create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_updated_at();
create trigger testimonials_set_updated_at before update on public.testimonials
for each row execute function public.set_updated_at();
create trigger people_set_updated_at before update on public.people
for each row execute function public.set_updated_at();
create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();
create trigger insights_set_updated_at before update on public.insights
for each row execute function public.set_updated_at();
create trigger navigation_items_set_updated_at before update on public.navigation_items
for each row execute function public.set_updated_at();

alter table public.media_assets enable row level security;
alter table public.pages enable row level security;
alter table public.page_sections enable row level security;
alter table public.services enable row level security;
alter table public.projects enable row level security;
alter table public.testimonials enable row level security;
alter table public.people enable row level security;
alter table public.categories enable row level security;
alter table public.insights enable row level security;
alter table public.insight_categories enable row level security;
alter table public.navigation_items enable row level security;
alter table public.content_revisions enable row level security;

create policy media_assets_public_read on public.media_assets
for select to anon, authenticated
using (bucket = 'public-media' and deleted_at is null);
create policy media_assets_internal_read on public.media_assets
for select to authenticated
using (public.current_app_role() is not null and deleted_at is null);
create policy media_assets_manage on public.media_assets
for all to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

create policy pages_public_read on public.pages
for select to anon, authenticated
using (status = 'published' and published_at <= timezone('utc', now()));
create policy pages_internal_read on public.pages
for select to authenticated
using (public.current_app_role() is not null);
create policy pages_manage on public.pages
for all to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

create policy page_sections_public_read on public.page_sections
for select to anon, authenticated
using (exists (
  select 1 from public.pages
  where pages.id = page_sections.page_id
    and pages.status = 'published'
    and pages.published_at <= timezone('utc', now())
));
create policy page_sections_internal_read on public.page_sections
for select to authenticated
using (public.current_app_role() is not null);
create policy page_sections_manage on public.page_sections
for all to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

create policy services_public_read on public.services
for select to anon, authenticated
using (status = 'published' and published_at <= timezone('utc', now()));
create policy services_internal_read on public.services
for select to authenticated
using (public.current_app_role() is not null);
create policy services_manage on public.services
for all to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

create policy projects_public_read on public.projects
for select to anon, authenticated
using (
  status = 'published'
  and published_at <= timezone('utc', now())
  and (is_seed = false or verified_at is not null)
);
create policy projects_internal_read on public.projects
for select to authenticated
using (public.current_app_role() is not null);
create policy projects_manage on public.projects
for all to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

create policy testimonials_public_read on public.testimonials
for select to anon, authenticated
using (
  status = 'published'
  and published_at <= timezone('utc', now())
  and is_verified = true
);
create policy testimonials_internal_read on public.testimonials
for select to authenticated
using (public.current_app_role() is not null);
create policy testimonials_manage on public.testimonials
for all to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

create policy people_public_read on public.people
for select to anon, authenticated
using (status = 'published' and published_at <= timezone('utc', now()));
create policy people_internal_read on public.people
for select to authenticated
using (public.current_app_role() is not null);
create policy people_manage on public.people
for all to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

create policy categories_public_read on public.categories
for select to anon, authenticated using (true);
create policy categories_manage on public.categories
for all to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

create policy insights_public_read on public.insights
for select to anon, authenticated
using (status = 'published' and published_at <= timezone('utc', now()));
create policy insights_internal_read on public.insights
for select to authenticated
using (public.current_app_role() is not null);
create policy insights_manage on public.insights
for all to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

create policy insight_categories_public_read on public.insight_categories
for select to anon, authenticated
using (exists (
  select 1 from public.insights
  where insights.id = insight_categories.insight_id
    and insights.status = 'published'
    and insights.published_at <= timezone('utc', now())
));
create policy insight_categories_manage on public.insight_categories
for all to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

create policy navigation_items_public_read on public.navigation_items
for select to anon, authenticated using (is_active = true);
create policy navigation_items_internal_read on public.navigation_items
for select to authenticated using (public.current_app_role() is not null);
create policy navigation_items_manage on public.navigation_items
for all to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

create policy content_revisions_internal_read on public.content_revisions
for select to authenticated using (public.current_app_role() is not null);
create policy content_revisions_manage on public.content_revisions
for all to authenticated
using (public.can_manage_content())
with check (public.can_manage_content());

grant select on public.media_assets, public.pages, public.page_sections,
  public.services, public.projects, public.testimonials, public.people,
  public.categories, public.insights, public.insight_categories,
  public.navigation_items to anon, authenticated;

grant insert, update, delete on public.media_assets, public.pages,
  public.page_sections, public.services, public.projects, public.testimonials,
  public.people, public.categories, public.insights, public.insight_categories,
  public.navigation_items, public.content_revisions to authenticated;

grant select on public.content_revisions to authenticated;
grant usage, select on sequence public.content_revisions_id_seq to authenticated;

insert into storage.buckets (id, name, public)
values
  ('public-media', 'public-media', true),
  ('private-media', 'private-media', false)
on conflict (id) do nothing;

create policy public_media_objects_read
on storage.objects for select
to anon, authenticated
using (bucket_id = 'public-media');

create policy managed_media_objects_insert
on storage.objects for insert
to authenticated
with check (
  bucket_id in ('public-media', 'private-media')
  and public.can_manage_content()
);

create policy managed_media_objects_update
on storage.objects for update
to authenticated
using (
  bucket_id in ('public-media', 'private-media')
  and public.can_manage_content()
)
with check (
  bucket_id in ('public-media', 'private-media')
  and public.can_manage_content()
);

create policy managed_media_objects_delete
on storage.objects for delete
to authenticated
using (
  bucket_id in ('public-media', 'private-media')
  and public.can_manage_content()
);

commit;
