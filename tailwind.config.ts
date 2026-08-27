import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx,mdx}", "./components/**/*.{ts,tsx}", "./content/**/*.{ts,tsx,mdx}"],
  theme: {
    // Marquee brand system. The palette is five colors and the theme replaces
    // Tailwind's default color scale outright rather than extending it, so a
    // stray `text-gray-400` or `bg-red-500` fails to generate and shows up in
    // review as unstyled output instead of shipping quietly.
    //
    // Names are deliberately verbose. `bg-surface-ivory` and `text-gold-ink`
    // state the role, so using gold as a background or Dark Gold on black is
    // legible as wrong at the call site.
    colors: {
      transparent: "transparent",
      current: "currentColor",

      // The two surfaces. Every section is one or the other. There is no third.
      "surface-tuxedo": "#0F0F0F",
      "surface-ivory": "#F4EEE2",

      // The accent. Headline-size text on black, rules, and the monocle ring.
      // Never a section background, never body copy.
      "accent-gold": "#D4AA4A",

      // Small gold text on ivory only. Label size. Never on black.
      "gold-ink": "#8A6A21",

      // The only permitted gray. Secondary text and hairlines.
      smoke: "#8C8781",
    },

    // Josefin Sans ships three weights and the theme allows exactly those
    // three. `font-medium` and `font-semibold` no longer exist, so a component
    // cannot reference a weight the font does not load.
    fontWeight: {
      light: "300",
      normal: "400",
      bold: "700",
    },

    // The site is flat and printed. Elevation is a keyline, never a shadow,
    // so the shadow scales are emptied rather than merely left unused: a
    // `shadow-lg` added later fails to generate instead of shipping quietly.
    boxShadow: { none: "none" },
    dropShadow: { none: "none" },

    extend: {
      // Tracking is part of the type role, not a per-caller choice.
      //   tracking-headline  Bold 700 uppercase
      //   tracking-subhead   Bold 700 uppercase
      //   tracking-eyebrow   Regular 400 uppercase
      // Body and fine print run at normal tracking and need no token.
      letterSpacing: {
        headline: "0.04em",
        subhead: "0.06em",
        eyebrow: "0.26em",
      },
      maxWidth: {
        col: "70ch",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        marquee: "marquee 60s linear infinite",
        "fade-in": "fade-in 320ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
