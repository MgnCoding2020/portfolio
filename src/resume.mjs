// src/resume.mjs -- one parser and one renderer for resumes, shared by
// build.mjs (the /resume/ web page) and tools/build-resumes.mjs (the PDFs).
// Because both read content/resume/<base>.md through this file, the web page
// and the PDF can't drift apart.
//
// Source format (content/resume/*.md):
//   front matter: name, headline, contact, links, file, site (true on the base
//                 shown at /resume/). "{phone}" in contact is filled in only
//                 for application PDFs; everywhere else it is dropped.
//   ## Section            a section
//   ### Title             an entry (employer or project), with *date* on the next line
//   **Role** | date       a role inside an entry
//   - text                a bullet;   *text*  a short note;   other lines: a paragraph

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

export function parseResume(text) {
  text = text.replace(/\r\n/g, "\n");
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) throw new Error("resume file has no front matter");
  const meta = Object.fromEntries(
    m[1].split("\n").filter((l) => l.includes(": "))
      .map((l) => [l.slice(0, l.indexOf(": ")).trim(), l.slice(l.indexOf(": ") + 2).trim()])
  );
  for (const k of ["name", "headline", "contact", "links", "file"])
    if (!meta[k]) throw new Error(`resume front matter is missing "${k}"`);
  const sections = text.slice(m[0].length).split(/^## /m).slice(1).map((part) => {
    const nl = part.indexOf("\n");
    return { head: part.slice(0, nl).trim(), body: part.slice(nl + 1).trim() };
  });
  return { meta, sections };
}

// Every title with its date, for checks: [{ title, date }]
export function titleDatePairs({ sections }) {
  const pairs = [];
  for (const s of sections) {
    for (const [, title, date] of s.body.matchAll(/^### (.+)\n\*([^*].*)\*$/gm)) pairs.push({ title, date });
    for (const [, title, date] of s.body.matchAll(/^\*\*(.+?)\*\*\s*\|\s*(.+)$/gm)) pairs.push({ title, date });
  }
  return pairs.map((p) => ({ title: p.title.replace(/\*\*/g, "").trim(), date: p.date.trim() }));
}

function contactParts(raw, phone) {
  return raw.split("|").map((p) => p.trim()).filter((p) => p !== "{phone}" || phone)
    .map((p) => (p === "{phone}" ? phone : p));
}

// On the web page, emails and profile addresses become real links.
function linkify(part) {
  if (/^[^\s@]+@[^\s@]+\.[a-z]+$/i.test(part)) return `<a href="mailto:${esc(part)}">${esc(part)}</a>`;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/\S*)?$/i.test(part)) return `<a href="https://${esc(part)}">${esc(part)}</a>`;
  return esc(part);
}

// A title and its date are one run of text: "Title | Date". Dates sit right
// after their title on purpose: a wide gap is what makes screening software
// split a date from its job.
const row = (tag, cls, title, date) =>
  `<div class="resume-row ${cls}"><${tag} class="resume-title">${inline(title)}</${tag}>` +
  (date ? `<span class="resume-date"><span class="resume-sep"> | </span>${esc(date)}</span>` : "") + `</div>`;

function renderBody(body) {
  const out = [];
  let list = null, inEntry = false;
  const closeList = () => { if (list) { out.push(`<ul>${list.join("")}</ul>`); list = null; } };
  const closeEntry = () => { closeList(); if (inEntry) { out.push("</div>"); inEntry = false; } };
  const lines = body.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    let m;
    if (!line) { closeList(); continue; }
    if (line.startsWith("### ")) {
      closeEntry();
      const next = (lines[i + 1] || "").trim();
      const date = /^\*[^*].*\*$/.test(next) ? (i++, next.slice(1, -1)) : "";
      out.push(`<div class="resume-entry">` + row("h3", "resume-entry-head", line.slice(4), date));
      inEntry = true;
    } else if ((m = line.match(/^\*\*(.+?)\*\*(?:\s*\|\s*(.+))?$/))) {
      closeList();
      out.push(row("h4", "resume-role", m[1], m[2] || ""));
    } else if (line.startsWith("- ")) {
      (list ||= []).push(`<li>${inline(line.slice(2))}</li>`);
    } else if (/^\*[^*].*\*$/.test(line)) {
      closeList();
      out.push(`<p class="resume-note">${inline(line.slice(1, -1))}</p>`);
    } else {
      closeList();
      out.push(`<p>${inline(line)}</p>`);
    }
  }
  closeEntry();
  return out.join("\n");
}

// The resume as HTML. { phone } fills the phone slot (application PDFs only);
// { links } turns contact details into links (web page).
export function renderResume({ meta, sections }, { phone = null, links = false } = {}) {
  const contact = (raw) => contactParts(raw, phone).map(links ? linkify : esc)
    .join('<span class="resume-sep"> | </span>');
  return `<article class="resume">
<header class="resume-header">
<h1>${esc(meta.name)}</h1>
<p class="resume-headline">${esc(meta.headline)}</p>
<p class="resume-contact">${contact(meta.contact)}</p>
<p class="resume-contact">${contact(meta.links)}</p>
</header>
${sections.map((s) => `<section class="resume-section"><h2>${esc(s.head)}</h2>\n${renderBody(s.body)}</section>`).join("\n")}
</article>`;
}
