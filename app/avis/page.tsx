import { JsonLd } from "@/components/json-ld";
import { ReviewCard } from "@/components/review-card";
import { Breadcrumb, CtaBand, Eyebrow, Section, SectionTitle } from "@/components/ui";
import { formatRating, reviewSource, reviews } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "Avis clients — 4,6/5 sur Travaux.com",
  description:
    "Les avis de nos clients sur la Côte d'Azur : élagage, abattage, débroussaillage et entretien de jardins. 4,6/5 sur 33 avis vérifiés Travaux.com.",
  path: "/avis",
});

export default function ReviewsPage() {
  const { ratingValue, ratingCount, name } = reviewSource;

  return (
    <>
      <Section width="narrow">
        <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Avis clients" }]} />
        <Eyebrow>Ils nous font confiance</Eyebrow>
        <SectionTitle as="h1" className="mb-7">
          Ce que disent nos clients
        </SectionTitle>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <p className="flex items-baseline gap-2">
            <span className="font-display text-[42px] leading-none text-gold">
              {formatRating(ratingValue)}
            </span>
            <span className="text-lg text-sage-600">/ 5</span>
          </p>
          <p className="text-[15px] text-sage-500">
            Moyenne sur <strong className="font-semibold text-sage-100">{ratingCount} avis</strong>{" "}
            publiés sur <span className="text-gold">{name}</span>
          </p>
        </div>

      </Section>

      <Section tone="cream">
        <SectionTitle className="mb-10">
          {reviews.length} avis avec commentaire
        </SectionTitle>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, i) => (
            <li key={`${review.author}-${review.date}-${i}`}>
              <ReviewCard review={review} tone="light" />
            </li>
          ))}
        </ul>
        <p className="mt-10 text-[13px] text-ink-600">Source : avis publiés sur {name}.</p>
      </Section>

      <CtaBand
        title="À votre tour ?"
        lead="Recevez un devis gratuit et sans engagement sous 24h."
      />

      <JsonLd
        data={breadcrumbSchema([
          { name: "Accueil", url: "/" },
          { name: "Avis clients", url: "/avis" },
        ])}
      />
    </>
  );
}
