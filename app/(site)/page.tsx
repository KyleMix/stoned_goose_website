import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { RotatingBumper } from "@/components/rotating-bumper";
import { UpcomingShowsBlock } from "@/components/upcoming-shows-block";
import { ServicesOverview } from "@/components/services-overview";
import { MailingListCapture } from "@/components/mailing-list-capture";
import { PressStrip } from "@/components/press-strip";
import { LatestStrip } from "@/components/latest-strip";
import { OpenMicTeaser } from "@/components/open-mic-teaser";
import { VideoStrip } from "@/components/video-strip";
import { ShopStrip } from "@/components/shop-strip";
import { SectionRenderer } from "@/components/section-renderer";
import {
  marqueeWords,
  mission,
  homeTopSections,
  homeBottomSections,
} from "@/content/home";
import { site } from "@/content/site";
import { truncateAtWord } from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: `${site.name} · Olympia Comedy Production` },
  description: truncateAtWord(site.description, 155),
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee items={marqueeWords} />

      <RotatingBumper slot="clarification" />

      <SectionRenderer sections={homeTopSections} pageSlug="home" />

      <UpcomingShowsBlock />

      {/* First ivory band: the page turns from what we put on to
          what the scene is doing. */}
      <OpenMicTeaser tone="ivory" />

      <VideoStrip limit={5} />

      <LatestStrip limit={6} />

      <RotatingBumper slot="aside" />

      {/* Second: audience to client. */}
      <ServicesOverview tone="ivory" />

      <ShopStrip limit={3} />

      <PressStrip />

      {mission ? (
        <section className="section-y-lg border-y border-smoke bg-surface-tuxedo">
          <div className="mx-auto max-w-[1100px] px-5 md:px-10">
            <p className="t-eyebrow">
              {mission.eyebrow}
            </p>
            <h2 className="display-1 mt-4 text-surface-ivory">
              {mission.heading}
            </h2>
            <p className="t-body mt-8 max-w-3xl text-lg leading-relaxed md:text-xl">
              {mission.body}
            </p>
          </div>
        </section>
      ) : null}

      {/* Third: the closing ask. */}
      <MailingListCapture page="home" tone="ivory" />

      <SectionRenderer sections={homeBottomSections} pageSlug="home" />

      <RotatingBumper slot="outro" />
    </>
  );
}
