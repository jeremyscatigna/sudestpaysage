import type { ReactNode } from "react";

/**
 * Rend une chaîne de contenu pouvant contenir <i>, <em> et <strong>.
 *
 * Le contenu vient de `content/*.json` (extrait de l'ancien site) : il est donc
 * de confiance, mais on l'analyse quand même en éléments React plutôt que
 * d'utiliser `dangerouslySetInnerHTML`, pour qu'aucune balise inattendue ne
 * puisse être injectée si le contenu évolue.
 */

const TAG = /<(\/?)(i|em|strong)>/gi;

type Tag = "i" | "em" | "strong";

interface Frame {
  tag: Tag | null;
  children: ReactNode[];
}

export function RichText({ children }: { children: string }): ReactNode {
  // Cas courant : pas de balise, on renvoie la chaîne telle quelle.
  if (!children.includes("<")) return children;

  const stack: Frame[] = [{ tag: null, children: [] }];
  let cursor = 0;
  let key = 0;

  const push = (node: ReactNode) => {
    if (node !== "" && node !== null) stack[stack.length - 1].children.push(node);
  };

  const wrap = (tag: Tag, kids: ReactNode[], k: number): ReactNode => {
    if (tag === "strong") return <strong key={k}>{kids}</strong>;
    if (tag === "em") return <em key={k}>{kids}</em>;
    return <i key={k}>{kids}</i>;
  };

  for (const match of children.matchAll(TAG)) {
    const [raw, closing, rawTag] = match;
    const index = match.index ?? 0;
    push(children.slice(cursor, index));
    cursor = index + raw.length;

    const tag = rawTag.toLowerCase() as Tag;
    if (closing) {
      // Ferme le cadre courant s'il correspond ; sinon on ignore la balise
      // orpheline plutôt que de casser le rendu.
      if (stack.length > 1 && stack[stack.length - 1].tag === tag) {
        const frame = stack.pop() as Frame;
        push(wrap(tag, frame.children, key++));
      }
    } else {
      stack.push({ tag, children: [] });
    }
  }

  push(children.slice(cursor));

  // Referme les balises restées ouvertes.
  while (stack.length > 1) {
    const frame = stack.pop() as Frame;
    stack[stack.length - 1].children.push(wrap(frame.tag as Tag, frame.children, key++));
  }

  return stack[0].children;
}
