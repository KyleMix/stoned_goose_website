// Single source of truth for site navigation.
//
// The primary nav and the footer link columns both flow through this module so
// they can never drift. Every link is validated against the set of routes that
// actually exist in the app router, so a stale CMS entry can never render a
// dead nav link.
//
// Pro Comedy / calendar decision (Priority 3):
// The /calendar route is currently unpublished. Its page lives at
// app/(site)/_calendar; the leading underscore tells Next.js to skip the
// folder, so /calendar 404s. Per the rule "keep Pro Comedy only if /calendar
// resolves, drop it if that route 404s," the Pro Comedy item is excluded
// everywhere by route validation below. To republish: rename the folder back
// to app/(site)/calendar and add "/calendar" to KNOWN_ROUTES.

import { nav as cmsNav, footer as cmsFooter, type NavLink } from "@/content/site";

// The superset of valid, existing top-level routes. Keep this in sync when
// adding or removing a page under app/(site). Anchor and query suffixes on a
// known route (e.g. /book#sponsors) are allowed.
export const KNOWN_ROUTES = new Set<string>([
  "/",
  "/shows",
  "/open-mics",
  "/watch",
  "/roster",
  "/book",
  "/shop",
  "/contact",
]);

// True when an internal href points at a route that exists. External links
// (mailto:, http(s), tel:) are treated as valid and left untouched.
export function isKnownRoute(href: string): boolean {
  if (/^(https?:|mailto:|tel:)/i.test(href)) return true;
  const path = href.split("#")[0].split("?")[0] || "/";
  return KNOWN_ROUTES.has(path);
}

function validateLinks(links: NavLink[], context: string): NavLink[] {
  const valid: NavLink[] = [];
  for (const link of links) {
    if (isKnownRoute(link.href)) {
      valid.push(link);
    } else if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[navigation] dropping ${context} link to unknown route: ${link.label} (${link.href})`,
      );
    }
  }
  return valid;
}

// Primary navigation, validated. Consumed by the desktop and mobile nav.
export const primaryNav: NavLink[] = validateLinks(cmsNav, "primary nav");

// Footer columns, with each column's links validated the same way so footer
// and header share one route-truth and one validation pass.
export const footerColumns = cmsFooter.columns.map((col) => ({
  ...col,
  items: validateLinks(col.items, `footer:${col.heading}`),
}));
