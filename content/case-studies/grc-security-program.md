---
title: "GRC Security Program: Burn and Churn Coffee"
slug: grc-security-program
summary: "A full security program for a fictional coffee shop: risk register, 11 NIST 800-53 controls crosswalked to PCI DSS 4.0.1, an evidence pack with automated checks, a vendor risk assessment, and quarterly access reviews."
date: 2026-06
status: "Simulation"
verified: "Control matrix, policies, evidence pack, and POA&M confirmed present in the repo as of 2026-10-20. The Python evidence checks were verified by reading the code, not by running them — see 'What went wrong' below for what that review found."
audience: [grc, iam]
stack: [Python, Markdown, CSV]
repo: https://github.com/MgnCoding2020/grc-paper-project-coffee-shop
featured: 1
---

<!-- DRAFT: first full case study, written per CLAUDE.md §3 template. Diagram and screenshots are placeholders -- no visual design yet (content-first step, §5.2 step 3). -->

## At a glance

- **Problem:** A small card-accepting business has no documented security program — no risk register, no mapped controls, no way to prove anything to an auditor or a partner.
- **What I built:** A complete program for a fictional coffee shop — asset inventory, risk register, an 11-control matrix mapped to NIST SP 800-53 and crosswalked to PCI DSS 4.0.1, policies and procedures, an evidence pack with automated checks, a POA&M, a vendor risk assessment, and a quarterly access review.
- **Evidence:** 4 policies, 4 procedures, 4 incident-response playbooks, 11 controls, a companion vendor assessment with 4 tracked findings, and an access review across 5 systems — all present in the repo.
- **Status:** Simulation, for a fictional business ("Burn and Churn Coffee"). See the verification line above.

## The problem

Most small businesses that take card payments have no formal security program — not because they don't care, but because building one from scratch (a risk register, a control matrix mapped to a real framework, evidence that controls are actually followed) is a specialized skill most owners don't have and can't easily hire for at a small scale. I built this project to practice that whole arc end to end, for a fictional business, so I could show the complete shape of the work: not just a policy document, but a program with evidence behind it.

## What I built

[diagram: risk → control → evidence → validation → POA&M, with the vendor risk assessment feeding in as POAM-013]

The program has five pieces that connect to each other rather than standing alone:

1. **Risk register and asset inventory** — what the business has, what could go wrong.
2. **An 11-control matrix**, mapped to NIST SP 800-53 and crosswalked to PCI DSS 4.0.1, so the controls answer to two audiences at once: a general security framework and the card-payment standard that actually applies to this business.
3. **Policies, procedures, and playbooks** — 4 of each, the documents a control matrix needs to actually mean something.
4. **An evidence pack** — Python scripts that read the business's real operational data (an access-review CSV, an incident log) and flag exceptions automatically, instead of someone eyeballing a spreadsheet once a quarter.
5. **A POA&M** that tracks every open gap, including the companion vendor risk assessment of a simulated payroll vendor (inherent risk High, 4 findings, approved with conditions at Moderate residual risk) rolled in as POAM-013.

## Decisions and trade-offs

- **Chose a real framework crosswalk (NIST 800-53 → PCI DSS 4.0.1) over a single framework**, because a real small business answering to a card network doesn't get to pick just one — showing the crosswalk is more honest about what the job actually looks like.
- **Chose Python scripts over a manual review checklist for the evidence pack**, because a control that's checked by hand once a quarter is a control that quietly stops being checked. Automating the check doesn't replace judgment, but it means the exception can't hide.
- **Chose to fold the vendor risk assessment into this program's POA&M, rather than keep it as a fully separate project**, because that's how it would actually work for a real business — a vendor finding is a gap like any other, and it should live in the same tracking document.

## What went wrong, and what I changed

When I was fact-checking this case study against the actual repo, I found something I'd gotten wrong: the evidence pack claims four distinct automated checks, including one that flags accounts missing MFA. Looking at the actual code, three of the four scripts — the MFA check, the privileged-access check, and the segregation-of-duties check — are byte-for-byte identical. All three check privileged-access approval status. None of them actually reads `mfa-status.csv`, even though that file exists in the evidence folder with real exception data in it (two accounts with MFA disabled).

This is exactly the kind of gap the program is supposed to catch — a control that exists on paper (four named checks) but isn't actually doing four different things. I'm leaving it visible here rather than quietly fixing the repo and pretending the resume always said "two checks, not four": the honest version of this project includes catching my own mistake. The fix itself — differentiating the three scripts so each reads the file it's named for — is tracked below as a next step, not yet done.

## What's verified, and what isn't

- **Verified (present in the repo, confirmed 2026-10-20):** the risk register, the 11-control matrix with the PCI crosswalk, all 4 policies/procedures/playbooks, the POA&M, the vendor risk assessment findings and residual-risk rating, and the 5-system access review.
- **Verified by reading the code, not by running it:** the Python evidence checks. One script (incident-log review) is genuinely distinct and does what it claims. The other three currently duplicate the privileged-access check, as described above — they do not yet check MFA status or segregation of duties, despite their names.
- **Not yet done:** actually running the evidence checks end to end and capturing output as evidence, rather than just reading the source.

## What I'd do next

- Differentiate the three duplicate scripts so the MFA check reads `mfa-status.csv` and the SoD check does its own real comparison, instead of all three repeating the privileged-access check.
- Run the evidence pack end to end and commit real output, not just source code, as evidence.
- Add a short runbook so the quarterly access review and the evidence pack can be re-run by someone who isn't me.

## Links

- Repo: [github.com/MgnCoding2020/grc-paper-project-coffee-shop](https://github.com/MgnCoding2020/grc-paper-project-coffee-shop)
- Companion vendor risk assessment: [github.com/MgnCoding2020/Vendor-Risk-Assessment-Lab](https://github.com/MgnCoding2020/Vendor-Risk-Assessment-Lab)
- Companion IAM access review: [github.com/MgnCoding2020/IAM-Access-Review-Lab](https://github.com/MgnCoding2020/IAM-Access-Review-Lab)
