import type { Metadata, Viewport } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0A0A0A",
};

// Minimal layout for the Keystatic admin. No site chrome (no Nav, Footer,
// Grain, SearchPalette). Brand tokens are reasserted in admin.css so the
// Keystatic UI inherits Fraunces / Inter / JetBrains Mono / hazard yellow.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="sg-admin min-h-screen bg-bone text-ink">{children}</div>;
}
