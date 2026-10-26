// Three glyphs, drawn inline.
//
// Not an icon library: adding a dependency to render three shapes would be a bad
// trade, and the brand rule is that a gold circle is a <div>. These follow the
// same logic. They are decorative (aria-hidden); the accessible name lives on
// the link that wraps them.
//
// All are drawn on a 24x24 grid with currentColor, so they inherit the link's
// rest and hover colors like any other glyph.

type Props = { className?: string };

export function InstagramIcon({ className }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ className }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M15.5 3.5h-2.2A3.8 3.8 0 0 0 9.5 7.3V10H7.2v3.2h2.3V21h3.3v-7.8h2.4l.5-3.2h-2.9V7.6c0-.6.4-1 1-1h1.7Z" />
    </svg>
  );
}

/** A globe, for a comic's own website. */
export function WebsiteIcon({ className }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
    </svg>
  );
}
