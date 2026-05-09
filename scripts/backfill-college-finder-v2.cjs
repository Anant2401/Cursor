#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const REGISTRY_PATH = path.join(ROOT, "DB", "pehchaan_college_registry.json");
const EXAM_PATH = path.join(ROOT, "DB", "pehchaan_exam_data.json");
const REPORT_PATH = path.join(ROOT, "docs", "college-finder-v2-backfill-report.md");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function parseDateToday() {
  return new Date().toISOString().slice(0, 10);
}

function isHttp(url) {
  return /^https?:\/\//i.test(String(url || "").trim());
}

function uniq(arr) {
  return Array.from(new Set((arr || []).filter(Boolean)));
}

function buildExamIdSet(examDb) {
  const ids = new Set();
  (examDb.careers || []).forEach((row) => {
    if (row && row.id) ids.add(String(row.id));
  });
  return ids;
}

function firstMatchingExamId(availableIds, candidates) {
  for (const id of candidates) {
    if (availableIds.has(id)) return id;
  }
  return "";
}

function defaultExamCandidatesByStream(stream) {
  if (stream === "engineering") return ["jee_main", "jee", "jeeadv26"];
  if (stream === "medicine") return ["neet_ug", "neet", "neet26"];
  if (stream === "dentistry") return ["neet_ug", "neetbds", "neet"];
  if (stream === "law") return ["clat_ug", "clat", "clat26"];
  if (stream === "architecture") return ["arch", "nata"];
  if (stream === "design" || stream === "fashion_media") return ["nift", "niftee27"];
  if (stream === "commerce" || stream === "management" || stream === "humanities" || stream === "science_stats" || stream === "education") return ["cuet_ug"];
  return [];
}

function inferAdmissionRoute(program, college, availableExamIds, fallbackUrl, today) {
  const type = String(college.type || "").toLowerCase();
  const stream = String(program.stream_id || "");
  const course = String(program.course_id || "");
  const lenses = program.geography_lens_ids || [];
  let primary = "verify";
  let pathways = [];
  let examCandidates = [];
  let confidence = "low";

  if (/(iit|nit|iiit)/i.test(type)) {
    primary = "all_india_counselling";
    pathways = ["jossa", "csab"];
    examCandidates = ["jee_main", "jee", "jeeadv26"];
    confidence = "medium";
  } else if (stream === "medicine" && course === "medicine_mbbs") {
    primary = "mixed";
    pathways = ["mcc", "state_counselling"];
    examCandidates = ["neet_ug", "neet", "neet26"];
    confidence = "medium";
  } else if (stream === "law" && /nlu/i.test(type)) {
    primary = "all_india_counselling";
    pathways = ["consortium_law"];
    examCandidates = ["clat_ug", "clat", "clat26"];
    confidence = "medium";
  } else if (stream === "architecture") {
    primary = "mixed";
    pathways = ["state_cet", "institute_portal"];
    examCandidates = ["arch", "nata"];
    confidence = "low";
  } else if (/(management|commerce|humanities|science_stats|education)/.test(stream) && /university/i.test(type)) {
    primary = "institute_level";
    pathways = ["institute_portal"];
    examCandidates = ["cuet_ug"];
    confidence = "low";
  } else if (lenses.length && lenses.every((l) => l === "national_level")) {
    primary = "all_india_counselling";
    pathways = ["all_india_portal"];
    examCandidates = defaultExamCandidatesByStream(stream);
    confidence = "low";
  } else if (lenses.length && lenses.every((l) => l === "state_comfort")) {
    primary = "state_counselling";
    pathways = ["state_cet"];
    examCandidates = defaultExamCandidatesByStream(stream);
    confidence = "low";
  }

  const pickedExam = firstMatchingExamId(availableExamIds, examCandidates);
  const examIds = pickedExam ? [pickedExam] : [];
  const verificationUrl = isHttp(fallbackUrl) ? fallbackUrl : String((college.contacts || {}).website || "");

  return {
    primary,
    exam_ids: examIds,
    pathways,
    verification_url: verificationUrl,
    confidence,
    last_updated: today,
    notes: "Rule-based backfill; verify on official counselling/institute portals."
  };
}

