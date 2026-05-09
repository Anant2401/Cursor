#!/usr/bin/env node
/**
 * Curated overrides: attach real programmes, optionally strip catalogue expansions,
 * set college.programs_verified.
 *
 *   node scripts/import-college-course-overrides.cjs [csv_path] [--dry-run]
 * Default csv: docs/college-course-overrides-template.csv
 */
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const REGISTRY_PATH = path.join(ROOT, "DB", "pehchaan_college_registry.json");
const DEFAULT_CSV = path.join(ROOT, "docs", "college-course-overrides-template.csv");

function readJson(fp) {
  return JSON.parse(fs.readFileSync(fp, "utf8"));
}
function writeJson(fp, d) {
  fs.writeFileSync(fp, JSON.stringify(d, null, 2), "utf8");
}

function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === "\"") {
      if (inQuotes && line[i + 1] === "\"") {
        cur += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out.map((v) => String(v || "").trim());
}

function parseCsv(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
  if (!lines.length) return [];
  const header = splitCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i += 1) {
    const cols = splitCsvLine(lines[i]);
    const row = {};
    header.forEach((h, idx) => {
      row[h] = cols[idx] == null ? "" : cols[idx];
    });
    rows.push(row);
  }
  return rows;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

function parseLens(value) {
  return String(value || "")
    .split("|")
    .map((x) => x.trim())
    .filter(Boolean);
}

function lensKey(lenses) {
  return lenses.slice().sort().join("|");
}

function assertOrCollect(cond, msg, errors) {
  if (!cond) errors.push(msg);
}

function isYes(v) {
  return /^(yes|true|1|y)$/i.test(String(v || "").trim());
}

function isCatalogueExpansionRow(p) {
  if (p && p.availability && p.availability.catalogue_expansion === true) return true;
  return /^exp_/i.test(String(p && p.id) || "");
}

function usageExit() {
  console.log("Usage: node scripts/import-college-course-overrides.cjs [csv_path] [--dry-run]");
  process.exit(1);
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("-h") || args.includes("--help")) usageExit();
  const dryRun = args.includes("--dry-run");
  const csvPath = args.find((a) => !a.startsWith("-")) ? path.resolve(process.cwd(), args.find((a) => !a.startsWith("-"))) : DEFAULT_CSV;

  if (!fs.existsSync(csvPath)) {
    console.error("CSV not found:", csvPath);
    process.exit(1);
  }

  const registry = JSON.parse(JSON.stringify(readJson(REGISTRY_PATH)));
  const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
  if (!rows.length) {
    console.log("import-college-course-overrides: no data rows below header — add curated rows then re-run:", path.relative(ROOT, csvPath));
    process.exit(0);
  }

  const rebuildProgramByKey = (plist, pmap) => {
    pmap.clear();
    plist.forEach((p) => {
      pmap.set([p.college_id, p.stream_id, p.course_id, lensKey(p.geography_lens_ids || [])].join("::"), p);
    });
  };

  const lensIds = new Set(((registry.taxonomies || {}).geography_lenses || []).map((l) => l.id));
  const courseRows = registry.taxonomies.courses || [];
  const courseById = new Map(courseRows.map((c) => [c.id, c]));
  const colleges = registry.colleges || [];
  const programs = registry.college_programs || [];
  const collegeById = new Map(colleges.map((c) => [c.id, c]));

  function streamIdForCourse(courseId) {
    const c = courseById.get(courseId);
    if (!c || !c.stream_ids || !c.stream_ids.length) return null;
    return c.stream_ids[0];
  }

  const programByKey = new Map(
    programs.map((p) => [[p.college_id, p.stream_id, p.course_id, lensKey(p.geography_lens_ids || [])].join("::"), p])
  );

  const today = new Date().toISOString().slice(0, 10);
  const errors = [];
  let removedExpansions = 0;
  let upserted = 0;
  const verifiedCollegeIds = new Set();

  rows.forEach((row, idx) => {
    const rowNo = idx + 2;
    const collegeId = String(row.college_id || "").trim();
    const stateId = String(row.state_id || "").trim();
    const courseId = String(row.course_id || "").trim();
    const programName = String(row.program_name || "").trim();
    const lenses = parseLens(row.geography_lens_ids);
    const clearExp = isYes(row.clear_catalogue_expansions);
    const setVerified = isYes(row.set_programs_verified);
    const conf = String(row.availability_confidence || "medium").trim().toLowerCase();
    const notes = String(row.notes || "").trim();

    assertOrCollect(!!collegeId, `Row ${rowNo}: missing college_id`, errors);
    assertOrCollect(!!courseId && courseById.has(courseId), `Row ${rowNo}: invalid course_id "${courseId}"`, errors);
    assertOrCollect(lenses.length > 0, `Row ${rowNo}: missing geography_lens_ids`, errors);
    lenses.forEach((l) => assertOrCollect(lensIds.has(l), `Row ${rowNo}: invalid lens "${l}"`, errors));
    assertOrCollect(["high", "medium", "low"].includes(conf), `Row ${rowNo}: invalid availability_confidence`, errors);

    if (errors.length) return;

    const college = collegeById.get(collegeId);
    assertOrCollect(!!college, `Row ${rowNo}: unknown college_id "${collegeId}"`, errors);
    if (stateId && college && college.state_id !== stateId) {
      errors.push(`Row ${rowNo}: state_id ${stateId} does not match college.state_id ${college.state_id}`);
    }
    if (errors.length) return;

    const streamId = streamIdForCourse(courseId);
    assertOrCollect(!!streamId, `Row ${rowNo}: could not resolve stream for course ${courseId}`, errors);
    if (errors.length) return;

    if (clearExp) {
      for (let i = programs.length - 1; i >= 0; i -= 1) {
        if (programs[i].college_id === collegeId && isCatalogueExpansionRow(programs[i])) {
          programs.splice(i, 1);
          removedExpansions += 1;
        }
      }
      rebuildProgramByKey(programs, programByKey);
    }

    const lk = lensKey(lenses);
    const pKey = [collegeId, streamId, courseId, lk].join("::");
    const label =
      programName ||
      ((courseById.get(courseId) || {}).label) ||
      courseId;

    let program = programByKey.get(pKey);
    let template =
      programs.find((p) => p.college_id === collegeId && p.stream_id === streamId && !isCatalogueExpansionRow(p)) || programs.find((p) => p.college_id === collegeId);

    if (!program) {
      program = {
        id: "",
        college_id: collegeId,
        stream_id: streamId,
        course_id: courseId,
        program_name: label,
        geography_lens_ids: lenses,
        admission_exam_ids: template ? ([]).concat(template.admission_exam_ids || []) : [],
        admission_routes: template ? ([]).concat(template.admission_routes || []) : [],
        availability: {
          is_active: true,
          state_specific: lenses.includes("state_comfort"),
          confidence_level: conf,
          catalogue_expansion: false,
          notes:
            notes ||
            "Curated programme label from overrides CSV — verify brochure for current eligibility and intake."
        },
        last_verified_on: today
      };
      if (template && template.admission_route) program.admission_route = JSON.parse(JSON.stringify(template.admission_route));
      const idHash = crypto.createHash("sha1").update(pKey + "::override").digest("hex").slice(0, 16);
      program.id = `ovr_${idHash}`;
      programs.push(program);
      programByKey.set(pKey, program);
      upserted += 1;
    } else {
      program.course_id = courseId;
      program.stream_id = streamId;
      program.program_name = label;
      program.geography_lens_ids = lenses;
      program.availability = program.availability || {};
      program.availability.catalogue_expansion = false;
      program.availability.is_active = true;
      program.availability.state_specific = lenses.includes("state_comfort");
      program.availability.confidence_level = conf;
      if (notes) program.availability.notes = notes;
      program.last_verified_on = today;
      upserted += 1;
    }

    if (setVerified) {
      college.programs_verified = true;
      verifiedCollegeIds.add(collegeId);
    }
  });

  if (errors.length) {
    console.error("Override import failed:");
    errors.forEach((e) => console.error(" -", e));
    process.exit(1);
  }

  registry.college_programs = programs;
  registry.meta = registry.meta || {};
  registry.meta.last_updated = today;
  registry.meta.pipeline_stats = registry.meta.pipeline_stats || {};
  registry.meta.pipeline_stats.total_programs = programs.length;
  registry.meta.pipeline_stats.total_colleges = colleges.length;
  registry.meta.pipeline_stats.last_pipeline_run = today;

  if (!dryRun) writeJson(REGISTRY_PATH, registry);

  console.log("import-college-course-overrides: OK" + (dryRun ? " (dry-run)" : ""));
  console.log("- CSV:", path.relative(ROOT, csvPath));
  console.log("- Catalogue expansion rows removed (this run):", removedExpansions);
  console.log("- Programmes upserted:", upserted);
  console.log("- colleges marked programs_verified:", verifiedCollegeIds.size);
}

main();
