import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import {
  Breadcrumb,
  Bullets,
  ButtonLink,
  ChipLink,
  CtaBand,
  Eyebrow,
  Prose,
  Section,
  SectionTitle,
} from "@/components/ui";
import {
  cityHref,
  cityPreposition,
  cityServiceHref,
  getCity,
  getService,
  getServiceBySegment,
  getServiceCity,
  services,
} from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, serviceSchema } from "@/lib/schema";
import { site, telHref } from "@/lib/site";

/**
 * Gabarit partagé des pages « service × ville ».
 *
 * Deux routes l'utilisent : `/[service]/[ville]` pour quatre des cinq services,
 * et `/traitement-phytosanitaire/[ville]`, qui a besoin de sa propre route
 * puisqu'un segment statique de même nom existe (la page traitement dédiée) et
 * prend la priorité sur le segment dynamique.
 */

export function serviceCityMetadata(service: string, ville: string) {
  const page = getServiceCity(service, ville);
  if (!page) return {};
  return pageMetadata({
    title: page.h1,
    description: page.metaDesc,
    path: cityServiceHref(service, ville),
  });
}

export function ServiceCityPage({ service, ville }: { service: string; ville: string }) {
  const page = getServiceCity(service, ville);
  const city = getCity(ville);
  const svc = getServiceBySegment(service);
  if (!page || !city || !svc) notFound();

  const prep = cityPreposition(city.name);
  const siblings = services.filter((s) => s.citySegment && s.citySegment !== service);

  return (
    <>
      <Section width="narrow">
        <Breadcrumb
          items={[
            { label: "Services", href: "/services" },
            { label: city.name, href: cityHref(city.slug) },
            { label: svc.shortTitle },
          ]}
        />
        <Eyebrow>
          {svc.shortTitle} · {city.name} ({city.cp})
        </Eyebrow>
        <SectionTitle as="h1" className="mb-7">
          {page.h1}
        </SectionTitle>
        <Prose paras={page.paras} lead className="mb-9" />
        <Bullets items={page.bullets} className="mb-9" />
        <div className="flex flex-wrap gap-4">
          <ButtonLink href="/contact">{page.cta}</ButtonLink>
          <ButtonLink href={telHref()} variant="outline">
            {site.phone}
          </ButtonLink>
        </div>
      </Section>

      <Section tone="deep" width="narrow">
        <SectionTitle className="mb-5">{page.whyH2}</SectionTitle>
        <Prose paras={page.whyParas} className="mb-8" />
        <p className="mb-4 text-[13px] tracking-[1px] text-sage-700 uppercase">
          Autres prestations {prep}
        </p>
        <ul className="flex flex-wrap gap-3">
          {siblings.map((s) => (
            <li key={s.id}>
              <ChipLink href={cityServiceHref(s.citySegment as string, city.slug)}>
                {s.shortTitle} {prep}
              </ChipLink>
            </li>
          ))}
          <li>
            <ChipLink href={cityHref(city.slug)}>Toutes nos prestations {prep}</ChipLink>
          </li>
        </ul>
      </Section>

      <CtaBand title={page.finalH2} lead={page.finalP} />

      <JsonLd
        data={serviceSchema({
          serviceType: getService(svc.id)?.title ?? svc.shortTitle,
          description: page.metaDesc,
          cityName: city.name,
          postalCode: city.cp,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Accueil", url: "/" },
          { name: "Services", url: "/services" },
          { name: city.name, url: cityHref(city.slug) },
          { name: svc.shortTitle, url: cityServiceHref(service, ville) },
        ])}
      />
    </>
  );
}
