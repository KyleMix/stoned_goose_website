import Link from "next/link";
import { about } from "@/content/home";
import { Surface } from "@/components/brand/surface";

// The section the site did not have. A visitor deciding whether to hire us
// needs to know what we are before they are asked to fill in a form, and
// "five people in Olympia" does more of that work than any adjective.
//
// Blank-line-separated paragraphs, same convention as the rich text block, so
// the copy stays editable in /admin without markup.
export function AboutBlock() {
  if (!about.body) return null;
  const paragraphs = about.body.split(/\n{2,}/).filter(Boolean);

  return (
    <Surface tone="ivory" as="section" id="about" className="section-y border-b border-smoke">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-10 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-4">
            <p className="t-eyebrow">{about.eyebrow}</p>
            <h2 className="t-headline mt-4 display-1 text-balance">
              {about.heading}
            </h2>
          </div>
          <div className="md:col-span-8">
            <div className="max-w-col space-y-5">
              {paragraphs.map((p, i) => (
                <p key={i} className="t-body text-base leading-relaxed md:text-lg">
                  {p}
                </p>
              ))}
            </div>
            <Link
              href={about.ctaHref}
              className="mt-8 inline-flex h-12 items-center border border-smoke px-6 t-ui transition-colors hover:border-accent-gold hover:text-accent-gold"
            >
              {about.ctaLabel} <span aria-hidden className="ml-2">&#8599;</span>
            </Link>
          </div>
        </div>
      </div>
    </Surface>
  );
}
