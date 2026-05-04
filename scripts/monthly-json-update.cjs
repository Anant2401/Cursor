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

console.log("Pehchaan monthly JSON update — " + new Date().toISOString().slice(0, 10));

let ok = true;

ok = runStep("FAQ count (sanity check)", [path.join("scripts", "count-faqs.cjs")]) && ok;

if (scriptExists(path.join("scripts", "build-salary-explorer-json.cjs"))) {
  // build-salary-explorer-json.cjs skips fs.write when SHA-256 of output matches the file on disk (no git noise).
  ok = runStep("Salary explorer JSON", [path.join("scripts", "build-salary-explorer-json.cjs")]) && ok;
} else {
  console.warn("Skip: scripts/build-salary-explorer-json.cjs not found");
}

// Stream advisor content now ships from DB/pehchaan_stream_advisor_data.json; legacy extract/inject
// scripts expect old HTML markers. Re-enable here only after those scripts match the current HTML.

console.log(
  "\nDone. Review git diff under DB/ and Tools/. Other maintenance scripts (Plan B extensions, college bundles, stream advisor extract when HTML markers exist) live in scripts/ — wire them into this file when you run them monthly.\n"
);

process.exit(ok ? 0 : 1);
