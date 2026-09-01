/**
 * Gabarits HTML des e-mails de demande de devis.
 *
 * Contraintes propres à l'e-mail, d'où le style « à l'ancienne » :
 *  - mise en page en `<table>` (Outlook ne gère ni flex ni grid) ;
 *  - styles *inline* uniquement (les `<style>` sont souvent supprimés) ;
 *  - couleurs en hexadécimal plein, pas de variables CSS ;
 *  - polices système avec repli, les webfonts n'étant pas chargées ;
 *  - toujours une version texte brut en parallèle.
 *
 * Toute donnée utilisateur passe par `escapeHtml` avant interpolation :
 * aucune injection HTML n'est possible dans ces gabarits.
 */

import { formatPhoneFr, type DevisData } from "@/lib/devis-schema";
import { site } from "@/lib/site";

/* -------------------------------------------------------------------------- */
/*  Couleurs de marque (miroir de `app/globals.css`)                           */
/* -------------------------------------------------------------------------- */

const C = {
  bg: "#121c16",
  panel: "#182720",
  panelAlt: "#1e2f25",
  border: "#2a3f31",
  gold: "#b7a45c",
  text: "#f2efe6",
  muted: "#a9b8a3",
} as const;

const FONT_SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const FONT_DISPLAY = "Georgia, 'Times New Roman', Times, serif";

/* -------------------------------------------------------------------------- */
/*  Utilitaires d'échappement                                                  */
/* -------------------------------------------------------------------------- */

