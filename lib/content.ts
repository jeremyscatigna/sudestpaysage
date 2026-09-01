/**
 * Accès typé au contenu statique (dossier `content/`).
 *
 * Le contenu a été extrait de l'ancien site statique et n'est pas modifié à
 * l'exécution : tout est résolu au build, ce qui garde les pages entièrement
 * statiques.
 */
import blogJson from "@/content/blog.json";
import catalogJson from "@/content/catalog.json";
import citiesJson from "@/content/cities.json";
import homeJson from "@/content/home.json";
import serviceCitiesJson from "@/content/service-cities.json";
import staticJson from "@/content/static.json";
import treatmentBlocksJson from "@/content/treatment-blocks.json";
import treatmentProseJson from "@/content/treatment-prose.json";

import type {
  Badge,
  BlogPost,
  City,
  DocPage,
  FaqItem,
  GalleryItem,
  Service,
  ServiceCityPage,
  Testimonial,
  TreatmentBlock,
  TreatmentStep,
} from "./types";

/** Les chemins d'images stockés en contenu sont relatifs (« uploads/x.jpg »). */
function asPublicPath(src: string): string {
  return src.startsWith("/") ? src : `/${src}`;
}

/* -------------------------------------------------------------------- villes */

export const cities: City[] = Object.values(citiesJson as Record<string, City>).sort((a, b) =>
  a.name.localeCompare(b.name, "fr"),
);

export const citySlugs: string[] = cities.map((c) => c.slug);

const cityBySlug = new Map(cities.map((c) => [c.slug, c]));

export function getCity(slug: string): City | undefined {
  return cityBySlug.get(slug);
}

/** Article défini pour un nom de ville : « à Nice », « au Cannet ». */
export function cityPreposition(name: string): string {
  if (name.startsWith("Le ")) return `au ${name.slice(3)}`;
  if (name.startsWith("Les ")) return `aux ${name.slice(4)}`;
  return `à ${name}`;
}

/* ------------------------------------------------------------------ services */

/** Services disposant de pages ville dédiées, avec leur segment d'URL. */
const CITY_SEGMENTS: Record<string, string> = {
  elagage: "elagage",
  abattage: "abattage",
  debroussaillage: "debroussaillage",
  amenagement: "amenagement-paysager",
  "traitement-phytosanitaire": "traitement-phytosanitaire",
};

interface RawService {
  id: string;
  num: string;
  title: string;
  img: string;
  imgLabel: string;
  desc: string;
  points: string[];
}

interface RawHomeCard {
  num: string;
  title: string;
  desc: string;
}

const rawServices = catalogJson.SERVICES_DETAIL as RawService[];
const rawHomeCards = catalogJson.HOME_SERVICE_CARDS as RawHomeCard[];

export const services: Service[] = rawServices.map((s, i) => ({
  id: s.id,
  num: s.num,
  title: s.title,
  img: asPublicPath(s.img),
  imgLabel: s.imgLabel,
  desc: s.desc,
  points: s.points,
  citySegment: CITY_SEGMENTS[s.id],
  shortTitle: rawHomeCards[i]?.title ?? s.title,
  shortDesc: rawHomeCards[i]?.desc ?? s.desc,
}));

const serviceById = new Map(services.map((s) => [s.id, s]));
const serviceBySegment = new Map(
  services.filter((s) => s.citySegment).map((s) => [s.citySegment as string, s]),
);

export function getService(id: string): Service | undefined {
  return serviceById.get(id);
}

/** Service correspondant à un segment d'URL de page ville. */
export function getServiceBySegment(segment: string): Service | undefined {
  return serviceBySegment.get(segment);
}

/** Segments d'URL des services ayant des pages ville (5 sur 7). */
export const serviceSegments: string[] = services
  .filter((s) => s.citySegment)
  .map((s) => s.citySegment as string);

/** Lien canonique d'un service : page dédiée si elle existe, sinon ancre. */
export function serviceHref(id: string): string {
  if (id === "traitement-phytosanitaire") return "/traitement-phytosanitaire";
  return `/services#${id}`;
}

/* ------------------------------------------------------ pages service × ville */

const serviceCities = serviceCitiesJson as Record<string, ServiceCityPage>;

