import { ButtonLink, Section, SectionTitle } from "@/components/ui";

export default function NotFound() {
  return (
    <Section width="narrow" className="text-center">
      <p className="mb-4 font-display text-[15px] text-gold">Erreur 404</p>
      <SectionTitle as="h1" className="mb-5">
        Cette page n&apos;existe pas
      </SectionTitle>
      <p className="mb-9 text-base leading-relaxed text-sage-500">
        Le lien est peut-être obsolète. Retrouvez nos prestations, nos secteurs d&apos;intervention
        ou contactez-nous directement.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <ButtonLink href="/">Retour à l&apos;accueil</ButtonLink>
        <ButtonLink href="/services" variant="outline">
          Nos services
        </ButtonLink>
      </div>
    </Section>
  );
}
