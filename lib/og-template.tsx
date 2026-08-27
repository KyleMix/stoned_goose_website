import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

const TUXEDO = "#0F0F0F";
const IVORY = "#F4EEE2";
const GOLD = "#D4AA4A";
const SMOKE = "#8C8781";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

// Read the corner mark once at module load so each ImageResponse can embed
// it as a data URI without hitting the filesystem per render. Static export
// runs this in Node at build time.
const markBuffer = readFileSync(
  join(process.cwd(), "public/brand/og-mark.png"),
);
const markDataUrl = `data:image/png;base64,${markBuffer.toString("base64")}`;

type OgInput = {
  eyebrow: string;
  title: string;
};

// Templated OG card. Layout: flat Tuxedo field, eyebrow top, big display
// title with a gold period, brand line bottom-left, URL bottom-right, and a
// quiet illustration mark in the top-right corner. The mark is a brand
// signoff, not the focal point: route name keeps the room.
export function ogImageResponse({ eyebrow, title }: OgInput) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: TUXEDO,
          color: IVORY,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 90px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            letterSpacing: "0.28em",
            color: SMOKE,
            textTransform: "uppercase",
            zIndex: 1,
          }}
        >
          <span>{eyebrow}</span>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders via Satori, next/image is not supported here. */}
          <img src={markDataUrl} alt="" width={88} height={88} style={{ opacity: 0.9 }} />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            // 1200px wide minus 90px padding on each side leaves ~1020px.
            // Scale the title down as character count climbs so long service
            // names like "Live Show Production" stay on one line.
            fontSize: title.length <= 6 ? 240 : title.length <= 12 ? 180 : title.length <= 18 ? 130 : 100,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            zIndex: 1,
          }}
        >
          <span>{title}</span>
          <span style={{ color: GOLD }}>.</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 18,
            letterSpacing: "0.2em",
            color: SMOKE,
            textTransform: "uppercase",
            zIndex: 1,
          }}
        >
          <span>Olympia, WA</span>
          <span>stonedgooseproductions.com</span>
        </div>
      </div>
    ),
    ogSize,
  );
}
