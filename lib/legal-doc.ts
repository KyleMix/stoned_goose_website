// Reader for the two generated legal documents mirrored from the Open Mic
// Explorer app repo (vendor/open-mic-explorer/legal/*.md).
//
// Those files are build output over there: `npm run legal:export` writes them,
// and the terms file is extracted from whichever EULA version the app's
// migrations publish, because the agreement lives in the database and the app
// renders it from that row. If this site and that row disagree, the site is
// showing an agreement nobody accepted. So the rule for this repo is: render
// them, never rewrite them, never fix a typo in them here. Refresh by
// re-fetching. See vendor/open-mic-explorer/README.md.
//
// The parser below is deliberately narrow. It handles exactly the constructs
// the exporter emits today (setext-free h1/h2, hyphen bullets, paragraphs) and
// throws on anything else, naming the file and line. A build failure is the
// correct outcome when the exporter starts emitting a new construct: it means
// someone extends this renderer, rather than the page silently shipping a
// literal "**" to a store reviewer.

import { readFileSync } from "node:fs";
import { join } from "node:path";

export type LegalNode =
  | { kind: "h1"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] };

export type LegalDoc = {
  /** The document's own h1, used as the page title. */
  title: string;
  /** Everything after the h1, in source order. */
  body: LegalNode[];
};

export const LEGAL_SLUGS = ["privacy", "terms"] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

const LEGAL_DIR = join(process.cwd(), "vendor", "open-mic-explorer", "legal");

// Inline markdown the exporter has never emitted. If one shows up, the source
// changed shape and this module needs a real inline parser before the page can
// render it honestly.
const UNSUPPORTED_INLINE: Array<[RegExp, string]> = [
  [/\*\*|__/, "bold"],
  [/\[[^\]]*\]\([^)]*\)/, "a link"],
  [/`/, "code"],
  [/<[a-zA-Z/!]/, "raw HTML"],
];

function assertPlainText(file: string, line: number, text: string) {
  for (const [pattern, name] of UNSUPPORTED_INLINE) {
    if (pattern.test(text)) {
      throw new Error(
        `${file}:${line} uses ${name}, which lib/legal-doc.ts does not render. ` +
          `Extend the renderer. Do not edit the generated document.`,
      );
    }
  }
}

/**
 * Strip the generated-file banner. Both documents open with an HTML comment
 * naming the exporter and the source of truth. It stays in the repo file so the
 * provenance travels with it, and never reaches a visitor.
 */
export function stripBanner(raw: string): string {
  if (!raw.startsWith("<!--")) return raw;
  const end = raw.indexOf("-->");
  if (end === -1) return raw;
  return raw.slice(end + 3).replace(/^\r?\n+/, "");
}

export function parseLegalMarkdown(source: string, file: string): LegalDoc {
  const nodes: LegalNode[] = [];
  const lines = stripBanner(source).split("\n");
  // Line numbers report against the on-disk file, banner included, so an error
  // points at something the reader can actually find.
  const offset = source.split("\n").length - lines.length;

  let paragraph: string[] = [];
  let list: string[] | null = null;

  function flushParagraph() {
    if (paragraph.length === 0) return;
    nodes.push({ kind: "p", text: paragraph.join(" ") });
    paragraph = [];
  }
  function flushList() {
    if (!list) return;
    nodes.push({ kind: "ul", items: list });
    list = null;
  }
  function flush() {
    flushParagraph();
    flushList();
  }

  lines.forEach((rawLine, i) => {
    const lineNo = offset + i + 1;
    const line = rawLine.replace(/\s+$/, "");

    if (line === "") {
      flush();
      return;
    }
    if (line.startsWith("# ")) {
      flush();
      const text = line.slice(2).trim();
      assertPlainText(file, lineNo, text);
      nodes.push({ kind: "h1", text });
      return;
    }
    if (line.startsWith("## ")) {
      flush();
      const text = line.slice(3).trim();
      assertPlainText(file, lineNo, text);
      nodes.push({ kind: "h2", text });
      return;
    }
    if (line.startsWith("- ")) {
      flushParagraph();
      const text = line.slice(2).trim();
      assertPlainText(file, lineNo, text);
      if (!list) list = [];
      list.push(text);
      return;
    }
    if (/^\s/.test(rawLine) && list) {
      // Continuation of the bullet above, which the exporter wraps.
      const text = line.trim();
      assertPlainText(file, lineNo, text);
      list[list.length - 1] = `${list[list.length - 1]} ${text}`;
      return;
    }
    if (/^(#{3,}\s|>|\d+\.\s|```|\||\*\s|\+\s)/.test(line)) {
      throw new Error(
        `${file}:${lineNo} uses a markdown construct lib/legal-doc.ts does not ` +
          `render: "${line.slice(0, 40)}". Extend the renderer. Do not edit the ` +
          `generated document.`,
      );
    }
    flushList();
    assertPlainText(file, lineNo, line);
    paragraph.push(line.trim());
  });

  flush();

  const first = nodes[0];
  if (!first || first.kind !== "h1") {
    throw new Error(`${file} does not open with a single "# " heading.`);
  }
  if (nodes.some((n, i) => i > 0 && n.kind === "h1")) {
    throw new Error(`${file} has more than one h1. The page renders exactly one.`);
  }

  return { title: first.text, body: nodes.slice(1) };
}

export function loadLegalDoc(slug: LegalSlug): LegalDoc {
  const file = join(LEGAL_DIR, `${slug}.md`);
  return parseLegalMarkdown(readFileSync(file, "utf8"), `vendor/open-mic-explorer/legal/${slug}.md`);
}
