begin;

update public.site_settings
set value =
  value
  - case
      when value ->> 'domain' = 'emotion.com' then 'domain'
      else '__no_placeholder_domain__'
    end
  - case
      when value ->> 'contactEmail' = 'info@emotion.com' then 'contactEmail'
      else '__no_placeholder_contact__'
    end
where key = 'identity'
  and (
    value ->> 'domain' = 'emotion.com'
    or value ->> 'contactEmail' = 'info@emotion.com'
  );

commit;
