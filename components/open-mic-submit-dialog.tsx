"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useFormContext } from "react-hook-form";
import { ContactForm } from "@/components/contact-form";
import { TextField, TextAreaField, FieldLabel } from "@/components/form-field";

const DAY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
  { value: "Sunday", label: "Sunday" },
];

const REGION_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "WA", label: "Washington" },
  { value: "OR", label: "Oregon" },
];

type Props = {
  /** Text rendered inside the trigger button. */
  triggerLabel: string;
  /** Classes applied to the trigger button so callers control its look. */
  triggerClassName?: string;
};

// Submit-a-new-mic dialog. Reuses the ContactForm pipeline so submissions flow
// through the same formsubmit endpoint and Plausible events as the rest of the
// site. Unlike the per-mic update dialog, this has no mic context: the user
// supplies every field. The crew geocodes lat/long later, so coordinates are
// intentionally left out.
export function OpenMicSubmitDialog({ triggerLabel, triggerClassName }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className={triggerClassName}>
          {triggerLabel}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:data-[state=open]:animate-none" />
        <Dialog.Content className="fixed left-1/2 top-[8svh] z-50 max-h-[88svh] w-[min(640px,92vw)] -translate-x-1/2 overflow-y-auto border border-bone/15 bg-ink p-6 shadow-2xl md:p-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-slime">
                Add to the map
              </p>
              <Dialog.Title asChild>
                <h2 className="mt-3 font-display text-2xl text-bone md:text-3xl">
                  Submit a mic<span className="text-slime">.</span>
                </h2>
              </Dialog.Title>
              <Dialog.Description asChild>
                <p className="mt-2 font-body text-xs text-bone/65">
                  The crew verifies before it lands on the map. Skip the
                  coordinates, we&apos;ll geocode it from the address.
                </p>
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="font-mono text-xs uppercase tracking-[0.18em] text-bone/55 hover:text-slime"
              >
                ESC
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-6 border-t border-bone/15 pt-6">
            <ContactForm
              subject="New open mic submission"
              source="/open-mics / submit"
              submitLabel="Add the mic"
              successText="Got it. The crew will verify and map it."
              formName="open-mic-submit"
              schema="openMicSubmit"
              defaultValues={{ region: "WA", day: "Monday" }}
              successEvents={[
                { name: "Open Mic Submit", props: { source: "open-mics" } },
              ]}
            >
              <TextField
                id="submit-venue"
                name="venue"
                label="Venue / mic name"
                required
                placeholder="The bar, club, or room it runs in."
              />
              <TextField
                id="submit-address"
                name="address"
                label="Street address"
                required
                autoComplete="street-address"
                placeholder="Number and street."
              />
              <div className="grid gap-6 sm:grid-cols-2">
                <TextField
                  id="submit-city"
                  name="city"
                  label="City"
                  required
                  autoComplete="address-level2"
                />
                <RegionGroup />
              </div>
              <DayGroup />
              <TextField
                id="submit-time"
                name="time"
                label="Start time"
                required
                placeholder="Signup 7, mic 7:30."
              />
              <TextField
                id="submit-host"
                name="host"
                label="Host (optional)"
                placeholder="Who runs it."
              />
              <TextField
                id="submit-signup"
                name="signupUrl"
                label="Signup link (optional)"
                type="url"
                placeholder="Sheet, form, or page."
              />
              <TextAreaField
                id="submit-notes"
                name="notes"
                label="Anything else (optional)"
                rows={3}
                placeholder="House rules, set length, cover, the vibe."
              />
              <TextField
                id="submit-email"
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

// Renders the region radio group inside the ContactForm's FormProvider context
// so react-hook-form picks it up as the `region` value.
function RegionGroup() {
  const ctx = useFormContext();
  const reg = ctx.register("region");

  return (
    <fieldset className="space-y-3">
      <FieldLabel htmlFor="region" required>
        Region
      </FieldLabel>
      <div className="grid grid-cols-2 gap-2">
        {REGION_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer items-center gap-3 border border-bone/15 p-3 transition-colors hover:border-slime/60 has-[:checked]:border-hazard has-[:checked]:bg-bone/[0.04]"
          >
            <input
              type="radio"
              value={opt.value}
              className="h-4 w-4 accent-hazard"
              {...reg}
            />
            <span className="font-body text-sm text-bone">{opt.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// Renders the day-of-week radio group inside the FormProvider context so
// react-hook-form picks it up as the `day` value.
function DayGroup() {
  const ctx = useFormContext();
  const reg = ctx.register("day");

  return (
    <fieldset className="space-y-3">
      <FieldLabel htmlFor="day" required>
        Day of week
      </FieldLabel>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {DAY_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer items-center gap-3 border border-bone/15 p-3 transition-colors hover:border-slime/60 has-[:checked]:border-hazard has-[:checked]:bg-bone/[0.04]"
          >
            <input
              type="radio"
              value={opt.value}
              className="h-4 w-4 accent-hazard"
              {...reg}
            />
            <span className="font-body text-sm text-bone">{opt.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
