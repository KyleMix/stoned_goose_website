import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { RotatingBumper } from "@/components/rotating-bumper";
import { UpcomingShowsBlock } from "@/components/upcoming-shows-block";
import { ServicesOverview } from "@/components/services-overview";
import { MailingListCapture } from "@/components/mailing-list-capture";
import { PressStrip } from "@/components/press-strip";
import { LatestStrip } from "@/components/latest-strip";
import { OpenMicTeaser } from "@/components/open-mic-teaser";
import { RosterTeaser } from "@/components/roster-teaser";
import { ShopStrip } from "@/components/shop-strip";
import { SectionRenderer } from "@/components/section-renderer";
import {
  marqueeWords,
  mission,
  homeTopSections,
  homeBottomSections,
} from "@/content/home";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee items={marqueeWords} />

      <RotatingBumper slot="clarification" />

      <SectionRenderer sections={homeTopSections} pageSlug="home" />

      <UpcomingShowsBlock />

      <OpenMicTeaser />

      <LatestStrip limit={6} />

      <RotatingBumper slot="aside" />

      <RosterTeaser limit={8} />

      <ServicesOverview />

      <ShopStrip limit={3} />

      <PressStrip />

      {mission ? (
        <section className="border-y border-bone/10 bg-ink py-24 md:py-32">
          <div className="mx-auto max-w-[1100px] px-5 md:px-10">
            <p className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-hazard">
              {mission.eyebrow}
            </p>
            <h2 className="heading-display mt-4 text-[clamp(2.4rem,7vw,5rem)] text-bone">
              {mission.heading}
            </h2>
            <p className="mt-8 max-w-3xl font-body text-lg leading-relaxed text-bone/85 md:text-xl">
              {mission.body}
            </p>
          </div>
        </section>
      ) : null}

      <MailingListCapture page="home" />

      <SectionRenderer sections={homeBottomSections} pageSlug="home" />

      <RotatingBumper slot="outro" />
    </>
  );
}
