import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { Bumper } from "@/components/bumper";
import { UpcomingShowsBlock } from "@/components/upcoming-shows-block";
import { ServicesOverview } from "@/components/services-overview";
import { marqueeWords } from "@/content/home";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee items={marqueeWords} />

      <Bumper eyebrow="clarification" footnote="thank you for visiting.">
        We are a comedy production company.
        <br />
        We are not a goose.
      </Bumper>

      <UpcomingShowsBlock />

      <Bumper eyebrow="aside" footnote="it&rsquo;s listed below.">
        We do other things too.
      </Bumper>

      <ServicesOverview />

      <Bumper eyebrow="end of bumper" footnote="please drive carefully.">
        Goodnight, Olympia.
      </Bumper>
    </>
  );
}
