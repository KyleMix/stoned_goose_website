import { upcomingShows, showAnchor } from "@/content/shows";
import { performerOgResponse } from "@/lib/og-performer";

// One share card per upcoming headliner, written at build time to
// /shows/og/<slug>.png. The segment carries the extension so the static
// export writes a .png file and the host serves it as image/png.
export const dynamic = "force-static";
export const dynamicParams = false;

const headliners = upcomingShows.filter((s) => s.performer);

export function generateStaticParams() {
  return headliners.map((s) => ({ file: `${showAnchor(s)}.png` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const show = headliners.find((s) => `${showAnchor(s)}.png` === file);
  if (!show) return new Response("Not found", { status: 404 });
  return performerOgResponse(show);
}
