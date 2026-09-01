/**
 * Plan du site.
 *
 * Intégralement dérivé de `lib/content.ts` : aucune liste d'URL n'est écrite en
 * dur, donc ajouter une ville, un service ou un article suffit à mettre le
 * sitemap à jour. Total attendu : 160 URL
 * (1 accueil + services + secteurs + contact + traitement + blog
 *  + 26 articles + 21 villes + 105 service × ville + 2 pages légales).
 */
import type { MetadataRoute } from "next";

import { citySlugs, posts, serviceCityPairs } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

type SitemapEntry = MetadataRoute.Sitemap[number];
type ChangeFrequency = NonNullable<SitemapEntry["changeFrequency"]>;

/** Date de build : sert de `lastModified` pour les pages non datées. */
const buildDate = new Date();

function entry(
  path: string,
  priority: number,
  changeFrequency: ChangeFrequency,
  lastModified: Date | string = buildDate,
): SitemapEntry {
  return { url: absoluteUrl(path), lastModified, changeFrequency, priority };
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // Accueil et pages piliers.
    entry("/", 1, "weekly"),
    entry("/services", 0.9, "monthly"),
    entry("/secteurs", 0.9, "monthly"),
    entry("/contact", 0.9, "monthly"),
    entry("/traitement-phytosanitaire", 0.9, "monthly"),

    // Blog : l'index bouge à chaque publication, les articles peu après.
    entry("/blog", 0.8, "weekly"),
    ...posts.map((post) => entry(`/blog/${post.slug}`, 0.7, "yearly", post.date)),

    // Hubs ville puis pages service × ville.
    ...citySlugs.map((slug) => entry(`/villes/${slug}`, 0.8, "monthly")),
    ...serviceCityPairs.map(({ service, ville }) =>
      entry(`/${service}/${ville}`, 0.7, "monthly"),
    ),

    // Pages légales : indexables mais sans enjeu.
    entry("/mentions-legales", 0.3, "yearly"),
    entry("/confidentialite", 0.3, "yearly"),
  ];
}
