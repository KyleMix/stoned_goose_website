import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { AboutBlock } from "@/components/home/about-block";
import { ServicesRow } from "@/components/home/services-row";
import { ShopStrip } from "@/components/shop-strip";
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
// makes that decision easier (who we are, what we do, what we sell) or is the
// ask itself.
//
// What came off: the header ticker, the word marquee, three rotating bumper
// interludes, the full services list, the social feed strip, the press strip,
// the "what we are working on" band and the "who we work with" portrait wall.
// The last two each restated a whole page: the next show, the latest video and
// the mic all live on /shows, /watch and /open-mics, and the crew and roster
// are the entire content of /about.
//
// The merch strip came back in their place. It is the one band on the page
// that sells something a visitor can buy on the spot, and it keeps the shop
// from living in the footer alone.
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

      {/* What we sell. Ivory, so it reads as a break between two tuxedo
          bands rather than a fourth screen of the same section. */}
      <ShopStrip tone="ivory" limit={3} />

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
