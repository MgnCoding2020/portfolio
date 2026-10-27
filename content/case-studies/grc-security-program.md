---
title: "GRC Security Program: Burn and Churn Coffee"
card_title: GRC Security Program
slug: grc-security-program
summary: "A full security program for a fictional coffee shop: risk register, 15 NIST 800-53 controls crosswalked to PCI DSS 4.0.1, an evidence pack with automated checks, a vendor risk assessment, and quarterly access reviews."
date: 2026-06
status: "Simulation"
verified: "Control matrix, policies, evidence pack, and POA&M confirmed present in the repo as of 2026-10-20. Control count recounted row-by-row from control-matrix.md on 2026-10-25: 15 controls — 3 Implemented, 5 Partially Implemented, 7 Not Implemented, each open gap tracked to a POA&M item. An earlier pass said 11, taken from the repo README's summary line, which is stale relative to the matrix it describes. The evidence-check fix described below was merged to main on 2026-10-21 and re-confirmed on 2026-10-25: the three scripts are now byte-distinct on the default branch. The 30-day login-staleness threshold in access_review_check.py is still a judgment call pending a check against PR-003's stated cadence — see 'What went wrong' below."
verified_summary: "Confirmed in the repo 2026-10-20. 15 controls, recounted row-by-row 2026-10-25: 3 implemented, 5 partial, 7 not yet, every open gap tracked to a POA&M item."
audience: [grc, iam]
stack: [Python, Markdown, CSV]
repo: https://github.com/MgnCoding2020/grc-paper-project-coffee-shop
featured: 1
---

<!-- DRAFT: first full case study, written per CLAUDE.md §3 template. Diagram and screenshots are placeholders -- no visual design yet (content-first step, §5.2 step 3). -->

## At a glance

- **Problem:** A small card-accepting business has no documented security program — no risk register, no mapped controls, no way to prove anything to an auditor or a partner.
- **What I built:** A complete program for a fictional coffee shop — asset inventory, risk register, a 15-control matrix mapped to NIST SP 800-53 and crosswalked to PCI DSS 4.0.1, policies and procedures, an evidence pack with automated checks, a POA&M, a vendor risk assessment, and a quarterly access review.
- **Evidence:** 4 policies, 4 procedures, 4 incident-response playbooks, 15 controls (3 implemented, 5 partially, 7 not — every gap tracked to a POA&M item), a companion vendor assessment with 4 tracked findings, and an access review across 5 systems — all present in the repo.
- **Status:** Simulation, for a fictional business ("Burn and Churn Coffee").

## The problem

Most small businesses that take card payments have no formal security program — not because they don't care, but because building one from scratch (a risk register, a control matrix mapped to a real framework, evidence that controls are actually followed) is a specialized skill most owners don't have and can't easily hire for at a small scale. I built this project to practice that whole arc end to end, for a fictional business, so I could show the complete shape of the work: not just a policy document, but a program with evidence behind it.

## What I built

<figure>
<svg viewBox="0 0 635 178" role="img" aria-labelledby="dtitle ddesc" xmlns="http://www.w3.org/2000/svg">
  <title id="dtitle">Risk to evidence flow</title>
  <desc id="ddesc">Risk leads to a control, which produces evidence, which is validated, and tracked in a POA&amp;M. A separate vendor risk assessment feeds into the same POA&amp;M as item POAM-013.</desc>
  <defs>
    <marker id="mb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--brand)"/>
    </marker>
    <marker id="mm" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--text-muted)"/>
    </marker>
  </defs>
  <rect x="10" y="20" width="100" height="46" rx="8" fill="var(--surface)" stroke="var(--brand)" stroke-width="1.5"/>
  <text x="60" y="43" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-sans)" font-size="13.5" fill="var(--text)">Risk</text>
  <rect x="138" y="20" width="100" height="46" rx="8" fill="var(--surface)" stroke="var(--brand)" stroke-width="1.5"/>
  <text x="188" y="43" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-sans)" font-size="13.5" fill="var(--text)">Control</text>
  <rect x="266" y="20" width="100" height="46" rx="8" fill="var(--surface)" stroke="var(--brand)" stroke-width="1.5"/>
  <text x="316" y="43" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-sans)" font-size="13.5" fill="var(--text)">Evidence</text>
  <rect x="394" y="20" width="103" height="46" rx="8" fill="var(--surface)" stroke="var(--brand)" stroke-width="1.5"/>
  <text x="446" y="43" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-sans)" font-size="13.5" fill="var(--text)">Validation</text>
  <rect x="525" y="20" width="100" height="46" rx="8" fill="var(--surface)" stroke="var(--brand)" stroke-width="1.5"/>
  <text x="575" y="43" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-sans)" font-size="13.5" fill="var(--text)">POA&amp;M</text>
  <line x1="110" y1="43" x2="138" y2="43" stroke="var(--brand)" stroke-width="1.5" marker-end="url(#mb)"/>
  <line x1="238" y1="43" x2="266" y2="43" stroke="var(--brand)" stroke-width="1.5" marker-end="url(#mb)"/>
  <line x1="366" y1="43" x2="394" y2="43" stroke="var(--brand)" stroke-width="1.5" marker-end="url(#mb)"/>
  <line x1="497" y1="43" x2="525" y2="43" stroke="var(--brand)" stroke-width="1.5" marker-end="url(#mb)"/>
  <rect x="148" y="122" width="185" height="46" rx="8" fill="var(--surface)" stroke="var(--text-muted)" stroke-width="1.5"/>
  <text x="240" y="145" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-sans)" font-size="13.5" fill="var(--text)">Vendor risk assessment</text>
  <line x1="333" y1="122" x2="555" y2="66" stroke="var(--text-muted)" stroke-width="1.5" marker-end="url(#mm)"/>
  <text x="300.5" y="114" text-anchor="middle" font-family="var(--font-sans)" font-size="11.5" fill="var(--text-muted)">POAM-013</text>
