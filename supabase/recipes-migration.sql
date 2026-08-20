-- Migration livre de recettes (Nutrition). A executer dans Supabase > SQL
-- Editor. Deja inclus dans supabase/schema.sql (source de verite) ; ce
-- fichier est juste une copie pratique pour eviter les soucis de guillemets
-- lors d'un copier-coller depuis le chat.

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
create policy "Lecture publique des recettes approuvees" on recipes for select using (status = 'approved');