export function getServiceCity(service: string, city: string): ServiceCityPage | undefined {
  return serviceCities[`${service}/${city}`];
}

/** Toutes les paires (service, ville) existantes — pour generateStaticParams. */
export const serviceCityPairs: { service: string; ville: string }[] = Object.values(serviceCities)
  .map((p) => ({ service: p.service, ville: p.city }))
  .sort((a, b) => a.service.localeCompare(b.service) || a.ville.localeCompare(b.ville));

export function cityServiceHref(service: string, city: string): string {
  return `/${service}/${city}`;
}

export function cityHref(city: string): string {
  return `/villes/${city}`;
}

/* ---------------------------------------------------------------------- blog */

export const posts: BlogPost[] = (blogJson as BlogPost[])
  .map((p) => ({
    ...p,
    hero: p.hero ? asPublicPath(p.hero) : null,
    cardImg: asPublicPath(p.cardImg),
  }))
  .sort((a, b) => b.date.localeCompare(a.date));

const postBySlug = new Map(posts.map((p) => [p.slug, p]));

export function getPost(slug: string): BlogPost | undefined {
  return postBySlug.get(slug);
}

export const postSlugs: string[] = posts.map((p) => p.slug);

export function postHref(slug: string): string {
  return `/blog/${slug}`;
}

/** Articles liés : même catégorie d'abord, complétés par les plus récents. */
export function relatedPosts(slug: string, count = 3): BlogPost[] {
  const current = getPost(slug);
  if (!current) return posts.slice(0, count);
  const sameCat = posts.filter((p) => p.slug !== slug && p.cat === current.cat);
  const others = posts.filter((p) => p.slug !== slug && p.cat !== current.cat);
  return [...sameCat, ...others].slice(0, count);
}

/* ------------------------------------------------------------------- accueil */

export const home = {
  ...homeJson,
  hero: { ...homeJson.hero, bgImage: asPublicPath(homeJson.hero.bgImage) },
  about: { ...homeJson.about, image: asPublicPath(homeJson.about.image) },
  founder: { ...homeJson.founder, image: asPublicPath(homeJson.founder.image) },
};

/* ------------------------------------------------------------- accueil / divers */

export const gallery: GalleryItem[] = (catalogJson.GALLERY as GalleryItem[]).map((g) => ({
  ...g,
  img: asPublicPath(g.img),
}));

export const testimonials = catalogJson.AVIS as Testimonial[];
export const badges = catalogJson.BADGES as Badge[];
export const citiesPreview = catalogJson.VILLES_APERCU as string[];
export const faq = catalogJson.FAQ as FaqItem[];

/* ------------------------------------------------------- traitement (page dédiée) */

export const treatmentBlocks: TreatmentBlock[] = (
  treatmentBlocksJson.blocks as (TreatmentBlock & { bg?: string })[]
).map((b) => ({
  id: b.id,
  num: b.num,
  title: b.title,
  img: asPublicPath(b.img),
  imgLabel: b.imgLabel,
  intro: b.intro,
  intro2: b.intro2,
  items: b.items,
}));

export const treatmentSteps = treatmentBlocksJson.etapes as TreatmentStep[];

/** Prose de la page traitement : [0..2] intro, [5..7] réglementation, [8] CTA. */
const treatmentParas = treatmentProseJson.paras as string[];
export const treatmentIntro = treatmentParas.slice(0, 3);
export const treatmentRegulation = treatmentParas.slice(5, 8);
export const treatmentCtaLead = treatmentParas[8];

/* ------------------------------------------------------------ pages statiques */

const statics = staticJson as Record<string, unknown>;

export const legalPage = statics["mentions-legales"] as DocPage;
export const privacyPage = statics["confidentialite"] as DocPage;
export const secteursPage = statics["secteurs"] as {
  eyebrow: string;
  h1: string;
  intro: string[];
  lastH2: string;
  lastParas: string[];
  metaTitle: string;
  metaDesc: string;
};
export const contactPage = statics["contact"] as {
  eyebrow: string;
  h1: string;
  intro: string[];
  metaTitle: string;
  metaDesc: string;
};
export const blogIndexPage = statics["blog"] as {
  eyebrow: string;
  h1: string;
  intro: string[];
  metaTitle: string;
  metaDesc: string;
};
