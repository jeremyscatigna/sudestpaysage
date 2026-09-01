/**
 * Injecte un bloc JSON-LD.
 *
 * `JSON.stringify` ne produit pas de `</script>`, mais on échappe malgré tout
 * les chevrons pour rester à l'abri d'une sortie de contexte si un contenu
 * venait à contenir du balisage.
 */
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
