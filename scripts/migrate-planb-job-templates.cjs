/**
 * Migrates root exam_skill_mappings → job_templates + exams (plan_b_job_template_ids).
 * Idempotent: skips if exam_skill_mappings is absent and exams already exist.
 */
const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'DB', 'pehchaan_plan_b_strategy_builder_data.json');
const d = JSON.parse(fs.readFileSync(p, 'utf8'));

if (!d.exam_skill_mappings || !Array.isArray(d.exam_skill_mappings)) {
  if (d.exams && d.job_templates) {
    console.log('Already migrated (no exam_skill_mappings).');
    process.exit(0);
  }
  console.error('No exam_skill_mappings and no exams — abort.');
  process.exit(1);
}

const job_templates = [];
const exams = [];
const used = new Set();

d.exam_skill_mappings.forEach(function (ex) {
  const ids = [];
  (ex.plan_b_jobs || []).forEach(function (job, idx) {
    let jid = ex.id + '_' + idx;
    if (used.has(jid)) jid = ex.id + '_' + idx + '_' + String(job.title || 'job').slice(0, 12).replace(/\W+/g, '_');
    used.add(jid);
    const copy = JSON.parse(JSON.stringify(job));
    copy.id = jid;
    job_templates.push(copy);
    ids.push(jid);
  });
  const exRow = {};
  Object.keys(ex).forEach(function (k) {
    if (k === 'plan_b_jobs') return;
    exRow[k] = ex[k];
  });
  exRow.plan_b_job_template_ids = ids;
  exams.push(exRow);
});

d.job_templates = job_templates;
d.exams = exams;
delete d.exam_skill_mappings;
d.version = '2.1';
d.last_updated = '2026-05-04';
d.data_notes =
  (d.data_notes || '') +
  ' Jobs are stored in job_templates; exams[] lists plan_b_job_template_ids. Runtime resolves to plan_b_jobs.';

fs.writeFileSync(p, JSON.stringify(d, null, 2), 'utf8');
console.log('Migrated:', exams.length, 'exams,', job_templates.length, 'job templates.');
