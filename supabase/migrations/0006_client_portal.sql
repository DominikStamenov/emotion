begin;

-- Existing profiles were created for eMotion staff. New Auth users are clients
-- until an owner explicitly promotes them to a staff account.
alter table public.profiles
add column account_type text not null default 'staff'
check (account_type in ('staff', 'client'));

alter table public.profiles alter column account_type set default 'client';

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
    and account_type = 'staff'
  limit 1;
$$;

create type public.milestone_status as enum (
  'planned',
  'active',
  'completed',
  'delayed'
);

create type public.portal_feedback_decision as enum (
  'comment',
  'approved',
  'changes_requested'
);

create table public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  title text not null,
  description text,
  status public.milestone_status not null default 'planned',
  position integer not null default 0,
  starts_at date,
  due_at date,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.portal_feedback (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  deliverable_id uuid references public.deliverables(id) on delete cascade,
  author_user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  decision public.portal_feedback_decision not null default 'comment',
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.portal_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  engagement_id uuid references public.engagements(id) on delete cascade,
  notification_type text not null,
  title text not null,
  body text,
  href text check (href is null or href like '/%'),
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index project_milestones_engagement_idx
on public.project_milestones (engagement_id, position);

create index portal_feedback_engagement_idx
on public.portal_feedback (engagement_id, created_at desc);

create index portal_notifications_user_idx
on public.portal_notifications (user_id, read_at, created_at desc);

create trigger project_milestones_set_updated_at
before update on public.project_milestones
for each row execute function public.set_updated_at();

create trigger portal_feedback_set_updated_at
before update on public.portal_feedback
for each row execute function public.set_updated_at();

create or replace function public.has_client_portal_access(p_engagement_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.client_portal_access access
    join public.profiles profile on profile.id = access.user_id
    where access.engagement_id = p_engagement_id
      and access.user_id = auth.uid()
      and access.active = true
      and profile.active = true
      and profile.account_type = 'client'
  );
$$;

revoke all on function public.has_client_portal_access(uuid) from public;
grant execute on function public.has_client_portal_access(uuid) to authenticated;

alter table public.project_milestones enable row level security;
alter table public.portal_feedback enable row level security;
alter table public.portal_notifications enable row level security;

create policy client_portal_access_self_read
on public.client_portal_access
for select to authenticated
using (user_id = auth.uid() and active = true);

create policy engagements_client_read
on public.engagements
for select to authenticated
using (public.has_client_portal_access(id));

create policy deliverables_client_read
on public.deliverables
for select to authenticated
using (public.has_client_portal_access(engagement_id));

create policy proposals_client_read
on public.proposals
for select to authenticated
using (
  status <> 'draft'
  and exists (
    select 1
    from public.engagements engagement
    where engagement.opportunity_id = proposals.opportunity_id
      and public.has_client_portal_access(engagement.id)
  )
);

create policy project_milestones_staff_access
on public.project_milestones
for all to authenticated
using (public.can_access_crm())
with check (public.can_access_crm());

create policy project_milestones_client_read
on public.project_milestones
for select to authenticated
using (public.has_client_portal_access(engagement_id));

create policy portal_feedback_staff_access
on public.portal_feedback
for all to authenticated
using (public.can_access_crm())
with check (public.can_access_crm());

create policy portal_feedback_client_read
on public.portal_feedback
for select to authenticated
using (public.has_client_portal_access(engagement_id));

create policy portal_feedback_client_insert
on public.portal_feedback
for insert to authenticated
with check (
  author_user_id = auth.uid()
  and public.has_client_portal_access(engagement_id)
  and (
    deliverable_id is null
    or exists (
      select 1
      from public.deliverables deliverable
      where deliverable.id = portal_feedback.deliverable_id
        and deliverable.engagement_id = portal_feedback.engagement_id
    )
  )
);

create policy portal_notifications_staff_access
on public.portal_notifications
for all to authenticated
using (public.can_access_crm())
with check (public.can_access_crm());

create policy portal_notifications_client_read
on public.portal_notifications
for select to authenticated
using (
  user_id = auth.uid()
  and (
    engagement_id is null
    or public.has_client_portal_access(engagement_id)
  )
);

create policy portal_notifications_client_update
on public.portal_notifications
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy attachments_client_read
on public.attachments
for select to authenticated
using (
  (
    entity_type = 'engagement'
    and public.has_client_portal_access(entity_id)
  )
  or (
    entity_type = 'deliverable'
    and exists (
      select 1
      from public.deliverables deliverable
      where deliverable.id = attachments.entity_id
        and public.has_client_portal_access(deliverable.engagement_id)
    )
  )
);

create policy media_assets_client_read
on public.media_assets
for select to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.attachments attachment
    left join public.deliverables deliverable
      on attachment.entity_type = 'deliverable'
      and deliverable.id = attachment.entity_id
    where attachment.media_asset_id = media_assets.id
      and (
        (
          attachment.entity_type = 'engagement'
          and public.has_client_portal_access(attachment.entity_id)
        )
        or (
          attachment.entity_type = 'deliverable'
          and public.has_client_portal_access(deliverable.engagement_id)
        )
      )
  )
);

