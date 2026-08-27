import { press } from "@/content/site";
import { Surface, type SurfaceTone } from "@/components/brand/surface";

// Slim row of pull quotes. Renders only when content/site.ts `press` array
// is non-empty. Owner-editable. No invented quotes.
export function PressStrip({ tone = "tuxedo" }: SurfaceTone) {
  if (press.length === 0) return null;

  return (
    <Surface
      tone={tone}
      as="section"
      aria-label="Press"
      className="border-y border-smoke py-16 md:py-20"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <p className="t-eyebrow">
          Press / Recognition
        </p>
        <ul className="mt-8 grid gap-px overflow-hidden border border-smoke md:grid-cols-3">
          {press.map((p, i) => {
            const body = (
              <>
                <p className="t-subhead text-xl leading-snug md:text-2xl">
                  &ldquo;{p.quote}&rdquo;
                </p>
                <p className="mt-4 t-eyebrow text-smoke">
                  {p.outlet}
                </p>
              </>
            );
            return (
              <li key={`${p.outlet}-${i}`} className="bg-surface-tuxedo p-8 md:p-10">
                {p.url ? (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:text-accent-gold"
                  >
                    {body}
                  </a>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </Surface>
  );
}
