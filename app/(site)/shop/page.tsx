import type { Metadata } from "next";
import { products, shopCopy } from "@/content/shop";
import { PageHeader } from "@/components/page-header";
import { ShopCatalog } from "@/components/shop-catalog";
import { TrackedAnchor } from "@/components/tracked-anchor";
import { JsonLd } from "@/components/json-ld";
import { buildBreadcrumbs } from "@/lib/schema";
import { Surface } from "@/components/brand/surface";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Shop Stoned Goose Productions merch. Hoodies, hats, stickers, and the metal goose. Checkout handled by Fourthwall.",
  alternates: {
    canonical: "/shop",
  },
};

export default function ShopPage() {
  // Photographed products lead the grid; imageless ones render a typographic
  // tile so every SKU stays shoppable while the owner pastes Fourthwall image
  // URLs in over time.
  const visibleProducts = [...products].sort(
    (a, b) => (b.image ? 1 : 0) - (a.image ? 1 : 0),
  );

  return (
    <>
      <JsonLd schema={buildBreadcrumbs("/shop")} />
      <PageHeader
        eyebrow="Fourthwall storefront"
        title={
          <>
            Fresh <span className="text-accent-gold">Merch</span>
          </>
        }
        body={shopCopy.subhead}
      />

      {visibleProducts.length > 0 ? (
        <ShopCatalog products={visibleProducts} />
      ) : (
        // The catalog syncs at build time, so an empty grid means the sync
        // came back empty. Say so and hand the visitor the store rather than
        // showing a page that looks broken.
        <section className="bg-surface-tuxedo py-20 md:py-24">
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <p className="t-body max-w-xl text-base md:text-lg">
              Products are not loading right now. The full collection is on the
              Fourthwall store.
            </p>
          </div>
        </section>
      )}

      <Surface tone="ivory" as="section" className="py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <h2 className="t-headline display-1">
            Every order ships from{" "}
            <span className="text-accent-gold">Fourthwall</span>.
          </h2>
          <p className="t-body mt-6 max-w-2xl text-base md:text-lg">
            Checkout, sizing, and shipping are handled by Fourthwall. Use the
            store link for the full collection, supporter pricing, and order
            help.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <TrackedAnchor
              destination="fourthwall"
              href={shopCopy.storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center bg-accent-gold px-6 t-ui text-surface-tuxedo hover:bg-surface-ivory"
            >
              Open the store ↗
            </TrackedAnchor>
            <TrackedAnchor
              destination="fourthwall"
              href={shopCopy.collectionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center border border-smoke px-6 t-ui hover:border-accent-gold hover:text-accent-gold"
            >
              OG Bigboy collection ↗
            </TrackedAnchor>
          </div>
        </div>
      </Surface>
    </>
  );
}
