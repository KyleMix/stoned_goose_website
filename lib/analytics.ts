// Thin wrapper around the optional Plausible analytics script.
// No-op when Plausible isn't loaded, so call sites stay clean even if the
// NEXT_PUBLIC_PLAUSIBLE_DOMAIN env var is unset.
type PlausibleOptions = {
  props?: Record<string, string | number | boolean>;
};

declare global {
  interface Window {
    plausible?: (event: string, options?: PlausibleOptions) => void;
  }
}

export function track(event: string, props?: PlausibleOptions["props"]) {
  if (typeof window === "undefined") return;
  if (typeof window.plausible !== "function") return;
  if (props) window.plausible(event, { props });
  else window.plausible(event);
}
