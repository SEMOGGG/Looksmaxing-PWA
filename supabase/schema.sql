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

-- Le compteur likes_count est dérivé de community_likes via ce trigger,
-- plutôt qu'incrémenté manuellement depuis l'application (évite tout
-- décalage en cas d'écriture concurrente).
create or replace function community_sync_likes_count()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update community_posts set likes_count = likes_count + 1 where id = new.post_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update community_posts set likes_count = greatest(likes_count - 1, 0) where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql;

drop trigger if exists community_likes_after_insert on community_likes;
create trigger community_likes_after_insert
  after insert on community_likes
  for each row execute function community_sync_likes_count();

drop trigger if exists community_likes_after_delete on community_likes;
create trigger community_likes_after_delete
  after delete on community_likes
  for each row execute function community_sync_likes_count();

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

-- Profil utilisateur (onboarding + abonnement + forme de visage), une ligne
-- par compte Clerk. Remplace le localStorage utilisé jusque-là : dès qu'un
-- membre crée son compte à la fin de l'onboarding, ce profil est
-- accessible depuis n'importe quel appareil où il se connecte.
create table if not exists user_profiles (
  user_id text primary key,               -- Clerk user id
  plan text not null default 'free' check (plan in ('free', 'premium')),
  consent_given boolean not null default false,
  photo_data_url text,
  age text,
  sex text,
  height_cm text,
  weight_kg text,
  activity_level text,
  steps text,
  goals text[] not null default '{}',
  face_shape text,
  updated_at timestamptz not null default now()
);

alter table user_profiles enable row level security;
-- Aucune policy pour le rôle "anon" : cette table n'est lue/écrite que par
-- les Server Actions (clé secrète), jamais directement depuis le navigateur.

-- Historique du Coach IA, une ligne par message (utilisateur ou assistant).
-- Sert à la fois de mémoire de conversation (contexte envoyé au modèle,
-- borné aux derniers messages) et de compteur pour la limite quotienne
-- (comptage des messages "user" du jour, plutôt qu'une table de quota à
-- part qui pourrait se désynchroniser).
create table if not exists coach_messages (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,             -- Clerk user id
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- Tokens facturés par l'API pour cet échange (renseignés sur la ligne
-- "assistant" uniquement) : base du budget mensuel réel par utilisateur,
-- voir getMonthlyUsageCostUsd dans app/actions/coach.ts.
alter table coach_messages add column if not exists input_tokens integer;
alter table coach_messages add column if not exists output_tokens integer;

create index if not exists coach_messages_user_idx on coach_messages (user_id, created_at asc);

alter table coach_messages enable row level security;
-- Aucune policy pour le rôle "anon" : lu/écrit uniquement par la Server
-- Action app/actions/coach.ts, après vérification Clerk + statut Premium.

-- Suivi de poids : une ligne par pesée, pour le graphique de progression
-- dans l'onglet Nutrition.
create table if not exists weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,          -- Clerk user id
  weight_kg numeric not null,
  recorded_at date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, recorded_at)  -- une pesée par jour : la suivante écrase celle du jour
);

create index if not exists weight_entries_user_idx on weight_entries (user_id, recorded_at asc);

alter table weight_entries enable row level security;
-- Aucune policy pour le rôle "anon" : lu/écrit uniquement par les Server
-- Actions serveur, après vérification Clerk.

-- Estimations de composition corporelle par photo (Premium, encadrées par
-- le budget mensuel partagé, voir lib/ai-usage.ts). La photo elle-même
-- n'est jamais stockée : seule l'estimation renvoyée par le modèle est
-- conservée, avec les tokens facturés pour le calcul du budget.
create table if not exists body_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  range_low numeric,
  range_high numeric,
  notes text,
  input_tokens integer,
  output_tokens integer,
  created_at timestamptz not null default now()
);

-- Si la table existait déjà sans ces colonnes (version précédente du
-- schéma), on les ajoute sans toucher aux données existantes.
alter table body_analyses add column if not exists input_tokens integer;
alter table body_analyses add column if not exists output_tokens integer;

create index if not exists body_analyses_user_idx on body_analyses (user_id, created_at desc);

alter table body_analyses enable row level security;
-- Aucune policy pour le rôle "anon" : lu/écrit uniquement par les Server
-- Actions serveur, après vérification Clerk + statut Premium.

-- Analyses de peau par photo (Premium, même logique que body_analyses :
-- budget mensuel partagé, photo jamais stockée).
create table if not exists skin_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  points text[] not null default '{}',
  recommended_ingredients text[] not null default '{}',
  notes text,
  input_tokens integer,
  output_tokens integer,
  created_at timestamptz not null default now()
);

alter table skin_analyses add column if not exists input_tokens integer;
alter table skin_analyses add column if not exists output_tokens integer;

create index if not exists skin_analyses_user_idx on skin_analyses (user_id, created_at desc);

alter table skin_analyses enable row level security;
-- Aucune policy pour le rôle "anon" : lu/écrit uniquement par les Server
-- Actions serveur, après vérification Clerk + statut Premium.

-- Bilan Analyse (score global + catégories) généré par Claude vision à
-- partir de la photo de profil. Gratuit : 1 génération par mois civil.
-- Premium : illimité, dans les limites du budget mensuel partagé
-- (lib/ai-usage.ts). Si la personne n'a pas de photo, l'app retombe sur
-- le bilan mock basé sur les objectifs (lib/analysis.ts).
create table if not exists bilans (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  overall_score integer not null,
  categories jsonb not null,
  input_tokens integer,
  output_tokens integer,
  created_at timestamptz not null default now()
);

create index if not exists bilans_user_idx on bilans (user_id, created_at desc);

alter table bilans enable row level security;
-- Aucune policy pour le rôle "anon" : lu/écrit uniquement par les Server
-- Actions serveur, après vérification Clerk + statut Premium.
