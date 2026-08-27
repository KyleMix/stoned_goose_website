"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useFormContext } from "react-hook-form";
import { ContactForm } from "@/components/contact-form";
import { TextField, TextAreaField } from "@/components/form-field";
import { formatFrequency, type OpenMic } from "@/content/open-mics";

const FIELD_OPTIONS: Array<{
  value: "location" | "time" | "day" | "signup" | "host" | "closed" | "other";
  label: string;
  hint: string;
}> = [
  { value: "location", label: "Location / address", hint: "Wrong venue, moved, address typo." },
  { value: "time", label: "Time", hint: "Signup or start time changed." },
  { value: "day", label: "Day of week", hint: "Different day or different week of the month." },
  { value: "signup", label: "Signup method / URL", hint: "New link, new process, in-person only, etc." },
  { value: "host", label: "Host / contact", hint: "Different host, new email." },
  { value: "closed", label: "Mic ended / closed", hint: "Tell us to remove it." },
  { value: "other", label: "Other", hint: "Anything else." },
];

type Props = {
  mic: OpenMic;
};

// Per-mic "report a change" dialog. Reuses the ContactForm pipeline so
// submissions flow through the same formsubmit endpoint and Plausible
// events as the rest of the site. Pre-fills hidden fields with the mic
// id and the current state of every editable field, so the email lands
// in the inbox with full context for the owner.
export function OpenMicUpdateDialog({ mic }: Props) {
  const [open, setOpen] = useState(false);

  const freq = formatFrequency(mic);
  const cadence = freq.detail ? `${freq.label} (${freq.detail})` : freq.label;
  const currentSummary =
    `${mic.name} / ${mic.day} ${mic.time} / ${cadence} / ${mic.address}, ${mic.city}, ${mic.region}`;

  const staticPayload: Record<string, string> = {
    micId: mic.id,
    micName: mic.name,
    currentSnapshot: currentSummary,
  };
  if (mic.signupUrl) staticPayload.currentSignup = mic.signupUrl;
  if (mic.host) staticPayload.currentHost = mic.host;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex h-10 items-center font-body text-[10px] font-normal uppercase tracking-[0.18em] text-surface-ivory/55 hover:text-accent-gold"
        >
          Report change ↗
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-surface-tuxedo/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:data-[state=open]:animate-none" />
        <Dialog.Content
          className="fixed left-1/2 top-[8svh] z-50 max-h-[88svh] w-[min(640px,92vw)] -translate-x-1/2 overflow-y-auto border border-surface-ivory/15 bg-surface-tuxedo p-6 md:p-8"
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="font-body text-[10px] font-normal uppercase tracking-[0.18em] text-accent-gold">
                Report a change
              </p>
              <Dialog.Title asChild>
                <h2 className="mt-3 font-display text-2xl text-surface-ivory md:text-3xl">
                  {mic.name}<span className="text-accent-gold">.</span>
                </h2>
              </Dialog.Title>
              <Dialog.Description asChild>
                <p className="mt-2 font-body text-xs text-surface-ivory/65">
                  Currently mapped as <span className="text-surface-ivory/85">{mic.day} {mic.time}</span>{" "}
                  at {mic.address}, {mic.city}, {mic.region}.
                </p>
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="font-mono text-xs uppercase tracking-[0.18em] text-surface-ivory/55 hover:text-accent-gold"
              >
                ESC
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-6 border-t border-surface-ivory/15 pt-6">
            <ContactForm
              subject={`Open mic update. ${mic.name}`}
              source={`/open-mics / report. ${mic.id}`}
              submitLabel="Send the fix"
              successText="Got it. The crew will review and update the map."
              formName="open-mic-update"
              schema="openMicUpdate"
              defaultValues={{
                micId: mic.id,
                micName: mic.name,
                field: "location",
              }}
              staticPayload={staticPayload}
              successEvents={[
                {
                  name: "Open Mic Update",
                  props: { mic: mic.id, field: "open" },
                },
              ]}
            >
              <input type="hidden" name="micId" value={mic.id} readOnly />
              <input type="hidden" name="micName" value={mic.name} readOnly />
              <FieldGroup />
              <TextAreaField
                id={`${mic.id}-correction`}
                name="correction"
                label="What should it say?"
                required
                rows={4}
                placeholder="The exact corrected info. New time, full address, signup link, whatever."
              />
              <TextField
                id={`${mic.id}-email`}
                name="email"
                label="Your email (optional)"
                type="email"
                autoComplete="email"
                placeholder="So we can ping you back if needed."
              />
            </ContactForm>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Renders the radio group for "what's wrong" inside the ContactForm's
// FormProvider context so react-hook-form picks it up as the `field` value.
function FieldGroup() {
  const ctx = useFormContext();
  const reg = ctx.register("field");

  return (
    <fieldset className="space-y-3">
      <legend className="font-body text-[10px] font-normal uppercase tracking-[0.18em] text-surface-ivory/55">
        What needs updating?
        <span aria-hidden className="ml-1 text-accent-gold">*</span>
      </legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {FIELD_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer items-start gap-3 border border-surface-ivory/15 p-3 transition-colors hover:border-accent-gold/60 has-[:checked]:border-accent-gold has-[:checked]:bg-surface-ivory/[0.04]"
          >
            <input
              type="radio"
              value={opt.value}
              className="mt-1 h-4 w-4 accent-accent-gold"
              {...reg}
            />
            <span className="flex flex-col">
              <span className="font-body text-sm text-surface-ivory">{opt.label}</span>
              <span className="font-body text-[11px] text-surface-ivory/55">{opt.hint}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
