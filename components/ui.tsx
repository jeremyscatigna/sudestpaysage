import Link from "next/link";
import type { ReactNode } from "react";

import { RichText } from "@/components/rich-text";

/* --------------------------------------------------------------- primitives */

export function Eyebrow({
  children,
  tone = "gold",
  className = "",
}: {
  children: ReactNode;
  tone?: "gold" | "ink";
  className?: string;
}) {
  const color = tone === "gold" ? "text-gold" : "text-ink-600";
  return (
    <p className={`mb-4 text-[13px] tracking-[2px] uppercase ${color} ${className}`}>{children}</p>
  );
}

export function SectionTitle({
  children,
  as: Tag = "h2",
  className = "",
}: {
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <Tag
      className={`font-display font-semibold leading-tight text-balance ${
        Tag === "h1" ? "text-[32px] sm:text-[42px]" : "text-[26px] sm:text-[34px]"
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

/** Paragraphes de contenu, avec support du texte enrichi. */
export function Prose({
  paras,
  tone = "muted",
  lead = false,
  className = "",
}: {
  paras: string[];
  tone?: "muted" | "bright" | "ink";
  lead?: boolean;
  className?: string;
}) {
  const color =
    tone === "bright" ? "text-sage-300" : tone === "ink" ? "text-ink-600" : "text-sage-500";
  const size = lead ? "text-[17px] sm:text-[18px]" : "text-base";
  return (
    <div className={`flex flex-col gap-5.5 ${size} leading-[1.85] ${color} ${className}`}>
      {paras.map((p, i) => (
        <p key={i}>
          <RichText>{p}</RichText>
        </p>
      ))}
    </div>
  );
}

/** Liste à puces dorées. */
export function Bullets({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul className={`flex flex-col gap-3 ${className}`}>
      {items.map((item, i) => (
        <li key={i} className="flex items-baseline gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 size-1.5 shrink-0 -translate-y-0.5 rounded-full bg-gold"
          />
          <span className="text-[15px] text-sage-200">
            <RichText>{item}</RichText>
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ boutons */

const BTN_BASE =
  "inline-block rounded-sm text-[15px] font-semibold transition-transform duration-200";

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "underline";
  size?: "md" | "lg";
  className?: string;
}) {
  const pad = size === "lg" ? "px-8 py-4" : "px-7 py-3.5";

  if (variant === "underline") {
    return (
      <Link
        href={href}
        className={`inline-block border-b-2 border-gold pb-1 text-[15px] font-semibold text-gold ${className}`}
      >
        {children}
      </Link>
    );
  }

  const look =
    variant === "primary"
      ? "bg-gold text-forest-900 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(183,164,92,0.35)]"
      : "border border-sage-100/40 text-sage-100 hover:border-gold hover:text-gold";

  const isExternal = href.startsWith("tel:") || href.startsWith("mailto:");
  if (isExternal) {
    return (
      <a href={href} className={`${BTN_BASE} ${pad} ${look} ${className}`}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={`${BTN_BASE} ${pad} ${look} ${className}`}>
      {children}
    </Link>
  );
}

/* -------------------------------------------------------------------- chips */

export function ChipLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-sage-100/25 px-4.5 py-2 text-sm text-sage-400 transition-colors hover:border-gold hover:text-gold"
    >
      {children}
    </Link>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-sage-100/25 px-4.5 py-2 text-sm text-sage-400">
      {children}
    </span>
  );
}

/* -------------------------------------------------------------- breadcrumbs */

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="mb-4 text-[13px] text-sage-600">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-gold">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
            {i < items.length - 1 && <span aria-hidden="true">›</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ----------------------------------------------------------------- sections */

export function Section({
  children,
  tone = "dark",
  className = "",
  id,
  width = "wide",
}: {
  children: ReactNode;
  tone?: "dark" | "cream" | "deep" | "mid";
  className?: string;
  id?: string;
  width?: "wide" | "narrow" | "full";
}) {
  const bg =
    tone === "cream"
      ? "bg-cream text-ink-900"
      : tone === "deep"
        ? "bg-forest-600"
        : tone === "mid"
          ? "bg-forest-700"
          : "";
  const inner =
    width === "narrow"
      ? "mx-auto max-w-215"
      : width === "full"
        ? ""
        : "container-page";
  return (
    <section id={id} className={`px-5 py-14 sm:py-20 lg:px-12 lg:py-25 ${bg} ${className}`}>
      <div className={inner}>{children}</div>
    </section>
  );
}

/** Bandeau d'appel à l'action, en fin de page. */
export function CtaBand({
  title,
  lead,
  cta = "Demander mon devis gratuit",
  href = "/contact",
}: {
  title: string;
  lead: string;
  cta?: string;
  href?: string;
}) {
  return (
    <section className="bg-gradient-to-br from-forest-500 to-forest-800 px-5 py-14 text-center sm:py-20 lg:px-12 lg:py-25">
      <SectionTitle className="mx-auto max-w-3xl">{title}</SectionTitle>
      <p className="mx-auto mt-5 max-w-2xl text-base text-sage-500">{lead}</p>
      <ButtonLink href={href} size="lg" className="mt-9">
        {cta}
      </ButtonLink>
    </section>
  );
}
