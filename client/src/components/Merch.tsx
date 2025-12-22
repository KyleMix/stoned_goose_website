import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const COLLECTION_URL =
  "https://stoned-goose-productions-zgm-shop.fourthwall.com/collections/all";
const COLLECTION_API_URL = "/api/fourthwall/products";

type StoreProduct = {
  id: string;
  name: string;
  price: string;
  image: string;
  link: string;
};

export default function Merch() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useEmbed, setUseEmbed] = useState(false);
  const [embedLoaded, setEmbedLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      try {
        const productsResponse = await fetch(COLLECTION_API_URL, {
          signal: controller.signal,
        });

        const contentType = productsResponse.headers.get("content-type") ?? "";
        const responseBody = await productsResponse.text();

        if (!productsResponse.ok) {
          throw new Error(
            responseBody || "Unable to reach the Fourthwall store right now.",
          );
        }

        if (!contentType.includes("application/json")) {
          throw new Error(
            "The store returned an unexpected response. Please use the buttons below to view the live shop.",
          );
        }

        let data: any;
        try {
          data = JSON.parse(responseBody);
        } catch (parseError) {
          console.error("Error parsing Fourthwall response", parseError, responseBody);
          throw new Error(
            "We received malformed data from the store. Please try again or use the live store link.",
          );
        }

        const rawProducts = Array.isArray(data?.products) ? data.products : [];

        if (!rawProducts.length) {
          throw new Error("No products found in the collection.");
        }

        const mappedProducts: StoreProduct[] = rawProducts
          .map((product: any) => {
            const handle = product.handle || product.id || product.title;
            const price = product.variants?.[0]?.price ?? product.price;
            const imageSrc =
              product.images?.[0]?.src ||
              product.image?.src ||
              product.featured_image?.src ||
              product.featured_media?.src;

            if (!handle || !price || !imageSrc) return null;

            return {
              id: String(product.id ?? handle),
              name: product.title || product.name || "Product",
              price: price.startsWith("$") ? price : `$${price}`,
              image: imageSrc,
              link: `${COLLECTION_URL.replace("/collections/all", "")}/products/${handle}`,
            };
          })
          .filter(Boolean) as StoreProduct[];

        if (!mappedProducts.length) {
          throw new Error("Unable to load product details from the store.");
        }

        setProducts(mappedProducts);
      } catch (err) {
        console.error(err);
        const rawMessage =
          err instanceof Error
            ? err.message
            : "Something went wrong while loading products.";

        const normalized = rawMessage.toLowerCase();
        const friendlyMessage =
          normalized.includes("fetch") || normalized.includes("network")
            ? "We couldn't reach the Fourthwall store from here. Use the buttons below to browse the live shop."
            : rawMessage;

        setError(friendlyMessage);
        setEmbedLoaded(false);
        setUseEmbed(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();

    return () => controller.abort();
  }, []);

  const cards = useMemo(() => {
    if (!products.length) return null;

    return products.map((product, index) => (
      <motion.div
        key={product.id}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className="group"
      >
        <div className="bg-card rounded-lg overflow-hidden border border-border group-hover:border-secondary transition-colors relative flex flex-col h-full">
          <div className="aspect-square overflow-hidden bg-white/5 relative">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                className="bg-primary hover:bg-primary/80 text-black font-bold uppercase transform translate-y-4 group-hover:translate-y-0 transition-transform"
                onClick={() =>
                  window.open(product.link, "_blank", "noreferrer,noopener")
                }
              >
                View on Store
              </Button>
            </div>
          </div>
          <div className="p-6 flex flex-col flex-grow">
            <div className="flex justify-between items-start mb-4">
              <h3
                className="text-xl font-bold text-white mb-1 line-clamp-1"
                title={product.name}
              >
                {product.name}
              </h3>
              <span className="text-lg font-mono text-primary whitespace-nowrap ml-2">
                {product.price}
              </span>
            </div>
            <div className="mt-auto">
              <Button
                className="w-full bg-secondary hover:bg-secondary/80 text-white font-bold uppercase"
                onClick={() => window.open(product.link, "_blank", "noreferrer,noopener")}
              >
                <ShoppingBag className="mr-2 w-4 h-4" /> Buy Now
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    ));
  }, [products]);

  return (
    <section id="merch" className="py-20 bg-muted/10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4"
        >
          <div>
            <h2 className="text-4xl md:text-6xl font-display uppercase text-white">
              Fresh <span className="text-secondary">Merch</span>
            </h2>
            <p className="text-primary font-mono mt-2">Rep the Goose. Look cool. Be happy.</p>
          </div>
          <Button
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-black"
            onClick={() => window.open(COLLECTION_URL, "_blank", "noreferrer,noopener")}
          >
            View All Products <ExternalLink className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-lg overflow-hidden border border-border relative p-6 h-full"
              >
                <div className="animate-pulse space-y-4 h-full flex flex-col">
                  <div className="bg-white/10 rounded-md aspect-square" />
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-white/10 rounded w-1/2" />
                    <div className="h-4 bg-white/10 rounded w-1/4" />
                  </div>
                  <div className="mt-auto h-10 bg-white/10 rounded" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards}
          </div>
        )}

        {!isLoading && !products.length && (
          <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4 text-white">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-secondary" />
              <h3 className="text-xl font-bold">Merch is loading elsewhere</h3>
            </div>
            <p className="text-primary text-sm">
              {error || "We couldn’t load items from the store right now."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="bg-secondary hover:bg-secondary/80 text-white font-bold uppercase"
                onClick={() => window.open(COLLECTION_URL, "_blank", "noreferrer,noopener")}
              >
                Browse the live store
              </Button>
              <Button
                variant="outline"
                className="border-border text-white hover:bg-white hover:text-black"
                onClick={() => window.location.reload()}
              >
                Try again
              </Button>
              {!useEmbed && (
                <Button
                  variant="outline"
                  className="border-secondary text-secondary hover:bg-secondary/20"
                  onClick={() => {
                    setEmbedLoaded(false);
                    setUseEmbed(true);
                  }}
                >
                  Try embedded store
                </Button>
              )}
            </div>
            {useEmbed && (
              <div className="mt-4">
                <p className="text-sm text-primary mb-2">
                  Trying the embedded store below. If it stays blank, open the live store in a new tab.
                </p>
                <div className="relative overflow-hidden rounded-xl border border-border bg-black/50">
                  {!embedLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
                      <div className="w-10 h-10 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-primary">Loading the live store…</p>
                    </div>
                  )}
                  <iframe
                    src={COLLECTION_URL}
                    title="Stoned Goose Productions Fourthwall Store"
                    loading="lazy"
                    className="w-full h-[720px] border-0"
                    allow="clipboard-write; encrypted-media"
                    onLoad={() => setEmbedLoaded(true)}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && products.length > 0 && (
        {!useEmbed && !isLoading && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards}
          </div>
        )}

        {!isLoading && !products.length && (
          <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4 text-white">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-secondary" />
              <h3 className="text-xl font-bold">Merch is loading elsewhere</h3>
            </div>
            <p className="text-primary text-sm">
              {error || "We couldn’t load items from the store right now."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="bg-secondary hover:bg-secondary/80 text-white font-bold uppercase"
                onClick={() => window.open(COLLECTION_URL, "_blank", "noreferrer,noopener")}
              >
                Browse the live store
              </Button>
              <Button
                variant="outline"
                className="border-border text-white hover:bg-white hover:text-black"
                onClick={() => window.location.reload()}
              >
                Try again
              </Button>
            </div>
          </div>
        )}
        {useEmbed && (
          <div className="relative overflow-hidden rounded-xl border border-border bg-card">
            {!embedLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 gap-2 text-white z-10">
                <div className="h-10 w-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                <p className="text-sm font-mono text-primary">Loading the live store...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
