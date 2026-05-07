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
const JSON_SCAN_DIRS = ["DB", "FAQDB"];
const REQUIRED_CORE_JSON = [
  "DB/pehchaan_career_registry.json",
  "DB/pehchaan_college_registry.json",
  "DB/pehchaan_college_registry_indexes.json",
  "DB/pehchaan_exam_data.json",
  "DB/pehchaan_financing_reality_data.json",
  "DB/pehchaan_plan_b_strategy_builder_data.json",
  "DB/pehchaan_private_sector_roles.json",
  "DB/pehchaan_salary_explorer_data.json",
  "DB/pehchaan_skill_gap_analyser_data.json",
  "DB/pehchaan_stream_advisor_data.json",
  "DB/canonical/careers.json",
  "DB/canonical/exams.json",
  "DB/canonical/financial_aid.json",
  "DB/canonical/institutions.json",
  "DB/canonical/resources.json",
  "DB/canonical/skill_map.json",
];
const MONTHLY_DATA_PLAYBOOK = [
  {
    area: "Jobs and careers",
    required: [
      "DB/pehchaan_career_registry.json",
      "DB/pehchaan_private_sector_roles.json",
      "DB/pehchaan_salary_explorer_data.json",
      "DB/canonical/careers.json",
    ],
    checklist: [
      "Add new high-demand roles, role templates, and practical entry pathways.",
      "Refresh salary ranges and region-specific notes using latest market inputs.",
      "Map new/updated roles to required skills for the skill-gap analyser.",
    ],
  },
  {
    area: "Exams and pathways",
    required: [
      "DB/pehchaan_exam_data.json",
      "DB/pehchaan_stream_advisor_data.json",
      "DB/pehchaan_plan_b_strategy_builder_data.json",
      "DB/canonical/exams.json",
      "DB/canonical/resources.json",
    ],
    checklist: [
      "Add newly announced exams, updated eligibility, and registration windows.",
      "Refresh roadmap timelines and attempt strategy notes for key target exams.",
      "Cross-check stream/pathway recommendations with current exam requirements.",
    ],
  },
  {
    area: "Colleges and institutions",
    required: [
      "DB/pehchaan_college_registry.json",
      "DB/pehchaan_college_registry_indexes.json",
      "DB/canonical/institutions.json",
      "DB/shards/college_registry_manifest.json",
      "DB/shards/college_registry_indexes.json",
    ],
    checklist: [
      "Add colleges/programs (including state shards) with updated accreditation data.",
      "Rebuild college indexes/manifests after registry changes.",
      "Run quality checks for duplicates, malformed locations, and missing programs.",
    ],
  },
  {
    area: "Finance, mentoring, and support",
    required: [
      "DB/pehchaan_financing_reality_data.json",
      "DB/pehchaan_mentor_connect_config.json",
      "DB/canonical/financial_aid.json",
      "DB/canonical/skill_map.json",
    ],
    checklist: [
      "Add scholarships, aid schemes, and realistic cost assumptions.",
      "Refresh mentor-journey prompts and guidance links for current cohorts.",
      "Ensure support resources are connected to updated careers/exams paths.",
    ],
  },
];

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

function walkJsonFiles(absDir, relDir, out) {
  const entries = fs.readdirSync(absDir, { withFileTypes: true });
  for (const entry of entries) {
    const nextAbs = path.join(absDir, entry.name);
    const nextRel = path.join(relDir, entry.name);
    if (entry.isDirectory()) {
      walkJsonFiles(nextAbs, nextRel, out);
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
      out.push(nextRel);
    }
  }
}

function listManagedJsonFiles() {
  const files = [];
  for (const relDir of JSON_SCAN_DIRS) {
    const absDir = path.join(ROOT, relDir);
    if (!fs.existsSync(absDir)) continue;
    walkJsonFiles(absDir, relDir, files);
  }
  return files.sort();
}

function normalizeRelPath(p) {
  return String(p || "").replace(/\\/g, "/");
}

