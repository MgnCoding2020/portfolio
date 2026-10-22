// build.mjs -- portfolio static site generator. content/ + src/ -> dist/.
// See CLAUDE.md §6 for the intended shape; kept close to its ~200-line target.
import { mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync, cpSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import { marked } from "marked";

const DIST = "dist";
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

function writePage(slug, { title, description, content, activeHref }, site) {
  checkImagesHaveAlt(content, slug || "home");
  const canonical = `${BASE_URL}${slug ? "/" + slug + "/" : "/"}`;
  const html = layoutTpl
    .replaceAll("{{title}}", esc(title))
    .replaceAll("{{description}}", esc(description))
    .replaceAll("{{canonical}}", canonical)
    .replaceAll("{{baseurl}}", BASE_URL)
    .replaceAll("{{header}}", renderHeader(site, activeHref))
    .replaceAll("{{content}}", content)
    .replaceAll("{{footer}}", renderFooter(site));
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

caseStudies.forEach((cs) => {
  const badge = `<span class="badge ${badgeClass(cs.data.status)}">${esc(cs.data.status)}</span>`;
  const tags = (cs.data.audience || []).map((a) => `<span class="tag">${esc(a)}</span>`).join(" ");
  const content = `<div class="case-header">
    <h1 class="mb-0">${esc(cs.data.title)}</h1>${badge}</div>
    <p class="text-muted">${esc(cs.data.summary)}</p>
    <div class="card-tags mb-6">${tags}</div>
    ${renderCaseStudyBody(cs.body)}`;
  writePage(`work/${cs.data.slug}`, {
    title: `${cs.data.title} — Michael Nault`,
    description: cs.data.summary,
    content,
    activeHref: "/work/",
  }, site);
});

// Work index, grouped by audience tag
const TAG_ORDER = ["grc", "m365", "iam", "endpoint", "security", "web", "automation"];
const TAG_LABELS = { grc: "GRC", m365: "M365", iam: "IAM", endpoint: "Endpoint", security: "Security", web: "Web", automation: "Automation" };
const groups = {};
caseStudies.forEach((c) => (c.data.audience || []).forEach((a) => (groups[a] = groups[a] || []).push(c)));
const jump = TAG_ORDER.filter((t) => groups[t]).map((t) => `<a href="#${t}">${TAG_LABELS[t]}</a>`).join(" &middot; ");
const sections = TAG_ORDER.filter((t) => groups[t]).map((t) =>
  `<h2 id="${t}">${TAG_LABELS[t]}</h2><div class="card-grid">${groups[t].map(cardHtml).join("\n")}</div>`
).join("\n");
writePage("work", {
  title: "Work — Michael Nault",
  description: "Case studies from GRC, IT, and client work, tagged by who each one speaks to most.",
  content: `<h1>Work</h1><p>Case studies from GRC, IT, and client work — tagged by who each one speaks to most.</p><p>Jump to: ${jump}</p>${sections}`,
  activeHref: "/work/",
}, site);

// Static pages (about, how-i-work, resume, work-with-me)
readdirSync("content/pages").filter((f) => f.endsWith(".md")).forEach((f) => {
  const slug = f.replace(/\.md$/, "");
  const { data, body } = parseFrontMatter(readFileSync(path.join("content/pages", f), "utf8"));
  writePage(slug, {
    title: `${data.title} — Michael Nault`,
    description: data.description || "",
    content: marked.parse(body),
    activeHref: `/${slug}/`,
  }, site);
});

// Home
const featured = caseStudies.filter((c) => c.data.featured).sort((a, b) => a.data.featured - b.data.featured).slice(0, 3);
const proof = (site.proofStrip || []).map((p) =>
  `<div class="proof-stat"><div class="stat-number">${esc(p.stat)}</div><div class="stat-label">${esc(p.label)}</div><div class="stat-source">${esc(p.source)}</div></div>`
).join("");
writePage("", {
  title: `${site.name} — IT and GRC, built hands-on`,
  description: site.subline,
  content: `<h1 class="display-heading">${esc(site.headline)}</h1>
    <p class="subline">${esc(site.subline)}</p>
    <div class="cta-row">
      <a href="/work/" class="btn btn-primary">See the work</a>
      <a href="/resume/" class="btn btn-secondary">Resume</a>
      <a href="mailto:${site.social.email}" class="btn btn-secondary">Email me</a>
    </div>
    <div class="proof-strip mb-7">${proof}</div>
    <h2>Featured case studies</h2>
    <div class="card-grid mb-7">${featured.map(cardHtml).join("\n")}</div>
    <div class="callout mb-7"><p>${esc(site.lookingFor)}</p></div>
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
