---
title: "Resume"
description: "Michael Nault's resume: IT and GRC, built hands-on."
---

<!-- DRAFT: ported from the private master resume, phone number dropped per CLAUDE.md §1 ("No phone number on the site" -- email and LinkedIn only). PDF versions still needed per the Phase 3 checklist (§11) -- not attached yet. -->

# Michael Nault

Orlando, FL | naultmichael@gmail.com
github.com/MgnCoding2020 | linkedin.com/in/michael-nault-mgncoding2020 | tryhackme.com/p/naultmichael

## Summary

IT and cybersecurity student (B.S. Cybersecurity and Information Assurance, WGU, expected January 2028), with six years in Amazon fulfillment operations — including two Process Assistant roles in floor leadership, quality, and SOX audit compliance.

I build the kind of work I want to do professionally: GRC control programs, Microsoft 365 and Windows security, and incident-response tooling, mapped to NIST SP 800-53, NIST SP 800-171, and PCI DSS.

## Skills

- **Governance, risk & compliance:** Risk registers, control matrices, NIST SP 800-53 to PCI DSS 4.0.1 crosswalk, audit evidence, POA&M tracking, vendor risk assessment, access reviews, DISA STIG baselines and SCAP benchmark scanning, SOX audit compliance
- **IT & Microsoft 365:** Microsoft 365 and SharePoint Online, Microsoft Entra ID, RBAC, least privilege, Conditional Access, Windows 10/11 and Server 2022, Hyper-V, Active Directory (fundamentals)
- **Scripting & web:** PowerShell, Python (basic), JavaScript, HTML, CSS, Git and GitHub, Playwright testing, Cloudflare Workers
- **Operations & leadership:** Start-up meetings, floor staffing, coaching, training, SOPs and standard work, 5S, quality metrics (DPMO), inventory counts and audits

## Professional Experience

### Amazon Fulfillment Centers, Orlando, FL (MCO1) and Knoxville, TN (TYS1)
*Oct 2020 – Present*

**Fulfillment Associate, Pick and Pack (MCO1)** | May 2024 – Present
- Pick and pack customer orders across singles, multi-item, and SLAM stations.

**Quality Process Assistant, New Site Launch (TYS1)** | Jul 2023 – Apr 2024
- Raised weekly SOX audit compliance from about 63–70% to 99%+ within one month, and held it there, by setting up structured tracking and training associates on every shift.
- Analyzed error trends in ICQA counts and implemented process improvements, reducing ICQA DPMO from about 37k to 10k.
- Wrote exception-handling SOPs that cut unresolved inventory exceptions from 50+ pods across four floors to 1–2 per floor.
- Trained associates on simple bin, cycle, and simple record counts, and problem solvers on andon, pod, and CDC audit processes.
- Walked the building daily to find stalled inventory and reported counts, photos, and changes to the Operations Manager and AGM; built an internal wiki page that gathered the quality links PAs and problem solvers used daily.

**Stow Process Assistant (MCO1)** | Jun 2021 – Jul 2023
- Led daily start-ups for a team of 60–80 associates, staffed the floor, and coached on quality and productivity; the team ranked #1 in productivity among the building's departments.
- Built and developed a team of water spiders and problem solvers to keep stations supplied with work, fix defects, and track time-sensitive inventory.
- Kept stow DPMO at 5–7k, below the site's 10k limit, contributing to inbound quality ranking top 3 of 90+ sites in the network.
- Tracked out-of-work andons each shift and reported to the Operations Manager whenever a shift passed 50; mentored newly promoted PAs and supported new Area Manager onboarding.

**Fulfillment Associate (MCO1)** | Oct 2020 – Jun 2021
- Worked stow, inbound dock, and problem solve; as a Process Guide, helped Area Managers and PAs with audits, floor readiness, and headcount moves.

### Massey Services, Kissimmee, FL
*Feb 2017 – Aug 2020*

**Pest Prevention Specialist and Customer Support**
- Served a recurring base of 215–280 clients, and kept service and regulatory records for state compliance.

## Projects

*Full write-ups for each of these are on the [Work](/work/) page. GRC projects are simulations for fictional organizations.*

### GRC Security Program: Burn and Churn Coffee (+ Vendor Risk & IAM Access Review)
*2025 – 2026*

- Built a security program for a fictional card-accepting small business: asset inventory, risk register, and an 11-control matrix mapped to NIST SP 800-53 and crosswalked to PCI DSS 4.0.1.
- Wrote 4 policies, 4 procedures, and 4 incident-response playbooks, plus an evidence pack with Python checks for privileged-access and incident-log exceptions, tracked in a POA&M.
- Assessed a simulated payroll vendor (inherent risk High, 4 findings, approved with conditions at Moderate residual risk) and ran a quarterly access review across 5 business systems.

### STIG / NIST SP 800-171 Hardening Lab
*2025*

- Ran a SCAP benchmark scan (SCAP Compliance Checker, STIG Viewer, DISA Windows 10 STIG V3R7) against a pre-hardening Windows 10 VM: 225 rules assessed, 137 open findings, about 35% baseline compliance.
- Separately hand-implemented and validated 4 Windows 10 STIG controls in the same problem areas the scan flagged — firewall, inbound traffic restriction, firewall logging, account lockout — mapped to NIST SP 800-171, with PowerShell for repeatable enforcement and evidence export.

### Home Endpoint Security Program
*2025 – 2026*

- Wrote scheduled PowerShell monitoring that baselines a system and reports drift in services, scheduled tasks, and startup persistence, with reports sanitized before archiving.
- Mapped the monitoring to NIST SP 800-53 with a generated evidence pack (control-evidence doc, POA&M, risk register) and a GitHub Action that regenerates the evidence automatically.
- Grew it into a 20-script PowerShell triage toolkit, safety-tagged and NIST/CIS-mapped, plus a 13-document incident-response playbook series covering Sysmon analysis, IOC handling, and patch prioritization.

### Workspace: SharePoint-style intranet platform
*2026*

- Built a data-driven intranet in vanilla JavaScript (~4,700 lines) with one provider interface and three interchangeable backends: in-memory, browser storage, and a live SharePoint tenant.
- Connected it to a live Microsoft 365 tenant (verified Oct 2026) via MSAL with no client secret — SharePoint REST reads/writes, a document library, and PowerShell provisioning scripts with a dry-run mode.
- Found and fixed a stored XSS vulnerability across 60 unsafe HTML-insertion points app-wide, verified across 6 surfaces; backed by an automated Playwright suite now at 454 passing checks.

### Little Saporito Press: website for an independent children's author (client work)
*Ongoing*

- Turned a long, loosely organized planning brief into a clear spec and built a static client site on Cloudflare: book pages, a trailer, and printable PDFs, with real security headers, cookieless analytics, and accessibility-safe seasonal theming.

**Other builds:** WinSysConfig, a Python Windows-settings manager with a strict CSP and journaled, undoable changes (in progress) · a Microsoft 365/Entra ID lab administering users, groups, and Conditional Access under least privilege.

## Education and Certifications

- **Western Governors University**, B.S. Cybersecurity and Information Assurance (in progress, expected January 2028)
- **University of Central Florida**, Full Stack Web Development Bootcamp Certificate
- **Certifications:** CompTIA Security+, Network+, A+ (2025) | ITIL 4 Foundation (2026)
