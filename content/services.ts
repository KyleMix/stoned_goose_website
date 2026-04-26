export type Service = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  summary: string;
  whatYouGet: string[];
  idealFor: string[];
  process: string[];
  pricing: string;
  faqs: { q: string; a: string }[];
};

export const services: Service[] = [
  {
    slug: "live-show-production",
    title: "Live Show Production",
    metaTitle:
      "Live Show Production | Olympia & South Sound | Stoned Goose Productions",
    metaDescription:
      "End-to-end live show production in Olympia, Lacey, and Tacoma. Book talent, tech, and tight run-of-show support with Stoned Goose.",
    summary:
      "End-to-end production that keeps comedy shows tight, on time, and unforgettable across Olympia, Lacey, Tacoma, and the South Sound.",
    whatYouGet: [
      "Show design, tech coordination, and run-of-show leadership.",
      "Reliable producers who manage talent, venues, and day-of logistics.",
      "Audience-first pacing that keeps energy high from open to close.",
    ],
    idealFor: [
      "Comedy clubs and theaters booking recurring nights.",
      "Festivals or venues adding live comedy programming.",
      "Brands activating with a hosted live experience.",
    ],
    process: [
      "Scope the show goals, audience size, and venue requirements.",
      "Confirm talent, tech specs, and timelines with your team.",
      "Execute the show with on-site production leadership.",
    ],
    pricing:
      "Packages are custom based on show scope, talent needs, and tech. Request a quote for tailored pricing.",
    faqs: [
      {
        q: "Do you produce shows in Olympia, Lacey, and Tacoma?",
        a: "Yes. We support venues across Olympia, Lacey, Tacoma, and the greater South Sound with on-site production leadership.",
      },
      {
        q: "Can you handle talent booking and production together?",
        a: "Absolutely. We can manage comedian booking, tech coordination, and run-of-show planning as a single, streamlined package.",
      },
      {
        q: "How far in advance should we book live show production?",
        a: "Most shows book 4-8 weeks out, but we can accommodate faster turnarounds depending on venue and talent availability.",
      },
      {
        q: "What information do you need for a quote?",
        a: "Share your event date, venue size, and the type of show you want. We'll send a tailored package and pricing options.",
      },
    ],
  },
  {
    slug: "comedian-booking",
    title: "Comedian Booking",
    metaTitle:
      "Comedian Booking | Olympia & South Sound | Stoned Goose Productions",
    metaDescription:
      "Book comedians for Olympia, Lacey, and Tacoma events. Curated talent matching, contracts, and scheduling handled by Stoned Goose.",
    summary:
      "Curated comedian booking that matches your audience, timeline, and tone. Serving Olympia, Lacey, Tacoma, and the South Sound.",
    whatYouGet: [
      "Talent recommendations aligned with your audience and brand.",
      "Availability checks, contracts, and schedule coordination.",
      "Clear communication leading into show day.",
    ],
    idealFor: [
      "Venues that need recurring or rotating lineups.",
      "Corporate and private events seeking clean, reliable talent.",
      "Producers assembling a fast, polished comedy bill.",
    ],
    process: [
      "Share your event date, tone, and budget expectations.",
      "Receive a shortlist of comedians with bios and rates.",
      "We confirm the lineup and handle contracts and logistics.",
    ],
    pricing:
      "Booking rates vary by talent level and event format. Request a quote for a tailored lineup.",
    faqs: [
      {
        q: "Can you book comedians for corporate events in Tacoma?",
        a: "Yes. We regularly book clean, corporate-ready comedians for Tacoma and South Sound events.",
      },
      {
        q: "Do you handle contracts and travel details?",
        a: "We manage contracts, scheduling, and any travel requirements so your team can focus on the event.",
      },
      {
        q: "How many comedians can we book for one show?",
        a: "We can build anything from a single headliner to a full lineup, depending on your run time and budget.",
      },
      {
        q: "What should we send to start the booking process?",
        a: "Let us know your date, venue or format, and audience size. We'll reply with available talent and pricing.",
      },
    ],
  },
  {
    slug: "corporate-events",
    title: "Corporate Events",
    metaTitle:
      "Corporate Event Comedy | Olympia & South Sound | Stoned Goose Productions",
    metaDescription:
      "Corporate comedy and event production for Olympia, Lacey, and Tacoma teams. Clean, tailored shows with full coordination.",
    summary:
      "Tailored comedy programming for corporate events that keeps teams engaged without crossing lines in Olympia, Lacey, and Tacoma.",
    whatYouGet: [
      "Clean, customized comedy aligned with your culture.",
      "Experienced hosts and producers who keep the agenda moving.",
      "Hybrid-ready coordination for in-person or streamed events.",
    ],
    idealFor: [
      "Company celebrations, retreats, and holiday parties.",
      "Conference entertainment and client appreciation.",
      "Team-building events needing a memorable anchor.",
    ],
    process: [
      "Align on audience profile, goals, and desired tone.",
      "Receive tailored talent and production recommendations.",
      "We coordinate rehearsals, tech, and show execution.",
    ],
    pricing:
      "Corporate packages are customized by audience size and production needs. Request a quote to get started.",
    faqs: [
      {
        q: "Do you provide clean comedy for corporate audiences?",
        a: "Yes. We specialize in clean, professional shows that respect your brand guidelines and audience mix.",
      },
      {
        q: "Can you support hybrid or virtual events?",
        a: "We can coordinate tech and talent for in-person, hybrid, or fully virtual comedy events.",
      },
      {
        q: "Where do you offer corporate event production?",
        a: "We serve Olympia, Lacey, Tacoma, and the greater South Sound, with travel options available.",
      },
      {
        q: "How quickly can we book a corporate event?",
        a: "Four weeks is ideal, but we can often book faster depending on availability and scope.",
      },
    ],
  },
  {
    slug: "media-and-podcasts",
    title: "Media & Podcasts",
    metaTitle:
      "Media & Podcast Production | Olympia & South Sound | Stoned Goose Productions",
    metaDescription:
      "Podcast and media production in Olympia, Lacey, and Tacoma. Recording, editing, and content support for comedians and brands.",
    summary:
      "Audio and video production for comedians and brands who want broadcast-ready podcasts and media in the South Sound.",
    whatYouGet: [
      "Recording setup, engineering, and production support.",
      "Video capture and editing for clips and episodes.",
      "Distribution guidance for podcast and social channels.",
    ],
    idealFor: [
      "Comedians launching or leveling up a podcast.",
      "Brands creating comedy-forward video series.",
      "Studios capturing live comedy recordings.",
    ],
    process: [
      "Define the show format, guests, and release cadence.",
      "Capture audio/video in-studio or on location.",
      "Deliver edited episodes and highlight assets.",
    ],
    pricing:
      "Pricing depends on episode length and production needs. Request a quote for a tailored package.",
    faqs: [
      {
        q: "Do you record podcasts in Olympia or Tacoma?",
        a: "Yes. We support recording across Olympia, Lacey, Tacoma, and the South Sound with mobile or studio setups.",
      },
      {
        q: "Can you handle editing and highlight clips?",
        a: "We provide full post-production, including audio polish, video edits, and social-ready clips.",
      },
      {
        q: "Do you help with podcast distribution?",
        a: "We can guide platform setup and recommend best practices for consistent releases.",
      },
      {
        q: "How many episodes can we book at once?",
        a: "We offer single-episode sessions and multi-episode production blocks depending on your schedule.",
      },
    ],
  },
  {
    slug: "headshots-and-promo",
    title: "Headshots & Promo Shoots",
    metaTitle:
      "Headshots & Promo Shoots | Olympia & South Sound | Stoned Goose Productions",
    metaDescription:
      "Professional headshots and promo shoots in Olympia, Lacey, and Tacoma. Clean, modern images for comedians and teams.",
    summary:
      "Fast, collaborative headshot and promo sessions that deliver press-ready visuals across the South Sound.",
    whatYouGet: [
      "Directed sessions for clean, modern headshots.",
      "Multiple looks optimized for web, posters, and socials.",
      "Retouched galleries delivered quickly.",
    ],
    idealFor: [
      "Comedians updating press kits and promo assets.",
      "Show runners needing cohesive talent imagery.",
      "Teams looking for branded, professional photos.",
    ],
    process: [
      "Plan the look, wardrobe, and shot list.",
      "Capture in-studio or on-location sessions.",
      "Deliver edited selections and usage guidance.",
    ],
    pricing:
      "Session pricing varies by shot count and location. Request a quote to build the right package.",
    faqs: [
      {
        q: "Do you offer headshots in Olympia and Lacey?",
        a: "Yes. We shoot headshots across Olympia, Lacey, Tacoma, and the greater South Sound.",
      },
      {
        q: "How many looks can we capture in one session?",
        a: "Most sessions include multiple looks; we'll align on the shot list during booking.",
      },
      {
        q: "Can you provide images for press kits and posters?",
        a: "Absolutely. We deliver retouched, high-resolution files suited for press kits, posters, and social media.",
      },
      {
        q: "How soon will we receive final images?",
        a: "Typical turnaround is 5-7 business days, with rush options available.",
      },
    ],
  },
];

export const pricingTiers = [
  {
    name: "Starter",
    bestFor: "Best for clubs & pop-ups",
    price: "Starting at $750",
    items: [
      "Talent sourcing + booking",
      "Basic run-of-show planning",
      "Day-of production coordination",
    ],
  },
  {
    name: "Pro",
    bestFor: "Best for theaters & corporate events",
    price: "Starting at $2,000",
    items: [
      "Full booking + contracts management",
      "Production staffing & tech specs",
      "Photo + short-form recap assets",
    ],
  },
  {
    name: "Premium",
    bestFor: "Best for festivals & branded activations",
    price: "Starting at $5,000",
    items: [
      "Executive producing & creative direction",
      "On-site video/audio capture",
      "Post-event marketing kit + highlights",
    ],
  },
];
