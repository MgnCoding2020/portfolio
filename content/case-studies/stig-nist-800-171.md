---
title: "STIG Hardening and a NIST SP 800-171 Baseline Scan"
slug: stig-nist-800-171
summary: "Two complementary Windows 10 labs: a broad automated SCAP baseline scan, and a small set of DISA STIG controls implemented and validated by hand with exported evidence, both mapped to NIST SP 800-171."
date: 2026-06
status: "Simulation"
verified: "Both labs' repos confirmed present and matching their documented figures as of 2026-10-21. The hardening lab's 4 controls and the baseline scan's findings were checked against each other directly -- they use different DISA STIG ID schemes with no crosswalk available, so they're presented here as two separate, complementary labs, not one scan-then-fix project. See 'What went wrong' below."
audience: [grc, endpoint]
stack: [PowerShell]
repo: https://github.com/MgnCoding2020/stig-800-171-compliance-lab
---

<!-- DRAFT: second case study, written per CLAUDE.md §3 template. Diagram is a placeholder -- no visual design yet (content-first step, §5.2 step 3). -->

## At a glance

- **Problem:** Windows hardening guidance usually ends up as either a document nobody follows, or a one-time scan nobody acts on. Neither one produces evidence that a control actually works.
- **What I built:** Two labs that cover both halves of that gap. A SCAP benchmark scan establishes a baseline across 225 Windows 10 STIG rules. Separately, 4 of those controls are implemented by hand, validated, and backed with exported evidence rather than just a checklist.
- **Evidence:** 225 rules scanned (137 open findings, 75 not-a-finding, 13 N/A, ~35% baseline compliance); 4 controls implemented with PowerShell enforcement, validation, and evidence-export scripts for each.
- **Status:** Simulation/lab work on a standalone VM, not a production system. See the verification line above.

## The problem

A STIG scan tells you where a system stands against a benchmark, but a list of 137 open findings isn't itself a plan — someone still has to pick what to fix, implement it correctly, and prove it stuck. I built two small labs to practice both ends of that: scanning broadly to see the real scale of a baseline system's gaps, and separately taking a handful of specific controls all the way through implementation, validation, and evidence export, the way an auditor would actually want to see it.

## What I built

<figure>
<svg viewBox="0 0 562 166" role="img" aria-labelledby="dtitle2 ddesc2" xmlns="http://www.w3.org/2000/svg">
  <title id="dtitle2">Baseline scan and hardening lab, run separately</title>
  <desc id="ddesc2">A SCAP benchmark scan assesses 225 rules and finds 137 open. Separately, 4 controls are implemented, validated, and their evidence exported. Both map to NIST SP 800-171, but are two distinct efforts, not one pipeline.</desc>
  <defs>
    <marker id="mb2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--brand)"/>
    </marker>
    <marker id="mm2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--text-muted)"/>
    </marker>
  </defs>
  <text x="10" y="10" text-anchor="start" font-family="var(--font-sans)" font-size="10" fill="var(--text-muted)">BASELINE SCAN</text>
  <rect x="10" y="20" width="100" height="46" rx="8" fill="var(--surface)" stroke="var(--text-muted)" stroke-width="1.5"/>
  <text x="60" y="43" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-sans)" font-size="13.5" fill="var(--text)">SCAP scan</text>
  <rect x="138" y="20" width="100" height="46" rx="8" fill="var(--surface)" stroke="var(--text-muted)" stroke-width="1.5"/>
  <text x="188" y="43" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-sans)" font-size="13.5" fill="var(--text)">225 rules</text>
  <rect x="266" y="20" width="151" height="46" rx="8" fill="var(--surface)" stroke="var(--text-muted)" stroke-width="1.5"/>
  <text x="342" y="43" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-sans)" font-size="13.5" fill="var(--text)">137 open findings</text>
  <line x1="110" y1="43" x2="138" y2="43" stroke="var(--text-muted)" stroke-width="1.5" marker-end="url(#mm2)"/>
  <line x1="238" y1="43" x2="266" y2="43" stroke="var(--text-muted)" stroke-width="1.5" marker-end="url(#mm2)"/>
  <text x="10" y="100" text-anchor="start" font-family="var(--font-sans)" font-size="10" fill="var(--text-muted)">HARDENING LAB</text>
  <rect x="10" y="110" width="103" height="46" rx="8" fill="var(--surface)" stroke="var(--brand)" stroke-width="1.5"/>
  <text x="62" y="133" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-sans)" font-size="13.5" fill="var(--text)">4 controls</text>
  <rect x="141" y="110" width="100" height="46" rx="8" fill="var(--surface)" stroke="var(--brand)" stroke-width="1.5"/>
  <text x="191" y="133" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-sans)" font-size="13.5" fill="var(--text)">Implement</text>
  <rect x="269" y="110" width="100" height="46" rx="8" fill="var(--surface)" stroke="var(--brand)" stroke-width="1.5"/>
  <text x="319" y="133" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-sans)" font-size="13.5" fill="var(--text)">Validate</text>
  <rect x="397" y="110" width="137" height="46" rx="8" fill="var(--surface)" stroke="var(--brand)" stroke-width="1.5"/>
  <text x="466" y="133" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-sans)" font-size="13.5" fill="var(--text)">Evidence export</text>
  <line x1="113" y1="133" x2="141" y2="133" stroke="var(--brand)" stroke-width="1.5" marker-end="url(#mb2)"/>
  <line x1="241" y1="133" x2="269" y2="133" stroke="var(--brand)" stroke-width="1.5" marker-end="url(#mb2)"/>
  <line x1="369" y1="133" x2="397" y2="133" stroke="var(--brand)" stroke-width="1.5" marker-end="url(#mb2)"/>
