"use client";

import { z } from "zod";

// Inline error copy stays Adult Swim register: short, blunt, no apologies.
// House rule: no em dashes anywhere.

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Use a real email"),
  message: z.string().trim().min(10, "Tell us a bit more"),
  _honey: z.string().optional(),
});

export const quoteSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Use a real email"),
  eventDate: z.string().optional(),
  budget: z.string().optional(),
  notes: z.string().optional(),
  service: z.string().optional(),
  _honey: z.string().optional(),
});

export const generalQuoteSchema = z.object({
  email: z.string().trim().email("Use a real email"),
  serviceType: z.string().trim().min(2, "Service type is required"),
  eventDate: z.string().optional(),
  budget: z.string().optional(),
  venueSize: z.string().optional(),
  service: z.string().optional(),
  _honey: z.string().optional(),
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
  _honey: z.string().optional(),
});

export const sponsorInquirySchema = z.object({
  company: z.string().trim().min(2, "Company is required"),
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Use a real email"),
  notes: z.string().optional(),
  _honey: z.string().optional(),
});

export const sponsorBookingSchema = z.object({
  company: z.string().trim().min(2, "Company is required"),
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Use a real email"),
  tier: z.string().optional(),
  goals: z.string().optional(),
  _honey: z.string().optional(),
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
} as const;

export type FormSchemaName = keyof typeof formSchemas;
