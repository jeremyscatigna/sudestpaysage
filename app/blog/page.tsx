import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { Photo } from "@/components/photo";
import { CtaBand, Eyebrow, Prose, Section, SectionTitle } from "@/components/ui";
import { blogIndexPage, postHref, posts } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "Blog – Conseils d'élagage et de jardinage sur la Côte d'Azur",
  description: blogIndexPage.metaDesc,
  path: "/blog",
});

export default function BlogIndexPage() {
  return (
    <>
      <Section width="narrow" className="text-center">
        <Eyebrow>{blogIndexPage.eyebrow}</Eyebrow>
        <SectionTitle as="h1" className="mb-5.5">
          {blogIndexPage.h1}
        </SectionTitle>
        <Prose paras={blogIndexPage.intro} />
      </Section>

      <Section>
        <ul className="grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <li key={p.slug}>
              <article>
                <Link
                  href={postHref(p.slug)}
                  className="block transition-transform duration-250 hover:-translate-y-1.5"
                >
                  <Photo
                    src={p.cardImg}
                    alt={p.title}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="mb-5 h-47.5"
                  />
                  <p className="mb-2.5 text-xs tracking-[1px] text-gold uppercase">
                    {p.cat} · <time dateTime={p.date}>{p.dateFr}</time>
                  </p>
                  <h2 className="mb-2.5 font-display text-[19px] leading-snug font-semibold">
                    {p.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-sage-600">{p.excerpt}</p>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand
        title="Un projet sur la Côte d'Azur ?"
        lead="Recevez un devis gratuit et sans engagement sous 24h."
      />

      <JsonLd
        data={breadcrumbSchema([
          { name: "Accueil", url: "/" },
          { name: "Blog", url: "/blog" },
        ])}
      />
    </>
  );
}
