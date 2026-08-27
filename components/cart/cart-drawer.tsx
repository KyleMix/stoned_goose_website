"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useCart } from "@/components/cart/cart-context";
import { cartSubtotal, formatMoney } from "@/lib/fourthwall-storefront";

export function CartDrawer() {
  const { cart, open, busy, error, closeCart, setQuantity, removeItem, checkout } =
    useCart();

  const items = cart?.items ?? [];

  return (
    <Dialog.Root open={open} onOpenChange={(o) => (o ? undefined : closeCart())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-surface-tuxedo/80 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:data-[state=open]:animate-none" />
        <Dialog.Content className="fixed right-0 top-0 z-[60] flex h-full w-[min(420px,92vw)] flex-col border-l border-smoke bg-surface-tuxedo">
          {/* Announce in-flight cart updates to screen readers; the buttons
              only communicate busy state visually via disabled styling. */}
          <span role="status" aria-live="polite" className="sr-only">
            {busy ? "Updating cart." : ""}
          </span>
          {error ? (
            <p
              role="alert"
              className="border-b border-accent-gold bg-accent-gold/10 px-5 py-3 text-xs text-surface-ivory"
            >
              {error}
            </p>
          ) : null}
          <div className="flex items-center justify-between border-b border-smoke px-5 py-4">
            <Dialog.Title className="t-eyebrow">
              Your cart
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close cart"
                className="t-eyebrow text-smoke hover:text-accent-gold"
              >
                ESC
              </button>
            </Dialog.Close>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="t-subhead text-2xl">Nothing here yet.</p>
              <p className="t-body text-sm text-smoke">
                Add some merch and it lands here.
              </p>
            </div>
          ) : (
            <ul className="flex-1 divide-y divide-smoke overflow-y-auto">
              {items.map((item) => {
                const v = item.variant;
                const size = v.attributes?.size?.name;
                return (
                  <li key={v.id} className="flex gap-4 px-5 py-4">
                    {v.images?.[0]?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={v.images[0].url}
                        alt=""
                        width={80}
                        height={80}
                        loading="lazy"
                        className="h-20 w-20 shrink-0 object-cover [filter:grayscale(1)]"
                      />
                    ) : (
                      <div className="h-20 w-20 shrink-0 bg-surface-tuxedo" />
                    )}
                    <div className="flex flex-1 flex-col">
                      <p className="t-subhead text-base">
                        {v.product?.name ?? v.name}
                      </p>
                      {size ? (
                        <p className="t-eyebrow text-smoke">
                          {size}
                        </p>
                      ) : null}
                      <p className="t-body mt-1 text-sm tabular-nums">
                        {formatMoney(v.unitPrice)}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="inline-flex items-center border border-smoke">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            disabled={busy}
                            onClick={() => setQuantity(v.id, item.quantity - 1)}
                            className="h-7 w-7 text-sm text-surface-ivory hover:text-accent-gold disabled:opacity-40"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm tabular-nums text-surface-ivory">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            disabled={busy}
                            onClick={() => setQuantity(v.id, item.quantity + 1)}
                            className="h-7 w-7 text-sm text-surface-ivory hover:text-accent-gold disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => removeItem(v.id)}
                          className="t-eyebrow text-smoke hover:text-accent-gold disabled:opacity-40"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {items.length > 0 ? (
            <div className="border-t border-smoke px-5 py-4">
              <div className="flex items-baseline justify-between">
                <span className="t-eyebrow text-smoke">
                  Subtotal
                </span>
                <span className="text-base font-bold tabular-nums text-surface-ivory">
                  {cartSubtotal(cart)}
                </span>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={checkout}
                className="mt-4 flex h-12 w-full items-center justify-center bg-accent-gold t-eyebrow text-surface-tuxedo transition-colors hover:bg-surface-ivory disabled:opacity-60"
              >
                Checkout on Fourthwall ↗
              </button>
              <p className="mt-2 text-center t-eyebrow text-smoke">
                Secure payment + shipping via Fourthwall
              </p>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
