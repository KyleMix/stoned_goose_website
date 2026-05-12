import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Keystatic's fields.image stores just the filename in JSON; the schema's
// publicPath supplies the directory prefix at read time. Older entries can
// hold a full /images/... path (or an absolute URL), so the shim that
// reconstructs the public URL must not double-prefix in those cases.
export function resolvePublicAsset(dir: string, value: string | null | undefined): string | null {
  if (!value) return null;
  if (/^(https?:)?\//.test(value)) return value;
  return dir + value;
}
