import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { CartProvider } from "@/components/cart/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Grain } from "@/components/grain";
import { EditOverlay } from "@/components/edit-overlay";
import { RouteFocusManager } from "@/components/route-focus-manager";
import { SmoothScroll } from "@/components/smooth-scroll";

// The Organization/LocalBusiness entity is emitted once by the root layout
// (lib/schema.ts `organization`); a second unlinked LocalBusiness here would
// split the brand into two ambiguous schema.org nodes.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const gscVerification = process.env.NEXT_PUBLIC_GSC_VERIFICATION;
  const bingVerification = process.env.NEXT_PUBLIC_BING_VERIFICATION;

  return (
    <>
      {plausibleDomain ? (
        <script
          defer
          data-domain={plausibleDomain}
          src="https://plausible.io/js/script.js"
        />
      ) : null}
      {gscVerification ? (
        <meta name="google-site-verification" content={gscVerification} />
      ) : null}
      {bingVerification ? (
        <meta name="msvalidate.01" content={bingVerification} />
      ) : null}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-accent-gold focus:px-3 focus:py-2 focus:text-xs focus:uppercase focus:text-surface-tuxedo"
      >
        Skip to content
      </a>
      <CartProvider>
        <Nav />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <CartDrawer />
      </CartProvider>
      <Footer />
      <Grain />
      <RouteFocusManager />
      <SmoothScroll />
      <EditOverlay />
    </>
  );
}
