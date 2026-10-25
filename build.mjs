// build.mjs -- portfolio static site generator. content/ + src/ -> dist/.
// See CLAUDE.md §6 for the intended shape; kept close to its ~200-line target.
import { mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync, cpSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import { createHash } from "node:crypto";
import { marked } from "marked";
import { parseResume, renderResume } from "./src/resume.mjs";

const DIST = "dist";
// Build into a clean directory. Without this, anything ever deleted from
// static/ or content/ lingers in a local dist/ forever -- so check.mjs and any
// local inspection run against files that will not exist on the deployed site.
// Cloudflare builds in a fresh container and never saw the stale copies, which
// is exactly what makes the divergence easy to miss.
rmSync(DIST, { recursive: true, force: true });
const BASE_URL = "https://portfolio.naultmichael.workers.dev";
const sitemapUrls = [];

function lastUpdated() {
  try {
    return execSync("git log -1 --format=%cd --date=short", { encoding: "utf8" }).trim();
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

// Front matter: a small hand-rolled parser (CLAUDE.md §6 sanctions this over a library).
// Handles `key: value`, `key: "quoted value"`, and `key: [a, b, c]` -- everything this
// repo's content actually uses, nothing more.
function parseFrontMatter(raw) {
  raw = raw.replace(/\r\n/g, "\n"); // content files are checked out as CRLF on Windows
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw };
  const data = {};
  m[1].split("\n").forEach((line) => {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) return;
    let val = kv[2].trim();
    if (val.startsWith("[") && val.endsWith("]")) {
      val = val.slice(1, -1).split(",").map((s) => s.trim()).filter(Boolean);
    } else if (/^".*"$/.test(val)) {
      val = val.slice(1, -1);
    }
    data[kv[1]] = val;
  });
  return { data, body: m[2] };
}

function badgeClass(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("simulation")) return "badge-simulation";
  if (s.includes("progress")) return "badge-progress";
  if (s.includes("real-world") || s.includes("verified")) return "badge-verified";
  if (s.includes("client")) return "badge-client";
  return "badge-personal";
}

function checkImagesHaveAlt(html, context) {
  (html.match(/<img\b[^>]*>/gi) || []).forEach((tag) => {
    const alt = tag.match(/alt="([^"]*)"/i);
    if (!alt || !alt[1].trim()) throw new Error(`Build failed: image with no alt text in ${context}`);
  });
}

// "At a glance" renders as a dt/dd box (§5.6); every other section is plain markdown.
function renderGlance(sectionBody) {
  const rows = [];
  const re = /^- \*\*(.+?):\*\*\s*(.+)$/gm;
  let m;
  while ((m = re.exec(sectionBody))) {
    rows.push(`<div class="glance-row"><dt>${esc(m[1])}</dt><dd>${marked.parseInline(m[2])}</dd></div>`);
  }
  return `<div class="glance"><dl>${rows.join("")}</dl></div>`;
}

function renderCaseStudyBody(body) {
  return body.split(/\n(?=## )/).map((chunk) => {
    const h = chunk.match(/^## (.+)\n([\s\S]*)$/);
    if (!h) return marked.parse(chunk); // the draft HTML comment before the first heading
    const heading = `<h2>${esc(h[1])}</h2>`;
    return heading + (h[1].trim() === "At a glance" ? renderGlance(h[2]) : marked.parse(h[2]));
  }).join("\n");
}

function renderHeader(site, activeHref) {
  const links = site.nav.map((l) => {
    const active = activeHref === l.href || (l.href !== "/" && activeHref.startsWith(l.href));
    return `<a href="${l.href}"${active ? ' aria-current="page"' : ""}>${esc(l.label)}</a>`;
  }).join("\n      ");
  return `<header class="site-header">
  <div class="container">
    <a href="/" class="brand">${esc(site.name)}</a>
    <nav class="site-nav" aria-label="Main">
      ${links}
      <button type="button" class="theme-toggle" data-theme-toggle>Dark mode</button>
    </nav>
  </div>
</header>`;
}

function renderFooter(site) {
  const s = site.social;
  return `<footer class="site-footer">
  <div class="container">
    <span>${esc(site.footer.privacyNote)} Last updated: ${site.footer.lastUpdated}.</span>
    <div class="footer-links">
      <a href="/how-i-work/">How I work</a>
      <a href="mailto:${s.email}">Email</a>
      <a href="${s.linkedin}">LinkedIn</a>
      <a href="${s.github}">GitHub</a>
    </div>
  </div>
</footer>`;
}

function cardHtml(c) {
  const tags = (c.data.audience || []).map((a) => `<span class="tag">${esc(a)}</span>`).join(" ");
  return `<a href="/work/${c.data.slug}/" class="case-card">
    <h3>${esc(c.data.title)}</h3>
    <p>${esc(c.data.summary)}</p>
    <div class="card-tags"><span class="badge ${badgeClass(c.data.status)}">${esc(c.data.status)}</span>${tags}</div>
  </a>`;
}

const layoutTpl = readFileSync("src/templates/layout.html", "utf8");

function writePage(slug, { title, description, content, activeHref, jsonLd }, site) {
  checkImagesHaveAlt(content, slug || "home");
  const canonical = `${BASE_URL}${slug ? "/" + slug + "/" : "/"}`;
  const html = layoutTpl
    .replaceAll("{{title}}", esc(title))
    .replaceAll("{{description}}", esc(description))
    .replaceAll("{{canonical}}", canonical)
    .replaceAll("{{baseurl}}", BASE_URL)
    .replaceAll("{{header}}", renderHeader(site, activeHref))
    .replaceAll("{{content}}", content)
    .replaceAll("{{footer}}", renderFooter(site))
    .replaceAll("{{jsonld}}", jsonLd || "");
  const outDir = slug ? path.join(DIST, slug) : DIST;
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, "index.html"), html);
  sitemapUrls.push(canonical);
}

