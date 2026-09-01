import { ServiceCityPage, serviceCityMetadata } from "@/components/service-city-page";
import { serviceCityPairs } from "@/lib/content";

/** Le traitement phytosanitaire a sa propre route (segment statique homonyme). */
const OWN_ROUTE = "traitement-phytosanitaire";

export const dynamicParams = false;

export function generateStaticParams() {
  return serviceCityPairs.filter((p) => p.service !== OWN_ROUTE);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string; ville: string }>;
}) {
  const { service, ville } = await params;
  return serviceCityMetadata(service, ville);
}

export default async function Page({
  params,
}: {
  params: Promise<{ service: string; ville: string }>;
}) {
  const { service, ville } = await params;
  return <ServiceCityPage service={service} ville={ville} />;
}
