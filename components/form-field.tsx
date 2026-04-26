"use client";

import type { ReactNode } from "react";

const baseInputClass =
  "block w-full bg-transparent border-0 border-b border-bone/25 px-0 py-3 font-body text-base text-bone placeholder:text-bone/35 focus:border-hazard focus:outline-none focus:ring-0";

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
  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        className={baseInputClass}
      />
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
  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <textarea
        id={id}
        name={name}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={`${baseInputClass} resize-none`}
      />
    </div>
  );
}
