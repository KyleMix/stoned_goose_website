"use client";

import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";

type SuccessEvent = {
  name: string;
  props?: Record<string, string>;
};

type Props = {
  /** formsubmit.co subject line for the email */
  subject: string;
  /** Optional source tag stored in the payload */
  source: string;
  /** Optional success message */
  successText?: string;
  /** Optional error message */
  errorText?: string;
  /** Submit button label */
  submitLabel: string;
  /** Plausible "Form Submit" prop. e.g. "contact", "quote", "mailing-list". */
  formName?: string;
  /** Additional Plausible events to fire on success. */
  successEvents?: SuccessEvent[];
  /** The form fields to render */
  children: ReactNode;
};

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm({
  subject,
  source,
  successText = "Got it. We'll be in touch shortly.",
  errorText = `Something went wrong. Email ${site.contact.email} and we'll handle it directly.`,
  submitLabel,
  formName,
  successEvents,
  children,
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const referrerRef = useRef<HTMLInputElement>(null);

  // document.referrer is captured client-side once we hydrate. Lets the
  // formsubmit email show where the lead came from.
  useEffect(() => {
    if (referrerRef.current && typeof document !== "undefined") {
      referrerRef.current.value = document.referrer || "";
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload: Record<string, string> = {
      _subject: subject,
      _captcha: "false",
      source,
    };
    formData.forEach((value, key) => {
      payload[key] = String(value);
    });

    // Honeypot: bots fill every field; humans never see this one.
    // formsubmit drops the message when _honey is non-empty.
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

      if (formName) {
        track("Form Submit", { form: formName });
      }
      if (successEvents) {
        for (const evt of successEvents) {
          track(evt.name, evt.props);
        }
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7" noValidate>
      {children}

      <input
        type="text"
        name="_honey"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />
      <input ref={referrerRef} type="hidden" name="referrer" defaultValue="" />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="group inline-flex h-12 items-center gap-3 bg-hazard px-7 font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-bone disabled:opacity-50"
        >
          {status === "loading" ? "Sending..." : submitLabel}
          <span aria-hidden className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </button>

        {status === "success" && (
          <p
            role="status"
            className="font-body text-sm text-bone/85"
          >
            {successText}
          </p>
        )}
        {status === "error" && (
          <p
            role="alert"
            className="font-body text-sm text-hazard"
          >
            {errorText}
          </p>
        )}
      </div>
    </form>
  );
}
