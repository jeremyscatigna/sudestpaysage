import type { Review } from "@/lib/types";

/** Étoiles pleines / vides, avec une note textuelle pour les lecteurs d'écran. */
function Stars({ rating, tone }: { rating: number; tone: "light" | "dark" }) {
  const on = tone === "light" ? "text-gold-dark" : "text-gold";
  const off = tone === "light" ? "text-ink-900/20" : "text-sage-100/20";
  return (
    <p className="text-[15px] tracking-[2px]">
      <span className="sr-only">Note : {rating} sur 5</span>
      <span aria-hidden="true">
        <span className={on}>{"★".repeat(rating)}</span>
        <span className={off}>{"★".repeat(5 - rating)}</span>
      </span>
    </p>
  );
}

/**
 * Carte d'avis client.
 *
 * `tone="light"` pour les sections crème, `tone="dark"` pour les fonds verts.
 * Le texte est une citation : il est rendu tel quel, sans correction.
 */
export function ReviewCard({
  review,
  tone = "light",
}: {
  review: Review;
  tone?: "light" | "dark";
}) {
  const light = tone === "light";

  return (
    <figure
      className={`flex h-full flex-col gap-4 rounded-sm px-7 py-8 ${
        light ? "bg-white" : "bg-forest-600"
      }`}
    >
      <Stars rating={review.rating} tone={tone} />

      <blockquote
        className={`grow text-[15px] leading-[1.75] italic ${
          light ? "text-ink-700" : "text-sage-300"
        }`}
      >
        {`« ${review.text} »`}
      </blockquote>

      <figcaption className="flex flex-col gap-0.5">
        <span className={`text-sm font-semibold ${light ? "text-ink-900" : "text-sage-100"}`}>
          {review.author}
        </span>
        <span className={`text-[13px] ${light ? "text-ink-600" : "text-sage-600"}`}>
          {review.city ? `${review.city} · ` : ""}
          <time dateTime={review.date}>{review.dateFr}</time>
        </span>
        {review.work && (
          <span className={`mt-1 text-[12.5px] ${light ? "text-ink-600" : "text-sage-700"}`}>
            {review.work}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
