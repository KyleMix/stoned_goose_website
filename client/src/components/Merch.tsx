import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORE_BASE_URL = "https://stoned-goose-productions-zgm-shop.fourthwall.com";
const COLLECTION_PATH = `${STORE_BASE_URL}/collections/all`;
const COLLECTION_API_URL = "/api/fourthwall/products";
const IMAGE_PROXY_PATH = "/api/fourthwall/image?url=";

type StoreProduct = {
  id: string;
  name: string;
  price: string;
  image: string;
  link: string;
};

function formatPrice(price: unknown, currencyCode?: string) {
  if (typeof price === "string") {
    return price.startsWith("$") ? price : `$${price}`;
  }
  if (typeof price === "number") {
    const amount = price > 1000 ? price / 100 : price;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode ?? "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  return "";
}

function extractImageUrl(product: any) {
  return (
    product.image?.transformedUrl ||
    product.image?.transformed_url ||
    product.image?.url ||
    product.image?.src ||
    product.images?.[0]?.src ||
    product.images?.[0]?.url ||
    product.image?.src ||
    product.primary_image?.url ||
    product.preview_image?.url ||
    product.featured_image?.src ||
    product.featured_media?.src ||
    product.media?.[0]?.src ||
    product.media?.[0]?.url
  );
}

function extractPrice(product: any) {
  const unitPrice = product.variants?.[0]?.unitPrice || product.variants?.[0]?.unit_price;
  const price =
    product.price?.amount ??
    product.price?.value ??
    unitPrice?.amount ??
    unitPrice?.value ??
    product.variants?.[0]?.price ??
    product.price ??
    product.pricing?.price ??
    product.default_price?.amount ??
    product.default_price?.price ??
    product.prices?.[0]?.amount ??
    product.price_range?.minimum_price?.amount ??
    product.price_range?.minimum_price?.price ??
    product.price_range?.min?.amount ??
    product.min_price?.amount ??
    product.min_price ??
    product.price?.amount;
  const currency =
    product.price?.currencyCode ??
    product.price?.currency ??
    unitPrice?.currencyCode ??
    unitPrice?.currency ??
    product.currency ??
    product.default_price?.currency ??
    product.price_range?.minimum_price?.currency ??
    product.min_price?.currency ??
    product.price?.currency;

  return { price, currency };
}

export default function Merch() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useEmbed, setUseEmbed] = useState(false);
  const [embedLoaded, setEmbedLoaded] = useState(false);
  const [embedUrl, setEmbedUrl] = useState(COLLECTION_PATH);

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

        const normalizedProducts = Array.isArray(data?.products) ? data.products : [];
        const apiProducts = Array.isArray(data?.data) ? data.data : [];
        const apiItems = Array.isArray(data?.items) ? data.items : [];
        const sourceProducts =
          normalizedProducts.length
            ? normalizedProducts
            : apiProducts.length
              ? apiProducts
              : apiItems;

        if (!sourceProducts.length) {
          throw new Error("No products found in the collection.");
        }

        const mappedProducts: StoreProduct[] = sourceProducts
          .map((product: any) => {
            const handle =
              product.handle ||
              product.slug ||
              product.id ||
              product.product_id ||
              product.title ||
              product.name;
            const { price, currency } = extractPrice(product);
            const imageSrc =
              typeof product.image === "string" ? product.image : extractImageUrl(product);
            const formattedPrice = formatPrice(price, currency);

            if (!handle || !formattedPrice || !imageSrc) return null;

            const productLink =
              product.link ||
              product.url ||
              product.storefront_url ||
              product.storefrontUrl ||
              product.permalink ||
              product.links?.storefront ||
              `${STORE_BASE_URL}/products/${encodeURIComponent(handle)}`;
            const proxiedImage = `${IMAGE_PROXY_PATH}${encodeURIComponent(imageSrc)}`;

            return {
              id: String(product.id ?? handle),
              name: product.title || product.name || "Product",
              price: formattedPrice,
              image: proxiedImage,
              link: productLink,
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
        setEmbedUrl(COLLECTION_PATH);
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
                onClick={() => {
                  const newWindow = window.open(
                    product.link,
                    "_blank",
                    "noreferrer,noopener",
                  );
                  if (!newWindow) {
                    setEmbedUrl(product.link);
                    setEmbedLoaded(false);
                    setUseEmbed(true);
                  }
                }}
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
                onClick={() => {
                  const newWindow = window.open(
                    product.link,
                    "_blank",
                    "noreferrer,noopener",
                  );
                  if (!newWindow) {
                    setEmbedUrl(product.link);
                    setEmbedLoaded(false);
                    setUseEmbed(true);
                  }
                }}
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
            onClick={() => {
              const newWindow = window.open(
                COLLECTION_PATH,
                "_blank",
                "noreferrer,noopener",
              );
              if (!newWindow) {
                setEmbedUrl(COLLECTION_PATH);
                setEmbedLoaded(false);
                setUseEmbed(true);
              }
            }}
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
                onClick={() => {
                  const newWindow = window.open(
                    COLLECTION_PATH,
                    "_blank",
                    "noreferrer,noopener",
                  );
                  if (!newWindow) {
                    setEmbedUrl(COLLECTION_PATH);
                    setEmbedLoaded(false);
                    setUseEmbed(true);
                  }
                }}
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
                    setEmbedUrl(COLLECTION_PATH);
                    setEmbedLoaded(false);
                    setUseEmbed(true);
                  }}
                >
                  Try embedded store
                </Button>
              )}
            </div>
          </div>
        )}

        {useEmbed && (
          <div className="mt-6">
            {!products.length && (
              <p className="text-sm text-primary mb-2">
                Trying the embedded store below. If it stays blank, open the live store in a new tab.
              </p>
            )}
            <div className="relative overflow-hidden rounded-xl border border-border bg-black/50">
              {!embedLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
                  <div className="w-10 h-10 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-primary">Loading the live store…</p>
                </div>
              )}
              <iframe
                src={embedUrl}
                title="Stoned Goose Productions Fourthwall Store"
                loading="lazy"
                className="w-full h-[720px] border-0"
                allow="clipboard-write; encrypted-media"
                onLoad={() => setEmbedLoaded(true)}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
