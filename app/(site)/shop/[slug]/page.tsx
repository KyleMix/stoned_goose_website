import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products, getProduct } from "@/content/shop";
import { site } from "@/content/site";
import { AddToCart } from "@/components/cart/add-to-cart";

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
  if (!product) return { title: "Product" };
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

  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [{ url: product.image }]
        : [];

  return (
    <section className="bg-ink py-28 md:py-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <Link
          href="/shop"
          className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55 transition-colors hover:text-slime"
        >
          ← Back to shop
        </Link>

        <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-14">
          {/* Gallery */}
          <div className="flex flex-col gap-3">
            {images[0] ? (
              <div className="relative aspect-square w-full overflow-hidden bg-haze-500">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[0].url}
                  alt={product.imageAlt || product.name}
                  className="h-full w-full object-cover [filter:grayscale(1)_contrast(1.05)]"
                />
              </div>
            ) : (
              <div className="aspect-square w-full bg-haze-500" />
            )}
            {images.length > 1 ? (
              <div className="grid grid-cols-4 gap-3">
                {images.slice(1, 5).map((img, i) => (
                  <div
                    key={`${img.url}-${i}`}
                    className="relative aspect-square overflow-hidden bg-haze-500"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt=""
                      className="h-full w-full object-cover [filter:grayscale(1)]"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Details */}
          <div className="md:pt-2">
            <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[0.95] text-bone">
              {product.name}
            </h1>
            {product.price ? (
              <p className="mt-4 font-body text-xl font-semibold tabular-nums text-hazard">
                {product.price}
              </p>
            ) : null}

            <div className="mt-8">
              <AddToCart product={product} />
            </div>

            {product.description ? (
              <div className="mt-10 border-t border-bone/15 pt-6">
                <p className="max-w-prose whitespace-pre-line font-body text-sm leading-relaxed text-bone/80">
                  {product.description}
                </p>
              </div>
            ) : null}

            <p className="mt-10 font-body text-[10px] uppercase tracking-[0.18em] text-bone/40">
              Checkout, sizing, and shipping handled by Fourthwall.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
