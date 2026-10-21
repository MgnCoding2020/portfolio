---
title: "Workspace: A SharePoint-Style Intranet on Three Backends"
slug: workspace
summary: "A data-driven intranet that runs identically from memory, the browser, or a real Microsoft 365 tenant — live-tenant verified, a stored XSS found and fixed across 60 sinks, 454 automated checks."
date: 2026-10
status: "In progress"
verified: "Confirmed directly against the repo's own docs/STATUS.md as of 2026-10-21 (repo unchanged since its 2026-10-16 commit, so this is current, not stale): 3 backends, ~4,700 lines of app code, 454 passing Playwright checks. A live Microsoft 365 tenant was verified in September 2026 (sign-in, list reads/writes, a document library, a real Power Automate flow, real Entra-group persona derivation), confirmed directly by Michael — the trial subscription lapsed shortly after, and no live tenant is connected right now. Everything built in October (the F1-F10 fixes, the timesheet module) came after the trial lapsed, so none of it has been re-verified live. The stored-XSS fix (60 sinks) was verified by reproducing the exploit across 6 real surfaces."
audience: [m365, iam, security]
stack: [JavaScript, SharePoint REST, MSAL, Microsoft Graph, PowerShell, Playwright]
repo: https://github.com/MgnCoding2020/workspace
featured: 2
---

<!-- DRAFT: fourth case study, written per CLAUDE.md §3 template. Repo made public by Michael 2026-10-21. -->

## At a glance

- **Problem:** A SharePoint-style intranet usually can't be demoed, reviewed, or iterated on without an actual Microsoft 365 tenant sitting behind it — expensive, slow to set up, and risky to experiment against directly.
- **What I built:** One data interface with three interchangeable backends — in-memory, the browser's own storage, and a real SharePoint tenant — so the same UI runs instantly for review, and for real against Microsoft 365 when it matters.
- **Evidence:** ~4,700 lines of application code; 454 automated Playwright checks passing; a live Microsoft 365 tenant verified (sign-in, list reads/writes, a document library, a real Power Automate flow, real persona derivation from Entra group membership); a stored XSS found and fixed across 60 sinks, reproduced on 6 real surfaces.
- **Status:** In progress. No live tenant is connected right now — see the verified line above for why that's a subscription gap, not a code gap.

## The problem

Building something that's supposed to behave like SharePoint usually means either mocking SharePoint badly, or paying for a tenant before you've written a line of UI code. Neither is a good way to iterate. I wanted a single codebase where the exact same interface could run instantly from memory for day-to-day development, persist locally in a browser for a closer-to-real demo, and — without changing a line of UI code — talk to an actual Microsoft 365 tenant when it was time to prove it for real.

## What I built

<figure>
<svg viewBox="0 0 468 166" role="img" aria-labelledby="dtitle4 ddesc4" xmlns="http://www.w3.org/2000/svg">
  <title id="dtitle4">One provider interface, three backends</title>
  <desc id="ddesc4">The UI talks to one provider interface, which is implemented three interchangeable ways: in-memory, browser storage via IndexedDB, or a real SharePoint tenant over REST and Graph.</desc>
  <defs>
    <marker id="mb4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--brand)"/>
    </marker>
  </defs>
  <rect x="10" y="20" width="100" height="46" rx="8" fill="var(--surface)" stroke="var(--brand)" stroke-width="1.5"/>
  <text x="60" y="43" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-sans)" font-size="13.5" fill="var(--text)">UI</text>
  <rect x="138" y="20" width="158" height="46" rx="8" fill="var(--surface)" stroke="var(--brand)" stroke-width="1.5"/>
  <text x="217" y="43" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-sans)" font-size="13.5" fill="var(--text)">Provider interface</text>
  <line x1="110" y1="43" x2="138" y2="43" stroke="var(--brand)" stroke-width="1.5" marker-end="url(#mb4)"/>
  <rect x="10" y="110" width="100" height="46" rx="8" fill="var(--surface)" stroke="var(--brand)" stroke-width="1.5"/>
  <text x="60" y="133" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-sans)" font-size="13.5" fill="var(--text)">Memory</text>
  <rect x="138" y="110" width="100" height="46" rx="8" fill="var(--surface)" stroke="var(--brand)" stroke-width="1.5"/>
  <text x="188" y="133" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-sans)" font-size="13.5" fill="var(--text)">IndexedDB</text>
  <rect x="266" y="110" width="192" height="46" rx="8" fill="var(--surface)" stroke="var(--brand)" stroke-width="1.5"/>
  <text x="362" y="133" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-sans)" font-size="13.5" fill="var(--text)">SharePoint REST + Graph</text>
  <line x1="217" y1="66" x2="60" y2="110" stroke="var(--brand)" stroke-width="1.5" marker-end="url(#mb4)"/>
  <line x1="217" y1="66" x2="188" y2="110" stroke="var(--brand)" stroke-width="1.5" marker-end="url(#mb4)"/>
  <line x1="217" y1="66" x2="362" y2="110" stroke="var(--brand)" stroke-width="1.5" marker-end="url(#mb4)"/>
</svg>
<figcaption>The UI talks to one provider interface, implemented three interchangeable ways: in-memory, browser storage via IndexedDB, or a real SharePoint tenant over REST and Graph.</figcaption>
</figure>

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

- **Verified live, against a real Microsoft 365 tenant, in September 2026:** sign-in, list reads/writes, the Controlled Documents library's upload and read, a real Power Automate flow with a real write-back, and real persona derivation from Entra group membership — which caught and fixed a real bug along the way (a Graph permission scope that let the group-membership call succeed but silently returned every group's name as `null`, fixed by requesting the correct scope).
- **No live tenant is connected right now.** The trial subscription used for all of the above lapsed shortly after that September testing. Reconnecting is a configuration and re-provisioning step, not new code — but everything built since (October's F1-F10 fixes and the Timesheet module) hasn't had a live tenant to re-verify against.
- **Built and verified against the `memory`/`local` backends, not yet tried against a live tenant:** the SharePoint provider's request/response handling (proven against realistic fixtures, not a real tenant); the department-library engine beyond the one library already confirmed live; and the full Timesheet module — entries, validation, submission, and a manager approvals queue with aging/escalation.
- **Known gaps, left visible rather than hidden:** the Content Security Policy still needs `'unsafe-inline'` for 146 inline `style=""` attributes, not yet cleaned up; view filtering runs client-side rather than pushed to the server; there's no file upload from inside the app itself, only via the provisioning scripts; and the "Alert me" / Workflow Builder flows are descriptive, not yet executable against a real backend.

## What I'd do next

- Reconnect a SharePoint trial tenant and re-verify the Timesheet module and the newer department-library work against it — this is the main reason this case study still says "In progress," not a code gap.
- Clean up the 146 inline style attributes so the CSP can drop `'unsafe-inline'` for styles entirely.
- Push view filtering server-side (OData/CAML) instead of client-side, for real data volume.

## Links

- Repo: [github.com/MgnCoding2020/workspace](https://github.com/MgnCoding2020/workspace)
