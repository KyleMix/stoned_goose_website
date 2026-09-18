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

// The page has one job: get a visitor to contact us. Who we are, what we do,
// what we sell, and the ask. Nothing else.
//
// The "what we are working on" row (next show, latest video, our open mic) and
// the "who we work with" strip (crew and comics) are gone. Every item in them
// already has a page of its own, and a home page that previews four other
// pages is four more chances to leave before reaching the form. /shows,
// /watch, /open-mics and /about each own their content now, reached from the
// nav, from the hero's secondary link, and from the About block's button.
//
// The merch strip is the one preview that stays, because it is not a preview:
// it is the only band on the page selling something a visitor can buy on the
// spot, and without it the shop lives in the footer alone.
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
