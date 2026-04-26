import type { Metadata } from "next";
import { products, shopCopy } from "@/content/shop";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Shop",
  description: "Rep the Goose. Look cool. Be happy.",
};

export default function ShopPage() {
  return (
    <>
      <PageHeader
        eyebrow="Fourthwall Storefront"
        title={
          <>
            Fresh <span className="italic text-hazard">Merch</span>
          </>
        }
        body={shopCopy.subhead}
      />

      <section className="border-b border-bone/10 bg-ink py-12 md:py-16">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-baseline justify-between gap-4 px-5 md:px-10">
          <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55">
            {products.length} products / external checkout via Fourthwall
          </p>
          <a
            href={shopCopy.collectionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65 hover:text-hazard"
          >
            View OG Bigboy collection ↗
          </a>
        </div>
      </section>

      <section className="bg-ink py-12 md:py-16">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <li
                key={p.url}
                className={`group relative border-bone/15 ${
                  i === 0 ? "border-t" : ""
                } border-b sm:border-r ${
                  i % 2 === 1 ? "sm:border-r-0 lg:border-r" : ""
                } ${i % 3 === 2 ? "lg:border-r-0" : ""}`}
              >
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full flex-col justify-between p-6 md:p-8"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-haze-500">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-cover [filter:grayscale(1)_contrast(1.05)] transition-[filter,transform] duration-500 group-hover:scale-[1.02] group-hover:[filter:grayscale(0)_contrast(1)]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="font-display text-3xl text-bone/40">
                          {p.name[0]}
                        </span>
                      </div>
                    )}
                    <span
                      aria-hidden
                      className="absolute inset-0 [background-image:radial-gradient(rgba(10,10,10,0.4)_1px,transparent_1.2px)] [background-size:3px_3px] mix-blend-multiply opacity-50 transition-opacity duration-500 group-hover:opacity-0"
                    />
                  </div>
                  <div className="mt-6 flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-xl text-bone group-hover:text-hazard md:text-2xl">
                      {p.name}
                    </h3>
                    <span className="shrink-0 font-body text-sm font-semibold tabular-nums text-bone">
                      {p.price}
                    </span>
                  </div>
                  <p className="mt-2 font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/55">
                    Buy on Fourthwall ↗
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-ink py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <h2 className="heading-display text-[clamp(2.4rem,7vw,5rem)] text-bone">
            All <span className="italic text-hazard">products</span> live on
            Fourthwall.
          </h2>
          <p className="mt-6 max-w-2xl font-body text-base text-bone/85 md:text-lg">
            Checkout, sizing, and shipping are handled by Fourthwall. Use the
            store link if you want the full collection or supporter pricing.
          </p>
          <a
            href={shopCopy.storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex h-12 items-center bg-hazard px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-bone"
          >
            Open the store ↗
          </a>
        </div>
      </section>
    </>
  );
}
