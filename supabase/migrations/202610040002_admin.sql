begin;
create table public.invitation_moderation_log (
 id bigint generated always as identity primary key,
 response_id uuid not null references public.invitation_responses(id) on delete cascade,
 actor_id uuid not null,
 previous_status text not null,
 next_status text not null,
 created_at timestamptz not null default now()
);
alter table public.invitation_moderation_log enable row level security;
revoke all on public.invitation_moderation_log from anon, authenticated;
grant select on public.invitation_moderation_log to service_role;
create function public.moderate_invitation_response(p_id uuid, p_status text, p_actor uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare item public.invitation_responses;
begin
 if not exists(select 1 from auth.users where id = p_actor and raw_app_meta_data->>'invitation_role' = 'admin') then raise exception 'forbidden'; end if;
 if p_status not in ('pending','approved','hidden') then raise exception 'invalid_status'; end if;
 select * into item from public.invitation_responses where id = p_id for update;
 if not found then raise exception 'not_found'; end if;
 if p_status = 'approved' and (not item.publish_consent or btrim(item.message) = '') then raise exception 'consent_required'; end if;
 if item.moderation_status = p_status then return; end if;
 update public.invitation_responses set moderation_status = p_status where id = p_id;
 insert into public.invitation_moderation_log(response_id, actor_id, previous_status, next_status) values(p_id,p_actor,item.moderation_status,p_status);
end;
$$;
revoke all on function public.moderate_invitation_response(uuid,text,uuid) from public, anon, authenticated;
grant execute on function public.moderate_invitation_response(uuid,text,uuid) to service_role;
commit;
