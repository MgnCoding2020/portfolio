// check.mjs -- quality gates (CLAUDE.md §9). Run after `npm run build`.
// Exits non-zero on any failure; prints a report either way.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";

const DIST = "dist";
const errors = [];
const externalLinks = new Set();

function walk(dir, ext) {
  const out = [];
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) out.push(...walk(full, ext));
    else if (full.endsWith(ext)) out.push(full);
  }
  return out;
}

const htmlFiles = walk(DIST, ".html");
const pages = new Set();
for (const f of htmlFiles) {
  let url = "/" + path.relative(DIST, f).replace(/\\/g, "/");
  if (url.endsWith("/index.html")) url = url.slice(0, -"index.html".length);
  pages.add(url);
}

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const rel = path.relative(DIST, file).replace(/\\/g, "/");
  const isStyleguide = rel.startsWith("styleguide");

  // Images need real alt text
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const alt = tag.match(/alt="([^"]*)"/i);
    if (!alt || !alt[1].trim()) errors.push(`${rel}: <img> with no alt text`);
  }

  // No inline style="" outside the styleguide (CLAUDE.md §8 -- strict CSP has no 'unsafe-inline')
  if (!isStyleguide && /\sstyle="/i.test(html)) {
    errors.push(`${rel}: inline style="" attribute found (breaks the main-site CSP)`);
  }

  // No inline <script> (no src=) outside the styleguide. One deliberate
  // exception: type="application/ld+json" -- CSP's script-src never
  // applies to it (it's inert structured data, not executable script),
  // and it's how the home page's JSON-LD Person schema ships (CLAUDE.md §8).
  for (const tag of html.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi) || []) {
    if (/\stype="application\/ld\+json"/i.test(tag)) continue;
    if (!/\ssrc=/.test(tag) && tag.replace(/<script\b[^>]*>|<\/script>/gi, "").trim()) {
      if (!isStyleguide) errors.push(`${rel}: inline <script> with no src= (breaks the main-site CSP)`);
    }
  }

  // No third-party requests: scripts, stylesheets, and images must be self-hosted.
  // (rel="canonical"/"apple-touch-icon" aren't resource loads a browser fetches
  // for CSP purposes, and canonical URLs are always absolute by design -- excluded.)
  // One deliberate exception: the Cloudflare Web Analytics beacon (cookieless,
  // no personal data -- see /how-i-work/), matching _headers' CSP exactly.
  const ALLOWED_THIRD_PARTY = ["https://static.cloudflareinsights.com/beacon.min.js"];
  for (const m of html.matchAll(/<script\b[^>]*\ssrc="([^"]+)"|<img\b[^>]*\ssrc="([^"]+)"|<link\b[^>]*\srel="stylesheet"[^>]*\shref="([^"]+)"/gi)) {
    const url = m[1] || m[2] || m[3];
    if (/^https?:\/\//i.test(url) && !ALLOWED_THIRD_PARTY.includes(url)) {
      errors.push(`${rel}: third-party resource loaded -- ${url}`);
    }
  }

  // Collect external <a> links for the report (not a failure)
  for (const m of html.matchAll(/<a\b[^>]*\shref="(https?:\/\/[^"]+)"/gi)) externalLinks.add(m[1]);

  // Internal links must resolve to a real generated page
  for (const m of html.matchAll(/\shref="(\/[^"]*)"/g)) {
    const href = m[1];
    if (href.startsWith("/css") || href.startsWith("/js") || href.endsWith(".pdf") || href.endsWith(".png") || href.endsWith(".svg") || href === "/404.html") continue;
    if (!pages.has(href)) errors.push(`${rel}: broken internal link -- ${href}`);
  }

  // Exactly one h1 per page (CLAUDE.md §5.9). /about/ and /how-i-work/ both
  // shipped with zero for weeks; this is the gate so it can't recur quietly.
  const h1s = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1s !== 1) errors.push(`${rel}: has ${h1s} <h1> elements, expected exactly 1`);

  // Honesty: no inflated language anywhere on the site
  for (const word of ["expert", "mastery", "guru", "ninja"]) {
    if (new RegExp(`\\b${word}\\b`, "i").test(html.replace(/<[^>]+>/g, " "))) {
      errors.push(`${rel}: contains the word "${word}" (CLAUDE.md §1/§9 rule against inflated claims)`);
    }
  }

  // No phone number anywhere on the live site (CLAUDE.md §1)
  if (/\(\d{3}\)\s?\d{3}[-.\s]?\d{4}/.test(html)) {
    errors.push(`${rel}: looks like a phone number is present -- not allowed on the site`);
  }

  // Every /work/<slug>/ case study must show a status badge
  if (rel.startsWith("work/") && rel !== "work/index.html" && !/class="badge/.test(html)) {
    errors.push(`${rel}: case study has no status badge`);
  }
}

// Image file size limit (300 KB), for any real image assets shipped
if (existsSync(path.join(DIST, "img"))) {
  for (const f of walk(path.join(DIST, "img"), "")) {
    const kb = statSync(f).size / 1024;
    if (kb > 300) errors.push(`${f}: ${Math.round(kb)} KB, over the 300 KB limit`);
  }
}

// _headers must exist and carry the two load-bearing directives
const headersPath = path.join(DIST, "_headers");
if (!existsSync(headersPath)) {
  errors.push("_headers is missing from dist/");
} else {
  const headers = readFileSync(headersPath, "utf8");
  if (!headers.includes("Content-Security-Policy")) errors.push("_headers has no Content-Security-Policy");
  if (!headers.includes("frame-ancestors 'none'")) errors.push("_headers's CSP has no frame-ancestors 'none'");
}

// The 404 page has to be wired up, not just built. dist/404.html was shipped
// unused from launch until 2026-10-27 because Workers static assets serves its
// own empty 404 unless `not_found_handling` says otherwise -- and every check
// here passed the whole time, because the built output was correct and the gap
// was in deploy config. This is the one place that config is asserted.
if (!existsSync(path.join(DIST, "404.html"))) {
  errors.push("404.html is missing from dist/");
}
const wranglerPath = "wrangler.jsonc";
if (!existsSync(wranglerPath)) {
  errors.push("wrangler.jsonc is missing");
} else if (!/"not_found_handling"\s*:\s*"404-page"/.test(readFileSync(wranglerPath, "utf8"))) {
  errors.push('wrangler.jsonc: assets.not_found_handling must be "404-page", or dist/404.html is never served');
}

// security.txt must not have already expired
const secTxtPath = path.join(DIST, ".well-known", "security.txt");
if (!existsSync(secTxtPath)) {
  errors.push("security.txt is missing from dist/.well-known/");
} else {
  const m = readFileSync(secTxtPath, "utf8").match(/Expires:\s*(.+)/);
  if (!m || new Date(m[1].trim()) < new Date()) errors.push("security.txt's Expires date is missing or already in the past");
}

console.log(`Checked ${htmlFiles.length} pages.`);
console.log(`${externalLinks.size} external link(s) referenced (not checked for liveness):`);
for (const url of externalLinks) console.log("  " + url);

if (errors.length) {
  console.log(`\n${errors.length} problem(s):`);
  errors.forEach((e) => console.log("  ✗ " + e));
  process.exit(1);
}
console.log("\nAll checks passed.");
