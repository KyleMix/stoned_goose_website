import { TrackedAnchor } from "@/components/tracked-anchor";
import { site } from "@/content/site";

export type HostAMicCopy = {
  eyebrow: string;
  heading: string;
  body: string;
  instagramLabel: string;
  emailLabel: string;
  emailSubject: string;
  emailBody: string;
  comicsNote: string;
};

/** "stonedgooseproductions" out of the profile URL in content/site. */
function instagramHandle(profileUrl: string): string {
  return profileUrl
    .replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, "")
    .replace(/[/?#].*$/, "")
    .replace(/^@/, "");
}

/**
 * The ask on the coming soon page: venues that want an open mic, message us.
 *
 * Two big buttons, one per channel, each opening a message that is already
 * addressed: ig.me opens a DM thread straight to our account in the Instagram
 * app, and the mailto carries a subject and a short template so a venue only
 * fills in the blanks. Both are also printed as plain text for copying.
 */
export function HostAMic({ copy }: { copy: HostAMicCopy }) {
  const handle = instagramHandle(site.social.instagram);
  const dmUrl = `https://ig.me/m/${handle}`;
  const mailto = `mailto:${site.contact.email}?subject=${encodeURIComponent(
    copy.emailSubject,
  )}&body=${encodeURIComponent(copy.emailBody)}`;

  return (
    <div className="grid gap-10 md:grid-cols-12 md:items-end md:gap-12">
      <div className="md:col-span-7">
        {copy.eyebrow ? <p className="t-eyebrow">{copy.eyebrow}</p> : null}
        <h2 id="open-mic-host" className="display-2 mt-4 text-surface-ivory">
          {copy.heading}
        </h2>
        {copy.body ? (
          <p className="t-body mt-6 max-w-[52ch] text-base md:text-lg">
            {copy.body}
          </p>
        ) : null}
        {copy.comicsNote ? (
          <p className="t-body mt-4 max-w-[52ch] text-base md:text-lg">
            {copy.comicsNote}
          </p>
        ) : null}
      </div>

      <div className="md:col-span-5">
        <div className="flex flex-col gap-4">
          <TrackedAnchor
            destination="instagram"
            href={dmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-14 w-full items-center justify-center bg-accent-gold px-6 t-ui text-surface-tuxedo transition-colors hover:bg-surface-ivory"
          >
            {copy.instagramLabel} ↗
          </TrackedAnchor>
          <a
            href={mailto}
            className="inline-flex h-14 w-full items-center justify-center border border-smoke px-6 t-ui text-surface-ivory transition-colors hover:border-accent-gold hover:text-accent-gold"
          >
            {copy.emailLabel} ↗
          </a>
        </div>
        <dl className="mt-6 space-y-2">
          <div className="flex flex-wrap gap-x-3">
            <dt className="t-fine">Instagram</dt>
            <dd>
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="t-body text-base underline underline-offset-4 hover:text-accent-gold"
              >
                @{handle}
              </a>
            </dd>
          </div>
          <div className="flex flex-wrap gap-x-3">
            <dt className="t-fine">Email</dt>
            <dd>
              <a
                href={mailto}
                className="t-body text-base underline underline-offset-4 hover:text-accent-gold"
              >
                {site.contact.email}
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
