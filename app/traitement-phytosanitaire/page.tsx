import { JsonLd } from "@/components/json-ld";
import { Photo, cleanAlt } from "@/components/photo";
import { RichText } from "@/components/rich-text";
import {
  Breadcrumb,
  ButtonLink,
  ChipLink,
  CtaBand,
  Eyebrow,
  Prose,
  Section,
  SectionTitle,
} from "@/components/ui";
import {
  cities,
  cityPreposition,
  cityServiceHref,
  postHref,
  treatmentBlocks,
  treatmentCtaLead,
  treatmentIntro,
  treatmentRegulation,
  treatmentSteps,
} from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema, serviceSchema } from "@/lib/schema";
import { site, telHref } from "@/lib/site";

const SERVICE = "traitement-phytosanitaire";

/** Articles du blog en rapport direct avec le sujet. */
const RELATED_POSTS = [
  { slug: "taille-palmier-cote-azur", label: "Guide : taille et entretien des palmiers" },
  { slug: "maladie-arbres-mediterraneens", label: "Maladies des arbres méditerranéens" },
  { slug: "olivier-taille-entretien", label: "Tailler et entretenir un olivier" },
  { slug: "gazon-ou-alternative-mediterranee", label: "Gazon sur la Côte d'Azur" },
];

export const metadata = pageMetadata({
  title: "Traitement des palmiers, pelouses et oliviers – Côte d'Azur",
  description:
    "Papillon du palmier, charançon rouge, fusariose, pythium, fil rouge, mouche de l'olive : diagnostic et traitement sur la Côte d'Azur. Devis gratuit sous 24h.",
  path: "/traitement-phytosanitaire",
});

export default function TreatmentPage() {
  return (
    <>
      <Section width="narrow">
        <Breadcrumb
          items={[
            { label: "Accueil", href: "/" },
            { label: "Services", href: "/services" },
            { label: "Traitement phytosanitaire" },
          ]}
        />
        <Eyebrow>Soin du végétal · Côte d&apos;Azur</Eyebrow>
        <SectionTitle as="h1" className="mb-7">
          Traitement des palmiers, pelouses et oliviers
        </SectionTitle>
        <Prose paras={treatmentIntro} lead className="mb-9" />
        <div className="flex flex-wrap gap-4">
          <ButtonLink href="/contact">Demander un diagnostic gratuit</ButtonLink>
          <ButtonLink href={telHref()} variant="outline">
            {site.phone}
          </ButtonLink>
        </div>
      </Section>

      {treatmentBlocks.map((block, i) => (
        <Section key={block.id} id={block.id} tone={i % 2 === 1 ? "mid" : "dark"}>
          <div className="mb-13 grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
            <div>
              <span className="mb-4 block font-display text-[15px] text-gold">{block.num}</span>
              <SectionTitle className="mb-5">{block.title}</SectionTitle>
              <Prose paras={[block.intro, block.intro2]} />
            </div>
            <Photo
              src={block.img}
              alt={cleanAlt(block.imgLabel)}
              className="h-65 lg:h-100"
            />
          </div>

          {/* Fiches ravageur / maladie : symptômes puis intervention. */}
          <ul className="grid gap-px bg-sage-100/10 lg:grid-cols-2">
            {block.items.map((item, j) => {
              const spanAll = j === block.items.length - 1 && block.items.length % 2 === 1;
              return (
                <li
                  key={item.nom}
                  className={`${i % 2 === 1 ? "bg-forest-700" : "bg-forest-900"} px-7 py-7.5 ${
                    spanAll ? "lg:col-span-2" : ""
                  }`}
                >
                  <h3 className="mb-1 font-display text-[20px] font-semibold">{item.nom}</h3>
                  <p className="mb-4.5 text-[13px] text-gold italic">{item.latin}</p>
                  <p className="mb-2 text-xs tracking-[1.5px] text-sage-700 uppercase">
                    Symptômes
                  </p>
                  <p className="mb-4.5 text-[15px] leading-relaxed text-sage-300">
                    <RichText>{item.symptomes}</RichText>
                  </p>
                  <p className="mb-2 text-xs tracking-[1.5px] text-sage-700 uppercase">
                    Notre intervention
                  </p>
                  <p className="text-[15px] leading-relaxed text-sage-500">
                    <RichText>{item.traitement}</RichText>
                  </p>
                </li>
              );
            })}
          </ul>
        </Section>
      ))}

      <Section tone="cream">
        <Eyebrow tone="ink">Notre méthode</Eyebrow>
        <SectionTitle className="mb-12">Diagnostiquer avant de traiter</SectionTitle>
        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {treatmentSteps.map((step) => (
            <li key={step.num}>
              <span className="mb-3.5 block font-display text-[15px] text-ink-700">
                {step.num}
              </span>
              <h3 className="mb-3 font-display text-[20px] font-semibold">{step.titre}</h3>
              <p className="text-[15px] leading-relaxed text-ink-600">{step.texte}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="deep" width="narrow">
        <Eyebrow>Réglementation</Eyebrow>
        <SectionTitle className="mb-6">Ce que la loi autorise dans un jardin</SectionTitle>
        <Prose paras={treatmentRegulation} />
      </Section>

      <Section>
        <Eyebrow>Zone d&apos;intervention</Eyebrow>
        <SectionTitle className="mb-8">Traitement phytosanitaire près de chez vous</SectionTitle>
        <ul className="flex flex-wrap gap-3">
          {cities.map((c) => (
            <li key={c.slug}>
              <ChipLink href={cityServiceHref(SERVICE, c.slug)}>
                {cityPreposition(c.name).replace(/^(à|au|aux) /, "")}
              </ChipLink>
            </li>
          ))}
        </ul>
        <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/8 pt-9">
          {RELATED_POSTS.map((r) => (
            <a
              key={r.slug}
              href={postHref(r.slug)}
              className="border-b border-sage-600/40 pb-0.5 text-sm text-sage-600 transition-colors hover:border-gold hover:text-gold"
            >
              {r.label} →
            </a>
          ))}
        </div>
      </Section>

      <CtaBand
        title="Un palmier, un olivier ou une pelouse en souffrance ?"
        lead={treatmentCtaLead}
        cta="Demander mon diagnostic gratuit"
      />

      <JsonLd
        data={serviceSchema({
          serviceType: "Traitement phytosanitaire des palmiers, pelouses et oliviers",
          description:
            "Diagnostic et traitement des ravageurs et maladies des palmiers, des pelouses et des oliviers sur la Côte d'Azur.",
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Accueil", url: "/" },
          { name: "Services", url: "/services" },
          { name: "Traitement phytosanitaire", url: "/traitement-phytosanitaire" },
        ])}
      />
    </>
  );
}
