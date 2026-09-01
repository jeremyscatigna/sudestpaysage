"use client";

/**
 * Formulaire de demande de devis.
 *
 * Amélioration progressive : c'est un vrai `<form action={…}>` relié à une
 * Server Action. Sans JavaScript, la soumission fonctionne (rechargement de
 * page) ; avec JavaScript, `useActionState` et `useFormStatus` apportent l'état
 * d'envoi, les erreurs par champ et le panneau de confirmation sans rechargement.
 *
 * Accessibilité : chaque champ a un vrai `<label htmlFor>`, `aria-invalid` et
 * `aria-describedby` pointant sur son message d'erreur ; la zone de résultat est
 * une région `role="status" aria-live="polite"` qui reçoit le focus à la fin de
 * la soumission.
 */

import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useFormStatus } from "react-dom";

import { submitDevis } from "@/app/actions/devis";
import {
  DEVIS_INITIAL_STATE,
  FIELD,
  SERVICES,
  type DevisFieldErrors,
  type Service,
} from "@/lib/devis-schema";
import { site, telHref } from "@/lib/site";

/* -------------------------------------------------------------------------- */
/*  Classes partagées                                                          */
/* -------------------------------------------------------------------------- */

const INPUT_BASE =
  "w-full bg-forest-900 border border-white/15 rounded-sm px-3.5 py-3 text-[15px] text-sage-100 placeholder:text-sage-700 transition-colors focus:border-gold/70 focus:outline-none disabled:opacity-60";
const INPUT_ERROR = "border-[#e08a82]";
const LABEL = "block text-[13px] text-sage-600 mb-1.5";
const ERROR_TEXT = "mt-1.5 text-[12.5px] text-[#f0a9a2]";

/* -------------------------------------------------------------------------- */
/*  Bouton d'envoi                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Bouton de soumission. Composant séparé car `useFormStatus` ne renseigne
 * l'état que pour un descendant du `<form>`.
 */
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-sm bg-gold px-6 py-4 text-[15px] font-semibold text-forest-900 transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Envoi en cours…" : "Demander mon devis gratuit"}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Formulaire                                                                 */
/* -------------------------------------------------------------------------- */

export interface DevisFormProps {
  /** Classes supplémentaires sur le panneau. */
  className?: string;
  /** Titre affiché au-dessus des champs (masquer avec `null`). */
  heading?: string | null;
  /** Phrase d'introduction sous le titre. */
  intro?: string | null;
  /** Prestation présélectionnée — pratique sur les pages service / ville. */
  defaultService?: Service;
}

/** Valeurs des champs texte, conservées côté client. */
interface Values {
  nom: string;
  telephone: string;
  email: string;
  ville: string;
  service: string;
  message: string;
}

const EMPTY_VALUES: Values = {
  nom: "",
  telephone: "",
  email: "",
  ville: "",
  service: "",
  message: "",
};

