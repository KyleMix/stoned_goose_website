// Catch-all admin route. Keystatic renders its own client-side router under
// /admin/* so this single page handles every nested URL.
//
// The component is a thin re-export of the Keystatic UI page factory, which
// reads keystatic.config.ts at the repo root.

import { makePage } from "@keystatic/next/ui/app";
import keystaticConfig from "@/keystatic.config";

export default makePage(keystaticConfig);

// Catch-all routes with static export need an empty static params list so the
// browser-side Keystatic router handles every nested path.
export function generateStaticParams() {
  return [{ params: [] }];
}

export const dynamic = "force-static";
