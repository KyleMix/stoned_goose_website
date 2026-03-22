import Navbar from "@/components/Navbar";
import Comedians from "@/components/Comedians";
import Footer from "@/components/Footer";
import SeoHead from "@/components/seo/SeoHead";

export default function ComediansPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SeoHead
        title="Comedian Roster | Stoned Goose Productions"
        description="Meet the comedians on the Stoned Goose Productions roster — the funniest people in the Pacific Northwest."
        path="/comedians"
      />
      <Navbar />
      <main className="pt-[var(--header-height)]">
        <Comedians />
      </main>
      <Footer />
    </div>
  );
}
