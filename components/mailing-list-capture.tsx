"use client";

import { type FormEvent, useRef, useState } from "react";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";

type Props = {
  /** Page slug for the formsubmit subject line and Plausible event prop. */
  page: string;
};

type Status = "idle" | "loading" | "success" | "error";

// Slim email capture used at the bottom of /, /shows, /watch.
// Posts to the same formsubmit endpoint as the rest of the site so the owner
// gets every signup in their inbox. Honeypot, optional Plausible event.
export function MailingListCapture({ page }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const referrerRef = useRef<HTMLInputElement>(null);

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

    if (payload._honey && payload._honey.trim() !== "") {
      setStatus("success");
      form.reset();
      return;
    }

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
    <section
      aria-label="Mailing list signup"
      className="border-y border-bone/10 bg-ink py-12 md:py-16"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-5">
            <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
              Stay in the loop
            </p>
            <p className="mt-3 font-display text-2xl leading-tight text-bone md:text-3xl">
              Show announcements, presale codes, and the occasional weird thing.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="md:col-span-7"
            aria-label="Mailing list email capture"
          >
            <div className="flex flex-col items-stretch gap-4 md:flex-row md:flex-wrap md:items-end">
              <label className="flex-1 md:min-w-[220px]">
                <span className="block font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/55">
                  Email
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@email.com"
                  className="mt-2 block min-h-[48px] w-full bg-transparent border-0 border-b border-bone/25 px-0 py-3 font-body text-base text-bone placeholder:text-bone/35 focus:border-hazard focus:outline-none focus:ring-0"
                />
              </label>
              <button
                type="submit"
                disabled={status === "loading"}
                className="group inline-flex h-12 w-full shrink-0 items-center justify-center gap-3 bg-hazard px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-bone disabled:opacity-50 md:w-auto md:justify-start"
              >
                {status === "loading" ? "Sending..." : "Sign me up"}
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
            <input ref={referrerRef} type="hidden" name="referrer" defaultValue="" />
            <input type="hidden" name="page" value={page} />
            <p className="mt-3 font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/55">
              {status === "success"
                ? "You're on the list. See you at the next show."
                : status === "error"
                  ? `Something went wrong. Email ${site.contact.email} directly.`
                  : "No spam. Unsubscribe whenever."}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
