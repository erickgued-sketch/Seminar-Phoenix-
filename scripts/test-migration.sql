-- Smoke test for supabase/migrations/0001_init.sql on a plain Postgres (see scripts/test-migration.sh).
-- Checks that Row Level Security really isolates users and that privileged columns are protected.
\set ON_ERROR_STOP on
insert into auth.users values ('00000000-0000-0000-0000-00000000000a'), ('00000000-0000-0000-0000-00000000000b');
insert into public.source_pages (page, body) values (1, 'private transcript text');
insert into public.knowledge_chunks (language, title, body, pages) values ('es', 'Ley del control', 'Te sientes bien cuando diriges tu vida', '{7}');
create function pg_temp.expect(label text, ok boolean) returns void language plpgsql as $$
begin if ok then raise notice 'PASS %', label; else raise exception 'FAIL %', label; end if; end $$;

-- user A writes
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
insert into profiles (user_id, name) values (auth.uid(), 'A');
insert into goals (user_id, title, deadline) values (auth.uid(), 'Meta de A', current_date + 90);
insert into reflections (user_id, practice_id, day, items) values (auth.uid(), 'gratitude', current_date, '{"privado de A"}');
insert into documents (user_id, title, raw_text) values (auth.uid(), 'Notas A', 'texto');
insert into knowledge_chunks (owner, language, title, body) values (auth.uid(), 'es', 'Nota de A', 'pomodoro de A');
insert into user_snapshots (user_id, data) values (auth.uid(), '{"xp":1}');

-- user B must see none of it
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000b';
select pg_temp.expect('B cannot read A goals', (select count(*) = 0 from goals));
select pg_temp.expect('B cannot read A reflections', (select count(*) = 0 from reflections));
select pg_temp.expect('B cannot read A profile', (select count(*) = 0 from profiles));
select pg_temp.expect('B cannot read A snapshot', (select count(*) = 0 from user_snapshots));
select pg_temp.expect('B sees shared KB but not A vault chunks', (select count(*) = 1 and bool_and(owner is null) from knowledge_chunks));
do $$ begin
  begin perform count(*) from source_pages; raise exception 'FAIL client could query the private transcript';
  exception when insufficient_privilege then raise notice 'PASS private transcript is unreadable by clients'; end;
end $$;
select pg_temp.expect('hybrid_search respects RLS', (select count(*) = 0 from hybrid_search('pomodoro', null, 'es')));
select pg_temp.expect('hybrid_search finds shared KB', (select count(*) = 1 from hybrid_search('control', null, 'es')));
do $$ begin
  begin insert into goals (user_id, title, deadline) values ('00000000-0000-0000-0000-00000000000a', 'forged', current_date); raise exception 'FAIL B could write as A';
  exception when insufficient_privilege or check_violation then raise notice 'PASS B cannot insert rows for A'; end;
  begin update goals set title = 'hacked'; if found then raise exception 'FAIL B updated A rows'; else raise notice 'PASS B cannot update A rows'; end if; end;
  insert into profiles (user_id) values (auth.uid());
  begin update profiles set role = 'admin' where user_id = auth.uid(); raise exception 'FAIL self-promotion to admin (update)';
  exception when insufficient_privilege then raise notice 'PASS user cannot update their role to admin'; end;
  begin delete from profiles where user_id = auth.uid(); insert into profiles (user_id, role) values (auth.uid(), 'admin'); raise exception 'FAIL self-promotion to admin (insert)';
  exception when insufficient_privilege then raise notice 'PASS user cannot insert a profile with role admin'; end;
  begin insert into subscriptions (user_id, plan_id) values (auth.uid(), 'elite'); raise exception 'FAIL self-granted paid plan';
  exception when insufficient_privilege then raise notice 'PASS user cannot grant themselves a paid plan'; end;
  begin insert into levels (id, program_id, chapter, position, source_pages, content) values ('x', 'fenix', 1, 1, '{1}', '{}'); raise exception 'FAIL client wrote a level';
  exception when insufficient_privilege or foreign_key_violation then raise notice 'PASS clients cannot publish levels'; end;
end $$;

-- A can read back and erase their own data
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
select pg_temp.expect('A reads own goal', (select count(*) = 1 from goals));
select delete_my_data();
select pg_temp.expect('delete_my_data erases A rows', (select (select count(*) from goals) + (select count(*) from reflections) + (select count(*) from documents) + (select count(*) from knowledge_chunks where owner is not null) + (select count(*) from user_snapshots) = 0));
set role anon;
select pg_temp.expect('anon reads plans only', (select count(*) = 3 from plans));
select pg_temp.expect('anon sees no user rows', (select (select count(*) from profiles) + (select count(*) from knowledge_chunks) = 0));
