"use client";

import { type FormEvent, useState } from "react";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";
import { Surface, type SurfaceTone } from "@/components/brand/surface";

type Props = {
  /** Page slug for the formsubmit subject line and Plausible event prop. */
  page: string;
  /** Optional anchor id so pages can deep-link to the signup. */
  id?: string;
  /** Overrides the standing copy when a page is asking for something else. */
  eyebrow?: string;
  /** Overrides the standing copy when a page is asking for something else. */
  headline?: string;
  /** Overrides the button label. */
  submitLabel?: string;
  /** Overrides the line shown after a successful signup. */
  successBody?: string;
};

type Status = "idle" | "loading" | "success" | "error";

// Slim email capture used at the bottom of /, /shows, /watch.
// Posts to the same formsubmit endpoint as the rest of the site so the owner
// gets every signup in their inbox. Honeypot, optional Plausible event.
export function MailingListCapture({
  page,
  id,
  eyebrow = "Stay in the loop",
  headline = "Show announcements, presale codes, and the occasional weird thing.",
  submitLabel = "Sign me up",
  successBody = "You're on the list. See you at the next show.",
  tone = "tuxedo",
}: Props & SurfaceTone) {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload: Record<string, string> = {
      _subject: `Mailing list signup. ${page}`,
      _captcha: "false",
      source: `Mailing list / ${page}`,
      page,
      referrer:
        typeof document !== "undefined" ? document.referrer || "" : "",
    };
    formData.forEach((value, key) => {
      payload[key] = String(value);
    });

    // Honeypot: humans never see _honey; bots fill it.
    const honey = formData.get("_honey");
    if (typeof honey === "string" && honey.trim() !== "") {
      setStatus("success");
      form.reset();
      return;
    }
    delete payload._honey;

    try {
      const response = await fetch(
        `https://formsubmit.co/ajax/${site.contact.email}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) throw new Error("Submission failed");
      setStatus("success");
      form.reset();
      track("Mailing List Signup", { page });
      track("Form Submit", { form: "mailing-list" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <Surface
      tone={tone}
      as="section"
      id={id}
      aria-label="Mailing list signup"
      className="border-y border-smoke py-12 md:py-16"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-5">
            <p className="t-eyebrow">
              {eyebrow}
            </p>
            <p className="mt-3 t-subhead text-2xl leading-tight md:text-3xl">
              {headline}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="md:col-span-7"
            aria-label="Mailing list email capture"
          >
            {status === "success" ? (
              <div
                role="status"
                aria-live="polite"
                className="border-y border-accent-gold py-6 motion-safe:animate-fade-in"
              >
                <p className="t-subhead text-3xl md:text-4xl">
                  Locked <span className="text-accent-gold">in</span>.
                </p>
                <p className="t-body mt-2 text-sm">
                  {successBody}
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-stretch gap-4 md:flex-row md:flex-wrap md:items-end">
                  <label className="flex-1 md:min-w-[220px]">
                    <span className="block t-eyebrow text-smoke">
                      Email
                    </span>
                    <input
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      inputMode="email"
                      placeholder="you@email.com"
                      className="mt-2 block min-h-[48px] w-full bg-transparent border-0 border-b border-smoke px-0 py-3 text-base text-surface-ivory placeholder:text-smoke focus:border-accent-gold focus:outline-none focus:ring-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-gold"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="group inline-flex h-12 w-full shrink-0 items-center justify-center gap-3 bg-accent-gold px-6 t-eyebrow text-surface-tuxedo transition-colors hover:bg-surface-ivory disabled:opacity-50 md:w-auto md:justify-start"
                  >
                    {status === "loading" ? "Sending..." : submitLabel}
                    <span aria-hidden className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </button>
                </div>
                <input
                  type="text"
                  name="_honey"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute left-[-9999px] h-0 w-0 opacity-0"
                />
                <input type="hidden" name="page" value={page} />
                {status === "error" ? (
                  <p
                    role="alert"
                    className="mt-3 t-eyebrow text-smoke"
                  >
                    Something went wrong. Email {site.contact.email} directly.
                  </p>
                ) : (
                  <p className="mt-3 t-eyebrow text-smoke">
                    No spam. Unsubscribe whenever.
                  </p>
                )}
              </>
            )}
          </form>
        </div>
      </div>
    </Surface>
  );
}
