import { DocPage } from "@/components/doc-page";
import { legalPage } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Mentions légales",
  description: legalPage.metaDesc,
  path: "/mentions-legales",
});

export default function Page() {
  return (
    <DocPage
      doc={legalPage}
      breadcrumb="Mentions légales"
      path="/mentions-legales"
      crossLink={{ href: "/confidentialite", label: "Voir notre politique de confidentialité" }}
    />
  );
}
