import { ImageResponse } from "next/og";

const INK = "#0A0A0A";
const BONE = "#EFE9DD";
const HAZARD = "#F2EA00";
const HAZE = "rgba(239, 233, 221, 0.55)";
const HAZE_DIM = "rgba(239, 233, 221, 0.35)";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

type OgInput = {
  eyebrow: string;
  title: string;
};

// Templated OG card. ImageResponse uses Satori, which falls back to its
// bundled Inter-like font when no font is supplied. Good enough for share
// cards. Layout: ink background, mono eyebrow top, big serif-ish title with
// hazard period, brand line bottom-left, URL bottom-right.
export function ogImageResponse({ eyebrow, title }: OgInput) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: INK,
          color: BONE,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 90px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(ellipse at 25% 0%, rgba(239, 233, 221, 0.06), transparent 55%), radial-gradient(ellipse at 80% 90%, rgba(242, 234, 0, 0.06), transparent 55%)",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            letterSpacing: "0.28em",
            color: HAZE,
            textTransform: "uppercase",
            zIndex: 1,
          }}
        >
          <span>{eyebrow}</span>
          <span>Stoned Goose<span style={{ color: HAZARD }}>.</span></span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: 240,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            zIndex: 1,
          }}
        >
          <span>{title}</span>
          <span style={{ color: HAZARD }}>.</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 18,
            letterSpacing: "0.2em",
            color: HAZE_DIM,
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
