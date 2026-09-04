import Link from "next/link";

import { cities, cityHref, serviceHref, services } from "@/lib/content";
import { mailHref, site, telHref } from "@/lib/site";

/** Villes mises en avant dans le pied de page (les autres via /secteurs). */
const FOOTER_CITY_SLUGS = [
  "nice",
  "cannes",
  "antibes",
  "la-gaude",
  "saint-jeannet",
  "gattieres",
  "vence",
];

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4.5 text-[13px] tracking-[1px] text-gold uppercase">{children}</div>
  );
}

export function SiteFooter() {
  const footerCities = FOOTER_CITY_SLUGS.map((slug) => cities.find((c) => c.slug === slug)).filter(
    (c): c is NonNullable<typeof c> => Boolean(c),
  );

  return (
    <footer className="bg-forest-950 px-5 pt-18 pb-24 sm:pb-8 lg:px-12">
      <div className="container-page grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-12">
        <div>
          <div className="mb-4 font-display text-[20px] font-semibold">
            Sud Est <span className="text-gold italic">Paysage</span>
          </div>
          <p className="max-w-70 text-sm leading-relaxed text-sage-700">
            Élagueur et jardinier paysagiste. Intervention sur toute la Côte d&apos;Azur,{" "}
            {site.region}.
          </p>
        </div>

        <div>
          <ColumnTitle>Services</ColumnTitle>
          <ul className="flex flex-col gap-2.5">
            {services.map((s) => (
              <li key={s.id}>
                <Link
                  href={serviceHref(s.id)}
                  className="text-sm text-sage-600 transition-colors hover:text-gold"
                >
                  {s.shortTitle}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <ColumnTitle>Secteurs</ColumnTitle>
          <ul className="flex flex-col gap-2.5">
            {footerCities.map((c) => (
              <li key={c.slug}>
                <Link
                  href={cityHref(c.slug)}
                  className="text-sm text-sage-600 transition-colors hover:text-gold"
                >
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/secteurs"
                className="text-sm text-sage-600 transition-colors hover:text-gold"
              >
                Toutes les villes
              </Link>
            </li>
            <li>
              <Link
                href="/avis"
                className="text-sm text-sage-600 transition-colors hover:text-gold"
              >
                Avis clients
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <ColumnTitle>Contact</ColumnTitle>
          <div className="flex flex-col gap-2.5 text-sm text-sage-600">
            <a href={mailHref()} className="transition-colors hover:text-gold">
              {site.email}
            </a>
            <a href={telHref()} className="transition-colors hover:text-gold">
              {site.phone}
            </a>
            <span>
              {site.region} ({site.regionCode})
            </span>
          </div>
        </div>
      </div>

      <div className="container-page mt-14 border-t border-white/8 pt-6 text-[13px] text-sage-700">
        © {new Date().getFullYear()} {site.name} — Élagueur &amp; paysagiste Côte d&apos;Azur
      </div>
      <div className="container-page mt-3.5 flex flex-wrap gap-4 text-[13px]">
        <Link href="/mentions-legales" className="text-sage-700 transition-colors hover:text-gold">
          Mentions légales
        </Link>
        <Link href="/confidentialite" className="text-sage-700 transition-colors hover:text-gold">
          Politique de confidentialité
        </Link>
      </div>
    </footer>
  );
}
