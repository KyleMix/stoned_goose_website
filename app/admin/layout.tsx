import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Minimal layout for the Keystatic admin. No site chrome (no Nav, Footer,
// Grain, SearchPalette). The Keystatic component renders its own UI.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-bone text-ink">{children}</div>;
}
