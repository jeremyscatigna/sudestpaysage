import Link from "next/link";

import { Faq } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { Photo, cleanAlt } from "@/components/photo";
import {
  Bullets,
  ButtonLink,
  CtaBand,
  Eyebrow,
  Section,
  SectionTitle,
} from "@/components/ui";
import { faq, home, services } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "Nos services – Élagage, abattage, débroussaillage, traitement des palmiers",
  description:
    "Élagage, abattage, débroussaillage (OLD), aménagement paysager, taille de haies et traitement des palmiers sur la Côte d'Azur. Devis gratuit sous 24h.",
  path: "/services",
});

export default function ServicesPage() {
  const { founder } = home;

  return (
    <>
      <Section width="narrow" className="text-center">
        <Eyebrow>Nos services</Eyebrow>
        <SectionTitle as="h1" className="mb-5.5">
          Un service complet d&apos;élagage et de paysagisme
        </SectionTitle>
        <p className="text-base leading-[1.8] text-sage-500">
          De la taille des arbres au traitement phytosanitaire, Sud Est Paysage accompagne
          particuliers et professionnels sur toute la Côte d&apos;Azur.
        </p>
      </Section>

      {services.map((s, i) => {
        const imageFirst = i % 2 === 0;
        return (
          <Section key={s.id} id={s.id} className="scroll-mt-24">
            <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
              <Photo
                src={s.img}
                alt={cleanAlt(s.imgLabel)}
                className={`h-70 lg:h-105 ${imageFirst ? "" : "lg:order-2"}`}
              />
              <div className={imageFirst ? "" : "lg:order-1"}>
                <span className="mb-4 block font-display text-[15px] text-gold">{s.num}</span>
                <SectionTitle className="mb-5">{s.title}</SectionTitle>
                <p className="mb-6 text-base leading-[1.8] text-sage-500">{s.desc}</p>
                <Bullets items={s.points} className="mb-7" />
                <div className="flex flex-wrap items-center gap-5">
                  <ButtonLink href="/contact" variant="underline">
                    Demander un devis →
                  </ButtonLink>
                  {s.citySegment && (
                    <Link
                      href={
                        s.id === "traitement-phytosanitaire"
                          ? "/traitement-phytosanitaire"
                          : "/secteurs"
                      }
                      className="text-[15px] text-sage-600 underline decoration-sage-600/40 underline-offset-4 transition-colors hover:text-gold"
                    >
                      {s.id === "traitement-phytosanitaire"
                        ? "Tout savoir sur nos traitements"
                        : "Voir les villes couvertes"}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </Section>
        );
      })}

      <Section tone="cream" width="narrow">
        <Eyebrow tone="ink" className="text-center">
          Questions fréquentes
        </Eyebrow>
        <SectionTitle className="mb-12 text-center">Vos questions sur nos services</SectionTitle>
        <Faq items={faq} />
      </Section>

      {/* Rappel fondateur : les prestations découlent d'une même exigence. */}
      <Section tone="mid" width="narrow">
        <Eyebrow>Le fondateur</Eyebrow>
        <SectionTitle className="mb-5">Jimmy Sahm, à l&apos;origine de Sud Est Paysage</SectionTitle>
        <p className="mb-5 text-base leading-[1.85] text-sage-500">
          Chaque prestation de cette page répond à la même exigence, celle posée par{" "}
          {founder.name}, fondateur de l&apos;entreprise : comprendre l&apos;arbre, le sol et le
          climat avant d&apos;intervenir. C&apos;est ce qui distingue une taille raisonnée d&apos;une
          coupe rapide, et un traitement ciblé d&apos;une application inutile.
        </p>
        <p className="mb-7 text-base leading-[1.85] text-sage-500">
          Un seul interlocuteur suit votre dossier, du premier rendez-vous à la remise en état du
          chantier.
        </p>
        <ButtonLink href="/#fondateur" variant="underline">
          Découvrir l&apos;histoire de l&apos;entreprise →
        </ButtonLink>
      </Section>

      <CtaBand
        title="Besoin d'un service sur-mesure ?"
        lead="Décrivez-nous votre projet, nous vous répondons sous 24h avec un devis gratuit."
      />

      <JsonLd data={faqSchema(faq)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Accueil", url: "/" },
          { name: "Services", url: "/services" },
        ])}
      />
    </>
  );
}
