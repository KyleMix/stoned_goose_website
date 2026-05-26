// Keystatic CMS config. Schema-as-code for the /admin surface.
//
// Storage: cloud (via Keystatic Cloud). Static export rules out a server-side
// API route, so dev and production both speak to GitHub through Keystatic
// Cloud's OAuth proxy. Owner creates the project at https://keystatic.cloud
// once and sets NEXT_PUBLIC_KEYSTATIC_CLOUD_PROJECT.
//
// File layout:
//   Singletons: content/<name>/index.json (Keystatic-managed JSON)
//   Collections: content/<name>/<slug>/index.json (one file per entry)
//   Per-name shim at content/<name>.ts re-exports the data with the typed
//   shape components have always imported.

import { config, fields, collection, singleton } from "@keystatic/core";
import { RESERVED_SLUGS, RESERVED_SLUG_ERROR } from "./lib/reserved-slugs";

// House rule: no em dashes anywhere. Block them in every long-form text
// field via a Keystatic field validator. The pattern below must match;
// `[^—]*` rejects any string that contains the em dash codepoint.
const noEmDash = {
  pattern: {
    regex: /^[^—]*$/,
    message: "No em dashes. Use a period or split the sentence.",
  },
};

// Reused across the pages collection and the marketing singletons. Each
// block becomes one section on the rendered page. Order in the array = order
// on the page. Discriminant names match the switch in
// components/section-renderer.tsx.
function sectionsField(label: string) {
  return fields.array(
    fields.conditional(
      fields.select({
        label: "Block type",
        options: [
          { label: "Hero (eyebrow, headline, CTAs)", value: "hero" },
          { label: "Rich text (paragraphs)", value: "richText" },
          { label: "Image with caption", value: "imageCaption" },
          { label: "Video embed (YouTube / TikTok / Instagram)", value: "videoEmbed" },
          { label: "Call-to-action strip", value: "ctaStrip" },
          { label: "Mailing list capture", value: "mailingList" },
          { label: "Upcoming shows list", value: "upcomingShows" },
          { label: "Latest social strip", value: "latestSocial" },
          { label: "Press quote strip", value: "pressStrip" },
          { label: "Roster grid teaser", value: "rosterTeaser" },
          { label: "Open mic teaser", value: "openMicTeaser" },
          { label: "Services overview", value: "servicesOverview" },
          { label: "Shop strip", value: "shopStrip" },
        ],
        defaultValue: "richText",
      }),
      {
        hero: fields.object({
          eyebrow: fields.text({ label: "Eyebrow (small mono line above headline)", validation: noEmDash }),
          headline: fields.text({ label: "Headline" }),
          italicLine: fields.text({ label: "Italic tagline (optional)", validation: noEmDash }),
          subhead: fields.text({ label: "Subhead", multiline: true, validation: noEmDash }),
          primaryCtaLabel: fields.text({ label: "Primary button label" }),
          primaryCtaHref: fields.text({ label: "Primary button href" }),
          secondaryCtaLabel: fields.text({ label: "Secondary link label (optional)" }),
          secondaryCtaHref: fields.text({ label: "Secondary link href (optional)" }),
        }),
        richText: fields.object({
          eyebrow: fields.text({ label: "Eyebrow (optional)", validation: noEmDash }),
          heading: fields.text({ label: "Heading (optional)" }),
          body: fields.text({
            label: "Body",
            multiline: true,
            description: "Paragraphs separated by a blank line. Plain text only.",
            validation: { length: { min: 1 }, ...noEmDash },
          }),
        }),
        imageCaption: fields.object({
          image: fields.image({
            label: "Image",
            directory: "public/images/pages",
            publicPath: "/images/pages/",
          }),
          alt: fields.text({ label: "Alt text" }),
          caption: fields.text({ label: "Caption (optional)", validation: noEmDash }),
          aspect: fields.select({
            label: "Aspect ratio",
            options: [
              { label: "Wide (16:9)", value: "16x9" },
              { label: "Portrait (4:5)", value: "4x5" },
              { label: "Square (1:1)", value: "1x1" },
            ],
            defaultValue: "16x9",
          }),
        }),
        videoEmbed: fields.object({
          provider: fields.select({
            label: "Provider",
            options: [
              { label: "YouTube", value: "youtube" },
              { label: "TikTok", value: "tiktok" },
              { label: "Instagram", value: "instagram" },
            ],
            defaultValue: "youtube",
          }),
          url: fields.text({ label: "Video URL or 11-char id (YouTube)" }),
          caption: fields.text({ label: "Caption (optional)", validation: noEmDash }),
        }),
        ctaStrip: fields.object({
          heading: fields.text({ label: "Heading" }),
          subhead: fields.text({ label: "Subhead (optional)", multiline: true, validation: noEmDash }),
          primaryCtaLabel: fields.text({ label: "Button label" }),
          primaryCtaHref: fields.text({ label: "Button href" }),
          note: fields.text({ label: "Small note under button (optional)", validation: noEmDash }),
        }),
        mailingList: fields.object({
          tag: fields.text({
            label: "Analytics tag",
            description: "Short string used to attribute signups. e.g. 'about', 'faq'.",
            defaultValue: "page",
          }),
        }),
        upcomingShows: fields.empty(),
        latestSocial: fields.object({
          limit: fields.number({ label: "How many items", defaultValue: 6, validation: { min: 1, max: 12 } }),
        }),
        pressStrip: fields.empty(),
        rosterTeaser: fields.object({
          limit: fields.number({ label: "How many comedians", defaultValue: 8, validation: { min: 1, max: 16 } }),
        }),
        openMicTeaser: fields.empty(),
        servicesOverview: fields.empty(),
        shopStrip: fields.object({
          limit: fields.number({ label: "How many products", defaultValue: 3, validation: { min: 1, max: 8 } }),
        }),
      },
    ),
    {
      label,
      itemLabel: (p) => {
        const d = p.discriminant as string;
        if (d === "richText") {
          const obj = p.value as { fields?: { heading?: { value?: string } } };
          const h = obj?.fields?.heading?.value;
          return h && h.length > 0 ? `Text: ${h}` : "Rich text";
        }
        if (d === "hero") {
          const obj = p.value as { fields?: { headline?: { value?: string } } };
          const h = obj?.fields?.headline?.value;
          return h && h.length > 0 ? `Hero: ${h}` : "Hero";
        }
        return d.charAt(0).toUpperCase() + d.slice(1);
      },
    },
  );
}

