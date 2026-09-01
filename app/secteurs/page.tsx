import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { CtaBand, Eyebrow, Prose, Section, SectionTitle } from "@/components/ui";
import { cities, cityHref, secteursPage } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "Secteurs d'intervention – Élagueur & paysagiste dans les Alpes-Maritimes",
  description: secteursPage.metaDesc,
  path: "/secteurs",
});

export default function SecteursPage() {
  return (
    <>
      <Section width="narrow" className="text-center">
        <Eyebrow>{secteursPage.eyebrow}</Eyebrow>
        <SectionTitle as="h1" className="mb-5.5">
          {secteursPage.h1}
        </SectionTitle>
        <Prose paras={secteursPage.intro} className="text-left sm:text-center" />
      </Section>

      <Section>
        <ul className="grid gap-px bg-sage-100/8 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((c) => (
            <li key={c.slug} id={c.slug} className="scroll-mt-24">
              <Link
                href={cityHref(c.slug)}
                className="flex h-full flex-col bg-forest-900 px-8 py-9 transition-colors hover:bg-forest-700"
              >
                <h2 className="mb-3 font-display text-[21px] font-semibold">
                  {c.name}{" "}
                  <span className="text-sm font-normal text-sage-700">({c.cp})</span>
                </h2>
                <p className="mb-4.5 grow text-sm leading-relaxed text-sage-600">{c.teaser}</p>
                <span className="text-[13px] font-semibold text-gold">
                  Élagueur à {c.name} →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand
        title={secteursPage.lastH2}
        lead={secteursPage.lastParas[0] ?? ""}
        cta="Nous contacter"
      />

      <JsonLd
        data={breadcrumbSchema([
          { name: "Accueil", url: "/" },
          { name: "Secteurs", url: "/secteurs" },
        ])}
      />
    </>
  );
}
