// build.mjs -- portfolio build script.
// Early/minimal version: stamps a computed "last updated" date into dist/site.json.
// Grows into full page generation once wireframes/tokens/components exist
// (CLAUDE.md §5.2 steps 4-6) -- see CLAUDE.md §6 for the planned shape.
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const DIST = "dist";

function lastUpdated() {
  try {
    // Date of the most recent commit in the repo. Works even on a shallow
    // CI checkout, since that always includes at least the latest commit.
    return execSync("git log -1 --format=%cd --date=short", {
      encoding: "utf8",
    }).trim();
  } catch {
    // No git available (e.g. a tarball build) -- fall back to build date.
    return new Date().toISOString().slice(0, 10);
  }
}

mkdirSync(DIST, { recursive: true });

const site = JSON.parse(readFileSync("content/site.json", "utf8"));
site.footer.lastUpdated = lastUpdated();
writeFileSync(`${DIST}/site.json`, JSON.stringify(site, null, 2));

console.log(`Built ${DIST}/site.json -- lastUpdated = ${site.footer.lastUpdated}`);
