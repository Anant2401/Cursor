# Private Sector Connected Tools Spec (Metro Jobs)

This document defines how Pehchaan Careers tools should work together to guide users toward private-sector jobs in major metros, with practical role details, skill plans, and next-step navigation.

Scope metros:

- Delhi NCR
- Chennai
- Bengaluru
- Hyderabad
- Pune
- Mumbai

Primary tools in scope:

- `Tools/pehchaan_salary_explorer.html`
- `Tools/pehchaan_skill_gap_analyser.html`
- `Tools/pehchaan_plan_b_strategy_builder.html`
- `Tools/pehchaan_mentor_connect.html` (handoff target)

---

## 1) Product Goal

Build a connected journey where tools "talk to each other" and users always know:

1. which role to target,
2. what that role pays in their target metro,
3. what skills they are missing,
4. how to act in the next 30/60/90 days,
5. which tool to open next and why.

The experience should reduce random clicking and replace it with guided progression.

---

## 2) User Experience Contract

Each tool must do the following:

1. Read incoming context from URL + `pehchaan_journey`.
2. Prefill controls (role, metro, stream, etc.) where possible.
3. Show a "What to do next" block with:
   - one primary recommended tool,
   - one secondary optional tool,
   - one-line reason for each recommendation.
4. Persist updated context when user performs a meaningful action.

Meaningful action examples:

- Salary card opened / role selected
- Skill gap calculated
- Plan B role card expanded / action copied
- Mentor outreach template generated

---

## 3) Shared Context (Tool-to-Tool Handoff)

Use existing `pehchaan_journey` + query parameter model from `docs/tool-integration.md`, with the following standardized keys:

- `from`: source tool id (`salary`, `skill_gap`, `plan_b`, `mentor`, etc.)
- `career`: canonical career id (existing)
- `private_role_id`: new shared private-sector role id
- `job`: skill gap job id (existing)
- `exam`: plan B exam id (existing)
- `stream`: stream id (existing)
- `class`: class id (existing)
- `roiBand`: ROI bucket (existing)
- `metro`: target metro id
- `role_family`: role family id
- `readiness_band`: `low` | `mid` | `high`

Precedence rule:

1. URL params override,
2. session journey fallback,
3. tool default.

### 3.1 Contract freeze (v1 locked on 2026-05-05)

Locked keys for this initiative:

- `private_role_id`
- `metro`
- `role_family`
- `readiness_band`

Locked metro ids:

- `delhi_ncr`
- `chennai`
- `bengaluru`
- `hyderabad`
- `pune`
- `mumbai`

Locked MVP private-role list:

1. `sales_executive_b2b`
2. `customer_support_associate`
3. `operations_associate`
4. `mis_executive`
5. `junior_data_analyst`
6. `digital_marketing_executive`
7. `content_associate`
8. `hr_recruiter_entry`
9. `finance_operations_associate`
10. `logistics_coordinator`
11. `qa_test_associate`
12. `business_development_associate`

v1 fallback rules (frozen):

- Missing `private_role_id`: resolve through `career` mapping, else show role picker.
- Invalid `metro`: drop invalid value and ask user to pick a metro.
- Empty recommendation output: fallback to `Salary Explorer` primary and `Skill Gap` secondary.

---

## 4) Recommendation Engine (Next Best Tool)

Implement deterministic rules (no ML dependency required) in shared JS.

Suggested shared file:

- `assets/pehchaan_tool_recommendations.js`

Input:

- current tool
- merged context
- local tool state (e.g. skill gap calculated true/false)

Output:

- `primary` recommendation
- `secondary` recommendation
- explanation copy

Rule set (minimum):

1. If role selected, no skill result yet:
   - Primary: Skill Gap
   - Secondary: Salary Explorer
2. If skill gap done, no action plan started:
   - Primary: Plan B Jobs & Income
   - Secondary: Mentor Connect
3. If metro not selected:
   - Primary: Salary Explorer (metro-first)
   - Secondary: Plan B
4. If exam-driven user + low/mid ROI:
   - Primary: Plan B
   - Secondary: Skill Gap
5. If user has plan but no outreach:
   - Primary: Mentor Connect
   - Secondary: Salary Explorer

UI block title:

- `What to do next`

---

## 5) Job Detail Expansion Requirements

Every private-sector role card should contain:

1. Role summary (day-to-day work)
2. Eligibility (minimum and preferred)
3. Metro salary bands:
   - fresher
   - ~3 year
