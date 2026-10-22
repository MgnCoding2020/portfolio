# Portfolio site: plan and build guide

> **Where this file goes.** Create a new, empty repo (suggested name: `portfolio`) and save this file in its root as **`CLAUDE.md`**. It's both the roadmap Michael follows and the instructions Claude Code reads every session. Unlike Workspace's, this `CLAUDE.md` can be public: it contains nothing private, and a clear build plan in a repo reads well to reviewers.
>
> **Written:** 2026-10-09; **updated** 2026-10-20 (full design process in section 5, portfolio-first schedule, corrected Amazon figures). Built from a review of Michael's GitHub (`MgnCoding2020`), both resumes, the Workspace and WinSysConfig repos, the Little Saporito Press site, and his past project work. An earlier draft lives in Claude Design from about 6 months ago. **This plan starts fresh.** Mine the old draft for layout ideas only.

---

## 1. Who this site is for, and what it must prove

### One site, two doors

Michael wants to stay versatile: land an IT/GRC role **and** build toward working for himself. One site serves both, as long as each visitor can find their own path in one click. Two portfolios would split the effort and the search ranking for no gain.

| Door | Who comes in | What they want to see | Where they land |
|---|---|---|---|
| **Hire me** | GRC / compliance / IT audit hiring managers (primary); Microsoft 365 / IT admin / IAM hiring managers (secondary) | Controls, evidence, remediation, hands-on M365/Windows, clear writing | Home → featured case studies → Resume |
| **Work with me** | Small businesses, authors, local organisations, nonprofits | A real client site that works, what he can do for them, how to start a conversation | `/work-with-me/` → client case studies → email |

Both doors open onto the **same body of work**. A tag on each case study says which door it serves (`grc`, `m365`, `iam`, `endpoint`, `web`, `automation`). The client site is a hiring signal too: it shows a real project delivered for a real person, start to finish, and that's rare for an entry-level candidate.

**How to keep two audiences from diluting each other:**
- The home page leads with the IT/GRC position (the main goal), then gives the client door its own clearly labelled band, never mixed into the job pitch.
- Prices, availability and "how we'd work together" live only on `/work-with-me/`. The resume and job-facing case studies never mention pricing.
- Client case studies stay technical and honest (security headers, accessibility, workflow), so a hiring manager reading one still sees an IT professional.

### The one-sentence position

> **IT and GRC, built hands-on.** Six years in Amazon operations taught me that a control only works when people follow it and you can prove it. Now I build the systems and the evidence, for employers and for small businesses.

Use this, or Michael's own rewrite, as the home page headline and subline. Everything on the site should support it.

### What makes this candidate different (lead with these)

| Strength | Evidence | Where it shows |
|---|---|---|
| Real audit-compliance results, not just labs | SOX weekly compliance ~63–70% → sustained 99%+ in one month; unresolved exceptions 50+ pods → 1–2 per floor; ICQA DPMO ~37k → ~10k; stow DPMO held at 5–7k, under a 10k limit | Home proof strip, About |
| Builds working tools, not just documents | Workspace (about 4,800 lines; 3 data backends; check suite with 277 checks); WinSysConfig; the payroll system | Case studies, live demo |
| Honesty about what's verified | Both repos label unverified work; GitHub labels projects as simulations | "How I work" page, every case-study status box |
| Security-minded engineering | CSP and no-network design in WinSysConfig; stored-XSS found and fixed in Workspace (once Workspace task F3 lands) | Case studies, "How this site is built" |
| Can explain things plainly | Teaching notes inside Workspace and WinSysConfig | Writing style across the site |
| Delivers for real people | Little Saporito Press: a live client site built from a messy brief; a payroll timesheet system built for a small engineering firm | Client case studies, `/work-with-me/` |
| Builds tools for his own problems | Home EDR: baseline and drift detection written to protect his own machine, grown into a governance-framed project | Endpoint case study |

### What the site must not do

- No skill bars, percentages or "expert" labels. Michael is entry-level and the site says so with confidence, not apology.
- No fake testimonials, no stock "client logos," no employer logos (Amazon, WGU and so on as images).
- No confidential employer information. Amazon details stay at **resume level**: the role names, the published metrics and the site codes already on the resume. No internal tool names, screenshots or documents.
- No client data. The payroll system and Gina's site appear only with permission (Phase 0) and with no real names, numbers or employee data.
- No phone number on the site (spam). Email and LinkedIn only.
- No client work shown without the client's written permission (a text or email is enough), and nothing from a client's private files.
- No unverified claims. If a case study says something works against a live system, it must have been verified, with the date.

---

## 2. Decisions (made; change them only on purpose)

