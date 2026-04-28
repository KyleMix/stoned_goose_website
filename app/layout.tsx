import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import type { LocalBusiness } from "schema-dts";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Grain } from "@/components/grain";
import { RouteFocusManager } from "@/components/route-focus-manager";
import { site } from "@/content/site";
import { jsonLdString } from "@/lib/jsonld";

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
    default: `${site.name} · Olympia & South Sound Comedy Production`,
    template: `%s · ${site.name}`,
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
    icon: [
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/brand/favicon-128.png", sizes: "128x128", type: "image/png" },
      { url: "/brand/favicon-256.png", sizes: "256x256", type: "image/png" },
      { url: "/brand/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/brand/favicon-256.png",
    apple: "/brand/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  alternates: { canonical: site.url },
  robots: { index: true, follow: true },
  appleWebApp: {
    capable: true,
    title: site.shortName,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0A0A0A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        {gscVerification ? (
          <meta name="google-site-verification" content={gscVerification} />
        ) : null}
        {bingVerification ? (
          <meta name="msvalidate.01" content={bingVerification} />
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
          dangerouslySetInnerHTML={{ __html: jsonLdString(localBusiness) }}
        />
      </body>
    </html>
  );
}
