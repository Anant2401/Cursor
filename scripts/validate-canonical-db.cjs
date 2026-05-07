#!/usr/bin/env node
/**
 * Canonical DB validator: schema-shape + FK/linkage integrity checks.
 * Run from repo root: node scripts/validate-canonical-db.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CANON = path.join(ROOT, "DB", "canonical");

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), "utf8"));
}

function ensureArray(x) {
  return Array.isArray(x) ? x : [];
}

function pushUniqueError(set, errors, msg) {
  if (!set.has(msg)) {
    set.add(msg);
    errors.push(msg);
  }
}

function isIsoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function validateQualityEnvelope(entityType, entityId, row, errors, warnings, seenErrors) {
  const prefix = `${entityType} "${entityId}"`;
  const provenance = row.provenance || {};
  const freshness = row.freshness || {};
  const contradiction = row.contradiction_handling || {};

  const sources = Array.isArray(provenance.sources) ? provenance.sources : [];
  if (!sources.length) {
    pushUniqueError(seenErrors, errors, `${prefix} has missing/empty provenance.sources`);
  }
  const confidence = Number(provenance.confidence);
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
    pushUniqueError(seenErrors, errors, `${prefix} has invalid provenance.confidence (expected 0.0-1.0)`);
  }

  if (!isIsoDate(freshness.last_verified_on)) {
    pushUniqueError(seenErrors, errors, `${prefix} has invalid freshness.last_verified_on (expected YYYY-MM-DD)`);
  }
  const reviewCycleDays = Number(freshness.review_cycle_days);
  if (!Number.isInteger(reviewCycleDays) || reviewCycleDays < 1 || reviewCycleDays > 365) {
    pushUniqueError(seenErrors, errors, `${prefix} has invalid freshness.review_cycle_days (expected 1-365)`);
  } else if (isIsoDate(freshness.last_verified_on)) {
    const lastVerified = new Date(`${freshness.last_verified_on}T00:00:00Z`);
    const now = new Date();
    const elapsedDays = Math.floor((now - lastVerified) / (1000 * 60 * 60 * 24));
    if (elapsedDays > reviewCycleDays) {
      warnings.push(`${prefix} is stale by ${elapsedDays - reviewCycleDays} day(s) beyond freshness window`);
    }
  }

  if (!["none", "under_review", "resolved"].includes(contradiction.status)) {
    pushUniqueError(seenErrors, errors, `${prefix} has invalid contradiction_handling.status`);
  }
  if (!["higher_confidence_wins", "manual_editor_review", "latest_verified_source"].includes(contradiction.resolution_policy)) {
    pushUniqueError(seenErrors, errors, `${prefix} has invalid contradiction_handling.resolution_policy`);
  }
  if (!Number.isInteger(contradiction.conflicting_source_count) || contradiction.conflicting_source_count < 0) {
    pushUniqueError(seenErrors, errors, `${prefix} has invalid contradiction_handling.conflicting_source_count`);
  }
}

function validateMetaPolicy(fileId, payload, errors, seenErrors) {
  const qualityPolicy = payload.meta && payload.meta.quality_policy;
  if (!qualityPolicy || typeof qualityPolicy !== "object") {
    pushUniqueError(seenErrors, errors, `${fileId} missing meta.quality_policy`);
    return;
  }
  if (typeof qualityPolicy.confidence_scale !== "string" || !qualityPolicy.confidence_scale.length) {
    pushUniqueError(seenErrors, errors, `${fileId} has invalid meta.quality_policy.confidence_scale`);
  }
  if (!Number.isInteger(qualityPolicy.freshness_sla_days) || qualityPolicy.freshness_sla_days < 1) {
    pushUniqueError(seenErrors, errors, `${fileId} has invalid meta.quality_policy.freshness_sla_days`);
  }
  const rules = qualityPolicy.contradiction_rules;
  if (!rules || typeof rules !== "object") {
    pushUniqueError(seenErrors, errors, `${fileId} missing meta.quality_policy.contradiction_rules`);
    return;
  }
  if (!Number.isInteger(rules.auto_flag_threshold) || rules.auto_flag_threshold < 1) {
    pushUniqueError(seenErrors, errors, `${fileId} has invalid contradiction_rules.auto_flag_threshold`);
  }
  if (!["higher_confidence_wins", "manual_editor_review", "latest_verified_source"].includes(rules.default_resolution_policy)) {
    pushUniqueError(seenErrors, errors, `${fileId} has invalid contradiction_rules.default_resolution_policy`);
  }
}

function main() {
  const errors = [];
  const warnings = [];
  const seenErrors = new Set();

  const careersJson = readJson("DB/canonical/careers.json");
  const skillMapJson = readJson("DB/canonical/skill_map.json");
  const resourcesJson = readJson("DB/canonical/resources.json");
  const examsJson = readJson("DB/canonical/exams.json");
  const institutionsJson = readJson("DB/canonical/institutions.json");
  const financialAidJson = readJson("DB/canonical/financial_aid.json");
  const idMapJson = readJson("DB/canonical/_id_map.json");

  const careers = ensureArray(careersJson.careers);
  const skillMap = ensureArray(skillMapJson.skill_map);
  const resources = ensureArray(resourcesJson.resources);
  const exams = ensureArray(examsJson.exams);
  const institutions = ensureArray(institutionsJson.institutions);
  const financialAid = ensureArray(financialAidJson.financial_aid);
  const idMapCareers = ensureArray(idMapJson.careers);

  const careerIds = new Set();
  const examIds = new Set();
  const institutionIds = new Set();
  const resourceIds = new Set();
  const skillIds = new Set();
  const skillByCareer = new Map();
  const idMapByCareer = new Map();
  const examById = new Map();

  validateMetaPolicy("careers.json", careersJson, errors, seenErrors);
  validateMetaPolicy("skill_map.json", skillMapJson, errors, seenErrors);
  validateMetaPolicy("resources.json", resourcesJson, errors, seenErrors);
  validateMetaPolicy("exams.json", examsJson, errors, seenErrors);
  validateMetaPolicy("institutions.json", institutionsJson, errors, seenErrors);
  validateMetaPolicy("financial_aid.json", financialAidJson, errors, seenErrors);

  for (const i of institutions) {
    institutionIds.add(i.institution_id);
    validateQualityEnvelope("institution", i.institution_id || "<missing>", i, errors, warnings, seenErrors);
  }

  for (const ex of exams) {
    if (!ex.exam_id) {
      pushUniqueError(seenErrors, errors, "exam missing exam_id");
      continue;
    }
    if (examIds.has(ex.exam_id)) {
      pushUniqueError(seenErrors, errors, `duplicate exam_id "${ex.exam_id}"`);
    }
    examIds.add(ex.exam_id);
    examById.set(ex.exam_id, ex);
    validateQualityEnvelope("exam", ex.exam_id, ex, errors, warnings, seenErrors);
  }

  for (const c of careers) {
    if (!c.career_id) {
      pushUniqueError(seenErrors, errors, "career missing career_id");
      continue;
    }
    if (careerIds.has(c.career_id)) {
      pushUniqueError(seenErrors, errors, `duplicate career_id "${c.career_id}"`);
    }
    careerIds.add(c.career_id);
    validateQualityEnvelope("career", c.career_id, c, errors, warnings, seenErrors);
  }

  for (const aid of financialAid) {
    const aidId = aid.aid_id || "<missing>";
    validateQualityEnvelope("financial_aid", aidId, aid, errors, warnings, seenErrors);
    for (const cid of ensureArray(aid.linked_career_ids)) {
      if (!careerIds.has(cid)) {
        warnings.push(`financial_aid "${aidId}" references unknown linked_career_id "${cid}"`);
      }
    }
    for (const exid of ensureArray(aid.linked_exam_ids)) {
      if (!examIds.has(exid)) {
        warnings.push(`financial_aid "${aidId}" references unknown linked_exam_id "${exid}"`);
      }
    }
  }

  for (const m of idMapCareers) {
    if (!m.career_id) continue;
    if (idMapByCareer.has(m.career_id)) {
      pushUniqueError(seenErrors, errors, `duplicate _id_map entry for career_id "${m.career_id}"`);
    }
    idMapByCareer.set(m.career_id, m);
  }

  for (const s of skillMap) {
    if (!s.skill_id) {
      pushUniqueError(seenErrors, errors, "skill_map row missing skill_id");
      continue;
    }
    if (skillIds.has(s.skill_id)) {
      pushUniqueError(seenErrors, errors, `duplicate skill_id "${s.skill_id}"`);
    }
    skillIds.add(s.skill_id);
    validateQualityEnvelope("skill_map", s.skill_id, s, errors, warnings, seenErrors);

    if (!careerIds.has(s.career_id)) {
      pushUniqueError(seenErrors, errors, `skill_map "${s.skill_id}" references unknown career_id "${s.career_id}"`);
    }
    if (skillByCareer.has(s.career_id)) {
      pushUniqueError(seenErrors, errors, `multiple skill_map rows for career_id "${s.career_id}"`);
    }
    skillByCareer.set(s.career_id, s);
  }

  for (const r of resources) {
    if (!r.resource_id) {
      pushUniqueError(seenErrors, errors, "resource missing resource_id");
      continue;
    }
    if (resourceIds.has(r.resource_id)) {
      pushUniqueError(seenErrors, errors, `duplicate resource_id "${r.resource_id}"`);
    }
    resourceIds.add(r.resource_id);
    validateQualityEnvelope("resource", r.resource_id, r, errors, warnings, seenErrors);
    const related = ensureArray(r.related_career_ids);
    if (!related.length) {
      warnings.push(`resource "${r.resource_id}" has empty related_career_ids`);
    }
    for (const cid of related) {
      if (!careerIds.has(cid)) {
        pushUniqueError(seenErrors, errors, `resource "${r.resource_id}" references unknown career_id "${cid}"`);
      }
    }
    if (!Array.isArray(r.language_tags) || r.language_tags.length < 1) {
      pushUniqueError(seenErrors, errors, `resource "${r.resource_id}" has missing/empty language_tags`);
    }
  }

  for (const c of careers) {
    const cid = c.career_id;
    if (!skillByCareer.has(cid)) {
      pushUniqueError(seenErrors, errors, `career "${cid}" is missing skill_map row`);
    }
    if (!idMapByCareer.has(cid)) {
      pushUniqueError(seenErrors, errors, `career "${cid}" is missing _id_map mapping`);
    }

    const examRef = c.legacy_refs && c.legacy_refs.exam_roadmap_career_id;
    if (examRef && !examIds.has(examRef)) {
      pushUniqueError(seenErrors, errors, `career "${cid}" references unknown exam_roadmap_career_id "${examRef}"`);
    }

    const instLinks = c.institution_linkage && ensureArray(c.institution_linkage.institution_ids);
    if (instLinks) {
      for (const iid of instLinks) {
        if (!institutionIds.has(iid)) {
          pushUniqueError(seenErrors, errors, `career "${cid}" institution_linkage references unknown institution_id "${iid}"`);
        }
      }
    }
  }

  for (const s of skillMap) {
    for (const step of ensureArray(s.learning_sequence)) {
      if (!resourceIds.has(step.resource_id)) {
        pushUniqueError(
          seenErrors,
          errors,
          `skill_map "${s.skill_id}" learning_sequence references unknown resource_id "${step.resource_id}"`
        );
      }
      if (!Array.isArray(step.language_tags) || step.language_tags.length < 1) {
        pushUniqueError(
          seenErrors,
          errors,
          `skill_map "${s.skill_id}" step "${step.resource_id}" has missing/empty language_tags`
        );
      }
    }
  }

  for (const ex of exams) {
    const related = ensureArray(ex.related_career_ids);
    for (const cid of related) {
      if (!careerIds.has(cid)) {
        pushUniqueError(seenErrors, errors, `exam "${ex.exam_id}" references unknown related_career_id "${cid}"`);
      }
    }
  }

  const newCareers = careers.filter((c) => (c.legacy_refs && c.legacy_refs.salary_explorer_id > 58));
  for (const c of newCareers) {
    const cid = c.career_id;
    const s = skillByCareer.get(cid);
    if (!s || ensureArray(s.learning_sequence).length < 3) {
      pushUniqueError(seenErrors, errors, `new career "${cid}" must have at least 3 learning_sequence steps`);
    }
    const links = c.institution_linkage && ensureArray(c.institution_linkage.institution_ids);
    if (!links || links.length < 1) {
      pushUniqueError(seenErrors, errors, `new career "${cid}" missing institution_linkage.institution_ids`);
    }
    const exId = c.legacy_refs && c.legacy_refs.exam_roadmap_career_id;
    if (!exId) {
      pushUniqueError(seenErrors, errors, `new career "${cid}" missing legacy_refs.exam_roadmap_career_id`);
    } else {
      const ex = examById.get(exId);
      const related = ex ? ensureArray(ex.related_career_ids) : [];
      if (!related.includes(cid)) {
        warnings.push(`exam "${exId}" does not include new career "${cid}" in related_career_ids`);
      }
    }
  }

  if (errors.length) {
    console.error(`validate-canonical-db: FAILED with ${errors.length} error(s)`);
    for (const e of errors) console.error(`  - ${e}`);
    if (warnings.length) {
      console.error(`\nWarnings (${warnings.length}):`);
      for (const w of warnings) console.error(`  - ${w}`);
    }
    process.exit(1);
  }

  console.log("validate-canonical-db: OK");
  console.log(
    `Checked careers=${careers.length}, skill_map=${skillMap.length}, resources=${resources.length}, exams=${exams.length}, institutions=${institutions.length}, financial_aid=${financialAid.length}`
  );
  console.log(`New-career strict checks passed for ${newCareers.length} careers.`);
  if (warnings.length) {
    console.log(`Warnings (${warnings.length}):`);
    for (const w of warnings) console.log(`  - ${w}`);
  }
}

main();
