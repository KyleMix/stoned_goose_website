import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { RotatingBumper } from "@/components/rotating-bumper";
import { UpcomingShowsBlock } from "@/components/upcoming-shows-block";
import { ServicesOverview } from "@/components/services-overview";
import { marqueeWords, mission } from "@/content/home";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee items={marqueeWords} />

      <RotatingBumper slot="clarification" />

      <UpcomingShowsBlock />

      <RotatingBumper slot="aside" />

      <ServicesOverview />

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

      <RotatingBumper slot="outro" />
    </>
  );
}
