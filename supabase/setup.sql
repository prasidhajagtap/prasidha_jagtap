-- ============================================================
-- Visits, likes and feedback for prasidhajagtap.github.io/prasidha_jagtap
-- © 2026 Prasidha Jagtap. Designed & developed by Prasidha Jagtap.
-- Run once in Supabase → SQL Editor. Safe to run again.
-- Before running, replace YOUR_ADMIN_EMAIL below with the email
-- you will use to sign in to the admin page.
--
-- Security model
--  * Visitors (anon key) can ONLY call record_visit / record_vote / submit_feedback / ping.
--    They cannot read, change or delete any table.
--  * Only the admin email can read the totals (row-level security).
--  * Spam protection: per-network limits, unique visitors decided on the
--    server. Network addresses are never stored — only a one-way hash that
--    changes every day, deleted after 2 days.
-- ============================================================

create extension if not exists pgcrypto with schema extensions;

-- One row per day (India time): page views, unique visitors, likes
create table if not exists public.site_daily (
  day      date primary key,
  views    integer not null default 0,
  visitors integer not null default 0,
  likes    integer not null default 0
);
alter table public.site_daily add column if not exists dislikes integer not null default 0;
alter table public.site_daily enable row level security;

-- Short-lived anti-spam log (hashed network + kind + time). No API access.
create table if not exists public.site_hits (
  ip_hash text not null,
  kind    text not null,
  at      timestamptz not null default now()
);
alter table public.site_hits drop constraint if exists site_hits_kind_check;
alter table public.site_hits add constraint site_hits_kind_check check (kind in ('view', 'visitor', 'vote', 'feedback'));
create index if not exists site_hits_lookup on public.site_hits (ip_hash, kind, at);
alter table public.site_hits enable row level security;

-- Feedback answers (only short codes from fixed lists + an optional note)
create table if not exists public.site_feedback (
  id      bigint generated always as identity primary key,
  at      timestamptz not null default now(),
  vote    text not null check (vote in ('up', 'down')),
  answers jsonb not null default '{}'::jsonb,
  note    text check (note is null or char_length(note) <= 300)
);
alter table public.site_feedback enable row level security;

-- Who may read the numbers. No API access.
create table if not exists public.site_admins (email text primary key);
alter table public.site_admins enable row level security;
insert into public.site_admins (email) values (lower('YOUR_ADMIN_EMAIL'))
  on conflict do nothing;

-- Visitors and signed-in users get no direct table rights at all
revoke all on public.site_daily, public.site_hits, public.site_admins, public.site_feedback from anon, authenticated;
grant select on public.site_daily, public.site_feedback to authenticated;   -- still filtered by the policies below

create or replace function public.is_site_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.site_admins
                 where email = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;
revoke all on function public.is_site_admin() from public, anon;
grant execute on function public.is_site_admin() to authenticated;

drop policy if exists "admin reads stats" on public.site_daily;
create policy "admin reads stats" on public.site_daily
  for select to authenticated using (public.is_site_admin());
drop policy if exists "admin reads feedback" on public.site_feedback;
create policy "admin reads feedback" on public.site_feedback
  for select to authenticated using (public.is_site_admin());

-- Daily-changing one-way hash of the caller's network address
create or replace function public._caller_hash()
returns text language sql stable security definer set search_path = public, extensions as $$
  select encode(extensions.digest(
    coalesce(split_part(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ',', 1), 'unknown')
    || '|' || ((now() at time zone 'Asia/Kolkata')::date)::text || '|pj-site', 'sha256'), 'hex');
$$;
revoke all on function public._caller_hash() from public, anon, authenticated;

-- Add one view (and one unique visitor, once per network per day).
-- Over the limit, the call quietly does nothing.
create or replace function public.record_visit(new_visitor boolean default false)
returns void language plpgsql security definer set search_path = public as $$
declare
  d  date := (now() at time zone 'Asia/Kolkata')::date;
  h  text := public._caller_hash();
  is_new boolean := false;
