-- NEXTME AI — initial schema. Every user-owned table has Row Level Security: a user can only
-- read and write their own rows. The raw seminar transcript lives in a private table that only
-- the service role (Edge Functions) can read; clients never receive it.
create extension if not exists vector;
create extension if not exists pgcrypto;

-- ───────────────────────── users & preferences ─────────────────────────
create table public.profiles (
  user_id uuid primary key references auth.users on delete cascade,
  name text not null default '',
  language text not null default 'es' check (language in ('es', 'en')),
  coach_style text not null default 'warm' check (coach_style in ('warm', 'direct', 'elite')),
  minutes smallint not null default 10 check (minutes in (3, 10, 25)),
  areas text[] not null default '{}',
  identity_statement text not null default '',
  reminder_time time,
  memory_consent boolean not null default true,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ───────────────────────── program content ─────────────────────────
create table public.programs (
  id text primary key,
  owner uuid references auth.users on delete cascade, -- null = the built-in Fénix program
  title jsonb not null,
  created_at timestamptz not null default now()
);
create table public.chapters (
  id bigint generated always as identity primary key,
  program_id text not null references public.programs on delete cascade,
  n smallint not null,
  title jsonb not null,
  subtitle jsonb not null default '{}',
  art text,
  unique (program_id, n)
);
-- A level row holds the whole validated lesson (cards, exercises, reflect, apply, prove) as JSON
-- in the same schema the app bundles, so generated levels drop straight onto the map.
create table public.levels (
  id text primary key,
  program_id text not null references public.programs on delete cascade,
  chapter smallint not null,
  position smallint not null,
  principle_key text,
  source_pages int[] not null check (cardinality(source_pages) > 0),
  content jsonb not null,
  status text not null default 'draft' check (status in ('draft', 'validated', 'published', 'rejected')),
  validation_errors text[] not null default '{}',
  generated_by text, -- model id, or 'human'
  reviewed_by uuid references auth.users,
  created_at timestamptz not null default now(),
  unique (program_id, position)
);

-- ───────────────────────── learning progress ─────────────────────────
create table public.level_progress (
  user_id uuid not null references auth.users on delete cascade,
  level_id text not null,
  completed_at date not null,
  score smallint not null check (score between 0 and 100),
  reflection text not null default '',
  commitment text not null default '',
  evidence text,
  evidence_at date,
  srs_stage smallint not null default 0,
  next_review date,
  primary key (user_id, level_id)
);
create table public.exercise_answers (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  level_id text not null,
  exercise_index smallint not null,
  correct boolean not null,
  is_review boolean not null default false,
  answered_at timestamptz not null default now()
);

-- ───────────────────────── goals, plans, habits ─────────────────────────
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  why text not null default '',
  metric text not null default '',
  identity text not null default '',
  obstacles text not null default '',
  daily_action text not null default '',
  deadline date not null,
  active boolean not null default true,
  progress smallint not null default 0 check (progress between 0 and 100),
  created_at timestamptz not null default now()
);
create unique index goals_one_active on public.goals (user_id) where active;
create table public.goal_milestones (
  goal_id uuid not null references public.goals on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  week smallint not null,
  focus text not null,
  done boolean not null default false,
  primary key (goal_id, week)
);
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  goal_id uuid references public.goals on delete set null,
  name text not null,
  area text not null default '',
  per_week smallint not null default 5 check (per_week between 1 and 7),
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.habit_logs (
  user_id uuid not null references auth.users on delete cascade,
  habit_id uuid not null references public.habits on delete cascade,
  day date not null,
  primary key (habit_id, day)
);

