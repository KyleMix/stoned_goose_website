import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { UpcomingShowsBlock } from "@/components/upcoming-shows-block";
import { ServicesOverview } from "@/components/services-overview";
import { Testimonials } from "@/components/testimonials";
import { SponsorsBlock } from "@/components/sponsors-block";
import { ContactBlock } from "@/components/contact-block";
import { marqueeWords } from "@/content/home";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee items={marqueeWords} />
      <UpcomingShowsBlock />
      <ServicesOverview />
      <Testimonials />
      <SponsorsBlock />
      <ContactBlock />
    </>
  );
}