4. Salary variance drivers
5. Hiring channels (job portals, direct careers pages, walk-ins, referrals)
6. Typical selection stages
7. Must-have skills
8. Good-to-have skills
9. Proof required (portfolio/cert/project/internship)
10. 30/60/90-day execution plan
11. Growth pathways (2-3 likely next roles)
12. City reality note (cost/commute/shift/language)
13. Data freshness note + disclaimer

This applies across Salary, Skill Gap, and Plan B views (depth can vary by tool).

---

## 6) Shared Data Model (New DB)

Add:

- `DB/pehchaan_private_sector_roles.json`

### 6.1 Proposed schema (v1)

```json
{
  "schema_version": "1.0.0",
  "updated_at": "YYYY-MM-DD",
  "metros": [
    {
      "metro_id": "bengaluru",
      "label": "Bengaluru",
      "cost_band": "high",
      "dominant_sectors": ["IT Services", "SaaS", "GCC", "Startups"]
    }
  ],
  "roles": [
    {
      "private_role_id": "data_analyst_junior",
      "career_canonical_id": "data_scientist",
      "skill_gap_job_id": "data_analytics",
      "plan_b_exam_links": ["jee_engineering", "cat_mba", "cuet_ug"],
      "role_family": "analytics",
      "title": "Junior Data Analyst",
      "summary": "Entry analytics role focused on reporting and business insights.",
      "eligibility_min": "Any graduate with Excel and SQL basics",
      "eligibility_preferred": "BTech/BSc/BCom + portfolio projects",
      "must_have_skills": ["Excel", "SQL", "Basic statistics", "Power BI/Tableau"],
      "good_to_have_skills": ["Python", "Dashboard storytelling", "Business communication"],
      "proof_required": ["2 dashboard projects", "1 SQL case study", "resume with quantified impact"],
      "selection_process": ["Aptitude/SQL test", "Dashboard/case round", "HR round"],
      "application_channels": ["Company careers page", "LinkedIn jobs", "Internshala", "Referral"],
      "growth_paths": ["Business Analyst", "Analytics Engineer", "Product Analyst"],
      "metro_map": [
        {
          "metro_id": "bengaluru",
          "demand_level": "high",
          "salary_fresher": "₹4.5-7.5 LPA",
          "salary_3yr": "₹8-15 LPA",
          "city_reality_note": "High competition; portfolio quality and SQL depth are key."
        }
      ],
      "plan_30_60_90": {
        "day_0_30": ["Excel + SQL foundation", "Build one dashboard project"],
        "day_31_60": ["Second project with business case", "Mock SQL interviews"],
        "day_61_90": ["Apply to 40 targeted roles", "Referrals + interview tracking"]
      },
      "data_freshness_note": "Salary and demand are indicative; verify current openings and compensation ranges."
    }
  ]
}
```

### 6.2 ID and mapping constraints

- `private_role_id` must be unique.
- If `career_canonical_id` is set, it must exist in `DB/pehchaan_career_registry.json`.
- If `skill_gap_job_id` is set, it must exist in `DB/pehchaan_skill_gap_analyser_data.json`.
- `metro_id` must be one of the six target metros for this module.

---

## 7) Tool-Level Implementation Plan

### 7.1 Salary Explorer

Add:

- Metro selector (if absent)
- Role cards with metro salary deltas
- "Readiness next step" CTA to Skill Gap with `private_role_id` + `metro`

Emit on role open:

- `setJourney({ from: 'salary', career, private_role_id, metro, role_family })`

### 7.2 Skill Gap Analyser

Add:

- Resolve role from `private_role_id` and/or `career`
- Show metro context in summary copy
- Compute `readiness_band`
- CTA to Plan B with role + metro continuity

Emit on gap result:

- `setJourney({ from: 'skill_gap', private_role_id, job, metro, readiness_band })`

### 7.3 Plan B Strategy Builder (Jobs & Income)

Add/expand:

- Metro private roles section for each mapped exam + role family
- Deeper role details per Section 5
- Action plan copy remains one-click

Emit on role action:

- `setJourney({ from: 'plan_b', private_role_id, metro, role_family, exam })`

### 7.4 Mentor Connect

Add:

- Prefill by role + metro + role family
- Suggested first-message prompts based on selected role

Emit:

- `setJourney({ from: 'mentor', private_role_id, metro })`

---

## 8) Suggested MVP Role List (Initial 12)

