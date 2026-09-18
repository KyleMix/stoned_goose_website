"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { FormProvider, useForm, type FieldValues, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";
import { formSchemas, type FormSchemaName } from "@/lib/form-schemas";

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
  /** Named validation schema. When set, react-hook-form validates fields
   * via the matching Zod schema in lib/form-schemas before submission. */
  schema?: FormSchemaName;
  /** Optional react-hook-form default values. */
  defaultValues?: Record<string, string>;
  /** Optional non-validated key/value pairs merged into the formsubmit POST.
   * Use for hidden routing tags (service, source variants, etc.) without
   * declaring them in the Zod schema. */
  staticPayload?: Record<string, string>;
  /** The form fields to render */
  children: ReactNode;
};

type Status = "idle" | "loading" | "success" | "error";

// Spam protection, and why it is what it is.
//
// Cloudflare Turnstile is not available to this site. Turnstile requires a
// server-side siteverify call and Cloudflare publishes no static-site
// exemption; this is a Next.js static export deployed as Workers Static
// Assets, with no server runtime to make that call from. Adding one means
// adding a Worker, which is a bigger decision than a form field.
//
// So: two passive checks, neither of which costs a real visitor anything.
//   1. A honeypot input, offscreen and aria-hidden. Bots fill every field.
//   2. A time trap. The clock starts when the form mounts, and a submission
//      that arrives faster than a person could plausibly read four labels and
//      type an answer is treated as automated.
// Both fail silently into the success state rather than showing an error,
// because telling a bot which check caught it just teaches the next one.
const MIN_FILL_MS = 2500;

export function ContactForm({
  subject,
  source,
  successText = "Got it. We read every one of these. You'll hear back within two business days.",
  errorText = "That didn't send. Email us and we'll pick it up there:",
  submitLabel,
  formName,
  successEvents,
  schema,
  defaultValues,
  staticPayload,
  children,
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const referrerRef = useRef<HTMLInputElement>(null);
  const honeyRef = useRef<HTMLInputElement>(null);
  const mountedAtRef = useRef<number>(0);

  const resolvedSchema = schema ? formSchemas[schema] : undefined;

  const methods = useForm<FieldValues>({
    mode: "onTouched",
    defaultValues,
    // Cast through unknown so the generic Zod schema type lines up with RHF's
    // narrow Resolver<FieldValues> signature without forcing per-form generics.
    resolver: resolvedSchema
      ? (zodResolver(resolvedSchema as never) as unknown as Resolver<FieldValues>)
      : undefined,
  });

  // document.referrer is captured client-side once we hydrate. Lets the
  // formsubmit email show where the lead came from. The same pass starts the
  // time trap's clock: hydration is the earliest moment a human could have
  // interacted with the form.
  useEffect(() => {
    if (referrerRef.current && typeof document !== "undefined") {
      referrerRef.current.value = document.referrer || "";
    }
    mountedAtRef.current = Date.now();
  }, []);

  async function onSubmit(values: FieldValues) {
    // Honeypot lives outside the Zod schema so RHF doesn't strip it during
    // validation. Bots fill every field; humans never see this input.
    const honey = honeyRef.current?.value ?? "";
    const tooFast =
      mountedAtRef.current > 0 && Date.now() - mountedAtRef.current < MIN_FILL_MS;

    if (honey.trim() !== "" || tooFast) {
      // Report success and send nothing. See MIN_FILL_MS above.
      setStatus("success");
      methods.reset();
      return;
    }

    setStatus("loading");

    const payload: Record<string, string> = {
      _subject: subject,
      _captcha: "false",
      source,
      referrer: referrerRef.current?.value ?? "",
      ...(staticPayload ?? {}),
    };
    for (const [key, value] of Object.entries(values)) {
      if (value == null) continue;
      payload[key] = String(value);
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
      methods.reset();

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
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-7"
        noValidate
      >
        {children}

        <input
          ref={honeyRef}
          type="text"
          name="_honey"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />
        <input ref={referrerRef} type="hidden" name="referrer" defaultValue="" />

        <div className="flex flex-col items-stretch gap-3 pt-2 md:flex-row md:flex-wrap md:items-center md:gap-x-6 md:gap-y-3">
          <button
            type="submit"
            disabled={status === "loading"}
            className="group inline-flex h-12 w-full items-center justify-center gap-3 bg-accent-gold px-7 t-ui text-surface-tuxedo transition-colors hover:bg-surface-ivory disabled:opacity-50 md:w-auto md:justify-start"
          >
            {status === "loading" ? "Sending..." : submitLabel}
            <span aria-hidden className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </button>

          {status === "success" && (
            <p role="status" className="text-sm text-surface-ivory">
              {successText}
            </p>
          )}
          {status === "error" && (
            <p role="alert" className="text-sm text-accent-gold">
              {errorText}{" "}
              <a
                href={`mailto:${site.contact.email}`}
                className="underline underline-offset-4"
              >
                {site.contact.email}
              </a>
            </p>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
