-- Account-private progress. No public leaderboard or trusted purchase claims.
create table if not exists public.player_progress (
 user_id uuid primary key references auth.users(id) on delete cascade,
 progress jsonb not null check (octet_length(progress::text) <= 4000000 and coalesce(progress->>'version' = '2' and progress->'save'->>'version' = '1',false)),
 revision bigint not null default 1 check (revision > 0),
 updated_at timestamptz not null default now()
);
alter table public.player_progress enable row level security;
revoke all on public.player_progress from anon, authenticated;
grant select, insert, update on public.player_progress to authenticated;
create policy "Read own progress" on public.player_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own progress" on public.player_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own progress" on public.player_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create or replace function public.save_player_progress(p_progress jsonb, p_expected_revision bigint)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare result public.player_progress;
begin
 if auth.uid() is null then raise exception 'Sign in first' using errcode = '28000'; end if;
 if p_expected_revision is null then
  insert into public.player_progress(user_id,progress) values(auth.uid(),p_progress)
   on conflict(user_id) do nothing returning * into result;
 else
  update public.player_progress set progress=p_progress,revision=revision+1,updated_at=now()
   where user_id=auth.uid() and revision=p_expected_revision returning * into result;
 end if;
 if result.user_id is null then raise exception 'Progress changed on another device' using errcode='40001'; end if;
 return jsonb_build_object('progress',result.progress,'revision',result.revision);
end $$;
revoke all on function public.save_player_progress(jsonb,bigint) from public, anon;
grant execute on function public.save_player_progress(jsonb,bigint) to authenticated;
