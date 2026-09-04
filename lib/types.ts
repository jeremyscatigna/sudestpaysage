/** Formes des données de contenu (dossier `content/`). */

/** Fragment de texte pouvant contenir <i>, <strong> ou <em>. */
export type RichString = string;

export interface City {
  slug: string;
  name: string;
  /** Code postal principal. */
  cp: string;
  h1: string;
  intro: RichString[];
  servicesLead: string;
  /** Sur-titre de la section locale, ex. « Zone d'intervention ». */
  localEyebrow: string;
  localH2: string;
  localParas: RichString[];
  /** Repère géographique local, ex. « des collines de Cimiez au Mont Boron ». */
  locPhrase: string;
  /** Accroche courte utilisée sur la page Secteurs. */
  teaser: string;
  metaTitle: string;
  metaDesc: string;
}

export interface ServiceCityPage {
  /** Segment d'URL du service, ex. « amenagement-paysager ». */
  service: string;
  /** Slug de la ville. */
  city: string;
  h1: string;
  eyebrow: string;
  paras: RichString[];
  bullets: RichString[];
  cta: string;
  whyH2: string;
  whyParas: RichString[];
  finalH2: string;
  finalP: string;
  metaTitle: string;
  metaDesc: string;
}

export interface BlogSection {
  heading: string | null;
  paras: RichString[];
}

export interface BlogPost {
  slug: string;
  title: string;
  cat: string;
  /** Date affichée, ex. « 22 janvier 2026 ». */
  dateFr: string;
  /** Date ISO (AAAA-MM-JJ). */
  date: string;
  hero: string | null;
  lead: string;
  sections: BlogSection[];
  excerpt: string;
  cardTitle: string;
  cardImg: string;
  metaTitle: string;
  metaDesc: string;
}

export interface Service {
  id: string;
  num: string;
  title: string;
  img: string;
  imgLabel: string;
  desc: string;
  points: RichString[];
  /** Segment d'URL des pages ville, absent si le service n'en a pas. */
  citySegment?: string;
  /** Libellé court utilisé dans les grilles et les listes. */
  shortTitle: string;
  shortDesc: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface GalleryItem {
  id: string;
  label: string;
  img: string;
}

export interface Testimonial {
  texte: string;
  nom: string;
  ville: string;
}

export interface Badge {
  titre: string;
  sous: string;
}

export interface TreatmentItem {
  nom: string;
  latin: string;
  symptomes: RichString;
  traitement: RichString;
}

export interface TreatmentBlock {
  id: string;
  num: string;
  title: string;
  img: string;
  imgLabel: string;
  intro: RichString;
  intro2: RichString;
  items: TreatmentItem[];
}

export interface TreatmentStep {
  num: string;
  titre: string;
  texte: string;
}

export interface DocBlock {
  heading: string | null;
  paras: RichString[];
}

export interface DocPage {
  h1: string;
  blocks: DocBlock[];
  metaTitle: string;
  metaDesc: string;
}

export interface Review {
  author: string;
  /** Ville du client, absente sur les avis les plus anciens. */
  city: string | null;
  rating: number;
  /** Date ISO (AAAA-MM-JJ). */
  date: string;
  dateFr: string;
  /** Nature du chantier telle que renseignée par le client. */
  work: string | null;
  /** Texte de l'avis, conservé mot pour mot (typographie d'origine incluse). */
  text: string;
  /** Sélectionné pour la page d'accueil. */
  featured: boolean;
}

export interface ReviewSource {
  /** Plateforme sur laquelle les avis ont été recueillis. */
  name: string;
  ratingValue: number;
  ratingCount: number;
}
