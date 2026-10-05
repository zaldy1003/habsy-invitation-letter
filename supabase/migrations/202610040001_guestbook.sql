begin;
create table public.invitation_responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  name text not null check (char_length(btrim(name)) between 1 and 160),
  attendance text not null check (attendance in ('hadir', 'berhalangan')),
  message text not null default '' check (char_length(message) <= 1000),
  publish_consent boolean not null default false,
  moderation_status text not null default 'pending' check (moderation_status in ('pending','approved','hidden')),
  created_at timestamptz not null default now(),
  constraint publication_consent check (moderation_status <> 'approved' or (publish_consent and char_length(btrim(message)) > 0))
);
create index invitation_responses_public on public.invitation_responses(created_at desc) where moderation_status = 'approved';
alter table public.invitation_responses enable row level security;
revoke all on public.invitation_responses from anon, authenticated;
grant select, insert, update, delete on public.invitation_responses to service_role;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table private.invitation_rate_limits (bucket text primary key, window_start timestamptz not null, hits integer not null);
alter table private.invitation_rate_limits enable row level security;
create function public.submit_invitation_response(p_request_id uuid, p_name text, p_attendance text, p_message text, p_publish_consent boolean, p_bucket text)
returns void language plpgsql security definer set search_path = '' as $$
declare existing public.invitation_responses; k text; max_hits integer; n integer;
begin
  perform pg_advisory_xact_lock(78109261);
  select * into existing from public.invitation_responses where request_id = p_request_id;
  if found then
    if existing.name = p_name and existing.attendance = p_attendance and existing.message = p_message and existing.publish_consent = p_publish_consent then return; end if;
    raise exception 'request_conflict' using errcode = 'P0001';
  end if;
  delete from private.invitation_rate_limits where window_start < now() - interval '10 minutes';
  foreach k in array array['global', p_bucket] loop
    max_hits := case when k = 'global' then 100 else 5 end;
    insert into private.invitation_rate_limits(bucket,window_start,hits) values(k,now(),1)
    on conflict(bucket) do update set hits = private.invitation_rate_limits.hits + 1
    returning hits into n;
    if n > max_hits then raise exception 'rate_limited' using errcode = 'P0001'; end if;
  end loop;
  insert into public.invitation_responses(request_id,name,attendance,message,publish_consent)
  values(p_request_id,p_name,p_attendance,p_message,p_publish_consent);
end;
$$;
revoke all on function public.submit_invitation_response(uuid,text,text,text,boolean,text) from public, anon, authenticated;
grant execute on function public.submit_invitation_response(uuid,text,text,text,boolean,text) to service_role;
commit;
