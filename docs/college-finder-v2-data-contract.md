# College Finder v2 Data Contract (Schema + Display Rules)

This document is the single source of truth for the first College Finder v2 upgrade.
Scope is limited to:

1. Admission route clarity
2. Cost reality band
3. Recognition checks

No exact fees/cutoffs are included in this contract.

---

## 1) Contract Goals

- Keep data trustworthy for Tier 2/3 decision-making.
- Avoid filler fields and empty UI sections.
- Ensure every new field has:
  - explicit type
  - allowed values
  - confidence
  - fallback behavior

---

## 2) Data Model Changes

## 2.1 Program-level additions (`college_programs[]`)

Add an `admission_route` object because route can vary by stream/course.

```json
{
  "admission_route": {
    "primary": "state_counselling | all_india_counselling | institute_level | mixed | verify",
    "exam_ids": ["string"],
    "pathways": ["string"],
    "verification_url": "https://...",
    "confidence": "high | medium | low",
    "last_updated": "YYYY-MM-DD",
    "notes": "string"
  }
}
```

### Field rules

- `primary` (required for v2 display):
  - `state_counselling`
  - `all_india_counselling`
  - `institute_level`
  - `mixed`
  - `verify`
- `exam_ids`:
  - map to IDs in `DB/pehchaan_exam_data.json`
  - may be empty for early backfill
- `pathways` examples:
  - `jossa`
  - `csab`
  - `mcc`
  - `state_cet`
  - `institute_portal`
- `verification_url`:
  - official counselling or institute admission page preferred
- `confidence` required for all non-empty route rows

---

## 2.2 College-level additions (`colleges[]`)

### A) Cost band

```json
{
  "cost_band": {
    "living_city_band": "low | medium | high | unknown",
    "hostel_context": "likely | mixed | limited | unknown",
    "monthly_budget_min": 0,
    "monthly_budget_max": 0,
    "method": "heuristic | manual",
    "confidence": "high | medium | low",
    "last_updated": "YYYY-MM-DD",
    "notes": "string"
  }
}
```

### B) Recognition

```json
{
  "recognition": {
    "university_status": "ugc | state_act | deemed | autonomous | private_university | unknown",
    "regulators_required": ["string"],
    "regulators_verified": ["string"],
    "verification_urls": ["https://..."],
    "confidence": "high | medium | low",
    "last_updated": "YYYY-MM-DD",
    "notes": "string"
  }
}
```

### Field rules

- `cost_band.monthly_budget_min/max`:
  - integer INR monthly living estimate (not tuition)
  - if unavailable, keep null and show band only
- `recognition.regulators_required` examples:
  - `NMC`, `BCI`, `PCI`, `NCTE`, `COA`, `NCISM`, `NCH`
- `recognition.regulators_verified`:
  - subset of required, only when verified via source

---

## 3) Required vs Optional for v2 Rollout

## 3.1 Minimum required for card rendering

Already required today:
- `name`, `state_id`, `city`, `type`, `contacts.website`
- `verification.last_verified_on`, `verification.source_urls`

New minimum for v2:
- `admission_route.primary` (program-level)
- `admission_route.confidence`
- `cost_band.living_city_band` (college-level)
- `cost_band.confidence`
- `recognition.university_status` (college-level)
- `recognition.regulators_required` (stream-mapped; can be rule-derived)

## 3.2 Optional but preferred

- `admission_route.exam_ids`
- `admission_route.verification_url`
- `cost_band.hostel_context`
- `cost_band.monthly_budget_min/max`
- `recognition.regulators_verified`
- `recognition.verification_urls`

---

## 4) UI Display Contract (College Finder)

## 4.1 Admission route card

Show when `admission_route.primary` exists:

- `Primary route`: mapped human label
- `Likely exam`: from `exam_ids` (resolved to labels)
- `Verify now`: `verification_url` if present
- confidence badge: `High/Medium/Low confidence`

Fallback:
- if route missing: show `Route: Verify on official website`
- do not show empty exam chips

## 4.2 Cost reality band card

Show when `cost_band.living_city_band` exists:

- city band label (`Low/Medium/High/Unknown`)
- hostel context if present
- monthly budget range if min/max present
- confidence badge

Fallback:
- if no budget numbers, show only band + context
- if all missing, hide section

## 4.3 Recognition card

Show when `recognition.university_status` or `regulators_required` exists:

- university status label
- required regulator chips
- verified regulator chips (if any)
- verification links (if any)
- confidence badge

Fallback:
- if no verified regulators, keep text: `Verification required on official regulator/institute pages.`

---

## 5) Confidence and Fallback Policy

- Never present heuristic data as confirmed fact.
- Any heuristic-only field must show:
  - `method = heuristic`
  - confidence badge
- If confidence is `low`, include an in-card verify cue.
- If field value is empty, hide section instead of placeholder blocks.

---

## 6) Backfill Order (Existing Colleges First)

1. Program-level `admission_route.primary` and `confidence`
2. College-level `cost_band.living_city_band` and `confidence`
3. College-level `recognition.university_status` and required regulators
4. Optional enrichments (`exam_ids`, URLs, hostel context, budget min/max)

---

## 7) Data Quality Gates for Release

Release only when:

- `admission_route.primary` populated for >= 90% of active program rows
- `cost_band.living_city_band` populated for >= 85% of colleges
- `recognition.university_status` populated for >= 85% of colleges
- `regulators_required` available for >= 90% relevant stream/course rows
- No invalid URLs in new verification link fields

---

## 8) Cross-tool Context Keys (for later use)

When College Finder writes journey context, reserve keys:

- `admission_route_primary`
- `admission_exam_ids`
- `cost_living_band`
- `recognition_status`

These are optional for v2, but naming is frozen here to avoid future key drift.

---

## 9) Non-goals in this contract

- No tuition fee/cutoff claims
- No branch-level strength scoring
- No parent summary PDF

Those can be added in v3 with a separate contract.

