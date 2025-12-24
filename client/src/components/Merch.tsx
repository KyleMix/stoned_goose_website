import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORE_BASE_URL = "https://stoned-goose-productions-zgm-shop.fourthwall.com";
const COLLECTION_PATH = `${STORE_BASE_URL}/collections/all`;
const COLLECTION_API_URL = "/api/fourthwall/products";
const IMAGE_PROXY_PATH = "/api/fourthwall/image?url=";
const STOREFRONT_API_BASE_URL = "https://storefront-api.fourthwall.com/v1";
const STOREFRONT_TOKEN =
  import.meta.env.VITE_FOURTHWALL_STOREFRONT_TOKEN ??
  "ptkn_2901bb98-e959-48d0-994b-2ce37dfb8a8a";

type StoreProduct = {
  id: string;
  name: string;
  price?: string;
  image?: string;
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
  const directImage = typeof product.image === "string" ? product.image : undefined;
  const firstImage = Array.isArray(product.images) ? product.images[0] : undefined;
  const firstImageUrl = typeof firstImage === "string" ? firstImage : undefined;
  return (
    directImage ||
    product.image?.transformedUrl ||
    product.image?.transformed_url ||
    product.image?.url ||
    product.image?.src ||
    product.images?.[0]?.transformedUrl ||
    product.images?.[0]?.transformed_url ||
    firstImageUrl ||
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

function normalizeSourceProducts(data: any) {
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function resolveCollectionList(data: any) {
  if (Array.isArray(data?.collections)) return data.collections;
  return normalizeSourceProducts(data);
}

async function fetchStorefrontJson(
  path: string,
  signal: AbortSignal,
  params?: URLSearchParams,
) {
  if (!STOREFRONT_TOKEN) return null;

  const mergedParams = new URLSearchParams({
    storefront_token: STOREFRONT_TOKEN,
  });
  if (params) {
    for (const [key, value] of params.entries()) {
      mergedParams.set(key, value);
    }
  }

  const response = await fetch(`${STOREFRONT_API_BASE_URL}${path}?${mergedParams}`, {
    signal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Fourthwall storefront request failed: ${response.status} ${text}`,
    );
  }

  return response.json();
}

async function fetchStorefrontProducts(signal: AbortSignal) {
  if (!STOREFRONT_TOKEN) return [];

  const params = new URLSearchParams({
    limit: "24",
  });

  const collections = await fetchStorefrontJson("/collections", signal, params);
  const collectionList = resolveCollectionList(collections);
  const fallbackCollection = collectionList.find((collection: any) => {
    const handle = collection?.handle ?? collection?.slug ?? "";
    const title = collection?.title ?? collection?.name ?? "";
    return handle.toLowerCase() === "all" || title.toLowerCase() === "all";
  });
  const selectedCollection = fallbackCollection ?? collectionList[0];
  const collectionProducts =
    selectedCollection?.products ??
    selectedCollection?.items ??
    selectedCollection?.data;

  if (Array.isArray(collectionProducts) && collectionProducts.length) {
    return collectionProducts;
  }

  const collectionId =
    selectedCollection?.id ??
    selectedCollection?.handle ??
    selectedCollection?.slug ??
    selectedCollection?.collection_id;

  if (collectionId) {
    const collectionResponse = await fetchStorefrontJson(
      `/collections/${collectionId}/products`,
      signal,
      params,
    );
    return normalizeSourceProducts(collectionResponse);
  }

  return [];
}

export default function Merch() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      const maxAttempts = 3;
      let lastErrorMessage: string | null = null;

      try {
        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
          try {
            let responseBody = "";
            let contentType = "";
            let data: any = null;

            try {
              const productsResponse = await fetch(COLLECTION_API_URL, {
                signal: controller.signal,
              });

              contentType = productsResponse.headers.get("content-type") ?? "";
              responseBody = await productsResponse.text();

              if (!productsResponse.ok) {
                if (contentType.includes("application/json")) {
                  const parsed = JSON.parse(responseBody);
                  throw new Error(
                    parsed?.error || "Unable to reach the Fourthwall store right now.",
                  );
                }

                throw new Error(
                  responseBody || "Unable to reach the Fourthwall store right now.",
                );
              }

              if (!contentType.includes("application/json")) {
                throw new Error(
                  "The store returned an unexpected response. Please use the buttons below to view the live shop.",
                );
              }

              try {
                data = JSON.parse(responseBody);
              } catch (parseError) {
                console.error(
                  "Error parsing Fourthwall response",
                  parseError,
                  responseBody,
                );
                throw new Error(
                  "We received malformed data from the store. Please try again or use the live store link.",
                );
              }

              if (data?.error) {
                throw new Error(data.error);
              }
            } catch (proxyError) {
              if (!STOREFRONT_TOKEN) {
                throw proxyError;
              }
            }

            if (!data && STOREFRONT_TOKEN) {
              const fallbackProducts = await fetchStorefrontProducts(controller.signal);
              if (fallbackProducts.length) {
                data = { products: fallbackProducts };
              } else {
                throw new Error("No products found in the collection.");
              }
            }

            if (!data) {
              throw new Error(
                "The store returned an unexpected response. Please use the buttons below to view the live shop.",
              );
            }

            const sourceProducts = normalizeSourceProducts(data);

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
                  typeof product.image === "string"
                    ? product.image
                    : extractImageUrl(product);
                const formattedPrice = formatPrice(price, currency);

                const productLink =
                  product.link ||
                  product.url ||
                  product.storefront_url ||
                  product.storefrontUrl ||
                  product.permalink ||
                  product.links?.storefront ||
                  (handle
                    ? `${STORE_BASE_URL}/products/${encodeURIComponent(handle)}`
                    : COLLECTION_PATH);
                const proxiedImage = imageSrc
                  ? `${IMAGE_PROXY_PATH}${encodeURIComponent(imageSrc)}`
                  : undefined;

                return {
                  id: String(product.id ?? handle ?? product.name ?? product.title),
                  name: product.title || product.name || "Product",
                  price: formattedPrice || undefined,
                  image: proxiedImage,
                  link: productLink,
                };
              })
              .filter(Boolean) as StoreProduct[];

            const readyProducts = mappedProducts.filter(
              (product) => product.id && product.link,
            );

            if (!readyProducts.length) {
              throw new Error("Unable to load product details from the store.");
            }

            setProducts(readyProducts);
            setError(null);
            return;
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

            lastErrorMessage = friendlyMessage;
            if (attempt < maxAttempts) {
              setError(`${friendlyMessage} Retrying... (${attempt}/${maxAttempts})`);
              await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
              continue;
            }
          }
        }

        if (lastErrorMessage) {
          setError(lastErrorMessage);
        }
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
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-primary/80">
                Image coming soon
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                className="bg-primary hover:bg-primary/80 text-black font-bold uppercase transform translate-y-4 group-hover:translate-y-0 transition-transform"
                onClick={() => {
                  const newWindow = window.open(
                    product.link,
                    "_blank",
                    "noreferrer,noopener",
                  );
                  if (!newWindow) window.location.assign(product.link);
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
                {product.price ?? "See store"}
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
                  if (!newWindow) window.location.assign(product.link);
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
              if (!newWindow) window.location.assign(COLLECTION_PATH);
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
                onClick={() => window.location.assign(COLLECTION_PATH)}
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
      </div>
    </section>
  );
}
