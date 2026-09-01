/**
 * Fabrique de client Supabase.
 *
 * Le site est purement public : on n'utilise que la clé « publishable »
 * (anon), qui n'autorise que ce que les politiques RLS permettent — soit,
 * pour la table `devis`, l'insertion et rien d'autre (cf.
 * `supabase/migrations/0001_devis.sql`).
 *
 * La persistance est volontairement « best effort » : la source de vérité
 * d'une demande de devis reste l'e-mail envoyé via Resend. Si Supabase est
 * indisponible ou mal configuré, la demande doit malgré tout aboutir.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { hasSupabaseConfig, publicEnv } from "@/lib/env";

let cached: SupabaseClient | null = null;

/**
 * Retourne un client Supabase partagé, ou `null` si la configuration est
 * absente (build local sans `.env.local`, par exemple).
 *
 * Aucune session n'est persistée : chaque appel est anonyme et sans état, ce
 * qui est le comportement attendu côté serveur.
 */
export function getSupabase(): SupabaseClient | null {
  if (cached) return cached;
  if (!hasSupabaseConfig()) return null;

  cached = createClient(publicEnv.supabaseUrl, publicEnv.supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { "x-application-name": "sudestpaysage-web" },
    },
  });

  return cached;
}
