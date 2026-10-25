// Build resume PDFs from content/resume/*.md -- one source file per resume base.
//
// For each base it writes:
//   static/resume/<file>.pdf              public, on the site: no phone number
//   private/<file>_application.pdf        gitignored: with phone, for applying
//
// The phone number never lives in the repo. It comes from the RESUME_PHONE
// environment variable or private/resume.local.json ({"phone": "..."}).
// Without one, only the public PDFs are built.
//
// The PDF is the shared resume markup (src/resume.mjs) printed by Chrome, so text comes out in reading
// order with real fonts, and the file is tagged for screen readers.
//
// After building, each PDF is checked (the build fails if any check fails):
//   - every date sits on the same line as its title, with the title first
//   - the public PDF has no phone number
//   - at most 2 pages, and page 2 (if any) is real content, not a stray line
//
// Usage:   node tools/build-resumes.mjs            all bases
//          node tools/build-resumes.mjs entry-it   one base
// Browser: your installed Chrome; set CHROME_PATH to use another Chromium.

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { parseResume, renderResume, titleDatePairs } from "../src/resume.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "content", "resume");
const PUBLIC = join(ROOT, "static", "resume");
const PRIVATE = join(ROOT, "private");
const PHONE_RE = /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;

const font = (w) =>
  readFileSync(join(ROOT, "static", "fonts", `ibm-plex-sans-${w}.woff2`)).toString("base64");

// Print styles for the shared resume markup (src/resume.mjs). The web page
// styles the same markup through src/css/components.css.
const html = (resume, phone) => `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${resume.meta.name} - Resume</title>
<style>
@font-face{font-family:Plex;font-weight:400;src:url(data:font/woff2;base64,${font(400)}) format("woff2")}
@font-face{font-family:Plex;font-weight:600;src:url(data:font/woff2;base64,${font(600)}) format("woff2")}
@page{size:Letter;margin:0.45in 0.55in}
*{box-sizing:border-box;margin:0;padding:0}
body{font:400 9.2pt/1.31 Plex,sans-serif;color:#1A1A1A}
strong{font-weight:600}
h1{font-size:20pt;line-height:1.1;font-weight:600;color:#1F3A5F}
.resume-headline{font-weight:600;font-size:10.5pt;margin:2pt 0 2pt}
.resume-contact{color:#4A4F57;font-size:9pt}
h2{font-size:10.5pt;font-weight:600;color:#1F3A5F;letter-spacing:.04em;text-transform:uppercase;
   border-bottom:.6pt solid #D9DEE5;padding-bottom:1.5pt;margin:8pt 0 3pt;break-after:avoid}
p{margin:0 0 3pt}
.resume-note{color:#4A4F57;font-size:8.5pt}
.resume-title{display:inline;font:inherit}
.resume-date{white-space:nowrap;color:#4A4F57;font-weight:400;font-size:8.9pt}
.resume-sep{color:#9AA3AE}
.resume-entry-head{font-weight:600;font-size:9.8pt;margin-top:4pt;color:#1F3A5F}
.resume-role{font-size:9.3pt;font-weight:600;margin-top:2.5pt}
.resume-row{break-after:avoid}
ul{list-style:none;margin:1pt 0 0}
li{position:relative;padding-left:11pt;margin-bottom:1.5pt}
li::before{content:"\\2022";position:absolute;left:1pt}
</style></head><body>
${renderResume(resume, { phone })}
</body></html>`;