/** Échappe les caractères sensibles pour une insertion sûre en HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Échappe puis convertit les retours à la ligne en `<br />`. */
function escapeMultiline(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

/** Résultat prêt à être passé à l'API Resend. */
export interface BuiltEmail {
  subject: string;
  html: string;
  text: string;
}

/** Contexte de génération des e-mails. */
export interface DevisEmailContext {
  data: DevisData;
  /** Date de réception de la demande. */
  receivedAt?: Date;
  /** User-Agent du visiteur — e-mail interne uniquement. */
  userAgent?: string | null;
}

/** Date lisible en français, fuseau de Paris. */
function formatDateFr(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(date);
}

/* -------------------------------------------------------------------------- */
/*  Briques de mise en page                                                    */
/* -------------------------------------------------------------------------- */

/** Enveloppe commune : fond sombre, panneau centré de 600 px. */
function layout(opts: { preheader: string; body: string }): string {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="dark light" />
<title>${escapeHtml(site.name)}</title>
</head>
<body style="margin:0;padding:0;background-color:${C.bg};">
<!-- Pré-en-tête : visible dans la liste des messages, masqué à l'ouverture -->
<div style="display:none;font-size:1px;color:${C.bg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.bg};padding:24px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background-color:${C.panel};border:1px solid ${C.border};border-radius:2px;">
        <tr>
          <td style="padding:28px 32px 20px 32px;border-bottom:1px solid ${C.border};">
            <div style="font-family:${FONT_SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.gold};">${escapeHtml(site.regionCode)} &middot; ${escapeHtml(site.region)}</div>
            <div style="font-family:${FONT_DISPLAY};font-size:24px;line-height:1.2;color:${C.text};padding-top:6px;">${escapeHtml(site.name)}</div>
            <div style="font-family:${FONT_SANS};font-size:13px;color:${C.muted};padding-top:4px;">${escapeHtml(site.tagline)}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px 32px 32px;">${opts.body}</td>
        </tr>
        <tr>
          <td style="padding:18px 32px 24px 32px;border-top:1px solid ${C.border};font-family:${FONT_SANS};font-size:12px;line-height:1.6;color:${C.muted};">
            <strong style="color:${C.text};">${escapeHtml(site.name)}</strong> &nbsp;&middot;&nbsp;
            <a href="tel:${escapeHtml(site.phoneE164)}" style="color:${C.gold};text-decoration:none;">${escapeHtml(site.phone)}</a> &nbsp;&middot;&nbsp;
            <a href="mailto:${escapeHtml(site.email)}" style="color:${C.gold};text-decoration:none;">${escapeHtml(site.email)}</a><br />
            <a href="${escapeHtml(site.url)}" style="color:${C.muted};text-decoration:underline;">${escapeHtml(site.url.replace(/^https?:\/\//, ""))}</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/** Une ligne du tableau récapitulatif. */
function row(label: string, valueHtml: string): string {
  return `<tr>
  <td style="padding:10px 14px;border-bottom:1px solid ${C.border};font-family:${FONT_SANS};font-size:12px;color:${C.muted};white-space:nowrap;vertical-align:top;width:34%;">${escapeHtml(label)}</td>
  <td style="padding:10px 14px;border-bottom:1px solid ${C.border};font-family:${FONT_SANS};font-size:14px;color:${C.text};vertical-align:top;">${valueHtml}</td>
</tr>`;
}

/** Titre de section en or. */
function heading(text: string): string {
  return `<div style="font-family:${FONT_DISPLAY};font-size:20px;line-height:1.3;color:${C.text};margin:0 0 14px 0;">${escapeHtml(text)}</div>`;
}

/** Paragraphe courant. */
function paragraph(html: string): string {
  return `<p style="margin:0 0 14px 0;font-family:${FONT_SANS};font-size:14px;line-height:1.7;color:${C.text};">${html}</p>`;
}

/* -------------------------------------------------------------------------- */
/*  1. Notification interne                                                    */
/* -------------------------------------------------------------------------- */

/**
 * E-mail envoyé à l'entreprise. Le `replyTo` (posé par l'appelant) pointe sur
 * le client : un simple « Répondre » suffit pour le recontacter.
 */
export function buildNotificationEmail(ctx: DevisEmailContext): BuiltEmail {
  const { data } = ctx;
  const receivedAt = ctx.receivedAt ?? new Date();
  const lieu = data.ville ?? "Côte d'Azur";
  const tel = formatPhoneFr(data.telephone);

  const subject = `Nouvelle demande de devis — ${data.service} — ${lieu}`;

  const rows = [
    row("Nom", escapeHtml(data.nom)),
    row(
      "Téléphone",
      `<a href="tel:${escapeHtml(data.telephone)}" style="color:${C.gold};text-decoration:none;font-weight:600;">${escapeHtml(tel)}</a>`,
    ),
    row(
      "E-mail",
      `<a href="mailto:${escapeHtml(data.email)}" style="color:${C.gold};text-decoration:none;">${escapeHtml(data.email)}</a>`,
    ),
    row("Ville", escapeHtml(data.ville ?? "— non précisée —")),
    row("Prestation", `<strong>${escapeHtml(data.service)}</strong>`),
    row("Message", data.message ? escapeMultiline(data.message) : "— aucun message —"),
    row("Reçue le", escapeHtml(formatDateFr(receivedAt))),
  ];

  if (ctx.userAgent) {
    rows.push(
      row(
        "Navigateur",
        `<span style="font-size:11px;color:${C.muted};">${escapeHtml(ctx.userAgent.slice(0, 300))}</span>`,
      ),
    );
  }

  const body = `
${heading("Nouvelle demande de devis")}
${paragraph(`<strong style="color:${C.gold};">${escapeHtml(data.nom)}</strong> souhaite un devis pour&nbsp;: <strong>${escapeHtml(data.service)}</strong> — ${escapeHtml(lieu)}.`)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:${C.panelAlt};border:1px solid ${C.border};border-radius:2px;margin:6px 0 22px 0;">
${rows.join("\n")}
</table>
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="background-color:${C.gold};border-radius:2px;">
      <a href="tel:${escapeHtml(data.telephone)}" style="display:inline-block;padding:12px 22px;font-family:${FONT_SANS};font-size:14px;font-weight:600;color:${C.panel};text-decoration:none;">Appeler ${escapeHtml(tel)}</a>
    </td>
    <td style="width:10px;"></td>
    <td style="border:1px solid ${C.border};border-radius:2px;">
      <a href="mailto:${escapeHtml(data.email)}?subject=${encodeURIComponent(`Votre demande de devis — ${data.service}`)}" style="display:inline-block;padding:12px 22px;font-family:${FONT_SANS};font-size:14px;color:${C.text};text-decoration:none;">Répondre par e-mail</a>
    </td>
  </tr>
</table>
${paragraph(`<span style="font-size:12px;color:${C.muted};">Répondre directement à ce message écrit au client (${escapeHtml(data.email)}).</span>`)}`;

  const text = [
    `NOUVELLE DEMANDE DE DEVIS`,
    ``,
    `Nom        : ${data.nom}`,
    `Téléphone  : ${tel} (${data.telephone})`,
    `E-mail     : ${data.email}`,
    `Ville      : ${data.ville ?? "non précisée"}`,
    `Prestation : ${data.service}`,
    `Message    : ${data.message ?? "aucun message"}`,
    `Reçue le   : ${formatDateFr(receivedAt)}`,
    ctx.userAgent ? `Navigateur : ${ctx.userAgent.slice(0, 300)}` : null,
    ``,
    `Répondre à cet e-mail écrit directement au client.`,
    `${site.name} — ${site.phone} — ${site.url}`,
  ]
    .filter((l): l is string => l !== null)
    .join("\n");

  return { subject, html: layout({ preheader: `${data.service} — ${lieu} — ${tel}`, body }), text };
}

/* -------------------------------------------------------------------------- */
/*  2. Accusé de réception client                                              */
/* -------------------------------------------------------------------------- */

/** E-mail de confirmation envoyé au client. */
export function buildAutoReplyEmail(ctx: DevisEmailContext): BuiltEmail {
  const { data } = ctx;
  const prenom = data.nom.split(/\s+/)[0] ?? data.nom;
  const subject = `Votre demande de devis a bien été reçue — ${site.name}`;

  const body = `
${heading(`Bonjour ${prenom}, votre demande est bien arrivée.`)}
${paragraph(
  `Merci de votre confiance. Nous avons bien reçu votre demande de devis pour <strong>${escapeHtml(data.service)}</strong>${
    data.ville ? ` à ${escapeHtml(data.ville)}` : ""
  }.`,
)}
${paragraph(
  `Un membre de l'équipe l'étudie et vous répond <strong style="color:${C.gold};">sous 24&nbsp;heures</strong> (jours ouvrés) pour préciser vos besoins et, si nécessaire, convenir d'une visite sur place. Le devis est gratuit et sans engagement.`,
)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:${C.panelAlt};border:1px solid ${C.border};border-radius:2px;margin:6px 0 22px 0;">
${row("Prestation", escapeHtml(data.service))}
${row("Ville", escapeHtml(data.ville ?? "— non précisée —"))}
${row("Téléphone communiqué", escapeHtml(formatPhoneFr(data.telephone)))}
${data.message ? row("Votre message", escapeMultiline(data.message)) : ""}
</table>
${paragraph(`Votre chantier est urgent&nbsp;? Appelez-nous, c'est le plus rapide&nbsp;:`)}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
  <tr>
    <td style="background-color:${C.gold};border-radius:2px;">
      <a href="tel:${escapeHtml(site.phoneE164)}" style="display:inline-block;padding:13px 26px;font-family:${FONT_SANS};font-size:15px;font-weight:600;color:${C.panel};text-decoration:none;">${escapeHtml(site.phone)}</a>
    </td>
  </tr>
</table>
${paragraph(
  `<span style="font-size:12px;color:${C.muted};">Ce message confirme la réception de votre demande&nbsp;; il n'est pas nécessaire d'y répondre. Vos coordonnées servent uniquement à traiter votre demande de devis et ne sont jamais transmises à des tiers.</span>`,
)}`;

  const text = [
    `Bonjour ${prenom},`,
    ``,
    `Nous avons bien reçu votre demande de devis pour « ${data.service} »${data.ville ? ` à ${data.ville}` : ""}.`,
    ``,
    `Un membre de l'équipe vous répond sous 24 heures (jours ouvrés). Le devis est gratuit et sans engagement.`,
    ``,
    `Récapitulatif :`,
    `  Prestation : ${data.service}`,
    `  Ville      : ${data.ville ?? "non précisée"}`,
    `  Téléphone  : ${formatPhoneFr(data.telephone)}`,
    data.message ? `  Message    : ${data.message}` : null,
    ``,
    `Chantier urgent ? Appelez-nous au ${site.phone}.`,
    ``,
    `Ce message confirme la réception de votre demande ; il n'est pas nécessaire d'y répondre.`,
    `${site.name} — ${site.tagline}`,
    `${site.phone} — ${site.email} — ${site.url}`,
  ]
    .filter((l): l is string => l !== null)
    .join("\n");

  return {
    subject,
    html: layout({
      preheader: `Demande reçue — réponse sous 24 h. Urgence : ${site.phone}.`,
      body,
    }),
    text,
  };
}
