import Image from "next/image";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { Photo, cleanAlt } from "@/components/photo";
import { ReviewCard } from "@/components/review-card";
import {
  ButtonLink,
  ChipLink,
  CtaBand,
  Eyebrow,
  Prose,
  Section,
  SectionTitle,
} from "@/components/ui";
import {
  badges,
  cities,
  cityHref,
  citiesPreview,
  gallery,
  home,
  postHref,
  posts,
  featuredReviews,
  formatRating,
  reviewSource,
  reviews,
  serviceHref,
  services,
} from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { websiteSchema } from "@/lib/schema";

export const metadata = pageMetadata({
  title: undefined,
  description:
    "Élagage, abattage, débroussaillage (OLD), aménagement paysager et traitement des palmiers sur toute la Côte d'Azur. Devis gratuit sous 24h.",
  path: "/",
});

export default function HomePage() {
  const { hero, about, founder, sections } = home;
  const featured = posts.slice(0, 3);

  return (
    <>
      {/* ------------------------------------------------------------- hero */}
      <section className="relative flex min-h-[92svh] items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={hero.bgImage}
            alt="Élagueur en intervention sur un arbre, Côte d'Azur"
            fill
            priority
            // Photo source très lourde : en 100vw le rendu retina dépassait
            // 1,7 Mo. Une qualité de 60 reste indiscernable derrière le
            // dégradé sombre du héros et divise le poids LCP.
            quality={60}
            sizes="100vw"
            className="object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(105deg,rgba(18,28,22,0.94)_0%,rgba(18,28,22,0.72)_45%,rgba(18,28,22,0.35)_100%)]"
          />
        </div>
        <div className="relative z-10 max-w-160 px-5 py-24 lg:px-12 lg:py-20">
          <p className="mb-4.5 text-[13px] tracking-[2px] text-gold uppercase sm:text-sm">
            {hero.eyebrow}
          </p>
          <h1 className="font-display text-[34px] leading-[1.08] font-semibold text-balance sm:text-[48px] lg:text-[56px]">
            {hero.h1}
          </h1>
          <p className="mt-6 max-w-130 text-[17px] leading-relaxed text-sage-400">{hero.lead}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <ButtonLink href="/contact" size="lg">
              Demander un devis gratuit
            </ButtonLink>
            <ButtonLink href="/services" variant="outline" size="lg">
              Découvrir nos services
            </ButtonLink>
          </div>
          <dl className="mt-14 flex flex-wrap gap-8">
            {hero.stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block font-display text-[26px] text-gold">{s.value}</span>
                  <span aria-hidden="true" className="block text-[13px] text-sage-600">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* -------------------------------------------------- qui sommes-nous */}
      <Section>
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-18">
          <Photo
            src={about.image}
            alt="Équipe Sud Est Paysage au travail"
            className="h-65 lg:h-115"
          />
          <div>
            <Eyebrow>{about.eyebrow}</Eyebrow>
            <SectionTitle className="mb-5.5">{about.h2}</SectionTitle>
            <Prose paras={about.paras} />
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------- fondateur */}
      <Section id="fondateur" tone="mid">
        <div className="grid items-start gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
          <div>
            <Eyebrow>{founder.eyebrow}</Eyebrow>
            <SectionTitle className="mb-6">{founder.h2}</SectionTitle>
            <Prose paras={founder.paras} />
            <div className="mt-9 flex flex-col gap-1 border-l-2 border-gold pl-4.5">
              <span className="font-display text-[19px] font-semibold text-sage-100">
                {founder.name}
              </span>
              <span className="text-sm text-sage-600">{founder.role}</span>
            </div>
          </div>
          {/* Le fichier source ne fait que 601 px de large : on cadre l'image
              plutôt que de l'étirer sur une demi-page, où elle serait floue. */}
          <figure className="mx-auto w-full max-w-110 lg:sticky lg:top-28">
            <Photo
              src={founder.image}
              alt={founder.imageAlt}
              sizes="(min-width: 1024px) 440px, (min-width: 640px) 440px, 100vw"
              className="aspect-square"
            />
            <figcaption className="mt-3 text-[13px] leading-relaxed text-sage-600">
              {founder.name} en intervention sur un pin — élagage en accès corde.
            </figcaption>
          </figure>
        </div>
      </Section>

      {/* ----------------------------------------------------------- services */}
      <Section tone="cream">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow tone="ink">{sections.servicesEyebrow}</Eyebrow>
            <SectionTitle>{sections.servicesH2}</SectionTitle>
          </div>
          <Link
            href="/services"
            className="border-b-2 border-ink-900 pb-1 text-[15px] font-semibold"
          >
            Voir le détail des services →
          </Link>
        </div>
        <ul className="grid gap-px bg-ink-900/12 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            // La dernière carte occupe toute la rangée pour éviter une cellule vide.
            const spanAll = i === services.length - 1 && services.length % 3 === 1;
            return (
              <li key={s.id} className={spanAll ? "lg:col-span-3" : undefined}>
                <Link
                  href={serviceHref(s.id)}
                  className="block h-full bg-cream px-8 py-10 transition duration-250 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(30,43,33,0.15)]"
                >
                  <span className="mb-5 block font-display text-[15px] text-ink-700">
                    {s.num}
                  </span>
                  <h3 className="mb-3 font-display text-[22px] font-semibold">{s.shortTitle}</h3>
                  <p className="text-[15px] leading-relaxed text-ink-600">{s.shortDesc}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* ------------------------------------------------------- réalisations */}
      <Section>
        <Eyebrow>{sections.galleryEyebrow}</Eyebrow>
        <SectionTitle className="mb-10">{sections.galleryH2}</SectionTitle>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((g) => (
            <li key={g.id}>
              <Photo
                src={g.img}
                alt={cleanAlt(g.label)}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="h-70 transition-transform duration-300 hover:scale-[1.03]"
              />
            </li>
          ))}
        </ul>
      </Section>

      {/* --------------------------------------------------------------- avis */}
      <Section tone="cream">
        <Eyebrow tone="ink" className="text-center">
          {sections.avisEyebrow}
        </Eyebrow>
        <SectionTitle className="mb-4 text-center">{sections.avisH2}</SectionTitle>
        <p className="mx-auto mb-12 max-w-2xl text-center text-[15px] text-ink-600">
          <strong className="font-semibold text-ink-900">
            {formatRating(reviewSource.ratingValue)}/5
          </strong>{" "}
          sur {reviewSource.ratingCount} avis publiés sur {reviewSource.name}, recueillis sous notre
          ancien nom {reviewSource.formerName}.
        </p>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredReviews.map((review, i) => (
            <li key={`${review.author}-${review.date}-${i}`}>
              <ReviewCard review={review} tone="light" />
            </li>
          ))}
        </ul>
        <div className="mt-10 text-center">
          <Link
            href="/avis"
            className="inline-block border-b-2 border-ink-900 pb-1 text-[15px] font-semibold"
          >
            Lire les {reviews.length} avis clients →
          </Link>
        </div>
        <ul className="mt-14 flex flex-wrap justify-center gap-8 border-t border-ink-900/12 pt-12 lg:gap-16">
          {badges.map((b) => (
            <li key={b.titre} className="flex min-w-37.5 flex-col items-center gap-2">
              <span className="font-display text-[22px] text-ink-600">{b.titre}</span>
              <span className="text-center text-[13px] text-ink-600">{b.sous}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* -------------------------------------------------- zone d'intervention */}
      <Section tone="deep">
        <div className="text-center">
          <Eyebrow>{sections.zoneEyebrow}</Eyebrow>
          <SectionTitle className="mb-10">{sections.zoneH2}</SectionTitle>
          <ul className="mb-9 flex flex-wrap justify-center gap-3.5">
            {citiesPreview.map((name) => {
              const city = cities.find((c) => c.name === name);
              return (
                <li key={name}>
                  {city ? <ChipLink href={cityHref(city.slug)}>{name}</ChipLink> : null}
                </li>
              );
            })}
          </ul>
          <ButtonLink href="/secteurs" variant="underline">
            Voir toutes les villes couvertes →
          </ButtonLink>
        </div>
      </Section>

      {/* --------------------------------------------------------------- blog */}
      <Section>
        <Eyebrow>{sections.blogEyebrow}</Eyebrow>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <SectionTitle className="max-w-150">{sections.blogH2}</SectionTitle>
          <Link
            href="/blog"
            className="border-b-2 border-sage-100 pb-1 text-[15px] font-semibold"
          >
            Tous les articles →
          </Link>
        </div>
        <ul className="grid gap-7 lg:grid-cols-3">
          {featured.map((p) => (
            <li key={p.slug}>
              <Link
                href={postHref(p.slug)}
                className="block transition-transform duration-250 hover:-translate-y-1.5"
              >
                <Photo
                  src={p.cardImg}
                  alt={p.title}
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="mb-5 h-47.5"
                />
                <p className="mb-2.5 text-xs tracking-[1px] text-gold uppercase">{p.cat}</p>
                <h3 className="mb-2.5 font-display text-[19px] leading-snug font-semibold">
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed text-sage-600">{p.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand title={sections.ctaH2} lead={sections.ctaLead} />
      <JsonLd data={websiteSchema()} />
    </>
  );
}
