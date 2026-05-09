#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const REGISTRY_PATH = path.join(ROOT, "DB", "pehchaan_college_registry.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

const CANONICAL_COURSES = [
  { id: "engineering_btech_cse", label: "B.Tech Computer Science and Engineering", stream_ids: ["engineering"], aliases: ["cse", "computer science"] },
  { id: "engineering_btech_ece", label: "B.Tech Electronics and Communication Engineering", stream_ids: ["engineering"], aliases: ["ece", "electronics"] },
  { id: "engineering_btech_mechanical", label: "B.Tech Mechanical Engineering", stream_ids: ["engineering"], aliases: ["mechanical"] },
  { id: "engineering_btech_civil", label: "B.Tech Civil Engineering", stream_ids: ["engineering"], aliases: ["civil"] },
  { id: "engineering_btech_electrical", label: "B.Tech Electrical Engineering", stream_ids: ["engineering"], aliases: ["electrical", "eee"] },
  { id: "engineering_btech_it", label: "B.Tech Information Technology", stream_ids: ["engineering"], aliases: ["it", "information technology"] },
  { id: "engineering_btech_ai_ds", label: "B.Tech AI and Data Science", stream_ids: ["engineering"], aliases: ["ai", "data science"] },
  { id: "engineering_btech_chemical", label: "B.Tech Chemical Engineering", stream_ids: ["engineering"], aliases: ["chemical"] },
  { id: "engineering_btech_biotechnology", label: "B.Tech Biotechnology", stream_ids: ["engineering"], aliases: ["biotech", "biotechnology"] },
  { id: "engineering_btech_aerospace", label: "B.Tech Aerospace Engineering", stream_ids: ["engineering"], aliases: ["aerospace", "aeronautical"] },
  { id: "engineering_btech_metallurgy", label: "B.Tech Metallurgical and Materials Engineering", stream_ids: ["engineering"], aliases: ["metallurgy", "materials"] },
  { id: "engineering_btech_mining", label: "B.Tech Mining Engineering", stream_ids: ["engineering"], aliases: ["mining"] },
  { id: "engineering_btech_instrumentation", label: "B.Tech Instrumentation and Control Engineering", stream_ids: ["engineering"], aliases: ["instrumentation", "ice"] },
  { id: "architecture_barch", label: "B.Arch Architecture", stream_ids: ["architecture"], aliases: ["b.arch", "architecture"] },
  { id: "design_bdes", label: "B.Des Design", stream_ids: ["design"], aliases: ["b.des", "design"] },
  { id: "design_fashion", label: "B.Des Fashion Design", stream_ids: ["design"], aliases: ["fashion"] },
  { id: "design_communication", label: "B.Des Communication Design", stream_ids: ["design"], aliases: ["communication design"] },
  { id: "medicine_mbbs", label: "MBBS", stream_ids: ["medicine"], aliases: ["mbbs"] },
  { id: "dentistry_bds", label: "BDS", stream_ids: ["dentistry"], aliases: ["bds", "dental"] },
  { id: "ayush_bams", label: "BAMS", stream_ids: ["ayush"], aliases: ["bams", "ayurveda"] },
  { id: "ayush_bhms", label: "BHMS", stream_ids: ["ayush"], aliases: ["bhms", "homeopathy"] },
  { id: "ayush_bums", label: "BUMS", stream_ids: ["ayush"], aliases: ["bums", "unani"] },
  { id: "ayush_bnys", label: "BNYS", stream_ids: ["ayush"], aliases: ["bnys", "naturopathy"] },
  { id: "pharmacy_bpharm", label: "B.Pharm", stream_ids: ["pharmacy"], aliases: ["b.pharm", "bpharm"] },
  { id: "pharmacy_pharmd", label: "Pharm.D", stream_ids: ["pharmacy"], aliases: ["pharm.d", "pharmd"] },
  { id: "law_ba_llb", label: "BA LLB", stream_ids: ["law"], aliases: ["ba llb"] },
  { id: "law_bba_llb", label: "BBA LLB", stream_ids: ["law"], aliases: ["bba llb"] },
  { id: "law_llb", label: "LLB", stream_ids: ["law"], aliases: ["llb"] },
  { id: "management_bba", label: "BBA", stream_ids: ["management"], aliases: ["bba"] },
  { id: "management_ipm", label: "IPM", stream_ids: ["management"], aliases: ["ipm"] },
  { id: "commerce_bcom", label: "B.Com", stream_ids: ["commerce"], aliases: ["b.com", "bcom"] },
  { id: "commerce_bcom_hons", label: "B.Com (Hons)", stream_ids: ["commerce"], aliases: ["b.com hons", "bcom hons"] },
  { id: "science_stats_bsc", label: "B.Sc", stream_ids: ["science_stats"], aliases: ["b.sc", "bsc"] },
  { id: "science_stats_bs", label: "BS", stream_ids: ["science_stats"], aliases: ["bs"] },
  { id: "science_stats_integrated_msc", label: "Integrated M.Sc", stream_ids: ["science_stats"], aliases: ["integrated msc"] },
  { id: "fashion_media_bjmc", label: "BJMC", stream_ids: ["fashion_media"], aliases: ["bjmc", "journalism"] },
  { id: "fashion_media_bmm", label: "BMM / Mass Media", stream_ids: ["fashion_media"], aliases: ["bmm", "mass media"] },
  { id: "humanities_ba", label: "BA", stream_ids: ["humanities"], aliases: ["ba"] },
  { id: "humanities_ba_hons", label: "BA (Hons)", stream_ids: ["humanities"], aliases: ["ba hons"] },
  { id: "education_bed", label: "B.Ed", stream_ids: ["education"], aliases: ["b.ed", "bed"] },
  { id: "education_integrated_bed", label: "Integrated B.Ed", stream_ids: ["education"], aliases: ["integrated bed", "ba bed", "bsc bed"] },
  { id: "veterinary_bvsc", label: "BVSc and AH", stream_ids: ["veterinary"], aliases: ["bvsc", "veterinary"] }
];

