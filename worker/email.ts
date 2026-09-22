// The confirmation email, and the one service call that sends it.
//
// Why an outside provider at all. Cloudflare's own email binding can only send
// to addresses already verified as destinations in your own account, which is
// fine for telling the room's owner something and useless for writing to a
// comic. MailChannels, which used to be the free path out of a Worker, stopped
// serving Workers in 2024. So a transactional provider it is, and Resend is
// the smallest one that does the job: one POST, one API key, no SDK.
//
// Sending is best effort and deliberately so. The comic already has their spot
// and their slot number on screen before this runs, so a provider outage must
// not turn into a failed sign up. The caller sends this from
// ctx.waitUntil(); a failure is logged and nothing else.

/** Trims a value for safe use inside an HTML attribute or text node. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type ConfirmationEmail = {
  to: string;
  name: string;
  /** "Monday, September 28" */
  dateLabel: string;
  slot: number;
  slotCount: number;
  spotMinutes: number;
  showTime: string;
  venue: string;
  address: string;
  /** Absolute URL, releases this one spot. */
  cancelUrl: string;
  /** Absolute URL, takes them off the roster. */
  unsubscribeUrl: string;
  /** Where to reply. */
  replyTo: string;
};

export type EmailEnv = {
  RESEND_API_KEY?: string;
  /** e.g. "Stoned Goose Open Mic <mic@stonedgooseproductions.com>" */
  OPEN_MIC_FROM_EMAIL?: string;
};

/**
 * The text part carries everything. The HTML part is the same words with a
 * little structure.
 *
 * No images, no web fonts, no background colours behind text. Not for taste:
 * Gmail strips `<style>` blocks, Outlook renders backgrounds unpredictably,
 * and a dark panel that half-loads leaves ivory text on white. The brand is
 * carried by the words here and by the site the links go to. The one nod to it
 * is the gold rule, which is a border on a div and degrades to nothing.
 */
function render(email: ConfirmationEmail): { text: string; html: string } {
  const spot = `Spot ${email.slot} of ${email.slotCount}`;

  const text = [
    `You have a spot at the Log Cabin Comedy Open Mic.`,
    ``,
    `${email.dateLabel}`,
    `${spot}. You have ${email.spotMinutes} minutes.`,
    `Show starts at ${email.showTime}.`,
    ``,
    `${email.venue}`,
    `${email.address}`,
    ``,
    `Running order goes up the night of, so turn up ready. Your spot number`,
    `here is the order you signed up in, not necessarily the order you go on.`,
    ``,
    `Can't make it? Release your spot so somebody else can take it:`,
    `${email.cancelUrl}`,
    ``,
    `We keep your name, email and Instagram handle on our comedian list so we`,
    `can get in touch about bookings and shows. Take yourself off it any time:`,
    `${email.unsubscribeUrl}`,
    ``,
    `Questions, reply to this email or write to ${email.replyTo}.`,
    ``,
    `Stoned Goose Productions, Olympia WA`,
  ].join("\n");

  const e = escapeHtml;
  const html = `<!doctype html>
<html lang="en"><body style="margin:0;padding:24px;font-family:Futura,'Century Gothic',Arial,sans-serif;font-size:16px;line-height:1.5;color:#0F0F0F;">
  <div style="max-width:560px;margin:0 auto;">
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:.26em;text-transform:uppercase;color:#87681F;">You are on the list</p>
    <h1 style="margin:0 0 16px;font-size:24px;letter-spacing:.04em;text-transform:uppercase;font-weight:700;">Log Cabin Comedy Open Mic</h1>
    <div style="border-top:2px solid #D4AA4A;margin:0 0 20px;"></div>

    <p style="margin:0 0 4px;font-size:18px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;">${e(email.dateLabel)}</p>
    <p style="margin:0 0 20px;">${e(spot)}. You have ${email.spotMinutes} minutes.<br>Show starts at ${e(email.showTime)}.</p>

    <p style="margin:0 0 20px;">${e(email.venue)}<br>${e(email.address)}</p>

    <p style="margin:0 0 20px;">Running order goes up the night of, so turn up ready. Your spot number here is the order you signed up in, not necessarily the order you go on.</p>

    <p style="margin:0 0 20px;">Can't make it? <a href="${e(email.cancelUrl)}" style="color:#87681F;">Release your spot</a> so somebody else can take it.</p>

    <div style="border-top:1px solid #8C8781;margin:24px 0 16px;"></div>
    <p style="margin:0 0 8px;font-size:13px;color:#8C8781;">
      We keep your name, email and Instagram handle on our comedian list so we can get in touch about bookings and shows.
      <a href="${e(email.unsubscribeUrl)}" style="color:#8C8781;">Take yourself off it any time</a>.
    </p>
    <p style="margin:0;font-size:13px;color:#8C8781;">
      Questions, reply to this email or write to <a href="mailto:${e(email.replyTo)}" style="color:#8C8781;">${e(email.replyTo)}</a>.<br>
      Stoned Goose Productions, Olympia WA
    </p>
  </div>
</body></html>`;

  return { text, html };
}

/**
 * Sends the confirmation. Resolves to whether it went, never throws.
 *
 * An unset RESEND_API_KEY is a valid configuration, not a fault: the feature
 * is off, sign ups still work, and the only thing missing is the email. It
 * logs once so the reason is in `wrangler tail` rather than being a mystery.
 */
export async function sendConfirmation(
  email: ConfirmationEmail,
  env: EmailEnv,
): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    console.log("open-mic email: RESEND_API_KEY unset, skipping");
    return false;
  }

  const { text, html } = render(email);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:
          env.OPEN_MIC_FROM_EMAIL ??
          "Log Cabin Open Mic <mic@stonedgooseproductions.com>",
        to: [email.to],
        reply_to: email.replyTo,
        subject: `You have a spot. ${email.dateLabel}, Log Cabin open mic`,
        text,
        html,
        // One-click unsubscribe, so Gmail and Outlook can offer it in their
        // own UI. A comic who uses that instead of the link in the body still
        // comes off the roster, which is the whole point of having it.
        headers: {
          "List-Unsubscribe": `<${email.unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      }),
    });

    if (!response.ok) {
      // The body names the real problem, which is almost always an
      // unverified sending domain. Worth having in the log verbatim.
      console.error(
        `open-mic email: resend ${response.status}`,
        await response.text().catch(() => ""),
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error("open-mic email: send failed", error);
    return false;
  }
}
