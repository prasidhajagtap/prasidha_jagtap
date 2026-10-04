-- ============================================================
-- Visits, likes and feedback for prasidhajagtap.github.io/prasidha_jagtap
-- © 2026 Prasidha Jagtap. All rights reserved. Designed & developed by Prasidha Jagtap.
-- Run once in Supabase → SQL Editor. Safe to run again.
-- Before running, replace YOUR_ADMIN_EMAIL below with the email
-- you will use to sign in to the admin page.
--
-- Security model
--  * Visitors (anon key) can ONLY call record_visit / record_vote / submit_feedback /
--    record_build / ping / ip_key_check (a harmless self-test, see below).
--    They cannot read, change or delete any table.
--  * Only the admin email can read the totals (row-level security).
--  * Unique visitors: each browser makes its own random ID; it is stored
--    here only as a one-way hash. Visits = browser sessions (30 min idle).
--  * The owner's browsers (where the admin panel was opened) are counted
--    separately, so they never inflate the visitor numbers.
--  * Spam protection: per-network limits on views and on new browser IDs.
--    Network addresses are never stored — only a daily-changing one-way
--    hash, deleted after 2 days.
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
alter table public.site_daily add column if not exists visits integer not null default 0;        -- sessions
alter table public.site_daily add column if not exists new_visitors integer not null default 0;  -- first-ever browsers
alter table public.site_daily add column if not exists own_views integer not null default 0;     -- the owner's own page opens
alter table public.site_daily add column if not exists build_opens integer not null default 0;   -- "Want a website?" opened
alter table public.site_daily add column if not exists build_sends integer not null default 0;   -- "Send enquiry" tapped
alter table public.site_daily enable row level security;

-- Short-lived anti-spam log (hashed network + kind + time). No API access.
create table if not exists public.site_hits (
  ip_hash text not null,
  kind    text not null,
  at      timestamptz not null default now()
);
alter table public.site_hits drop constraint if exists site_hits_kind_check;
alter table public.site_hits add constraint site_hits_kind_check check (kind in ('view', 'visitor', 'newvid', 'vote', 'feedback', 'build_open', 'build_send'));
create index if not exists site_hits_lookup on public.site_hits (ip_hash, kind, at);
alter table public.site_hits enable row level security;

-- One row per browser (random ID made by the browser, stored here only as a hash)
create table if not exists public.site_visitors (
  vid_hash   text primary key,
  first_seen timestamptz not null default now(),
  last_seen  timestamptz not null default now(),
  views      integer not null default 0,
  visits     integer not null default 0,
  own        boolean not null default false
);
alter table public.site_visitors enable row level security;
-- Which browsers came on which day (for daily unique visitors)
create table if not exists public.site_visitor_days (
  vid_hash text not null,
  day      date not null,
  primary key (vid_hash, day)
);
alter table public.site_visitor_days enable row level security;

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
revoke all on public.site_daily, public.site_hits, public.site_admins, public.site_feedback,
              public.site_visitors, public.site_visitor_days from anon, authenticated;
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

-- The caller's network address. cf-connecting-ip is set by Supabase's Cloudflare edge
-- and cannot be faked by the visitor; X-Forwarded-For can be, so it is only a fallback.
create or replace function public._caller_ip()
returns text language sql stable security definer set search_path = public as $$
  select coalesce(
    nullif(btrim(current_setting('request.headers', true)::json ->> 'cf-connecting-ip'), ''),
    nullif(btrim(split_part(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ',', 1)), ''),
    'unknown');
$$;
revoke all on function public._caller_ip() from public, anon, authenticated;

-- Daily-changing one-way hash of the caller's network address
create or replace function public._caller_hash()
returns text language sql stable security definer set search_path = public, extensions as $$
  select encode(extensions.digest(
    public._caller_ip() || '|' || ((now() at time zone 'Asia/Kolkata')::date)::text || '|pj-site', 'sha256'), 'hex');
$$;
revoke all on function public._caller_hash() from public, anon, authenticated;

