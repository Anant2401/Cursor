#!/usr/bin/env node
/**
 * Build/refresh normalized college registry from Plan B college bundles.
 * Run from repo root:
 *   node scripts/migrate-planb-college-registry.cjs
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PLANB_PATH = path.join(ROOT, "DB", "pehchaan_plan_b_strategy_builder_data.json");
const REGISTRY_PATH = path.join(ROOT, "DB", "pehchaan_college_registry.json");
const INDEX_PATH = path.join(ROOT, "DB", "pehchaan_college_registry_indexes.json");

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

function toCourseIdFromCollegeName(collegeName, streamId) {
  // Plan B bundles currently do not have strict course ids.
  // We create a conservative inferred course bucket for now.
  const base = streamId === "medicine" ? "mbbs" : "generic";
  return streamId + "_" + base;
}
function inferConfidenceFromCollege(college) {
  const hasDirectWebsite = college && college.links && college.links.some((link) => /official|institute|college|university/i.test(String(link.label || "")));
  const hasNirf = !!(college && college.nirf_band);
  if (hasDirectWebsite && hasNirf) return "high";
  if (hasDirectWebsite || hasNirf) return "medium";
  return "low";
}

function uniquePush(arr, value) {
  if (!arr.includes(value)) arr.push(value);
}

function buildFromPlanB(planb) {
  const cp = planb && planb.college_plan_b;
  if (!cp) {
    throw new Error("Missing college_plan_b in Plan B JSON.");
  }

  const today = new Date().toISOString().slice(0, 10);

  const streams = (cp.streams || []).map((s) => ({ id: s.id, label: s.label }));
  const states = cp.states || [];
  const lenses = cp.lenses || [];
  const neighbors = cp.state_neighbors || {};

  const colleges = [];
  const collegePrograms = [];
  const collegeById = new Map();

  (cp.bundles || []).forEach((bundle) => {
    const streamId = bundle.stream_id;
    const lensId = bundle.lens_id;
    const stateId = bundle.state_id;
    (bundle.tiers || []).forEach((tier) => {
      (tier.colleges || []).forEach((c) => {
        const baseCollegeId = slugify(c.name || "college");
        const collegeId = baseCollegeId || "college_unknown";

        if (!collegeById.has(collegeId)) {
          const firstLink = (c.links || []).find((link) => /^https?:\/\//i.test(link.url || ""));
          const sourceUrls = (c.links || [])
            .map((link) => (link && link.url ? String(link.url).trim() : ""))
            .filter((url) => /^https?:\/\//i.test(url));

          const collegeObj = {
            id: collegeId,
            name: c.name || "Unknown college",
            state_id: stateId,
            city: c.location || "Unknown city",
            type: c.type || "Unknown type",
            ownership: "",
            confidence_level: inferConfidenceFromCollege(c),
            contact_missing_reason: "",
            contacts: {
              website: firstLink ? firstLink.url : "https://www.nirfindia.org/",
              email: "",
              phone: ""
            },
            highlights: {
              founded: c.founded || "",
              notable_alumni: c.notable_alumni ? [String(c.notable_alumni)] : [],
              best_for: c.best_for || "",
              specialization: c.specialization || "",
              unique_point: c.unique_point || "",
              why_choose: c.why_choose || "",
              notes: c.notes || ""
            },
            verification: {
              nirf_band: c.nirf_band || "",
              last_verified_on: today,
              source_urls: sourceUrls.length ? sourceUrls : ["https://www.nirfindia.org/"]
            }
          };

          collegeById.set(collegeId, collegeObj);
          colleges.push(collegeObj);
        }

        const courseId = toCourseIdFromCollegeName(c.name, streamId);
        const programId = slugify([collegeId, streamId, courseId, lensId, stateId].join("__"));
        collegePrograms.push({
          id: programId,
          college_id: collegeId,
          stream_id: streamId,
          course_id: courseId,
          geography_lens_ids: [lensId],
          admission_exam_ids: [],
          admission_routes: [],
          availability: {
            is_active: true,
            state_specific: lensId === "state_comfort",
            confidence_level: inferConfidenceFromCollege(c),
            notes: "Imported from Plan B bundle tier: " + (tier.tier_title || "Unknown tier")
          },
          last_verified_on: today
        });
      });
    });
  });

  const inferredCoursesById = new Map();
  collegePrograms.forEach((program) => {
    if (!inferredCoursesById.has(program.course_id)) {
      inferredCoursesById.set(program.course_id, {
        id: program.course_id,
        label: program.course_id.replace(/_/g, " ").toUpperCase(),
        stream_ids: [program.stream_id],
        aliases: []
      });
    } else {
      const row = inferredCoursesById.get(program.course_id);
      uniquePush(row.stream_ids, program.stream_id);
    }
  });

  const registry = {
    meta: {
      version: "1.1.0",
      last_updated: today,
      disclaimer:
        "This information is for discussion purposes only. Final decisions must be taken independently after consulting parents, guardians, teachers, and professional career counselors.",
      data_notes:
        "Auto-generated from DB/pehchaan_plan_b_strategy_builder_data.json college_plan_b. Course IDs are inferred placeholders and should be curated.",
      sources: [
        "https://www.nirfindia.org/",
        "https://josaa.nic.in/",
        "https://mcc.nic.in/"
      ],
      pipeline_stats: {
        total_colleges: colleges.length,
        total_programs: collegePrograms.length,
        stale_record_count: 0,
        last_pipeline_run: today
      }
    },
    taxonomies: {
      streams: streams,
      courses: Array.from(inferredCoursesById.values()),
      states: states,
      geography_lenses: lenses,
      admission_exams: []
    },
    state_neighbors: neighbors,
    colleges: colleges,
    college_programs: collegePrograms
  };

  return registry;
}

function buildIndexes(registry) {
  const byState = {};
  const byStream = {};
  const byCourse = {};
  const byStateStreamCourse = {};
  const byNeighborStateStreamCourse = {};

  const collegeStateById = new Map();
  (registry.colleges || []).forEach((c) => {
    collegeStateById.set(c.id, c.state_id);
    if (!byState[c.state_id]) byState[c.state_id] = [];
    uniquePush(byState[c.state_id], c.id);
  });

  (registry.college_programs || []).forEach((p) => {
    if (!byStream[p.stream_id]) byStream[p.stream_id] = [];
    uniquePush(byStream[p.stream_id], p.id);

    if (!byCourse[p.course_id]) byCourse[p.course_id] = [];
    uniquePush(byCourse[p.course_id], p.id);

    const stateId = collegeStateById.get(p.college_id) || "UNKNOWN";
    const key = [stateId, p.stream_id, p.course_id].join("|");
    if (!byStateStreamCourse[key]) byStateStreamCourse[key] = [];
    uniquePush(byStateStreamCourse[key], p.id);
  });
  const neighbors = registry.state_neighbors || {};
  Object.keys(neighbors).forEach((stateId) => {
    const list = Array.isArray(neighbors[stateId]) ? neighbors[stateId] : [];
    list.forEach((nState) => {
      Object.keys(byStateStreamCourse).forEach((k) => {
        const parts = k.split("|");
        if (parts[0] !== nState) return;
        const nKey = [stateId, parts[1], parts[2]].join("|");
        if (!byNeighborStateStreamCourse[nKey]) byNeighborStateStreamCourse[nKey] = [];
        byStateStreamCourse[k].forEach((pid) => uniquePush(byNeighborStateStreamCourse[nKey], pid));
      });
    });
  });

  return {
    meta: {
      version: "1.1.0",
      last_updated: registry.meta.last_updated,
      generated_from: "DB/pehchaan_college_registry.json",
      notes: "Generated lookup indexes for fast client-side filtering."
    },
    by_state: byState,
    by_stream: byStream,
    by_course: byCourse,
    by_state_stream_course: byStateStreamCourse,
    by_neighbor_state_stream_course: byNeighborStateStreamCourse
  };
}

function main() {
  if (!fs.existsSync(PLANB_PATH)) {
    throw new Error("Missing Plan B source file: " + PLANB_PATH);
  }

  const planb = readJson(PLANB_PATH);
  const registry = buildFromPlanB(planb);
  const indexes = buildIndexes(registry);

  writeJson(REGISTRY_PATH, registry);
  writeJson(INDEX_PATH, indexes);

  console.log("College registry migration complete.");
  console.log("- Colleges:", registry.colleges.length);
  console.log("- College programs:", registry.college_programs.length);
  console.log("- States with mappings:", Object.keys(indexes.by_state).length);
}

try {
  main();
} catch (error) {
  console.error("migrate-planb-college-registry failed:", error.message);
  process.exit(1);
}
