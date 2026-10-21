---
title: "Home EDR: From Watching My Own PC to a Governance Pipeline"
slug: home-edr
summary: "Scheduled PowerShell monitoring that started on my own PC, moved to a dedicated VM for clean evidence collection, and grew into a NIST 800-53 control-evidence pipeline, a 20-script incident-triage toolkit, and a 13-document playbook series."
date: 2026-05
status: "Personal project"
verified: "Confirmed directly in the repos as of 2026-10-21: 12 PowerShell monitoring scripts, 4 mapped NIST 800-53 controls with an auto-generated evidence matrix and a GitHub Action, and a POA&M whose findings are explicitly sourced from a dedicated VM lab (not the host). The triage toolkit's 20 scripts, the playbook series' 13 documents, and the monitoring lab's 6 Sysmon cases + 1 Wireshark capture were verified 2026-10-20 in an earlier pass."
audience: [endpoint, grc]
stack: [PowerShell]
repo: https://github.com/MgnCoding2020/HomeEDR-and-Governance-Security
featured: 3
---

<!-- DRAFT: third case study, written per CLAUDE.md §3 template. Diagram is a placeholder -- no visual design yet (content-first step, §5.2 step 3). -->

## At a glance

- **Problem:** After hardening my own Windows machine, I had no way to know if something changed later — an installer, an update, or something worse.
- **What I built:** Scheduled PowerShell monitoring that baselines a system and reports drift — first run against my own PC, then rebuilt against a dedicated VM so the governance layer could be collected cleanly. It grew into a NIST 800-53 control-evidence pipeline, a 20-script incident-triage toolkit, and a 13-document playbook series.
- **Evidence:** 12 monitoring scripts; 4 controls (AU-6, CM-6, CM-7, SC-7) with an auto-generated evidence matrix and a GitHub Action that regenerates it; a POA&M with 5 tracked findings sourced from the VM lab; 20 triage scripts; 13 playbook documents; 6 Sysmon investigation cases and 1 Wireshark capture in a companion monitoring lab.
- **Status:** Personal project, ongoing. See the verification line above.

## The problem

After hardening my own Windows 10 machine — least-privilege accounts, a deny-by-default firewall, unneeded services removed — I kept asking a simple question I couldn't answer: how would I know if any of that changed later? An update, an installer, or something worse could quietly undo the hardening, and I'd have no way to notice. That question is the entire reason this project exists.

## What I built

[diagram: PC → scheduled scan → compare to baseline → drift report → archive; separately, a dedicated VM feeds a NIST 800-53 evidence pipeline → POA&M; the same baseline work evolved into a 20-script triage toolkit and a 13-document playbook series]

**Monitoring:** 12 PowerShell scripts (health snapshots, service/scheduled-task/persistence posture, network audit, installed-app inventory, certificate expiry, privileged-group drift) that capture a baseline, run on a schedule via Task Scheduler, compare against it, and write drift reports. This started on my own PC — the README's own account is scripts that "slowly turned into a structured monitoring workflow."

**Governance layer:** once I wanted to track this as evidence rather than just notice drift, I set up a dedicated VM (the repo calls it `vm-win10pro`, with a `Baseline-Clean-Patched` checkpoint) specifically for evidence collection. Four controls — AU-6 (Audit Review), CM-6 (Configuration Settings), CM-7 (Least Functionality), SC-7 (Boundary Protection) — are mapped to specific evidence scripts, auto-generated into a control-evidence matrix, and kept current by a GitHub Action. The POA&M's 5 findings are explicitly drawn from that VM, not the host.

**Evolution:** the same baseline work grew into a 20-script PowerShell triage toolkit (each script safety-tagged read-only through destructive/recovery, with self-integrity hashing and a report manifest) and a companion 13-document playbook series covering the full incident-triage workflow — event-log interpretation, IOC handling, patch prioritization. A separate monitoring lab adds 6 real Sysmon-based investigation cases and a Wireshark packet capture.

## Decisions and trade-offs

- **Chose to rebuild evidence collection on a dedicated VM rather than keep using only my own PC**, because a lab built specifically for this gives a clean, documented starting point (`Baseline-Clean-Patched`) and lets the POA&M and control-evidence trail exist without needing to sanitize personal-machine specifics as heavily.
- **Chose PowerShell and Task Scheduler over a heavier agent-based tool**, because the point was to understand baseline/drift mechanics myself, not to stand up a commercial EDR.
- **Chose to keep raw evidence out of the repo entirely** — only sanitized samples are committed — rather than redact after the fact, because that's a safer default than hoping redaction never misses something.
- **Chose to grow this into a triage toolkit and playbook series instead of only adding more monitoring scripts**, because noticing drift and being ready to actually respond to it are different skills, and I wanted evidence I'd built both.

## What went wrong, and what I changed

The project's own POA&M is unusually candid about what isn't done yet, and I think that's worth surfacing here rather than only talking about what works. Two findings in particular:

**POAM-001** says baseline configuration integrity verification isn't automated — there's no file-hash check confirming the baseline itself hasn't been tampered with before a comparison runs. That's a real gap: a monitoring system that trusts an unverified baseline can be quietly defeated by modifying the baseline instead of the system. It's exactly the lesson the project's own README lists under "what I've learned" — "a baseline only matters if you protect and validate it" — written before I went looking for evidence of whether that lesson had actually been applied yet. It hadn't, not fully.

**POAM-002** says evidence collection currently runs manually rather than on a verified schedule with a last-run marker — so a missed run could create a silent gap in the record, and nothing would flag it.

Neither is fixed yet. I'm listing them here instead of only in the POA&M because a hiring manager reading a monitoring project should see the same gaps an auditor would flag, not just the parts that are finished.

## What's verified, and what isn't

- **Verified (confirmed 2026-10-21):** 12 PowerShell monitoring scripts; the 4-control evidence matrix and its GitHub Action; the POA&M's 5 findings and their VM-lab source; sanitization of sample output, confirmed by inspecting the actual sample files (hostnames, usernames, paths, and IPs are genuinely redacted, not just claimed).
- **Verified 2026-10-20 (earlier pass):** the triage toolkit's 20 scripts and the playbook series' 13 documents; the monitoring lab's 6 Sysmon cases and 1 Wireshark capture.
- **Not yet done, per the project's own POA&M:** baseline integrity isn't hash-verified (POAM-001); evidence collection isn't yet scheduled with a verification marker (POAM-002); Sysmon/Wazuh centralized monitoring is listed as "Planned," not deployed (POAM-003, POAM-004).

## What I'd do next

- Implement a baseline manifest with file hashes, validated before every comparison — directly closes POAM-001.
- Move evidence collection onto a real schedule with a last-run verification marker — directly closes POAM-002.
- Deploy Sysmon with a baseline configuration in the VM lab, and validate it actually generates events — POAM-003.

## Links

- Repo: [github.com/MgnCoding2020/HomeEDR-and-Governance-Security](https://github.com/MgnCoding2020/HomeEDR-and-Governance-Security)
- Triage toolkit: [github.com/MgnCoding2020/windows-triage-toolbox](https://github.com/MgnCoding2020/windows-triage-toolbox)
- Playbook series: [github.com/MgnCoding2020/windows-triage-playbooks](https://github.com/MgnCoding2020/windows-triage-playbooks)
- Companion monitoring lab: [github.com/MgnCoding2020/Cybersecurity-Monitoring-Lab](https://github.com/MgnCoding2020/Cybersecurity-Monitoring-Lab)
