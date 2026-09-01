import type { FaqItem } from "@/lib/types";

/**
 * FAQ en <details>/<summary> : accessible au clavier et fonctionnelle sans
 * JavaScript, là où l'ancien site dépendait d'un état React.
 */
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <details key={i} className="group overflow-hidden rounded-sm bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5.5 text-base font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
            <span>{item.question}</span>
            <span
              aria-hidden="true"
              className="shrink-0 text-xl text-ink-700 transition-transform duration-200 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="px-6 pb-6 text-[15px] leading-[1.75] text-ink-600">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
