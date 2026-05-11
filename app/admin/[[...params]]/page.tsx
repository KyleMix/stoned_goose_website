// Catch-all admin route. Keystatic ships an all-client UI that owns its own
// router. We import it through a "use client" boundary so the React tree
// actually ships to the browser. Without that boundary Next would render
// the page as a server component and the admin shell would hydrate to
// nothing.

import KeystaticAdmin from "./Keystatic.client";

export default function AdminPage() {
  return <KeystaticAdmin />;
}

// Catch-all routes with static export need an empty static params list so the
// browser-side Keystatic router handles every nested path. A Vercel rewrite
// in vercel.json maps /admin/* back to /admin.html so deep links survive a
// reload.
export function generateStaticParams() {
  return [{ params: [] }];
}

export const dynamic = "force-static";
