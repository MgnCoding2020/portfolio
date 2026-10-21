---
title: "Little Saporito Press: A Children's Author's Site, Built From a Messy Brief"
slug: little-saporito-press
summary: "A static site for an independent children's author — book pages, a trailer, printable activities with in-page previews, real security headers, and accessibility-safe seasonal decorations that can be switched off."
date: 2026-10
status: "Client work"
verified: "Confirmed directly against the live repo as of 2026-10-21 (13 commits, most recent 2026-10-17): the security headers in _headers, reduced-motion handling (covers the seasonal twinkle animation via a sitewide rule), the decorations on/off toggle, in-page PDF preview and download for both current printables, and the privacy page's own disclosure of Cloudflare Web Analytics and Google Fonts. Featured with the author's (Gina's) written permission — screenshots, the live-site link, her first name, and a description of the work."
audience: [web]
stack: [HTML, CSS, JavaScript, Cloudflare Pages]
site: https://www.littlesaporitopress.com
---

<!-- DRAFT: fifth and final launch-set case study, written per CLAUDE.md §3 template. Diagram is a placeholder -- no visual design yet (content-first step, §5.2 step 3). NOTE: "site" front matter points at the live deployed site, not a GitHub repo link -- Gina's permission covers the live-site link, not necessarily exposing her source repo publicly, so no repo link is included here. Flag if that reading is wrong. -->

## At a glance

- **Problem:** An independent children's author needed a home for her book series, free printable activities, and seasonal updates — with no technical background and a long, loosely organized planning document to work from.
- **What I built:** A hand-built static site: book pages, an embedded trailer, printable PDFs with in-page previews before download, a dated privacy page, and a seasonal decoration layer that's accessibility-safe and fully removable.
- **Evidence:** real security headers (a working CSP, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`); reduced-motion support covering every animation on the site, including the seasonal decorations; a working decorations toggle; in-page preview plus download for both current printables; a privacy page that names its own analytics provider.
- **Status:** Client work, live at littlesaporitopress.com, featured with the author's written permission.

## The problem

Gina needed a home for *The Selena Stories*, her children's book series — book pages, free printable activities parents could hand their kids, and the ability to dress the site up seasonally without it ever looking unfinished the rest of the year. She had a long, loosely organized planning document and no technical background to turn it into a site herself. My job was most of the real work in a project like this: turning that brief into something buildable, catching the places where it disagreed with itself, and building it in a way she could trust wouldn't break.

## What I built

[diagram: planning brief → spec → static site (book pages, printables, trailer) + a separate, toggleable seasonal layer]

The live site has a page for the first book (*A Puppy for Selena*), a teaser card for the second (*Selena and the Storm*, "currently in development," with a "be the first to know" contact link rather than a fake release date), an embedded trailer with a plain download link for browsers that can't play it inline, two printables (coloring pages, bookmarks) with a click-to-preview step before download, and a dated privacy page. A seasonal decoration layer — currently a Halloween theme — lives in its own folder with its own CSS/JS, separate from the permanent site design.

## Decisions and trade-offs

- **Chose a hand-built static site over a website builder or CMS**, because it gave direct control over real security headers (`_headers`, which a page builder generally won't let you touch) and avoids platform risk and recurring fees.
- **Chose to keep the seasonal layer in its own folder rather than build it into the main design**, so the permanent site never depends on whatever's seasonally live. The project's own planning notes describe new seasonal work as "additive, not a redesign" — a constraint the file structure enforces, not just a stated intention.
- **Chose Cloudflare Web Analytics over something like Google Analytics** for the site's one piece of visit measurement, since it's cookieless and collects no personal information — consistent with the privacy page's promise of no tracking cookies. (Google Fonts is also loaded for typography — both are disclosed plainly on the privacy page rather than left for a visitor to discover themselves.)
- **Chose an in-page preview before download for the printables**, so a parent can see what they're getting before committing to a PDF.

## What went wrong, and what I changed

The site's first Halloween matching-game printable used shapes that were too similar to tell apart — the project's own planning notes describe it plainly: "'same shape repeated' read as low-effort/hard-to-tell-apart." A worksheet where a child can solve a matching puzzle by process of elimination instead of actually matching shapes isn't doing its job, even if it looks fine at a glance.

I rebuilt it: six genuinely distinct hand-drawn icon shapes instead of one shape recolored, and a derangement algorithm (a shuffle that guarantees nothing lands back in its own starting position) so every page's pairing is a real puzzle, not a pattern a kid could shortcut. That specific lesson — distinct shapes, not palette swaps — is now written into the planning notes for every future seasonal activity, not just applied once and forgotten.

## What's verified, and what isn't

- **Verified (confirmed 2026-10-21):** the CSP and security headers in `_headers`; reduced-motion handling applies sitewide, confirmed to cover the seasonal twinkle animation specifically, not just the main site; the decorations toggle persists via `localStorage` with a graceful fallback if that's unavailable; both printables have a working in-page preview and a working download link; the privacy page is dated and names Cloudflare Web Analytics and the site's external links by name rather than vaguely.
- **Self-reported, not independently verifiable:** the original planning brief itself isn't part of the public repo, so the specific back-and-forth of turning it into a spec isn't something I can re-check against a saved document — it's accurately represented here from direct experience doing the work, not reconstructed from a file.
- **Not yet done:** a header scan against the live site (Mozilla HTTP Observatory or similar) hasn't been run and screenshotted for this case study yet.

## What I'd do next

- Run an actual header scan against the live site and put the result here, rather than just showing the `_headers` file's contents.
- The project's own seasonal roadmap already plans a Fall theme next (new decor, a fall color palette, 3 new printable activities) — worth a short follow-up note once that ships, since it's a second real data point on how the "separate, toggleable layer" decision holds up over time.

## Links

- Live site: [littlesaporitopress.com](https://www.littlesaporitopress.com)