-- ───────────────────────── daily loop & reflections ─────────────────────────
create table public.day_logs (
  user_id uuid not null references auth.users on delete cascade,
  day date not null,
  priorities jsonb,          -- [{text, done}]
  evening jsonb,             -- {won, learned, off, tomorrow}
  primary key (user_id, day)
);
create table public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  practice_id text not null, -- gratitude, worry, affirmations, …
  day date not null,
  items text[] not null,
  created_at timestamptz not null default now()
);
create table public.weekly_reviews (
  user_id uuid not null references auth.users on delete cascade,
  week_start date not null,
  summary jsonb not null,
  score smallint,
  primary key (user_id, week_start)
);
create table public.scores (
  user_id uuid not null references auth.users on delete cascade,
  day date not null,
  total smallint not null check (total between 0 and 100),
  parts jsonb not null,
  primary key (user_id, day)
);
create table public.xp_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  kind text not null,
  amount smallint not null,
  created_at timestamptz not null default now()
);
create table public.streaks (
  user_id uuid primary key references auth.users on delete cascade,
  current int not null default 0,
  longest int not null default 0,
  freezes smallint not null default 2,
  last_active date
);
create table public.rewards (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  kind text not null, -- milestone, chapter_unlock, share_card
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ───────────────────────── AI coach & knowledge ─────────────────────────
create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  role text not null check (role in ('user', 'coach')),
  content jsonb not null,
  model text,
  created_at timestamptz not null default now()
);
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  raw_text text not null,
  created_at timestamptz not null default now()
);
-- Retrieval units. owner is null for the built-in knowledge base (ORIGINAL paraphrases with
-- page references — safe to serve); owner = user for chunks of that user's vault documents.
create table public.knowledge_chunks (
  id bigint generated always as identity primary key,
  owner uuid references auth.users on delete cascade,
  document_id uuid references public.documents on delete cascade,
  source text not null default 'seminario-fenix',
  language text not null check (language in ('es', 'en')),
  chapter smallint,
  principle text,
  title text not null,
  body text not null,
  pages int[] not null default '{}',
  kind text not null default 'principle' check (kind in ('principle', 'exercise', 'practice', 'note')),
  action text,
  question text,
  caveat text,
  embedding vector(384),
  tsv tsvector generated always as (to_tsvector('simple', title || ' ' || body)) stored
);
create index knowledge_chunks_tsv on public.knowledge_chunks using gin (tsv);
create index knowledge_chunks_vec on public.knowledge_chunks using hnsw (embedding vector_cosine_ops);
create index knowledge_chunks_owner on public.knowledge_chunks (owner);

-- Private: raw transcript pages used ONLY server-side as grounding for the level generator and
-- for the copy check. No RLS policy is created, so anon/authenticated roles cannot read it.
create table public.source_pages (
  source text not null default 'seminario-fenix',
  page int not null,
  body text not null,
  primary key (source, page)
);

-- ───────────────────────── commerce, notifications, analytics ─────────────────────────
create table public.plans (
  id text primary key,            -- free | premium | elite
  title jsonb not null,
  monthly_price_cents int,        -- configurable; null = not sold monthly
  yearly_price_cents int,
  features jsonb not null default '{}',
  active boolean not null default true
);
insert into public.plans (id, title, features) values
  ('free', '{"es":"Gratis","en":"Free"}', '{"daily_levels":1,"coach_messages_per_day":5}'),
  ('premium', '{"es":"Premium","en":"Premium"}', '{"daily_levels":null,"coach_messages_per_day":null,"weekly_review":true}'),
  ('elite', '{"es":"Élite","en":"Elite"}', '{"daily_levels":null,"coach_messages_per_day":null,"weekly_review":true,"deep_reviews":true}');
