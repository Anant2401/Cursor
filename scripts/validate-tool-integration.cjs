#!/usr/bin/env node
/**
 * Validates DB/pehchaan_career_registry.json cross-references against tool JSON files,
 * and that sitemap.xml lists exactly the same Tool URLs as toolHtmlPaths (canonical tools).
 * Run from repo root: node scripts/validate-tool-integration.cjs
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function parentsGuideAssetTracked(relPosix) {
  try {
    execFileSync("git", ["check-ignore", "-q", relPosix], { cwd: root, stdio: "ignore" });
    return false;
  } catch (e) {
    if (e.status !== 1) return true;
  }
  try {
    execFileSync("git", ["ls-files", "--error-unmatch", relPosix], { cwd: root, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function readJson(rel) {
  const p = path.join(root, rel);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

/** Parent's Guide is a Next export: index.html must have matching _next assets on disk (and in git). */
function validateParentsGuideAssets(errs) {
  const indexRel = "Tools/parents-guide/index.html";
  const indexPath = path.join(root, indexRel);
  if (!fs.existsSync(indexPath)) return;
  const html = fs.readFileSync(indexPath, "utf8");
  const urls = new Set();
  for (const m of html.matchAll(/(?:href|src)=["'](\/Tools\/parents-guide\/[^"']+)["']/g)) {
    urls.add(m[1]);
  }
  const nextUrls = [...urls].filter((u) => u.includes("/_next/"));
  if (!nextUrls.length) {
    errs.push("parents-guide index.html has no /_next/ asset references — export may be broken");
    return;
  }
  let cssLinked = 0;
  const missingOnDisk = [];
  const untrackedInGit = [];
  for (const url of nextUrls) {
    const relPosix = url.replace(/^\//, "");
    const disk = path.join(root, relPosix.replace(/\//g, path.sep));
    if (!fs.existsSync(disk)) {
      missingOnDisk.push(relPosix);
      continue;
    }
    if (url.includes(".css")) cssLinked++;
    if (fs.existsSync(path.join(root, ".git")) && !parentsGuideAssetTracked(relPosix)) {
      untrackedInGit.push(relPosix);
    }
  }
  if (missingOnDisk.length) {
    errs.push(
      `parents-guide index references ${missingOnDisk.length} missing _next file(s), e.g. ${missingOnDisk[0]} — run scripts/export-parents-guide.cjs`
    );
  }
  if (untrackedInGit.length) {
    errs.push(
      `parents-guide has ${untrackedInGit.length} _next asset(s) not in git (deploy will be unstyled), e.g. ${untrackedInGit[0]} — git add Tools/parents-guide/ after export`
    );
  }
  if (!cssLinked) {
    errs.push(
      "parents-guide index.html links no CSS under _next/ — page will render unstyled; run node scripts/export-parents-guide.cjs"
    );
  }
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
  const privateRoles = readJson("DB/pehchaan_private_sector_roles.json");
  const collegeRegistry = readJson("DB/pehchaan_college_registry.json");

  const salaryIds = new Set((salary.careers || []).map((c) => c.id));
  const roiIds = new Set((roi.careers || []).map((c) => c.id));
  const examCareerIds = new Set((exam.careers || []).map((c) => c.id));
  const planbExams = planb.exams || planb.exam_skill_mappings || [];
  const planbExamIds = new Set(planbExams.map((e) => e.id).filter(Boolean));
  const skillJobIds = new Set((skill.job_categories || []).map((j) => j.id));
  const canonicalIds = new Set((reg.careers || []).map((r) => r.canonical_id).filter(Boolean));
  const privateRoleIds = new Set((privateRoles.roles || []).map((r) => r.private_role_id).filter(Boolean));
  const metroIds = new Set((privateRoles.metros || []).map((m) => m.metro_id).filter(Boolean));
  const collegeCourseIds = new Set((((collegeRegistry.taxonomies || {}).courses) || []).map((c) => c.id));
  const toolHtmlPaths = [
    "Tools/pehchaan_salary_explorer.html",
    "Tools/pehchaan_exam_roadmap.html",
    "Tools/pehchaan_career_roi_reality_bridge.html",
    "Tools/pehchaan_financing_reality.html",
    "Tools/pehchaan_plan_b_strategy_builder.html",
    "Tools/pehchaan_skill_gap_analyser.html",
    "Tools/pehchaan_stream_advisor.html",
    "Tools/pehchaan_career_assessment.html",
    "Tools/pehchaan_mentor_connect.html",
    "Tools/pehchaan_private_sector_journey.html",
    "Tools/pehchaan_college_finder.html",
    "Tools/parents-guide/index.html"
  ];

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
    if (Array.isArray(row.private_role_ids)) {
      for (const rid of row.private_role_ids) {
        if (!privateRoleIds.has(rid)) {
          errs.push(`${cid}: private_role_id "${rid}" not in pehchaan_private_sector_roles.json roles`);
        }
      }
    }
  }

  for (const role of privateRoles.roles || []) {
    const rid = role.private_role_id || "(missing private_role_id)";
    if (!role.private_role_id) errs.push(`private role missing private_role_id for title "${role.title || "unknown"}"`);
    if (role.career_canonical_id && !canonicalIds.has(role.career_canonical_id)) {
      errs.push(`${rid}: career_canonical_id "${role.career_canonical_id}" not in pehchaan_career_registry.json`);
    }
    if (role.skill_gap_job_id && !skillJobIds.has(role.skill_gap_job_id)) {
      errs.push(`${rid}: skill_gap_job_id "${role.skill_gap_job_id}" not in pehchaan_skill_gap_analyser_data.json`);
    }
    for (const ex of role.plan_b_exam_links || []) {
      if (!planbExamIds.has(ex)) {
        errs.push(`${rid}: plan_b_exam_link "${ex}" not in pehchaan_plan_b_strategy_builder_data.json exams`);
      }
    }
    if (!Array.isArray(role.metro_map) || !role.metro_map.length) {
      errs.push(`${rid}: metro_map is missing or empty`);
    } else {
      for (const mm of role.metro_map) {
        if (!metroIds.has(mm.metro_id)) errs.push(`${rid}: metro_map has unknown metro_id "${mm.metro_id}"`);
      }
    }
  }

  if (!reg.tool_integration) {
    errs.push("career registry missing tool_integration block");
  }
  for (const m of metroIds) {
    if (!["delhi_ncr", "chennai", "bengaluru", "hyderabad", "pune", "mumbai"].includes(m)) {
      errs.push(`private-sector metros contains unsupported metro id "${m}"`);
    }
  }
  if (!collegeCourseIds.size) errs.push("college registry has no taxonomy courses; College Finder linking cannot work");
  for (const rel of toolHtmlPaths) {
    if (!fs.existsSync(path.join(root, rel))) errs.push(`linked tool path missing on disk: ${rel}`);
  }

  validateParentsGuideAssets(errs);

  const siteOrigin = "https://pehchaancareers.in";
  const allowedToolLocs = new Set(toolHtmlPaths.map((rel) => `${siteOrigin}/${rel}`));
  let sitemapXml;
  try {
    sitemapXml = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
  } catch (e) {
    errs.push("cannot read sitemap.xml: " + e.message);
  }
  if (sitemapXml) {
    const locs = [...sitemapXml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map(function (m) {
      return m[1].trim();
    });
    for (const rel of toolHtmlPaths) {
      const want = `${siteOrigin}/${rel}`;
      if (!locs.includes(want)) errs.push(`sitemap.xml missing <loc> for ${rel}`);
    }
    for (const loc of locs) {
      if (!loc.startsWith(siteOrigin + "/Tools/")) continue;
      if (!allowedToolLocs.has(loc))
        errs.push(`sitemap.xml lists unexpected Tools URL (sync with scripts or remove): ${loc}`);
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
