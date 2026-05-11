// Catch-all Keystatic route. Keystatic hardcodes its UI base path to
// /keystatic, so the route has to live here. Mounting it at /admin made
// the client router immediately navigate to /keystatic/... and 404.
//
// Keystatic ships an all-client UI that owns its own router. We import it
// through a "use client" boundary so the React tree actually ships to the
// browser. Without that boundary Next would render the page as a server
// component and the shell would hydrate to nothing.

import KeystaticAdmin from "./Keystatic.client";

export default function KeystaticPage() {
  return <KeystaticAdmin />;
}

// Catch-all routes with static export need an empty static params list so
// the browser-side Keystatic router handles every nested path. A Vercel
// rewrite in vercel.json maps /keystatic/* back to /keystatic so deep
// links survive a reload.
export function generateStaticParams() {
  return [{ params: [] }];
}

export const dynamic = "force-static";
