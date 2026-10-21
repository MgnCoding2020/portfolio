# Wireframe: Case study

Built against the real `grc-security-program.md` content already in the repo — not placeholder text.

## Desktop (1024px+)

```
+----------------------------------------------------------------+
| Michael Nault              Work   Work with me   About  Resume |
+----------------------------------------------------------------+
| GRC Security Program: Burn and Churn Coffee     [Simulation]    |
| A full security program for a fictional coffee shop: risk       |
| register, 11 NIST 800-53 controls crosswalked to PCI DSS 4.0.1, |
| an evidence pack with automated checks, a vendor risk            |
| assessment, and quarterly access reviews.                        |
|                                                                   |
|  +--------------------------------------------------------+     |
|  | AT A GLANCE                                              |    |
|  | Problem:  A small card-accepting business has no         |    |
|  |           documented security program...                 |    |
|  | Built:    A complete program -- asset inventory, risk     |    |
|  |           register, 11-control matrix...                  |    |
|  | Evidence: 4 policies, 4 procedures, 4 playbooks, 11        |   |
|  |           controls, 4 vendor findings, 5-system review     |   |
|  | Status:   Control matrix/policies/evidence/POA&M confirmed |   |
|  |           present 2026-10-20. Evidence-check fix open as   |   |
|  |           PR, tested, not yet merged.  <- verified line,    |  |
|  |           ALWAYS shown, even mid-fix                        |  |
|  +--------------------------------------------------------+     |
|                                                                   |
|  THE PROBLEM                                                     |
|  (3-5 sentences, full width, max 68ch measure)                   |
|                                                                   |
|  WHAT I BUILT                                                    |
|  [diagram: risk -> control -> evidence -> validation -> POA&M,   |
|   vendor assessment feeding in as POAM-013]                      |
|  (short tour, numbered list of the 5 pieces)                      |
|                                                                   |
|  DECISIONS AND TRADE-OFFS                                        |
|  - Chose X over Y because Z   (3 bullets)                        |
|                                                                   |
|  WHAT WENT WRONG AND WHAT I CHANGED                               |
|  (the MFA-script duplication story -- this is the section a      |
|   hiring manager reads most closely, per CLAUDE.md §3)            |
|                                                                   |
|  WHAT'S VERIFIED, AND WHAT ISN'T                                  |
|  - Verified (confirmed 2026-10-20): ...                          |
|  - Verified by running the fix: ...                               |
|  - Not yet done: ...                                              |
|                                                                   |
|  WHAT I'D DO NEXT                                                 |
|  (3 bullets)                                                      |
|                                                                   |
|  LINKS                                                            |
|  Repo -> Vendor risk lab -> IAM access review lab                 |
|                                                                   |
+----------------------------------------------------------------+
| Footer                                                            |
+----------------------------------------------------------------+
```

## Phone (360px)

```
+----------------------------+
| Michael Nault              |
| Work / Work with me /      |
| About / Resume             |
+----------------------------+
| GRC Security Program:      |
| Burn and Churn Coffee      |
| [Simulation]                |
|                             |
| A full security program    |
| for a fictional coffee     |
| shop: risk register, 11    |
| NIST 800-53 controls...    |
+----------------------------+
| AT A GLANCE                 |
| Problem: ...                |
| Built: ...                  |
| Evidence: ...                |
| Status: ... (verified line,  |
| never collapsed/truncated)   |
+----------------------------+
| THE PROBLEM                 |
| (full width, same measure    |
| cap, just narrower column)   |
+----------------------------+
| WHAT I BUILT                |
| [diagram -- full width,      |
|  scales down, never          |
|  scrolls sideways]            |
| (numbered list)              |
+----------------------------+
| DECISIONS AND TRADE-OFFS    |
+----------------------------+
| WHAT WENT WRONG             |
+----------------------------+
| WHAT'S VERIFIED             |
+----------------------------+
| WHAT I'D DO NEXT            |
+----------------------------+
| LINKS                        |
+----------------------------+
| Footer                       |
+----------------------------+
```

## Notes

- The "At a glance" box is the one element every case study shares verbatim in structure (CLAUDE.md §3) — it's the thing to build as a reusable component in step 6, not a one-off per page.
- The **status/verified line is never hidden, truncated, or styled smaller than the rest of the box** — per the GRC case study itself, it has to stay visible even when it's saying "not yet merged," not just when everything's finished. That's the whole point of the honesty rule.
- Diagram placeholder `[diagram: ...]` becomes real inline SVG at step 7 (pages), per §5.7 — not before. On phone it needs to scale down without ever triggering horizontal scroll (§5.9 QA checklist).
- Body text column caps at `max-width: 68ch` per §5.3 even on wide desktop — the box above doesn't literally reflect that cap at ASCII width, just note it for step 7.
