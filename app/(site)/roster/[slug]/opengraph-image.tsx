import { ogContentType, ogImageResponse, ogSize } from "@/lib/og-template";
import { epkComedians, getComedian } from "@/content/comedians";

export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static";

export const alt = "Stoned Goose Productions roster comedian";

// Mirrors the page's params, sentinel included, so the static export never
// sees an empty param set for this route.
export function generateStaticParams() {
  const params = epkComedians.map((c) => ({ slug: c.slug }));
  return params.length > 0 ? params : [{ slug: "__no-epk" }];
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const comedian = getComedian(slug);
  return ogImageResponse({
    eyebrow: "The Roster",
    title: comedian?.name ?? "Roster",
  });
}
