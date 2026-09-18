"use client";

import { useMemo, useState } from "react";
import { productsByCategory, type Product, type ShopCategory } from "@/content/shop";
import { ShopProductCard } from "@/components/shop-product-card";
import { track } from "@/lib/analytics";

type Filter = "All" | ShopCategory;

// The catalog: a filter row and one grid, the way a merch shop reads.
//
// The page used to stack a separate section per category, which meant the
// grid restarted four times and a visitor looking for a hat scrolled past
// every shirt to find it. Filtering keeps one grid and one scroll, and the
// row doubles as the category list.
export function ShopCatalog({ products }: { products: Product[] }) {
  const groups = useMemo(() => productsByCategory(products), [products]);
  const [filter, setFilter] = useState<Filter>("All");

  // A category can empty out between builds. Fall back rather than render a
  // grid with nothing in it under a filter nobody can unset.
  const group = groups.find((g) => g.category === filter);
  const active: Filter = group ? filter : "All";
  const visible = group ? group.products : products;

  return (
    <section className="bg-surface-tuxedo pb-20 pt-10 md:pb-24 md:pt-12">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="flex flex-wrap items-center gap-3">
          <FilterChip
            label="All"
            count={products.length}
            active={active === "All"}
            onClick={() => setFilter("All")}
          />
          {groups.map((g) => (
            <FilterChip
              key={g.category}
              label={g.category}
              count={g.products.length}
              active={active === g.category}
              onClick={() => {
                setFilter(g.category);
                track("Shop Filter", { category: g.category });
              }}
            />
          ))}
        </div>

        <p aria-live="polite" className="t-fine mt-6">
          {visible.length} {visible.length === 1 ? "item" : "items"}
          {active === "All" ? "" : ` in ${active}`}. Checkout, sizing and
          shipping are handled by Fourthwall.
        </p>

        <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 md:gap-x-10 lg:grid-cols-4">
          {visible.map((p) => (
            <ShopProductCard key={p.slug} product={p} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      // Gold rests, ivory responds: the selected chip is the gold fill and
      // hovers to ivory, so the two states never read as the same chip.
      className={
        active
          ? "inline-flex h-11 items-center border border-accent-gold bg-accent-gold px-5 t-ui text-surface-tuxedo hover:border-surface-ivory hover:bg-surface-ivory"
          : "inline-flex h-11 items-center border border-smoke px-5 t-ui hover:border-accent-gold hover:text-accent-gold"
      }
    >
      {label}
      <span className="ml-2 tabular-nums">{count}</span>
    </button>
  );
}
