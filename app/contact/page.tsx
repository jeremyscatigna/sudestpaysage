import { DevisForm } from "@/components/devis-form";
import { JsonLd } from "@/components/json-ld";
import { Eyebrow, Prose, SectionTitle } from "@/components/ui";
import { contactPage } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema } from "@/lib/schema";
import { mailHref, site, telHref } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact – Devis gratuit sous 24h",
  description: contactPage.metaDesc,
  path: "/contact",
});

function InfoBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[13px] tracking-[1px] text-gold uppercase">{label}</div>
      <div className="text-base">{children}</div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <>
      <section className="px-5 py-16 lg:px-12 lg:py-22">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:gap-18">
          <div>
            <Eyebrow>{contactPage.eyebrow}</Eyebrow>
            <SectionTitle as="h1" className="mb-5.5">
              {contactPage.h1}
            </SectionTitle>
            <Prose paras={contactPage.intro} className="mb-10" />

            <div className="flex flex-col gap-6">
              <InfoBlock label="Email">
                <a href={mailHref()} className="transition-colors hover:text-gold">
                  {site.email}
                </a>
              </InfoBlock>
              <InfoBlock label="Téléphone">
                <a href={telHref()} className="transition-colors hover:text-gold">
                  {site.phone}
                </a>
              </InfoBlock>
              <InfoBlock label="Zone d'intervention">
                Toute la Côte d&apos;Azur, {site.region}
              </InfoBlock>
              <InfoBlock label="Délai de réponse">
                Devis gratuit et sans engagement sous 24h
              </InfoBlock>
            </div>
          </div>

          <DevisForm />
        </div>
      </section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Accueil", url: "/" },
          { name: "Contact", url: "/contact" },
        ])}
      />
    </>
  );
}
