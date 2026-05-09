#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const REGISTRY_PATH = path.join(ROOT, "DB", "pehchaan_college_registry.json");
const DEFAULT_CSV_PATH = path.join(ROOT, "docs", "college-finder-batch1-intake-template.csv");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
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

function isHttp(url) {
  return /^https?:\/\//i.test(String(url || "").trim());
}

function assertOrCollect(condition, message, errors) {
  if (!condition) errors.push(message);
}

function usageAndExit() {
  console.log("Usage:");
  console.log("  node scripts/import-college-intake-csv.cjs [csv_path] [--dry-run]");
  console.log("");
  console.log("Default csv_path:");
  console.log("  docs/college-finder-batch1-intake-template.csv");
  console.log("");
  console.log("Flags:");
  console.log("  --dry-run   Validate + compute changes without writing registry");
  process.exit(1);
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("-h") || args.includes("--help")) usageAndExit();
  const dryRun = args.includes("--dry-run");
  const csvArg = args.find((a) => !a.startsWith("-"));

  const csvPath = csvArg ? path.resolve(process.cwd(), csvArg) : DEFAULT_CSV_PATH;
  if (!fs.existsSync(csvPath)) {
    console.error("CSV not found:", csvPath);
    process.exit(1);
  }
  const registry = readJson(REGISTRY_PATH);
  const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
  if (!rows.length) {
    console.error("No data rows found in CSV:", csvPath);
    process.exit(1);
  }

  const stateIds = new Set(((registry.taxonomies || {}).states || []).map((s) => s.id));
  const streamIds = new Set(((registry.taxonomies || {}).streams || []).map((s) => s.id));
  const courseIds = new Set(((registry.taxonomies || {}).courses || []).map((c) => c.id));
  const lensIds = new Set(((registry.taxonomies || {}).geography_lenses || []).map((l) => l.id));

  const colleges = registry.colleges || [];
  const programs = registry.college_programs || [];
  const collegeById = new Map(colleges.map((c) => [c.id, c]));
  const collegeIdByNameState = new Map(
    colleges.map((c) => [[slugify(c.name), c.state_id].join("::"), c.id])
  );
  const programByKey = new Map(
    programs.map((p) => [
      [p.college_id, p.stream_id, p.course_id, (p.geography_lens_ids || []).slice().sort().join("|")].join("::"),
      p
    ])
  );

  const today = new Date().toISOString().slice(0, 10);
  const errors = [];
  let addedColleges = 0;
  let updatedColleges = 0;
  let addedPrograms = 0;
  let updatedPrograms = 0;

  rows.forEach((row, idx) => {
    const rowNo = idx + 2;
    const stateId = row.state_id;
    const inferredId = row.college_id || slugify(row.college_name);
    const duplicateKey = [slugify(row.college_name), stateId].join("::");
    const existingIdForNameState = collegeIdByNameState.get(duplicateKey);
    const collegeId = existingIdForNameState || inferredId;
    const collegeName = row.college_name;
    const city = row.city;
    const type = row.type;
    const ownership = row.ownership || "";
    const website = row.website;
    const sourcePrimary = row.source_url_primary || "";
    const sourceSecondary = row.source_url_secondary || "";
    const streamId = row.stream_id;
    const courseId = row.course_id;
    const lenses = parseLens(row.geography_lens_ids);
    const confidence = row.confidence_level || "medium";
    const notes = row.notes || "";

    assertOrCollect(!!stateId && stateIds.has(stateId), `Row ${rowNo}: invalid state_id "${stateId}"`, errors);
    assertOrCollect(!!collegeId, `Row ${rowNo}: missing college_id`, errors);
    assertOrCollect(!!collegeName, `Row ${rowNo}: missing college_name`, errors);
    assertOrCollect(!!city, `Row ${rowNo}: missing city`, errors);
    assertOrCollect(!!type, `Row ${rowNo}: missing type`, errors);
    assertOrCollect(isHttp(website), `Row ${rowNo}: invalid website "${website}"`, errors);
    assertOrCollect(!!streamId && streamIds.has(streamId), `Row ${rowNo}: invalid stream_id "${streamId}"`, errors);
    assertOrCollect(!!courseId && courseIds.has(courseId), `Row ${rowNo}: invalid course_id "${courseId}"`, errors);
    assertOrCollect(lenses.length > 0, `Row ${rowNo}: missing geography_lens_ids`, errors);
    lenses.forEach((l) => {
      assertOrCollect(lensIds.has(l), `Row ${rowNo}: invalid lens "${l}"`, errors);
    });
    assertOrCollect(["high", "medium", "low"].includes(confidence), `Row ${rowNo}: invalid confidence_level "${confidence}"`, errors);

    if (errors.length) return;

    const sourceUrls = [sourcePrimary, sourceSecondary, website].filter(isHttp);
    let college = collegeById.get(collegeId);
    if (!college) {
      college = {
        id: collegeId,
        name: collegeName,
        state_id: stateId,
        city,
        type,
        ownership,
        confidence_level: confidence,
        contact_missing_reason: "",
        contacts: { website, email: "", phone: "" },
        highlights: {
          founded: "Verify on official website",
          notable_alumni: ["Verify notable alumni from official and trusted public sources."],
          best_for: "",
          specialization: "",
          unique_point: "",
          why_choose: "",
          notes: notes || "Added from intake CSV. Verify latest admissions on official pages."
        },
        verification: {
          nirf_band: "",
          last_verified_on: today,
          source_urls: sourceUrls.length ? sourceUrls : [website]
        }
      };
      colleges.push(college);
      collegeById.set(collegeId, college);
      collegeIdByNameState.set(duplicateKey, collegeId);
      addedColleges += 1;
    } else {
      college.name = collegeName || college.name;
      college.state_id = stateId || college.state_id;
      college.city = city || college.city;
      college.type = type || college.type;
      if (ownership) college.ownership = ownership;
      if (website) college.contacts.website = website;
      college.confidence_level = confidence || college.confidence_level;
      college.verification = college.verification || {};
      college.verification.last_verified_on = today;
      college.verification.source_urls = Array.from(new Set([...(college.verification.source_urls || []), ...sourceUrls])).filter(isHttp);
      if (notes) {
        college.highlights = college.highlights || {};
        college.highlights.notes = notes;
      }
      if (existingIdForNameState && existingIdForNameState !== inferredId && row.college_id) {
        console.warn(`Row ${rowNo}: using existing college_id "${existingIdForNameState}" for same name/state instead of "${row.college_id}".`);
      }
      updatedColleges += 1;
    }

    const lensKey = lenses.slice().sort().join("|");
    const pKey = [collegeId, streamId, courseId, lensKey].join("::");
    let program = programByKey.get(pKey);
    if (!program) {
      program = {
        id: slugify([collegeId, streamId, courseId, lensKey, "intake"].join("__")),
        college_id: collegeId,
        stream_id: streamId,
        course_id: courseId,
        geography_lens_ids: lenses,
        admission_exam_ids: [],
        admission_routes: [],
        availability: {
          is_active: true,
          state_specific: lenses.includes("state_comfort"),
          confidence_level: confidence,
          notes: notes || "Added from intake CSV."
        },
        last_verified_on: today
      };
      programs.push(program);
      programByKey.set(pKey, program);
      addedPrograms += 1;
    } else {
      program.geography_lens_ids = Array.from(new Set([...(program.geography_lens_ids || []), ...lenses]));
      program.availability = program.availability || {};
      program.availability.is_active = true;
      program.availability.state_specific = program.geography_lens_ids.includes("state_comfort");
      program.availability.confidence_level = confidence;
      if (notes) program.availability.notes = notes;
      program.last_verified_on = today;
      updatedPrograms += 1;
    }
  });

  if (errors.length) {
    console.error("Import failed with validation errors:");
    errors.forEach((e) => console.error(" -", e));
    process.exit(1);
  }

  registry.colleges = colleges;
  registry.college_programs = programs;
  registry.meta = registry.meta || {};
  registry.meta.last_updated = today;
  registry.meta.pipeline_stats = registry.meta.pipeline_stats || {};
  registry.meta.pipeline_stats.total_colleges = colleges.length;
  registry.meta.pipeline_stats.total_programs = programs.length;
  registry.meta.pipeline_stats.last_pipeline_run = today;

  if (!dryRun) {
    writeJson(REGISTRY_PATH, registry);
  }

  console.log("import-college-intake-csv: OK" + (dryRun ? " (dry-run)" : ""));
  console.log(" - CSV:", path.relative(ROOT, csvPath));
  console.log(" - Added colleges:", addedColleges);
  console.log(" - Updated colleges:", updatedColleges);
  console.log(" - Added programs:", addedPrograms);
  console.log(" - Updated programs:", updatedPrograms);
  if (!dryRun) {
    console.log(" - Registry:", path.relative(ROOT, REGISTRY_PATH));
  } else {
    console.log(" - Registry write: skipped (--dry-run)");
  }
}

main();

