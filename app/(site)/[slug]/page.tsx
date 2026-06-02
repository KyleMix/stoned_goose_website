import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pages } from "@/content/pages";
import { site } from "@/content/site";
import { SectionRenderer } from "@/components/section-renderer";

// Editor-created pages live at top-level URLs (/about, /faq, etc.).
// Slug collisions with hard-coded routes are caught at build time:
//   - content/pages.ts throws if a reserved slug slipped through
//     (lib/reserved-slugs.ts is the source of truth)
// Next.js App Router resolves static segments before dynamic ones, so
// hard-coded routes like /shows continue to win over this catch-all.

type Params = { slug: string };

// `output: "export"` requires at least one statically-generated slug here,
// even if the editor's pages collection is empty. The seeded "welcome" page
// at content/pages/welcome guarantees this. dynamicParams=false ensures any
// other slug 404s instead of trying to render at request time.
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const page = pages.find((p) => p.slug === slug);
  if (!page) return { title: "Page" };

  const description = page.seoDescription || site.description;
  const ogImage = page.ogImage || undefined;

  return {
    title: page.title,
    description,
    alternates: { canonical: `/${page.slug}` },
    openGraph: {
      title: page.title,
      description,
      url: `${site.url}/${page.slug}`,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}

export default async function DynamicPage(props: { params: Promise<Params> }) {
  const { slug } = await props.params;
  const page = pages.find((p) => p.slug === slug);
  if (!page) notFound();

  return <SectionRenderer sections={page.sections} pageSlug={page.slug} />;
}
