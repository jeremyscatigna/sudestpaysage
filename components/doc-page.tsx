import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { RichText } from "@/components/rich-text";
import { Breadcrumb, SectionTitle } from "@/components/ui";
import { breadcrumbSchema } from "@/lib/schema";
import type { DocPage as DocPageData } from "@/lib/types";

/** Gabarit des pages légales (mentions légales, confidentialité). */
export function DocPage({
  doc,
  breadcrumb,
  path,
  crossLink,
}: {
  doc: DocPageData;
  breadcrumb: string;
  path: string;
  /** Lien vers l'autre page légale, rendu ici plutôt que dans le contenu. */
  crossLink: { href: string; label: string };
}) {
  return (
    <article className="px-5 py-16 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-190">
        <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: breadcrumb }]} />
        <SectionTitle as="h1" className="mt-6 mb-8">
          {doc.h1}
        </SectionTitle>
        {doc.blocks.map((block, i) => (
          <section key={i}>
            {block.heading && (
              <h2 className="mt-10 mb-4 font-display text-[22px] font-semibold">
                {block.heading}
              </h2>
            )}
            {block.paras.map((para, j) => (
              <p key={j} className="mb-5 text-base leading-[1.85] text-sage-500">
                <RichText>{para}</RichText>
              </p>
            ))}
          </section>
        ))}

        <Link
          href={crossLink.href}
          className="mt-8 inline-block border-b-2 border-gold pb-1 text-[15px] font-semibold text-gold"
        >
          {crossLink.label} →
        </Link>
      </div>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Accueil", url: "/" },
          { name: breadcrumb, url: path },
        ])}
      />
    </article>
  );
}
