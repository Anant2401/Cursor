# Private Sector Module Release Checklist (Go / No-Go)

Use this checklist before shipping the connected private-sector module updates.

Release scope:

- Shared context + recommendation layer
- Salary, Skill Gap, Plan B, Mentor integration
- College Finder integration
- Private-sector role DB + registry mappings + validators

---

## 1) Build Integrity Gate

- [ ] `node scripts/validate-tool-integration.cjs` passes
- [ ] `node scripts/validate-college-registry.cjs` passes
- [ ] `node scripts/validate-local-links.cjs` passes
- [ ] Lint check passes for all changed files
- [ ] No unresolved merge conflicts or partial edits

Owner: ____________________  
Date/Time: ____________________

---

## 2) Data Linkage Gate

- [ ] `DB/pehchaan_career_registry.json` contains valid `private_role_ids[]`
- [ ] `DB/pehchaan_private_sector_roles.json` role references are valid (`career`, `skill_gap_job_id`, `plan_b_exam_links`, `metro_map`)
- [ ] Salary/Skill Gap/Plan B mappings resolve without null-link dead ends
- [ ] College Finder data files are present and parse correctly:
  - `DB/pehchaan_college_registry.json`
  - `DB/pehchaan_college_registry_indexes.json`

Owner: ____________________  
Date/Time: ____________________

---

## 3) Cross-Tool Journey Gate

Run and mark pass/fail:

1. Salary -> Skill Gap -> Plan B -> Mentor  
   Result: PASS / FAIL

2. Plan B -> Skill Gap -> Salary  
   Result: PASS / FAIL

3. Mentor -> Salary -> College Finder  
   Result: PASS / FAIL

4. College Finder prefill via URL/session (`stream`, `state`, `course`)  
   Result: PASS / FAIL

5. Invalid param smoke (`metro`, `private_role_id`, `course`)  
   Result: PASS / FAIL

Notes: ____________________________________________________________

QA Owner: ____________________  
Date/Time: ____________________

---

## 4) UX and Content Gate

- [ ] Recommendation block visible and functional in all in-scope tools
- [ ] No blank-result dead-end states
- [ ] Legal disclaimer and decision clause present in all touched tools
- [ ] Footer/topbar brand compliance preserved
- [ ] Key copy remains user-safe (no deterministic job guarantees)

Owner: ____________________  
Date/Time: ____________________

---

## 5) Performance and Runtime Gate

- [ ] No blocking console errors on tool load
- [ ] Data fetch failures show graceful fallback message
- [ ] Interaction latency acceptable on first render and filter actions
- [ ] No broken external links in top-level journey paths

Owner: ____________________  
Date/Time: ____________________

---

## 6) Deployment Gate

- [ ] Deployment branch/tag identified: ____________________
- [ ] Deployment owner assigned
- [ ] Rollout window approved
- [ ] Rollback owner assigned

Go decision (circle one):  GO  /  NO-GO

Approver: ____________________  
Date/Time: ____________________

---

## 7) Rollback Plan (If Needed)

If P1/P2 issues appear post-release:

1. Disable recommendation rendering first (lowest-risk functional rollback).
2. Revert tool files in this order:
   - `Tools/pehchaan_college_finder.html`
   - `Tools/pehchaan_mentor_connect.html`
   - `Tools/pehchaan_plan_b_strategy_builder.html`
   - `Tools/pehchaan_skill_gap_analyser.html`
   - `Tools/pehchaan_salary_explorer.html`
3. Revert shared assets if still unstable:
   - `assets/pehchaan_tool_recommendations.js`
   - `assets/pehchaan_tool_links.js`
   - `assets/pehchaan_career_registry_prefill.js`
   - `assets/pehchaan_journey.js`
4. Keep validators and docs unless they block runtime.
5. Re-run both validators and basic smoke checks after rollback.

Rollback executed by: ____________________  
Date/Time: ____________________  
Incident link / notes: _____________________________________________

---

## 8) Post-Release Monitoring (First 72 Hours)

- [ ] Check for broken journey links at least twice daily
- [ ] Track obvious drop-off points in connected journey flow
- [ ] Review any user-reported confusion around role/city recommendations
- [ ] Validate at least one successful end-to-end path per day

Monitoring owner: ____________________  
Start: ____________________  
End: ____________________

