-- Schéma Supabase pour l'espace Communauté de Faciem.
-- À exécuter dans l'éditeur SQL du projet Supabase (ou via `supabase db push`
-- une fois la CLI configurée avec l'URL du projet).
--
-- Les identifiants d'utilisateur référencent l'id Clerk (texte), Clerk étant
-- la source de vérité pour l'authentification — pas de table "users" propre
-- à Supabase ici.

create extension if not exists "pgcrypto";

create type moderation_status as enum ('approved', 'pending', 'flagged', 'removed');
create type post_category as enum ('apparence', 'nutrition', 'cardio', 'style', 'general');

create table if not exists community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id text not null,              -- Clerk user id
  author_display_name text not null,
  category post_category not null default 'general',
  content text not null,
  moderation_status moderation_status not null default 'pending',
  moderation_reason text,
  likes_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references community_posts (id) on delete cascade,
  author_id text not null,
  author_display_name text not null,
  content text not null,
  moderation_status moderation_status not null default 'pending',
  moderation_reason text,
  created_at timestamptz not null default now()
);

create table if not exists community_likes (
  post_id uuid not null references community_posts (id) on delete cascade,
  author_id text not null,
  created_at timestamptz not null default now(),
  primary key (post_id, author_id)
);

create table if not exists community_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references community_posts (id) on delete cascade,
  comment_id uuid references community_comments (id) on delete cascade,
  reporter_id text not null,
  reason text,
  created_at timestamptz not null default now(),
  check (
    (post_id is not null and comment_id is null) or
    (post_id is null and comment_id is not null)
  )
);

create index if not exists community_posts_status_idx on community_posts (moderation_status, created_at desc);
create index if not exists community_comments_post_idx on community_comments (post_id, created_at asc);

-- RLS : toutes les écritures passent par les Route Handlers Next.js
-- (côté serveur, avec la clé secrète), jamais directement depuis le
-- navigateur. Les lectures publiques ne remontent que les contenus
-- approuvés par la modération.
alter table community_posts enable row level security;
alter table community_comments enable row level security;
alter table community_likes enable row level security;
alter table community_reports enable row level security;

create policy "Lecture publique des posts approuvés"
  on community_posts for select
  using (moderation_status = 'approved');

create policy "Lecture publique des commentaires approuvés"
  on community_comments for select
  using (moderation_status = 'approved');

-- Aucune policy INSERT/UPDATE/DELETE pour le rôle "anon" : ces opérations
-- ne sont possibles qu'avec la clé secrète (service role), utilisée
-- uniquement dans les Route Handlers serveur, après vérification Clerk
-- et modération du contenu.