// ---------- build ----------

mkdirSync(DIST, { recursive: true });
const site = JSON.parse(readFileSync("content/site.json", "utf8"));
site.footer.lastUpdated = lastUpdated();

// Case studies
const REQUIRED = ["title", "summary", "status", "verified"];
const caseStudies = readdirSync("content/case-studies").filter((f) => f.endsWith(".md")).map((f) => {
  const { data, body } = parseFrontMatter(readFileSync(path.join("content/case-studies", f), "utf8"));
  REQUIRED.forEach((field) => {
    if (!data[field]) throw new Error(`Build failed: ${f} missing required front matter field "${field}"`);
  });
  if (!data.slug) data.slug = f.replace(/\.md$/, "");
  return { data, body };
});

const isClientWork = (c) => (c.data.audience || []).includes("web");
const byFeatured = (a, b) =>
  (Number(a.data.featured) || 99) - (Number(b.data.featured) || 99) ||
  a.data.title.localeCompare(b.data.title);

// Reading order for the whole set, so each case study can point at the next
// one. Without this every case study ends in the footer: a reader who just
// finished the strongest page on the site has nowhere to go but Back.
const readingOrder = [...caseStudies].sort(byFeatured);
const nextCase = (cs) =>
  readingOrder[(readingOrder.findIndex((c) => c.data.slug === cs.data.slug) + 1) % readingOrder.length];

// A next-step panel. Client-work pages send readers to the client door;
// everything else sends them to the resume (CLAUDE.md §1's two doors).
const nextPanel = (heading, body, buttons) =>
  `<div class="panel next-step">
    <h2 class="mt-0">${heading}</h2>
    <p>${body}</p>
    <div class="cta-row mb-0">${buttons}</div>
  </div>`;

caseStudies.forEach((cs) => {
  const badge = `<span class="badge ${badgeClass(cs.data.status)}">${esc(cs.data.status)}</span>`;
  const tags = (cs.data.audience || []).map((a) => `<span class="tag">${esc(a)}</span>`).join(" ");
  // The `verified:` field is required of every case study (REQUIRED, below) and
  // several bodies say "see the verification line above" -- so it has to be
  // rendered here, above the At a glance box, or that instruction points at
  // nothing and the site's core honesty claim is invisible to readers.
  const content = `<div class="case-header">
    <h1 class="mb-0">${esc(cs.data.title)}</h1>${badge}</div>
    <p class="text-muted">${esc(cs.data.summary)}</p>
    <div class="verified-line">
      <p class="verified-label">Verified</p>
      <p class="mb-0">${esc(cs.data.verified)}</p>
    </div>
    <div class="card-tags mb-6">${tags}</div>
    ${renderCaseStudyBody(cs.body)}
    ${nextPanel(
      "Keep reading",
      `Next: <a href="/work/${nextCase(cs).data.slug}/">${esc(nextCase(cs).data.title)}</a>`,
      isClientWork(cs)
        ? `<a href="/work-with-me/" class="btn btn-primary">Work with me</a>
           <a href="mailto:${site.social.email}" class="btn btn-secondary">Email me</a>`
        : `<a href="/resume/" class="btn btn-primary">Resume</a>
           <a href="mailto:${site.social.email}" class="btn btn-secondary">Email me</a>`
    )}`;
  writePage(`work/${cs.data.slug}`, {
    title: `${cs.data.title} — Michael Nault`,
    description: cs.data.summary,
    content,
    activeHref: "/work/",
  }, site);
});