export function DevisForm({
  className = "",
  heading = "Demander un devis gratuit",
  intro = "Réponse sous 24 h, devis gratuit et sans engagement. Décrivez votre projet, nous vous rappelons.",
  defaultService,
}: DevisFormProps) {
  const [state, formAction] = useActionState(submitDevis, DEVIS_INITIAL_STATE);

  // Champs contrôlés : React 19 réinitialise un formulaire non contrôlé après
  // l'exécution d'une action. Les garder contrôlés préserve la saisie de
  // l'utilisateur quand la validation serveur renvoie des erreurs.
  const [values, setValues] = useState<Values>({
    ...EMPTY_VALUES,
    service: defaultService ?? "",
  });
  const [consentement, setConsentement] = useState(false);

  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  const timestampRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  // Horodatage posé au montage (et non au rendu serveur) : la page peut être
  // préchargée ou mise en cache, seule la vue réelle nous intéresse.
  useEffect(() => {
    if (timestampRef.current) timestampRef.current.value = String(Date.now());
  }, []);

  // Déplace le focus sur la zone de résultat à la fin d'une soumission.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    resultRef.current?.focus();
  }, [state]);

  const set =
    <K extends keyof Values>(key: K) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setValues((prev) => ({ ...prev, [key]: event.target.value }));

  const fieldErrors: DevisFieldErrors = (state && !state.ok && state.fieldErrors) || {};
  const errorOf = (name: keyof DevisFieldErrors): string | undefined =>
    fieldErrors[name]?.[0];

  /**
   * Attributs ARIA d'un champ en erreur : `aria-invalid` et le lien vers le
   * message d'erreur correspondant.
   */
  const aria = (name: keyof DevisFieldErrors) => {
    const message = errorOf(name);
    return {
      "aria-invalid": message ? (true as const) : undefined,
      "aria-describedby": message ? id(`${name}-error`) : undefined,
    };
  };

  /* --- Confirmation ------------------------------------------------------ */

  if (state?.ok) {
    return (
      <div
        className={`bg-forest-600 rounded-sm p-8 sm:p-11 ${className}`}
        role="status"
        aria-live="polite"
      >
        <div ref={resultRef} tabIndex={-1} className="focus:outline-none">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
            Demande envoyée
          </p>
          <h2 className="font-display text-2xl sm:text-3xl text-sage-100 mt-3">
            Merci, votre demande est bien arrivée.
          </h2>
          <p className="text-[15px] leading-relaxed text-sage-500 mt-4 max-w-prose">
            Un e-mail de confirmation vient de vous être adressé. Nous étudions votre
            projet et vous répondons <strong className="text-sage-100">sous 24 heures</strong>{" "}
            (jours ouvrés).
          </p>
          <p className="text-[15px] leading-relaxed text-sage-500 mt-3 max-w-prose">
            Votre chantier est urgent ? Le téléphone reste le plus rapide :
          </p>
          <a
            href={telHref()}
            className="mt-5 inline-block bg-gold text-forest-900 font-semibold text-[15px] rounded-sm px-6 py-3.5 transition-colors hover:bg-gold-dark"
          >
            Appeler le {site.phone}
          </a>
        </div>
      </div>
    );
  }

  /* --- Formulaire -------------------------------------------------------- */

  return (
    <div className={`bg-forest-600 rounded-sm p-8 sm:p-11 ${className}`}>
      {heading ? (
        <h2 className="font-display text-2xl sm:text-3xl text-sage-100">{heading}</h2>
      ) : null}
      {intro ? (
        <p className="text-[15px] leading-relaxed text-sage-500 mt-3 max-w-prose">{intro}</p>
      ) : null}

      <form action={formAction} className={heading || intro ? "mt-7" : ""}>
        {/* Pot de miel : hors écran, hors ordre de tabulation et masqué aux
            lecteurs d'écran. Un humain ne peut pas le remplir. */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
            whiteSpace: "nowrap",
          }}
        >
          <label htmlFor={id("hp")}>Ne pas remplir ce champ</label>
          <input
            id={id("hp")}
            type="text"
            name={FIELD.honeypot}
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </div>

        {/* Horodatage d'ouverture, renseigné au montage côté client. */}
        <input ref={timestampRef} type="hidden" name={FIELD.timestamp} defaultValue="" />

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Nom */}
          <div>
            <label htmlFor={id("nom")} className={LABEL}>
              Nom et prénom <span aria-hidden="true">*</span>
            </label>
            <input
              id={id("nom")}
              name={FIELD.nom}
              type="text"
              required
              maxLength={100}
              autoComplete="name"
              placeholder="Jean Dupont"
              value={values.nom}
              onChange={set("nom")}
              className={`${INPUT_BASE} ${errorOf("nom") ? INPUT_ERROR : ""}`}
              {...aria("nom")}
            />
            {errorOf("nom") ? (
              <p id={id("nom-error")} className={ERROR_TEXT}>
                {errorOf("nom")}
              </p>
            ) : null}
          </div>

          {/* Téléphone */}
          <div>
            <label htmlFor={id("telephone")} className={LABEL}>
              Téléphone <span aria-hidden="true">*</span>
            </label>
            <input
              id={id("telephone")}
              name={FIELD.telephone}
              type="tel"
              required
              maxLength={30}
              autoComplete="tel"
              inputMode="tel"
              placeholder="06 12 34 56 78"
              value={values.telephone}
              onChange={set("telephone")}
              className={`${INPUT_BASE} ${errorOf("telephone") ? INPUT_ERROR : ""}`}
              {...aria("telephone")}
            />
            {errorOf("telephone") ? (
              <p id={id("telephone-error")} className={ERROR_TEXT}>
                {errorOf("telephone")}
              </p>
            ) : null}
          </div>

          {/* E-mail */}
          <div>
            <label htmlFor={id("email")} className={LABEL}>
              E-mail <span aria-hidden="true">*</span>
            </label>
            <input
              id={id("email")}
              name={FIELD.email}
              type="email"
              required
              maxLength={180}
              autoComplete="email"
              inputMode="email"
              placeholder="jean.dupont@exemple.fr"
              value={values.email}
              onChange={set("email")}
              className={`${INPUT_BASE} ${errorOf("email") ? INPUT_ERROR : ""}`}
              {...aria("email")}
            />
            {errorOf("email") ? (
              <p id={id("email-error")} className={ERROR_TEXT}>
                {errorOf("email")}
              </p>
            ) : null}
          </div>

          {/* Ville */}
          <div>
            <label htmlFor={id("ville")} className={LABEL}>
              Ville <span className="text-sage-700">(optionnel)</span>
            </label>
            <input
              id={id("ville")}
              name={FIELD.ville}
              type="text"
              maxLength={100}
              autoComplete="address-level2"
              placeholder="Nice, Cannes, Antibes…"
              value={values.ville}
              onChange={set("ville")}
              className={`${INPUT_BASE} ${errorOf("ville") ? INPUT_ERROR : ""}`}
              {...aria("ville")}
            />
            {errorOf("ville") ? (
              <p id={id("ville-error")} className={ERROR_TEXT}>
                {errorOf("ville")}
              </p>
            ) : null}
          </div>

          {/* Prestation */}
          <div className="sm:col-span-2">
            <label htmlFor={id("service")} className={LABEL}>
              Prestation souhaitée <span aria-hidden="true">*</span>
            </label>
            <select
              id={id("service")}
              name={FIELD.service}
              required
              value={values.service}
              onChange={set("service")}
              className={`${INPUT_BASE} appearance-none ${errorOf("service") ? INPUT_ERROR : ""}`}
              {...aria("service")}
            >
              <option value="" disabled>
                Choisissez une prestation…
              </option>
              {SERVICES.map((s) => (
                <option key={s} value={s} className="bg-forest-900 text-sage-100">
                  {s}
                </option>
              ))}
            </select>
            {errorOf("service") ? (
              <p id={id("service-error")} className={ERROR_TEXT}>
                {errorOf("service")}
              </p>
            ) : null}
          </div>

          {/* Message */}
          <div className="sm:col-span-2">
            <label htmlFor={id("message")} className={LABEL}>
              Votre projet <span className="text-sage-700">(optionnel)</span>
            </label>
            <textarea
              id={id("message")}
              name={FIELD.message}
              rows={5}
              maxLength={4000}
              placeholder="Décrivez votre projet : nombre d'arbres, hauteur, accès, délais souhaités…"
              value={values.message}
              onChange={set("message")}
              className={`${INPUT_BASE} resize-y ${errorOf("message") ? INPUT_ERROR : ""}`}
              {...aria("message")}
            />
            {errorOf("message") ? (
              <p id={id("message-error")} className={ERROR_TEXT}>
                {errorOf("message")}
              </p>
            ) : null}
          </div>
        </div>

        {/* Consentement RGPD */}
        <div className="mt-6">
          <div className="flex items-start gap-3">
            <input
              id={id("consentement")}
              name={FIELD.consentement}
              type="checkbox"
              required
              checked={consentement}
              onChange={(event) => setConsentement(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-gold"
              {...aria("consentement")}
            />
            <label
              htmlFor={id("consentement")}
              className="text-[13px] leading-relaxed text-sage-600"
            >
              J&apos;accepte que mes coordonnées soient utilisées pour être recontacté au
              sujet de ma demande de devis. Elles ne sont ni revendues ni transmises à
              des tiers. <span aria-hidden="true">*</span>
            </label>
          </div>
          {errorOf("consentement") ? (
            <p id={id("consentement-error")} className={ERROR_TEXT}>
              {errorOf("consentement")}
            </p>
          ) : null}
        </div>

        {/* Zone de résultat : annoncée aux lecteurs d'écran et cible du focus. */}
        <div
          ref={resultRef}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          className="focus:outline-none"
        >
          {state && !state.ok && state.formError ? (
            <p className="mt-6 border border-[#e08a82]/40 bg-[#e08a82]/10 rounded-sm px-4 py-3 text-[13.5px] leading-relaxed text-[#f0a9a2]">
              {state.formError}
            </p>
          ) : null}
        </div>

        {/* Bouton pleine largeur : le libellé est long et se coupait sur deux
            lignes dans une rangée partagée avec le rappel téléphonique. */}
        <div className="mt-7 flex flex-col gap-3">
          <SubmitButton />
          <p className="text-center text-[12.5px] leading-relaxed text-sage-700">
            Ou appelez directement le{" "}
            <a href={telHref()} className="text-gold underline-offset-2 hover:underline">
              {site.phone}
            </a>
          </p>
        </div>

        <p className="mt-4 text-[12px] text-sage-700">
          <span aria-hidden="true">*</span> Champs obligatoires.
        </p>
      </form>
    </div>
  );
}

export default DevisForm;
