import { motion } from "framer-motion";
import { ShoppingBag, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

// Use individual product images (relative paths from components → assets)
import logoHoodie from "../assets/merch/hoodie.avif";
import metalGoose from "../assets/merch/metal-goose.avif";
import sickHat from "../assets/merch/sick-hat.avif";
import gooseLoose from "../assets/merch/goose-is-loose.avif";
import liquidHolder from "../assets/merch/liquid-holder.avif";

const products = [
  {
    id: 1,
    name: "LOGO Hoodie",
    price: "$29.00",
    image: logoHoodie,
    link: "https://stoned-goose-productions-zgm-shop.fourthwall.com/products/logo-hoodie",
  },
  {
    id: 2,
    name: "Metal Goose",
    price: "$20.00",
    image: metalGoose,
    link: "https://stoned-goose-productions-zgm-shop.fourthwall.com/products/metal-goose",
  },
  {
    id: 3,
    name: "Sick Hat",
    price: "$18.50",
    image: sickHat,
    link: "https://stoned-goose-productions-zgm-shop.fourthwall.com/products/sick-hat",
  },
  {
    id: 4,
    name: "The Goose is Loose",
    price: "$25.00",
    image: gooseLoose,
    link: "https://stoned-goose-productions-zgm-shop.fourthwall.com/products/the-goose-is-loose",
  },
  {
    id: 5,
    name: "Liquid Holder",
    price: "$13.00",
    image: liquidHolder,
    link: "https://stoned-goose-productions-zgm-shop.fourthwall.com/products/liquid-holder",  },
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
            onClick={() => window.open("https://stoned-goose-productions-zgm-shop.fourthwall.com/collections/all", "_blank")}
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
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Quick Shop Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button 
                      className="bg-primary hover:bg-primary/80 text-black font-bold uppercase transform translate-y-4 group-hover:translate-y-0 transition-transform"
                      onClick={() => window.open(product.link, "_blank")}
                    >
                      View on Store
                    </Button>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white mb-1 line-clamp-1" title={product.name}>{product.name}</h3>
                    <span className="text-lg font-mono text-primary whitespace-nowrap ml-2">{product.price}</span>
                  </div>
                  <div className="mt-auto">
                    <Button 
                      className="w-full bg-secondary hover:bg-secondary/80 text-white font-bold uppercase"
                      onClick={() => window.open(product.link, "_blank")}
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
