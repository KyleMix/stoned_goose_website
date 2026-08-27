import type { Metadata, Viewport } from "next";
import { Josefin_Sans } from "next/font/google";
import "./globals.css";
import { site, seo } from "@/content/site";
import { JsonLd } from "@/components/json-ld";
import { organization } from "@/lib/schema";
import { truncateAtWord } from "@/lib/utils";

const ogImage = seo.defaultOgImage ?? "/opengraph.jpg";

// One typeface for the whole site. Josefin Sans ships Light 300, Regular 400,
// and Bold 700; the brand system uses exactly those and no italics, so nothing
// else is loaded. `fallback` declares the real CSS chain rather than leaving it
// to a comment: next/font emits it into the generated font-family, after the
// size-adjusted metric fallback it derives automatically.
//
// next/font self-hosts the woff2 into the static export at build time, so the
// Workers Static Assets deploy serves the font from its own origin with no
// runtime font fetch and no external request to fonts.gstatic.com.
const sans = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "700"],
  display: "swap",
  fallback: ["Futura", "Century Gothic", "Arial", "sans-serif"],
});

// Title stays under 60 chars and the description under 155 so SERPs render
// them without truncation. The full description still feeds schema.org.
const metaDescription = truncateAtWord(site.description, 155);

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · Olympia Comedy Production`,
    template: `%s · ${site.name}`,
  },
  description: metaDescription,
  keywords: seo.keywords.length > 0 ? seo.keywords : undefined,
  openGraph: {
    title: site.name,
    description: metaDescription,
    url: site.url,
    siteName: site.name,
    images: [{ url: ogImage, width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: metaDescription,
    images: [ogImage],
  },
  icons: {
    icon: [
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/brand/favicon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/brand/favicon-128.png", sizes: "128x128", type: "image/png" },
      { url: "/brand/favicon-256.png", sizes: "256x256", type: "image/png" },
      { url: "/brand/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
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
  themeColor: "#0F0F0F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={sans.variable}
    >
      <body className="bg-surface-tuxedo text-surface-ivory" suppressHydrationWarning>
        <JsonLd schema={organization} />
        {children}
      </body>
    </html>
  );
}
