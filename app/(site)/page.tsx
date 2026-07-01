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

export const metadata: Metadata = {
  title: { absolute: `${site.name} · Olympia & South Sound Comedy Production` },
  description: site.description,
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

      <OpenMicTeaser />

      <VideoStrip limit={5} />

      <LatestStrip limit={6} />

      <RotatingBumper slot="aside" />

      <ServicesOverview />

      <ShopStrip limit={3} />

      <PressStrip />

      {mission ? (
        <section className="section-y-lg border-y border-bone/10 bg-ink">
          <div className="mx-auto max-w-[1100px] px-5 md:px-10">
            <p className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-hazard">
              {mission.eyebrow}
            </p>
            <h2 className="display-1 mt-4 text-bone">
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
