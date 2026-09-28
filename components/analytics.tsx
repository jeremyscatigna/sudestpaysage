import Script from "next/script";

import { site } from "@/lib/site";

/**
 * Google Analytics 4.
 *
 * Chargé uniquement sur le déploiement de production : `VERCEL_ENV` vaut
 * « preview » sur les branches et n'est pas défini en local, ce qui évite de
 * polluer les statistiques avec le trafic de développement. Aucune variable
 * d'environnement à déclarer : un identifiant de mesure GA4 est public, il
 * part de toute façon dans le navigateur.
 *
 * `afterInteractive` : le script se charge après l'hydratation, il ne retarde
 * donc pas l'affichage ni le LCP.
 */
export function Analytics() {
  if (process.env.VERCEL_ENV !== "production" || !site.gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${site.gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${site.gaId}');
        `}
      </Script>
    </>
  );
}
