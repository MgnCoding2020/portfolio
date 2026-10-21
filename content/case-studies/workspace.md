---
title: "Workspace: A SharePoint-Style Intranet on Three Backends"
slug: workspace
summary: "A data-driven intranet that runs identically from memory, the browser, or a real Microsoft 365 tenant — live-tenant verified, a stored XSS found and fixed across 60 sinks, 454 automated checks."
date: 2026-10
status: "In progress"
verified: "Confirmed directly against the repo's own docs/STATUS.md as of 2026-10-21 (repo unchanged since its 2026-10-16 commit, so this is current, not stale): 3 backends, ~4,700 lines of app code, 454 passing Playwright checks. A live Microsoft 365 tenant was verified historically (sign-in, list reads/writes, a document library, a real Power Automate flow, real Entra-group persona derivation) — but no live tenant is connected right now; the trial subscription hasn't been renewed. The timesheet module is fully built and verified against the memory/local backends, not yet tried against SharePoint. The stored-XSS fix (60 sinks) was verified by reproducing the exploit across 6 real surfaces."
audience: [m365, iam, security]
stack: [JavaScript, SharePoint REST, MSAL, Microsoft Graph, PowerShell, Playwright]
repo: https://github.com/MgnCoding2020/workspace
featured: 2
---

<!-- DRAFT: fourth case study, written per CLAUDE.md §3 template. Diagram is a placeholder -- no visual design yet (content-first step, §5.2 step 3). NOTE: the workspace repo is currently PRIVATE -- the Links section below will 404 for a visitor until that changes. Flagged for Michael, not changed here. -->

## At a glance

- **Problem:** A SharePoint-style intranet usually can't be demoed, reviewed, or iterated on without an actual Microsoft 365 tenant sitting behind it — expensive, slow to set up, and risky to experiment against directly.
- **What I built:** One data interface with three interchangeable backends — in-memory, the browser's own storage, and a real SharePoint tenant — so the same UI runs instantly for review, and for real against Microsoft 365 when it matters.
- **Evidence:** ~4,700 lines of application code; 454 automated Playwright checks passing; a live Microsoft 365 tenant verified (sign-in, list reads/writes, a document library, a real Power Automate flow, real persona derivation from Entra group membership); a stored XSS found and fixed across 60 sinks, reproduced on 6 real surfaces.
- **Status:** In progress. No live tenant is connected right now — see the verified line above for why that's a subscription gap, not a code gap.

## The problem

Building something that's supposed to behave like SharePoint usually means either mocking SharePoint badly, or paying for a tenant before you've written a line of UI code. Neither is a good way to iterate. I wanted a single codebase where the exact same interface could run instantly from memory for day-to-day development, persist locally in a browser for a closer-to-real demo, and — without changing a line of UI code — talk to an actual Microsoft 365 tenant when it was time to prove it for real.

## What I built

[diagram: UI → one provider interface → three backends (memory / IndexedDB / SharePoint REST + Graph)]

One provider interface sits behind the entire UI — lists, a document library, a command palette, a Workflow Builder, Teams-style channels, a timesheet module with manager approvals. Three backends implement that interface: `memory` (nothing persists, instant), `local` (persists in the browser via IndexedDB), and `sharepoint` (a real tenant, via MSAL sign-in and the SharePoint REST API plus Microsoft Graph for identity). Switching backends doesn't change the UI code at all — the same bugs show up (or don't) regardless of which one is running, which is what let the stored-XSS bug below get caught in the first place.

MSAL handles sign-in interactively, with no client secret ever required — vendored locally at a pinned exact version rather than imported from a floating CDN tag, specifically so the authentication code can't change without a commit to this repo. A real Power Automate flow was built and tested against the live tenant: a recurrence trigger, real day-count math, and a real write-back onto a live list item.

## Decisions and trade-offs

- **Chose one provider interface behind three backends, instead of mocking SharePoint separately**, because the same UI code path needs to behave identically whether it's running from memory or against a real tenant — that's what makes a bug caught during memory/local development a bug that's actually fixed everywhere, not just in a mock.
- **Chose to vendor MSAL at a pinned exact version instead of a floating CDN import**, because authentication code is exactly the kind of thing that shouldn't be able to change without a commit to this repo.
- **Chose interactive sign-in with no client secret**, because a secret existing at all is a credential someone could eventually leak, and this app's design makes one structurally unnecessary.
- **Chose not to claim real permission enforcement**, even though the persona switcher looks like it. Under the `sharepoint` provider, switching personas changes what the UI shows, never what the tenant actually permits — that's SharePoint's own server-side job, and the project says so directly rather than let the UI imply otherwise.

## What went wrong, and what I changed

On 2026-10-10, I found a real stored XSS: a list-rendering file interpolated an item's field straight into `innerHTML` with no escaping. A list item saved with an `<img src=x onerror="...">` payload as a field value would run that script the moment the list rendered — for anyone who saw it. That matters more than a typical demo bug: the SharePoint provider's session token lives in the same browser a planted item would execute in, so under a live tenant this is the textbook stored-XSS-to-account-compromise chain, not a cosmetic issue.

I fixed it across all 60 `innerHTML`/`insertAdjacentHTML` sinks that existed in the app at the time — not just the one file where it was found, since the same unescaped pattern was repeated elsewhere. I didn't trust that fix just because the tests passed afterward: I reproduced the exact exploit payload and confirmed it was neutralized across 6 independently real surfaces — a list item, a Workflow Builder entry, an access request, a command-palette search result, a submitted form's own values, and a reflected route name. A Content Security Policy went in as defense in depth right after, not as a substitute for the fix itself.

## What's verified, and what isn't

- **Verified live, against a real Microsoft 365 tenant (historically — not connected right now):** sign-in, list reads/writes, the Controlled Documents library's upload and read, a real Power Automate flow with a real write-back, and real persona derivation from Entra group membership — which caught and fixed a real bug along the way (a Graph permission scope that let the group-membership call succeed but silently returned every group's name as `null`, fixed by requesting the correct scope).
- **No live tenant is connected right now.** The trial subscription used for all of the above still exists but isn't currently active in this clone — reconnecting is a configuration and re-provisioning step, not new code.
- **Built and verified against the `memory`/`local` backends, not yet tried against a live tenant:** the SharePoint provider's request/response handling (proven against realistic fixtures, not a real tenant); the department-library engine beyond the one library already confirmed live; and the full Timesheet module — entries, validation, submission, and a manager approvals queue with aging/escalation.
- **Known gaps, left visible rather than hidden:** the Content Security Policy still needs `'unsafe-inline'` for 146 inline `style=""` attributes, not yet cleaned up; view filtering runs client-side rather than pushed to the server; there's no file upload from inside the app itself, only via the provisioning scripts; and the "Alert me" / Workflow Builder flows are descriptive, not yet executable against a real backend.

## What I'd do next

- Reconnect a SharePoint trial tenant and re-verify the Timesheet module and the newer department-library work against it — this is the main reason this case study still says "In progress," not a code gap.
- Clean up the 146 inline style attributes so the CSP can drop `'unsafe-inline'` for styles entirely.
- Push view filtering server-side (OData/CAML) instead of client-side, for real data volume.

## Links

- Repo: [github.com/MgnCoding2020/workspace](https://github.com/MgnCoding2020/workspace) *(currently private — see note to Michael)*
