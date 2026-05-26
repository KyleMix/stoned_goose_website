import { HeroBlock } from "@/components/blocks/hero-block";
import { RichTextBlock } from "@/components/blocks/rich-text-block";
import { ImageCaptionBlock } from "@/components/blocks/image-caption-block";
import { VideoEmbedBlock } from "@/components/blocks/video-embed-block";
import { CtaStripBlock } from "@/components/blocks/cta-strip-block";
import { MailingListCapture } from "@/components/mailing-list-capture";
import { UpcomingShowsBlock } from "@/components/upcoming-shows-block";
import { LatestStrip } from "@/components/latest-strip";
import { PressStrip } from "@/components/press-strip";
import { RosterTeaser } from "@/components/roster-teaser";
import { OpenMicTeaser } from "@/components/open-mic-teaser";
import { ServicesOverview } from "@/components/services-overview";
import { ShopStrip } from "@/components/shop-strip";
import type { Block } from "@/lib/blocks";

export function SectionRenderer({
  sections,
  pageSlug,
}: {
  sections: Block[];
  pageSlug: string;
}) {
  return (
    <>
      {sections.map((block, i) => (
        <BlockSwitch key={i} block={block} pageSlug={pageSlug} />
      ))}
    </>
  );
}

function BlockSwitch({ block, pageSlug }: { block: Block; pageSlug: string }) {
  switch (block.type) {
    case "hero":
      return <HeroBlock block={block} pageSlug={pageSlug} />;
    case "richText":
      return <RichTextBlock block={block} />;
    case "imageCaption":
      return <ImageCaptionBlock block={block} />;
    case "videoEmbed":
      return <VideoEmbedBlock block={block} />;
    case "ctaStrip":
      return <CtaStripBlock block={block} pageSlug={pageSlug} />;
    case "mailingList":
      return <MailingListCapture page={block.tag || pageSlug} />;
    case "upcomingShows":
      return <UpcomingShowsBlock />;
    case "latestSocial":
      return <LatestStrip limit={block.limit} />;
    case "pressStrip":
      return <PressStrip />;
    case "rosterTeaser":
      return <RosterTeaser limit={block.limit} />;
    case "openMicTeaser":
      return <OpenMicTeaser />;
    case "servicesOverview":
      return <ServicesOverview />;
    case "shopStrip":
      return <ShopStrip limit={block.limit} />;
  }
}
