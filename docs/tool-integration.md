# Cross-tool integration (Pehchaan website)

This document is the **single source of truth** for how static tools hand off context via **URL query parameters** and **`sessionStorage`** (`pehchaan_journey`). There is **no shared backend tool graph** in this repo; integration is client-side only unless you add an API later (see Phase 5 / backend).

## Client modules

| File | Role |
|------|------|
| `assets/pehchaan_journey.js` | `mergeJourney()`, `setJourney()`, `buildToolUrl()` — session key `pehchaan_journey`; URL query overrides session on same keys. |
| `assets/pehchaan_career_registry_prefill.js` | `mergeParams()` = URL ∪ session; `resolveRow()`, `resolveCareerTokenRow()`, helpers to map tokens → registry rows. |
| `assets/pehchaan_tool_links.js` | Central link builders — load only on pages that call `PehchaanToolLinks.*`. |

### Pages that load `pehchaan_tool_links.js`

`index.html` does **not** load it (homepage uses `script.js` “Pairs well with” only).

| Tool HTML | Loads `pehchaan_tool_links.js` |
|-----------|-------------------------------|
| `Tools/pehchaan_stream_advisor.html` | Yes |
| `Tools/pehchaan_financing_reality.html` | Yes |
| `Tools/pehchaan_career_roi_reality_bridge.html` | Yes |
| `Tools/pehchaan_salary_explorer.html` | Yes |
| `Tools/pehchaan_exam_roadmap.html` | Yes |
| `Tools/pehchaan_career_assessment.html` | Yes |
| `Tools/pehchaan_mentor_connect.html` | Yes |

## Query parameters consumers understand

| Key | Used by | Meaning |
|-----|-----------|---------|
| `from` | All emitters | Source tool id: `stream`, `roi`, `financing`, `salary`, `roadmap`, `assessment`, `mentor` (informational + session). |
| `career` | Registry-aware tools | Canonical id (e.g. `software_engineer`), **or** numeric Salary Explorer id, **or** Exam Roadmap career id when resolvable via registry (`resolveCareerTokenRow`). |
| `stream` | Salary filter, ROI context, roadmap prefill | `science` \| `commerce` \| `arts` \| … |
| `class` | Exam roadmap | `10`, `11`, `12`, `grad1`, `grad2`. |
| `state` | Exam roadmap | State code or filter value when not `all` / `national_only`. |
| `exam` | Plan B | Plan B exam row id (e.g. `jee_engineering`). |
| `job` | Skill gap | Skill gap `job_categories[].id`. |
| `roiBand` | Plan B (optional) | `high` \| `mid` \| `low` — from ROI result. |
| `profile` | Assessment → outbound links | Holland top-3 code string (e.g. `R-I-A`); targets may ignore until they add readers. |

## Emitters → targets (programmed today)

### Stream Advisor (after results)

- **Session:** `setJourney({ from: 'stream', stream })`
- **Links:** Salary Explorer, Exam Roadmap, ROI Bridge — all with `from=stream` + `stream=science|commerce|arts`.

### ROI Bridge (after results + slider)

- **Session:** `setJourney({ from: 'roi', career, roiBand, stream })`
- **Links:** Plan B (if ROI weak or long payback), Salary, Financing, Skill Gap (selected tech/marketing careers), Parent FAQ — via `PehchaanToolLinks.buildRoiNextLinksHtml`.
- **Inbound:** On load, `tryRoiUrlPrefill()` selects career from `mergeParams().career` using registry / ROI ids.

### Financing (on load)

- **Reads:** `mergeJourney()` for `career`.
- **Footer links:** ROI, Salary, Parent FAQ — `from=financing` + `career` when known.

### Salary Explorer

- **Inbound:** `stream` sets filter; `career` opens card (canonical, numeric id, or exam-roadmap id via `resolveCareerTokenRow`).
- **Outbound:** When a card is expanded, `setJourney({ from: 'salary', career, stream })` and inline “Continue exploring” links (ROI, Exam roadmap, Plan B if mapped, Skill gap if mapped, Financing).

### Exam Roadmap Builder (after “Build my roadmap”)

- **Session:** `setJourney({ from: 'roadmap', class, stream, state, career })` with `career` = comma-separated roadmap career ids.
- **Results strip:** Salary, ROI, Plan B, Skill gap — first career id used where a single slug is needed.

### Plan B Strategy Builder

- **Inbound:** `exam` selects exam; else `career` resolved with `resolveRow` **or** `resolveCareerTokenRow`.

### Skill Gap Analyser

- **Inbound:** `job` or `career` (canonical / token via `resolveCareerTokenRow`).

### Career Assessment (after results)

- **Session:** `setJourney({ from: 'assessment', profile })` with Holland top-3 codes joined by `-`.
- **Strip:** Stream advisor, Salary, Exam roadmap — `profile` on URL for future readers.

### Mentor Connect (after student search results)

- **Session:** `setJourney({ from: 'mentor' })`
- **Strip:** Salary, Plan B, Parent FAQ (generic entry; no career inferred).

## Registry (`DB/pehchaan_career_registry.json`)

Each row maps **`canonical_id`** to tool-specific ids:

- `salary_explorer_id` → `pehchaan_salary_explorer_data.json` `careers[].id`
- `roi_career_id` → `pehchaan_career_roi_reality_bridge_data.json` `careers[].id` (nullable)
- `exam_roadmap_career_id` → `pehchaan_exam_data.json` `careers[].id`
- `plan_b_exam_id` → `pehchaan_plan_b_strategy_builder_data.json` `exams[].id`
- `skill_gap_job_id` → `pehchaan_skill_gap_analyser_data.json` `job_categories[].id` (nullable)

The JSON root **`tool_integration`** block holds schema version and pointers to this doc (for humans and scripts).

## Validation

From repo root:

```bash
node scripts/validate-tool-integration.cjs
```

Fails with a non-zero exit code if any registry pointer is missing in the target dataset.

## Phase 5 — Backend (deferred)

A **server-side tool graph** is only needed if you add accounts, saved journeys, analytics on which links convert, or dynamic A/B routing. Until then, keep **registry + `PehchaanToolLinks` + this doc** aligned when adding tools or IDs.
