#!/usr/bin/env node
/**
 * Monthly (or on-demand) refresh of generated / maintained JSON used by the static site.
 * Run from repo root: node scripts/monthly-json-update.cjs
 *
 * Steps are best-effort: a failing script is logged; exit code is non-zero only on fatal errors.
 */
"use strict";

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DB_DIR = path.join(ROOT, "DB");

function runStep(label, args, opts) {
  console.log("\n--- " + label + " ---");
  const r = spawnSync(process.execPath, args, {
    cwd: ROOT,
    stdio: "inherit",
    shell: false,
    ...opts,
  });
  if (r.error) {
    console.error(label + " failed to start:", r.error.message);
    return false;
  }
  if (r.status !== 0) {
    console.warn(label + " exited with code " + r.status);
    return false;
  }
  return true;
}

function scriptExists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function listDbJsonFiles() {
  if (!fs.existsSync(DB_DIR)) return [];
  return fs
    .readdirSync(DB_DIR, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.toLowerCase().endsWith(".json"))
    .map((d) => path.join("DB", d.name))
    .sort();
}

function validateAllDbJson() {
  const files = listDbJsonFiles();
  if (!files.length) {
    console.warn("Skip: no JSON files found under DB/");
    return false;
  }
  let allOk = true;
  console.log("DB inventory (" + files.length + " files):");
  files.forEach((rel) => console.log(" - " + rel));
  for (const rel of files) {
    const abs = path.join(ROOT, rel);
    try {
      const raw = fs.readFileSync(abs, "utf8");
      JSON.parse(raw);
    } catch (e) {
      allOk = false;
      console.error("Invalid JSON: " + rel + " (" + e.message + ")");
    }
  }
  if (allOk) {
    console.log("All DB JSON files are valid JSON.");
  }
  return allOk;
}

console.log("Pehchaan monthly JSON update — " + new Date().toISOString().slice(0, 10));

let ok = true;

ok = runStep("FAQ count (sanity check)", [path.join("scripts", "count-faqs.cjs")]) && ok;

if (scriptExists(path.join("scripts", "build-salary-explorer-json.cjs"))) {
  // build-salary-explorer-json.cjs skips fs.write when SHA-256 of output matches the file on disk (no git noise).
  ok = runStep("Salary explorer JSON", [path.join("scripts", "build-salary-explorer-json.cjs")]) && ok;
} else {
  console.warn("Skip: scripts/build-salary-explorer-json.cjs not found");
}

if (scriptExists(path.join("scripts", "migrate-planb-college-registry.cjs"))) {
  ok = runStep("College registry migration (from Plan B)", [path.join("scripts", "migrate-planb-college-registry.cjs")]) && ok;
} else {
  console.warn("Skip: scripts/migrate-planb-college-registry.cjs not found");
}

if (scriptExists(path.join("scripts", "build-college-indexes.cjs"))) {
  ok = runStep("College registry indexes", [path.join("scripts", "build-college-indexes.cjs")]) && ok;
} else {
  console.warn("Skip: scripts/build-college-indexes.cjs not found");
}

if (scriptExists(path.join("scripts", "validate-college-registry.cjs"))) {
  ok = runStep("College registry quality checks", [path.join("scripts", "validate-college-registry.cjs")]) && ok;
} else {
  console.warn("Skip: scripts/validate-college-registry.cjs not found");
}

if (scriptExists(path.join("scripts", "validate-tool-integration.cjs"))) {
  ok = runStep("Cross-tool integration checks", [path.join("scripts", "validate-tool-integration.cjs")]) && ok;
} else {
  console.warn("Skip: scripts/validate-tool-integration.cjs not found");
}

if (scriptExists(path.join("scripts", "validate-local-links.cjs"))) {
  ok = runStep("Local links and asset references", [path.join("scripts", "validate-local-links.cjs")]) && ok;
} else {
  console.warn("Skip: scripts/validate-local-links.cjs not found");
}

console.log("\n--- DB JSON inventory + parse validation ---");
ok = validateAllDbJson() && ok;

// Stream advisor content now ships from DB/pehchaan_stream_advisor_data.json; legacy extract/inject
// scripts expect old HTML markers. Re-enable here only after those scripts match the current HTML.

console.log(
  "\nDone. Review git diff under DB/ and Tools/. Monthly flow now includes JSON generation, college registry migration/indexing, integration validation, and a full DB JSON parse check.\n"
);

process.exit(ok ? 0 : 1);
