/**
 * dist/spa/404/index.html → dist/spa/404.html
 *
 * vite-react-ssg (dirStyle "nested") prerenders the /404 route into a
 * directory. Netlify looks for a top-level 404.html and serves it with a real
 * 404 status for any path that has no file, so move it there and drop the
 * directory (a live /404/ URL would just be a 200 duplicate).
 *
 * Also removes dist/spa/.vite (build manifests that shouldn't be published).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "dist", "spa");
const src = path.join(OUT, "404", "index.html");
const dest = path.join(OUT, "404.html");

if (!fs.existsSync(src)) {
  console.error(`[split-404] ${path.relative(ROOT, src)} not found — was /404 prerendered?`);
  process.exit(1);
}

fs.copyFileSync(src, dest);
fs.rmSync(path.join(OUT, "404"), { recursive: true, force: true });
console.log(`[split-404] wrote ${path.relative(ROOT, dest)}`);

const viteDir = path.join(OUT, ".vite");
if (fs.existsSync(viteDir)) {
  fs.rmSync(viteDir, { recursive: true, force: true });
  console.log("[split-404] removed dist/spa/.vite");
}
