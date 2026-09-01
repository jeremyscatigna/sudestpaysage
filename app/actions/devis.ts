"use server";

/**
 * Server Action de la demande de devis.
 *
 * Enchaînement, du moins coûteux au plus coûteux :
 *   1. anti-spam pot de miel      (rejet silencieux)
 *   2. anti-spam horodatage       (formulaire rempli trop vite)
 *   3. limitation de débit par IP (fenêtre glissante en mémoire)
 *   4. validation zod             (erreurs par champ, en français)
 *   5. e-mail de notification     — CRITIQUE : son échec fait échouer l'action
 *   6. accusé de réception client — best effort
 *   7. enregistrement Supabase    — best effort
 *
 * L'e-mail de notification est la source de vérité de la demande. La ligne en
 * base n'est qu'un bonus : la table `devis` peut ne pas encore exister (la
 * migration doit être jouée à la main dans l'éditeur SQL Supabase) et la clé
 * publishable ne peut pas la créer. Toute erreur d'insertion est donc journalisée
 * côté serveur puis ignorée.
 *
 * Aucun détail interne (message d'exception, variable d'environnement, clé…)
 * n'est renvoyé au client : uniquement des messages génériques en français.
 */

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { Resend } from "resend";

import { serverEnv } from "@/lib/env";
import {
  FIELD,
  MIN_FILL_MS,
  parseDevisFormData,
  type DevisData,
  type DevisFieldErrors,
  type DevisState,
} from "@/lib/devis-schema";
import { buildAutoReplyEmail, buildNotificationEmail } from "@/lib/emails/devis-emails";
import { rateLimit } from "@/lib/rate-limit";
import { getSupabase } from "@/lib/supabase";

/* -------------------------------------------------------------------------- */
/*  Messages génériques exposés au client                                     */
/* -------------------------------------------------------------------------- */

const MSG = {
  invalide: "Certains champs sont incomplets ou incorrects. Merci de vérifier.",
  robot:
    "Votre demande a été envoyée trop rapidement pour être traitée. Merci de réessayer dans quelques secondes.",
  tropDeDemandes:
    "Vous avez envoyé plusieurs demandes de suite. Merci de patienter quelques minutes, ou de nous appeler directement au 06 88 90 66 14.",
  indisponible:
    "L'envoi a échoué pour une raison technique. Merci de nous appeler au 06 88 90 66 14 ou d'écrire à sud-estpaysage@outlook.fr.",
} as const;

/* -------------------------------------------------------------------------- */
/*  Utilitaires                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Extrait l'IP du client depuis les en-têtes du proxy.
 * `x-forwarded-for` peut contenir une chaîne d'IP : la première est le client.
 */
function clientIp(h: Headers): string {
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip")?.trim() ?? "inconnue";
}

/**
 * Hache l'IP en SHA-256 salé : on ne stocke et on ne journalise jamais l'IP en
 * clair (donnée personnelle au sens du RGPD).
 */
function hashIp(ip: string, salt: string | undefined): string {
  return createHash("sha256")
    .update(`${salt ?? "sudestpaysage"}:${ip}`)
    .digest("hex")
    .slice(0, 32);
}

/** Journalisation serveur uniforme et préfixée. */
function log(message: string, error?: unknown): void {
  if (error === undefined) console.warn(`[devis] ${message}`);
  else console.error(`[devis] ${message}`, error);
}

/** Enregistre la demande en base — sans jamais faire échouer l'action. */
async function persistBestEffort(
  data: DevisData,
  meta: { ipHash: string; userAgent: string | null },
): Promise<void> {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      log("Supabase non configuré : enregistrement ignoré.");
      return;
    }

    const { error } = await supabase.from("devis").insert({
      nom: data.nom,
      telephone: data.telephone,
      email: data.email,
      ville: data.ville ?? null,
      service: data.service,
      message: data.message ?? null,
      ip_hash: meta.ipHash,
      user_agent: meta.userAgent,
    });

    if (error) {
      // Cas attendu tant que la migration n'a pas été jouée : PGRST205
      // (« table introuvable dans le cache de schéma »).
      log(`Insertion Supabase échouée (${error.code ?? "sans code"}) : ${error.message}`);
    }
  } catch (err) {
    log("Insertion Supabase impossible (exception).", err);
  }
}

