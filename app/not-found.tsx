import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { CartProvider } from "@/components/cart/cart-context";
import { Grain } from "@/components/grain";
import { NotFoundContent } from "@/components/site/not-found-content";

// This lives at the app root, NOT inside the (site) group, and that placement
// is the whole point.
//
// With `output: "export"`, Next writes the ROOT not-found boundary to
// out/404.html, which is the file Workers Static Assets serves on a miss
// (see not_found_handling in wrangler.jsonc). A not-found inside a route
// group only handles soft 404s navigated to within that group; it never
// becomes 404.html. So the site was shipping Next's unstyled built-in page,
// with system-ui type and no brand at all, to every mistyped URL.
//
// The site chrome is repeated here because the (site) layout does not wrap
// this route. Nav needs CartProvider for its cart button.
export default function NotFound() {
  return (
    <CartProvider>
      <Nav />
      <main id="main" tabIndex={-1}>
        <NotFoundContent />
      </main>
      <Footer />
      <Grain />
    </CartProvider>
  );
}
