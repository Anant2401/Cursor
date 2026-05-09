#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const REGISTRY_PATH = path.join(ROOT, "DB", "pehchaan_college_registry.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function isHttp(url) {
  return /^https?:\/\//i.test(String(url || "").trim());
}

function main() {
  const data = readJson(REGISTRY_PATH);
  const errs = [];
  const warns = [];
  const stateIds = new Set((data.taxonomies && data.taxonomies.states || []).map((s) => s.id));
  const streamIds = new Set((data.taxonomies && data.taxonomies.streams || []).map((s) => s.id));
  const courseIds = new Set((data.taxonomies && data.taxonomies.courses || []).map((c) => c.id));
  const lensIds = new Set((data.taxonomies && data.taxonomies.geography_lenses || []).map((l) => l.id));
  const examIds = new Set((data.taxonomies && data.taxonomies.admission_exams || []).map((e) => e.id));

  const colleges = data.colleges || [];
  const programs = data.college_programs || [];
  const collegesById = new Map();
  const collegeNameMap = new Map();
  const collegesWithPrograms = new Set();
  const today = new Date().toISOString().slice(0, 10);

  colleges.forEach((c) => {
    if (collegesById.has(c.id)) errs.push("Duplicate college id: " + c.id);
    collegesById.set(c.id, c);
    const norm = String(c.name || "").trim().toLowerCase();
    if (norm) {
      if (!collegeNameMap.has(norm)) collegeNameMap.set(norm, []);
      collegeNameMap.get(norm).push(c.id);
    }
    if (!stateIds.has(c.state_id)) errs.push("College " + c.id + " uses unknown state_id: " + c.state_id);
    if (!isHttp(c.contacts && c.contacts.website)) errs.push("College " + c.id + " missing valid contacts.website");
    if (!["high", "medium", "low"].includes(c.confidence_level)) errs.push("College " + c.id + " missing confidence_level");
    const sUrls = c.verification && c.verification.source_urls || [];
    if (!sUrls.length) errs.push("College " + c.id + " has empty verification.source_urls");
    sUrls.forEach((u) => {
      if (!isHttp(u)) errs.push("College " + c.id + " has invalid source URL: " + u);
    });
    if ((c.verification && c.verification.last_verified_on || "") < "2024-01-01") warns.push("Potential stale verification date for " + c.id);
    if ((c.verification && c.verification.last_verified_on || "") > today) warns.push("Future verification date for " + c.id);
  });

  programs.forEach((p) => {
    if (!collegesById.has(p.college_id)) errs.push("Program " + p.id + " references unknown college_id: " + p.college_id);
    if (!streamIds.has(p.stream_id)) errs.push("Program " + p.id + " uses unknown stream_id: " + p.stream_id);
    if (!courseIds.has(p.course_id)) errs.push("Program " + p.id + " uses unknown course_id: " + p.course_id);
    (p.geography_lens_ids || []).forEach((l) => {
      if (!lensIds.has(l)) errs.push("Program " + p.id + " uses unknown lens: " + l);
    });
    (p.admission_exam_ids || []).forEach((e) => {
      if (!examIds.has(e)) warns.push("Program " + p.id + " exam id not in taxonomies: " + e);
    });
    if (!["high", "medium", "low"].includes(p.availability && p.availability.confidence_level)) {
      errs.push("Program " + p.id + " missing availability.confidence_level");
    }
    if (/_generic$/i.test(String(p.course_id || ""))) {
      warns.push("Program " + p.id + " uses generic course_id: " + p.course_id);
    }
    if (!String(p.program_name || "").trim() && !/_generic$/i.test(String(p.course_id || ""))) {
      warns.push("Program " + p.id + " missing program_name for specific course_id: " + p.course_id);
    }
    collegesWithPrograms.add(p.college_id);
  });

  colleges.forEach((c) => {
    if (!collegesWithPrograms.has(c.id)) errs.push("College has no program mapping: " + c.id);
  });

  collegeNameMap.forEach((ids, normName) => {
    if (ids.length > 1) warns.push("Duplicate-like college name: \"" + normName + "\" IDs: " + ids.join(", "));
  });

  Object.keys(data.state_neighbors || {}).forEach((sid) => {
    if (!stateIds.has(sid)) errs.push("state_neighbors has unknown state key: " + sid);
    (data.state_neighbors[sid] || []).forEach((nid) => {
      if (!stateIds.has(nid)) errs.push("state_neighbors for " + sid + " has unknown neighbour: " + nid);
    });
  });

  if (errs.length) {
    console.error("validate-college-registry: " + errs.length + " error(s)");
    errs.forEach((m) => console.error("  - " + m));
    if (warns.length) {
      console.warn("\nWarnings:");
      warns.forEach((m) => console.warn("  - " + m));
    }
    process.exit(1);
  }
  console.log("validate-college-registry: OK");
  if (warns.length) {
    console.warn("Warnings (" + warns.length + "):");
    warns.forEach((m) => console.warn("  - " + m));
  }
}

main();
