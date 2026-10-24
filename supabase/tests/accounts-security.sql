-- Run after the migration in a development project with ON_ERROR_STOP enabled.
-- Every row and change made by this check is rolled back.
begin;
select set_config('zls.test_a',gen_random_uuid()::text,true);
select set_config('zls.test_b',gen_random_uuid()::text,true);
insert into auth.users(id) values(current_setting('zls.test_a')::uuid),(current_setting('zls.test_b')::uuid);
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('zls.test_a'),true);
select public.save_player_progress('{"version":2,"save":{"version":1},"run":null,"updatedAt":1}',null);
do $$ begin
 if (select count(*) from public.player_progress) <> 1 then raise exception 'Own row missing'; end if;
 begin
  perform public.save_player_progress('{"version":2,"save":{"version":1},"run":null,"updatedAt":2}',null);
  raise exception 'Concurrent create unexpectedly overwrote progress';
 exception when serialization_failure then null;
 end;
end $$;
select set_config('request.jwt.claim.sub',current_setting('zls.test_b'),true);
do $$ declare n integer; begin
 if exists(select 1 from public.player_progress where user_id=current_setting('zls.test_a')::uuid) then raise exception 'Cross-account read permitted'; end if;
 update public.player_progress set revision=100 where user_id=current_setting('zls.test_a')::uuid;
 get diagnostics n = row_count;
 if n <> 0 then raise exception 'Cross-account update permitted'; end if;
 begin
  insert into public.player_progress(user_id,progress) values(current_setting('zls.test_a')::uuid,'{"version":2,"save":{"version":1}}');
  raise exception 'Cross-account insert permitted';
 exception when insufficient_privilege then null;
 end;
end $$;
select public.save_player_progress('{"version":2,"save":{"version":1},"run":null,"updatedAt":3}',null);
do $$ begin
 if (select count(*) from public.player_progress) <> 1 then raise exception 'Second user cannot see exactly their own row'; end if;
end $$;
set local role anon;
do $$ begin
 begin
  perform 1 from public.player_progress;
  raise exception 'Anonymous read permitted';
 exception when insufficient_privilege then null;
 end;
end $$;
reset role;
rollback;
