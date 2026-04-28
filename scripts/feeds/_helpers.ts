import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { FeedSource } from "../../content/feeds/types";

export const FEEDS_DIR = join(process.cwd(), "content", "feeds");

export function feedPath(source: FeedSource) {
  return join(FEEDS_DIR, `${source}.json`);
}

export function feedErrorLogPath(source: FeedSource) {
  return join(FEEDS_DIR, `${source}.error.log`);
}

export function writeFeed(source: FeedSource, body: object) {
  const path = feedPath(source);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(body, null, 2) + "\n", "utf8");
}

export function writeErrorLog(source: FeedSource, message: string) {
  const path = feedErrorLogPath(source);
  const stamp = new Date().toISOString();
  const line = `[${stamp}] ${message}\n`;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, line, { encoding: "utf8", flag: "a" });
}

export function logFailure(source: FeedSource, message: string) {
  console.warn(`[feeds:${source}] ${message}`);
  writeErrorLog(source, message);
  console.warn(`[feeds:${source}] keeping existing JSON.`);
}
