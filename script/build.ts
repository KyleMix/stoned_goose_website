import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

await fs.mkdir(distDir, { recursive: true });

await viteBuild({
  configFile: path.join(rootDir, "vite.config.ts"),
  mode: "production",
});

await esbuild({
  entryPoints: [path.join(rootDir, "server", "index.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node18",
  packages: "external",
  sourcemap: true,
  outfile: path.join(distDir, "index.js"),
});

console.log("Build complete: dist/public and dist/index.js");