| Decision | Choice | Why |
|---|---|---|
| Host | **Cloudflare Workers (static assets)** (free) | Updated 2026-10-20: Cloudflare now steers new Git-connected projects here instead of classic Pages ("start new projects with Workers" per their own docs). Same `_headers`/`_redirects` support as Pages, same free branch previews; needs one extra `wrangler.jsonc` (`assets.directory: "./dist"`) that Pages didn't require. Local preview is `npx wrangler dev` (was `wrangler pages dev dist`). Deploy command in the Cloudflare dashboard: `npx wrangler deploy`; build command: `npm ci && npm run build` |
| Fallback host | GitHub Pages (`mgncoding2020.github.io`) | Zero setup, but no custom headers (CSP only via `<meta>`, no `frame-ancestors`, no HSTS control) |
| Address | Free `portfolio.naultmichael.workers.dev` (Workers' free address: `<worker-name>.<account-subdomain>.workers.dev`; the Cloudflare account's subdomain turned out to be `naultmichael`, not the GitHub handle `mgncoding2020` as originally assumed on 2026-10-20 -- corrected 2026-10-21 after the first live deploy) | Free, no new name to reserve. A custom domain (about $10–15/year at cost through Cloudflare Registrar) can come later and redirect from this address |
| Stack | **Plain HTML + CSS, built by one small Node script** | Matches Michael's existing style (vanilla, no framework); nothing new to learn; every page is real HTML, so it works with no JavaScript, prints well, and is easy for search engines |
| Content format | Markdown files with a small front-matter block, plus `projects.json` | Content stays separate from code, the same principle as Workspace's `config/` + `data/seed/` |
| Dependencies | `marked` (Markdown → HTML), and nothing else at runtime | One small, well-known dependency, pinned exactly |
| JavaScript on the page | Optional, only for the theme toggle | Content never depends on it |
| Fonts | System font stack, or **self-hosted** IBM Plex Sans + Plex Mono (open licence) | No Google Fonts request (privacy, and it keeps the CSP strict) |
| Analytics | **Cloudflare Web Analytics, enabled 2026-10-21** (cookieless, manual JS-snippet setup since the site isn't a Cloudflare-proxied zone) | Privacy-respecting traffic visibility for Michael; CSP opened only for `static.cloudflareinsights.com` (script-src) and `cloudflareinsights.com` (connect-src), nothing broader. No public-facing visit counter on the site itself -- decided against: a vanity metric, not evidence, and off the site's "clear, credible, quiet" test (5.1) |
| Contact | `mailto:` link + LinkedIn | No form to secure or spam-filter. A form (Pages Function + Turnstile) is a later option |

---

## 3. Site map

```
/                       Home: position, proof strip, 3 featured case studies, links
/work/                  All projects, filterable by audience tag (works without JS: tag sections)
/work/<slug>/           One case study per project
/work-with-me/          The client door: what I build for small businesses, how it works, how to start
/about/                 The story: operations → SOX → GRC; WGU; certifications
/how-i-work/            AI-assisted, verification-first; how this site is built and secured
/resume/                HTML resume + both PDFs (IT/M365 and GRC)
/demo/workspace/        The Workspace single-file demo (memory provider, demo banner)
/demo/winsysconfig/     The WinSysConfig UI with a mock bridge (later phase)
(external link)          Burn and Churn Coffee demo site: its own repo and pages.dev address (after launch; see Phase 6)
/404.html               Helpful not-found page
/.well-known/security.txt
/robots.txt, /sitemap.xml
```

### Home page, top to bottom

1. **Name + position** (headline and subline above). Buttons: *See the work* · *Resume* · *Email me*.
2. **Proof strip**: three short facts with numbers, for example "SOX audit compliance: ~63–70% → 99%+ in one month (Amazon, 2023)", "Workspace: a SharePoint-style platform, 277 automated checks", "GRC labs mapped to NIST 800-53, NIST 800-171 and PCI DSS 4.0.1." (Count the labs yourself before adding a number.)
3. **Featured case studies**: three cards (GRC Security Program, Workspace, Home EDR). Each card: title, one line, audience tags, status badge. Workspace may show an **In progress** badge until its full case study is written.
4. **What I'm looking for**: one honest paragraph (entry-level GRC/compliance, M365 admin or IAM; Orlando or remote; open to mentorship-heavy roles).
5. **"Also: websites and tools for small businesses"**: a visually separate band with one line, the Little Saporito Press card, and a link to `/work-with-me/`.
6. **Footer**: email, LinkedIn, GitHub, TryHackMe, "Last updated" date.

### `/work-with-me/` (the client door)

Keep it short, warm and concrete. Sections:
1. **Headline:** for example "Websites and simple tools for small businesses and authors," with one line on who it's for.
2. **What I build:** three cards.
   - **Websites:** fast, secure, accessible sites you own, on free hosting; seasonal or event updates.
   - **Spreadsheet and process tools:** turning emailed spreadsheets and manual re-typing into a checked, repeatable process (for example timesheets into QuickBooks).
   - **Microsoft 365 setup** (later, once insured and ready): users, MFA, sharing permissions, onboarding/offboarding.
3. **Proof:** the Little Saporito Press case study (and the payroll case study, if permitted).
4. **How it works:** a short conversation → a written one-page scope → build on a preview link the client can check → launch → simple updates by the job or a small monthly plan.
5. **Honest note:** "I'm early in this work and take on a small number of projects alongside my full-time job, so I can give each one proper attention."
6. **Contact:** email link with a suggested subject line.

**Prices:** leave them off at launch. Add "starting at" figures only once Michael has a written price sheet and two or three paid projects behind him. (An earlier session estimated a site like Gina's at about $1,500–2,000 for a non-friend client, plus maintenance by the job or about $75–150/month; treat that as a starting point to revisit, not a published price.)

**Before this page goes live (Phase 0):** check Amazon's outside-employment policy, and decide whether the side business needs a name, a business email address, or a Florida registration yet. None of these block the job-facing site.

### Case study template (every project uses it)

Front matter (`content/case-studies/<slug>.md`):
```yaml
---
title: "Workspace: a SharePoint-shaped intranet on three backends"
slug: workspace
summary: "Data-driven intranet platform that runs from memory, the browser, or a real SharePoint tenant."
date: 2026-09
status: "Personal project"          # Personal project | Simulation | Client work | Real-world use | In progress
verified: "Live SharePoint tenant connection confirmed 2026-09-29; newer features built against test fixtures."
audience: [m365, iam, security]     # allowed: grc, m365, iam, endpoint, security, web, automation
stack: [JavaScript, SharePoint REST, MSAL, Microsoft Graph, PowerShell, Playwright]
repo: https://github.com/MgnCoding2020/workspace
demo: /demo/workspace/
featured: 1
---
```

Body sections, in this order:
1. **At a glance**: a boxed summary styled like a control card. Problem · What I built · Evidence · Status (the `verified` line, always shown).
2. **The problem**: who has it and why it matters, in 3–5 sentences.
3. **What I built**: one diagram (SVG, with alt text) and a short tour.
4. **Decisions and trade-offs**: 3–5 bullets, each "chose X over Y because Z."
5. **What went wrong and what I changed**: one honest story (for example the seed-date aging bug, or the XSS fix). Hiring managers trust this section most. **Client-work case studies are the exception** (confirmed with Michael 2026-10-21): the goal there is showing the work, not critiquing it or the client — a client only ever approved what they were shown or asked for updates, so there's no "went wrong" to report on their end. Omit this section entirely for client work, or fold a genuine craftsmanship detail into "Decisions and trade-offs" instead, framed positively (what was chosen and why), never as a mistake.
6. **What's verified, and what isn't**: plain list.
7. **What I'd do next**.
8. **Links**: repo, demo, related case studies.

Keep each case study to about 600–1,000 words plus one diagram and 2–4 screenshots.

---

## 4. Content inventory

Status as of 2026-10-09. "Ready" means the project itself is ready; the write-up still needs doing.

| # | Project | Case-study angle | Audience | Demo? | Ready? |
|---|---|---|---|---|---|
| 1 | **Workspace** | SharePoint-style platform; provider pattern; live tenant verified; check suite; XSS found and fixed; (later) timesheets | M365, IAM, security | **Yes**: `dist/workspace.html` | After Workspace fixes F1–F5 |
| 2 | **GRC Security Program** (Burn and Churn Coffee) **+ Vendor Risk Assessment** | One small business, a whole program: risk register → 11 controls (NIST 800-53 ↔ PCI DSS 4.0.1) → evidence pack with Python checks → POA&M; vendor assessment rolls in as POAM-013 under SA-9 | GRC | Repo browsing | Yes |
| 3 | **STIG / NIST 800-171 Lab** | Windows hardening with PowerShell enforcement, validation and evidence export; CMMC context | GRC (DoD), endpoint | No | Yes (small; frame it as a focused lab) |
| 4 | **IAM Access Review Lab** | Quarterly access certification across 5 systems; least privilege, inactive accounts, SoD | IAM, GRC | No | Yes; could be a section inside #2 |
| 5 | **WinSysConfig** | Windows settings with a paper trail: catalog, journal, verification states, safety rules, no network listener | Endpoint, IT, security | Later: mock-bridge demo | After its writes and profiles are pushed |
| 6 | **Payroll timesheet system** (a prototype, never deployed to the engineering firm) | From emailed spreadsheets to a validated QuickBooks import: Excel templates → Python consolidator → IIF export → implementation guide | Business automation, side business | No (screenshots with fake data) | No permission needed (never used by the firm) — still needs anonymising and reframing as a prototype, not client work |
| 7 | **Little Saporito Press** (client site) | See the angle below | Web, side business (and a hiring signal) | **Live site link** | **Ready — Gina's permission obtained 2026-10-20** |
| 8 | **Home EDR** (baseline + drift detection for his own PC) | See the angle below | Endpoint, GRC (continuous control validation) | Sample reports (sanitised) | Yes |
| 8b | **Cybersecurity Monitoring Lab** (Sysmon, Wireshark, Nmap, Nessus) | Short "lab notes" entry, linked from the Home EDR case study | SOC-adjacent | No | Yes |
| 9 | **Timesheets in Workspace** (future) | The multi-user rebuild of #6, with segregation-of-duties controls and an audit log | GRC, M365 | Yes, via the Workspace demo | After Workspace U3/U4 |

**Launch set (v1): five case studies.**
- **Hire-me door:** #2 GRC Security Program (with #4 folded in), #3 STIG / 800-171, #1 Workspace
- **Endpoint:** #8 Home EDR
- **Work-with-me door:** #7 Little Saporito Press (if Gina says yes; if not, launch without it and add it later)

Add the rest one at a time after launch. Five strong case studies beat eight thin ones.

### Angle: Little Saporito Press (client work)

Title idea: *"A children's author's website, from a messy brief to a secure, accessible live site."*

- **The client and the problem:** an independent author needed a home for her book series, free printables, and seasonal updates, with no technical background and a long, loosely organised planning brief.
- **Discovery:** turning the brief into a spec. Michael checked the brief against the live site and found mismatches (series naming, a character's species, printable formats, nav labels) and contradictions. Show a short before/after of one requirement; this is the same skill as writing control requirements.
- **What I built:** a hand-built static site on Cloudflare Pages: book pages, a trailer, printable PDFs with an in-page preview, social links, privacy page.
- **Security and privacy:** a `_headers` file restricting inline scripts and outside resources (the CSP), no trackers, nothing third-party loaded. Run a header scan and show the result.
- **Accessibility:** the seasonal decorations use a gentle twinkle instead of hard blinking (seizure safety), animations respect `prefers-reduced-motion`, and visitors get a switch to turn decorations off.
- **Architecture decision:** seasonal themes are a **temporary, self-contained layer** that can never become the permanent design. That was the client's explicit requirement, and the design enforces it.
- **Workflow:** every change on a branch, previewed locally with `wrangler pages dev`, merged only with sign-off, because Cloudflare deploys `main` automatically. The PDF activity builder lives in a separate folder outside the deployed site.
- **Status line:** "Client work, live at littlesaporitopress.com, featured with the author's permission."
- **Get permission for:** screenshots, the link, the client's first name, and a one-sentence quote **only if she offers one in her own words**. Never write one for her.

### Angle: Home EDR (endpoint and governance)

Title idea: *"Home EDR: how would I know if my own PC changed?"*

- **The problem:** after hardening his own Windows machine (least-privilege accounts, unneeded services removed, deny-by-default firewall), Michael asked how he'd know if something changed later: an installer, an update, malware.
- **What I built:** PowerShell scripts that capture a known-good baseline, take scheduled snapshots through Task Scheduler, compare them, and write drift reports on services, scheduled tasks and startup persistence, plus file hashing and update/firewall status per the resume. Reports are archived for history.
- **The evolution:** scripts → structured reports → scheduled automation → drift detection → governance framing. Show it as a small timeline graphic. It's a genuine story of a project growing as the skills did.
- **The GRC link:** a drift report is *evidence* that a configuration control is still in place. That's continuous control validation, the same idea as the evidence pack in the GRC program.
- **Lessons (from the README):** a baseline only matters if you protect it; drift needs context, not just differences; automation helps, but interpretation creates the value.
- **Honesty:** "A learning project on my own machine, not a commercial EDR." Say it before a reader can.
- **Show:** one sanitised sample report (the repo already strips hostnames, usernames, IPs, MACs, serials and paths), and a diagram of the baseline → snapshot → compare → report loop.
- **Connect forward:** link to WinSysConfig as "the next step: from *noticing* changes to *managing* them with a journal and undo," once WinSysConfig has its own case study.

---

## 5. Design: direction, system, and process

### 5.1 Direction

**Feel:** calm and readable, like a well-made audit report: clear hierarchy, generous white space, tables that look good, one accent colour. Distinctive through **structure** (the "At a glance" control cards, status badges, honest verification lines), not decoration. A visitor should be able to scan any page in 10 seconds and know what it proves.

**Three words to test every design choice against:** *clear, credible, quiet.* If an element doesn't make the page clearer or more credible, it goes.

### 5.2 The design process (do these in order; Michael approves each step)

| Step | What happens | Output | Michael approves? |
|---|---|---|---|
| 1. Brief | Confirm audiences, the position line, and the three words above | Notes in `docs/design-brief.md` | Yes |
| 2. Mine the old draft | Open the Claude Design draft; list 3–5 ideas worth keeping and anything to avoid | `docs/old-draft-notes.md` | Skim |
| 3. Content first | Write real headings and the first paragraph for Home, one case study, and Work with me **before** any styling. Design around real words, never lorem ipsum | Draft content files | Yes |
| 4. Wireframes | Plain-text or simple HTML grey-box layouts for the 4 key templates (below), at phone and desktop width | `docs/wireframes/` | **Yes: the main design checkpoint** |
| 5. Tokens | Colours, type scale, spacing, radius, shadows as CSS custom properties (5.3) | `src/css/tokens.css` | Yes, with a token preview page |
| 6. Components | Build each component once (5.5), shown together on a hidden `/styleguide/` page with every state | `src/templates/partials/`, `components.css` | Yes |
| 7. Pages | Assemble templates from components; no one-off styles | Built pages | Per page, on the preview link |
| 8. Design QA | Run the checklist in 5.9 in both themes, at 360 px and desktop, keyboard only, printed | Notes in the PR | Yes, before merge |

Claude Code: at steps 4–6, show Michael the preview link and wait for a yes before building the next step on top. Changing a wireframe is cheap; changing finished pages isn't.

### 5.3 Design tokens (`src/css/tokens.css`)

Colours below were checked for WCAG contrast; keep the pairs as listed.

| Token | Light | Dark | Use | Contrast |
|---|---|---|---|---|
| `--bg` | `#FFFFFF` | `#0F1720` | Page background | |
| `--surface` | `#F5F7FA` | `#16212E` | Cards, the At a glance box | |
| `--text` | `#1A1A1A` | `#E6EAF0` | Body text | 17.4:1 / 14.95:1 |
| `--text-muted` | `#4A4F57` | `#A9B4C2` | Dates, captions | 8.24:1 / 8.59:1 |
| `--brand` | `#1F3A5F` | `#8FB3E0` | Headings, links, rules | 11.48:1 / 8.33:1 (7.51:1 on surface) |
| `--brand-tint` | `#E8EEF6` | `#18263A` | Badge and highlight fills | `--brand`-coloured text on it: 9.84:1 / 9.41:1 (`#B9CDE8` in dark) |
| `--border` | `#D9DEE5` | `#2A3646` | Hairlines, table rules | Decorative only |

**Status badge colours** (text on fill; each badge also carries its word, never colour alone):

| Badge | Light text / fill | Dark text / fill | Contrast |
|---|---|---|---|
| Verified live, Real-world use | `#1E6B3A` / `#E8F3EC` | `#8FD1A5` / `#14281C` | 5.73:1 / 8.76:1 |
| Simulation, Built against fixtures | `#5B3E99` / `#F0EBFA` | `#C7B5F2` / `#231B38` | 6.93:1 / 8.81:1 |
| In progress | `#8A5A00` / `#FDF3E1` | `#F2C46B` / `#2E2410` | 5.39:1 / 9.36:1 |
| Client work, Personal project | `--brand` / `--brand-tint` | as above | 9.84:1 / 9.41:1 |

**Type** (system font stack, or self-hosted IBM Plex Sans / Plex Mono; decide in step 5 and record it in section 2):

| Token | Size / line height | Use |
|---|---|---|
| `--fs-display` | clamp(2rem, 5vw, 2.75rem) / 1.15 | Home headline only |
| `--fs-h1` | 2rem / 1.2 | Page titles |
| `--fs-h2` | 1.5rem / 1.3 | Section headings |
| `--fs-h3` | 1.2rem / 1.35 | Card titles, sub-sections |
| `--fs-body` | 1.0625rem (17px) / 1.6 | Body text |
| `--fs-small` | 0.875rem / 1.5 | Dates, captions, badges (never smaller) |
| `--fs-mono` | 0.9375rem / 1.5 | Code, registry paths, control IDs |

Weights: 400 and 600 only. Reading measure: `max-width: 68ch` for text columns.

**Spacing scale:** `--space-1` 4px, `-2` 8px, `-3` 12px, `-4` 16px, `-5` 24px, `-6` 32px, `-7` 48px, `-8` 64px. Use only these.
**Radius:** `--radius` 8px for cards; 999px only for badges. **Shadows:** none, or one very soft shadow for cards in light mode only. Borders do the work.

### 5.4 Layout

- **Container:** max 1100px, centred, with 16px side gutters on phones and 24px from 768px up.
- **Breakpoints:** 480px (small phones), 768px (tablets), 1024px (desktop). Design phone-first.
- **Grid:** case-study cards in 1 column on phones, 2 from 768px, 3 from 1024px. Text pages are one column.
- **Header:** name on the left; nav links (Work, Work with me, About, Resume) on the right; on phones they wrap to a second row. **No hamburger menu**, so no JavaScript is needed.
- **Footer:** email, LinkedIn, GitHub, TryHackMe, privacy note, "Last updated."

### 5.5 Wireframes for the four key templates

```
HOME                                      CASE STUDY
+--------------------------------+        +--------------------------------+
| Name           Work  Hire  ... |        | Header                          |
+--------------------------------+        +--------------------------------+
| HEADLINE (position line)       |        | Title                    [badge]|
| Subline                        |        | Summary line                    |
| [See the work] [Resume] [Email]|        | +----------------------------+  |
+--------------------------------+        | | AT A GLANCE                |  |
| PROOF STRIP: 3 facts w/ numbers|        | | Problem | Built | Evidence |  |
+--------------------------------+        | | Status: verified line      |  |
| FEATURED: [card] [card] [card] |        | +----------------------------+  |
+--------------------------------+        | The problem / What I built     |
| What I'm looking for (1 para)  |        | [diagram]                      |
+--------------------------------+        | Decisions | What went wrong    |
| ALSO: websites & tools band    |        | Verified / not | Next | Links  |
|  [Little Saporito card] [link] |        +--------------------------------+
+--------------------------------+        | Footer                          |
| Footer                          |        +--------------------------------+
+--------------------------------+

WORK INDEX                                WORK WITH ME
+--------------------------------+        +--------------------------------+
| Title + one line               |        | Headline + who it's for        |
| Jump links: GRC | M365 | ...   |        | 3 cards: Websites | Tools | M365|
| ## GRC   [card] [card]         |        | Proof: client case study card  |
| ## Web   [card]                |        | How it works: 5 numbered steps |
| ## ...                         |        | Honest note | Email button     |
+--------------------------------+        +--------------------------------+
```

The work index uses plain jump links to tag sections, not a JavaScript filter.

### 5.6 Components (build once, reuse everywhere)

| Component | Contents | States to design |
|---|---|---|
| Header / nav | Name, 4 links, theme toggle | Current page, hover, focus, phone wrap |
| Button | Primary (filled brand), secondary (outline) | Hover, focus, active |
| Case-study card | Title, one line, tags, status badge; whole card is one link | Hover, focus |
| Status badge | Word + colour (5.3) | Light, dark |
| Tag | Small text label for audience | |
| At a glance box | Four labelled rows; the status row always visible | Print |
| Proof strip | 3 stats: big number, short label, source in small text | Phone stacks vertically |
| Callout | Info / note box for "honest note," caveats | |
| Table | Zebra-free, hairline rules, header row | Scrolls sideways inside its own box on phones |
| Figure | Diagram or screenshot with caption | Dark mode (see 5.7) |
| Code / path | Inline and block mono | Wraps long registry paths |
| Footer | Links + privacy line + last updated | |

Accessibility rules for every component: visible focus ring (2px `--brand`, 2px offset) on every interactive element, hit area at least 44×44px on phones, and real `<a>`/`<button>` elements only.

### 5.7 Imagery, diagrams and icons

- **Screenshots:** crop to what matters, 1600px wide max, WebP, under 300 KB, real alt text describing what the image shows. Redact anything private before saving. No screenshots of Amazon systems or client private files.
- **Diagrams:** hand-written inline SVG in one style: rounded boxes, 1.5px strokes, brand colour for the main path, muted for the rest, sentence-case labels. Use `currentColor` and tokens so diagrams follow the dark theme. Each has `<title>` and `<desc>`.
- **Icons:** only where they help (external-link, download, email). Inline SVG, `aria-hidden="true"` when next to text. No icon fonts, no icon CDN.
- **Photo of Michael:** optional. If used, one natural, well-lit photo on About only.
- **Favicon:** a simple monogram ("MN") or mark in brand navy, as SVG plus a 180px PNG for Apple devices.
- **Open Graph image (1200×630):** name, position line and URL on the brand background. Make it once with an HTML page screenshot so it matches the site.

### 5.8 Dark mode, motion and print

- **Dark mode:** follows the visitor's system setting by default (`prefers-color-scheme`). The optional toggle stores the choice in `localStorage` and sets `data-theme` on `<html>`; the site works fully without it. Swap tokens only; never write separate dark styles per component.
- **Motion:** none required. Small hover transitions (150ms) only, removed under `prefers-reduced-motion: reduce`.
- **Print (`print.css`):** hide header nav, footer links and the theme toggle; black text on white; show link URLs after link text; keep the At a glance box and diagrams; avoid page breaks inside cards, tables and figures.

### 5.9 Design QA checklist (every page, before merge)

- [ ] Uses only tokens; no hard-coded colours, sizes or spacing
- [ ] Looks right at 360px, 768px and 1280px; no sideways page scroll
- [ ] Both themes checked; badges and diagrams readable in dark mode
- [ ] Keyboard only: logical tab order, visible focus, skip link works
- [ ] Headings in order (one `h1`), link text makes sense out of context
- [ ] Every image has alt text; decorative images have empty alt
- [ ] Works with JavaScript turned off
- [ ] Print preview is clean
- [ ] Lighthouse 95+ (mobile) in all four categories
- [ ] Reads well: first sentence of each section says the point

## 6. Repo structure

```
portfolio/
  CLAUDE.md                 this file
  README.md                 what the site is, how to build and preview it
  package.json              build + check scripts; "marked" pinned exactly
  build.mjs                 content/ + src/ -> dist/
  check.mjs                 content and output checks (section 9)
  docs/
    design-brief.md         design step 1
    old-draft-notes.md      design step 2
    wireframes/             design step 4 (simple HTML or text)
  content/
    site.json               name, position line, nav, social links, "looking for" text
    projects.json           optional overrides/ordering; case-study front matter is the source of truth
    case-studies/*.md
    pages/about.md, how-i-work.md, resume.md
  src/
    templates/layout.html   one layout with {{title}}, {{description}}, {{content}} slots
    templates/partials/     header.html, footer.html, card.html, glance.html, badge.html, proof-strip.html
    styleguide.html         hidden /styleguide/ page showing every token and component (noindex)
    css/tokens.css, base.css, components.css, print.css
    js/theme.js             optional theme toggle (the only script)
  static/                   copied as-is into dist/
    _headers                security headers (section 8)
    _redirects
    robots.txt
    .well-known/security.txt
    favicon.svg, og-image.png
    img/<slug>/*.webp       screenshots, compressed
    resume/Michael_Nault_Resume_GRC.pdf, Michael_Nault_Resume_IT.pdf
  demos/
    workspace/index.html    copied from Workspace's dist/workspace.html at release time
  .github/workflows/check.yml
```

### `build.mjs` requirements

- Read every `content/case-studies/*.md`, parse front matter (a 20-line parser is fine; or pin a small front-matter library), render Markdown with `marked`, and fill `layout.html`.
- Generate `/work/` from front matter, grouped by audience tag and ordered by `featured`.
- Write `dist/sitemap.xml` from the generated pages.
- Fail the build (non-zero exit) if a case study is missing `title`, `summary`, `status` or `verified`, or an image has no alt text.
- **No network access during the build.**
- Target: under about 200 lines. If it grows past that, the design is wrong.

---

## 7. Hosting and deploy (Cloudflare Workers, static assets)

Updated 2026-10-20: the repo is pushed and connected. Cloudflare's dashboard now defaults new Git-connected projects to **Workers with static assets** rather than classic Pages (Cloudflare: "start new projects with Workers"). `_headers`/`_redirects` behave the same as Pages; the only addition is `wrangler.jsonc` in the repo root (`assets.directory: "./dist"`).

1. Repo pushed to GitHub (public): `MgnCoding2020/portfolio`.
2. Cloudflare dashboard → Workers & Pages → Create → connect to Git → pick `portfolio`.
3. Build command `npm ci && npm run build`; deploy command `npx wrangler deploy` (reads `wrangler.jsonc`, which points at `dist`).
4. Production branch: `main`. "Enable Preview builds" on, so every other branch gets its own preview URL — check those before merging. Leave "Protect with Cloudflare Access" off (the site is meant to be public).
5. Local preview: `npm run build && npx wrangler dev` (honours `_headers`).

**Workflow (same rule as Gina's site):** all work on a branch, preview it, and only merge to `main` with Michael's sign-off, because Cloudflare deploys `main` automatically.

---

## 8. Security, privacy and SEO

A GRC candidate's own site should pass the checks it would recommend to others. Say so on `/how-i-work/`.

### `static/_headers`

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  Cross-Origin-Opener-Policy: same-origin

/demo/workspace/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
```

Notes:
- The Workspace demo is one file with inline script and styles, so its path needs `'unsafe-inline'`. It also has `connect-src 'none'`, because the demo talks to nothing. Write that trade-off down rather than hiding it. Check how Cloudflare combines headers when two rules match a path; if both policies apply, the browser enforces both and the demo breaks, so the demo rule may need to replace the `/*` CSP for that path (Cloudflare's `_headers` docs explain how to detach a header with `! Content-Security-Policy`).
- Cloudflare Web Analytics is enabled (2026-10-21; see §2). Its CSP hosts were looked up against Cloudflare's own docs rather than guessed: `script-src` allows `https://static.cloudflareinsights.com/beacon.min.js` exactly; `connect-src` allows `cloudflareinsights.com` (the manual-embedding host, since this site isn't a Cloudflare-proxied zone -- the `'self'`-only form in Cloudflare's docs is for automatic injection on a proxied zone, which doesn't apply here).
- No `style=""` attributes and no inline `<script>` anywhere on the main site, so the strict CSP works.

### `.well-known/security.txt` (RFC 9116)

```
Contact: mailto:<email>
Expires: <a date within the next year, ISO 8601>
Preferred-Languages: en
```
Add a reminder (calendar or a check in `check.mjs`) to refresh `Expires` before it lapses.

### Privacy

No cookies, no trackers, no third-party requests. A one-paragraph privacy note in the footer or on `/how-i-work/` says exactly that.

### SEO basics

- A unique `<title>` and `<meta name="description">` per page, a canonical URL, and Open Graph/Twitter tags with a 1200×630 `og-image.png`.
- `sitemap.xml` (generated) and `robots.txt` pointing to it.
- JSON-LD `Person` on the home page: name, job title (for example "IT and GRC, entry level"), `sameAs` links to GitHub and LinkedIn.
- Real headings in order, descriptive link text, alt text on every image.

---

## 9. Quality gates (`check.mjs`, run locally and in CI)

| Check | Rule |
|---|---|
| Front matter | Required fields present; `status` is one of the allowed values; `verified` is not empty |
| Links | Every internal link resolves to a built page; external links listed in a report (don't fail CI on flaky external sites) |
| Images | Every `<img>` has non-empty `alt`; no image file over 300 KB |
| No external requests | No `http(s)://` in `src=`/`href=` of scripts, styles or fonts in `dist/` |
| No inline style/script | None in main-site pages (the demo folder is exempt) |
| Honesty | Pages under `/work/` contain a status line; the words "expert" and "mastery" don't appear |
| Personal data | No phone number pattern anywhere in `dist/` |
| Security headers | `_headers` exists and contains `Content-Security-Policy` and `frame-ancestors 'none'` |
| security.txt | `Expires` is in the future |

### Manual targets before launch

- Lighthouse (Chrome DevTools): 95+ in Performance, Accessibility, Best Practices and SEO, on mobile and desktop.
- Keyboard only: every page usable, visible focus, and a skip link.
- Contrast: WCAG 2.2 AA in both themes.
- Mozilla HTTP Observatory, or a security-headers scanner, run against the live site. Put the result on `/how-i-work/`.
- Print preview of one case study.
- Checked at 360 px wide (phone) and with JavaScript turned off.

### CI (`.github/workflows/check.yml`)

On every push: `npm ci`, `npm run build`, `node check.mjs`. Cloudflare builds separately; CI is the gate Michael sees on GitHub.

---

## 10. Writing guide

- **Voice:** first person, plain, specific. Short sentences. Numbers over adjectives ("277 checks", not "comprehensive testing").
- **Confidence without inflation:** "I built", "I mapped", "I verified on 2026-09-29." Never "expert," "mastered," "enterprise-grade."
- **Name the simulations:** "Burn and Churn Coffee is a fictional company I invented to practise building a full program."
- **AI-assisted work:** say it once, clearly, on `/how-i-work/`, and stand behind every line. Draft:
  > I use AI tools, mainly Claude and Claude Code, the way many developers now do: to draft code and documents faster. Everything here was tested in my own lab, and I can walk through how any part of it works. I label what I've verified and what I haven't, because that's the same habit an auditor needs.
- **Every case study answers:** what was the problem, what did I do, how do I know it works, what's still unproven.

### Draft copy to start from (Michael edits these into his own voice)

**About (opening):**
> I started at Amazon in 2020 as an associate, and from 2021 I was a Stow Process Assistant, leading start-ups and coaching a team of 60–80 associates. When I moved to quality at a new site, our weekly SOX audit compliance sat around 63–70%. I set up structured tracking and trained associates on every shift, and within a month we were at 99% and stayed there. That's when I learned that controls are a people problem as much as a technical one, and that I like the work of making them stick.
>
> I'm now finishing a B.S. in Cybersecurity and Information Assurance at WGU, with CompTIA A+, Network+, Security+ and ITIL 4 Foundation. I learn by building: a SharePoint-style intranet, a Windows settings tool that journals every change, and security programs for fictional businesses mapped to NIST and PCI.

**What I'm looking for:**
> Entry-level roles in GRC and compliance, IT audit, Microsoft 365 administration or identity and access, in Orlando or remote. I'd especially value a team that mentors.

---

## 11. Roadmap

Michael has about **5 hours a week**, shared with the Workspace and WinSysConfig plans. Section 12 shows how the three fit together. Each phase ends with something live or merged.

### Phase 0: Prepare (week 1, about 4 h)

- [x] **Subdomain — decided 2026-10-20, corrected 2026-10-21.** The Cloudflare account's Workers subdomain turned out to be `naultmichael`, not the GitHub handle `mgncoding2020` as assumed before an account existed. Live site: `portfolio.naultmichael.workers.dev`, until/unless a custom domain is added.
- [ ] Open the old Claude Design draft; note 3–5 layout ideas worth keeping in `docs/old-draft-notes.md`. Don't copy content.
- [x] **Gina's permission — obtained 2026-10-20.** She's Michael's mother-in-law and has consented to featuring littlesaporitopress.com: screenshots, the link, her first name, a description of the work. No further ask needed before writing the case study.
- [x] **Amazon outside-employment check — not needed.** The site doesn't use Amazon's brand, name, or any internal information beyond what's already on the resume (role names, published metrics); it isn't soliciting Amazon clients or competing with Amazon's business. No conflict with their code of conduct.
- [x] **Payroll case study permission — not needed.** It was never deployed to or used by the engineering firm; it exists only as a standalone `.html` file Michael built. Reframe the eventual write-up as a personal/prototype project rather than "client work" — not "built for a small engineering firm" in the case-study sense, since the firm never received or ran it. Revisit the angle (section 4, item #6) when it's written.
- [ ] **Resume — needs consolidation.** Michael currently has multiple versions (IT/M365-leaning and GRC-leaning). Before `/resume/` can be built, pick or draft one resume strong enough to serve both doors, rather than publishing several. Flag as open.
- [ ] Write the position line and the "What I'm looking for" paragraph in Michael's own words.
- [ ] Collect: the consolidated resume PDF once it exists, a headshot (optional), GitHub/LinkedIn/TryHackMe URLs.

**Note on Workspace (2026-10-20):** F1–F10 are done and U1–U3 are underway, ahead of where section 4 assumed. SharePoint connectivity hasn't been re-tested since the 2026-09-29 verification, so don't reuse that date as current without re-checking it when the Workspace case study is written.

**Done when** the name is chosen and the resume is consolidated — the permission asks are already resolved.

### Phase 1: Design and skeleton, live (weeks 2–3, about 8 h)

- [ ] Create the repo with this file as `CLAUDE.md`, a README, MIT licence (code) and a note that written content is © Michael Nault.
- [ ] Design steps 1–6 from section 5.2: brief, old-draft notes, content first, wireframes (**approval checkpoint**), tokens, components on a hidden `/styleguide/` page.
- [ ] `build.mjs` with one layout, header, footer, `tokens.css` (light and dark), `base.css`.
- [ ] Home page with the real headline, proof strip and "looking for" paragraph. Case-study cards can link to "coming soon."
- [ ] `_headers`, `robots.txt`, `security.txt`, `404.html`, favicon.
- [x] **Connect Cloudflare; first deploy succeeded 2026-10-21.** Live at `portfolio.naultmichael.workers.dev`. CSP, HSTS, COOP, Permissions-Policy and nosniff all confirmed present on the live response headers; no `unsafe-inline` on the main site's `style-src`.
- [ ] **Ship it, quietly.** Don't announce yet; just have it live.

**Done when** the site is live at its `workers.dev` address, passes the header scan with CSP present, and Lighthouse is 95+ on the home page.

*Why ship this early:* the old draft stalled because it never felt ready. A live, small, honest site removes that pressure. Everything after this is improving something real.

### Phase 2: Five launch case studies (weeks 4–8, about 20 h)

One case study per 1–2 sessions: write → diagram → screenshots → review. The Home EDR and Little Saporito Press case studies are quicker to write than they look, because both projects are finished and well documented.

1. **GRC Security Program** (with Vendor Risk and IAM Access Review as sections). Diagram: risk → control → evidence → validation → POA&M, with the vendor assessment feeding POAM-013. This one can go first, since its repos are finished.
2. **STIG / NIST 800-171 Lab.** Diagram: STIG ID → PowerShell enforce → validate → evidence export → 800-171 requirement. Keep it short and precise.
3. **Workspace.** At launch, a short **In progress** page is fine: what it is, the three backends, the live tenant test (2026-09-29), the 277 checks, and "timesheets module underway." The full case study (diagram: UI → provider interface → memory / IndexedDB / SharePoint, plus the "what went wrong" stories: seed dates aging out, the stored-XSS find and fix) comes **after those fixes are merged**, so every claim is true.

4. **Home EDR.** Diagram: baseline → scheduled snapshot → compare → drift report → archive, plus the evolution timeline. Link the Monitoring Lab as a short "lab notes" entry.
5. **Little Saporito Press** (once permission is in). Lead with the brief-to-spec story, then security headers, accessibility and the temporary-seasonal-layer decision.

- [ ] Use the Project Talking Points doc (from an earlier session) as the outline for the job-facing ones: pitch, facts, terms, likely questions.
- [ ] `/work/` index page, with tag sections so each door can filter to its own work.

**Done when** the case studies are live, each with a status line, a diagram with alt text, and working links.

### Phase 3: About, How I work, Work with me, Resume (week 9, about 5 h)

- [ ] `/work-with-me/` as described in section 3, without prices, linking to the Little Saporito Press case study.

- [ ] `/about/` from the draft above, in Michael's voice.
- [ ] `/how-i-work/`: the AI statement, the "state what isn't verified" principle, and "How this site is built": stack, headers and the scan result, no trackers, accessibility targets.
- [ ] `/resume/`: an HTML version (better for search and screen readers) plus both PDFs, with a "last updated" date.

### Phase 4: Quality pass (week 10, about 5 h)

- [ ] `check.mjs` complete, plus CI.
- [ ] Full manual checklist from section 9.
- [ ] Open Graph image; JSON-LD; sitemap.
- [ ] Ask one person (ideally someone in IT or GRC) to read the home page and one case study, and note where they got confused.

### Phase 5: Launch (week 11, about 2 h)

- [x] Flip the `workspace` repo from private to public -- done by Michael 2026-10-21, ahead of actual launch.
- [ ] Put the site URL on both resumes, the GitHub profile README, the LinkedIn "Featured" section and contact info, and the email signature.
- [ ] One LinkedIn post: what the site is, the case studies (job and client work), the link. Short.
- [ ] Optional: share it in the ISACA Central Florida community when joining.

### Phase 6: Grow (ongoing)

Add one item at a time, each as its own branch and preview:
- [ ] **Workspace live demo** at `/demo/workspace/` (after Workspace U9 adds the demo banner).
- [ ] **WinSysConfig** case study, once writes, profiles and the journal are pushed and some entries are verified. Later, a browser demo with a mock bridge (see the WinSysConfig plan).
- [ ] **Payroll system** case study (if permission is granted), paired with the Workspace timesheets case study once that lands: "from one user's spreadsheets to a multi-user system with controls."
- [ ] **Little Saporito Press**, if permission came after launch.
- [ ] **Burn and Churn Coffee demo site** (its own repo, its own CLAUDE.md): a small fictional-business site (home, menu, hours, an "order online" link to a hosted ordering page, privacy page) that implements the GRC program's controls in layers (accounts, edge, browser, supply chain, repo, data, vendors, monitoring) and produces evidence for each. Clearly bannered as fictional, kept out of search results. Linked from the GRC case study. Two or three sessions.
- [ ] **Prices on `/work-with-me/`**, once there's a written price sheet and two or three paid projects: "starting at" figures, what maintenance includes, response times.
- [ ] **More client work** as it happens, each as a case study with the client's permission. A second and third client site matter more for the side business than any new lab.
- [ ] **Downloadable templates aligned with NIST, adaptable for other small businesses** (idea noted 2026-10-21, deliberately deferred until core content/design/deploy is done) -- likely ties into `/work-with-me/` as a lead magnet/value demonstration (e.g. a risk register template, a control matrix starter, a policy skeleton), built from what's already proven in the GRC Security Program and vendor risk case studies rather than invented fresh. Needs its own scoping pass when picked up: which templates, what framework version, how "adaptable" (fill-in-the-blank doc vs. something more structured), and whether it needs its own page or folds into the existing client-door pages.

### Quarterly maintenance (30 minutes)

- [ ] Refresh `security.txt` `Expires` if it's within 3 months.
- [ ] Re-run Lighthouse and the header scan.
- [ ] Update the "looking for" paragraph, certifications and both resume PDFs.
- [ ] Check every case study's status line is still true.
- [ ] Bump pinned dependency versions deliberately, one commit.

---

## 12. How this fits with the other plans

Updated 2026-10-20: **the portfolio comes first.** Michael is mid-way through the Workspace timesheets module; it pauses at a clean, committed stopping point while the portfolio is built. One build at a time, alongside school.

| Order | Focus | Notes |
|---|---|---|
| 1 | Portfolio Phases 0–1 (prep, design, skeleton live) | Section 5 design steps happen here |
| 2 | Portfolio Phase 2 (case studies) | Finished projects first: GRC program, Home EDR, Little Saporito Press, STIG; Workspace as an In progress page |
| 3 | Portfolio Phases 3–5 (pages, quality pass, launch) | Go public |
| 4 | Back to Workspace (timesheets, then the fixes in its own plan) | Add the full Workspace case study when ready |
| 5 | Burn and Churn Coffee demo site | Small, own repo |
| 6 | WinSysConfig Phase 1 | Case study when presentable |

Weeks are a guide, not a deadline. If a week is lost, slip the whole schedule. Don't catch up by running two builds at once.

---

## 13. Working agreement for Claude Code

1. Michael is learning. Explain what you'll change and why before editing, and how to check it afterwards.
2. One branch per task, PR for every change. **Updated 2026-10-21:** Michael has authorized merging PRs on this repo without waiting for his review each time -- default to merging once a PR is clean (no conflicts, build still works). Still use judgment: pause and flag rather than merge on autopilot if something looks genuinely consequential (e.g. the first real deploy once Cloudflare is connected, anything touching a client's or a third party's information). Delete merged branches (local and remote) as routine cleanup, no need to ask.
3. Preview locally with `npx wrangler pages dev dist` before every merge.
4. Keep the stack as decided in section 2. Don't add a framework, a CSS library, analytics or any third-party request without asking.
5. Write all site copy as a draft for Michael to edit. Never invent facts, numbers, dates, employers, clients or testimonials. If a fact is missing, leave a visible `TODO(michael): ...` and list it in your summary.
6. Run `npm run build && node check.mjs` after every change.
7. Keep this file current: tick roadmap boxes as work merges, and add decisions to section 2 when they change.
8. **Verify before publishing.** Before any case study, resume line, or site content states a fact, number, date, or claim about a project, confirm it against the actual source — the repo's code, tests, commit/CI history, or committed evidence — never against an earlier draft, a prior resume, or this plan's own content inventory (which can go stale). `gh` is already authenticated with `repo` scope, including private repos. Follow `docs/verification-checklist.md` for the full process. This caught real errors twice already (Workspace's check count and connection date; the GRC evidence-pack script duplication) — it's a required step, not an optional pass.

---

## 14. Resources

| Topic | Link |
|---|---|
| Cloudflare Pages docs (Git integration, `_headers`, `_redirects`) | https://developers.cloudflare.com/pages/ |
| Content Security Policy (MDN) | https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP |
| security.txt (RFC 9116) | https://www.rfc-editor.org/rfc/rfc9116 |
| WCAG 2.2 quick reference | https://www.w3.org/WAI/WCAG22/quickref/ |
| marked (Markdown parser) | https://github.com/markedjs/marked |
| Claude Code memory (`CLAUDE.md`) | https://code.claude.com/docs/en/memory |