create policy private_portal_media_read
on storage.objects
for select to authenticated
using (
  bucket_id = 'private-media'
  and exists (
    select 1
    from public.media_assets asset
    join public.attachments attachment on attachment.media_asset_id = asset.id
    left join public.deliverables deliverable
      on attachment.entity_type = 'deliverable'
      and deliverable.id = attachment.entity_id
    where asset.bucket = storage.objects.bucket_id
      and asset.path = storage.objects.name
      and (
        (
          attachment.entity_type = 'engagement'
          and public.has_client_portal_access(attachment.entity_id)
        )
        or (
          attachment.entity_type = 'deliverable'
          and public.has_client_portal_access(deliverable.engagement_id)
        )
      )
  )
);

create or replace function public.submit_deliverable_feedback(
  p_deliverable_id uuid,
  p_body text,
  p_decision public.portal_feedback_decision default 'comment'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_engagement_id uuid;
  v_feedback_id uuid;
begin
  select engagement_id into v_engagement_id
  from public.deliverables
  where id = p_deliverable_id;

  if v_engagement_id is null
     or not public.has_client_portal_access(v_engagement_id) then
    raise exception 'Deliverable is not available in this client portal';
  end if;

  if char_length(trim(p_body)) < 1 or char_length(trim(p_body)) > 5000 then
    raise exception 'Feedback body must contain between 1 and 5000 characters';
  end if;

  insert into public.portal_feedback (
    engagement_id,
    deliverable_id,
    author_user_id,
    body,
    decision
  ) values (
    v_engagement_id,
    p_deliverable_id,
    auth.uid(),
    trim(p_body),
    p_decision
  ) returning id into v_feedback_id;

  if p_decision = 'approved' then
    update public.deliverables
    set status = 'approved', approved_at = timezone('utc', now())
    where id = p_deliverable_id;
  elsif p_decision = 'changes_requested' then
    update public.deliverables
    set status = 'review', approved_at = null
    where id = p_deliverable_id;
  end if;

  return v_feedback_id;
end;
$$;

revoke all on function public.submit_deliverable_feedback(
  uuid,
  text,
  public.portal_feedback_decision
) from public;

grant execute on function public.submit_deliverable_feedback(
  uuid,
  text,
  public.portal_feedback_decision
) to authenticated;

grant select on public.project_milestones, public.portal_feedback,
  public.portal_notifications to authenticated;
grant insert on public.portal_feedback to authenticated;
grant insert, update, delete on public.project_milestones to authenticated;
grant insert, update, delete on public.portal_feedback to authenticated;
grant insert, update, delete on public.portal_notifications to authenticated;

commit;
