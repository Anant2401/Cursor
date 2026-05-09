#!/usr/bin/env node
/**
 * Expand college_programs rows with representative catalogue courses per institution tier.
 * Intended for richer "Courses offered" cards without claiming seat-level accuracy.
 *
 * Usage (from repo root):
 *   node scripts/expand-college-program-offerings.cjs
 */
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const REGISTRY_PATH = path.join(ROOT, "DB", "pehchaan_college_registry.json");

const EXPAND_NOTE_APPEND =
  "Representative catalogue label for this stream — verify current branches on the institute admissions page.";

/** Extra B.Tech-style branches (taxonomy must include these IDs; migrate-canonical-courses merges them.) */
const ENGINEERING_EXTENDED = [
  { id: "engineering_btech_chemical", label: "B.Tech Chemical Engineering", stream_ids: ["engineering"] },
  { id: "engineering_btech_biotechnology", label: "B.Tech Biotechnology", stream_ids: ["engineering"] },
  { id: "engineering_btech_aerospace", label: "B.Tech Aerospace Engineering", stream_ids: ["engineering"] },
  { id: "engineering_btech_metallurgy", label: "B.Tech Metallurgical and Materials Engineering", stream_ids: ["engineering"] },
  { id: "engineering_btech_mining", label: "B.Tech Mining Engineering", stream_ids: ["engineering"] },
  { id: "engineering_btech_instrumentation", label: "B.Tech Instrumentation and Control Engineering", stream_ids: ["engineering"] }
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

function lensKey(geography_lens_ids) {
  return ([]).concat(geography_lens_ids || []).slice().sort().join("|") || "_";
}

/** Core engineering catalogue used for most institutes */
const ENG_CORE = [
  "engineering_btech_cse",
  "engineering_btech_ece",
  "engineering_btech_mechanical",
  "engineering_btech_civil",
  "engineering_btech_electrical",
  "engineering_btech_it",
  "engineering_btech_ai_ds"
];

const ENG_EXTENDED = ENG_CORE.concat(ENGINEERING_EXTENDED.map((c) => c.id));

function classifyEngineeringTier(college) {
  const n = `${(college && college.type) || ""} ${(college && college.name) || ""}`.toLowerCase();
  if (/\biit\b|indian institute of technology\b/.test(n)) return "tier_iit";
  if (/\bnit\b|national institute of technology\b/.test(n)) return "tier_nit";
  if (/\biiit\b/.test(n)) return "tier_iiit";
  if (/institute of national importance|\bini\b/i.test(n)) return "tier_ini";
  if (/government|public\b/.test(n)) return "tier_government";
  if (/private|deemed/i.test(n)) return "tier_private";
  return "tier_general";
}

function engineeringCourseTargets(tier) {
  if (tier === "tier_iit" || tier === "tier_nit" || tier === "tier_iiit" || tier === "tier_ini") return ENG_EXTENDED;
  if (tier === "tier_government") return ENG_CORE.concat("engineering_btech_chemical");
  if (tier === "tier_private") return ENG_CORE;
  return ["engineering_btech_cse", "engineering_btech_ece", "engineering_btech_mechanical", "engineering_btech_electrical", "engineering_btech_civil"];
}

function isLawCollege(college) {
  const n = `${(college && college.type) || ""} ${(college && college.name) || ""}`.toLowerCase();
  return /\blaw\b|legal|\bnlu\b|\bnls\b|national law school/i.test(n);
}

function isAyushCollege(college) {
  const n = `${(college && college.type) || ""} ${(college && college.name) || ""}`.toLowerCase();
  return /\bayush\b|\bayurved|\bhomoe|\bhomeop|\bums\b|\bnaturopathy/i.test(n);
}

function courseTargetsForStream(college, streamId) {
  if (streamId === "engineering") return engineeringCourseTargets(classifyEngineeringTier(college));
  if (streamId === "law" && isLawCollege(college)) return ["law_ba_llb", "law_bba_llb", "law_llb"];
  if (streamId === "law") return ["law_ba_llb", "law_bba_llb"];
  if (streamId === "management") {
    const n = `${(college && college.type) || ""} ${(college && college.name) || ""}`.toLowerCase();
    if (/\biim\b|ipm\b/.test(n)) return ["management_bba", "management_ipm"];
    return ["management_bba"];
  }
  if (streamId === "commerce") return ["commerce_bcom", "commerce_bcom_hons"];
  if (streamId === "science_stats") return ["science_stats_bsc", "science_stats_bs", "science_stats_integrated_msc"];
  if (streamId === "design") return ["design_bdes", "design_fashion", "design_communication"];
  if (streamId === "pharmacy") return ["pharmacy_bpharm", "pharmacy_pharmd"];
  if (streamId === "ayush" && isAyushCollege(college)) return ["ayush_bams", "ayush_bhms", "ayush_bums", "ayush_bnys"];
  if (streamId === "education") return ["education_bed", "education_integrated_bed"];
  if (streamId === "fashion_media") return ["fashion_media_bjmc", "fashion_media_bmm"];
  if (streamId === "humanities") return ["humanities_ba", "humanities_ba_hons"];
  if (streamId === "medicine") return ["medicine_mbbs"];
  if (streamId === "dentistry") return ["dentistry_bds"];
  if (streamId === "architecture") return ["architecture_barch"];
  if (streamId === "veterinary") return ["veterinary_bvsc"];
  return [];
}

function mergeCourseTaxonomy(registry) {
  const existingCourses = new Map(((registry.taxonomies || {}).courses || []).map((c) => [c.id, c]));
  ENGINEERING_EXTENDED.forEach((course) => {
    existingCourses.set(course.id, {
      id: course.id,
      label: course.label,
      stream_ids: course.stream_ids,
      aliases: []
    });
  });
  registry.taxonomies = registry.taxonomies || {};
  registry.taxonomies.courses = Array.from(existingCourses.values()).sort((a, b) =>
    String(a.label || a.id).localeCompare(String(b.label || b.id))
  );
}

function main() {
  const registry = readJson(REGISTRY_PATH);
  const collegesById = new Map((registry.colleges || []).map((c) => [c.id, c]));
  mergeCourseTaxonomy(registry);

  const courseLabelById = new Map(registry.taxonomies.courses.map((c) => [c.id, c.label]));
  const programs = registry.college_programs || [];
  const programsByAnchor = new Map();

  programs.forEach((p) => {
    const lk = lensKey(p.geography_lens_ids);
    const ak = `${p.college_id}::${p.stream_id}::${lk}`;
    if (!programsByAnchor.has(ak)) programsByAnchor.set(ak, p);
  });

  let added = 0;
  const today = new Date().toISOString().slice(0, 10);
  const seenKeys = new Set(
    programs.map((p) => `${p.college_id}::${p.stream_id}::${p.course_id}::${lensKey(p.geography_lens_ids)}`)
  );

  programsByAnchor.forEach((template) => {
    const college = collegesById.get(template.college_id);
    const targets = courseTargetsForStream(college || {}, template.stream_id);
    if (!targets.length) return;

    targets.forEach((courseId) => {
      if (!courseLabelById.has(courseId)) {
        console.warn("Missing taxonomy label for course_id:", courseId, "— skip");
        return;
      }
      const dedupeKey = `${template.college_id}::${template.stream_id}::${courseId}::${lensKey(template.geography_lens_ids)}`;
      if (seenKeys.has(dedupeKey)) return;

      const programLabel = courseLabelById.get(courseId) || courseId;
      const newProg = JSON.parse(JSON.stringify(template));
      const idHash = crypto.createHash("sha1").update(dedupeKey).digest("hex").slice(0, 16);
      newProg.id = `exp_${idHash}`;
      newProg.course_id = courseId;
      newProg.program_name = programLabel;
      newProg.last_verified_on = today;
      newProg.availability = newProg.availability || {};
      newProg.availability.is_active = true;
      newProg.availability.confidence_level = "low";
      newProg.availability.catalogue_expansion = true;
      const baseNotes = template.availability && template.availability.notes ? String(template.availability.notes) : "";
      newProg.availability.notes =
        ([baseNotes, EXPAND_NOTE_APPEND].filter(Boolean).join(" ")).trim();

      registry.college_programs.push(newProg);
      seenKeys.add(dedupeKey);
      added += 1;
    });
  });

  registry.meta = registry.meta || {};
  registry.meta.last_updated = today;
  registry.meta.pipeline_stats = registry.meta.pipeline_stats || {};
  registry.meta.pipeline_stats.total_programs = registry.college_programs.length;
  registry.meta.pipeline_stats.total_colleges = (registry.colleges || []).length;
  registry.meta.pipeline_stats.last_pipeline_run = today;

  writeJson(REGISTRY_PATH, registry);
  console.log("expand-college-program-offerings: OK");
  console.log("- new program rows added:", added);
  console.log("- total programs:", registry.college_programs.length);
  console.log("- taxonomy courses:", registry.taxonomies.courses.length);
}

main();
