---
title: "How I work"
description: "AI-assisted, verification-first — and how this site itself is built and secured."
---

<!-- DRAFT: first pass, combining CLAUDE.md §10's AI statement draft with the "how this site is built" content from Phase 3. Edit into your own voice. -->

## How I use AI

I use AI tools, mainly Claude and Claude Code, the way a lot of developers now do: to draft code and documents faster. Everything on this site was tested against the real thing — a real repo, a real test run, a real command — not just written and trusted. I can walk through how any part of it works. I label what I've verified and what I haven't, because that's the same habit an auditor needs, and it's one I'd rather practice here than only learn on the job.

## What "verified" means here

Every case study on this site carries a status line that says what's actually been checked, and when — not just what's claimed. If something's built but hasn't been run against real data yet, it says so. If a project has a known gap, that gap is named, not hidden. A couple of examples from building this site itself:

- Writing the GRC Security Program case study, I found that three of its four automated evidence checks were accidentally identical — one claimed to check for missing MFA but actually re-checked something else. I fixed it in the project's own repo rather than just describe it as working.
- Writing the Workspace case study, an earlier draft overstated how many automated checks it had, and when its SharePoint connection was last confirmed. Both got corrected against the actual repo before anything went on this site.

That's not an argument that nothing here has gaps — it's the opposite. The gaps that are left are the ones that are still genuinely open, stated plainly, not polished away.

## How this site is built

- **Stack:** plain HTML and CSS, assembled by one small Node build script (`build.mjs`), with Markdown content files as the source of truth. `marked` is the only runtime dependency, pinned to an exact version. No framework.
- **JavaScript:** optional, only for a dark-mode toggle. Every page works fully with JavaScript turned off.
- **Hosting:** Cloudflare Workers (static assets) — chosen specifically because it lets this site send real security headers (a Content Security Policy, not just a best-effort `<meta>` tag), which some free hosts can't do.
- **Security headers:** a real `Content-Security-Policy`, `Strict-Transport-Security`, and related headers, defined in this repo's `_headers` file. *(A header scan result will go here once the site is actually deployed — not written yet, since claiming a scan result before running one would break the rule above.)*
- **Privacy:** no cookies, no trackers, no third-party requests from this site itself. (Case studies about other sites, like client work, describe what those sites actually load — some legitimately do use privacy-friendly analytics, and this site says so plainly rather than pretend otherwise.)
- **Accessibility targets:** WCAG 2.2 AA contrast in both light and dark themes, a visible focus ring on every interactive element, real heading order, and a Lighthouse score of 95+ across Performance, Accessibility, Best Practices, and SEO — checked before launch, not assumed.

## One more thing

If you're reading this as a hiring manager: the verification habit above isn't a trick — it's the actual job. A control that nobody checks isn't a control, whether it's a security policy or a sentence on a resume. This site tries to hold itself to the same standard it'd apply to anything else.
