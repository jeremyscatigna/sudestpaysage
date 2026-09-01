-- =============================================================================
--  0001_devis.sql — Table des demandes de devis
-- =============================================================================
--  À exécuter tel quel dans l'éditeur SQL de Supabase (Dashboard > SQL Editor).
--  La clé « publishable » (anon) utilisée par le site ne peut pas créer d'objets :
--  cette migration doit donc être jouée manuellement, une seule fois.
--
--  Principe de sécurité : le site public ne doit pouvoir QUE écrire. RLS est
--  activé avec une unique politique INSERT pour le rôle `anon` et AUCUNE
--  politique SELECT / UPDATE / DELETE. Conséquence : même en cas de fuite de la
--  clé publishable, personne ne peut lire, modifier ni supprimer les demandes.
--  La lecture se fait depuis le Dashboard ou avec la clé `service_role`, qui
--  contourne RLS et ne quitte jamais le serveur.
--
--  Données personnelles (RGPD) : l'adresse IP n'est jamais stockée en clair,
--  seulement un SHA-256 salé (`ip_hash`), suffisant pour corréler des abus sans
--  identifier la personne.
-- =============================================================================

-- Nécessaire pour `gen_random_uuid()` (présent par défaut sur Supabase).
create extension if not exists "pgcrypto";

create table if not exists public.devis (
  id          uuid        primary key default gen_random_uuid(),
  created_at  timestamptz not null    default now(),

  -- Coordonnées du demandeur.
  nom         text        not null check (char_length(nom) between 2 and 100),
  -- Téléphone normalisé en E.164 par l'application, ex. « +33612345678 ».
  telephone   text        not null check (char_length(telephone) between 5 and 30),
  email       text        not null check (char_length(email) between 5 and 180),
  ville       text                 check (ville is null or char_length(ville) <= 100),

  -- Prestation demandée (libellé du <select>, texte libre volontairement :
  -- faire évoluer la liste côté application ne doit pas casser les insertions).
  service     text        not null check (char_length(service) between 2 and 120),
  message     text                 check (message is null or char_length(message) <= 4000),

  -- Métadonnées anti-abus.
  ip_hash     text                 check (ip_hash is null or char_length(ip_hash) <= 64),
  user_agent  text                 check (user_agent is null or char_length(user_agent) <= 500)
);

comment on table  public.devis            is 'Demandes de devis envoyées depuis le site public. Écriture seule via la clé anon ; l''e-mail Resend reste la source de vérité.';
comment on column public.devis.telephone  is 'Numéro normalisé en E.164 (+33XXXXXXXXX) par l''application.';
comment on column public.devis.ip_hash    is 'SHA-256 salé de l''IP du demandeur — jamais l''IP en clair (RGPD).';
comment on column public.devis.user_agent is 'User-Agent du navigateur, tronqué. Utile pour repérer les robots.';

-- ---------------------------------------------------------------------------
--  Index
-- ---------------------------------------------------------------------------

-- Consultation courante : les demandes les plus récentes d'abord.
create index if not exists devis_created_at_idx on public.devis (created_at desc);

-- Regroupement par prestation (statistiques, suivi commercial).
create index if not exists devis_service_idx    on public.devis (service);

-- Détection de doublons / relances : historique d'un même client.
create index if not exists devis_email_idx      on public.devis (lower(email));

-- Détection d'abus : plusieurs envois depuis la même origine.
create index if not exists devis_ip_hash_idx    on public.devis (ip_hash, created_at desc);

-- ---------------------------------------------------------------------------
--  Row Level Security
-- ---------------------------------------------------------------------------

alter table public.devis enable row level security;

-- On rejoue proprement la politique si la migration est relancée.
drop policy if exists "devis_insert_anon" on public.devis;

-- Insertion autorisée pour les visiteurs anonymes (clé publishable) et les
-- utilisateurs authentifiés. `with check (true)` : aucune condition sur la
-- ligne insérée, les contraintes CHECK ci-dessus suffisent.
create policy "devis_insert_anon"
  on public.devis
  for insert
  to anon, authenticated
  with check (true);

-- AUCUNE politique SELECT / UPDATE / DELETE n'est créée : avec RLS activé,
-- l'absence de politique équivaut à un refus total pour ces rôles.

-- Ceinture et bretelles : on retire les privilèges de table inutiles, pour que
-- même une future politique permissive ajoutée par erreur reste sans effet.
revoke all on public.devis from anon, authenticated;
grant insert on public.devis to anon, authenticated;
