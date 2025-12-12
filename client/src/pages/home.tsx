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

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <UpcomingShows />
        <Services />
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
