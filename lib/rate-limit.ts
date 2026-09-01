/**
 * Limiteur de débit à fenêtre glissante, en mémoire.
 *
 * LIMITE ASSUMÉE : l'état vit dans une `Map` au niveau du module, donc dans la
 * mémoire d'une seule instance (« lambda ») du serveur. En environnement
 * serverless (Vercel), plusieurs instances coexistent et sont recyclées à
 * froid : le compteur n'est donc ni global ni durable. C'est suffisant ici,
 * car ce limiteur n'est qu'une des trois couches anti-spam (pot de miel +
 * horodatage + débit) et vise seulement à absorber les rafales évidentes.
 * Pour une garantie stricte, il faudrait un stockage partagé (Upstash Redis,
 * table Supabase, Vercel KV…).
 */

/** Horodatages (ms) des requêtes récentes, par clé. */
const hits = new Map<string, number[]>();

/** Nombre de requêtes autorisées par fenêtre. */
export const RATE_LIMIT_MAX = 5;

/** Durée de la fenêtre glissante, en millisecondes (10 minutes). */
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

/** Au-delà de ce nombre de clés suivies, on purge les entrées expirées. */
const MAX_TRACKED_KEYS = 5_000;

export interface RateLimitResult {
  /** Vrai si la requête est autorisée. */
  allowed: boolean;
  /** Requêtes restantes dans la fenêtre courante. */
  remaining: number;
  /** Secondes à attendre avant un nouvel essai (0 si autorisé). */
  retryAfterSeconds: number;
}

/**
 * Consomme un jeton pour la clé donnée.
 *
 * @param key    identifiant de l'appelant (IP hachée, en pratique).
 * @param max    nombre maximal de requêtes par fenêtre.
 * @param windowMs durée de la fenêtre en millisecondes.
 */
export function rateLimit(
  key: string,
  max: number = RATE_LIMIT_MAX,
  windowMs: number = RATE_LIMIT_WINDOW_MS,
): RateLimitResult {
  const now = Date.now();
  const since = now - windowMs;

  // Purge opportuniste : évite une croissance illimitée sur les instances
  // longue durée (`next start`, conteneur…).
  if (hits.size > MAX_TRACKED_KEYS) pruneExpired(since);

  const recent = (hits.get(key) ?? []).filter((t) => t > since);

  if (recent.length >= max) {
    hits.set(key, recent);
    const oldest = recent[0] ?? now;
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  recent.push(now);
  hits.set(key, recent);

  return { allowed: true, remaining: max - recent.length, retryAfterSeconds: 0 };
}

/** Supprime les clés dont toutes les entrées sont hors fenêtre. */
function pruneExpired(since: number): void {
  for (const [key, times] of hits) {
    const kept = times.filter((t) => t > since);
    if (kept.length === 0) hits.delete(key);
    else hits.set(key, kept);
  }
}

/** Réinitialise complètement l'état (utile en test). */
export function resetRateLimit(): void {
  hits.clear();
}
