// Enforces the one-ring-per-section rule.
//
// The monocle ring is the brand's signature device. At full size on everything
// it stops meaning anything, so the spec caps it at one per page section. A
// comment asking nicely does not survive six months of edits, so this walks
// every TSX file, tracks <section> nesting, and fails the build when a single
// section contains more than one <MonocleRing>.
//
// It also catches a ring rendered outside any section, which is almost always
// a bleed that will anchor to the wrong ancestor.
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["app", "components"];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (extname(path) === ".tsx") out.push(path);
  }
  return out;
}

type Finding = { file: string; line: number; message: string };
const findings: Finding[] = [];

// Tag-level scan. Good enough because both <section> and <MonocleRing> are
// literal tags in this codebase; nothing renders either through a variable.
const TAG = /<(\/?)(section|MonocleRing)\b([^>]*?)(\/?)>/g;

for (const root of ROOTS) {
  for (const file of walk(root)) {
    // The component's own definition and its doc comment are not call sites.
    if (file.endsWith("monocle-ring.tsx")) continue;
    const src = readFileSync(file, "utf8");

    // Depth-tracked walk: each open <section> pushes a counter.
    const stack: { line: number; rings: number }[] = [];
    let ringsOutsideSection = 0;
    let match: RegExpExecArray | null;
    TAG.lastIndex = 0;
    while ((match = TAG.exec(src))) {
      const [, closing, tag, , selfClosing] = match;
      const line = src.slice(0, match.index).split("\n").length;

      if (tag === "section") {
        if (closing) stack.pop();
        else if (!selfClosing) stack.push({ line, rings: 0 });
        continue;
      }

      // MonocleRing. Only count the opening tag.
      if (closing) continue;
      if (stack.length === 0) {
        ringsOutsideSection += 1;
        findings.push({
          file,
          line,
          message: "<MonocleRing> is not inside a <section>. A bleed will anchor to the wrong ancestor.",
        });
        continue;
      }
      const current = stack[stack.length - 1];
      current.rings += 1;
      if (current.rings > 1) {
        findings.push({
          file,
          line,
          message: `second <MonocleRing> in the section opened on line ${current.line}. One ring per section, maximum.`,
        });
      }
    }
    void ringsOutsideSection;
  }
}

if (findings.length) {
  console.error("monocle-ring test: FAILED");
  for (const f of findings) console.error(`  ${f.file}:${f.line}  ${f.message}`);
  process.exit(1);
}
console.log("monocle-ring test: at most one ring per section, none orphaned.");
