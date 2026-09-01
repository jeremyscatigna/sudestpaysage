import { site, telHref } from "@/lib/site";

/** Bouton d'appel flottant, présent sur toutes les pages. */
export function CallButton() {
  return (
    <a
      href={telHref()}
      aria-label={`Appeler ${site.name} au ${site.phone}`}
      className="fixed right-6 bottom-6 z-90 flex size-14 items-center justify-center rounded-full bg-gold text-2xl text-forest-900 shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-transform hover:scale-108"
    >
      <span aria-hidden="true">📞</span>
    </a>
  );
}
