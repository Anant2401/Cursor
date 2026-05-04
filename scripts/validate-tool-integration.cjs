#!/usr/bin/env node
/**
 * Validates DB/pehchaan_career_registry.json cross-references against tool JSON files.
 * Run from repo root: node scripts/validate-tool-integration.cjs
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function readJson(rel) {
  const p = path.join(root, rel);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function main() {
  const errs = [];
  let reg;
  try {
    reg = readJson("DB/pehchaan_career_registry.json");
  } catch (e) {
    console.error("Cannot read career registry:", e.message);
    process.exit(1);
  }

  const salary = readJson("DB/pehchaan_salary_explorer_data.json");
  const roi = readJson("DB/pehchaan_career_roi_reality_bridge_data.json");
  const exam = readJson("DB/pehchaan_exam_data.json");
  const planb = readJson("DB/pehchaan_plan_b_strategy_builder_data.json");
  const skill = readJson("DB/pehchaan_skill_gap_analyser_data.json");

  const salaryIds = new Set((salary.careers || []).map((c) => c.id));
  const roiIds = new Set((roi.careers || []).map((c) => c.id));
  const examCareerIds = new Set((exam.careers || []).map((c) => c.id));
  const planbExams = planb.exams || planb.exam_skill_mappings || [];
  const planbExamIds = new Set(planbExams.map((e) => e.id).filter(Boolean));
  const skillJobIds = new Set((skill.job_categories || []).map((j) => j.id));

  for (const row of reg.careers || []) {
    const cid = row.canonical_id || "(missing canonical_id)";
    if (row.salary_explorer_id != null && !salaryIds.has(row.salary_explorer_id)) {
      errs.push(`${cid}: salary_explorer_id ${row.salary_explorer_id} not in pehchaan_salary_explorer_data.json`);
    }
    if (row.roi_career_id && !roiIds.has(row.roi_career_id)) {
      errs.push(`${cid}: roi_career_id "${row.roi_career_id}" not in pehchaan_career_roi_reality_bridge_data.json`);
    }
    if (row.exam_roadmap_career_id && !examCareerIds.has(row.exam_roadmap_career_id)) {
      errs.push(`${cid}: exam_roadmap_career_id "${row.exam_roadmap_career_id}" not in pehchaan_exam_data.json`);
    }
    if (row.plan_b_exam_id && !planbExamIds.has(row.plan_b_exam_id)) {
      errs.push(`${cid}: plan_b_exam_id "${row.plan_b_exam_id}" not in pehchaan_plan_b_strategy_builder_data.json exams`);
    }
    if (row.skill_gap_job_id && !skillJobIds.has(row.skill_gap_job_id)) {
      errs.push(`${cid}: skill_gap_job_id "${row.skill_gap_job_id}" not in pehchaan_skill_gap_analyser_data.json job_categories`);
    }
  }

  if (errs.length) {
    console.error("validate-tool-integration: " + errs.length + " error(s)\n");
    errs.forEach(function (m) {
      console.error("  - " + m);
    });
    process.exit(1);
  }
  console.log("validate-tool-integration: OK — registry cross-refs match tool JSON files.");
}

main();
