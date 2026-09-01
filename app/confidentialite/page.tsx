import { DocPage } from "@/components/doc-page";
import { privacyPage } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Politique de confidentialité",
  description: privacyPage.metaDesc,
  path: "/confidentialite",
});

export default function Page() {
  return (
    <DocPage
      doc={privacyPage}
      breadcrumb="Politique de confidentialité"
      path="/confidentialite"
      crossLink={{ href: "/mentions-legales", label: "Voir les mentions légales" }}
    />
  );
}
