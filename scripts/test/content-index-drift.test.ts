// The committed collection indexes must match what the source content
// produces.
//
// content/.generated/*-index.json is a pure function of the CMS collection
// directories, rebuilt by build-content-index.ts in prebuild. It is committed
// so a fresh clone can typecheck and `next dev` can boot, not because the
// deploy depends on it: prebuild regenerates it before next build, and `dev`
// regenerates it before next dev.
//
// That makes drift quiet rather than dangerous, and quiet is the problem. The
// CMS writes to content/<collection>/ directly and never runs the generator,
// so a delete or an edit made in /admin leaves the index behind. From then on
// every build and every `npm run dev` rewrites the file, so the working tree
// is dirty before anyone has typed anything, and `content/.generated/` becomes
// a directory people stage without reading. That habit is what turns a real
// bad write into a committed one.
//
// This ran red on the first attempt: five Portland open mics deleted through
// the CMS in 8baa3a0 were still sitting in the committed index seven weeks
// later.
//
// Regenerates into a temp directory and compares, so the working tree is never
// touched.
//
// Run: npm test

import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = process.cwd();
const COMMITTED_DIR = join(ROOT, "content", ".generated");

const failures: string[] = [];
let checked = 0;

const outDir = mkdtempSync(join(tmpdir(), "content-index-"));

try {
  execFileSync("npx", ["tsx", "scripts/build-content-index.ts"], {
    cwd: ROOT,
    env: { ...process.env, CONTENT_INDEX_OUT_DIR: outDir },
    stdio: "pipe",
  });

  const generated = readdirSync(outDir).filter((f) => f.endsWith("-index.json"));

  if (generated.length === 0) {
    failures.push("the generator produced no index files at all");
  }

  for (const file of generated) {
    checked += 1;
    const fresh = readFileSync(join(outDir, file), "utf8");

    let committed: string;
    try {
      committed = readFileSync(join(COMMITTED_DIR, file), "utf8");
    } catch {
      failures.push(
        `${file} is generated but not committed. Run \`npm run content:index\` and commit it.`,
      );
      continue;
    }

    if (fresh === committed) continue;

    // Report in the terms someone can act on: which entries moved, not a
    // byte offset.
    const ids = (raw: string): Set<string> => {
      try {
        const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
        return new Set(
          parsed.map(
            (e, i) => String(e.slug ?? e.id ?? `#${i}`),
          ),
        );
      } catch {
        return new Set();
      }
    };
    const committedIds = ids(committed);
    const freshIds = ids(fresh);
    const stale = [...committedIds].filter((k) => !freshIds.has(k));
    const missing = [...freshIds].filter((k) => !committedIds.has(k));

    const detail: string[] = [];
    if (stale.length > 0) {
      detail.push(`in the index but no longer in the source: ${stale.join(", ")}`);
    }
    if (missing.length > 0) {
      detail.push(`in the source but not in the index: ${missing.join(", ")}`);
    }
    if (detail.length === 0) {
      detail.push("same entries, but a field or the ordering differs");
    }

    failures.push(
      `${file} is stale.\n      ${detail.join("\n      ")}\n` +
        `      Fix: npm run content:index, then commit content/.generated/${file}`,
    );
  }
} finally {
  rmSync(outDir, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error(
    `\ncontent index drift test: ${failures.length} of ${checked} indexes stale\n`,
  );
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}

console.log(
  `content index drift test: all ${checked} committed indexes match their source.`,
);
