import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Trim a string to maxLength on a word boundary for meta descriptions.
// SERPs truncate around 155 chars; cutting mid-word reads broken.
export function truncateAtWord(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const slice = text.slice(0, maxLength + 1);
  const lastSpace = slice.lastIndexOf(" ");
  return (
    lastSpace > 0 ? slice.slice(0, lastSpace) : slice.slice(0, maxLength)
  ).replace(/[,.;:]$/, "");
}