function inferLivingBand(city) {
  const c = String(city || "").toLowerCase();
  if (/mumbai|new delhi|delhi|bengaluru|bangalore|hyderabad|chennai|pune/.test(c)) return "high";
  if (/kolkata|ahmedabad|surat|jaipur|lucknow|kanpur|nagpur|indore|bhopal|patna|chandigarh|noida|gurugram|coimbatore|visakhapatnam|vijayawada|kochi|kozhikode|thiruvananthapuram/.test(c)) return "medium";
  return "low";
}

function inferHostelContext(type) {
  const t = String(type || "").toLowerCase();
  if (/(iit|nit|iiit|iiser|nlu|national institute)/.test(t)) return { value: "likely", confidence: "medium" };
  if (/university|state university|deemed/.test(t)) return { value: "mixed", confidence: "low" };
  if (/affiliated|autonomous|private|college/.test(t)) return { value: "limited", confidence: "low" };
  return { value: "unknown", confidence: "low" };
}

function budgetForBand(band) {
  if (band === "low") return { min: 8000, max: 15000 };
  if (band === "medium") return { min: 15000, max: 25000 };
  if (band === "high") return { min: 25000, max: 45000 };
  return { min: null, max: null };
}

function inferUniversityStatus(type) {
  const t = String(type || "").toLowerCase();
  if (t.includes("deemed")) return { value: "deemed", confidence: "medium" };
  if (t.includes("state university")) return { value: "state_act", confidence: "medium" };
  if (t.includes("autonomous")) return { value: "autonomous", confidence: "low" };
  if (t.includes("private")) return { value: "private_university", confidence: "low" };
  if (/(iit|nit|iiit|iiser|nlu|iim|aiims|aims|government)/.test(t)) return { value: "ugc", confidence: "medium" };
  if (t.includes("university")) return { value: "ugc", confidence: "low" };
  return { value: "unknown", confidence: "low" };
}

function requiredRegulatorsForProgram(program) {
  const stream = String(program.stream_id || "");
  const course = String(program.course_id || "");
  if (course === "medicine_mbbs" || stream === "medicine") return ["NMC"];
  if (stream === "dentistry" || course === "dentistry_generic") return ["DCI_or_equivalent"];
  if (stream === "ayush" || course === "ayush_generic") return ["NCISM_or_NCH"];
  if (stream === "pharmacy" || course === "pharmacy_generic") return ["PCI"];
  if (stream === "law" || course === "law_generic") return ["BCI"];
  if (stream === "education" || course === "education_generic") return ["NCTE"];
  if (stream === "architecture" || course === "architecture_generic") return ["COA"];
  if (stream === "engineering" || course === "engineering_generic") return ["UGC_or_AICTE_context"];
  return ["UGC_or_state_university_context"];
}

function toCoveragePct(count, total) {
  if (!total) return "0.0";
  return ((count / total) * 100).toFixed(1);
}

