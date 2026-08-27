import { press } from "@/content/site";

// Slim row of pull quotes. Renders only when content/site.ts `press` array
// is non-empty. Owner-editable. No invented quotes.
export function PressStrip() {
  if (press.length === 0) return null;

  return (
    <section
      aria-label="Press"
      className="border-y border-surface-ivory/10 bg-surface-tuxedo py-16 md:py-20"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <p className="font-body text-[11px] font-normal uppercase tracking-[0.18em] text-accent-gold">
          Press / Recognition
        </p>
        <ul className="mt-8 grid gap-px overflow-hidden border border-surface-ivory/15 md:grid-cols-3">
          {press.map((p, i) => {
            const body = (
              <>
                <p className="font-display text-xl leading-snug text-surface-ivory md:text-2xl">
                  &ldquo;{p.quote}&rdquo;
                </p>
                <p className="mt-4 font-body text-[11px] font-normal uppercase tracking-[0.18em] text-surface-ivory/55">
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
    </section>
  );
}