const DEFAULT_BY_STREAM = {
  engineering: "engineering_btech_cse",
  architecture: "architecture_barch",
  design: "design_bdes",
  medicine: "medicine_mbbs",
  dentistry: "dentistry_bds",
  ayush: "ayush_bams",
  pharmacy: "pharmacy_bpharm",
  law: "law_ba_llb",
  management: "management_bba",
  commerce: "commerce_bcom",
  science_stats: "science_stats_bsc",
  fashion_media: "fashion_media_bjmc",
  humanities: "humanities_ba",
  education: "education_bed",
  veterinary: "veterinary_bvsc"
};

function inferCourseId(program, college) {
  const stream = String(program.stream_id || "");
  const hay = [
    program.id,
    program.program_name,
    (program.availability || {}).notes,
    (college || {}).name,
    (college || {}).type,
    (college || {}).highlights && (college || {}).highlights.specialization
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const candidates = CANONICAL_COURSES.filter((c) => (c.stream_ids || []).includes(stream));
  for (const c of candidates) {
    if ((c.aliases || []).some((alias) => hay.includes(String(alias).toLowerCase()))) return c.id;
  }
  return DEFAULT_BY_STREAM[stream] || program.course_id;
}

function main() {
  const registry = readJson(REGISTRY_PATH);
  const collegesById = new Map((registry.colleges || []).map((c) => [c.id, c]));
  const existingCourses = new Map(((registry.taxonomies || {}).courses || []).map((c) => [c.id, c]));

  CANONICAL_COURSES.forEach((course) => {
    existingCourses.set(course.id, {
      id: course.id,
      label: course.label,
      stream_ids: course.stream_ids,
      aliases: course.aliases || []
    });
  });

  let remappedCount = 0;
  let namedCount = 0;
  (registry.college_programs || []).forEach((program) => {
    const college = collegesById.get(program.college_id);
    const oldCourseId = String(program.course_id || "");
    const isGeneric = /_generic$/i.test(oldCourseId);
    if (isGeneric) {
      const mapped = inferCourseId(program, college);
      if (mapped && mapped !== oldCourseId) {
        program.course_id = mapped;
        remappedCount += 1;
      }
    }
    if (!String(program.program_name || "").trim()) {
      const course = existingCourses.get(program.course_id);
      if (course && course.label) {
        program.program_name = course.label;
        namedCount += 1;
      }
    }
  });

  registry.taxonomies = registry.taxonomies || {};
  registry.taxonomies.courses = Array.from(existingCourses.values()).sort((a, b) => String(a.label || a.id).localeCompare(String(b.label || b.id)));

  registry.meta = registry.meta || {};
  registry.meta.last_updated = new Date().toISOString().slice(0, 10);
  registry.meta.data_notes =
    "Course taxonomy includes canonical program labels. Generic legacy mappings are progressively remapped to specific course IDs.";
  registry.meta.pipeline_stats = registry.meta.pipeline_stats || {};
  registry.meta.pipeline_stats.total_programs = (registry.college_programs || []).length;
  registry.meta.pipeline_stats.total_colleges = (registry.colleges || []).length;
  registry.meta.pipeline_stats.last_pipeline_run = registry.meta.last_updated;

  writeJson(REGISTRY_PATH, registry);
  console.log("migrate-canonical-courses: OK");
  console.log("- remapped generic programs:", remappedCount);
  console.log("- program_name populated:", namedCount);
  console.log("- taxonomy courses:", (registry.taxonomies.courses || []).length);
}

main();

