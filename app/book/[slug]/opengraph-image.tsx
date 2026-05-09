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
  return ogImageResponse({
    eyebrow: svc?.title ?? "Service",
    title: "Brief",
  });
}
