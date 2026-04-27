"use client";

import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";

const baseInputClass =
  "block w-full bg-transparent border-0 border-b border-bone/25 px-0 py-3 font-body text-base text-bone placeholder:text-bone/35 focus:border-hazard focus:outline-none focus:ring-0";

const errorInputClass = "border-hazard";

type LabelProps = {
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
};

export function FieldLabel({ htmlFor, children, required }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/55"
    >
      {children}
      {required && <span aria-hidden className="ml-1 text-hazard">*</span>}
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
      className="min-h-[1rem] font-body text-[11px] font-medium tracking-wide text-hazard"
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
  autoComplete?: string;
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

export function TextField({
  id,
  name,
  label,
  type = "text",
  placeholder,
  required,
  autoComplete,
  defaultValue,
}: TextFieldProps) {
  const ctx = useOptionalFormContext();
  const error = ctx?.formState?.errors?.[name]?.message as string | undefined;
  const errorId = `${id}-error`;
  const reg = ctx?.register?.(name);

  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={ctx ? undefined : defaultValue}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${baseInputClass} ${error ? errorInputClass : ""}`}
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
  rows?: number;
};

export function TextAreaField({
  id,
  name,
  label,
  placeholder,
  required,
  rows = 4,
}: TextAreaFieldProps) {
  const ctx = useOptionalFormContext();
  const error = ctx?.formState?.errors?.[name]?.message as string | undefined;
  const errorId = `${id}-error`;
  const reg = ctx?.register?.(name);

  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <textarea
        id={id}
        placeholder={placeholder}
        rows={rows}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${baseInputClass} resize-none ${error ? errorInputClass : ""}`}
        {...(reg ?? { name, required })}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}
