#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const REGISTRY_PATH = path.join(ROOT, "DB", "pehchaan_college_registry.json");
const OUT_CSV = path.join(ROOT, "docs", "college-finder-low-confidence-review.csv");
const OUT_MD = path.join(ROOT, "docs", "college-finder-data-health-report.md");

function pct(value, total) {
  if (!total) return "0.00%";
  return ((value / total) * 100).toFixed(2) + "%";
}

function main() {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
  const colleges = registry.colleges || [];
  const programs = registry.college_programs || [];
  const collegeById = new Map(colleges.map((c) => [c.id, c]));

  const streamCounts = {};
  const stateCounts = {};
  for (const program of programs) {
    streamCounts[program.stream_id] = (streamCounts[program.stream_id] || 0) + 1;
    const college = collegeById.get(program.college_id);
    if (college) stateCounts[college.state_id] = (stateCounts[college.state_id] || 0) + 1;
  }

  const lowCollege = colleges.filter((c) => String(c.confidence_level || "").toLowerCase() === "low");
  const lowProgram = programs.filter(
    (p) => String(((p.availability || {}).confidence_level || "")).toLowerCase() === "low"
  );

  const csvRows = [
    "kind,college_id,college_name,state_id,stream_id,course_id,confidence,website,source_url",
  ];
  for (const c of lowCollege) {
    const sourceUrl = ((c.verification || {}).source_urls || [])[0] || "";
    csvRows.push(
      [
        "college",
        c.id || "",
        JSON.stringify(c.name || ""),
        c.state_id || "",
        "",
        "",
        c.confidence_level || "",
        ((c.contacts || {}).website || ""),
        sourceUrl,
      ].join(",")
    );
  }
  for (const p of lowProgram) {
    const c = collegeById.get(p.college_id) || {};
    const sourceUrl = ((c.verification || {}).source_urls || [])[0] || "";
    csvRows.push(
      [
        "program",
        p.college_id || "",
        JSON.stringify(c.name || ""),
        c.state_id || "",
        p.stream_id || "",
        p.course_id || "",
        ((p.availability || {}).confidence_level || ""),
        ((c.contacts || {}).website || ""),
        sourceUrl,
      ].join(",")
    );
  }
  fs.writeFileSync(OUT_CSV, csvRows.join("\n"), "utf8");

  const totalPrograms = programs.length;
  const focusStreams = ["ayush", "dentistry", "architecture", "veterinary"];
  const focusLines = focusStreams
    .map((streamId) => `- ${streamId}: ${streamCounts[streamId] || 0} (${pct(streamCounts[streamId] || 0, totalPrograms)})`)
    .join("\n");
  const topStates = Object.entries(stateCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([stateId, count]) => `- ${stateId}: ${count}`)
    .join("\n");

  const report = [
    "# College Finder Data Health Report",
    "",
    `Generated on: ${new Date().toISOString()}`,
    "",
    "## Coverage",
    `- Total colleges: ${colleges.length}`,
    `- Total programs: ${programs.length}`,
    `- States covered: ${new Set(colleges.map((c) => c.state_id)).size}`,
    "",
    "## Confidence",
    `- Low-confidence colleges: ${lowCollege.length}`,
    `- Low-confidence programs: ${lowProgram.length}`,
    "",
    "## Focus stream coverage",
    focusLines,
    "",
    "## Top states by program count",
    topStates,
    "",
    "## Next action",
    "- Review and upgrade rows in docs/college-finder-low-confidence-review.csv before next ingestion batch.",
    "",
  ].join("\n");

  fs.writeFileSync(OUT_MD, report, "utf8");
  console.log("generate-college-data-health: OK");
  console.log("- wrote:", path.relative(ROOT, OUT_CSV));
  console.log("- wrote:", path.relative(ROOT, OUT_MD));
  console.log("- low-confidence colleges:", lowCollege.length);
  console.log("- low-confidence programs:", lowProgram.length);
}

main();