begin
  if (select count(*) from public.site_hits
      where ip_hash = h and kind = 'view' and at > now() - interval '10 minutes') >= 60 then
    return;
  end if;
  insert into public.site_hits (ip_hash, kind) values (h, 'view');
  if new_visitor and not exists (select 1 from public.site_hits
      where ip_hash = h and kind = 'visitor' and at > now() - interval '1 day'
        and (at at time zone 'Asia/Kolkata')::date = d) then
    insert into public.site_hits (ip_hash, kind) values (h, 'visitor');
    is_new := true;
  end if;
  insert into public.site_daily (day, views, visitors)
  values (d, 1, case when is_new then 1 else 0 end)
  on conflict (day) do update
    set views = site_daily.views + 1,
        visitors = site_daily.visitors + excluded.visitors;
  if random() < 0.02 then
    delete from public.site_hits where at < now() - interval '2 days';
  end if;
end $$;
revoke all on function public.record_visit(boolean) from public;
grant execute on function public.record_visit(boolean) to anon, authenticated;

drop function if exists public.record_like();

-- Thumbs up / down: at most 3 votes per network per day
create or replace function public.record_vote(vote text)
returns void language plpgsql security definer set search_path = public as $$
declare
  d date := (now() at time zone 'Asia/Kolkata')::date;
  h text := public._caller_hash();
begin
  if vote not in ('up', 'down') then return; end if;
  if (select count(*) from public.site_hits
      where ip_hash = h and kind = 'vote' and at > now() - interval '1 day') >= 3 then
    return;
  end if;
  insert into public.site_hits (ip_hash, kind) values (h, 'vote');
  insert into public.site_daily (day, likes, dislikes)
  values (d, case when vote = 'up' then 1 else 0 end, case when vote = 'down' then 1 else 0 end)
  on conflict (day) do update
    set likes = site_daily.likes + excluded.likes,
        dislikes = site_daily.dislikes + excluded.dislikes;
end $$;
revoke all on function public.record_vote(text) from public;
grant execute on function public.record_vote(text) to anon, authenticated;

-- Feedback answers: only known questions and answer codes are kept;
-- the note is trimmed, cleaned and capped. At most 3 per network per day.
create or replace function public.submit_feedback(vote text, answers jsonb default '{}'::jsonb, note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare
  h text := public._caller_hash();
  allowed jsonb := '{
    "stood_out": ["experience","problems","ai","design","skills"],
    "who":       ["recruiter","manager","peer","friend","exploring"],
    "intent":    ["yes","later","browsing"],
    "reason":    ["long","hard_to_find","design","not_relevant","broken","other"],
    "improve":   ["content","design","speed","phone","clarity"]
  }'::jsonb;
  clean jsonb := '{}'::jsonb;
  k text; v text; n text;
begin
  if vote not in ('up', 'down') then return; end if;
  if (select count(*) from public.site_hits
      where ip_hash = h and kind = 'feedback' and at > now() - interval '1 day') >= 3 then
    return;
  end if;
  if jsonb_typeof(answers) = 'object' then
    for k, v in select key, value #>> '{}' from jsonb_each(answers) loop
      if allowed ? k and allowed -> k ? v then clean := clean || jsonb_build_object(k, v); end if;
    end loop;
  end if;
  n := nullif(btrim(regexp_replace(coalesce(note, ''), '[[:cntrl:]<>]', ' ', 'g')), '');
  if n is not null then n := left(n, 300); end if;
  insert into public.site_hits (ip_hash, kind) values (h, 'feedback');
  insert into public.site_feedback (vote, answers, note) values (vote, clean, n);
end $$;
revoke all on function public.submit_feedback(text, jsonb, text) from public;
grant execute on function public.submit_feedback(text, jsonb, text) to anon, authenticated;

-- Tiny check-in used by the GitHub keep-awake job
create or replace function public.ping()
returns integer language sql stable as $$ select 1 $$;
revoke all on function public.ping() from public;
grant execute on function public.ping() to anon;
