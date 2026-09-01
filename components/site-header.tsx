"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { nav, site } from "@/lib/site";

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-semibold tracking-[0.3px] ${className}`}>
      Sud Est <span className="text-gold italic">Paysage</span>
    </span>
  );
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);

  // Empêche le défilement de l'arrière-plan quand le menu plein écran est ouvert.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  /**
   * Gestion du focus du menu modal :
   * - à l'ouverture, le focus entre dans la boîte de dialogue ;
   * - Tab / Maj+Tab bouclent à l'intérieur (sans quoi on tabule vers des liens
   *   masqués par l'overlay) ;
   * - Échap ferme et le focus revient sur le bouton d'ouverture.
   */
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const opener = document.activeElement as HTMLElement | null;
    // Copie locale : la ref peut avoir changé au moment du nettoyage.
    const trigger = triggerRef.current;
    dialog.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;

      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || !dialog.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !dialog.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // Rend le focus au déclencheur plutôt que de le perdre sur <body>.
      (trigger ?? opener)?.focus();
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between gap-2 border-b border-white/8 bg-forest-900/92 px-4 py-4 backdrop-blur-lg sm:gap-4 sm:px-5 sm:py-5 lg:px-12">
        <Link
          href="/"
          className="text-[19px] whitespace-nowrap sm:text-[22px]"
          aria-label={`${site.name} — accueil`}
        >
          <Wordmark />
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-9 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`text-[15px] transition-colors hover:text-sage-100 ${
                isActive(item.href) ? "text-sage-100" : "text-sage-500"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <Link
            href="/contact"
            className="rounded-sm bg-gold px-3.5 py-2.5 text-[13px] font-semibold tracking-[0.3px] whitespace-nowrap text-forest-900 transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(183,164,92,0.35)] sm:px-5.5 sm:text-[14px]"
          >
            Devis gratuit
          </Link>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label="Ouvrir le menu"
            className="flex size-10.5 shrink-0 items-center justify-center rounded-sm border border-sage-100/30 text-[19px] lg:hidden"
          >
            <span aria-hidden="true">☰</span>
          </button>
        </div>
      </header>

      {open && (
        <div
          ref={dialogRef}
          id="menu-mobile"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-100 flex flex-col bg-forest-900 px-6 py-7 lg:hidden"
        >
          <div className="mb-14 flex items-center justify-between">
            <Wordmark className="text-[22px]" />
            <button
              type="button"
              onClick={close}
              aria-label="Fermer le menu"
              className="text-[30px] leading-none"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <nav aria-label="Navigation" className="flex flex-col gap-7.5">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`text-2xl ${isActive(item.href) ? "text-gold" : "text-sage-100"}`}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/contact" onClick={close} className="text-2xl font-semibold text-gold">
              Devis gratuit
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
