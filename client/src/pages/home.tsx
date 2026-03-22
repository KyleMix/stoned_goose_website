import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import UpcomingShows from "@/components/UpcomingShows";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SeoHead from "@/components/seo/SeoHead";
import SponsorsPartners from "@/components/SponsorsPartners";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SeoHead
        title="Stoned Goose Productions | Olympia & South Sound Comedy Production"
        description="Live shows, comedian booking, corporate events, media production, and headshots across Olympia, Lacey, Tacoma, and the South Sound."
        path="/"
      />
      <Navbar />
      <main>
        <Hero />
        <UpcomingShows />
        <section id="sponsors">
          <SponsorsPartners />
        </section>
        <section id="contact">
          <Contact />
        </section>
      </main>
      <Footer />
    </div>
  );
}