1. Sales Executive (B2B / Inside Sales)
2. Customer Support Associate
3. Operations Associate
4. MIS Executive
5. Junior Data Analyst
6. Digital Marketing Executive
7. Content Associate
8. HR Recruiter (entry)
9. Finance Operations Associate
10. Logistics Coordinator
11. QA/Test Associate
12. Business Development Associate

Rationale: high hiring frequency, broad eligibility, realistic entry from tier-2/3 backgrounds with focused preparation.

---

## 9) Metro Content Requirements

For each of six metros, provide:

- top hiring families,
- fresher salary positioning,
- growth potential at ~3 years,
- common hiring models (MNC/GCC/startup/contract),
- realistic caution note (commute, shift, language, cost pressure).

Metro ids:

- `delhi_ncr`
- `chennai`
- `bengaluru`
- `hyderabad`
- `pune`
- `mumbai`

---

## 10) Validation and QA

Extend validation script (`scripts/validate-tool-integration.cjs`) or add a sibling validator to check:

1. Every `private_role_id` used in tool payloads exists in shared private-sector DB.
2. Career and skill-gap mappings resolve correctly.
3. Every recommendation target URL is valid.
4. Handoff params survive round-trip navigation.
5. All updated tools include required disclaimer and standard footer.

Manual QA journey set (minimum):

1. Salary -> Skill Gap -> Plan B -> Mentor
2. Plan B direct entry -> Salary -> Skill Gap
3. Skill Gap direct entry with only `career` param
4. Metro not selected edge case (recommendation fallback)

---

## 11) Rollout Plan

### Phase A (1-2 weeks): Connected navigation

- Add standardized keys and merged context handling in in-scope tools.
- Add recommendation block + rule engine.
- Ensure no dead-end states.

### Phase B (2-3 weeks): Data and role depth

- Add shared private-sector DB.
- Populate 12 MVP roles across 6 metros.
- Upgrade card depth in Salary/Plan B and output depth in Skill Gap.

### Phase C (1-2 weeks): Hardening

- Validator coverage for new mappings.
- Journey analytics events.
- Content tuning from user behavior.

---

## 12) Acceptance Criteria

This module is complete when:

1. Users can move across tools without re-entering role/metro context.
2. Every in-scope tool presents a clear "What to do next" recommendation.
3. Role cards include practical details from Section 5.
4. All six metros are represented in shared private-sector data.
5. Mapping validation passes with zero unresolved ids.
6. Brand, disclaimer, and footer compliance are preserved.

---

## 13) Non-Goals (for this module)

- No recruiter marketplace or placement guarantee workflow.
- No automated job application submission.
- No user login requirement in initial phase.
- No probabilistic ranking model; rule-based guidance is sufficient for MVP.

---

## 14) Notes for Future Enhancements

- Add city migration readiness check (budget, language, housing risk).
- Add "same role in hometown vs metro" comparison mode.
- Add role-based interview question bank linked from Skill Gap.
- Add family-facing explanation cards for private-sector pathways.

---

## 15) Detailed Delivery Plan (Execution Blueprint)

This section provides a build sequence detailed enough for implementation, QA, and release without ambiguity.

### 15.1 Workstreams

Run six parallel workstreams with one integration owner:

1. Data Modeling and Content Expansion
2. Shared Context and Navigation Logic
3. Tool-Level UI + Handoff Integration
4. Validation, QA, and Regression
5. Analytics and Observability
6. Release, Rollback, and Maintenance

Integration owner responsibilities:

- freeze field names,
- approve handoff contract changes,
- run final integration QA before merge.

---

### 15.2 Phase-by-Phase Build Plan

#### Phase 0: Prep and Contract Freeze (2-3 days)

Deliverables:

- Confirm final key names (`private_role_id`, `metro`, `role_family`, `readiness_band`).
- Publish JSON schema for `DB/pehchaan_private_sector_roles.json`.
- Freeze metro id list and MVP role list.
- Define fallback behavior for missing mappings (see Exceptions).

Exit criteria:

- One approved schema document.
- One approved linking matrix across tools.

#### Phase 1: Data Foundation (4-6 days)

Deliverables:

- Create `DB/pehchaan_private_sector_roles.json` (v1 scaffold).
- Populate 12 MVP roles for 6 metros.
- Add mapping references in `DB/pehchaan_career_registry.json` where applicable.
- Add data freshness fields and source note fields.

Exit criteria:

- JSON passes schema checks.
- Every role has at least one metro map and a 30/60/90 plan.

