import type { LocalBusiness } from "schema-dts";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { CartProvider } from "@/components/cart/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Grain } from "@/components/grain";
import { EditOverlay } from "@/components/edit-overlay";
import { RouteFocusManager } from "@/components/route-focus-manager";
import { SearchPalette } from "@/components/search-palette";
import { SmoothScroll } from "@/components/smooth-scroll";
import { site } from "@/content/site";
import { jsonLdString } from "@/lib/jsonld";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const gscVerification = process.env.NEXT_PUBLIC_GSC_VERIFICATION;
  const bingVerification = process.env.NEXT_PUBLIC_BING_VERIFICATION;

  const sameAs = [
    site.social.instagram,
    site.social.facebook,
    site.social.tiktok,
    site.social.youtube,
    site.social.patreon,
    site.social.eventbrite,
    site.social.fourthwall,
  ];

  const localBusiness: LocalBusiness = {
    "@type": "LocalBusiness",
    name: site.name,
    url: site.url,
    description: site.description,
    areaServed: [...site.serviceAreas],
    sameAs,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "Sales",
        email: site.contact.email,
        telephone: site.contact.phoneTel,
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: site.contact.locality,
      addressRegion: site.contact.region,
      addressCountry: "US",
    },
  };

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
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-hazard focus:px-3 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:text-ink"
      >
        Skip to content
      </a>
      <CartProvider>
        <Nav />
        <main id="main" tabIndex={-1} data-pagefind-body>
          {children}
        </main>
        <CartDrawer />
      </CartProvider>
      <Footer />
      <Grain />
      <RouteFocusManager />
      <SearchPalette />
      <SmoothScroll />
      <EditOverlay />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(localBusiness) }}
      />
    </>
  );
}
