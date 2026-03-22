import Navbar from "@/components/Navbar";
import Merch from "@/components/Merch";
import Footer from "@/components/Footer";
import SeoHead from "@/components/seo/SeoHead";

export default function MerchPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SeoHead
        title="Merch | Stoned Goose Productions"
        description="Shop Stoned Goose Productions merch — hats, hoodies, and more."
        path="/merch"
      />
      <Navbar />
      <main className="pt-[var(--header-height)]">
        <Merch />
      </main>
      <Footer />
    </div>
  );
}
