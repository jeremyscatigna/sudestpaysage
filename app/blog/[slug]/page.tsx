import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { Photo } from "@/components/photo";
import { RichText } from "@/components/rich-text";
import { Breadcrumb, ButtonLink, Section, SectionTitle } from "@/components/ui";
import { getPost, postHref, postSlugs, relatedPosts } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";

/** Les 26 articles sont connus au build : aucun rendu dynamique. */
export const dynamicParams = false;

export function generateStaticParams() {
  return postSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.metaDesc,
    path: postHref(slug),
    image: post.hero ?? undefined,
    type: "article",
    publishedTime: post.date,
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = relatedPosts(slug, 3);

  return (
    <>
      <article className="px-5 pt-16 lg:px-12">
        <div className="mx-auto max-w-190">
          <Breadcrumb
            items={[
              { label: "Accueil", href: "/" },
              { label: "Blog", href: "/blog" },
              { label: post.title },
            ]}
          />
          <p className="mt-7 mb-3.5 text-xs tracking-[1px] text-gold uppercase">
            {post.cat} · <time dateTime={post.date}>{post.dateFr}</time>
          </p>
          <h1 className="mb-8 font-display text-[30px] leading-[1.25] font-semibold text-balance sm:text-[38px]">
            {post.title}
          </h1>

          {post.hero && (
            <Photo
              src={post.hero}
              alt={post.title}
              sizes="(min-width: 768px) 760px, 100vw"
              priority
              className="mb-11 h-60 sm:h-95"
            />
          )}

          <p className="mb-6 text-[17px] leading-[1.85] text-sage-300">
            <RichText>{post.lead}</RichText>
          </p>

          {post.sections.map((section, i) => (
            <section key={i}>
              {section.heading && (
                <h2 className="mt-10 mb-4.5 font-display text-[22px] font-semibold sm:text-[24px]">
                  {section.heading}
                </h2>
              )}
              {section.paras.map((para, j) => (
                <p key={j} className="mb-6 text-base leading-[1.85] text-sage-500">
                  <RichText>{para}</RichText>
                </p>
              ))}
            </section>
          ))}

          <div className="my-12 rounded-sm bg-forest-600 px-6 py-9 text-center sm:px-9">
            <h2 className="mb-4 font-display text-[22px] font-semibold">
              Un projet sur la Côte d&apos;Azur ?
            </h2>
            <ButtonLink href="/contact">Demander un devis gratuit</ButtonLink>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <Section>
          <SectionTitle className="mb-8 text-[22px] sm:text-[26px]">
            À lire aussi
          </SectionTitle>
          <ul className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <li key={p.slug}>
                <Link
                  href={postHref(p.slug)}
                  className="block transition-transform duration-250 hover:-translate-y-1.5"
                >
                  <Photo
                    src={p.cardImg}
                    alt={p.title}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="mb-4 h-40"
                  />
                  <p className="mb-2 text-xs tracking-[1px] text-gold uppercase">{p.cat}</p>
                  <h3 className="font-display text-[17px] leading-snug font-semibold">
                    {p.title}
                  </h3>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <JsonLd data={articleSchema(post)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Accueil", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: post.title, url: postHref(slug) },
        ])}
      />
    </>
  );
}
