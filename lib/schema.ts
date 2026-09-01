/**
 * Constructeurs de données structurées JSON-LD (schema.org).
 *
 * Chaque fonction renvoie un objet simple, sérialisable par `JSON.stringify`,
 * destiné au composant `<JsonLd />`. Toutes les URL passent par `absoluteUrl()`
 * afin qu'aucune URL relative ne se retrouve dans le balisage : les
 * consommateurs de JSON-LD (Google, Bing…) ne résolvent pas les chemins
 * relatifs de façon fiable.
 */
import { cities } from "./content";
import { absoluteUrl, site } from "./site";
import type { BlogPost, FaqItem } from "./types";

/* ----------------------------------------------------------------- types */

const CONTEXT = "https://schema.org" as const;

/** Identifiants stables, réutilisés pour relier les nœuds entre eux. */
const BUSINESS_ID = absoluteUrl("/#business");
const ORGANIZATION_ID = absoluteUrl("/#organization");
const WEBSITE_ID = absoluteUrl("/#website");

interface PostalAddress {
  "@type": "PostalAddress";
  addressLocality?: string;
  postalCode?: string;
  addressRegion: string;
  addressCountry: string;
}

interface Person {
  "@type": "Person";
  name: string;
}

interface ImageObject {
  "@type": "ImageObject";
  url: string;
  width?: number;
  height?: number;
}

interface OrganizationNode {
  "@type": "Organization";
  "@id": string;
  name: string;
  url: string;
  logo: ImageObject;
}

interface PlaceNode {
  "@type": "City" | "AdministrativeArea";
  name: string;
  address?: PostalAddress;
}

interface LocalBusinessNode {
  "@type": "LocalBusiness";
  "@id": string;
  name: string;
  legalName: string;
  description: string;
  url: string;
  email: string;
  telephone: string;
  image: string;
  priceRange: string;
  address: PostalAddress;
  areaServed: PlaceNode[];
  founder: Person;
}

export interface LocalBusinessSchema extends LocalBusinessNode {
  "@context": typeof CONTEXT;
}

export interface ServiceSchema {
  "@context": typeof CONTEXT;
  "@type": "Service";
  serviceType: string;
  name: string;
  description: string;
  provider: LocalBusinessNode;
  areaServed?: PlaceNode;
}

export interface ArticleSchema {
  "@context": typeof CONTEXT;
  "@type": ["Article", "BlogPosting"];
  headline: string;
  description: string;
  articleSection: string;
  datePublished: string;
  dateModified: string;
  inLanguage: string;
  image: string;
  author: OrganizationNode;
  publisher: OrganizationNode;
  mainEntityOfPage: { "@type": "WebPage"; "@id": string; url: string };
}

export interface FaqSchema {
  "@context": typeof CONTEXT;
  "@type": "FAQPage";
  mainEntity: {
    "@type": "Question";
    name: string;
    acceptedAnswer: { "@type": "Answer"; text: string };
  }[];
}

export interface BreadcrumbSchema {
  "@context": typeof CONTEXT;
  "@type": "BreadcrumbList";
  itemListElement: {
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }[];
}

export interface WebSiteSchema {
  "@context": typeof CONTEXT;
  "@type": "WebSite";
  "@id": string;
  name: string;
  description: string;
  url: string;
  inLanguage: string;
  publisher: OrganizationNode;
}

/* ------------------------------------------------------- nœuds réutilisables */

/** Image Open Graph du site, en absolu — sert de logo et d'illustration. */
function ogImageUrl(): string {
  return absoluteUrl(site.ogImage);
}

const DEFAULT_DESCRIPTION =
  `${site.name} : élagage, abattage, débroussaillage réglementaire, aménagement paysager ` +
  `et traitement phytosanitaire des palmiers, oliviers et pelouses sur toute la Côte d'Azur.`;

function organizationNode(): OrganizationNode {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: site.name,
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: ogImageUrl(),
      width: 1200,
      height: 630,
    },
  };
}

/**
 * Nœud LocalBusiness sans `@context` : utilisable en valeur imbriquée
 * (`provider`), où un `@context` local serait redondant.
 */
