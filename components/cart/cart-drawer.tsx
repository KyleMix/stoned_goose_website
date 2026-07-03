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
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-ink/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:data-[state=open]:animate-none" />
        <Dialog.Content className="fixed right-0 top-0 z-[60] flex h-full w-[min(420px,92vw)] flex-col border-l border-bone/15 bg-ink shadow-2xl">
          {/* Announce in-flight cart updates to screen readers; the buttons
              only communicate busy state visually via disabled styling. */}
          <span role="status" aria-live="polite" className="sr-only">
            {busy ? "Updating cart." : ""}
          </span>
          {error ? (
            <p
              role="alert"
              className="border-b border-hazard/60 bg-hazard/10 px-5 py-3 font-body text-xs text-bone"
            >
              {error}
            </p>
          ) : null}
          <div className="flex items-center justify-between border-b border-bone/15 px-5 py-4">
            <Dialog.Title className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
              Your cart
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close cart"
                className="font-mono text-xs uppercase tracking-[0.18em] text-bone/55 hover:text-slime"
              >
                ESC
              </button>
            </Dialog.Close>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="font-display text-2xl text-bone">Nothing here yet.</p>
              <p className="font-body text-sm text-bone/65">
                Add some merch and it lands here.
              </p>
            </div>
          ) : (
            <ul className="flex-1 divide-y divide-bone/10 overflow-y-auto">
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
                      <div className="h-20 w-20 shrink-0 bg-haze-500" />
                    )}
                    <div className="flex flex-1 flex-col">
                      <p className="font-display text-base text-bone">
                        {v.product?.name ?? v.name}
                      </p>
                      {size ? (
                        <p className="font-body text-[10px] uppercase tracking-[0.18em] text-bone/55">
                          {size}
                        </p>
                      ) : null}
                      <p className="mt-1 font-body text-sm tabular-nums text-bone/85">
                        {formatMoney(v.unitPrice)}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="inline-flex items-center border border-bone/25">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            disabled={busy}
                            onClick={() => setQuantity(v.id, item.quantity - 1)}
                            className="h-7 w-7 font-mono text-sm text-bone/80 hover:text-slime disabled:opacity-40"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-body text-sm tabular-nums text-bone">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            disabled={busy}
                            onClick={() => setQuantity(v.id, item.quantity + 1)}
                            className="h-7 w-7 font-mono text-sm text-bone/80 hover:text-slime disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => removeItem(v.id)}
                          className="font-body text-[10px] uppercase tracking-[0.18em] text-bone/55 hover:text-slime disabled:opacity-40"
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
            <div className="border-t border-bone/15 px-5 py-4">
              <div className="flex items-baseline justify-between">
                <span className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55">
                  Subtotal
                </span>
                <span className="font-body text-base font-semibold tabular-nums text-bone">
                  {cartSubtotal(cart)}
                </span>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={checkout}
                className="mt-4 flex h-12 w-full items-center justify-center bg-hazard font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-slime disabled:opacity-60"
              >
                Checkout on Fourthwall ↗
              </button>
              <p className="mt-2 text-center font-body text-[10px] uppercase tracking-[0.18em] text-bone/55">
                Secure payment + shipping via Fourthwall
              </p>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
