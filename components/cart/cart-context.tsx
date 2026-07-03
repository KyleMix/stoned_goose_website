"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type Cart,
  addToCart,
  cartCount,
  cartEnabled,
  checkoutUrl,
  createCart,
  getCart,
  removeFromCart,
  updateCart,
} from "@/lib/fourthwall-storefront";
import { track } from "@/lib/analytics";

const STORAGE_KEY = "sg.cartId";

type CartContextValue = {
  cart: Cart | null;
  count: number;
  open: boolean;
  busy: boolean;
  enabled: boolean;
  /** Human-readable message when the last cart operation failed. */
  error: string | null;
  openCart: () => void;
  closeCart: () => void;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  setQuantity: (variantId: string, quantity: number) => Promise<void>;
  checkout: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const enabled = cartEnabled();
  const cartIdRef = useRef<string | null>(null);

  // Hydrate from a saved cart id on first load. A stale/expired id just clears.
  useEffect(() => {
    if (!enabled) return;
    const saved =
      typeof window !== "undefined"
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;
    if (!saved) return;
    cartIdRef.current = saved;
    getCart(saved)
      .then((c) => setCart(c))
      .catch(() => {
        window.localStorage.removeItem(STORAGE_KEY);
        cartIdRef.current = null;
      });
  }, [enabled]);

  const ensureCartId = useCallback(async (): Promise<string> => {
    if (cartIdRef.current) return cartIdRef.current;
    const created = await createCart();
    const id = created.id ?? "";
    cartIdRef.current = id;
    if (id && typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, id);
    }
    setCart(created);
    return id;
  }, []);

  const addItem = useCallback(
    async (variantId: string, quantity = 1) => {
      if (!enabled) return;
      setBusy(true);
      setError(null);
      try {
        const id = await ensureCartId();
        const next = await addToCart(id, variantId, quantity);
        setCart(next);
        setOpen(true);
        track("Cart Add", { variant: variantId });
      } catch (err) {
        console.error("[cart] add failed", err);
        setError("Could not add that. Try again, or buy it on Fourthwall.");
        setOpen(true);
      } finally {
        setBusy(false);
      }
    },
    [enabled, ensureCartId],
  );

  const removeItem = useCallback(async (variantId: string) => {
    const id = cartIdRef.current;
    if (!id) return;
    setBusy(true);
    setError(null);
    try {
      setCart(await removeFromCart(id, variantId));
    } catch (err) {
      console.error("[cart] remove failed", err);
      setError("Could not update the cart. Try again in a second.");
    } finally {
      setBusy(false);
    }
  }, []);

  const setQuantity = useCallback(
    async (variantId: string, quantity: number) => {
      const id = cartIdRef.current;
      if (!id) return;
      setBusy(true);
      setError(null);
      try {
        const next =
          quantity <= 0
            ? await removeFromCart(id, variantId)
            : await updateCart(id, variantId, quantity);
        setCart(next);
      } catch (err) {
        console.error("[cart] update failed", err);
        setError("Could not update the cart. Try again in a second.");
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const checkout = useCallback(() => {
    const id = cartIdRef.current;
    if (!id) return;
    track("Cart Checkout", { items: cartCount(cart) });
    window.location.href = checkoutUrl(id);
  }, [cart]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      count: cartCount(cart),
      open,
      busy,
      enabled,
      error,
      openCart: () => setOpen(true),
      closeCart: () => setOpen(false),
      addItem,
      removeItem,
      setQuantity,
      checkout,
    }),
    [cart, open, busy, enabled, error, addItem, removeItem, setQuantity, checkout],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
