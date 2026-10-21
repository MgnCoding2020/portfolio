# Wireframe: Home

Design step 4 (CLAUDE.md §5.2) — plain greybox layout, no visual design yet. Content it's built from already exists in `content/site.json` (headline, subline, proofStrip, lookingFor) — nothing here is placeholder lorem ipsum.

## Desktop (1024px+)

```
+----------------------------------------------------------------+
| Michael Nault              Work   Work with me   About  Resume |
+----------------------------------------------------------------+
|                                                                  |
|  IT and GRC, built hands-on.                                    |
|  Six years in Amazon operations taught me that a control only   |
|  works when people follow it and you can prove it. Now I build  |
|  the systems and the evidence, for employers and for small      |
|  businesses.                                                    |
|                                                                  |
|  [ See the work ]   [ Resume ]   [ Email me ]                   |
|                                                                  |
+----------------------------------------------------------------+
|  63-70% -> 99%+     |      454          |         6             |
|  SOX audit           |  automated checks |  GRC labs mapped to  |
|  compliance, in       |  in Workspace,    |  NIST 800-53,        |
|  one month            |  verified Oct 2026|  NIST 800-171, PCI   |
|  (Amazon, 2023)       |                   |  DSS 4.0.1            |
+----------------------------------------------------------------+
|  FEATURED CASE STUDIES                                          |
|  +---------------+   +---------------+   +---------------+      |
|  | GRC Security   |   | Workspace      |   | Home EDR       |    |
|  | Program        |   | [In progress]  |   |                |    |
|  | one line        |   | one line        |   | one line        |  |
|  | [grc][iam]      |   | [m365][iam]     |   | [endpoint][grc] |  |
|  | [Simulation]    |   | [In progress]   |   | [Personal]      |  |
|  +---------------+   +---------------+   +---------------+      |
+----------------------------------------------------------------+
|  WHAT I'M LOOKING FOR                                            |
|  Entry-level roles in GRC and compliance, IT audit, Microsoft    |
|  365 administration or identity and access, in Orlando or        |
|  remote. I'd especially value a team that mentors.                |
+----------------------------------------------------------------+
|  ░░░ ALSO: WEBSITES AND TOOLS FOR SMALL BUSINESSES ░░░  <- visually
|  ░░░ distinct band (different background token), never  ░░░
|  ░░░ mixed into the job pitch above                     ░░░
|  ░░░                                                     ░░░
|  ░░░  +---------------+                                  ░░░
|  ░░░  | Little          |      -> See how I work with     ░░░
|  ░░░  | Saporito Press  |         small businesses         ░░░
|  ░░░  | one line        |         (/work-with-me/)          ░░░
|  ░░░  +---------------+                                  ░░░
+----------------------------------------------------------------+
|  Email · LinkedIn · GitHub · TryHackMe                           |
|  No cookies, no trackers, no third-party requests.                |
|  Last updated: (stamped by build.mjs from git log)                 |
+----------------------------------------------------------------+
```

## Phone (360px)

```
+----------------------------+
| Michael Nault              |
| Work                       |
| Work with me               |
| About                      |
| Resume                     |
+----------------------------+
| IT and GRC, built          |
| hands-on.                  |
|                             |
| Six years in Amazon        |
| operations taught me       |
| that a control only works  |
| when people follow it and  |
| you can prove it...        |
|                             |
| [ See the work ]           |
| [ Resume ]                 |
| [ Email me ]               |
+----------------------------+
| 63-70% -> 99%+              |
| SOX audit compliance,       |
| in one month                |
|-----------------------------|
| 454                         |
| automated checks in         |
| Workspace                   |
|-----------------------------|
| 6                            |
| GRC labs mapped to NIST/PCI  |
+----------------------------+
| FEATURED (stacked, 1 col)   |
| [ GRC Security Program ]    |
| [ Workspace - In progress ] |
| [ Home EDR ]                |
+----------------------------+
| WHAT I'M LOOKING FOR        |
| (paragraph, full width)      |
+----------------------------+
| ░░░ ALSO: WEBSITES & TOOLS ░|
| ░░░ [Little Saporito Press]░|
| ░░░ -> /work-with-me/      ░|
+----------------------------+
| Email                       |
| LinkedIn                    |
| GitHub                      |
| TryHackMe                   |
| Privacy note                |
| Last updated                |
+----------------------------+
```

## Notes

- Header has **no hamburger menu** (CLAUDE.md §5.4) — on phone, nav links just wrap/stack under the name. No JS needed.
- The proof strip is 3 columns desktop, stacks to 1 column on phone (§5.6).
- Featured cards: 3-across desktop/tablet-and-up at 1024px, 1 column below that per §5.4's card grid rule (1 col phone, 2 from 768px, 3 from 1024px) — cards are simple enough that 2-up at tablet width is fine too; worth testing both at step 7.
- The "Also: websites and tools" band needs a genuinely different background token (not just a border) so it reads as a separate zone, per the "never mixed into the job pitch" rule in §1.
- Workspace's card shows "In progress" per the Phase 2 plan (its full case study waits on Workspace fixes landing) — current status per our last check: F1–F10 done, U1–U3 underway, SharePoint connectivity not re-verified since Oct. Badge stays "In progress" until that's resolved.
