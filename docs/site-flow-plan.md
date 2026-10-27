# Site flow plan

> **CLOSED 2026-10-27.** Every actionable item in this plan has been done, superseded, or explicitly rejected by Michael -- it is kept for its reasoning, not as a work list. **Do not pick up its `TODO(michael)` markers:** they are stale. Specifically:
>
> - **§1 positioning rewrite** -- *rejected.* Michael keeps "IT and GRC, built hands-on". The entry-IT framing is for his own applications; a resume is a supporting document and does not redefine the site. The subline change (dropping "and for small businesses") was made.
> - **§7 Operations/Area Manager resume** -- *rejected.* This portfolio is not for that role. Do not resurrect it.
> - **§ About / WinSysConfig** -- *done.* `/about/` now names WinSysConfig with an honest "no write-up yet" note (PR #56).
> - Everything else was audited, implemented and verified across PRs #28-#61.

> **Written 2026-10-24** after a full read of the live site, this repo and `CLAUDE.md`. For Claude Code: work through the numbered items **one PR each, in order**, following `CLAUDE.md` §13 (branch per task, `npm run build && node check.mjs`, verify every fact per §13.8). Copy changes are drafts for Michael to edit; anything marked `TODO(michael)` needs his call before merging.

## What's already done (branch `resume/entry-it-base`)

- `/resume/` is now generated from `content/resume/entry-it.md`, the same file the PDFs are printed from, through one shared renderer (`src/resume.mjs`). The old hand-ported `content/pages/resume.md` is gone.
- `npm run resumes` prints the PDFs with Chrome: a public PDF in `static/resume/` with no phone, and an application PDF with the phone in `private/`, which is gitignored. The phone comes from `private/resume.local.json` or `RESUME_PHONE`.
- **The build refuses to deploy a stale resume.** `npm run build` fails if a resume source changed without its PDF being rebuilt, because `content/resume/pdf-manifest.json` records a hash of the source each PDF came from. If you forget, Cloudflare's build fails and the live site stays on the last good version. Nothing goes live half-updated.
- PDF checks: dates on the same line as their titles, no phone in public PDFs, at most 2 pages, and page 2 never a stray line or two.

### Editing the resume from now on

1. Edit `content/resume/<base>.md`.
2. `npm run resumes`. It must print `[ok]` for every PDF.
3. `npm run build && node check.mjs`.
4. Commit the `.md`, the PDF in `static/resume/`, and `content/resume/pdf-manifest.json` together.

## The decision that shapes the rest

Michael's search is now **"get into tech, then specialize"**, not GRC-only. The resume that anchors `/resume/` is the Entry IT base, and the GRC base becomes a second download. The site needs to say the same thing as the resume, or a recruiter who arrives from Indeed or LinkedIn sees two different people.

The case studies don't change. They stay the proof. What changes is how the site introduces him and where each page sends the reader next.

---

## 1. Positioning copy

- `content/site.json` → `lookingFor`. Draft:
  > Entry-level roles in IT support and service desk, Microsoft 365 and identity, or GRC and IT audit, in Orlando or remote. I'd especially value a team that mentors.

  `TODO(michael)`: approve or rewrite.
- `build.mjs` JSON-LD `jobTitle`: "IT support and GRC, entry level", matching whatever the line above becomes.
- Headline "IT and GRC, built hands-on." can stay; it covers both. The subline ends "for employers and for small businesses", which puts the client door in the first ten seconds. Suggest ending it at "…Now I build the systems and the evidence." `TODO(michael)`: his call, it's his position line.
- `/about/`: append one sentence that ties in the IT support story (three years of customer support at Massey; trouble tickets and floor equipment at Amazon). Only facts already on the resume.

## 2. Navigation and footer

- Nav order: **Work · Resume · About · Work with me**. The job door comes first and the client door last, which matches `CLAUDE.md` §1. Edit `site.json` `nav`.
- Footer: replace the raw text "see /how-i-work/" with a real link, and add **How I work** to the footer links. It's the site's strongest differentiator and is currently only reachable by typing the URL. Don't add it to the nav: five items plus the theme toggle crowd the phone header (§5.4, no hamburger).

## 3. Home page

- **Proof strip.** Two of the three stats don't land for this audience:
  - "454 automated checks in Workspace" is a developer number. A hiring manager can't tell whether it's good.
  - "6 GRC labs… see /work/" sends readers to a page with 3 GRC cards. That mismatch is exactly what the site's own verification rule warns against.

  Proposed set:
  1. SOX audit compliance, 63–70% → 99%+ in one month (keep).
  2. "A+ · Network+ · Security+ · ITIL 4", labelled "CompTIA and ITIL certified" (2025–2026). For entry IT this is the first thing screened.
  3. "5 case studies", labelled "each one marks what's verified and what isn't". Count the case studies at build time from `content/case-studies/` instead of hard-coding, so it can't go stale.
- Give "What I'm looking for" an `<h2>`. Right now it's a floating callout between sections.

## 4. Every page ends with a next step

The biggest flow problem: case studies, About and How I work all end in the footer, so a reader who just finished the best page has nowhere to go but Back. Fix it in `build.mjs` so it's automatic:

- **Case studies.** After the body, add a panel with a link to the **next case study** (by `featured` order, then the rest; the last one wraps to the first), plus **Resume** and **Email me** buttons. Client-work case studies point to `/work-with-me/` instead of Resume.
- **Static pages.** An optional `next:` front-matter field, rendered as the same panel:
  - About → Work and Resume
  - How I work → Work
  - Work with me → Email
- **Resume.** Already done: it ends with a panel pointing to `/work/`.

## 5. Work index: two doors, no repeats

With 5 case studies spread across 6 tag sections, the GRC program and Workspace cards each appear 3 times. The page looks bigger than it is, and then visibly repeats itself. Replace the tag sections with two groups:

- **For employers.** Every case study not tagged `web`, ordered by `featured`, then title.
- **Client work.** Tagged `web`.

Keep the tags as small labels on each card. Drop the "Jump to" line. Revisit tag sections only if the count passes about 10.

## 6. Fixes

- **The verification line is never shown.** Every case study has a required `verified:` field, and three of them say "See the verification line above", but `build.mjs` never renders it. Render it under the summary in the case header, for example `<p class="verified">Verified: …</p>`, styled with tokens. This is the site's core honesty promise, so it's the most important fix in this list.
- **Missing `<h1>`.** `/about/` has none (it opens with a paragraph) and `/how-i-work/` starts at `##`. Add `# About` and `# How I work`. §5.9 requires one `h1` per page. Consider adding a check in `check.mjs`: exactly one `<h1>` per built page.
- **About mentions "a Windows settings tool that journals every change"** (WinSysConfig), which has no case study. Either cut it for now or say "in progress" with no link. `TODO(michael)`.
- **GRC case study.** Merge `grc-paper-project-coffee-shop` PR #1 once the 30-day threshold question is settled. Then update the "What went wrong / What's verified" sections so the story ends fixed, not pending (§13.8: verify against the merged repo first).
- **`CLAUDE.md` housekeeping.** Change Workspace "277 checks" to 454 in §1, §3 and §11, verified against the Workspace repo. Update §3's `/resume/` line, §6's resume file list, and §2 with the resume pipeline (see the decision row added on this branch).

## 7. Resume follow-ups

- **GRC base.** Port the GRC resume to `content/resume/grc.md` with `label: GRC and compliance version` and no `site:` line. It automatically appears as a second download on `/resume/`. Source content: the current site resume, which is in git history in `content/pages/resume.md` before this branch, minus "U.S. Citizen".
- **Operations base (Area Manager).** Keep it out of this public repo. Extend `tools/build-resumes.mjs` to also read `private/resume/*.md` and write those PDFs only to `private/`, never to `static/`. `TODO(michael)`: confirm.
- **Retire the old pipeline** once the GRC base exists:
  - Delete `static/resume/Michael_Nault_Resume.pdf` and `tools/generate_resume_pdf.py`.
  - Add a `static/_redirects` 301 from `/resume/Michael_Nault_Resume.pdf` to the new IT PDF, so any link already sent to employers keeps working. First confirm that Workers static assets honour `_redirects`; `CLAUDE.md` §2 says they do, but verify against Cloudflare's docs.

## 8. Later

- **Custom domain** (`michaelnault.com` or similar, Cloudflare Registrar). Do it before the public launch post (Phase 5), and before printing the URL on many resumes. The resume `links:` line and `BASE_URL` in `build.mjs` change together.

## Order and done-when

| PR | Item | Done when |
|---|---|---|
| 1 | §6 verification line + H1s | Every case study shows its verified line; every page has one `h1` |
| 2 | §2 nav and footer | Nav order changed; How I work linked from the footer on every page |
| 3 | §4 next steps | No page except the 404 ends without a next-step panel |
| 4 | §5 Work index | Each case study appears exactly once on `/work/` |
| 5 | §1 and §3 positioning and proof strip | Michael approved the copy; proof stats count from content |
| 6 | §7 GRC base | Two PDFs offered on `/resume/`; old PDF redirected |
| 7 | §6 GRC PR merge + case-study update, About fixes | Verified against the merged repo |
