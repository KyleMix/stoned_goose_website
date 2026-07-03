// Guards the hand-maintained RESERVED_SLUGS list against drift: every real
// top-level route folder under app/(site) must be reserved, or an editor
// could create a /[slug] page that silently loses to the static route.
// Run via `npm test`.

import { readdirSync } from "node:fs";
import { join } from "node:path";
import { RESERVED_SLUGS, isReservedSlug } from "../../lib/reserved-slugs";

let failures = 0;

function assert(cond: boolean, message: string) {
  if (cond) return;
  failures += 1;
  console.error(`  ✗ ${message}`);
}

const siteDir = join(process.cwd(), "app", "(site)");
const routeFolders = readdirSync(siteDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  // Private folders (leading underscore) never become routes, and the
  // catch-all is the dynamic page itself.
  .filter((name) => !name.startsWith("_") && !name.startsWith("["));

for (const folder of routeFolders) {
  assert(
    isReservedSlug(folder),
    `app/(site)/${folder} is a live route but "${folder}" is missing from RESERVED_SLUGS`,
  );
}

// Sanity: the list itself stays lowercase so isReservedSlug's toLowerCase
// comparison holds.
for (const slug of RESERVED_SLUGS) {
  assert(slug === slug.toLowerCase(), `RESERVED_SLUGS entry "${slug}" is not lowercase`);
}

if (failures > 0) {
  console.error(`reserved-slugs test: ${failures} failure(s).`);
  process.exit(1);
}
console.log(
  `reserved-slugs test: all ${routeFolders.length} route folders reserved, list well-formed.`,
);
