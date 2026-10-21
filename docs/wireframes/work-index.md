# Wireframe: Work index (`/work/`)

Uses plain jump links to tag sections, not a JS filter — works with no JavaScript (CLAUDE.md §5.5).

## Desktop (1024px+)

```
+----------------------------------------------------------------+
| Michael Nault              Work   Work with me   About  Resume |
+----------------------------------------------------------------+
| Work                                                             |
| Case studies from GRC, IT, and client work -- tagged by who      |
| each one speaks to most.                                         |
|                                                                   |
| Jump to:  GRC · M365 · IAM · Endpoint · Web                      |
|                                                                   |
+----------------------------------------------------------------+
| ## GRC                                                            |
| +---------------+   +---------------+                             |
| | GRC Security   |   | STIG / 800-171 |     (as each case study   |
| | Program         |   | Hardening Lab   |     lands; "coming soon" |
| | [Simulation]     |   | [Simulation]    |     cards okay pre-launch)|
| +---------------+   +---------------+                             |
+----------------------------------------------------------------+
| ## M365 / IAM                                                     |
| +---------------+                                                 |
| | Workspace       |                                                |
| | [In progress]    |                                                |
| +---------------+                                                 |
+----------------------------------------------------------------+
| ## Endpoint                                                        |
| +---------------+                                                 |
| | Home Endpoint    |                                                |
| | Security Program  |                                                |
| | [Personal project] |                                               |
| +---------------+                                                 |
+----------------------------------------------------------------+
| ## Web                                                             |
| +---------------+                                                 |
| | Little Saporito  |                                                |
| | Press             |                                                |
| | [Client work]      |                                                |
| +---------------+                                                 |
+----------------------------------------------------------------+
| Footer                                                              |
+----------------------------------------------------------------+
```

## Phone (360px)

```
+----------------------------+
| Michael Nault              |
| Work / Work with me /      |
| About / Resume             |
+----------------------------+
| Work                        |
| Case studies from GRC, IT,  |
| and client work...          |
|                             |
| Jump to:                    |
| GRC                          |
| M365 / IAM                   |
| Endpoint                     |
| Web                           |
+----------------------------+
| ## GRC                       |
| [ GRC Security Program ]     |
| [ STIG / 800-171 ]           |
+----------------------------+
| ## M365 / IAM                |
| [ Workspace ]                |
+----------------------------+
| ## Endpoint                  |
| [ Home Endpoint Security ]   |
+----------------------------+
| ## Web                        |
| [ Little Saporito Press ]     |
+----------------------------+
| Footer                        |
+----------------------------+
```

## Notes

- Jump links target `id`s on each `##` section heading — real anchor links, works with JS off, works for screen readers.
- Cards generated from case-study front matter (`audience` tags), grouped and ordered by `featured`, per `build.mjs` requirements in §6 — not hand-placed.
- A case study tagged with multiple audiences (the GRC one is `[grc, iam]`) appears under more than one section heading. That's intentional — it's how one body of work serves two doors without duplicating content.
- Before all 5 launch case studies exist, sections with nothing yet can either be omitted or show a plain "coming soon" line — no fake cards.
