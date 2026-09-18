import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { AboutBlock } from "@/components/home/about-block";
import { ServicesRow } from "@/components/home/services-row";
import { WorkingOn } from "@/components/home/working-on";
import { PeopleStrip } from "@/components/home/people-strip";
import { ContactBlock } from "@/components/home/contact-block";
import { MailingListCapture } from "@/components/mailing-list-capture";
import { SectionRenderer } from "@/components/section-renderer";
import { homeTopSections, homeBottomSections } from "@/content/home";
import { site } from "@/content/site";
import { truncateAtWord } from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: `${site.name} · Olympia Comedy Production` },
  description: truncateAtWord(site.description, 155),
  alternates: { canonical: "/" },
};

// The page has one job: get a visitor to contact us. Everything here either
// makes that decision easier (who we are, what we do, who we work with, what
// we are doing right now) or is the ask itself.
//
// What came off: the header ticker, the word marquee, three rotating bumper
// interludes, the full services list, the merch grid, the social feed strip
// and the press strip. Twelve rendered bands became seven, the next show went
// from appearing three times to once, and the page gained the contact form it
// never had.
//
// The removed components are all still in the tree and still available as CMS
// section blocks, so any of them can be put back from /admin without a deploy.
export default function HomePage() {
  return (
    <>
      <Hero />

      <SectionRenderer sections={homeTopSections} pageSlug="home" />

      {/* Who we are. */}
      <AboutBlock />

      {/* What we do. */}
      <ServicesRow />

      {/* What we are working on. The next show appears here and nowhere else. */}
      <WorkingOn />

      {/* Who we work with. */}
      <PeopleStrip />

      {/* The ask. Every CTA above lands here. */}
      <ContactBlock />

      {/* Deliberately quiet: a signup should not compete with the form above
          it. `secondary` drops the gold fill and the display-size type. */}
      <MailingListCapture
        page="home"
        tone="ivory"
        emphasis="secondary"
        eyebrow="Newsletter"
        headline="Show announcements and presale codes, now and then."
      />

      <SectionRenderer sections={homeBottomSections} pageSlug="home" />
    </>
  );
}
