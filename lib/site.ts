/** Configuration globale du site — source unique de vérité. */

export const site = {
  name: "Sud Est Paysage",
  legalName: "Sud Est Paysage",
  tagline: "Élagueur & paysagiste sur la Côte d'Azur",
  url: "https://www.sudestpaysage.fr",
  email: "sud-estpaysage@outlook.fr",
  phone: "06 88 90 66 14",
  phoneE164: "+33688906614",
  region: "Alpes-Maritimes",
  regionCode: "06",
  founder: "Jimmy Sahm",
  locale: "fr_FR",
  lang: "fr",
  ogImage: "/og-image.jpg",
} as const;

/** Navigation principale. */
export const nav = [
  { href: "/", label: "Accueil" },
  { href: "/services", label: "Services" },
  { href: "/secteurs", label: "Secteurs" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

export function telHref() {
  return `tel:${site.phoneE164}`;
}

export function mailHref() {
  return `mailto:${site.email}`;
}

/** URL absolue pour les canonicals et les métadonnées Open Graph. */
export function absoluteUrl(path = "/") {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${site.url}${clean === "/" ? "" : clean}`;
}