// Work index: the site's two doors (CLAUDE.md §1), each case study appearing
// exactly once. This was previously grouped by audience tag, which rendered a
// study once per tag -- Workspace showed up three times on a five-study page,
// making the work look both larger than it is and visibly repetitive.
// Tags stay on the cards, so the per-audience signal isn't lost.
const doorGroup = (id, heading, blurb, items) => items.length
  ? `<h2 id="${id}">${heading}</h2><p class="text-muted">${blurb}</p>` +
    `<div class="card-grid mb-7">${items.map(cardHtml).join("\n")}</div>`
  : "";
const sections =
  doorGroup("for-employers", "For employers",
    "GRC, compliance, and IT work — each one marks what's verified and what isn't.",
    caseStudies.filter((c) => !isClientWork(c)).sort(byFeatured)) +
  doorGroup("client-work", "Client work",
    "Built and delivered for a real client, with their permission.",
    caseStudies.filter(isClientWork).sort(byFeatured));
writePage("work", {
  title: "Work — Michael Nault",
  description: "Case studies from GRC, IT, and client work, tagged by who each one speaks to most.",
  content: `<h1>Work</h1><p>Case studies from GRC, IT, and client work — tagged by who each one speaks to most.</p>${sections}`,
  activeHref: "/work/",
}, site);

// Static pages (about, how-i-work, resume, work-with-me)
readdirSync("content/pages").filter((f) => f.endsWith(".md")).forEach((f) => {
  const slug = f.replace(/\.md$/, "");
  const { data, body } = parseFrontMatter(readFileSync(path.join("content/pages", f), "utf8"));
  // Every page needs exactly one h1 (CLAUDE.md §5.9). Pages that don't open
  // with their own heading get one from the front-matter title they already
  // declare, rather than each author remembering to add it.
  let html = marked.parse(body);
  if (!/<h1[\s>]/i.test(html)) html = `<h1>${esc(data.title)}</h1>\n${html}`;
  // Optional `next:` front matter -- "heading | body | label href, label href"
  // -- so a page declares its own onward step instead of ending in the footer.
  if (data.next) {
    const [heading, bodyText, links] = String(data.next).split("|").map((p) => p.trim());
    const buttons = links.split(",").map((pair, i) => {
      const [label, href] = pair.trim().split(/\s+/);
      const cls = i ? "btn-secondary" : "btn-primary";
      return `<a href="${href}" class="btn ${cls}">${esc(label.replace(/_/g, " "))}</a>`;
    }).join("\n");
    html += nextPanel(esc(heading), esc(bodyText), buttons);
  }
  writePage(slug, {
    title: `${data.title} — Michael Nault`,
    description: data.description || "",
    content: html,
    activeHref: `/${slug}/`,
  }, site);
});

// Resume: rendered from content/resume/, the same source the PDFs are printed
// from (tools/build-resumes.mjs). The base marked `site: true` is the page;
// every base with a PDF is offered as a download. The build stops if a PDF is
// missing or older than its source, so the page and the PDF never disagree.
const RESUME_DIR = "content/resume";
const pdfManifest = existsSync(path.join(RESUME_DIR, "pdf-manifest.json"))
  ? JSON.parse(readFileSync(path.join(RESUME_DIR, "pdf-manifest.json"), "utf8")) : {};
