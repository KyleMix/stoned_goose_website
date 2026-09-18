"use client";

import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";

// min-h-[48px] guarantees a 48px tap target on mobile per WCAG / Apple HIG.
// text-base prevents iOS Safari's auto-zoom on focus (16px+ disables it).
// Keyboard focus keeps a visible gold outline (the border-color shift
// alone is too subtle to satisfy WCAG focus visibility).
const baseInputClass =
  "block w-full min-h-[48px] bg-transparent border-0 border-b border-smoke px-0 py-3 text-base text-surface-ivory placeholder:text-smoke focus:border-accent-gold focus:outline-none focus:ring-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-gold";

const errorInputClass = "border-accent-gold";

type LabelProps = {
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
  /** Marks the field "(optional)" in the label. */
  optional?: boolean;
};

// Baymard's finding is that marking only one side leaves people guessing about
// the other, so a form that marks required fields marks optional ones too. The
// asterisk is decorative: the real signal to assistive tech is the input's own
// `required` attribute, which TextField/TextAreaField set.
export function FieldLabel({ htmlFor, children, required, optional }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className="t-ui text-smoke">
      {children}
      {required && <span aria-hidden className="ml-1 text-accent-gold">*</span>}
      {optional && <span className="ml-2 normal-case tracking-normal">(optional)</span>}
    </label>
  );
}

// Reserved space under each input for inline error text. Keeps the layout
// stable so the form doesn't shift vertically when validation flips on.
function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <p
      id={id}
      role={message ? "alert" : undefined}
      className="min-h-[1rem] text-[11px] font-normal tracking-wide text-accent-gold"
    >
      {message ?? ""}
    </p>
  );
}

export type TextFieldProps = {
  id: string;
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "url" | "date";
  placeholder?: string;
  required?: boolean;
  /** Renders "(optional)" in the label. Purely a labelling hint. */
  optional?: boolean;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric" | "decimal" | "search" | "url";
  defaultValue?: string;
};

// Pulls register/errors from react-hook-form context when present. When the
// form isn't wrapped in a FormProvider, falls back to an uncontrolled input
// so legacy callers keep working.
function useOptionalFormContext() {
  try {
    return useFormContext();
  } catch {
    return null;
  }
}

// Map input type to a sensible inputMode default so mobile keyboards land on
// the right glyph set without each caller having to remember.
function defaultInputMode(type: TextFieldProps["type"]): TextFieldProps["inputMode"] {
  switch (type) {
    case "email":
      return "email";
    case "tel":
      return "tel";
    case "url":
      return "url";
    default:
      return undefined;
  }
}

export function TextField({
  id,
  name,
  label,
  type = "text",
  placeholder,
  required,
  optional,
  autoComplete,
  inputMode,
  defaultValue,
}: TextFieldProps) {
  const ctx = useOptionalFormContext();
  const error = ctx?.formState?.errors?.[name]?.message as string | undefined;
  const errorId = `${id}-error`;
  const reg = ctx?.register?.(name);
  const resolvedInputMode = inputMode ?? defaultInputMode(type);

  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={id} required={required} optional={optional}>
        {label}
      </FieldLabel>
      <input
        id={id}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={resolvedInputMode}
        defaultValue={ctx ? undefined : defaultValue}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${baseInputClass} ${error ? errorInputClass :""}`}
        {...(reg ?? { name, required })}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}

export type TextAreaFieldProps = {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  /** Renders "(optional)" in the label. Purely a labelling hint. */
  optional?: boolean;
  rows?: number;
};

export function TextAreaField({
  id,
  name,
  label,
  placeholder,
  required,
  optional,
  rows = 4,
}: TextAreaFieldProps) {
  const ctx = useOptionalFormContext();
  const error = ctx?.formState?.errors?.[name]?.message as string | undefined;
  const errorId = `${id}-error`;
  const reg = ctx?.register?.(name);

  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={id} required={required} optional={optional}>
        {label}
      </FieldLabel>
      <textarea
        id={id}
        placeholder={placeholder}
        required={required}
        rows={rows}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${baseInputClass} resize-none ${error ? errorInputClass :""}`}
        {...(reg ?? { name, required })}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}
