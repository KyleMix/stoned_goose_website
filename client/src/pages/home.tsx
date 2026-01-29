import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import UpcomingShows from "@/components/UpcomingShows";
import Services from "@/components/Services";
import About from "@/components/About";
import Comedians from "@/components/Comedians";
import Merch from "@/components/Merch";
import Media from "@/components/Media";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SeoHead from "@/components/seo/SeoHead";

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
        <Services />
        <UpcomingShows />
        <About />
        <Comedians />
        <Merch />
        <Media />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
