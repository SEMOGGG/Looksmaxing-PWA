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

-- Photo ou courte vidéo jointe à une publication (réservé aux membres à 200
-- contributions ou plus — voir MEDIA_UNLOCK_THRESHOLD dans lib/community.ts
-- et le bucket de stockage "community-media" plus bas). Les commentaires
-- restent volontairement texte seul.
alter table community_posts add column if not exists media_url text;
alter table community_posts add column if not exists media_type text check (media_type in ('image', 'video'));

-- Index pour compter rapidement les contributions par auteur (paliers
-- Nouveau/Actif/Habitué/Vérifié, déblocage photos/vidéos), calculées à la
-- volée plutôt que via un compteur dénormalisé.
create index if not exists community_posts_author_idx on community_posts (author_id);
create index if not exists community_comments_author_idx on community_comments (author_id);

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

-- Notation des commentaires ("cette astuce est utile") : alimente le score
-- de réputation (badges Débutant/LTN/MTN/HTN/Chad) au même titre que les
-- likes sur les publications, voir computeLeaderboard dans
-- app/(app)/communaute/actions.ts.
create table if not exists community_comment_votes (
  comment_id uuid not null references community_comments (id) on delete cascade,
  author_id text not null,  -- Clerk user id de la personne qui note
  created_at timestamptz not null default now(),
  primary key (comment_id, author_id)
);

alter table community_comments add column if not exists helpful_count integer not null default 0;

create index if not exists community_comment_votes_comment_idx on community_comment_votes (comment_id);

create or replace function community_sync_helpful_count()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update community_comments set helpful_count = helpful_count + 1 where id = new.comment_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update community_comments set helpful_count = greatest(helpful_count - 1, 0) where id = old.comment_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql;

drop trigger if exists community_comment_votes_after_insert on community_comment_votes;
create trigger community_comment_votes_after_insert
  after insert on community_comment_votes
  for each row execute function community_sync_helpful_count();

drop trigger if exists community_comment_votes_after_delete on community_comment_votes;
create trigger community_comment_votes_after_delete
  after delete on community_comment_votes
  for each row execute function community_sync_helpful_count();

alter table community_comment_votes enable row level security;
-- Aucune policy pour "anon" : écrit uniquement via la Server Action
-- toggleCommentVote (clé secrète), après vérification Clerk.

-- RLS : toutes les écritures passent par les Route Handlers Next.js
-- (côté serveur, avec la clé secrète), jamais directement depuis le
-- navigateur. Les lectures publiques ne remontent que les contenus
-- approuvés par la modération.
alter table community_posts enable row level security;
alter table community_comments enable row level security;
alter table community_likes enable row level security;
alter table community_reports enable row level security;

-- Marqué "traité" par un admin depuis /admin/community, sans forcément
-- avoir supprimé le contenu signalé (ex. faux signalement).
alter table community_reports add column if not exists resolved boolean not null default false;

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
  photo_data_url text,                    -- photo de face
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

-- Photo de profil (visage de côté) et photo de corps (facultative), en plus
-- de la photo de face historique (photo_data_url) : le bilan Analyse ne peut
-- évaluer posture/tonus/composition corporelle qu'avec la photo de corps.
alter table user_profiles add column if not exists photo_profile_data_url text;
alter table user_profiles add column if not exists photo_body_data_url text;

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

-- Photos utilisées pour ce bilan précis (face, profil, corps), conservées
-- pour permettre un vrai suivi photo dans le temps (page Suivi) plutôt que
-- de toujours montrer la photo actuelle du profil des deux côtés.
alter table bilans add column if not exists photo_data_url text;
alter table bilans add column if not exists photo_profile_data_url text;
alter table bilans add column if not exists photo_body_data_url text;

create index if not exists bilans_user_idx on bilans (user_id, created_at desc);

alter table bilans enable row level security;
-- Aucune policy pour le rôle "anon" : lu/écrit uniquement par les Server
-- Actions serveur, après vérification Clerk + statut Premium.

-- Bucket de stockage pour les photos/vidéos envoyées dans la Communauté.
-- Public en lecture (les fichiers ont un nom aléatoire imprévisible et ne
-- sont référencés que depuis les publications déjà passées par la
-- modération IA) ; aucune policy d'écriture pour "anon"/"authenticated" —
-- l'upload passe uniquement par la Server Action createPost, avec la clé
-- secrète qui contourne RLS, après modération du contenu.
insert into storage.buckets (id, name, public)
values ('community-media', 'community-media', true)
on conflict (id) do nothing;