-- Security self-test: shows the caller only short one-way fingerprints of the
-- address headers *they* sent (never anyone else's, never a real address), so the
-- owner can confirm a faked X-Forwarded-For no longer changes the spam-limit key.
create or replace function public.ip_key_check()
returns jsonb language sql stable security definer set search_path = public, extensions as $$
  select jsonb_build_object(
    'key',        left(encode(extensions.digest(public._caller_ip() || '|pj-check', 'sha256'), 'hex'), 12),
    'has_cf',     (current_setting('request.headers', true)::json ->> 'cf-connecting-ip') is not null,
    'xff_first',  left(encode(extensions.digest(coalesce(btrim(split_part(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ',', 1)), '') || '|pj-check', 'sha256'), 'hex'), 12));
$$;
revoke all on function public.ip_key_check() from public;
grant execute on function public.ip_key_check() to anon, authenticated;

-- Count one page open.
--   vid      random browser ID (kept in the visitor's browser; stored here only as a hash)
--   new_visit true when a new browser session starts (or after 30 minutes idle)
--   own      true on browsers where the owner has opened the admin panel
-- Over the limits the call quietly does nothing.
drop function if exists public.record_visit(boolean);
create or replace function public.record_visit(vid text, new_visit boolean default false, own boolean default false)
returns void language plpgsql security definer set search_path = public, extensions as $$
declare
  d   date := (now() at time zone 'Asia/Kolkata')::date;
  h   text := public._caller_hash();
  vh  text;
  is_new_browser boolean := false;
  is_new_today   boolean := false;
  cnt integer;
begin
  if vid is null or vid !~ '^[A-Za-z0-9-]{16,64}$' then return; end if;
  if (select count(*) from public.site_hits
      where ip_hash = h and kind = 'view' and at > now() - interval '10 minutes') >= 60 then
    return;
  end if;
  insert into public.site_hits (ip_hash, kind) values (h, 'view');
  vh := encode(extensions.digest(vid || '|pj-vid', 'sha256'), 'hex');

  if own then
    insert into public.site_visitors (vid_hash, views, visits, own) values (vh, 1, case when new_visit then 1 else 0 end, true)
    on conflict (vid_hash) do update set views = site_visitors.views + 1, visits = site_visitors.visits + excluded.visits,
      last_seen = now(), own = true;
    insert into public.site_daily (day, own_views) values (d, 1)
    on conflict (day) do update set own_views = site_daily.own_views + 1;
    return;
  end if;

  if not exists (select 1 from public.site_visitors where vid_hash = vh) then
    -- a flood of made-up browser IDs from one network is ignored
    if (select count(*) from public.site_hits where ip_hash = h and kind = 'newvid'
        and at > now() - interval '1 day') >= 20 then
      return;
    end if;
    insert into public.site_hits (ip_hash, kind) values (h, 'newvid');
    is_new_browser := true;
  end if;
  insert into public.site_visitors (vid_hash, views, visits) values (vh, 1, case when new_visit or is_new_browser then 1 else 0 end)
  on conflict (vid_hash) do update set views = site_visitors.views + 1,
    visits = site_visitors.visits + excluded.visits, last_seen = now();
  insert into public.site_visitor_days (vid_hash, day) values (vh, d) on conflict do nothing;
  get diagnostics cnt = row_count;
  is_new_today := cnt > 0;
  insert into public.site_daily (day, views, visits, visitors, new_visitors)
  values (d, 1, case when new_visit or is_new_browser then 1 else 0 end,
          case when is_new_today then 1 else 0 end, case when is_new_browser then 1 else 0 end)
  on conflict (day) do update set
    views = site_daily.views + 1,
    visits = site_daily.visits + excluded.visits,
    visitors = site_daily.visitors + excluded.visitors,
    new_visitors = site_daily.new_visitors + excluded.new_visitors;
  if random() < 0.02 then
    delete from public.site_hits where at < now() - interval '2 days';
  end if;
end $$;
revoke all on function public.record_visit(text, boolean, boolean) from public;
grant execute on function public.record_visit(text, boolean, boolean) to anon, authenticated;

-- Totals only the admin can ask for (all-time unique and returning browsers)
create or replace function public.site_summary()
returns table (unique_visitors bigint, returning_visitors bigint, own_browsers bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_site_admin() then return; end if;
  return query select
    count(*) filter (where not own),
    count(*) filter (where not own and visits > 1),
    count(*) filter (where own)
  from public.site_visitors;
end $$;
revoke all on function public.site_summary() from public, anon;
grant execute on function public.site_summary() to authenticated;

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

-- "Want a website of your own?": step is 'open' (page opened) or 'send' (Send
-- enquiry / Gmail / Outlook tapped). At most 5 of each per network per day.
create or replace function public.record_build(step text)
returns void language plpgsql security definer set search_path = public as $$
declare
  d date := (now() at time zone 'Asia/Kolkata')::date;
  h text := public._caller_hash();
  k text;
begin
  if step not in ('open', 'send') then return; end if;
  k := 'build_' || step;
  if (select count(*) from public.site_hits
      where ip_hash = h and kind = k and at > now() - interval '1 day') >= 5 then
    return;
  end if;
  insert into public.site_hits (ip_hash, kind) values (h, k);
  insert into public.site_daily (day, build_opens, build_sends)
  values (d, case when step = 'open' then 1 else 0 end, case when step = 'send' then 1 else 0 end)
  on conflict (day) do update
    set build_opens = site_daily.build_opens + excluded.build_opens,
        build_sends = site_daily.build_sends + excluded.build_sends;
end $$;
revoke all on function public.record_build(text) from public;
grant execute on function public.record_build(text) to anon, authenticated;

-- Tiny check-in used by the GitHub keep-awake job
create or replace function public.ping()
returns integer language sql stable as $$ select 1 $$;
revoke all on function public.ping() from public;
grant execute on function public.ping() to anon;