</svg>
<figcaption>Risk leads to a control, which produces evidence, which is validated and tracked in a POA&amp;M. A separate vendor risk assessment feeds into the same POA&amp;M as POAM-013.</figcaption>
</figure>

The program has five pieces that connect to each other rather than standing alone:

1. **Risk register and asset inventory** — what the business has, what could go wrong.
2. **A 15-control matrix**, mapped to NIST SP 800-53 and crosswalked to PCI DSS 4.0.1, so the controls answer to two audiences at once: a general security framework and the card-payment standard that actually applies to this business.
3. **Policies, procedures, and playbooks** — 4 of each, the documents a control matrix needs to actually mean something.
4. **An evidence pack** — Python scripts that read the business's real operational data (an access-review CSV, an incident log) and flag exceptions automatically, instead of someone eyeballing a spreadsheet once a quarter.
5. **A POA&M** that tracks every open gap, including the companion vendor risk assessment of a simulated payroll vendor (inherent risk High, 4 findings, approved with conditions at Moderate residual risk) rolled in as POAM-013.

## Decisions and trade-offs

- **Chose a real framework crosswalk (NIST 800-53 → PCI DSS 4.0.1) over a single framework**, because a real small business answering to a card network doesn't get to pick just one — showing the crosswalk is more honest about what the job actually looks like.
- **Chose Python scripts over a manual review checklist for the evidence pack**, because a control that's checked by hand once a quarter is a control that quietly stops being checked. Automating the check doesn't replace judgment, but it means the exception can't hide.
- **Chose to fold the vendor risk assessment into this program's POA&M, rather than keep it as a fully separate project**, because that's how it would actually work for a real business — a vendor finding is a gap like any other, and it should live in the same tracking document.

## What went wrong, and what I changed

When I was fact-checking this case study against the actual repo, I found something I'd gotten wrong: the evidence pack claims four distinct automated checks, including one that flags accounts missing MFA. Looking at the actual code, three of the four scripts — `mfa_review_check.py`, `access_review_check.py`, and `privileged_access_review_check.py` — are byte-for-byte identical. All three check privileged-access approval status against `user-access-review.csv`. None of them actually reads `mfa-status.csv`, even though that file exists in the evidence folder with real exception data in it (two accounts with MFA disabled).

This is exactly the kind of gap the program is supposed to catch — a control that exists on paper (four named checks) but isn't actually doing four different things. I'm leaving it visible here rather than quietly fixing the repo and pretending it was always right: the honest version of this project includes catching my own mistake.

The fix turned out to be simpler than expected: the scripts' own README already documented what each check was supposed to do — the code had just never caught up. `mfa_review_check.py` now reads `mfa-status.csv` and correctly flags both accounts with MFA disabled. `access_review_check.py` now checks all accounts (not just privileged ones) for incomplete review sign-off and stale login activity, instead of repeating the privileged-access logic. `privileged_access_review_check.py` turned out to be the one that was already correct — it's what got copy-pasted into the other two. All three were re-tested against the repo's real evidence data and produced the expected flags. The fix was [merged to main on 2026-10-21](https://github.com/MgnCoding2020/grc-paper-project-coffee-shop/pull/1), and the three scripts are byte-distinct on the default branch — re-confirmed 2026-10-25. One question it raised is still open: the staleness threshold `access_review_check.py` uses for login activity (30 days) isn't specified anywhere in the project's own procedures, so it remains a judgment call pending a check against `PR-003-quarterly-access-review.md`'s actual cadence.

## What's verified, and what isn't

- **Verified (present in the repo, confirmed 2026-10-20):** the risk register, the 15-control matrix with the PCI crosswalk, all 4 policies/procedures/playbooks, the POA&M, the vendor risk assessment findings and residual-risk rating, and the 5-system access review.
- **Verified by running the fix against real repo data (2026-10-21):** `mfa_review_check.py`, `access_review_check.py`, and `privileged_access_review_check.py` are now distinct and each produces the expected flags. `incident_log_review_check.py` was already correct.
- **Verified on the default branch (2026-10-25):** the fix was merged 2026-10-21, and the three scripts now hash differently on `main` — the duplication is gone from the repo itself, not just from a branch.
- **Not yet done:** the 30-day login-staleness threshold in `access_review_check.py` still needs checking against the project's own quarterly-review procedure, `PR-003-quarterly-access-review.md`.

## What I'd do next

- Settle the 30-day staleness threshold in `access_review_check.py` against `PR-003-quarterly-access-review.md`'s stated cadence, rather than leaving it a judgment call.
- Run the full evidence pack end to end and commit real output, not just source code, as evidence.
- Add a short runbook so the quarterly access review and the evidence pack can be re-run by someone who isn't me.

## Links

- Repo: [github.com/MgnCoding2020/grc-paper-project-coffee-shop](https://github.com/MgnCoding2020/grc-paper-project-coffee-shop)
- Companion vendor risk assessment: [github.com/MgnCoding2020/Vendor-Risk-Assessment-Lab](https://github.com/MgnCoding2020/Vendor-Risk-Assessment-Lab)
- Companion IAM access review: [github.com/MgnCoding2020/IAM-Access-Review-Lab](https://github.com/MgnCoding2020/IAM-Access-Review-Lab)