-- ============================================================================
-- Back-office admin : bascule le contenu jusqu'ici codé en dur (articles,
-- bibliothèque skincare, paliers de réputation, réglages communauté) vers
-- des tables gérables depuis /admin, sans toucher au code source. L'accès
-- admin est vérifié côté serveur par email (voir lib/admin.ts, ADMIN_EMAILS),
-- pas par une colonne "is_admin" : plus simple à bootstrapper pour un seul
-- opérateur, et toutes les Server Actions admin revérifient de toute façon.
-- ============================================================================

-- Articles éditoriaux de l'onglet Communauté (remplace le tableau `articles`
-- de lib/community.ts).
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
create policy "Lecture publique des articles"
  on community_articles for select
  using (true);
-- Aucune policy insert/update/delete pour "anon" : uniquement via les
-- Server Actions admin (clé secrète), après vérification du rôle admin.

-- Bibliothèque d'ingrédients/produits skincare (remplace le tableau
-- `skincareIngredients` de lib/skincare.ts). `id` reste un slug lisible
-- (ex. "niacinamide") plutôt qu'un uuid, pour garder les ancres #id de la
-- page /skincare stables.
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
create policy "Lecture publique de la bibliothèque skincare"
  on skincare_ingredients for select
  using (true);

-- Paliers de réputation Communauté (remplace `reputationTiers` de
-- lib/community.ts) : Débutant/LTN/MTN/HTN par défaut, modifiables/
-- renommables/ajoutables depuis /admin/badges. Le palier Chad n'est PAS une
-- ligne ici : c'est un statut de classement (top N, voir app_settings
-- "chad_slots"/"chad_min_points"), pas un seuil de points fixe.
create table if not exists reputation_tiers (
  id text primary key,
  label text not null,
  min_points integer not null,
  sort_order integer not null default 0
);

alter table reputation_tiers enable row level security;
create policy "Lecture publique des paliers de réputation"
  on reputation_tiers for select
  using (true);

insert into reputation_tiers (id, label, min_points, sort_order) values
  ('debutant', 'Débutant', 0, 0),
  ('ltn', 'LTN', 3, 1),
  ('mtn', 'MTN', 10, 2),
  ('htn', 'HTN', 25, 3)
on conflict (id) do nothing;

-- Réglages globaux ajustables sans redéploiement (nombre de places Chad,
-- seuil de points pour y prétendre, seuil de contributions débloquant
-- photos/vidéos communauté). Clé/valeur plutôt que des colonnes dédiées :
-- permet d'ajouter d'autres réglages plus tard sans migration.
create table if not exists app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table app_settings enable row level security;
create policy "Lecture publique des réglages"
  on app_settings for select
  using (true);

insert into app_settings (key, value) values
  ('chad_slots', '5'),
  ('chad_min_points', '25'),
  ('media_unlock_threshold', '200')
on conflict (key) do nothing;

-- Ajustements manuels de points de réputation par un admin (bonus/malus,
-- ex. "a beaucoup aidé sur le forum externe" ou correction d'un abus de
-- vote) : s'ajoutent aux points gagnés par likes/votes plutôt que de les
-- remplacer, avec la raison conservée pour traçabilité.
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
-- Aucune policy pour "anon" : lu/écrit uniquement par les Server Actions
-- admin, après vérification du rôle admin.

-- Livre de recettes de l'onglet Nutrition (voir lib/recipes.ts). Les
-- recettes éditoriales (créées depuis /admin/recipes) partent directement en
-- statut "approved" ; les recettes proposées par les membres (formulaire
-- public sur /nutrition/recettes) partent en "pending" et n'apparaissent
-- dans le livre public qu'une fois approuvées par un admin.
create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  tags text[] not null default '{}',
  prep_minutes integer not null default 15,
  servings integer not null default 1,
  calories integer not null default 0,
  protein_g integer not null default 0,
  carbs_g integer not null default 0,
  ingredients text[] not null default '{}',
  steps text[] not null default '{}',
  tip text,
  status text not null default 'pending',
  submitted_by text,
  submitted_by_name text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recipes_status_idx on recipes (status, sort_order);
create index if not exists recipes_submitted_by_idx on recipes (submitted_by);

alter table recipes enable row level security;
create policy "Lecture publique des recettes approuvées"
  on recipes for select
  using (status = 'approved');
-- Écriture (dépôt d'une proposition, modération admin) uniquement via les
-- Server Actions, qui utilisent la clé de service et contournent RLS.
