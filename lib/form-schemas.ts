"use client";

import { z } from "zod";

// Inline error copy stays Adult Swim register: short, blunt, no apologies.
// House rule: no em dashes anywhere.

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Use a real email"),
  message: z.string().trim().min(10, "Tell us a bit more"),
});

export const quoteSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Use a real email"),
  eventDate: z.string().optional(),
  budget: z.string().optional(),
  notes: z.string().optional(),
  service: z.string().optional(),
});

export const generalQuoteSchema = z.object({
  name: z.string().trim().optional(),
  email: z.string().trim().email("Use a real email"),
  serviceType: z.string().trim().min(2, "Service type is required"),
  eventDate: z.string().optional(),
  budget: z.string().optional(),
  venueSize: z.string().optional(),
  service: z.string().optional(),
});

export const submitSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Use a real email"),
  phone: z.string().trim().min(7, "Phone is required"),
  city: z.string().trim().min(2, "City is required"),
  years: z.string().trim().min(1, "Years performing is required"),
  socials: z.string().trim().min(2, "At least one link is required"),
  tape: z.string().trim().url("Paste a valid tape URL"),
  notes: z.string().trim().min(5, "Add a short note"),
});

export const sponsorInquirySchema = z.object({
  company: z.string().trim().min(2, "Company is required"),
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Use a real email"),
  notes: z.string().optional(),
});

export const sponsorBookingSchema = z.object({
  company: z.string().trim().min(2, "Company is required"),
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Use a real email"),
  tier: z.string().optional(),
  goals: z.string().optional(),
});

export const openMicUpdateSchema = z.object({
  micId: z.string(),
  micName: z.string(),
  field: z.enum(["location", "time", "day", "signup", "host", "closed", "other"]),
  correction: z.string().trim().min(2, "Tell us what changed"),
  email: z
    .string()
    .trim()
    .email("Use a real email")
    .or(z.literal("")),
});

export const openMicSubmitSchema = z.object({
  venue: z.string().trim().min(2, "Venue name is required"),
  address: z.string().trim().min(3, "Street address is required"),
  city: z.string().trim().min(2, "City is required"),
  region: z.enum(["WA", "OR"]),
  day: z.enum([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]),
  time: z.string().trim().min(2, "When does it start?"),
  host: z.string().optional(),
  signupUrl: z.string().trim().url("Paste a valid link").or(z.literal("")),
  notes: z.string().optional(),
  email: z.string().trim().email("Use a real email").or(z.literal("")),
});

// Named lookup so server components can pass a string instead of a schema
// instance (Zod objects can't cross the server -> client component boundary).
export const formSchemas = {
  contact: contactSchema,
  quote: quoteSchema,
  generalQuote: generalQuoteSchema,
  submit: submitSchema,
  sponsorInquiry: sponsorInquirySchema,
  sponsorBooking: sponsorBookingSchema,
  openMicUpdate: openMicUpdateSchema,
  openMicSubmit: openMicSubmitSchema,
} as const;

export type FormSchemaName = keyof typeof formSchemas;
