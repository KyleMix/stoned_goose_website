import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

function loadEnv(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf-8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (!key || process.env[key] !== undefined) continue;
    process.env[key] = rest.join("=");
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");

loadEnv(path.join(rootDir, ".env"));
loadEnv(path.join(rootDir, ".env.local"));

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const publicDir = path.join(__dirname, "../dist/public");
app.use(express.static(publicDir));
app.get("*", (_req, res, next) => {
  if (publicDir && !publicDir.includes("dist")) return next();
  return res.sendFile(path.join(publicDir, "index.html"), (err) => {
    if (err) {
      next();
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  if (process.env.DEBUG_KEEP_ALIVE !== "false") {
    console.log("Debug: keeping process alive (process.stdin.resume())");
    process.stdin.resume();
  }
});
