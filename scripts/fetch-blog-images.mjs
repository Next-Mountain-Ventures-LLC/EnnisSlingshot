/**
 * prebuild: download each published post's remote `heroImage` into
 * public/blog-images/<postId>.webp so the page serves a same-origin,
 * recompressed hero (client/lib/blogImages.ts resolveHeroImage()).
 *
 * - Recompresses to WebP (max 1600px wide, q80) when `sharp` is installed;
 *   otherwise copies the bytes as-is under the .webp name only if the source
 *   already is WebP, else keeps the source extension.
 * - Skips posts whose file already exists (the directory is gitignored, so a
 *   fresh CI checkout re-fetches everything once).
 * - NEVER fails the build: every fetch error is logged and the post falls
 *   back to the remote URL at render time.
 * - Always (re)writes public/blog-images/manifest.json = { "<key>": "/blog-images/<file>" }
 *   listing every image present; client/lib/blogImages.ts reads that (a
 *   glob import, so a missing manifest in `pnpm dev` is simply "no local
 *   images"), which keeps the SSR and client bundles agreeing on the URL.
 *
 * Dependency-free frontmatter reader (no tsx / js-yaml) so this can run as
 * the very first build step.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BLOG_DIR = path.join(ROOT, "client", "content", "blog");
const OUT_DIR = path.join(ROOT, "public", "blog-images");
const TIMEOUT_MS = 20_000;
const MAX_WIDTH = 1600;

/** Minimal YAML scalar reader: top-level `key: value` lines only (enough for heroImage/postId/slug/draft/status). */
function readScalars(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z][A-Za-z0-9_]*):\s*(.*)$/.exec(line);
    if (!kv) continue;
    let v = kv[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[kv[1]] = v;
  }
  return out;
}

function loadPosts() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const id = path.basename(file, ".md");
      const fm = readScalars(fs.readFileSync(path.join(BLOG_DIR, file), "utf8"));
      const draft = String(fm.draft ?? "false").toLowerCase() === "true";
      const status = (fm.status ?? "publish").toLowerCase();
      if (draft || !["publish", "published"].includes(status)) return null;
      if (!fm.heroImage || !/^https?:\/\//i.test(fm.heroImage)) return null;
      return { id, key: fm.postId || fm.slug || id, heroImage: fm.heroImage };
    })
    .filter(Boolean);
}

async function loadSharp() {
  try {
    const mod = await import("sharp");
    return mod.default ?? mod;
  } catch {
    return null;
  }
}

function extFor(contentType, url) {
  const ct = (contentType || "").split(";")[0].trim().toLowerCase();
  const map = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png", "image/avif": "avif", "image/gif": "gif" };
  if (map[ct]) return map[ct];
  const m = /\.(webp|jpe?g|png|avif|gif)(\?|$)/i.exec(url);
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
}

const MANIFEST = path.join(OUT_DIR, "manifest.json");

function writeManifest() {
  const manifest = {};
  for (const f of fs.readdirSync(OUT_DIR).sort()) {
    const m = /^(.+)\.(webp|jpe?g|png|avif|gif)$/i.exec(f);
    if (m) manifest[m[1]] = `/blog-images/${f}`;
  }
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  return Object.keys(manifest).length;
}

function existing(key) {
  for (const ext of ["webp", "jpg", "jpeg", "png", "avif", "gif"]) {
    const f = path.join(OUT_DIR, `${key}.${ext}`);
    if (fs.existsSync(f)) return f;
  }
  return null;
}

async function fetchOne(post, sharp) {
  const have = existing(post.key);
  if (have) return { status: "skip", file: have };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(post.heroImage, { signal: ctrl.signal, headers: { "user-agent": "ennisslingshot-build/1.0" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (!buf.length) throw new Error("empty body");
    if (sharp) {
      const out = path.join(OUT_DIR, `${post.key}.webp`);
      await sharp(buf).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out);
      return { status: "webp", file: out };
    }
    const ext = extFor(res.headers.get("content-type"), post.heroImage);
    const out = path.join(OUT_DIR, `${post.key}.${ext}`);
    fs.writeFileSync(out, buf);
    return { status: "copy", file: out };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const posts = loadPosts();
  if (!posts.length) {
    writeManifest();
    console.log("[blog-images] no published posts with a remote heroImage — nothing to do");
    return;
  }
  const sharp = await loadSharp();
  if (!sharp) console.log("[blog-images] `sharp` not installed — copying originals without recompression");
  const counts = { skip: 0, webp: 0, copy: 0, fail: 0 };
  for (const post of posts) {
    try {
      const r = await fetchOne(post, sharp);
      counts[r.status]++;
      if (r.status !== "skip") console.log(`[blog-images] ${r.status} ${post.key} ← ${post.heroImage}`);
    } catch (err) {
      counts.fail++;
      console.warn(`[blog-images] WARN ${post.key}: ${err?.message ?? err} — will use the remote URL`);
    }
  }
  const listed = writeManifest();
  console.log(`[blog-images] done: ${counts.webp} recompressed, ${counts.copy} copied, ${counts.skip} already present, ${counts.fail} failed — manifest lists ${listed}`);
}

main().catch((err) => {
  // Belt and braces: this step must never break the build.
  console.warn(`[blog-images] WARN unexpected error: ${err?.message ?? err}`);
  try { fs.mkdirSync(OUT_DIR, { recursive: true }); writeManifest(); } catch { /* ignore */ }
});
