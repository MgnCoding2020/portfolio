# Verification checklist

The standard process before any case study, resume line, or site content is marked ready to publish — required, not optional (CLAUDE.md §13). This doc is the step-by-step version of that rule.

## Steps

1. **List every factual claim** in the draft: numbers, dates, counts, feature claims, "verified against X" statements.
2. **Find each claim's primary source** — never a prior draft, an earlier resume, or this plan's own content inventory, all of which can go stale:
   - A number about a repo (lines of code, test count, controls, findings) → the repo itself: its code, its tests, its CI logs. Use `gh repo view`, `gh api`, or a local clone (`gh` is already authenticated with `repo` scope, including private repos — no extra setup needed).
   - A date (e.g. "verified Sept 2026") → actual commit history or CI run timestamps, not what a doc claims happened.
   - An employment fact (job title, dates, metrics) → Michael directly. These aren't repo-checkable, and are trusted as self-reported rather than re-verified against an external source.
3. **Confirm, correct, or flag** each claim:
   - **Matches** → keep as-is.
   - **Doesn't match** → correct it, and say what changed. Don't quietly swap one unverified number for another.
   - **Can't be checked** from what's available → leave a visible `TODO(michael): unverifiable — <why>`. Never guess to fill the gap.
4. **Record the verification date** and what was checked, in the content's `verified` front-matter field (case studies) or clearly in context otherwise — so a later session knows how current the claim is, not just that it was checked once, ever.
5. **Re-verify when things change.** If a bug gets fixed, a repo moves forward, or a module that was "in progress" finishes, the old verified line is now stale — update it. Quarterly maintenance (CLAUDE.md §11) is the floor for this, not the only time it happens.

## Why this exists

Two real errors were caught this way while building the first case study and resume: Workspace's automated-check count (claimed 277, actually 454) and its SharePoint-tenant verification date (claimed September, actually October — and not currently connected). The GRC Security Program's evidence pack separately turned out to have three duplicate scripts, one of them claiming to check MFA status while actually re-checking privileged-access approval. All three were caught by cloning the real repo and reading the actual code or CI history, not by trusting an earlier draft. That's the standard now.