</svg>
<figcaption>Two separate efforts, both mapping to NIST SP 800-171: a broad automated scan (top), and a small set of hand-validated controls (bottom).</figcaption>
</figure>

**The baseline scan** (`windows10-stig-baseline-assessment`): a SCAP Compliance Checker scan against a pre-hardening Windows 10 VM, using the DISA Windows 10 STIG Benchmark V3R7. Full results: 225 rules assessed, 137 open, 75 not-a-finding, 13 not applicable, about 35% compliance. Five of the highest-severity findings (password history, account lockout threshold, audit logon events, firewall, SMBv1) are documented in detail as a curated sample, not all 137 individually.

<figure>
<img src="/img/stig-nist-800-171/stig-compliance-chart.webp" alt="STIG Viewer compliance donut chart showing 225 total rules: 137 open, 75 not a finding, 13 not applicable, 0 not reviewed, for a 35% compliance score." width="382" height="384">
<figcaption>The actual STIG Viewer compliance chart from the baseline scan — these are the real numbers cited above, not a reconstruction.</figcaption>
</figure>

<figure>
<img src="/img/stig-nist-800-171/stig-findings-list.webp" alt="STIG Viewer rule list for the baseline scan, showing a long column of individually color-coded pass (green) and fail (red) results across the 225 assessed rules." width="856" height="755">
<figcaption>The scan's full rule list — every one of the 225 rules gets an individual pass/fail result, not just a summary count.</figcaption>
</figure>

<figure>
<img src="/img/stig-nist-800-171/stig-rule-detail.webp" alt="STIG Viewer detail view for rule V-220742, WN10-AC-000020, 'The password history must be configured to 24 passwords remembered,' showing a failed result with its CAT II severity and full remediation text." width="1391" height="749">
<figcaption>One rule's full detail view — this is the level of specificity behind every one of the 137 open findings, not just a number.</figcaption>
</figure>

**The hardening lab** (`stig-800-171-compliance-lab`): 4 specific DISA STIG controls — firewall enabled, inbound traffic restricted, firewall logging enabled, and account lockout policy — each implemented via local policy/PowerShell, validated, and backed by exported evidence, mapped to NIST SP 800-171. Its own README is upfront that this is a narrow slice: "Additional control families planned."

<figure>
<img src="/img/stig-nist-800-171/firewall-hardening-evidence.webp" alt="Windows Defender Firewall with Advanced Security console showing the Domain, Private, and Public profiles all enabled, with inbound connections blocked by default — the exported evidence for the firewall control." width="1310" height="545">
<figcaption>Exported evidence from the hardening lab: all three firewall profiles on, inbound blocked by default — the control this case study's firewall bullet is actually describing.</figcaption>
</figure>

## Decisions and trade-offs

- **Chose to scope the hardening lab to 4 controls instead of attempting broad coverage**, because evidence-backed validation of a few controls beats an unverified checklist of many — the same principle the GRC Security Program case study makes about automating evidence checks.
- **Chose an automated SCAP scan for the baseline rather than starting with hand validation**, because that's how a real assessment actually starts: triage broadly first, then decide where hand-validation effort is worth spending.
- **Chose not to present these as one continuous "scan, then fix" story**, once I couldn't confirm the two labs' findings actually overlap — see below.

## What went wrong, and what I changed

While fact-checking this case study (and a resume line that fed into it), I found I'd been describing these two labs as a single project: scan 225 rules, then fix 4 of the findings it turned up. That's not something I'd actually confirmed.

The hardening lab identifies its controls by DISA Vulnerability ID — `V-241989`, `V-241990`, `V-241991`, `V-220739`/`V-220740`/`V-220741`. The baseline scan's documented findings use a different identifier format — Rule IDs like `WN10-FW-000030` and `WN10-AC-000005`. Real DISA STIGs do carry both an ID scheme for the same underlying checklist item, so these could plausibly be the same controls — but I don't have a crosswalk to confirm it, and the baseline scan repo only documents 5 of its 137 findings in enough detail to check against. Two of those five are in the same problem areas as the hardening lab's controls (firewall, account lockout), but "same problem area" isn't "same verified finding."

The honest version: two labs, built independently, that happen to cover some of the same ground. I corrected the framing here and in my resume rather than publish the tidier, unconfirmed story.

## What's verified, and what isn't

- **Verified (confirmed 2026-10-21):** the hardening lab's 4 controls and their specific DISA Vulnerability IDs; PowerShell enforcement, validation, and evidence-export scripts exist for each; the baseline scan's rule counts (225/137/75/13) and ~35% compliance score.
- **Not verified:** whether the hardening lab's 4 controls are actually among the baseline scan's 137 open findings — no ID crosswalk available, and the scan doesn't itemize all 137 rules in the repo.
- **Not yet done:** running the baseline scan's SCAP benchmark against the hardening lab's VM, before and after its 4 controls are applied, so a before/after compliance delta is actually measured on one system instead of implied across two.

## What I'd do next

- Run the SCAP benchmark against the hardening lab's own VM, before and after its 4 controls, to get a real measured delta instead of two separate numbers.
- Expand the hardening lab's control count — 4 of 225 is intentionally narrow for now.
- Build an actual Vuln-ID-to-Rule-ID crosswalk if I want to keep describing this as connected work rather than two parallel labs.

## Links

- Repo: [github.com/MgnCoding2020/stig-800-171-compliance-lab](https://github.com/MgnCoding2020/stig-800-171-compliance-lab)
- Related baseline scan: [github.com/MgnCoding2020/windows10-stig-baseline-assessment](https://github.com/MgnCoding2020/windows10-stig-baseline-assessment)
