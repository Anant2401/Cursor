# Private Sector Connected Tools — Implementation Tracker

Use this document as the single execution board for planning and delivery.

Status legend:

- `[ ]` Not started
- `[-]` In progress
- `[x]` Done
- `[!]` Blocked

---

## 1) Program Goal

Deliver a connected user journey across Salary Explorer, Skill Gap, Plan B, and Mentor Connect, with deep private-sector role details for:

- Delhi NCR
- Chennai
- Bengaluru
- Hyderabad
- Pune
- Mumbai

Reference specs:

- `docs/private-sector-connected-tools-spec.md`
- `docs/tool-integration.md`

---

## 2) Phase Plan (Execution Checklist)

## Phase 0 — Contract Freeze and Setup

### Objectives

- Freeze keys, mappings, scope, and fallback rules before implementation.

### Tasks

- [x] Confirm final context keys:
  - `private_role_id`
  - `metro`
  - `role_family`
  - `readiness_band`
- [x] Freeze MVP role list (12 roles)
- [x] Freeze metro id list (6 metros)
- [x] Approve exception handling policy for unresolved ids and invalid params
- [ ] Confirm file ownership and QA ownership

### Exit Gate

- [x] A signed-off key contract exists and no key names are changing.

---

## Phase 1 — Data Foundation

### Objectives

- Create private-sector source of truth and map it to current tool ecosystem.

### Tasks

- [x] Create `DB/pehchaan_private_sector_roles.json` with schema root
- [x] Add metro definitions (`delhi_ncr`, `chennai`, `bengaluru`, `hyderabad`, `pune`, `mumbai`)
- [x] Add 12 MVP role objects with complete fields:
  - summary
  - eligibility
  - skills
  - selection process
  - metro salary map
  - 30/60/90 plan
  - growth path
  - data freshness note
- [x] Add mapping fields in `DB/pehchaan_career_registry.json` where applicable
- [ ] Validate format consistency (salary style, demand enums, required arrays)

### Exit Gate

- [ ] 12 roles fully populated and structurally valid.

---

## Phase 2 — Shared Logic and Recommendation Layer

### Objectives

- Standardize context handling and next-best-tool recommendation logic.

### Tasks

- [x] Add `assets/pehchaan_tool_recommendations.js`
- [x] Extend `assets/pehchaan_journey.js` to safely persist new keys
- [x] Extend `assets/pehchaan_tool_links.js` to include new context params
- [x] Extend `assets/pehchaan_career_registry_prefill.js` with private role resolution
- [x] Implement deterministic recommendation rules with safe fallback
- [x] Add sanitization for unknown query parameters

### Exit Gate

- [ ] Recommendation output is deterministic for all required user states.

---

## Phase 3 — Tool Integrations

### Objectives

- Make each tool consume and emit shared context, and guide users onward.

### Salary Explorer

- [x] Add metro prefill/filter behavior
- [x] Display expanded role detail block
- [x] Add "What to do next" recommendation strip
- [x] Emit context on role expansion/selection

### Skill Gap Analyser

- [x] Prefill from `private_role_id` and `metro`
- [x] Compute and emit `readiness_band`
- [x] Add recommendation strip

### Plan B Strategy Builder

- [x] Consume shared role/metro mapping
- [x] Expand metro private role cards with richer detail
- [x] Add recommendation strip and context emits

### Mentor Connect

- [x] Prefill role + metro + role family context
- [x] Add role-aware outreach prompt variants
- [x] Add return recommendations to Salary/Skill Gap

### Exit Gate

- [ ] User can navigate cross-tool without re-entering role/metro context.

---

## Phase 4 — Validation and QA Hardening

### Objectives

- Ensure integrity, resilience, and non-regression.

### Tasks

- [x] Update `docs/tool-integration.md` with new keys and emitter-target flow
- [x] Extend `scripts/validate-tool-integration.cjs` with:
  - unresolved id checks
  - invalid metro checks
  - broken handoff link checks
- [x] Execute scenario matrix:
  - fresh user
  - deep-link start
  - invalid params
  - metro switch mid-journey
  - session clear + URL re-entry
- [x] Fix regressions and empty states

### Exit Gate

- [ ] Validator clean pass + manual matrix pass (no P1/P2 issues).

---

## Phase 5 — Launch and Stabilization

### Objectives

- Release safely and monitor early behavior.

### Tasks

- [ ] Roll out in safe order:
  1. shared assets,
  2. tool integrations,
  3. data updates
- [ ] Execute production smoke tests on key journeys
- [ ] Monitor early drop-off and broken-link events
- [ ] Patch urgent issues within stabilization window
- [ ] Set weekly content refresh cadence

### Exit Gate

- [ ] Stable first-week run with no critical navigation/data issues.

---

## 3) Dependencies Map

- Phase 0 -> Phase 1, 2, 3
- Phase 1 -> Phase 3 (tool detail rendering depends on role DB)
- Phase 2 -> Phase 3 (recommendation and link builders required)
- Phase 3 -> Phase 4
- Phase 4 -> Phase 5

Critical path:

1. Key freeze
2. Shared DB
3. Shared link/recommendation layer
4. Tool integrations
5. Validation

---

## 4) Exception and Fallback Tracker

- [ ] Missing `private_role_id` fallback to `career`
- [ ] Invalid `metro` fallback to user prompt
- [ ] Contradictory `exam` vs role family handling
- [ ] Unknown/deprecated role id behavior
- [ ] Empty recommendations fallback path
- [ ] JSON load failure fallback UI
- [ ] Broken external links gracefully hidden

---

## 5) QA Pass Checklist (Per Build)

- [ ] Context prefill verified
- [ ] Recommendation strip renders with valid links
- [ ] Journey state survives back/forward navigation
- [ ] Existing old journeys still work (backward compatibility)
- [ ] Disclaimer and footer compliance retained
- [ ] Mobile layout sanity pass completed

---

## 6) Ownership and Cadence

Owners:

- Data owner: role content + salary refresh
- Frontend owner: handoff and recommendation behavior
- QA owner: matrix execution + release gate

Cadence:

- Weekly: broken links and journey drop-off review
- Biweekly: role data updates
- Monthly: add/retire role set by demand signal

---

## 7) Current Sprint Start

Immediate start sequence:

1. Freeze keys and fallback behavior (Phase 0)
2. Scaffold private-sector DB (Phase 1)
3. Implement shared recommendation module (Phase 2)

Current status:

- `[-]` Planning started
- `[-]` Implementation started

