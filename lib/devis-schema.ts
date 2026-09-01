/**
 * Schéma de validation de la demande de devis — partagé client / serveur.
 *
 * Ce module ne doit dépendre d'aucune API Node ni d'aucun secret : il est
 * importable depuis un composant client (pour les libellés et les types)
 * comme depuis la Server Action (pour la validation faisant foi).
 */

import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*  Prestations proposées dans le <select>                                     */
/* -------------------------------------------------------------------------- */

/** Options du champ « service », dans l'ordre d'affichage. */
export const SERVICES = [
  "Élagage",
  "Abattage",
  "Débroussaillage",
  "Aménagement paysager",
  "Taille de haies",
  "Création de jardin",
  "Traitement des palmiers / pelouses / oliviers",
  "Autre",
] as const;

export type Service = (typeof SERVICES)[number];

/* -------------------------------------------------------------------------- */
/*  Noms des champs du formulaire (source unique de vérité)                    */
/* -------------------------------------------------------------------------- */

/**
 * Noms des champs `name="…"`. Les deux champs anti-spam sont préfixés d'un
 * souligné pour bien les distinguer des données utilisateur.
 */
export const FIELD = {
  nom: "nom",
  telephone: "telephone",
  email: "email",
  ville: "ville",
  service: "service",
  message: "message",
  consentement: "consentement",
  /** Pot de miel : doit rester vide (les robots le remplissent). */
  honeypot: "_verif_ref",
  /** Horodatage d'affichage du formulaire (ms epoch), en clair. */
  timestamp: "_ts",
} as const;

/** Délai minimal, en millisecondes, entre l'affichage et l'envoi du formulaire. */
export const MIN_FILL_MS = 2500;

/* -------------------------------------------------------------------------- */
/*  Normalisation du téléphone français                                        */
/* -------------------------------------------------------------------------- */

/**
 * Normalise un numéro français saisi librement vers le format E.164.
 *
 * Accepte « 06 12 34 56 78 », « 06.12.34.56.78 », « 06-12-34-56-78 »,
 * « +33612345678 », « 0033 6 12 34 56 78 », « (+33) 6 12 34 56 78 »…
 *
 * @returns le numéro au format `+33XXXXXXXXX`, ou `null` si non reconnu.
 */
export function normalizePhoneFr(input: string): string | null {
  // On ne garde que les chiffres et un éventuel « + » de tête.
  const raw = input.trim();
  const plus = raw.startsWith("+") || raw.startsWith("(+");
  let digits = raw.replace(/\D/g, "");

  // Préfixes internationaux : 0033… ou +33…
  if (digits.startsWith("0033")) digits = digits.slice(4);
  else if (plus && digits.startsWith("33")) digits = digits.slice(2);
  else if (digits.startsWith("33") && digits.length === 11) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  else return null;

  // Il doit rester 9 chiffres commençant par 1-9 (métropole + mobiles + 06/07).
  if (!/^[1-9]\d{8}$/.test(digits)) return null;

  return `+33${digits}`;
}

/**
 * Met en forme un numéro E.164 français pour l'affichage : `06 12 34 56 78`.
 * Retourne l'entrée inchangée si le format n'est pas reconnu.
 */
export function formatPhoneFr(e164: string): string {
  const m = /^\+33(\d{9})$/.exec(e164);
  if (!m) return e164;
  return `0${m[1]}`.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}

/* -------------------------------------------------------------------------- */
/*  Schéma                                                                     */
/* -------------------------------------------------------------------------- */

/** Transforme une chaîne vide (ou absente) en `undefined`. */
const optionalText = (max: number, tropLong: string) =>
  z
    .string()
    .trim()
    .max(max, tropLong)
    .transform((v) => (v.length === 0 ? undefined : v))
    .optional();

export const devisSchema = z.object({
  nom: z
    .string()
    .trim()
    .min(2, "Merci d'indiquer votre nom (2 caractères minimum).")
    .max(100, "Le nom ne peut pas dépasser 100 caractères."),

  telephone: z
    .string()
    .trim()
    .min(1, "Merci d'indiquer un numéro de téléphone.")
    .max(30, "Ce numéro de téléphone est trop long.")
    .refine((v) => normalizePhoneFr(v) !== null, {
      error: "Numéro de téléphone invalide (ex. 06 12 34 56 78).",
    })
    // Stocké normalisé en E.164 : un seul format en base et dans les e-mails.
    .transform((v) => normalizePhoneFr(v) as string),

  email: z
    .string()
    .trim()
    .min(1, "Merci d'indiquer votre adresse e-mail.")
    .max(180, "Cette adresse e-mail est trop longue.")
    .toLowerCase()
    .pipe(z.email("Adresse e-mail invalide (ex. prenom.nom@exemple.fr).")),

  ville: optionalText(100, "Le nom de la ville ne peut pas dépasser 100 caractères."),

  service: z.enum(SERVICES, {
    error: "Merci de choisir la prestation souhaitée.",
  }),

  message: optionalText(4000, "Le message ne peut pas dépasser 4 000 caractères."),

  consentement: z.literal(true, {
    error: "Vous devez accepter l'utilisation de vos données pour être recontacté.",
  }),
});

/** Données validées et normalisées d'une demande de devis. */
export type DevisData = z.infer<typeof devisSchema>;

/* -------------------------------------------------------------------------- */
/*  Lecture d'un FormData                                                      */
/* -------------------------------------------------------------------------- */

/** Lit une entrée de FormData en chaîne (les fichiers sont ignorés). */
function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

/**
 * Convertit un `FormData` en objet brut prêt pour `devisSchema`.
 * Une case à cocher non cochée n'est pas envoyée : on la mappe donc sur `false`.
 */
export function devisFormDataToRaw(fd: FormData): Record<string, unknown> {
  return {
    nom: str(fd, FIELD.nom),
    telephone: str(fd, FIELD.telephone),
    email: str(fd, FIELD.email),
    ville: str(fd, FIELD.ville),
    service: str(fd, FIELD.service),
    message: str(fd, FIELD.message),
    consentement: str(fd, FIELD.consentement) === "on",
  };
}

/** Valide un `FormData` de devis. */
export function parseDevisFormData(fd: FormData) {
  return devisSchema.safeParse(devisFormDataToRaw(fd));
}

/* -------------------------------------------------------------------------- */
/*  État renvoyé par la Server Action (compatible `useActionState`)             */
/* -------------------------------------------------------------------------- */

/** Erreurs par champ, indexées par nom de champ. */
export type DevisFieldErrors = Partial<Record<keyof DevisData, string[]>>;

/** Union discriminée renvoyée par la Server Action. */
export type DevisState =
  | { ok: true }
  | { ok: false; formError?: string; fieldErrors?: DevisFieldErrors };

/**
 * État du formulaire vu du client : `null` tant qu'aucune soumission n'a eu
 * lieu, ce qui évite d'afficher des erreurs au premier rendu.
 */
export type DevisFormState = DevisState | null;

/** État initial à passer à `useActionState`. */
export const DEVIS_INITIAL_STATE: DevisFormState = null;
