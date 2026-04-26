// SVG-based grain overlay. Used site-wide via the root layout.
// Tiny payload, no PNG. Honors prefers-reduced-motion (no animation by default).
export function Grain({ opacity = 0.18 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] mix-blend-overlay"
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'>
            <filter id='n'>
              <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
              <feColorMatrix type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0'/>
            </filter>
            <rect width='100%' height='100%' filter='url(%23n)'/>
          </svg>`,
        )}")`,
      }}
    />
  );
}