create table public.subscriptions (
  user_id uuid primary key references auth.users on delete cascade,
  plan_id text not null references public.plans default 'free',
  status text not null default 'active',
  provider text,                  -- revenuecat
  provider_ref text,
  current_period_end timestamptz
);
create table public.notification_prefs (
  user_id uuid primary key references auth.users on delete cascade,
  push_token text,
  daily_reminder boolean not null default true,
  streak_at_risk boolean not null default true,
  weekly_report_email boolean not null default false
);
create table public.app_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete set null,
  name text not null,             -- install, onboarding_step, first_level_complete, …
  props jsonb not null default '{}', -- never free text written by the user
  created_at timestamptz not null default now()
);
-- Whole-device backup written by the app (src/lib/backup.ts). One row per user.
create table public.user_snapshots (
  user_id uuid primary key references auth.users on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- ───────────────────────── Row Level Security ─────────────────────────
do $$
declare t text;
begin
  foreach t in array array['profiles','level_progress','exercise_answers','goals','goal_milestones','habits','habit_logs',
    'day_logs','reflections','weekly_reviews','scores','xp_events','streaks','rewards','ai_conversations','documents',
    'subscriptions','notification_prefs','user_snapshots']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy own_rows on public.%I for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
  end loop;
end $$;

-- A user may not grant themselves the admin role or a paid plan from the client.
-- Supabase grants ALL on new tables to anon/authenticated by default, and a column-level REVOKE
-- does nothing while the table-level privilege exists — so revoke the table privilege and grant
-- back only the safe columns. `role` can then only be changed by the service role.
revoke insert, update on public.profiles from anon, authenticated;
grant insert (user_id, name, language, coach_style, minutes, areas, identity_statement, reminder_time, memory_consent),
      update (name, language, coach_style, minutes, areas, identity_statement, reminder_time, memory_consent, updated_at)
  on public.profiles to authenticated;
revoke insert, update, delete on public.subscriptions from anon, authenticated;
revoke insert, update, delete on public.programs, public.chapters, public.levels, public.plans from anon, authenticated;
revoke all on public.source_pages from anon, authenticated;

alter table public.programs enable row level security;
alter table public.chapters enable row level security;
alter table public.levels enable row level security;
alter table public.plans enable row level security;
alter table public.knowledge_chunks enable row level security;
alter table public.source_pages enable row level security; -- no policies: service role only
alter table public.app_events enable row level security;

create policy read_programs on public.programs for select to authenticated using (owner is null or owner = auth.uid());
create policy read_chapters on public.chapters for select to authenticated using (true);
create policy read_published_levels on public.levels for select to authenticated using (status = 'published');
create policy read_plans on public.plans for select to anon, authenticated using (active);
create policy read_chunks on public.knowledge_chunks for select to authenticated using (owner is null or owner = auth.uid());
create policy write_own_chunks on public.knowledge_chunks for all to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
create policy insert_events on public.app_events for insert to authenticated with check (user_id = auth.uid());

-- ───────────────────────── hybrid retrieval (vector + full text, RRF) ─────────────────────────
-- security invoker: RLS still applies, so a user only ever retrieves the shared knowledge base
-- and their own vault chunks.
create or replace function public.hybrid_search(query_text text, query_embedding vector(384), lang text, match_count int default 6)
returns table (id bigint, owner uuid, title text, body text, pages int[], kind text, action text, question text, caveat text, score double precision)
language sql stable security invoker set search_path = public as $$
  with fts as (
    select c.id, row_number() over (order by ts_rank_cd(c.tsv, websearch_to_tsquery('simple', query_text)) desc) as rnk
    from knowledge_chunks c
    where c.language = lang and c.tsv @@ websearch_to_tsquery('simple', query_text)
    limit 30
  ), vec as (
    select c.id, row_number() over (order by c.embedding <=> query_embedding) as rnk
    from knowledge_chunks c
    where c.language = lang and c.embedding is not null
    order by c.embedding <=> query_embedding
    limit 30
  )
  select c.id, c.owner, c.title, c.body, c.pages, c.kind, c.action, c.question, c.caveat,
         coalesce(1.0 / (60 + fts.rnk), 0) + coalesce(1.0 / (60 + vec.rnk), 0) as score
  from knowledge_chunks c
  left join fts on fts.id = c.id
  left join vec on vec.id = c.id
  where fts.id is not null or vec.id is not null
  order by score desc
  limit match_count;
$$;

-- Export / erase everything a user owns (privacy controls).
create or replace function public.delete_my_data() returns void
language plpgsql security invoker set search_path = public as $$
begin
  delete from level_progress where user_id = auth.uid();
  delete from exercise_answers where user_id = auth.uid();
  delete from goals where user_id = auth.uid();
  delete from habits where user_id = auth.uid();
  delete from day_logs where user_id = auth.uid();
  delete from reflections where user_id = auth.uid();
  delete from weekly_reviews where user_id = auth.uid();
  delete from scores where user_id = auth.uid();
  delete from xp_events where user_id = auth.uid();
  delete from streaks where user_id = auth.uid();
  delete from rewards where user_id = auth.uid();
  delete from ai_conversations where user_id = auth.uid();
  delete from documents where user_id = auth.uid();
  delete from knowledge_chunks where owner = auth.uid();
  delete from user_snapshots where user_id = auth.uid();
end $$;