// Rebuild text lines the way screening software does: group runs by baseline.
async function readPdf(path) {
  const doc = await getDocument({ data: new Uint8Array(readFileSync(path)), verbosity: 0 }).promise;
  const pages = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const items = (await (await doc.getPage(n)).getTextContent()).items.filter((it) => it.str.trim());
    // Group runs by baseline, but start a new "line" at any horizontal gap
    // wider than ~3 spaces -- stricter readers treat that as a column break.
    const rows = new Map();
    for (const it of items) {
      const y = Math.round(it.transform[5]);
      if (!rows.has(y)) rows.set(y, []);
      rows.get(y).push(it);
    }
    const lines = [];
    for (const [, runs] of [...rows.entries()].sort((a, b) => b[0] - a[0])) {
      runs.sort((a, b) => a.transform[4] - b.transform[4]);
      let cur = runs[0].str, end = runs[0].transform[4] + runs[0].width;
      for (const r of runs.slice(1)) {
        if (r.transform[4] - end > 12) { lines.push(cur); cur = r.str; } else cur += r.str;
        end = r.transform[4] + r.width;
      }
      lines.push(cur);
    }
    pages.push(lines);
  }
  return pages;
}

function check(pages, resume, isPublic) {
  const problems = [];
  const all = pages.flat();
  for (const { title, date } of titleDatePairs(resume)) {
    const line = all.find((l) => l.includes(title));
    if (!line) problems.push(`title not found on one line: "${title}" (too long?)`);
    else if (!line.includes(date) || line.indexOf(date) < line.indexOf(title))
      problems.push(`date not on its title's line, after the title: "${title}" / "${date}"`);
  }
  if (isPublic && PHONE_RE.test(all.join("\n"))) problems.push("public PDF contains a phone number");
  if (pages.length > 2) problems.push(`${pages.length} pages; the limit is 2`);
  if (pages.length === 2 && pages[1].length < 12)
    problems.push(`page 2 has only ${pages[1].length} lines; tighten to one page`);
  return problems;
}

function loadPhone() {
  if (process.env.RESUME_PHONE) return process.env.RESUME_PHONE;
  const local = join(PRIVATE, "resume.local.json");
  return existsSync(local) ? JSON.parse(readFileSync(local, "utf8")).phone : null;
}

const only = process.argv.slice(2);
const phone = loadPhone();
mkdirSync(PUBLIC, { recursive: true });
const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }
);
// Records which source each public PDF was built from; build.mjs refuses to
// build the site if a resume source has changed since its PDF was made.
const MANIFEST = join(SRC, "pdf-manifest.json");
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};
let failed = false;
for (const f of readdirSync(SRC).filter((f) => f.endsWith(".md")).sort()) {
  if (only.length && !only.includes(basename(f, ".md"))) continue;
  const text = readFileSync(join(SRC, f), "utf8");
  const resume = parseResume(text);
  let ok = true;
  // `private: true` bases are Michael's own -- they keep their source in the
  // repo (so they get version control and these same checks) but never produce
  // a PDF under static/, so nothing about them reaches the site.
  const isPrivate = resume.meta.private === "true";
  const targets = isPrivate
    ? [[join(PRIVATE, `${resume.meta.file}.pdf`), null, true]]
    : [[join(PUBLIC, `${resume.meta.file}.pdf`), null, true]];
  if (phone) {
    targets.push([join(PRIVATE, `${resume.meta.file}_application.pdf`), phone, false]);
  }
  if (isPrivate || phone) mkdirSync(PRIVATE, { recursive: true });
  for (const [out, ph, isPublic] of targets) {
    const page = await browser.newPage();
    await page.setContent(html(resume, ph), { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    writeFileSync(out, await page.pdf({ format: "Letter", printBackground: true, tagged: true,
      preferCSSPageSize: true }));
    await page.close();
    const pages = await readPdf(out);
    const problems = check(pages, resume, isPublic);
    console.log(`[${problems.length ? "FAIL" : "ok"}] ${out.slice(ROOT.length + 1)} (${pages.length} page${pages.length > 1 ? "s" : ""})`);
    for (const p of problems) console.log(`       - ${p}`);
    ok &&= problems.length === 0;
  }
  if (ok) manifest[f] = createHash("sha256").update(text.replace(/\r\n/g, "\n")).digest("hex");
  else delete manifest[f];
  failed ||= !ok;
}
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
await browser.close();
if (!phone) console.log("note: no phone set (RESUME_PHONE or private/resume.local.json); built public PDFs only");
process.exit(failed ? 1 : 0);
