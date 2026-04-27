import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Grain } from "@/components/grain";
import { RouteFocusManager } from "@/components/route-focus-manager";
import { site } from "@/content/site";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Olympia & South Sound Comedy Production`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    url: site.url,
    siteName: site.name,
    images: [{ url: "/opengraph.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    images: ["/opengraph.jpg"],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
  alternates: { canonical: site.url },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <head>
        {plausibleDomain ? (
          <script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
          />
        ) : null}
      </head>
      <body className="bg-ink text-bone" suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-hazard focus:px-3 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:text-ink"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main" tabIndex={-1}>{children}</main>
        <Footer />
        <Grain />
        <RouteFocusManager />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: site.name,
              url: site.url,
              areaServed: site.serviceAreas,
              sameAs: [
                site.social.instagram,
                site.social.facebook,
                site.social.tiktok,
                site.social.youtube,
                site.social.patreon,
              ],
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
            }),
          }}
        />
      </body>
    </html>
  );
}
