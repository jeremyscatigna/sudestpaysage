/**
 * Fabriques de métadonnées Next.
 *
 * Objectif : que chaque page se contente d'un appel à `pageMetadata()` et
 * hérite automatiquement d'un canonical, d'un bloc Open Graph et d'une carte
 * Twitter cohérents. `metadataBase` étant défini dans le layout racine, les
 * chemins relatifs sont résolus par Next — on les laisse relatifs pour que le
 * site reste déployable sur un autre domaine sans retoucher les pages.
 */
import type { Metadata } from "next";

import { site } from "./site";

export interface PageMetadataInput {
  /**
   * Titre complet, marque incluse (les `metaTitle` du contenu la contiennent).
   * Omis, le titre par défaut du layout racine s'applique — c'est le cas de
   * l'accueil, dont le titre est déjà défini une fois pour toutes.
   */
  title?: string;
  description: string;
  /** Chemin de la page, commençant par « / » — sert de canonical. */
  path: string;
  /** Illustration Open Graph. Par défaut : l'image du site. */
  image?: string;
  type?: "website" | "article";
  /** Date ISO de publication, pour les articles. */
  publishedTime?: string;
}

/** Normalise un chemin en garantissant le « / » initial. */
function normalizePath(path: string): string {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

/**
 * Métadonnées d'une page.
 *
 * Le titre est posé en `absolute` : les titres du contenu migré incluent déjà
 * « Sud Est Paysage », le gabarit `%s | Sud Est Paysage` du layout racine
 * doublerait la marque.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = site.ogImage,
  type = "website",
  publishedTime,
}: PageMetadataInput): Metadata {
  const url = normalizePath(path);
  // Titre de partage : à défaut de titre de page, celui du site.
  const socialTitle = title ?? `${site.name} – ${site.tagline}`;

  // `openGraph` est une union discriminée sur `type` côté Next : on branche
  // explicitement plutôt que de répandre un champ conditionnel.
  const shared = {
    url,
    title: socialTitle,
    description,
    siteName: site.name,
    locale: site.locale,
    images: [{ url: image, width: 1200, height: 630, alt: socialTitle }],
  };
  const openGraph: Metadata["openGraph"] =
    type === "article"
      ? { ...shared, type: "article", publishedTime, modifiedTime: publishedTime }
      : { ...shared, type: "website" };

  return {
    // `absolute` court-circuite le gabarit du layout racine.
    ...(title ? { title: { absolute: title } } : {}),
    description,
    alternates: { canonical: url },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [image],
    },
  };
}
