import type { NextConfig } from "next";

import blogJson from "./content/blog.json";
import citiesJson from "./content/cities.json";
import serviceCitiesJson from "./content/service-cities.json";

/**
 * Redirections 301 depuis l'ancien site statique.
 *
 * Le contenu JSON est importé en relatif : `next.config.ts` est évalué par
 * Node avant que l'alias `@/*` de TypeScript ne soit disponible.
 */

/** Pages fixes de l'ancien site : nom de fichier (sans extension) → nouvelle URL. */
const STATIC_PAGES: Record<string, string> = {
  index: "/",
  services: "/services",
  secteurs: "/secteurs",
  contact: "/contact",
  blog: "/blog",
  "mentions-legales": "/mentions-legales",
  confidentialite: "/confidentialite",
  "traitement-phytosanitaire": "/traitement-phytosanitaire",
};

const citySlugs = Object.keys(citiesJson as Record<string, unknown>);
const postSlugs = (blogJson as { slug: string }[]).map((post) => post.slug);
/** Clés « service/ville », soit 5 services × 21 communes. */
const serviceCityKeys = Object.keys(serviceCitiesJson as Record<string, unknown>);

/**
 * Toutes les URL réellement servies par le nouveau site.
 *
 * Sert de garde-fou : une source de redirection ne doit jamais recouvrir une
 * route existante (ce qui provoquerait une boucle), et une destination doit
 * toujours être une de ces URL.
 */
const NEW_ROUTES = new Set<string>([
  ...Object.values(STATIC_PAGES),
  ...postSlugs.map((slug) => `/blog/${slug}`),
  ...citySlugs.map((slug) => `/villes/${slug}`),
  ...serviceCityKeys.map((key) => `/${key}`),
]);

/**
 * Correspondance ancien chemin (sans extension) → nouveau chemin.
 *
 * Les pages service × ville sont générées depuis les clés `service/ville` du
 * contenu, et non par découpage du nom de fichier : « amenagement-paysager » et
 * « saint-laurent-du-var » contiennent tous deux des tirets, un `split("-")`
 * serait faux.
 */
const LEGACY_PATHS: { legacy: string; destination: string }[] = [
  ...Object.entries(STATIC_PAGES).map(([name, destination]) => ({
    legacy: `/${name}`,
    destination,
  })),
  ...postSlugs.map((slug) => ({
    legacy: `/blog-${slug}`,
    destination: `/blog/${slug}`,
  })),
  ...citySlugs.map((slug) => ({
    legacy: `/ville-${slug}`,
    destination: `/villes/${slug}`,
  })),
  ...serviceCityKeys.map((key) => {
    const slash = key.indexOf("/");
    const service = key.slice(0, slash);
    const city = key.slice(slash + 1);
    return { legacy: `/${service}-${city}`, destination: `/${service}/${city}` };
  }),
];

/**
 * Liste finale des redirections permanentes.
 *
 * On force `statusCode: 301` plutôt que `permanent: true` : ce dernier émet un
 * 308, correctement interprété par Google mais moins bien suivi par les vieux
 * robots et vérificateurs de liens. Les URL historiques étant indexées et
 * référencées depuis l'extérieur, le 301 reste le signal le plus sûr.
 */
function legacyRedirects() {
  const redirects: { source: string; destination: string; statusCode: 301 }[] = [];

  for (const { legacy, destination } of LEGACY_PATHS) {
    // 1. L'URL historique, avec son extension `.dc.html`.
    redirects.push({ source: `${legacy}.dc.html`, destination, statusCode: 301 });

    // 2. La même sans extension, si et seulement si elle n'est pas déjà servie
    //    par le nouveau site. Cela exclut « /services », « /contact »,
    //    « /traitement-phytosanitaire »… qui sont des routes réelles.
    if (legacy !== destination && !NEW_ROUTES.has(legacy)) {
      redirects.push({ source: legacy, destination, statusCode: 301 });
    }
  }

  return redirects;
}

const nextConfig: NextConfig = {
  // Inutile d'annoncer la stack au monde entier.
  poweredByHeader: false,

  images: {
    // Next 16 refuse (400) toute qualité non déclarée ici. 60 sert à alléger
    // l'image du héros, très lourde à la source et de toute façon recouverte
    // d'un dégradé sombre ; 75 reste la valeur par défaut pour le reste.
    qualities: [60, 75],
  },

  async redirects() {
    return legacyRedirects();
  },

  // En-têtes de sécurité. Vercel fournit déjà HSTS sur les domaines qu'il sert ;
  // le reste est à déclarer ici. Pas de CSP pour l'instant : le site charge des
  // polices Google et Next injecte des scripts en ligne, une CSP stricte
  // demanderait une passe dédiée (nonces) plutôt qu'une valeur approximative.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
