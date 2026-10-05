begin;
create table public.invitation_guests (
 id uuid primary key,
 name text not null check(char_length(btrim(name)) between 1 and 160),
 max_party_size integer not null check(max_party_size between 1 and 20),
 token_hash text not null unique,
 token_ciphertext text not null,
 revoked_at timestamptz,
 created_at timestamptz not null default now()
);
alter table public.invitation_guests enable row level security;
revoke all on public.invitation_guests from anon, authenticated;
grant select, insert, update, delete on public.invitation_guests to service_role;
alter table public.invitation_responses add column guest_id uuid unique references public.invitation_guests(id);
alter table public.invitation_responses add column party_size integer;
alter table public.invitation_responses add constraint guest_party_valid check (guest_id is null or (party_size is not null and ((attendance='hadir' and party_size between 1 and 20) or (attendance='berhalangan' and party_size=0))));
create function public.submit_guest_response(p_hash text,p_request_id uuid,p_attendance text,p_party_size integer,p_message text,p_consent boolean)
returns void language plpgsql security definer set search_path='' as $$
declare g public.invitation_guests; old public.invitation_responses; n integer;
begin
 select * into g from public.invitation_guests where token_hash=p_hash and revoked_at is null for update;
 if not found then raise exception 'invalid_invitation'; end if;
 if p_attendance not in ('hadir','berhalangan') or p_party_size is null or (p_attendance='hadir' and (p_party_size<1 or p_party_size>g.max_party_size)) or (p_attendance='berhalangan' and p_party_size<>0) then raise exception 'invalid_party'; end if;
 select * into old from public.invitation_responses where request_id=p_request_id;
 if found then
  if old.guest_id=g.id and old.attendance=p_attendance and old.party_size=p_party_size and old.message=p_message and old.publish_consent=p_consent then return; end if;
  raise exception 'request_conflict';
 end if;
 insert into private.invitation_rate_limits(bucket,window_start,hits) values('guest:'||p_hash,now(),1)
 on conflict(bucket) do update set hits=case when private.invitation_rate_limits.window_start < now()-interval '10 minutes' then 1 else private.invitation_rate_limits.hits+1 end, window_start=case when private.invitation_rate_limits.window_start < now()-interval '10 minutes' then now() else private.invitation_rate_limits.window_start end returning hits into n;
 if n>10 then raise exception 'rate_limited'; end if;
 insert into public.invitation_responses(request_id,guest_id,name,attendance,party_size,message,publish_consent)
 values(p_request_id,g.id,g.name,p_attendance,p_party_size,p_message,p_consent)
 on conflict(guest_id) do update set request_id=excluded.request_id,name=excluded.name,attendance=excluded.attendance,party_size=excluded.party_size,message=excluded.message,publish_consent=excluded.publish_consent,moderation_status='pending';
end;
$$;
revoke all on function public.submit_guest_response(text,uuid,text,integer,text,boolean) from public,anon,authenticated;
grant execute on function public.submit_guest_response(text,uuid,text,integer,text,boolean) to service_role;
create function public.invitation_guest_stats() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('active',count(*) filter(where g.revoked_at is null),'unanswered',count(*) filter(where g.revoked_at is null and r.id is null),'people',coalesce(sum(r.party_size) filter(where g.revoked_at is null and r.attendance='hadir'),0))
 from public.invitation_guests g left join public.invitation_responses r on r.guest_id=g.id;
$$;
revoke all on function public.invitation_guest_stats() from public,anon,authenticated;
grant execute on function public.invitation_guest_stats() to service_role;
commit;
