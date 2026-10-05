/**
 * CI gate: every route in dist/route-manifest.json must exist as a physical
 * index.html in dist/spa AND contain a rendered <h1> inside #root, i.e. real
 * server-rendered content — not an empty SPA shell. Also checks that
 * netlify.toml keeps every site section un-frameable while /embed/* stays
 * frameable (see below). Fails the build otherwise.
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

for (const required of ["sitemap.xml", "robots.txt", "llms.txt", "rss.xml", "404.html", "bloom-status.json"]) {
  if (!fs.existsSync(path.join(OUT, required))) failures.push(`missing dist/spa/${required}`);
}

/* ---------------------------------------------------------------------------
 * Framing guard (netlify.toml). Netlify header rules are additive, so the
 * site's X-Frame-Options: SAMEORIGIN is set per top-level section instead of
 * on "/*" — that is what lets /embed/* be iframed by other sites. A new
 * top-level section without its own rule would silently become frameable, so
 * fail the build when that happens (and when /embed/* loses frameability).
 * ------------------------------------------------------------------------- */
function headerRules(toml) {
  return toml
    .split(/^\[\[headers\]\]\s*$/m)
    .slice(1)
    .map((block) => {
      const body = block.split(/^\[\[(?!headers\.)/m)[0];
      const forMatch = /^\s*for\s*=\s*"([^"]+)"/m.exec(body);
      return {
        for: forMatch ? forMatch[1] : null,
        xfo: /^\s*X-Frame-Options\s*=/mi.test(body),
        frameAncestors: /frame-ancestors/i.test(body),
        cors: /^\s*Access-Control-Allow-Origin\s*=\s*"\*"/mi.test(body),
      };
    })
    .filter((r) => r.for);
}

/** Netlify-style path match: trailing "*" is a prefix wildcard; otherwise exact (trailing slash optional). */
function ruleMatches(pattern, urlPath) {
  if (pattern.endsWith("*")) return urlPath.startsWith(pattern.slice(0, -1));
  const strip = (p) => (p.length > 1 ? p.replace(/\/$/, "") : p);
  return strip(pattern) === strip(urlPath);
}

function containsIndexHtml(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name === "index.html") return true;
    if (entry.isDirectory() && containsIndexHtml(path.join(dir, entry.name))) return true;
  }
  return false;
}

const tomlPath = path.join(ROOT, "netlify.toml");
if (fs.existsSync(tomlPath)) {
  const rules = headerRules(fs.readFileSync(tomlPath, "utf8"));
  const protectedBy = (urlPath) => rules.some((r) => (r.xfo || r.frameAncestors) && ruleMatches(r.for, urlPath));

  const sections = fs
    .readdirSync(OUT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== "embed" && containsIndexHtml(path.join(OUT, e.name)))
    .map((e) => `/${e.name}/`);
  for (const section of ["/", ...sections]) {
    if (!protectedBy(section)) {
      failures.push(
        `netlify.toml: no X-Frame-Options rule covers ${section} — add a [[headers]] block for "${section === "/" ? "/" : `${section}*`}" (see the framing comment in netlify.toml)`,
      );
    }
  }
  for (const { path: route } of routes) {
    if (route.startsWith("/embed/") && protectedBy(route)) {
      failures.push(`netlify.toml: ${route} is covered by an X-Frame-Options / frame-ancestors rule, so other sites can't embed it`);
    }
  }
  if (!rules.some((r) => r.cors && ruleMatches(r.for, "/bloom-status.json"))) {
    failures.push('netlify.toml: /bloom-status.json needs Access-Control-Allow-Origin = "*" for the bloom-tracker JSON snippet');
  }
}

if (failures.length) {
  console.error(`[assert-prerendered] FAILED (${failures.length}):\n  ${failures.join("\n  ")}`);
  process.exit(1);
}

console.log(`[assert-prerendered] OK — ${checked.length} routes prerendered with <h1> inside #root`);
