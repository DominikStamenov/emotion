begin;

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
    and (
      not exists (
        select 1
        from auth.mfa_factors
        where user_id = auth.uid()
          and status = 'verified'
      )
      or coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
    )
  limit 1;
$$;

commit;
