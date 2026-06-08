// Client-side Fourthwall Storefront API for the on-site cart. Uses the public
// read/cart storefront token (safe to ship in the browser by design). Product
// display data is pre-rendered from the build-time sync; this module only
// handles live cart operations and the checkout hand-off.
//
// Docs: https://docs.fourthwall.com/storefront/overview

const API_BASE = (
  process.env.NEXT_PUBLIC_FW_API_URL ?? "https://storefront-api.fourthwall.com/v1"
).replace(/\/$/, "");

const TOKEN = process.env.NEXT_PUBLIC_FW_STOREFRONT_TOKEN ?? "";

const CHECKOUT_BASE = (
  process.env.NEXT_PUBLIC_FW_CHECKOUT ??
  process.env.NEXT_PUBLIC_FW_STORE_URL ??
  "https://stoned-goose-productions-zgm-shop.fourthwall.com"
).replace(/\/$/, "");

export const CART_CURRENCY = "USD";

// Cart is only usable when the storefront token is present in the bundle.
export function cartEnabled(): boolean {
  return TOKEN.length > 0;
}

export type CartMoney = { value: number; currency: string };

export type CartVariant = {
  id: string;
  name: string;
  unitPrice?: CartMoney;
  images?: Array<{ url: string }>;
  attributes?: { size?: { name?: string }; color?: { name?: string } };
  product?: { slug?: string; name?: string };
};

export type CartItem = {
  variant: CartVariant;
  quantity: number;
};

export type Cart = {
  id?: string;
  items: CartItem[];
};

function withToken(path: string, params: Record<string, string> = {}): string {
  const usp = new URLSearchParams({ ...params, storefront_token: TOKEN });
  return `${API_BASE}${path}?${usp.toString()}`;
}

async function request(url: string, init?: RequestInit): Promise<Cart> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    throw new Error(`Fourthwall cart request failed: ${res.status}`);
  }
  const data = (await res.json()) as Cart;
  return { id: data.id, items: data.items ?? [] };
}

export async function createCart(): Promise<Cart> {
  return request(withToken("/carts"), {
    method: "POST",
    body: JSON.stringify({ items: [] }),
  });
}

export async function getCart(cartId: string): Promise<Cart> {
  return request(withToken(`/carts/${cartId}`, { currency: CART_CURRENCY }));
}

export async function addToCart(
  cartId: string,
  variantId: string,
  quantity = 1,
): Promise<Cart> {
  return request(withToken(`/carts/${cartId}/add`), {
    method: "POST",
    body: JSON.stringify({ items: [{ variantId, quantity }] }),
  });
}

export async function removeFromCart(
  cartId: string,
  variantId: string,
): Promise<Cart> {
  return request(withToken(`/carts/${cartId}/remove`), {
    method: "POST",
    body: JSON.stringify({ items: [{ variantId }] }),
  });
}

export async function updateCart(
  cartId: string,
  variantId: string,
  quantity: number,
): Promise<Cart> {
  return request(withToken(`/carts/${cartId}/change`), {
    method: "POST",
    body: JSON.stringify({ items: [{ variantId, quantity }] }),
  });
}

export function checkoutUrl(cartId: string): string {
  const usp = new URLSearchParams({ cartCurrency: CART_CURRENCY, cartId });
  return `${CHECKOUT_BASE}/checkout/?${usp.toString()}`;
}

export function formatMoney(money: CartMoney | undefined): string {
  if (!money) return "";
  if (money.currency === "USD") return `$${money.value.toFixed(2)}`;
  return `${money.value.toFixed(2)} ${money.currency}`;
}

export function cartCount(cart: Cart | null): number {
  if (!cart) return 0;
  return cart.items.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartSubtotal(cart: Cart | null): string {
  if (!cart || cart.items.length === 0) return formatMoney({ value: 0, currency: CART_CURRENCY });
  let total = 0;
  let currency = CART_CURRENCY;
  for (const item of cart.items) {
    if (item.variant.unitPrice) {
      total += item.variant.unitPrice.value * item.quantity;
      currency = item.variant.unitPrice.currency;
    }
  }
  return formatMoney({ value: total, currency });
}
