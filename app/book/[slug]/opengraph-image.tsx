import { ogContentType, ogImageResponse, ogSize } from "@/lib/og-template";
import { services } from "@/content/services";

export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static";

export const alt = "Stoned Goose Productions service brief";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const svc = services.find((s) => s.slug === slug);
  // Lead with the service name. Eyebrow says it's a brief. Footer mark in the
  // template carries the brand. Big text reads "Live Show Production." not
  // "Brief." which was the same word on every card.
  return ogImageResponse({
    eyebrow: "Service brief",
    title: svc?.title ?? "Service",
  });
}