function printMonthlyPlaybook() {
  console.log("\n--- Monthly data expansion playbook ---");
  for (const section of MONTHLY_DATA_PLAYBOOK) {
    console.log("\n[" + section.area + "]");
    console.log("Required JSON files:");
    section.required.forEach((p) => console.log(" - " + p));
    console.log("Update checklist:");
    section.checklist.forEach((item, idx) => console.log(" " + (idx + 1) + ". " + item));
  }
}

function validateAllDbJson() {
  const files = listManagedJsonFiles();
  if (!files.length) {
    console.warn("Skip: no JSON files found under configured scan dirs");
    return false;
  }
  let allOk = true;
  const normalizedFiles = new Set(files.map(normalizeRelPath));
  console.log("JSON inventory (" + files.length + " files):");
  files.forEach((rel) => console.log(" - " + rel));
  for (const rel of REQUIRED_CORE_JSON) {
    if (!normalizedFiles.has(normalizeRelPath(rel))) {
      allOk = false;
      console.error("Missing required core JSON file: " + rel);
    }
  }
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
printMonthlyPlaybook();

let ok = true;

ok = runStep("FAQ count (sanity check)", [path.join("scripts", "count-faqs.cjs")]) && ok;

if (scriptExists(path.join("scripts", "build-salary-explorer-json.cjs"))) {
  // build-salary-explorer-json.cjs skips fs.write when SHA-256 of output matches the file on disk (no git noise).
  ok = runStep("Salary explorer JSON", [path.join("scripts", "build-salary-explorer-json.cjs")]) && ok;
} else {
  console.warn("Skip: scripts/build-salary-explorer-json.cjs not found");
}

if (scriptExists(path.join("scripts", "migrate-to-canonical.cjs"))) {
  ok = runStep("Canonical migration + compatibility outputs", [path.join("scripts", "migrate-to-canonical.cjs")]) && ok;
} else {
  console.warn("Skip: scripts/migrate-to-canonical.cjs not found");
}

if (scriptExists(path.join("scripts", "migrate-planb-college-registry.cjs"))) {
  ok = runStep("College registry migration (from Plan B)", [path.join("scripts", "migrate-planb-college-registry.cjs")]) && ok;
} else {
  console.warn("Skip: scripts/migrate-planb-college-registry.cjs not found");
}

if (scriptExists(path.join("scripts", "migrate-planb-job-templates.cjs"))) {
  ok = runStep("Plan B job-template migration", [path.join("scripts", "migrate-planb-job-templates.cjs")]) && ok;
} else {
  console.warn("Skip: scripts/migrate-planb-job-templates.cjs not found");
}

if (scriptExists(path.join("scripts", "extend-course-planb.cjs"))) {
  ok = runStep("Plan B course expansion", [path.join("scripts", "extend-course-planb.cjs")]) && ok;
} else {
  console.warn("Skip: scripts/extend-course-planb.cjs not found");
}

if (scriptExists(path.join("scripts", "extend-college-bundles.cjs"))) {
  ok = runStep("College bundle expansion", [path.join("scripts", "extend-college-bundles.cjs")]) && ok;
} else {
  console.warn("Skip: scripts/extend-college-bundles.cjs not found");
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

if (scriptExists(path.join("scripts", "validate-canonical-db.cjs"))) {
  ok = runStep("Canonical schema + FK integrity checks", [path.join("scripts", "validate-canonical-db.cjs")]) && ok;
} else {
  console.warn("Skip: scripts/validate-canonical-db.cjs not found");
}

if (scriptExists(path.join("scripts", "validate-local-links.cjs"))) {
  ok = runStep("Local links and asset references", [path.join("scripts", "validate-local-links.cjs")]) && ok;
} else {
  console.warn("Skip: scripts/validate-local-links.cjs not found");
}

console.log("\n--- Managed JSON inventory + parse validation ---");
ok = validateAllDbJson() && ok;

// Stream advisor content now ships from DB/pehchaan_stream_advisor_data.json; legacy extract/inject
// scripts expect old HTML markers. Re-enable here only after those scripts match the current HTML.

console.log(
  "\nDone. Review git diff under DB/ and Tools/. Monthly flow now includes explicit jobs/exams/colleges playbook guidance, canonical migration, college registry migration/indexing, optional expansion scripts, integration validation, and recursive managed-JSON parse checks.\n"
);

process.exit(ok ? 0 : 1);
