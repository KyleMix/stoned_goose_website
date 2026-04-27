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
   *  via the matching Zod schema in lib/form-schemas before submission. */
  schema?: FormSchemaName;
  /** Optional react-hook-form default values. */
  defaultValues?: Record<string, string>;
  /** Optional non-validated key/value pairs merged into the formsubmit POST.
   *  Use for hidden routing tags (service, source variants, etc.) without
   *  declaring them in the Zod schema. */
  staticPayload?: Record<string, string>;
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
  schema,
  defaultValues,
  staticPayload,
  children,
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const referrerRef = useRef<HTMLInputElement>(null);

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
  // formsubmit email show where the lead came from.
  useEffect(() => {
    if (referrerRef.current && typeof document !== "undefined") {
      referrerRef.current.value = document.referrer || "";
    }
  }, []);

  async function onSubmit(values: FieldValues) {
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

    // Honeypot: bots fill every field; humans never see this one.
    // formsubmit drops the message when _honey is non-empty.
    if (payload._honey && payload._honey.trim() !== "") {
      setStatus("success");
      methods.reset();
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
          type="text"
          {...methods.register("_honey")}
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
            <p role="status" className="font-body text-sm text-bone/85">
              {successText}
            </p>
          )}
          {status === "error" && (
            <p role="alert" className="font-body text-sm text-hazard">
              {errorText}
            </p>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
