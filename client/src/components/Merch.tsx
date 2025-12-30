import { motion } from "framer-motion";
import { ShoppingBag, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORE_BASE_URL = "https://stoned-goose-productions-zgm-shop.fourthwall.com";
const COLLECTION_HANDLE = "og-bigboy";
const COLLECTION_PATH = `${STORE_BASE_URL}/collections/${COLLECTION_HANDLE}`;

type StoreProduct = {
  id: string;
  name: string;
  price?: string;
  image?: string;
  link: string;
};

const products: StoreProduct[] = [
  {
    id: "fallback-metal-goose",
    name: "Metal Goose",
    price: "$20.00",
    image:
      "https://imgproxy.fourthwall.com/nK-fkZy-5MEkDLgk8xIgoQq36Y24jQ1ZqxdL_mEcEJo/w:720/sm:1/enc/Gu1IR7MUbcgba4BR/VUFOWu2YdDg_bxKR/1BO009Oyox07oSwj/2Vd8TBKaNocVdaCQ/F6J4LL9NRD-ARSe2/XEEN-00bk0ioA8PG/WRFFyn3A9my1icUo/FIwRmUeTpAM9VMZZ/A796akSBBbnre5hF/pYKImNbjI-dYMXuR/84dTf0mpp1MIVwWC/M5oEl2rlTrPhLSl3/pnS4W5-Az_Ys0VwA/ulG6VEoXbjWzDdqN/BA2Zcjxyf54",
    link: `${STORE_BASE_URL}/products/metal-goose`,
  },
  {
    id: "fallback-logo-hoodie",
    name: "LOGO Hoodie",
    price: "$29.00",
    image:
      "https://imgproxy.fourthwall.com/IzxPYUtLlWWb7GIA724u79IZ-mfpp0WJzq-7bXOtAXc/w:720/sm:1/enc/nlub6SC6F-XwZu4s/cO4uq50ELA_bpBJZ/ZAe1zpmZZdJyZT_E/4HAtAF84_G9PVQle/nGB8SuBzvPFA5JcZ/rF09JPww9_u4GUZa/Ze92kTjkBVtIdDGL/kWRsvL5dqqXLfY8b/xMxGSJ4XUsCne5Ln/0sBEZYHn92ZRFtxt/Um-KED7e1L-BH00X/miAUqR2M-9t0Qg3k/U4415CkejZhF9V6u/jDoKi8u9oDrIKgc8/mcCKeA9dTOo",
    link: `${STORE_BASE_URL}/products/logo-hoodie`,
  },
  {
    id: "fallback-sick-hat",
    name: "Sick Hat",
    price: "$18.50",
    image:
      "https://imgproxy.fourthwall.com/xVX63E9ebyPcCc2kiCj74mUBq6gFgq9HqYlswMwnMO4/w:720/sm:1/enc/WpBg2905LccQle1j/ImWNDBsu_u3OhxMr/Wd1G3jUPdk9Xc6tQ/p17vBm57d-MmdUed/Z2YnFRxEN6VCDsyH/bpSJWZWnCVP-3lfG/a9w90hR2L2UxS-Wn/TrS7WdUtLUHENs8n/keBHUO9hfTYfBTT6/qEKu2Yv5KOIxtWJc/qha8URNi06B2o0Fn/MK-x9u9sljpd1c_q/Zt3H7I9gR_vXjhCh/TXKFRul35dDrhb1w/Rxx8qk41WFg",
    link: `${STORE_BASE_URL}/products/sick-hat`,
  },
];

export default function Merch() {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
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
          ))}
        </div>
      </div>
    </section>
  );
}