function localBusinessNode(): LocalBusinessNode {
  return {
    "@type": "LocalBusiness",
    "@id": BUSINESS_ID,
    name: site.name,
    legalName: site.legalName,
    description: DEFAULT_DESCRIPTION,
    url: absoluteUrl("/"),
    email: site.email,
    telephone: site.phoneE164,
    image: ogImageUrl(),
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      addressRegion: site.region,
      addressCountry: "FR",
    },
    // Zone d'intervention : les 21 communes couvertes par le site.
    areaServed: cities.map((city) => ({
      "@type": "City" as const,
      name: city.name,
      address: {
        "@type": "PostalAddress" as const,
        addressLocality: city.name,
        postalCode: city.cp,
        addressRegion: site.region,
        addressCountry: "FR",
      },
    })),
    founder: { "@type": "Person", name: site.founder },
  };
}

/* --------------------------------------------------------------- builders */

/** Fiche établissement — injectée une fois, dans le layout racine. */
export function localBusinessSchema(): LocalBusinessSchema {
  return { "@context": CONTEXT, ...localBusinessNode() };
}

export interface ServiceSchemaInput {
  /** Intitulé du service, ex. « Élagage d'arbres ». */
  serviceType: string;
  description: string;
  /** Nom de la commune si la page est localisée. */
  cityName?: string;
  /** Code postal de la commune, précise le nœud `areaServed`. */
  postalCode?: string;
}

/** Prestation, éventuellement rattachée à une commune. */
export function serviceSchema({
  serviceType,
  description,
  cityName,
  postalCode,
}: ServiceSchemaInput): ServiceSchema {
  const schema: ServiceSchema = {
    "@context": CONTEXT,
    "@type": "Service",
    serviceType,
    name: cityName ? `${serviceType} — ${cityName}` : serviceType,
    description,
    provider: localBusinessNode(),
  };

  if (cityName) {
    schema.areaServed = {
      "@type": "City",
      name: cityName,
      address: {
        "@type": "PostalAddress",
        addressLocality: cityName,
        ...(postalCode ? { postalCode } : {}),
        addressRegion: site.region,
        addressCountry: "FR",
      },
    };
  }

  return schema;
}

/**
 * Article de blog. Le double `@type` déclare à la fois `Article` et
 * `BlogPosting` : `BlogPosting` est plus précis, `Article` reste le type
 * attendu par certains validateurs.
 */
export function articleSchema(post: BlogPost): ArticleSchema {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const organization = organizationNode();

  return {
    "@context": CONTEXT,
    "@type": ["Article", "BlogPosting"],
    headline: post.title,
    description: post.metaDesc || post.excerpt,
    articleSection: post.cat,
    // `post.date` est déjà au format ISO (AAAA-MM-JJ).
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: site.lang,
    image: absoluteUrl(post.hero ?? post.cardImg),
    author: organization,
    publisher: organization,
    mainEntityOfPage: { "@type": "WebPage", "@id": url, url },
  };
}

/** Bloc de questions fréquentes. */
export function faqSchema(items: FaqItem[]): FaqSchema {
  return {
    "@context": CONTEXT,
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question" as const,
      name: item.question,
      acceptedAnswer: { "@type": "Answer" as const, text: item.answer },
    })),
  };
}

export interface BreadcrumbItem {
  name: string;
  /** Chemin interne (« /villes/nice ») ou URL absolue. */
  url: string;
}

/** Fil d'Ariane. Les positions commencent à 1, comme l'exige schema.org. */
export function breadcrumbSchema(items: BreadcrumbItem[]): BreadcrumbSchema {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem" as const,
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : absoluteUrl(item.url),
    })),
  };
}

/** Site web — injecté sur l'accueil, aux côtés du LocalBusiness. */
export function websiteSchema(): WebSiteSchema {
  return {
    "@context": CONTEXT,
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: site.name,
    description: DEFAULT_DESCRIPTION,
    url: absoluteUrl("/"),
    inLanguage: site.lang,
    publisher: organizationNode(),
  };
}
