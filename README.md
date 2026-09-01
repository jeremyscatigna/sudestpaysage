# Sud Est Paysage — site web

Site vitrine de **Sud Est Paysage**, élagueur et paysagiste dans les Alpes-Maritimes.
Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript. Déployé sur Vercel.

Le site était auparavant un ensemble de pages `.dc.html` statiques ; il a été
intégralement porté sous Next.js. Les 160 pages sont **prérendues au build**
(aucun rendu dynamique), et toutes les anciennes URLs sont redirigées en 301.

## Démarrer

```bash
npm install
cp .env.example .env.local   # puis renseigner les valeurs
npm run dev                  # http://localhost:3000
```

```bash
npm run build && npm start   # build de production
npx tsc --noEmit             # types
npx eslint .                 # lint
```

## Structure

```
app/
  page.tsx                          accueil
  services/                         les 7 prestations (ancres #elagage, …)
  traitement-phytosanitaire/        page dédiée + /[ville]
  [service]/[ville]/                84 pages service × ville
  villes/[ville]/                   21 hubs ville
  blog/, blog/[slug]/               index + 26 articles
  contact/, secteurs/               formulaire de devis, zone d'intervention
  mentions-legales/, confidentialite/
  actions/devis.ts                  Server Action du formulaire
  sitemap.ts, robots.ts
components/                         composants partagés (UI, header, footer, formulaire)
content/*.json                      tout le contenu rédactionnel, extrait de l'ancien site
lib/                                accès au contenu, métadonnées, JSON-LD, e-mails, env
supabase/migrations/                schéma SQL
```

Le contenu vit dans `content/*.json` et n'est lu qu'au build via `lib/content.ts`.
Pour modifier un texte, éditer le JSON — aucun composant à toucher.

## URLs et redirections

| Type | URL |
| --- | --- |
| Prestation | `/services#elagage` |
| Traitement phytosanitaire | `/traitement-phytosanitaire` |
| Service × ville | `/elagage/nice`, `/amenagement-paysager/cagnes-sur-mer` |
| Hub ville | `/villes/nice` |
| Article | `/blog/olivier-taille-entretien` |

`next.config.ts` déclare **313 redirections 301** couvrant chaque ancienne URL
(`/elagage-nice.dc.html` et `/elagage-nice` → `/elagage/nice`), générées
automatiquement depuis `content/*.json` : ajouter une ville ou un article étend
la carte de redirections sans intervention manuelle.

## Formulaire de devis

`/contact` → `app/actions/devis.ts` (Server Action).

1. Validation Zod côté serveur (`lib/devis-schema.ts`), messages en français.
2. Trois garde-fous anti-spam : honeypot, délai minimum de saisie, limite par IP.
3. Envoi de deux e-mails via Resend : notification interne (avec `replyTo` du
   client) et accusé de réception au client.
4. Archivage Supabase **best effort** : un échec est journalisé mais n'empêche
   jamais l'envoi de l'e-mail, qui reste la source de vérité.

Le formulaire est un vrai `<form action={…}>` : il fonctionne sans JavaScript.

### Variables d'environnement

À déclarer dans `.env.local` **et** sur Vercel (Production + Preview) — voir
`.env.example` pour le détail commenté :

```
RESEND_API_KEY  RESEND_FROM  DEVIS_TO_EMAIL  IP_HASH_SALT
NEXT_PUBLIC_SITE_URL  NEXT_PUBLIC_SUPABASE_URL  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

### Deux actions manuelles restantes

1. **Créer la table Supabase** : coller `supabase/migrations/0001_devis.sql`
   dans l'éditeur SQL du projet Supabase. Tant que ce n'est pas fait, les
   demandes arrivent bien par e-mail mais ne sont pas archivées (une ligne
   `PGRST205` est journalisée à chaque envoi).
2. **Vérifier le domaine chez Resend** : `sudestpaysage.fr` n'est pas encore
   vérifié, l'expéditeur est donc provisoirement `devis@magnet.wtf`. Une fois le
   domaine vérifié, changer la seule variable `RESEND_FROM`.

## Contenu à compléter

### Mentions légales — obligation LCEN

Trois informations obligatoires sont **volontairement absentes** de la page
`/mentions-legales` faute d'être connues : **forme juridique**, **numéro SIRET**
et **adresse du siège**. Les ajouter dans `content/static.json` →
`mentions-legales.blocks[0].paras`, sur le modèle des lignes existantes :

```json
"Forme juridique : EURL",
"SIRET : 000 000 000 00000",
"Adresse : 1 rue Exemple, 06000 Nice",
```


La section fondateur (`content/home.json` → `founder`) est volontairement
factuelle : aucune date, aucun diplôme, aucun chiffre n'a été inventé. Restent à
renseigner l'année de création, la formation et les certifications, ainsi qu'un
portrait photo (à déposer dans `public/uploads/` puis à référencer).
