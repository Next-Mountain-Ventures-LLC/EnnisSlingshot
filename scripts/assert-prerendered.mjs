/**
 * CI gate: every route in dist/route-manifest.json must exist as a physical
 * index.html in dist/spa AND contain a rendered <h1> inside #root, i.e. real
 * server-rendered content — not an empty SPA shell. Fails the build otherwise.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "dist", "spa");
const MANIFEST = path.join(ROOT, "dist", "route-manifest.json");

if (!fs.existsSync(MANIFEST)) {
  console.error("[assert-prerendered] dist/route-manifest.json missing — run scripts/generate-seo-files.ts first.");
  process.exit(1);
}

const { routes } = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));

function fileForRoute(route) {
  if (route === "/404") return path.join(OUT, "404.html");
  const rel = route.replace(/^\//, "");
  return path.join(OUT, rel, "index.html");
}

function rootInnerHtml(html) {
  const m = /<div id="root"[^>]*>([\s\S]*?)<\/div>\s*<script>/.exec(html);
  if (m) return m[1];
  const start = html.indexOf('<div id="root"');
  return start === -1 ? "" : html.slice(start);
}

const failures = [];
const checked = [];

for (const { path: route } of routes) {
  const file = fileForRoute(route);
  if (!fs.existsSync(file)) {
    failures.push(`${route} → missing ${path.relative(ROOT, file)}`);
    continue;
  }
  const html = fs.readFileSync(file, "utf8");
  if (!/data-server-rendered="true"/.test(html)) {
    failures.push(`${route} → not server-rendered (no data-server-rendered marker)`);
    continue;
  }
  const inner = rootInnerHtml(html);
  if (!/<h1[\s>]/i.test(inner)) {
    failures.push(`${route} → no <h1> inside #root`);
    continue;
  }
  if (!/<title[^>]*>[^<]+<\/title>/i.test(html)) {
    failures.push(`${route} → empty or missing <title>`);
    continue;
  }
  checked.push(route);
}

for (const required of ["sitemap.xml", "robots.txt", "llms.txt", "404.html"]) {
  if (!fs.existsSync(path.join(OUT, required))) failures.push(`missing dist/spa/${required}`);
}

if (failures.length) {
  console.error(`[assert-prerendered] FAILED (${failures.length}):\n  ${failures.join("\n  ")}`);
  process.exit(1);
}

console.log(`[assert-prerendered] OK — ${checked.length} routes prerendered with <h1> inside #root`);
