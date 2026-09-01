import { ServiceCityPage, serviceCityMetadata } from "@/components/service-city-page";
import { citySlugs } from "@/lib/content";

/**
 * Pages ville du traitement phytosanitaire.
 *
 * Cette route existe séparément de `/[service]/[ville]` parce que le segment
 * statique `traitement-phytosanitaire` (la page service dédiée) prend la
 * priorité sur le segment dynamique dans la résolution de routes de Next.
 */
const SERVICE = "traitement-phytosanitaire";

export const dynamicParams = false;

export function generateStaticParams() {
  return citySlugs.map((ville) => ({ ville }));
}

export async function generateMetadata({ params }: { params: Promise<{ ville: string }> }) {
  const { ville } = await params;
  return serviceCityMetadata(SERVICE, ville);
}

export default async function Page({ params }: { params: Promise<{ ville: string }> }) {
  const { ville } = await params;
  return <ServiceCityPage service={SERVICE} ville={ville} />;
}
