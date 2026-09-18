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
// known route (e.g. /#contact) are allowed.
export const KNOWN_ROUTES = new Set<string>([
  "/",
  "/shows",
  // /open-mics is the Log Cabin Monday mic, and nothing else. It used to hold
  // the Pacific Northwest map, then the Open Mic Explorer app announcement.
  // The map is retired and the app is dead, so the /open-mics/map,
  // /open-mics/privacy, /open-mics/terms and /open-mics/delete-account routes
  // are all gone with them.
  "/open-mics",
  "/watch",
  "/about",
  "/book",
  "/sponsor",
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
//
// "Book us" is deliberately absent: the header renders it as the one gold
// button rather than a fifth peer link, so it cannot be edited into the middle
// of the row from the CMS.
export const primaryNav: NavLink[] = validateLinks(cmsNav, "primary nav");

// Links the mobile panel carries below the primary ones. They are footer-level
// on desktop, but a phone has no footer in reach, so the panel lists them too.
//
// Anything the CMS has already put in the primary nav drops out here, because
// the panel renders both lists in sequence and Shop, which moved up into the
// header, would otherwise appear twice. The list is empty as things stand, and
// it stays so the next footer-level link has somewhere to go.
const SECONDARY_LINKS: NavLink[] = [{ label: "Shop", href: "/shop" }];

export const secondaryNav: NavLink[] = validateLinks(
  SECONDARY_LINKS.filter(
    (link) => !primaryNav.some((item) => item.href === link.href),
  ),
  "secondary nav",
);

// Footer columns, with each column's links validated the same way so footer
// and header share one route-truth and one validation pass.
export const footerColumns = cmsFooter.columns.map((col) => ({
  ...col,
  items: validateLinks(col.items, `footer:${col.heading}`),
}));
