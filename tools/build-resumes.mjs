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
// The PDF is the HTML below printed by Chrome, so text comes out in reading
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
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "content", "resume");
const PUBLIC = join(ROOT, "static", "resume");
const PRIVATE = join(ROOT, "private");
const PHONE_RE = /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
const font = (w) =>
  readFileSync(join(ROOT, "static", "fonts", `ibm-plex-sans-${w}.woff2`)).toString("base64");

function parse(path) {
  const text = readFileSync(path, "utf8").replace(/\r\n/g, "\n");
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  const meta = Object.fromEntries(
    m[1].split("\n").filter((l) => l.includes(": ")).map((l) => [l.slice(0, l.indexOf(": ")), l.slice(l.indexOf(": ") + 2)])
  );
  const sections = text.slice(m[0].length).split(/^## /m).slice(1).map((part) => {
    const nl = part.indexOf("\n");
    return { head: part.slice(0, nl).trim(), body: part.slice(nl + 1).trim() };
  });
  return { meta, sections };
}

const contact = (raw, phone) =>
  raw.split("|").map((p) => p.trim()).filter((p) => p !== "{phone}" || phone)
    .map((p) => (p === "{phone}" ? phone : p)).map(esc).join('<span class="sep"> | </span>');

// A title and its date as one run of text: "Title | Date". Dates sit right
// after their title, not pushed to the far right: a wide gap is exactly what
// makes screening software split a date from its job.
const row = (cls, title, date) =>
  `<div class="row ${cls}"><span class="t">${inline(title)}</span>` +
  (date ? `<span class="d"><span class="sep"> | </span>${esc(date)}</span>` : "") + `</div>`;

function renderBody(body) {
  const out = [];
  let list = null, entry = null;
  const closeList = () => { if (list) { out.push(`<ul>${list.join("")}</ul>`); list = null; } };
  const closeEntry = () => { closeList(); if (entry !== null) { out.push("</div>"); entry = null; } };
  const lines = body.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) { closeList(); continue; }
    let m;
    if (line.startsWith("### ")) {
      closeEntry();
      const next = (lines[i + 1] || "").trim();
      const date = /^\*[^*].*\*$/.test(next) ? (i++, next.slice(1, -1)) : "";
      out.push(`<div class="entry">` + row("h", line.slice(4), date));
      entry = true;
    } else if ((m = line.match(/^\*\*(.+?)\*\*(?:\s*\|\s*(.+))?$/))) {
      closeList();
      out.push(`<div class="role">` + row("r", m[1], m[2] || "") + `</div>`);
    } else if (line.startsWith("- ")) {
      (list ||= []).push(`<li>${inline(line.slice(2))}</li>`);
    } else if (/^\*[^*].*\*$/.test(line)) {
      closeList();
      out.push(`<p class="note">${inline(line.slice(1, -1))}</p>`);
    } else {
      closeList();
      out.push(`<p>${inline(line)}</p>`);
    }
  }
  closeEntry();
  return out.join("\n");
}

function html({ meta, sections }, phone) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${esc(meta.name)} - Resume</title>
<style>
@font-face{font-family:Plex;font-weight:400;src:url(data:font/woff2;base64,${font(400)}) format("woff2")}
@font-face{font-family:Plex;font-weight:600;src:url(data:font/woff2;base64,${font(600)}) format("woff2")}
@page{size:Letter;margin:0.45in 0.55in}
*{box-sizing:border-box;margin:0;padding:0}
body{font:400 9.2pt/1.31 Plex,sans-serif;color:#1A1A1A}
strong{font-weight:600}
h1{font-size:20pt;line-height:1.1;font-weight:600;color:#1F3A5F}
.headline{font-weight:600;font-size:10.5pt;margin:2pt 0 2pt}
.contact{color:#4A4F57;font-size:9pt}
h2{font-size:10.5pt;font-weight:600;color:#1F3A5F;letter-spacing:.04em;text-transform:uppercase;
   border-bottom:.6pt solid #D9DEE5;padding-bottom:1.5pt;margin:8pt 0 3pt;break-after:avoid}
section{break-inside:auto}
p{margin:0 0 3pt}
.note{color:#4A4F57;font-size:8.5pt}
.row .d{white-space:nowrap;color:#4A4F57;font-weight:400;font-size:8.9pt}
.sep{color:#9AA3AE}
.row.h{font-weight:600;font-size:9.8pt;margin-top:4pt;color:#1F3A5F}
.row.r{font-size:9.3pt;font-weight:600;margin-top:2.5pt}
.entry > .row.h + .role .row.r{margin-top:1pt}
.row,.role{break-after:avoid}
ul{list-style:none;margin:1pt 0 0}
li{position:relative;padding-left:11pt;margin-bottom:1.5pt}
li::before{content:"\\2022";position:absolute;left:1pt}
li:first-child{break-before:avoid}
</style></head><body>
<header>
<h1>${esc(meta.name)}</h1>
<p class="headline">${esc(meta.headline)}</p>
<p class="contact">${contact(meta.contact, phone)}</p>
<p class="contact">${contact(meta.links)}</p>
</header>
${sections.map((s) => `<section><h2>${esc(s.head)}</h2>\n${renderBody(s.body)}</section>`).join("\n")}
</body></html>`;
}

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

function check(pages, { meta, sections }, isPublic) {
  const problems = [];
  const all = pages.flat();
  for (const s of sections) {
    for (const [, title, date] of s.body.matchAll(/^### (.+)\n\*([^*].*)\*$/gm)) pair(title, date);
    for (const [, title, date] of s.body.matchAll(/^\*\*(.+?)\*\*\s*\|\s*(.+)$/gm)) pair(title, date);
  }
  function pair(title, date) {
    const plain = title.replace(/\*\*/g, "");
    const line = all.find((l) => l.includes(plain));
    if (!line) problems.push(`title not found on one line: "${plain}" (too long?)`);
    else if (!line.includes(date.trim()) || line.indexOf(date.trim()) < line.indexOf(plain))
      problems.push(`date not on its title's line, after the title: "${plain}" / "${date}"`);
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
let failed = false;
for (const f of readdirSync(SRC).filter((f) => f.endsWith(".md")).sort()) {
  if (only.length && !only.includes(basename(f, ".md"))) continue;
  const resume = parse(join(SRC, f));
  const targets = [[join(PUBLIC, `${resume.meta.file}.pdf`), null, true]];
  if (phone) {
    mkdirSync(PRIVATE, { recursive: true });
    targets.push([join(PRIVATE, `${resume.meta.file}_application.pdf`), phone, false]);
  }
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
    failed ||= problems.length > 0;
  }
}
await browser.close();
if (!phone) console.log("note: no phone set (RESUME_PHONE or private/resume.local.json); built public PDFs only");
process.exit(failed ? 1 : 0);