#### Phase 2: Shared Logic and Link Builder (3-5 days)

Deliverables:

- Add `assets/pehchaan_tool_recommendations.js`.
- Add helper functions:
  - `mergeContextWithDefaults()`
  - `buildNextToolRecommendations()`
  - `buildToolUrlWithPrivateContext()`
  - `sanitizeContextParams()`
- Add context whitelist to prevent unknown query pollution.

Exit criteria:

- Recommendation engine returns deterministic outputs for all required states.
- URL generation works for all target tools.

#### Phase 3: Tool Integration (6-10 days)

Deliverables by tool:

- Salary Explorer:
  - metro selector,
  - expanded role depth,
  - recommendation strip with links.
- Skill Gap:
  - role + metro prefill,
  - readiness band output,
  - recommendation strip.
- Plan B:
  - metro role expansion from shared DB,
  - richer role card details,
  - recommendation strip.
- Mentor Connect:
  - prefill role + metro,
  - role-aware outreach prompts.

Exit criteria:

- Round-trip context persistence works in all four tools.
- No user-facing dead-end states.

#### Phase 4: Validation and Hardening (4-6 days)

Deliverables:

- Extend/add validator scripts for:
  - id integrity,
  - broken URLs,
  - unresolved cross-tool pointers.
- Run manual regression matrix (existing features + new flow).
- Add fallback copy for unresolved mappings.

Exit criteria:

- Validator passes with 0 hard errors.
- Full manual journey pass on desktop + mobile viewport sanity.

#### Phase 5: Launch and Post-Launch (2-3 days + ongoing)

Deliverables:

- Launch with feature flag strategy (if available) or staggered file rollout.
- Add monitoring counters (journey completion events).
- Define weekly content refresh cadence for salary and demand notes.

Exit criteria:

- Production smoke pass complete.
- No P1 navigation or data integrity issues after release window.

---

### 15.3 Tool-to-Tool Linking Matrix (Detailed)

Use this as the canonical linking map for implementation.

1. Salary -> Skill Gap
   - Pass: `from=salary`, `career`, `private_role_id`, `metro`, `role_family`
   - Trigger: user opens role and clicks readiness CTA

2. Salary -> Plan B
   - Pass: `from=salary`, `career`, `private_role_id`, `metro`, `role_family`, optional `exam`
   - Trigger: user needs parallel earning path

3. Skill Gap -> Plan B
   - Pass: `from=skill_gap`, `private_role_id`, `job`, `metro`, `readiness_band`
   - Trigger: skill roadmap generated

4. Skill Gap -> Salary
   - Pass: `from=skill_gap`, `private_role_id`, `metro`, `readiness_band`
   - Trigger: user wants compensation comparison

5. Plan B -> Skill Gap
   - Pass: `from=plan_b`, `private_role_id`, `metro`, `role_family`, optional `exam`
   - Trigger: user chooses deeper upskilling

6. Plan B -> Mentor
   - Pass: `from=plan_b`, `private_role_id`, `metro`, `role_family`
   - Trigger: user wants professional proof path

7. Mentor -> Salary / Skill Gap
   - Pass-through last known context from journey
   - Trigger: outreach complete / user returns to planning

---

### 15.4 Exception Handling and Edge Cases

Implement all of the following; these are required for robust behavior.

1. Missing `private_role_id`
   - Fallback to `career` mapping via registry.
   - If still unresolved, show generic recommendation and role picker.

2. Invalid `metro` value
   - Replace with null and prompt user to select metro.
   - Do not block tool usage.

3. Partial context (only `career`, no `job`)
   - Preselect highest-confidence mapped `job`.
   - Mark as inferred in internal state (not necessarily UI).

4. Unknown role id after data update
   - Render non-blocking warning note in console.
   - Show fallback content block: "Role mapping being updated."

5. Stale session context
   - On tool load, validate keys; drop invalid entries.
   - URL values still override if valid.

6. Contradictory context (`exam` maps to unrelated role family)
   - Prioritize explicit role selection in current tool.
   - Keep exam for Plan B context only.

7. Empty recommendations output
   - Always return at least one safe fallback:
     - Primary: Salary Explorer
     - Secondary: Skill Gap

8. Resource/link failures in role cards
   - Hide invalid links.
   - Keep remaining card details visible.

9. JSON fetch failure
   - Show in-page recoverable error with retry + minimal fallback messaging.

10. Translation / localized rendering impact
   - Ensure recommendation copy remains readable if translation widget alters text.