export default config({
  storage: { kind: "cloud" },
  cloud: {
    project: process.env.NEXT_PUBLIC_KEYSTATIC_CLOUD_PROJECT ?? "",
  },
  ui: {
    brand: { name: "Stoned Goose Admin" },
    navigation: {
      Pages: ["pages"],
      "Site copy": ["site", "home", "showsCopy", "watchCopy", "rosterCopy", "openMicsCopy", "shopCopy", "contactCopy", "sponsorships"],
      Roster: ["members", "comedians"],
      Booking: ["services", "pricingTiers"],
      Shows: ["showsManual"],
      Merch: ["shopManual"],
      "Open mics": ["openMics"],
      Posts: ["news", "tiktokVideos"],
    },
  },

  singletons: {
    // ----- Site config -----
    site: singleton({
      label: "Site config",
      path: "content/site/",
      format: { data: "json" },
      previewUrl: "/",
      schema: {
        name: fields.text({ label: "Brand name", validation: { length: { min: 2 } } }),
        shortName: fields.text({ label: "Short name", validation: { length: { min: 2 } } }),
        tagline: fields.text({ label: "Tagline", validation: { ...noEmDash } }),
        url: fields.url({ label: "Site URL" }),
        description: fields.text({
          label: "Description",
          multiline: true,
          validation: { length: { min: 20, max: 320 }, ...noEmDash },
        }),
        contact: fields.object({
          email: fields.text({ label: "Email" }),
          phone: fields.text({ label: "Phone (display)" }),
          phoneTel: fields.text({ label: "Phone (E.164 with +)" }),
          whatsapp: fields.text({ label: "WhatsApp (E.164 no +, optional)" }),
          smsEnabled: fields.checkbox({ label: "SMS enabled", defaultValue: true }),
          address: fields.text({ label: "Address (single line)" }),
          locality: fields.text({ label: "Locality (city)" }),
          region: fields.text({ label: "Region (state code)" }),
        }, { label: "Contact" }),
        social: fields.object({
          instagram: fields.url({ label: "Instagram" }),
          facebook: fields.url({ label: "Facebook" }),
          tiktok: fields.url({ label: "TikTok" }),
          youtube: fields.url({ label: "YouTube" }),
          patreon: fields.url({ label: "Patreon" }),
          eventbrite: fields.url({ label: "Eventbrite" }),
          fourthwall: fields.url({ label: "Fourthwall" }),
          youtubeChannelId: fields.text({ label: "YouTube channel ID (UC...)" }),
          facebookPageId: fields.text({ label: "Facebook page ID (numeric)" }),
        }, { label: "Social" }),
        podcasts: fields.object({
          spotifyShowId: fields.text({ label: "Spotify show id" }),
          applePodcastsId: fields.text({ label: "Apple Podcasts id" }),
          rssUrl: fields.text({ label: "RSS URL" }),
        }, { label: "Podcasts (future slot)" }),
        serviceAreas: fields.array(fields.text({ label: "Area" }), {
          label: "Service areas",
          itemLabel: (props) => props.value,
        }),
        press: fields.array(
          fields.object({
            quote: fields.text({ label: "Quote", multiline: true, validation: noEmDash }),
            outlet: fields.text({ label: "Outlet" }),
            url: fields.text({ label: "URL (optional)" }),
          }),
          { label: "Press quotes (real only)", itemLabel: (p) => p.fields.outlet.value },
        ),
        nav: fields.array(
          fields.object({
            label: fields.text({ label: "Label", validation: { length: { min: 1 } } }),
            href: fields.text({ label: "Href", validation: { length: { min: 1 } } }),
          }),
          { label: "Primary nav", itemLabel: (p) => p.fields.label.value },
        ),
        footer: fields.object({
          locality: fields.text({ label: "Location line (e.g. 'Olympia, WA')" }),
          creditLine: fields.text({ label: "Credit line", validation: noEmDash }),
          creditHref: fields.text({ label: "Credit link (optional)" }),
          columns: fields.array(
            fields.object({
              heading: fields.text({ label: "Heading" }),
              items: fields.array(
                fields.object({
                  label: fields.text({ label: "Label" }),
                  href: fields.text({ label: "Href" }),
                }),
                { label: "Items", itemLabel: (p) => p.fields.label.value },
              ),
            }),
            { label: "Footer columns", itemLabel: (p) => p.fields.heading.value },
          ),
        }, { label: "Footer" }),
        seo: fields.object({
          keywords: fields.array(fields.text({ label: "Keyword" }), {
            label: "Default meta keywords",
            itemLabel: (p) => p.value,
          }),
          defaultOgImage: fields.image({
            label: "Default Open Graph image",
            directory: "public/brand",
            publicPath: "/brand/",
          }),
        }, { label: "SEO defaults" }),
      },
    }),

    // ----- Home -----
    home: singleton({
      label: "Home page",
      path: "content/home/",
      format: { data: "json" },
      previewUrl: "/",
      schema: {
        hero: fields.object({
          eyebrow: fields.text({ label: "Status banner (eyebrow)", validation: noEmDash }),
          italicLine: fields.text({ label: "Italic line (right column)", validation: noEmDash }),
          headline: fields.text({ label: "Headline" }),
          subhead: fields.text({ label: "Subhead", multiline: true, validation: noEmDash }),
          primary: fields.object({
            title: fields.text({ label: "Title" }),
            body: fields.text({ label: "Body", multiline: true }),
            label: fields.text({ label: "Button label" }),
            href: fields.text({ label: "Button href" }),
          }, { label: "Primary CTA" }),
          secondary: fields.object({
            title: fields.text({ label: "Title" }),
            body: fields.text({ label: "Body", multiline: true }),
            label: fields.text({ label: "Link label" }),
            href: fields.text({ label: "Link href" }),
          }, { label: "Secondary link" }),
          tertiary: fields.array(
            fields.object({
              label: fields.text({ label: "Label" }),
              href: fields.text({ label: "Href" }),
            }),
            { label: "Tertiary links", itemLabel: (p) => p.fields.label.value },
          ),
        }, { label: "Hero" }),
        marqueeWords: fields.array(fields.text({ label: "Word or phrase", validation: noEmDash }), {
          label: "Marquee items (no invented stats)",
          itemLabel: (p) => p.value,
        }),
        bumpers: fields.object({
          clarification: bumperList("Clarification slot"),
          aside: bumperList("Aside slot"),
          outro: bumperList("Outro slot"),
        }, { label: "Rotating bumpers (one variant chosen per session)" }),
        mission: fields.conditional(
          fields.checkbox({ label: "Show mission strip", defaultValue: false }),
          {
            true: fields.object({
              eyebrow: fields.text({ label: "Eyebrow" }),
              heading: fields.text({ label: "Heading", validation: noEmDash }),
              body: fields.text({ label: "Body", multiline: true, validation: noEmDash }),
            }),
            false: fields.empty(),
          },
        ),
        topSections: sectionsField("Top sections (render below the hero, above shows)"),
        bottomSections: sectionsField("Bottom sections (render below mailing list, above the outro)"),
      },
    }),

    // ----- Shows copy + featured special + presale -----
    showsCopy: singleton({
      label: "Shows copy",
      path: "content/shows-copy/",
      format: { data: "json" },
      previewUrl: "/shows",
      schema: {
        heading: fields.text({ label: "Heading" }),
        subhead: fields.text({ label: "Subhead", multiline: true, validation: noEmDash }),
        emptyState: fields.text({
          label: "Empty state copy",
          multiline: true,
          validation: noEmDash,
        }),
        featuredSpecial: fields.object({
          title: fields.text({ label: "Title" }),
          subtitle: fields.text({ label: "Subtitle" }),
          blurb: fields.text({ label: "Blurb", multiline: true, validation: noEmDash }),
          videoUrl: fields.text({
            label: "YouTube URL or 11-char id (leave empty for 'Coming soon')",
          }),
          poster: fields.image({
            label: "Poster",
            directory: "public/images/comedians",
            publicPath: "/images/comedians/",
          }),
          posterAlt: fields.text({ label: "Poster alt text (optional)" }),
          comedianHandle: fields.url({ label: "Featured comic Instagram URL" }),
        }, { label: "Featured special" }),
        presale: fields.conditional(
          fields.checkbox({ label: "Active presale", defaultValue: false }),
          {
            true: fields.object({
              code: fields.text({ label: "Presale code" }),
              expiresAt: fields.date({ label: "Expires at (ISO date)" }),
              venueName: fields.text({ label: "Venue name" }),
            }),
            false: fields.empty(),
          },
        ),
        topSections: sectionsField("Top sections (render below the page header)"),
        bottomSections: sectionsField("Bottom sections (render above the mailing list)"),
      },
    }),

    // ----- Watch copy + top YouTube videos -----
    watchCopy: singleton({
      label: "Watch copy",
      path: "content/watch-copy/",
      format: { data: "json" },
      previewUrl: "/watch",
      schema: {
        heading: fields.text({ label: "Heading" }),
        subhead: fields.text({ label: "Subhead", validation: noEmDash }),
        emptyClipsLine: fields.text({ label: "Empty clips line", validation: noEmDash }),
        youtubeVideos: fields.array(
          fields.object({
            url: fields.text({
              label: "URL or 11-char id",
              description: "Full YouTube URL or just the video id.",
            }),
            title: fields.text({ label: "Title" }),
          }),
          {
            label: "Top YouTube videos (max 5 render on /watch)",
            itemLabel: (p) => p.fields.title.value,
          },
        ),
        topSections: sectionsField("Top sections (render below the page header)"),
        bottomSections: sectionsField("Bottom sections (render at the bottom of /watch)"),
      },
    }),

    // ----- Roster copy (comedians + members shared singleton) -----
    rosterCopy: singleton({
      label: "Roster copy",
      path: "content/roster-copy/",
      format: { data: "json" },
      previewUrl: "/roster",
      schema: {
        comedians: fields.object({
          subhead: fields.text({ label: "Subhead", multiline: true, validation: noEmDash }),
          kicker: fields.text({ label: "Kicker (mono line)", validation: noEmDash }),
        }, { label: "Comedians section" }),
        about: fields.object({
          heading: fields.text({ label: "Heading" }),
          subhead: fields.text({ label: "Subhead", multiline: true, validation: noEmDash }),
          crewHeading: fields.text({ label: "Crew heading" }),
          crewSubhead: fields.text({ label: "Crew subhead", validation: noEmDash }),
        }, { label: "About section" }),
        pillars: fields.array(
          fields.object({
            title: fields.text({ label: "Title" }),
            body: fields.text({ label: "Body", multiline: true, validation: noEmDash }),
          }),
          { label: "Pillars (the four functions)", itemLabel: (p) => p.fields.title.value },
        ),
        topSections: sectionsField("Top sections (render below the page header)"),
        bottomSections: sectionsField("Bottom sections (render at the bottom of /roster)"),
      },
    }),

    // ----- Open mics copy -----
    openMicsCopy: singleton({
      label: "Open mics copy",
      path: "content/open-mics-copy/",
      format: { data: "json" },
      previewUrl: "/open-mics",
      schema: {
        subhead: fields.text({ label: "Subhead", multiline: true, validation: noEmDash }),
        kicker: fields.text({ label: "Kicker", validation: noEmDash }),
        topSections: sectionsField("Top sections (render below the page header)"),
        bottomSections: sectionsField("Bottom sections (render at the bottom of /open-mics)"),
      },
    }),

    // ----- Shop copy -----
    shopCopy: singleton({
      label: "Shop copy",
      path: "content/shop-copy/",
      format: { data: "json" },
      previewUrl: "/shop",
      schema: {
        heading: fields.text({ label: "Heading" }),
        subhead: fields.text({ label: "Subhead", validation: noEmDash }),
        collectionUrl: fields.url({ label: "Fourthwall collection URL" }),
        storeUrl: fields.url({ label: "Fourthwall store URL" }),
      },
    }),

    // ----- Contact page -----
    contactCopy: singleton({
      label: "Contact page",
      path: "content/contact-copy/",
      format: { data: "json" },
      previewUrl: "/contact",
      schema: {
        eyebrow: fields.text({ label: "Eyebrow", validation: noEmDash }),
        titleLead: fields.text({ label: "Title lead (plain)", validation: noEmDash }),
        titleEmphasis: fields.text({ label: "Title emphasis (italic, hazard)", validation: noEmDash }),
        body: fields.text({ label: "Body", multiline: true, validation: noEmDash }),
        emailLabel: fields.text({ label: "Email label" }),
        phoneLabel: fields.text({ label: "Phone label" }),
        textCtaLabel: fields.text({ label: "Text CTA label" }),
        whatsappCtaLabel: fields.text({ label: "WhatsApp CTA label" }),
        findUsLabel: fields.text({ label: "Find us label" }),
        form: fields.object({
          submitLabel: fields.text({ label: "Submit button label" }),
          successText: fields.text({ label: "Success message", validation: noEmDash }),
          errorText: fields.text({ label: "Error message", validation: noEmDash }),
          nameLabel: fields.text({ label: "Name field label" }),
          emailLabel: fields.text({ label: "Email field label" }),
          messageLabel: fields.text({ label: "Message field label" }),
          messagePlaceholder: fields.text({ label: "Message placeholder", validation: noEmDash }),
        }, { label: "Form" }),
      },
    }),

    // ----- Sponsorships -----
    sponsorships: singleton({
      label: "Sponsorships",
      path: "content/sponsorships/",
      format: { data: "json" },
      previewUrl: "/book#sponsors",
      schema: {
        stats: fields.array(
          fields.object({
            label: fields.text({ label: "Label" }),
            value: fields.text({
              label: "Value (display string; leave empty to render placeholder)",
            }),
            detail: fields.text({ label: "Detail", multiline: true, validation: noEmDash }),
          }),
          { label: "Stats (no invented numbers)", itemLabel: (p) => p.fields.label.value },
        ),
        tiers: fields.array(
          fields.object({
            name: fields.text({ label: "Tier name" }),
            price: fields.text({ label: "Price (display string)" }),
            deliverables: fields.array(fields.text({ label: "Deliverable" }), {
              label: "Deliverables",
              itemLabel: (p) => p.value,
            }),
          }),
          { label: "Tiers", itemLabel: (p) => p.fields.name.value },
        ),
      },
    }),
  },

  collections: {
    // ----- Pages (composed from blocks; renders at /<slug>) -----
    pages: collection({
      label: "Pages",
      slugField: "slug",
      path: "content/pages/*",
      format: { data: "json" },
      previewUrl: "/{slug}",
      columns: ["title"],
      schema: {
        slug: fields.slug({
          name: {
            label: "Slug",
            description: "URL segment. The page will live at /<slug>. Lowercase, hyphens.",
            validation: {
              length: { min: 1, max: 64 },
              pattern: {
                regex: /^[a-z0-9][a-z0-9-]*$/,
                message: "Lowercase letters, numbers, and hyphens only.",
              },
            },
          },
          slug: {
            validation: {
              pattern: {
                regex: new RegExp(`^(?!(${RESERVED_SLUGS.join("|")})$).*$`, "i"),
                message: RESERVED_SLUG_ERROR,
              },
            },
          },
        }),
        title: fields.text({
          label: "Title",
          description: "Used in the browser tab and as the default SEO title.",
          validation: { length: { min: 1, max: 120 }, ...noEmDash },
        }),
        seoDescription: fields.text({
          label: "SEO description (optional)",
          multiline: true,
          validation: { length: { max: 170 }, ...noEmDash },
        }),
        ogImage: fields.image({
          label: "Social share image (optional)",
          directory: "public/images/pages",
          publicPath: "/images/pages/",
        }),
        sections: sectionsField("Page sections (add, reorder, remove)"),
        draft: fields.checkbox({
          label: "Draft (hidden from the live site)",
          defaultValue: false,
        }),
      },
    }),

    // ----- News (Phase 1, kept) -----
    news: collection({
      label: "News posts",
      slugField: "slug",
      path: "content/news/*",
      format: { contentField: "body" },
      entryLayout: "content",
      previewUrl: "/watch#from-the-goose",
      columns: ["title", "date"],
      schema: {
        slug: fields.slug({
          name: { label: "Slug", description: "URL-friendly id. Lowercase, hyphens." },
        }),
        title: fields.text({ label: "Title", validation: { length: { min: 1, max: 120 } } }),
        date: fields.date({ label: "Publish date" }),
        summary: fields.text({
          label: "Summary",
          multiline: true,
          validation: { length: { min: 1, max: 280 }, ...noEmDash },
        }),
        image: fields.image({
          label: "Hero image",
          directory: "public/images/news",
          publicPath: "/images/news/",
        }),
        imageAlt: fields.text({
          label: "Hero image alt text",
          description: "Describe the image for screen readers. Leave empty for decorative images.",
        }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tags",
          itemLabel: (p) => p.value,
        }),
        featured: fields.checkbox({
          label: "Featured (pinned in the Latest strip)",
          defaultValue: false,
        }),
        draft: fields.checkbox({ label: "Draft (hidden from the site)", defaultValue: false }),
        body: fields.markdoc({
          label: "Body",
          options: {
            image: { directory: "public/images/news", publicPath: "/images/news/" },
          },
        }),
      },
    }),

    // ----- Services -----
    services: collection({
      label: "Services",
      slugField: "slug",
      path: "content/services/*",
      format: { data: "json" },
      previewUrl: "/book/{slug}",
      columns: ["title"],
      schema: {
        slug: fields.slug({ name: { label: "Slug (URL segment)" } }),
        title: fields.text({ label: "Title" }),
        metaTitle: fields.text({ label: "SEO meta title", validation: { length: { max: 65 } } }),
        metaDescription: fields.text({
          label: "SEO meta description",
          multiline: true,
          validation: { length: { max: 170 }, ...noEmDash },
        }),
        summary: fields.text({
          label: "Summary",
          multiline: true,
          validation: noEmDash,
        }),
        whatYouGet: fields.array(fields.text({ label: "Item", multiline: true }), {
          label: "What you get",
          itemLabel: (p) => p.value.slice(0, 60),
        }),
        idealFor: fields.array(fields.text({ label: "Item", multiline: true }), {
          label: "Ideal for",
          itemLabel: (p) => p.value.slice(0, 60),
        }),
        process: fields.array(fields.text({ label: "Step", multiline: true }), {
          label: "Process steps",
          itemLabel: (p) => p.value.slice(0, 60),
        }),
        pricing: fields.text({ label: "Pricing line", multiline: true, validation: noEmDash }),
        faqs: fields.array(
          fields.object({
            q: fields.text({ label: "Question" }),
            a: fields.text({ label: "Answer", multiline: true, validation: noEmDash }),
          }),
          { label: "FAQs", itemLabel: (p) => p.fields.q.value },
        ),
        draft: fields.checkbox({ label: "Draft (shows banner on detail page)", defaultValue: false }),
      },
    }),

    // ----- Pricing tiers (the 3-card grid on /book) -----
    pricingTiers: collection({
      label: "Pricing tiers",
      slugField: "name",
      path: "content/pricing-tiers/*",
      format: { data: "json" },
      previewUrl: "/book#corporate",
      schema: {
        name: fields.slug({ name: { label: "Name" } }),
        bestFor: fields.text({ label: "Best for (eyebrow)" }),
        price: fields.text({ label: "Price (display string)" }),
        items: fields.array(fields.text({ label: "Item" }), {
          label: "Items",
          itemLabel: (p) => p.value,
        }),
      },
    }),

    // ----- Comedians -----
    comedians: collection({
      label: "Comedians",
      slugField: "slug",
      path: "content/comedians/*",
      format: { data: "json" },
      previewUrl: "/roster",
      columns: ["name"],
      schema: {
        slug: fields.slug({ name: { label: "Slug" } }),
        name: fields.text({ label: "Name", validation: { length: { min: 2 } } }),
        photo: fields.image({
          label: "Portrait",
          directory: "public/images/comedians",
          publicPath: "/images/comedians/",
        }),
        photoAlt: fields.text({ label: "Portrait alt text (optional)" }),
        instagram: fields.url({ label: "Instagram URL (optional)" }),
        facebook: fields.url({ label: "Facebook URL (optional)" }),
        draft: fields.checkbox({ label: "Draft (hidden from /roster)", defaultValue: false }),
      },
    }),

    // ----- Members (crew) -----
    members: collection({
      label: "Crew members",
      slugField: "slug",
      path: "content/members/*",
      format: { data: "json" },
      previewUrl: "/roster",
      columns: ["name", "role"],
      schema: {
        slug: fields.slug({ name: { label: "Slug" } }),
        name: fields.text({ label: "Name" }),
        role: fields.text({ label: "Role" }),
        photo: fields.image({
          label: "Portrait",
          directory: "public/images/members",
          publicPath: "/images/members/",
        }),
        photoAlt: fields.text({ label: "Portrait alt text (optional)" }),
        index: fields.text({
          label: "Display order (two digits)",
          description: 'Used to render the "/01" label. Padded string.',
        }),
        bio: fields.text({
          label: "Bio (optional, 2-3 sentences)",
          multiline: true,
          validation: noEmDash,
        }),
        draft: fields.checkbox({ label: "Draft (hidden from /roster)", defaultValue: false }),
      },
    }),

    // ----- Shows manual entries -----
    showsManual: collection({
      label: "Shows (manual entries)",
      slugField: "id",
      path: "content/shows/*",
      format: { data: "json" },
      previewUrl: "/shows",
      columns: ["name", "start"],
      schema: {
        id: fields.slug({ name: { label: "Show id" } }),
        name: fields.text({ label: "Name" }),
        start: fields.datetime({ label: "Start (ISO with timezone)" }),
        end: fields.datetime({ label: "End (optional)" }),
        url: fields.text({ label: "Event page URL (optional)" }),
        ticketUrl: fields.text({ label: "Ticket URL (optional)" }),
        summary: fields.text({ label: "Summary", multiline: true, validation: noEmDash }),
        imageUrl: fields.image({
          label: "Poster (optional)",
          directory: "public/images/shows",
          publicPath: "/images/shows/",
        }),
        imageAlt: fields.text({ label: "Poster alt text (optional)" }),
        draft: fields.checkbox({ label: "Draft (hidden from /shows)", defaultValue: false }),
        venue: fields.object({
          name: fields.text({ label: "Venue name" }),
          address: fields.text({ label: "Address" }),
          city: fields.text({ label: "City" }),
          region: fields.text({ label: "Region (state code)" }),
          country: fields.text({ label: "Country code", defaultValue: "US" }),
        }, { label: "Venue" }),
        status: fields.select({
          label: "Status",
          options: [
            { label: "Ticketed", value: "ticketed" },
            { label: "Free / at the door", value: "free" },
            { label: "TBA", value: "tba" },
          ],
          defaultValue: "tba",
        }),
        ticketPrice: fields.text({ label: "Ticket price (display string)" }),
        doorTime: fields.text({ label: "Door time" }),
      },
    }),

    // ----- Shop manual products -----
    shopManual: collection({
      label: "Shop products (manual)",
      slugField: "name",
      path: "content/shop-products/*",
      format: { data: "json" },
      previewUrl: "/shop",
      columns: ["name", "price"],
      schema: {
        name: fields.slug({ name: { label: "Product name" } }),
        price: fields.text({ label: "Price (display string)" }),
        url: fields.url({ label: "Fourthwall product URL" }),
        image: fields.text({
          label: "Image URL (imgproxy.fourthwall.com)",
          description: "Empty hides the product from the shop until an image is set.",
        }),
        imageAlt: fields.text({ label: "Image alt text (optional)" }),
        draft: fields.checkbox({ label: "Draft (hidden from /shop)", defaultValue: false }),
      },
    }),

    // ----- Open mics -----
    openMics: collection({
      label: "Open mics",
      slugField: "id",
      path: "content/open-mics/*",
      format: { data: "json" },
      previewUrl: "/open-mics",
      columns: ["name", "day", "city"],
      schema: {
        id: fields.slug({ name: { label: "Slug" } }),
        name: fields.text({ label: "Display name" }),
        venue: fields.text({ label: "Venue" }),
        address: fields.text({ label: "Address" }),
        city: fields.text({ label: "City" }),
        region: fields.select({
          label: "Region",
          options: [
            { label: "Washington", value: "WA" },
            { label: "Oregon", value: "OR" },
          ],
          defaultValue: "WA",
        }),
        lat: fields.number({ label: "Latitude" }),
        lng: fields.number({ label: "Longitude" }),
        day: fields.select({
          label: "Day",
          options: [
            { label: "Monday", value: "Monday" },
            { label: "Tuesday", value: "Tuesday" },
            { label: "Wednesday", value: "Wednesday" },
            { label: "Thursday", value: "Thursday" },
            { label: "Friday", value: "Friday" },
            { label: "Saturday", value: "Saturday" },
            { label: "Sunday", value: "Sunday" },
          ],
          defaultValue: "Monday",
        }),
        time: fields.text({ label: "Time (display string)" }),
        host: fields.text({ label: "Host (optional)" }),
        signupUrl: fields.text({ label: "Signup URL (optional)" }),
        notes: fields.text({ label: "Notes (optional)", multiline: true }),
      },
    }),

    // ----- TikTok videos -----
    tiktokVideos: collection({
      label: "TikTok videos",
      slugField: "title",
      path: "content/tiktok/*",
      format: { data: "json" },
      previewUrl: "/watch#latest",
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        url: fields.url({ label: "TikTok URL" }),
        poster: fields.image({
          label: "Poster",
          directory: "public/images/tiktok",
          publicPath: "/images/tiktok/",
        }),
        posterAlt: fields.text({ label: "Poster alt text (optional)" }),
        draft: fields.checkbox({ label: "Draft (hidden from /watch)", defaultValue: false }),
      },
    }),
  },
});

// Helper for the three bumper slots. Each slot holds an ordered list of
// variants; the rotating-bumper picks one per session.
function bumperList(label: string) {
  return fields.array(
    fields.object({
      eyebrow: fields.text({ label: "Eyebrow (small, top)", validation: noEmDash }),
      body: fields.text({
        label: 'Body (use "\\n" for a line break)',
        multiline: true,
        validation: noEmDash,
      }),
      footnote: fields.text({ label: "Footnote (small, bottom)", validation: noEmDash }),
    }),
    { label, itemLabel: (p) => p.fields.eyebrow.value },
  );
}
