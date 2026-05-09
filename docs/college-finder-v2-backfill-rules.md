# College Finder v2 Backfill Rules (Existing Registry First)

This document converts the v2 data contract into deterministic backfill logic for:

- `admission_route` (program-level)
- `cost_band` (college-level)
- `recognition` (college-level + stream/course-driven requirements)

Reference contract: `docs/college-finder-v2-data-contract.md`.

---

## 1) Rule System Principles

- Use deterministic rules first (fast coverage).
- Mark inferred values as `method: heuristic` and `confidence: medium/low`.
- Never infer regulator verification without source evidence.
- Unknown cases must safely fall back to `verify`.

---

## 2) Admission Route Backfill Rules (`college_programs[].admission_route`)

## 2.1 Primary route inference order

Apply rules in this priority order:

1. Explicit institution `type` patterns (IIT/NIT/NLU/etc.)
2. Stream/course family rules (MBBS, Law, etc.)
3. Geography lens hint (`national_level` vs `state_comfort`)
4. Fallback = `verify`

## 2.2 Rule table

| Condition | `primary` | `pathways` | `exam_ids` seed | Confidence |
|---|---|---|---|---|
| `type` contains `IIT` / `NIT` / `IIIT` | `all_india_counselling` | `["jossa","csab"]` | engineering exam family | medium |
| `stream_id=medicine` and `course_id=medicine_mbbs` | `mixed` | `["mcc","state_counselling"]` | NEET family | medium |
| `stream_id=law` and `type` contains `NLU` | `all_india_counselling` | `["consortium_law"]` | CLAT family | medium |
| `stream_id=architecture` | `mixed` | `["state_cet","institute_portal"]` | architecture entrance family | low |
| `stream_id` in `management, commerce, humanities, science_stats, education` and `type` contains `university` | `institute_level` | `["institute_portal"]` | optional / none | low |
| `geography_lens_ids` only has `national_level` | `all_india_counselling` | `["all_india_portal"]` | optional | low |
| `geography_lens_ids` only has `state_comfort` | `state_counselling` | `["state_cet"]` | optional | low |
| none match | `verify` | `[]` | `[]` | low |

## 2.3 `verification_url` backfill

Use first available source in this order:

1. counselling authority URL in rule map
2. `colleges[].verification.source_urls[0]`
3. `colleges[].contacts.website`

## 2.4 `last_updated`

Set to backfill run date (`YYYY-MM-DD`).

---

## 3) Cost Band Backfill Rules (`colleges[].cost_band`)

## 3.1 Inputs used

- `city`
- `state_id`
- `type`

## 3.2 City band mapping (starter heuristic)

### High
- Mumbai
- Delhi / New Delhi
- Bengaluru / Bangalore
- Hyderabad
- Chennai
- Pune

### Medium
- State capitals and large Tier 2 cities (maintain list in rule file)

### Low
- Remaining cities/towns unless manually overridden

## 3.3 Hostel context inference

| Condition | `hostel_context` | Confidence |
|---|---|---|
| `type` contains `IIT/NIT/IIIT/IISER/NLU` | `likely` | medium |
| `type` contains `state university` / `university` | `mixed` | low |
| `type` contains `affiliated college` / `autonomous` / `private` | `limited` | low |
| unknown | `unknown` | low |

## 3.4 Monthly budget seed ranges (living only)

| Band | `monthly_budget_min` | `monthly_budget_max` |
|---|---:|---:|
| low | 8000 | 15000 |
| medium | 15000 | 25000 |
| high | 25000 | 45000 |
| unknown | null | null |

These are orientation ranges, not promises.

## 3.5 Output defaults

```json
{
  "method": "heuristic",
  "confidence": "low or medium",
  "last_updated": "YYYY-MM-DD",
  "notes": "Estimated from city band and institution type; verify on official hostel/fee pages."
}
```

---

## 4) Recognition Backfill Rules (`colleges[].recognition`)

## 4.1 University status inference

| Condition (`type` text) | `university_status` | Confidence |
|---|---|---|
| contains `deemed` | `deemed` | medium |
| contains `state university` | `state_act` | medium |
| contains `autonomous` | `autonomous` | low |
| contains `private` | `private_university` | low |
| contains `IIT/NIT/IIIT/IISER/NLU` | `ugc` | medium |
| none | `unknown` | low |

## 4.2 Regulators required by stream/course

| Stream/course family | `regulators_required` |
|---|---|
| `medicine_mbbs` | `["NMC"]` |
| `dentistry_generic` | `["DCI_or_equivalent"]` |
| `ayush_generic` | `["NCISM_or_NCH"]` |
| `pharmacy_generic` | `["PCI"]` |
| `law_generic` | `["BCI"]` |
| `education_generic` | `["NCTE"]` |
| `architecture_generic` | `["COA"]` |
| `engineering_generic` | `["UGC_or_AICTE_context"]` |
| other streams | `["UGC_or_state_university_context"]` |

## 4.3 Regulators verified backfill

Initial rule:
- keep `regulators_verified=[]` unless source URL clearly points to regulator or explicit institute recognition page.

This avoids false verification.

## 4.4 Verification URLs

Populate with:
1. relevant `verification.source_urls`
2. `contacts.website`

Set confidence:
- `medium` if at least one quality source URL exists
- else `low`

---

## 5) Exam ID Mapping Seed (for `admission_route.exam_ids`)

Map to IDs from `DB/pehchaan_exam_data.json`.

Starter seed logic:
- `engineering_generic` -> JEE family IDs where available
- `medicine_mbbs` -> NEET family
- `law_generic` -> CLAT family
- `architecture_generic` -> architecture entrance family
- `design_generic` -> design entrance family
- else empty list

If an ID cannot be resolved exactly, leave empty for first pass and keep route text.

---

## 6) Backfill Execution Order

1. Load current registry JSON.
2. Build helper maps:
   - college by `id`
   - stream/course taxonomy labels
3. Backfill program-level `admission_route`.
4. Backfill college-level `cost_band`.
5. Backfill college-level `recognition`.
6. Update `meta.last_updated` and pipeline stats if applicable.
7. Rebuild shard files/indexes.
8. Validate against schema.

---

## 7) Sample Review Protocol (you + me workflow)

Review minimum sample before release:

- 3 states with high counts (e.g., UP, MH, DL)
- 2 medium-count states
- at least 1 low-count/edge state
- all major streams at least once

For each sample card, verify:

- route label is plausible
- exam mapping is not wrong/confusing
- cost band is reasonable for city
- required regulators are correct for stream
- verification links open and are relevant

---

## 8) Fail-safe Rules

- If ambiguous, set `primary=verify`.
- Never mark regulator as verified without evidence.
- Never show budget numbers without a band/method/confidence.
- Do not block result rendering if new fields missing; old card sections must still work.

---

## 9) Next-step Deliverables

After rules are approved:

1. Add these fields to schema (`pehchaan_college_registry.schema.json`).
2. Create/adjust backfill script.
3. Run backfill on existing colleges/programs.
4. Generate coverage report.
5. Start College Finder UI wiring.