11. Mobile narrow viewport
   - Recommendation block should stack vertically and remain tappable.

12. Future role deprecation
   - Add optional `status: active|deprecated` in role data.
   - Deprecated roles do not appear in default listings.

---

### 15.5 Data Expansion Plan (Detailed)

#### 15.5.1 Content authoring template per role

Every role should be authored with:

- role summary in plain language,
- realistic entry eligibility,
- metro-wise salary bands,
- must-have and nice-to-have skills,
- practical proof requirements,
- hiring channels,
- selection funnel,
- growth pathways,
- day-30/day-60/day-90 actions,
- caution/reality note.

#### 15.5.2 Data quality rules

- Salary strings should use a consistent format (`₹X-Y LPA`).
- No hard promises ("guaranteed job", "fixed salary").
- Every metro entry must include demand level.
- Every role must include at least 2 hiring channels.
- Every role must include at least 2 items in each 30/60/90 stage.

#### 15.5.3 Expansion order after MVP

Wave 1 (MVP): 12 roles  
Wave 2: +12 roles in BFSI, support, growth, and operations  
Wave 3: +15 roles in tech-adjacent and domain-specialized tracks

---

### 15.6 Implementation Tasks by File (Starter Checklist)

1. `DB/pehchaan_private_sector_roles.json`
   - Create schema root, metros, roles, mappings.

2. `DB/pehchaan_career_registry.json`
   - Add role mapping pointers where applicable.

3. `assets/pehchaan_tool_links.js`
   - Extend URL builders for new keys.

4. `assets/pehchaan_journey.js`
   - Ensure merge and set functions preserve new keys safely.

5. `assets/pehchaan_career_registry_prefill.js`
   - Add private role resolution helper.

6. `assets/pehchaan_tool_recommendations.js` (new)
   - Add rule engine and recommendation payload formatter.

7. `Tools/pehchaan_salary_explorer.html`
   - Add metro filters, recommendation UI, outbound context writes.

8. `Tools/pehchaan_skill_gap_analyser.html`
   - Add prefill logic for `private_role_id` + metro, readiness-band emit.

9. `Tools/pehchaan_plan_b_strategy_builder.html`
   - Read shared role DB/mappings and enrich metro cards consistently.

10. `Tools/pehchaan_mentor_connect.html`
    - Add prefill usage and recommendation back-links.

11. `docs/tool-integration.md`
    - Update key table and emitter-target matrix with new keys and flows.

12. `scripts/validate-tool-integration.cjs`
    - Extend to validate new role links and metro mappings.

---

### 15.7 QA Matrix (Functional + Regression)

Run test matrix across these scenarios:

1. Fresh user, no query params, no session
2. User starts from Salary with metro selected
3. User enters Skill Gap by deep link (`private_role_id` + `metro`)
4. User enters Plan B by `exam` only
5. User enters with invalid query values
6. User switches metro mid-journey
7. User clears browser storage and re-enters via URL
8. User follows complete 4-tool path and returns to Salary

For each scenario verify:

- prefill behavior,
- recommendation correctness,
- no crash/no blank state,
- context continuity.

---

### 15.8 Rollback and Recovery Plan

If post-release issues occur:

1. Disable recommendation block rendering first (non-critical path).
2. Fallback to existing tool-local behavior using old keys.
3. Keep new DB file deployed; stop consuming it in UI if needed.
4. Re-run validator to identify broken mappings.
5. Patch and re-enable incrementally per tool.

Do not remove historical keys from `pehchaan_journey` abruptly; maintain backwards compatibility.

---

### 15.9 Ownership and Operating Cadence

Suggested owners:

- Data owner: role content, salary refresh, metro demand updates.
- Frontend owner: handoff + recommendation behavior.
- QA owner: integration matrix and regression gates.

Cadence:

- Weekly: check broken links + top journey drop-offs.
- Biweekly: salary/demand note refresh for active roles.
- Monthly: add or retire roles based on demand trends.

---

### 15.10 Definition of Done (Detailed)

This initiative is considered complete only when all are true:

1. Shared context keys are supported and sanitized across in-scope tools.
2. Recommendation block exists and works in Salary, Skill Gap, Plan B, Mentor.
3. 12 MVP roles have full detail fields and six-metro coverage.
4. Cross-tool linking passes automated validation.
5. Manual QA matrix passes with no P1/P2 issues.
6. Existing legacy journeys (without new keys) remain functional.
7. Disclaimer and brand shell remain compliant on all touched pages.

