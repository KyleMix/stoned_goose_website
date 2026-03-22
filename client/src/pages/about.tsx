import Navbar from "@/components/Navbar";
import About from "@/components/About";
import Footer from "@/components/Footer";
import SeoHead from "@/components/seo/SeoHead";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SeoHead
        title="About the Team | Stoned Goose Productions"
        description="Meet the crew behind Stoned Goose Productions — producers, performers, and media pros building comedy experiences across the Pacific Northwest."
        path="/about"
      />
      <Navbar />
      <main className="pt-[var(--header-height)]">
        <About />
      </main>
      <Footer />
    </div>
  );
}
