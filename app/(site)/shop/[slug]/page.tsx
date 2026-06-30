import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products, getProduct } from "@/content/shop";
import { site } from "@/content/site";
import { ShopProductDetail } from "@/components/shop-product-detail";
import { JsonLd } from "@/components/json-ld";
import { buildBreadcrumbs } from "@/lib/schema";

type Params = { slug: string };

// Static export needs at least one path. When no products are synced yet the
// grid still renders from the manual list, so emit those slugs (plus a
// sentinel) and 404 anything else.
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  const params = products.map((p) => ({ slug: p.slug }));
  return params.length > 0 ? params : [{ slug: "__no-products" }];
}

export async function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product)
    return { title: "Not found", robots: { index: false, follow: false } };
  const description =
    (product.description && product.description.slice(0, 160)) ||
    `${product.name} from Stoned Goose Productions. ${site.description}`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      url: `${site.url}/shop/${product.slug}`,
      ...(product.image ? { images: [{ url: product.image }] } : {}),
    },
  };
}

export default async function ProductPage(props: {
  params: Promise<Params>;
}) {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <>
      <JsonLd schema={buildBreadcrumbs(`/shop/${product.slug}`, product.name)} />
      <section className="bg-ink py-28 md:py-32">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <Link
            href="/shop"
            className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55 transition-colors hover:text-slime"
          >
            ← Back to shop
          </Link>
          <ShopProductDetail product={product} />
        </div>
      </section>
    </>
  );
}
