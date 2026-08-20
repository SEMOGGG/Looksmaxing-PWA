-- Migration back-office admin (articles, bibliotheque skincare, badges,
-- reglages, points, signalements). A executer dans Supabase > SQL Editor.
-- Deja inclus dans supabase/schema.sql (source de verite) ; ce fichier est
-- juste une copie pratique pour eviter les soucis de guillemets lors d'un
-- copier-coller depuis le chat.

alter table community_reports add column if not exists resolved boolean not null default false;

create table if not exists community_articles (
  id uuid primary key default gen_random_uuid(),
  category post_category not null default 'general',
  title text not null,
  excerpt text not null,
  content text[] not null default '{}',
  read_minutes integer not null default 3,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists community_articles_category_idx on community_articles (category, sort_order);
alter table community_articles enable row level security;
create policy "Lecture publique des articles" on community_articles for select using (true);

create table if not exists skincare_ingredients (
  id text primary key,
  name text not null,
  what_it_does text not null,
  how_to_use text not null,
  caution text not null,
  example_product text not null default '',
  niche boolean not null default false,
  needs text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists skincare_ingredients_sort_idx on skincare_ingredients (sort_order);
alter table skincare_ingredients enable row level security;
create policy "Lecture publique de la bibliotheque skincare" on skincare_ingredients for select using (true);

create table if not exists reputation_tiers (
  id text primary key,
  label text not null,
  min_points integer not null,
  sort_order integer not null default 0
);

alter table reputation_tiers enable row level security;
create policy "Lecture publique des paliers de reputation" on reputation_tiers for select using (true);

insert into reputation_tiers (id, label, min_points, sort_order) values
  ('debutant', 'Debutant', 0, 0),
  ('ltn', 'LTN', 3, 1),
  ('mtn', 'MTN', 10, 2),
  ('htn', 'HTN', 25, 3)
on conflict (id) do nothing;

create table if not exists app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table app_settings enable row level security;
create policy "Lecture publique des reglages" on app_settings for select using (true);

insert into app_settings (key, value) values
  ('chad_slots', '5'),
  ('chad_min_points', '25'),
  ('media_unlock_threshold', '200')
on conflict (key) do nothing;

create table if not exists community_point_adjustments (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  points integer not null,
  reason text not null,
  created_by text not null,
  created_at timestamptz not null default now()
);

create index if not exists community_point_adjustments_user_idx on community_point_adjustments (user_id);
alter table community_point_adjustments enable row level security;
