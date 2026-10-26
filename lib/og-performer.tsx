import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { Show } from "@/content/shows";
import { formatShowDateBand, formatShowTime, showTimeZone } from "@/lib/dates";
import { ogSize } from "@/lib/og-template";

// A headliner's share card, 1200x630, in the flyer's layout: the arch headshot
// on the left, name, date, venue and times on the right. Same pipeline as
// lib/og-template.tsx (next/og at build time, so it ships as a static PNG).
//
// Satori cannot read the woff2 that next/font ships, so the two Josefin Sans
// weights it needs are committed as TTF under lib/og-fonts (SIL OFL, licence
// beside them). Read once at module load, at build time, in Node.

const TUXEDO = "#0F0F0F";
const IVORY = "#F4EEE2";
const GOLD = "#D4AA4A";
const SMOKE = "#8C8781";

const ROOT = process.cwd();
const fonts = [
  { weight: 400 as const, file: "JosefinSans-Regular.ttf" },
  { weight: 700 as const, file: "JosefinSans-Bold.ttf" },
].map(({ weight, file }) => ({
  name: "Josefin Sans",
  data: readFileSync(join(ROOT, "lib/og-fonts", file)),
  weight,
  style: "normal" as const,
}));

function dataUrl(publicPath: string): string | null {
  try {
    const buf = readFileSync(join(ROOT, "public", publicPath));
    const type = publicPath.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

// The arch art is 600x680. Sized by height to fill the card, width follows.
const ARCH_H = 530;
const ARCH_W = Math.round((ARCH_H * 600) / 680);

export function performerOgResponse(show: Show) {
  const p = show.performer;
  const name = p?.name ?? show.name;
  const arch = p?.images.arch ? dataUrl(p.images.arch) : null;
  const tz = showTimeZone(show);
  const date = formatShowDateBand(show.start, tz);
  const venue = [show.venue?.name, show.venue?.city, show.venue?.region].filter(Boolean).join(", ");
  const time = formatShowTime(show.start, tz);
  const times = [show.doorTime ? `Doors ${show.doorTime}` : null, time ? `Show ${time}` : null]
    .filter(Boolean)
    .join("  ·  ");
  const nameSize = name.length <= 11 ? 84 : name.length <= 15 ? 68 : 58;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          backgroundColor: TUXEDO,
          color: IVORY,
          fontFamily: "Josefin Sans",
          padding: "50px 60px",
          gap: 56,
        }}
      >
        {arch ? (
          // eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders via Satori, next/image is not supported here.
          <img src={arch} alt="" width={ARCH_W} height={ARCH_H} />
        ) : null}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div
            style={{
              fontSize: 18,
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: GOLD,
            }}
          >
            Stoned Goose Productions presents
          </div>
          <div
            style={{
              marginTop: 22,
              fontSize: nameSize,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {name}
          </div>
          {date ? (
            <div
              style={{
                display: "flex",
                marginTop: 30,
                padding: "14px 0 10px",
                borderTop: `2px solid ${GOLD}`,
                borderBottom: `2px solid ${GOLD}`,
                fontSize: 40,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: GOLD,
              }}
            >
              {date}
            </div>
          ) : null}
          {venue ? (
            <div style={{ marginTop: 26, fontSize: 26, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {venue}
            </div>
          ) : null}
          {times ? (
            <div style={{ marginTop: 12, fontSize: 24, letterSpacing: "0.08em", textTransform: "uppercase", color: SMOKE }}>
              {times}
            </div>
          ) : null}
          <div style={{ marginTop: 34, fontSize: 18, letterSpacing: "0.2em", textTransform: "uppercase", color: SMOKE }}>
            stonedgooseproductions.com/shows
          </div>
        </div>
      </div>
    ),
    { ...ogSize, fonts },
  );
}
