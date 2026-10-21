---
title: "Little Saporito Press: A Children's Author's Site, Built From a Messy Brief"
slug: little-saporito-press
summary: "A static site for an independent children's author — book pages, a trailer, printable activities with in-page previews, real security headers, and accessibility-safe seasonal decorations that can be switched off."
date: 2026-10
status: "Client work"
verified: "Confirmed directly against the live repo as of 2026-10-21 (13 commits, most recent 2026-10-17): the security headers in _headers, reduced-motion handling (covers the seasonal twinkle animation via a sitewide rule), the decorations on/off toggle, in-page PDF preview and download for both current printables, and the privacy page's own disclosure of Cloudflare Web Analytics and Google Fonts. Featured with the author's (Gina's) written permission — screenshots, the live-site link, her first name, and a description of the work. The repo link is also included since that repo is itself public (confirmed 2026-10-21)."
audience: [web]
stack: [HTML, CSS, JavaScript, Cloudflare Pages]
repo: https://github.com/MgnCoding2020/gina-author-site
demo: https://www.littlesaporitopress.com
---

<!-- DRAFT: fifth and final launch-set case study, written per CLAUDE.md §3 template. Diagram is a placeholder -- no visual design yet (content-first step, §5.2 step 3). Repo link included -- the gina-author-site repo is public, confirmed 2026-10-21. -->

## At a glance

- **Problem:** An independent children's author needed a home for her book series, free printable activities, and seasonal updates — with no technical background and a long, loosely organized planning document to work from.
- **What I built:** A hand-built static site: book pages, an embedded trailer, printable PDFs with in-page previews before download, a dated privacy page, and a seasonal decoration layer that's accessibility-safe and fully removable.
- **Evidence:** real security headers (a working CSP, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`); reduced-motion support covering every animation on the site, including the seasonal decorations; a working decorations toggle; in-page preview plus download for both current printables; a privacy page that names its own analytics provider.
- **Status:** Client work, live at littlesaporitopress.com, featured with the author's written permission.

## The problem

Gina needed a home for *The Selena Stories*, her children's book series — book pages, free printable activities parents could hand their kids, and the ability to dress the site up seasonally without it ever looking unfinished the rest of the year. She had a long, loosely organized planning document and no technical background to turn it into a site herself. My job was most of the real work in a project like this: turning that brief into something buildable, catching the places where it disagreed with itself, and building it in a way she could trust wouldn't break.

## What I built

<figure>
<svg viewBox="0 0 506 176" role="img" aria-labelledby="dtitle5 ddesc5" xmlns="http://www.w3.org/2000/svg">
  <title id="dtitle5">Brief to spec to site, with a separate seasonal layer</title>
  <desc id="ddesc5">A planning brief becomes a spec, which becomes the static site. A seasonal decoration layer connects to it but stays separate and toggleable, never part of the permanent design.</desc>
  <defs>
    <marker id="mb5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--brand)"/>
    </marker>
  </defs>
  <rect x="10" y="20" width="130" height="46" rx="8" fill="var(--surface)" stroke="var(--brand)" stroke-width="1.5"/>
  <text x="75" y="43" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-sans)" font-size="13.5" fill="var(--text)">Planning brief</text>
  <rect x="168" y="20" width="100" height="46" rx="8" fill="var(--surface)" stroke="var(--brand)" stroke-width="1.5"/>
  <text x="218" y="43" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-sans)" font-size="13.5" fill="var(--text)">Spec</text>
  <rect x="296" y="20" width="109" height="46" rx="8" fill="var(--surface)" stroke="var(--brand)" stroke-width="1.5"/>
  <text x="350" y="43" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-sans)" font-size="13.5" fill="var(--text)">Static site</text>
  <line x1="140" y1="43" x2="168" y2="43" stroke="var(--brand)" stroke-width="1.5" marker-end="url(#mb5)"/>
  <line x1="268" y1="43" x2="296" y2="43" stroke="var(--brand)" stroke-width="1.5" marker-end="url(#mb5)"/>
  <rect x="276" y="120" width="220" height="46" rx="8" fill="var(--surface)" stroke="var(--text-muted)" stroke-width="1.5"/>
  <text x="386" y="143" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-sans)" font-size="13.5" fill="var(--text)">Seasonal layer (toggleable)</text>
  <line x1="350.5" y1="66" x2="386" y2="120" stroke="var(--text-muted)" stroke-width="1.5" stroke-dasharray="4 4"/>
</svg>
<figcaption>A planning brief becomes a spec, which becomes the static site. A seasonal decoration layer connects to it but stays separate and toggleable, never part of the permanent design.</figcaption>
</figure>

The live site has a page for the first book (*A Puppy for Selena*), a teaser card for the second (*Selena and the Storm*, "currently in development," with a "be the first to know" contact link rather than a fake release date), an embedded trailer with a plain download link for browsers that can't play it inline, two printables (coloring pages, bookmarks) with a click-to-preview step before download, and a dated privacy page. A seasonal decoration layer — currently a Halloween theme — lives in its own folder with its own CSS/JS, separate from the permanent site design.

## Decisions and trade-offs

- **Chose a hand-built static site over a website builder or CMS**, because it gave direct control over real security headers (`_headers`, which a page builder generally won't let you touch) and avoids platform risk and recurring fees.
- **Chose to keep the seasonal layer in its own folder rather than build it into the main design**, so the permanent site never depends on whatever's seasonally live. The project's own planning notes describe new seasonal work as "additive, not a redesign" — a constraint the file structure enforces, not just a stated intention.
- **Chose Cloudflare Web Analytics over something like Google Analytics** for the site's one piece of visit measurement, since it's cookieless and collects no personal information — consistent with the privacy page's promise of no tracking cookies. (Google Fonts is also loaded for typography — both are disclosed plainly on the privacy page rather than left for a visitor to discover themselves.)
- **Chose an in-page preview before download for the printables**, so a parent can see what they're getting before committing to a PDF.
- **Chose six genuinely distinct hand-drawn icon shapes for the matching-game printable, instead of one shape recolored** — plus a derangement algorithm (a shuffle that guarantees nothing lands back in its own starting position) — so a child matches by shape, not by process of elimination. That lesson is now written into the planning notes for every future seasonal activity, not just applied once.

## What's verified, and what isn't

- **Verified (confirmed 2026-10-21):** the CSP and security headers in `_headers`; reduced-motion handling applies sitewide, confirmed to cover the seasonal twinkle animation specifically, not just the main site; the decorations toggle persists via `localStorage` with a graceful fallback if that's unavailable; both printables have a working in-page preview and a working download link; the privacy page is dated and names Cloudflare Web Analytics and the site's external links by name rather than vaguely.
- **Self-reported, not independently verifiable:** the original planning brief itself isn't part of the public repo, so the specific back-and-forth of turning it into a spec isn't something I can re-check against a saved document — it's accurately represented here from direct experience doing the work, not reconstructed from a file.
- **Not yet done:** a header scan against the live site (Mozilla HTTP Observatory or similar) hasn't been run and screenshotted for this case study yet.

## What I'd do next

- Run an actual header scan against the live site and put the result here, rather than just showing the `_headers` file's contents.
- The project's own seasonal roadmap already plans a Fall theme next (new decor, a fall color palette, 3 new printable activities) — worth a short follow-up note once that ships, since it's a second real data point on how the "separate, toggleable layer" decision holds up over time.

## Links

- Live site: [littlesaporitopress.com](https://www.littlesaporitopress.com)
- Repo: [github.com/MgnCoding2020/gina-author-site](https://github.com/MgnCoding2020/gina-author-site)
