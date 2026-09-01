import Image from "next/image";

/**
 * Photo de contenu.
 *
 * Les chemins viennent de `content/*.json` (chaînes, pas d'imports statiques) :
 * on utilise donc `fill` dans un conteneur dimensionné, ce qui correspond aussi
 * aux hauteurs fixes du design d'origine.
 */
export function Photo({
  src,
  alt,
  className = "",
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  rounded = true,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  rounded?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-forest-700 ${rounded ? "rounded-sm" : ""} ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}

/** Nettoie les libellés héritées du type « Photo : élagage d'un pin ». */
export function cleanAlt(label: string): string {
  const stripped = label.replace(/^Photo\s*:\s*/i, "").trim();
  if (!stripped) return "Chantier Sud Est Paysage";
  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
}
