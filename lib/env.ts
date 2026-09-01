/**
 * Accès validé aux variables d'environnement.
 *
 * Deux familles bien distinctes :
 *  - `publicEnv` : variables `NEXT_PUBLIC_*`, inlinées au build, lisibles côté client.
 *  - `serverEnv()` : secrets serveur, lus paresseusement pour ne jamais finir
 *    dans le bundle client et pour ne pas casser le build si une clé manque.
 */

import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*  Variables publiques                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Les `NEXT_PUBLIC_*` doivent être référencées statiquement (`process.env.X`)
 * pour que Next puisse les remplacer au build : pas d'accès dynamique ici.
 */
export const publicEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.sudestpaysage.fr",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
} as const;

/** Vrai si les deux variables Supabase sont présentes. */
export function hasSupabaseConfig(): boolean {
  return publicEnv.supabaseUrl.length > 0 && publicEnv.supabaseKey.length > 0;
}

/* -------------------------------------------------------------------------- */
/*  Variables serveur                                                          */
/* -------------------------------------------------------------------------- */

const serverEnvSchema = z.object({
  /** Clé API Resend (secrète). */
  RESEND_API_KEY: z
    .string()
    .trim()
    .min(1, "RESEND_API_KEY est manquante")
    .startsWith("re_", "RESEND_API_KEY doit commencer par « re_ »"),

  /**
   * Expéditeur des e-mails, au format « Nom (adresse@domaine) ».
   *
   * IMPORTANT : seul le domaine `magnet.wtf` est vérifié dans ce compte Resend ;
   * `sudestpaysage.fr` ne l'est pas encore. L'expéditeur est donc entièrement
   * piloté par cette variable : quand le domaine définitif sera vérifié chez
   * Resend, il suffira de changer cette seule ligne (ici et sur Vercel), sans
   * toucher au code.
   */
  RESEND_FROM: z.string().trim().min(1, "RESEND_FROM est manquante"),

  /** Destinataire des demandes de devis (boîte de l'entreprise). */
  DEVIS_TO_EMAIL: z.email("DEVIS_TO_EMAIL doit être une adresse e-mail valide"),

  /**
   * Sel de hachage des adresses IP (optionnel mais recommandé).
   * On ne stocke jamais l'IP en clair : seulement un SHA-256 salé.
   */
  IP_HASH_SALT: z.string().trim().min(8).optional(),
});

/** Forme validée des variables serveur. */
export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

/**
 * Retourne les variables serveur validées.
 *
 * Lève une erreur explicite (destinée aux logs serveur uniquement, jamais au
 * client) listant les clés fautives. Le résultat est mis en cache après le
 * premier appel réussi.
 */
export function serverEnv(): ServerEnv {
  if (cached) return cached;

  const parsed = serverEnvSchema.safeParse({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM: process.env.RESEND_FROM,
    DEVIS_TO_EMAIL: process.env.DEVIS_TO_EMAIL,
    IP_HASH_SALT: process.env.IP_HASH_SALT,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `${i.path.join(".") || "(racine)"} : ${i.message}`)
      .join(" | ");
    throw new Error(`Configuration d'environnement invalide — ${details}`);
  }

  cached = parsed.data;
  return cached;
}
