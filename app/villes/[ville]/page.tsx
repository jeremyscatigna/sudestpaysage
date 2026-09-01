import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import {
  Breadcrumb,
  CtaBand,
  Eyebrow,
  Prose,
  Section,
  SectionTitle,
} from "@/components/ui";
import {
  cityHref,
  cityPreposition,
  citySlugs,
  cityServiceHref,
  getCity,
  serviceHref,
  services,
} from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, serviceSchema } from "@/lib/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return citySlugs.map((ville) => ({ ville }));
}

export async function generateMetadata({ params }: { params: Promise<{ ville: string }> }) {
  const { ville } = await params;
  const city = getCity(ville);
  if (!city) return {};
  return pageMetadata({
    title: city.h1,
    description: city.metaDesc,
    path: cityHref(ville),
  });
}

export default async function CityPage({ params }: { params: Promise<{ ville: string }> }) {
  const { ville } = await params;
  const city = getCity(ville);
  if (!city) notFound();

  const prep = cityPreposition(city.name);

  return (
    <>
      <Section width="narrow">
        <Breadcrumb
          items={[
            { label: "Accueil", href: "/" },
            { label: "Secteurs", href: "/secteurs" },
            { label: city.name },
          ]}
        />
        <Eyebrow>
          Élagueur &amp; paysagiste · {city.name} ({city.cp})
        </Eyebrow>
        <SectionTitle as="h1" className="mb-7">
          {city.h1}
        </SectionTitle>
        <Prose paras={city.intro} lead />
      </Section>

      <Section tone="cream">
        <SectionTitle className="mb-3">Nos services {prep}</SectionTitle>
        <p className="mb-10 text-[15px] text-ink-600">{city.servicesLead}</p>
        <ul className="grid gap-px bg-ink-900/12 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const href = s.citySegment
              ? cityServiceHref(s.citySegment, city.slug)
              : serviceHref(s.id);
            const spanAll = i === services.length - 1 && services.length % 3 === 1;
            return (
              <li key={s.id} className={spanAll ? "lg:col-span-3" : undefined}>
                <Link
                  href={href}
                  className="block h-full bg-cream px-7 py-8 transition duration-250 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(30,43,33,0.15)]"
                >
                  <h3 className="mb-2.5 font-display text-[20px] font-semibold">
                    {s.shortTitle}
                    {s.citySegment ? ` ${prep}` : ""}
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-600">{s.shortDesc}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section tone="deep" width="narrow">
        <Eyebrow>{city.localEyebrow}</Eyebrow>
        <SectionTitle className="mb-5">{city.localH2}</SectionTitle>
        <Prose paras={city.localParas} />
      </Section>

      <CtaBand
        title={`Un projet ${prep} ?`}
        lead="Recevez votre devis gratuit et sans engagement sous 24h."
      />

      <JsonLd
        data={serviceSchema({
          serviceType: "Élagage, abattage et paysagisme",
          description: city.metaDesc,
          cityName: city.name,
          postalCode: city.cp,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Accueil", url: "/" },
          { name: "Secteurs", url: "/secteurs" },
          { name: city.name, url: cityHref(ville) },
        ])}
      />
    </>
  );
}