/* -------------------------------------------------------------------------- */
/*  Action                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Traite une demande de devis.
 *
 * Signature compatible `useActionState` : `(étatPrécédent, formData) => état`.
 * L'état précédent n'est pas utilisé, chaque soumission étant indépendante.
 */
export async function submitDevis(
  _prevState: DevisState | null,
  formData: FormData,
): Promise<DevisState> {
  /* --- 1. Pot de miel ---------------------------------------------------- */
  // Champ invisible pour les humains comme pour les lecteurs d'écran : s'il est
  // rempli, c'est un robot. On répond « ok » sans rien envoyer, pour ne donner
  // aucun signal exploitable au spammeur (rejet silencieux).
  const honeypot = formData.get(FIELD.honeypot);
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    log("Pot de miel rempli : soumission rejetée silencieusement.");
    return { ok: true };
  }

  /* --- 2. Horodatage ---------------------------------------------------- */
  // Le champ est posé côté client au montage. S'il est absent (JavaScript
  // désactivé), on ne bloque pas : le formulaire doit rester utilisable.
  const rawTs = formData.get(FIELD.timestamp);
  const openedAt = typeof rawTs === "string" ? Number.parseInt(rawTs, 10) : Number.NaN;
  if (Number.isFinite(openedAt) && Date.now() - openedAt < MIN_FILL_MS) {
    log("Formulaire soumis trop vite : soumission refusée.");
    return { ok: false, formError: MSG.robot };
  }

  /* --- 3. Limitation de débit ------------------------------------------- */
  const h = await headers();
  const userAgent = h.get("user-agent");
  let ipHash = "sans-ip";
  try {
    const { IP_HASH_SALT } = serverEnv();
    ipHash = hashIp(clientIp(h), IP_HASH_SALT);
  } catch {
    // Environnement incomplet : on hache quand même pour le limiteur, la
    // vérification stricte des variables a lieu juste avant l'envoi.
    ipHash = hashIp(clientIp(h), undefined);
  }

  const limit = rateLimit(ipHash);
  if (!limit.allowed) {
    log(`Limite de débit atteinte (nouvel essai dans ${limit.retryAfterSeconds}s).`);
    return { ok: false, formError: MSG.tropDeDemandes };
  }

  /* --- 4. Validation ---------------------------------------------------- */
  const parsed = parseDevisFormData(formData);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as DevisFieldErrors;
    return { ok: false, formError: MSG.invalide, fieldErrors };
  }
  const data = parsed.data;

  /* --- 5. E-mail de notification (critique) ----------------------------- */
  let env: ReturnType<typeof serverEnv>;
  try {
    env = serverEnv();
  } catch (err) {
    log("Variables d'environnement invalides : envoi impossible.", err);
    return { ok: false, formError: MSG.indisponible };
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const receivedAt = new Date();
  const notification = buildNotificationEmail({ data, receivedAt, userAgent });

  try {
    const { data: sent, error } = await resend.emails.send({
      from: env.RESEND_FROM,
      to: [env.DEVIS_TO_EMAIL],
      // Un simple « Répondre » depuis la boîte de l'entreprise écrit au client.
      replyTo: data.email,
      subject: notification.subject,
      html: notification.html,
      text: notification.text,
    });

    if (error) {
      log(`Resend a refusé la notification : ${error.name} — ${error.message}`);
      return { ok: false, formError: MSG.indisponible };
    }
    log(`Notification envoyée (id ${sent?.id ?? "inconnu"}).`);
  } catch (err) {
    log("Envoi de la notification impossible (exception).", err);
    return { ok: false, formError: MSG.indisponible };
  }

  /* --- 6. Accusé de réception client (best effort) ---------------------- */
  const autoReply = buildAutoReplyEmail({ data, receivedAt });
  try {
    const { error } = await resend.emails.send({
      from: env.RESEND_FROM,
      to: [data.email],
      replyTo: env.DEVIS_TO_EMAIL,
      subject: autoReply.subject,
      html: autoReply.html,
      text: autoReply.text,
    });
    if (error) {
      log(`Accusé de réception non envoyé : ${error.name} — ${error.message}`);
    }
  } catch (err) {
    log("Accusé de réception non envoyé (exception).", err);
  }

  /* --- 7. Enregistrement en base (best effort) -------------------------- */
  await persistBestEffort(data, { ipHash, userAgent });

  return { ok: true };
}
