"use client";

// Top-level error boundary. Fires when something throws inside the root
// layout itself (the only thing app/error.tsx cannot catch). Static export
// rarely throws at runtime, but if it ever does we want the page to still
// look like Stoned Goose, not the unstyled Next.js fallback.
//
// global-error.tsx replaces the entire <html> tree, so we ship our own
// minimal shell. No nav, no footer: keep the failure mode small.

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ reset }: Props) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          background: "#0A0A0A",
          color: "#EFE9DD",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2.5rem 1.25rem",
        }}
      >
        <main style={{ maxWidth: "640px", width: "100%" }}>
          <p
            style={{
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#F2EA00",
              margin: 0,
            }}
          >
            [ Static / Error / Off-air ]
          </p>
          <h1
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 0.92,
              fontSize: "clamp(4rem, 14vw, 10rem)",
              margin: "1.25rem 0 1.5rem",
            }}
          >
            Off-air<span style={{ color: "#F2EA00" }}>.</span>
          </h1>
          <p
            style={{
              fontSize: "1rem",
              lineHeight: 1.6,
              color: "rgba(239, 233, 221, 0.85)",
              margin: 0,
            }}
          >
            Something cut the feed. Reloading usually does it. If it
            doesn&apos;t, send us a note and we&apos;ll figure it out.
          </p>
          <div
            style={{
              marginTop: "2.5rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                height: "3rem",
                padding: "0 1.5rem",
                background: "#F2EA00",
                color: "#0A0A0A",
                border: 0,
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- global-error fires when the root layout itself throws; a plain anchor stays safe even if next/link is mid-failure. */}
            <a
              href="/"
              style={{
                height: "3rem",
                display: "inline-flex",
                alignItems: "center",
                padding: "0 1.5rem",
                color: "#EFE9DD",
                border: "1px solid rgba(239, 233, 221, 0.3)",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              Back to home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