// Bases marked `private: true` are Michael's own: their source lives here for
// version control and the PDF checks, but they build only into the gitignored
// private/ directory, so they never appear on the site.
const resumes = readdirSync(RESUME_DIR).filter((f) => f.endsWith(".md")).map((f) => {
  const text = readFileSync(path.join(RESUME_DIR, f), "utf8");
  const resume = parseResume(text);
  const hash = createHash("sha256").update(text.replace(/\r\n/g, "\n")).digest("hex");
  if (resume.meta.private === "true") return null;
  if (!existsSync(path.join("static", "resume", `${resume.meta.file}.pdf`)) || pdfManifest[f] !== hash)
    throw new Error(`Build failed: the PDF for ${RESUME_DIR}/${f} is missing or out of date -- run "npm run resumes"`);
  return resume;
}).filter(Boolean);
const siteResume = resumes.find((r) => r.meta.site === "true");
if (!siteResume) throw new Error(`Build failed: no resume in ${RESUME_DIR} is marked "site: true"`);
const downloads = [siteResume, ...resumes.filter((r) => r !== siteResume)].map((r, i) =>
  `<a href="/resume/${r.meta.file}.pdf" class="btn ${i ? "btn-secondary" : "btn-primary"}">Download PDF${r.meta.label ? ` (${esc(r.meta.label)})` : ""}</a>`
).join("\n");
writePage("resume", {
  title: "Resume — Michael Nault",
  description: `${siteResume.meta.name}'s resume: ${siteResume.meta.headline}.`,
  content: `<div class="resume-actions">${downloads}</div>
    ${renderResume(siteResume, { links: true })}
    <div class="panel resume-next">
      <h2 class="mt-0">The work behind the projects</h2>
      <p class="mb-0">Each project above has a full write-up, with what's verified and what isn't. <a href="/work/">See the case studies &rarr;</a></p>
    </div>`,
  activeHref: "/resume/",
}, site);

// Home
const featured = caseStudies.filter((c) => c.data.featured).sort((a, b) => a.data.featured - b.data.featured).slice(0, 3);
const proof = (site.proofStrip || []).map((p) =>
  `<div class="proof-stat"><div class="stat-number">${esc(p.stat)}</div><div class="stat-label">${esc(p.label)}</div><div class="stat-source">${esc(p.source)}</div></div>`
).join("");
const personJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: "IT and GRC, entry level",
  url: BASE_URL + "/",
  sameAs: [site.social.github, site.social.linkedin],
});
writePage("", {
  title: `${site.name} — IT and GRC, built hands-on`,
  description: site.subline,
  jsonLd: `<script type="application/ld+json">${personJsonLd}</script>`,
  content: `<h1 class="display-heading">${esc(site.headline)}</h1>
    <p class="subline">${esc(site.subline)}</p>
    <div class="looking-for">
      <p class="looking-for-label">Looking for</p>
      <p class="mb-0">${esc(site.lookingFor)}</p>
    </div>
    <div class="cta-row">
      <a href="/work/" class="btn btn-primary">See the work</a>
      <a href="/resume/" class="btn btn-secondary">Resume</a>
      <a href="mailto:${site.social.email}" class="btn btn-secondary">Email me</a>
    </div>
    <div class="proof-strip mb-7">${proof}</div>
    <h2>Featured case studies</h2>
    <div class="card-grid mb-7">${featured.map(cardHtml).join("\n")}</div>
    <div class="panel">
      <h2 class="mt-0">Also: websites and tools for small businesses</h2>
      <p class="mb-0">I also build small, working things for real people. <a href="/work-with-me/">See how I work with small businesses &rarr;</a></p>
    </div>`,
  activeHref: "/",
}, site);

// 404 (written directly -- Workers' static-assets convention expects a root-level file)
const notFoundHtml = layoutTpl
  .replaceAll("{{title}}", "Page not found")
  .replaceAll("{{description}}", "That page doesn't exist.")
  .replaceAll("{{canonical}}", `${BASE_URL}/404.html`)
  .replaceAll("{{baseurl}}", BASE_URL)
  .replaceAll("{{header}}", renderHeader(site, ""))
  .replaceAll("{{content}}", `<h1>Page not found</h1><p>That page doesn't exist — <a href="/">back to the home page</a>.</p>`)
  .replaceAll("{{footer}}", renderFooter(site));
writeFileSync(path.join(DIST, "404.html"), notFoundHtml);

// Sitemap, assets
writeFileSync(path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  sitemapUrls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n") + `\n</urlset>\n`);

cpSync("src/css", path.join(DIST, "css"), { recursive: true });
cpSync("src/js", path.join(DIST, "js"), { recursive: true });
mkdirSync(path.join(DIST, "styleguide"), { recursive: true });
cpSync("src/styleguide.html", path.join(DIST, "styleguide", "index.html"));
if (existsSync("static")) cpSync("static", DIST, { recursive: true });
writeFileSync(path.join(DIST, "site.json"), JSON.stringify(site, null, 2));

console.log(`Built ${sitemapUrls.length} pages + 404.html -- lastUpdated = ${site.footer.lastUpdated}`);