function main() {
  const data = readJson(REGISTRY_PATH);
  const examDb = readJson(EXAM_PATH);
  const today = parseDateToday();
  const availableExamIds = buildExamIdSet(examDb);

  const colleges = data.colleges || [];
  const programs = data.college_programs || [];
  const collegeById = new Map(colleges.map((c) => [c.id, c]));
  const requiredRegulatorsByCollege = new Map();

  let admissionPrimaryCount = 0;
  let admissionExamCount = 0;
  let routeVerifyCount = 0;

  programs.forEach((program) => {
    const college = collegeById.get(program.college_id);
    if (!college) return;
    const fallbackUrl = (college.verification && college.verification.source_urls && college.verification.source_urls[0]) || "";
    program.admission_route = inferAdmissionRoute(program, college, availableExamIds, fallbackUrl, today);
    if (program.admission_route.primary) admissionPrimaryCount += 1;
    if ((program.admission_route.exam_ids || []).length) admissionExamCount += 1;
    if (program.admission_route.primary === "verify") routeVerifyCount += 1;

    const regs = requiredRegulatorsForProgram(program);
    if (!requiredRegulatorsByCollege.has(program.college_id)) requiredRegulatorsByCollege.set(program.college_id, new Set());
    regs.forEach((r) => requiredRegulatorsByCollege.get(program.college_id).add(r));
  });

  let costBandCount = 0;
  let recognitionStatusCount = 0;
  let recognitionRequiredCount = 0;

  colleges.forEach((college) => {
    const livingBand = inferLivingBand(college.city);
    const hostel = inferHostelContext(college.type);
    const budget = budgetForBand(livingBand);
    college.cost_band = {
      living_city_band: livingBand,
      hostel_context: hostel.value,
      monthly_budget_min: budget.min,
      monthly_budget_max: budget.max,
      method: "heuristic",
      confidence: hostel.confidence === "medium" && livingBand !== "low" ? "medium" : "low",
      last_updated: today,
      notes: "Estimated from city band and institution type; verify with official hostel/fee pages."
    };
    if (college.cost_band.living_city_band) costBandCount += 1;

    const uni = inferUniversityStatus(college.type);
    const requiredRegs = uniq(Array.from(requiredRegulatorsByCollege.get(college.id) || []));
    const verifyUrls = uniq((college.verification && college.verification.source_urls) || []).filter(isHttp);
    college.recognition = {
      university_status: uni.value,
      regulators_required: requiredRegs,
      regulators_verified: [],
      verification_urls: verifyUrls,
      confidence: verifyUrls.length ? uni.confidence : "low",
      last_updated: today,
      notes: "Required regulators inferred by stream/course; verification pending official regulator checks."
    };
    if (college.recognition.university_status) recognitionStatusCount += 1;
    if (requiredRegs.length) recognitionRequiredCount += 1;
  });

  if (data.meta) {
    data.meta.last_updated = today;
    if (data.meta.pipeline_stats) {
      data.meta.pipeline_stats.total_colleges = colleges.length;
      data.meta.pipeline_stats.total_programs = programs.length;
      data.meta.pipeline_stats.last_pipeline_run = today;
    }
  }

  writeJson(REGISTRY_PATH, data);

  const report = [
    "# College Finder v2 Backfill Report",
    "",
    `Generated on: ${today}`,
    "",
    "## Coverage Summary",
    "",
    `- Colleges: **${colleges.length}**`,
    `- Programs: **${programs.length}**`,
    "",
    `- Admission route primary populated: **${admissionPrimaryCount}/${programs.length}** (${toCoveragePct(admissionPrimaryCount, programs.length)}%)`,
    `- Admission route exam IDs populated: **${admissionExamCount}/${programs.length}** (${toCoveragePct(admissionExamCount, programs.length)}%)`,
    `- Admission route = verify fallback: **${routeVerifyCount}/${programs.length}** (${toCoveragePct(routeVerifyCount, programs.length)}%)`,
    "",
    `- Cost band populated: **${costBandCount}/${colleges.length}** (${toCoveragePct(costBandCount, colleges.length)}%)`,
    `- Recognition university status populated: **${recognitionStatusCount}/${colleges.length}** (${toCoveragePct(recognitionStatusCount, colleges.length)}%)`,
    `- Recognition regulators_required populated: **${recognitionRequiredCount}/${colleges.length}** (${toCoveragePct(recognitionRequiredCount, colleges.length)}%)`,
    "",
    "## Notes",
    "",
    "- This pass is rule-based (`method=heuristic`) and should be followed by sample manual review.",
    "- `regulators_verified` is intentionally empty in this phase to avoid false verification claims.",
    "- Exam IDs are mapped only when suitable IDs are found in `pehchaan_exam_data.json`.",
    ""
  ].join("\n");

  fs.writeFileSync(REPORT_PATH, report, "utf8");
  console.log("backfill-college-finder-v2: OK");
  console.log("- registry updated:", path.relative(ROOT, REGISTRY_PATH));
  console.log("- report written:", path.relative(ROOT, REPORT_PATH));
}

main();

