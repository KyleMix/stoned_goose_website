// Contact page shim. Reads the Keystatic-managed JSON for /contact copy and
// falls back to the strings that used to live in the page component so the
// site keeps rendering before the first save.

import data from "./contact-copy/index.json";

export type ContactCopy = {
  eyebrow: string;
  titleLead: string;
  titleEmphasis: string;
  body: string;
  emailLabel: string;
  phoneLabel: string;
  textCtaLabel: string;
  whatsappCtaLabel: string;
  findUsLabel: string;
  form: {
    submitLabel: string;
    successText: string;
    errorText: string;
    nameLabel: string;
    emailLabel: string;
    messageLabel: string;
    messagePlaceholder: string;
  };
};

const DEFAULT: ContactCopy = {
  eyebrow: "Direct Line",
  titleLead: "We want to",
  titleEmphasis: "work with you",
  body: "Booking, partnerships, or just want to start a conversation?",
  emailLabel: "Email",
  phoneLabel: "Phone",
  textCtaLabel: "Text us",
  whatsappCtaLabel: "WhatsApp",
  findUsLabel: "Find us",
  form: {
    submitLabel: "Let's Talk",
    successText: "Message sent! We'll get back to you soon.",
    errorText: "Something went wrong. Please try again shortly.",
    nameLabel: "Name",
    emailLabel: "Email",
    messageLabel: "Message",
    messagePlaceholder: "Tell us what you're putting together.",
  },
};

const raw = data as Partial<ContactCopy> & { form?: Partial<ContactCopy["form"]> };

export const contactCopy: ContactCopy = {
  eyebrow: raw.eyebrow || DEFAULT.eyebrow,
  titleLead: raw.titleLead || DEFAULT.titleLead,
  titleEmphasis: raw.titleEmphasis || DEFAULT.titleEmphasis,
  body: raw.body || DEFAULT.body,
  emailLabel: raw.emailLabel || DEFAULT.emailLabel,
  phoneLabel: raw.phoneLabel || DEFAULT.phoneLabel,
  textCtaLabel: raw.textCtaLabel || DEFAULT.textCtaLabel,
  whatsappCtaLabel: raw.whatsappCtaLabel || DEFAULT.whatsappCtaLabel,
  findUsLabel: raw.findUsLabel || DEFAULT.findUsLabel,
  form: {
    submitLabel: raw.form?.submitLabel || DEFAULT.form.submitLabel,
    successText: raw.form?.successText || DEFAULT.form.successText,
    errorText: raw.form?.errorText || DEFAULT.form.errorText,
    nameLabel: raw.form?.nameLabel || DEFAULT.form.nameLabel,
    emailLabel: raw.form?.emailLabel || DEFAULT.form.emailLabel,
    messageLabel: raw.form?.messageLabel || DEFAULT.form.messageLabel,
    messagePlaceholder: raw.form?.messagePlaceholder || DEFAULT.form.messagePlaceholder,
  },
};
