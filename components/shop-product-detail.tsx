"use client";

import { useMemo, useState } from "react";
import type { Product, ProductVariant } from "@/content/shop";
import { useCart } from "@/components/cart/cart-context";
import { track } from "@/lib/analytics";

const SIZE_ORDER = [
  "XXS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "ONE SIZE",
];

function sizeRank(size: string): number {
  const i = SIZE_ORDER.indexOf(size.toUpperCase());
  return i === -1 ? SIZE_ORDER.length : i;
}

type ColorOption = { name: string; swatch?: string; images: string[] };

// Product detail with separate Color / Size pickers and a gallery that swaps
// to the selected color's photos. Variants come from the Storefront sync as
// size x color combinations, so we derive the two axes here.
export function ShopProductDetail({ product }: { product: Product }) {
  const { enabled, addItem, busy } = useCart();
  const variants = useMemo(() => product.variants ?? [], [product.variants]);

  const colors = useMemo<ColorOption[]>(() => {
    const map = new Map<string, ColorOption>();
    for (const v of variants) {
      if (!v.color) continue;
      if (!map.has(v.color)) {
        map.set(v.color, {
          name: v.color,
          swatch: v.colorSwatch,
          images: v.images ?? [],
        });
      } else if (map.get(v.color)!.images.length === 0 && v.images?.length) {
        map.get(v.color)!.images = v.images;
      }
    }
    return Array.from(map.values());
  }, [variants]);

  const sizes = useMemo<string[]>(() => {
    const set = new Set<string>();
    for (const v of variants) if (v.size) set.add(v.size);
    return Array.from(set).sort((a, b) => sizeRank(a) - sizeRank(b));
  }, [variants]);

  const productImages = useMemo(
    () =>
      product.images && product.images.length > 0
        ? product.images.map((i) => i.url)
        : product.image
          ? [product.image]
          : [],
    [product.images, product.image],
  );

  const [color, setColor] = useState<string | undefined>(colors[0]?.name);
  const [size, setSize] = useState<string | undefined>(
    () => sizes.find((s) => isComboAvailable(variants, colors[0]?.name, s)) ?? sizes[0],
  );
  const [imageIndex, setImageIndex] = useState(0);

  const galleryImages = useMemo(() => {
    const colorImages = color
      ? colors.find((c) => c.name === color)?.images ?? []
      : [];
    return colorImages.length > 0 ? colorImages : productImages;
  }, [color, colors, productImages]);

  const selected = findVariant(variants, color, size);
  const price = selected?.price || product.price;

  function onColor(next: string) {
    setColor(next);
    setImageIndex(0);
    if (size && !isComboAvailable(variants, next, size)) {
      const firstAvail = sizes.find((s) => isComboAvailable(variants, next, s));
      if (firstAvail) setSize(firstAvail);
    }
  }

  // Fallback: no usable variants or cart disabled -> outbound Fourthwall link.
  if (!enabled || variants.length === 0) {
    return (
      <Layout
        images={galleryImages}
        imageIndex={imageIndex}
        setImageIndex={setImageIndex}
        name={product.name}
        imageAlt={product.imageAlt || product.name}
        price={product.price}
        description={product.description}
      >
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("Outbound Click", { destination: "fourthwall" })}
          className="inline-flex h-12 items-center justify-center bg-accent-gold px-6 t-eyebrow text-surface-tuxedo transition-colors hover:bg-surface-ivory"
        >
          Buy on Fourthwall ↗
        </a>
      </Layout>
    );
  }

  return (
    <Layout
      images={galleryImages}
      imageIndex={imageIndex}
      setImageIndex={setImageIndex}
      name={product.name}
      imageAlt={product.imageAlt || product.name}
      price={price}
      description={product.description}
    >
      <div className="flex flex-col gap-6">
        {colors.length > 1 ? (
          <div>
            <p className="t-eyebrow text-smoke">
              Color{color ? `. ${color}` : ""}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {colors.map((c) => {
                const active = c.name === color;
                return (
                  <button
                    key={c.name}
                    type="button"
                    title={c.name}
                    aria-label={c.name}
                    aria-pressed={active}
                    onClick={() => onColor(c.name)}
                    className={`h-8 w-8 rounded-full border transition-colors ${
                      active ? "border-accent-gold" : "border-smoke hover:border-surface-ivory"
                    }`}
                    style={c.swatch ? { backgroundColor: c.swatch } : undefined}
                  >
                    {c.swatch ? null : (
                      <span className="t-eyebrow text-[9px] text-smoke">
                        {c.name.slice(0, 2)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {sizes.length > 0 ? (
          <div>
            <p className="t-eyebrow text-smoke">
              Size
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {sizes.map((s) => {
                const active = s === size;
                const avail = isComboAvailable(variants, color, s);
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={!avail}
                    onClick={() => setSize(s)}
                    className={`inline-flex h-10 min-w-10 items-center justify-center border px-3 t-eyebrow transition-colors ${
                      active
                        ? "border-accent-gold bg-accent-gold text-surface-tuxedo"
                        : "border-smoke text-surface-ivory hover:border-accent-gold hover:text-accent-gold"
                    } disabled:cursor-not-allowed disabled:border-smoke disabled:text-smoke disabled:line-through`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          disabled={busy || !selected || !selected.available}
          onClick={() => selected && addItem(selected.id)}
          className="inline-flex h-12 items-center justify-center bg-accent-gold px-6 t-eyebrow text-surface-tuxedo transition-colors hover:bg-surface-ivory disabled:cursor-not-allowed disabled:opacity-50"
        >
          {selected && !selected.available
            ? "Sold out"
            : busy
              ? "Adding…"
              : "Add to cart"}
        </button>
      </div>
    </Layout>
  );
}

function findVariant(
  variants: ProductVariant[],
  color: string | undefined,
  size: string | undefined,
): ProductVariant | undefined {
  return (
    variants.find(
      (v) =>
        (color ? v.color === color : true) && (size ? v.size === size : true),
    ) ?? variants[0]
  );
}

function isComboAvailable(
  variants: ProductVariant[],
  color: string | undefined,
  size: string | undefined,
): boolean {
  return variants.some(
    (v) =>
      (color ? v.color === color : true) &&
      (size ? v.size === size : true) &&
      v.available,
  );
}

function Layout({
  images,
  imageIndex,
  setImageIndex,
  name,
  imageAlt,
  price,
  description,
  children,
}: {
  images: string[];
  imageIndex: number;
  setImageIndex: (i: number) => void;
  name: string;
  imageAlt: string;
  price: string;
  description?: string;
  children: React.ReactNode;
}) {
  const main = images[Math.min(imageIndex, images.length - 1)];
  return (
    <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-14">
      <div className="flex flex-col gap-3">
        <div className="relative aspect-square w-full overflow-hidden bg-surface-tuxedo">
          {main ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={main}
              alt={imageAlt}
              width={800}
              height={800}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        {images.length > 1 ? (
          <div className="grid grid-cols-4 gap-3">
            {images.slice(0, 8).map((img, i) => (
              <button
                key={`${img}-${i}`}
                type="button"
                aria-label={`View image ${i + 1}`}
                onClick={() => setImageIndex(i)}
                className={`relative aspect-square overflow-hidden border bg-surface-tuxedo transition-colors ${
                  i === imageIndex ? "border-accent-gold" : "border-transparent hover:border-surface-ivory"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt=""
                  width={200}
                  height={200}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="md:pt-2">
        <h1 className="t-subhead display-2 leading-[0.95]">
          {name}
        </h1>
        {price ? (
          <p className="t-body mt-4 text-xl font-bold tabular-nums text-accent-gold">
            {price}
          </p>
        ) : null}

        <div className="mt-8">{children}</div>

        {description ? (
          <div className="mt-10 border-t border-smoke pt-6">
            <p className="max-w-prose whitespace-pre-line t-subhead text-lg leading-snug md:text-xl">
              {description}
            </p>
          </div>
        ) : null}

        <p className="mt-10 t-eyebrow text-smoke">
          Checkout, sizing, and shipping handled by Fourthwall.
        </p>
      </div>
    </div>
  );
}
