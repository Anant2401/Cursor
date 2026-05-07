# Canonical FK Matrix

This matrix defines source-of-truth primary keys and foreign-key mappings between the current `DB/pehchaan_*.json` files and the new canonical files.

## Primary Keys

- `careers.career_id` -> canonical primary key for careers
- `skill_map.skill_id` -> canonical skill-map primary key
- `exams.exam_id` -> canonical exam primary key
- `institutions.institution_id` -> canonical institution primary key
- `resources.resource_id` -> canonical learning resource key
- `financial_aid.aid_id` -> canonical funding/scholarship key

## Legacy To Canonical ID Mapping

- `DB/pehchaan_career_registry.json`:
  - `careers[].canonical_id` -> `careers[].career_id`
  - `careers[].salary_explorer_id` -> `careers[].legacy_refs.salary_explorer_id`
  - `careers[].skill_gap_job_id` -> `careers[].legacy_refs.skill_gap_job_id`
  - `careers[].exam_roadmap_career_id` -> `careers[].legacy_refs.exam_roadmap_career_id`
  - `careers[].plan_b_exam_id` -> `careers[].legacy_refs.plan_b_exam_id`
  - `careers[].roi_career_id` -> `careers[].legacy_refs.roi_career_id`
  - `careers[].private_role_ids[]` -> `careers[].legacy_refs.private_role_ids[]`

## Cross-File Foreign Keys (Current DB)

- `pehchaan_career_registry.careers[].salary_explorer_id` -> `pehchaan_salary_explorer_data.careers[].id`
- `pehchaan_career_registry.careers[].skill_gap_job_id` -> `pehchaan_skill_gap_analyser_data.job_categories[].id`
- `pehchaan_career_registry.careers[].exam_roadmap_career_id` -> `pehchaan_exam_data.careers[].id`
- `pehchaan_career_registry.careers[].plan_b_exam_id` -> `pehchaan_plan_b_strategy_builder_data.exams[].id`
- `pehchaan_career_registry.careers[].roi_career_id` -> `pehchaan_career_roi_reality_bridge_data.careers[].id`
- `pehchaan_career_registry.careers[].private_role_ids[]` -> `pehchaan_private_sector_roles.roles[].private_role_id`
- `pehchaan_private_sector_roles.roles[].career_canonical_id` -> `pehchaan_career_registry.careers[].canonical_id`
- `pehchaan_private_sector_roles.roles[].skill_gap_job_id` -> `pehchaan_skill_gap_analyser_data.job_categories[].id`
- `pehchaan_private_sector_roles.roles[].plan_b_exam_links[]` -> `pehchaan_plan_b_strategy_builder_data.exams[].id`
- `pehchaan_private_sector_roles.roles[].metro_map[].metro_id` -> `pehchaan_private_sector_roles.metros[].metro_id`
- `pehchaan_college_registry.college_programs[].college_id` -> `pehchaan_college_registry.colleges[].id`
- `pehchaan_college_registry.college_programs[].stream_id` -> `pehchaan_college_registry.taxonomies.streams[].id`
- `pehchaan_college_registry.college_programs[].course_id` -> `pehchaan_college_registry.taxonomies.courses[].id`
- `pehchaan_college_registry.college_programs[].admission_exam_ids[]` -> `pehchaan_college_registry.taxonomies.admission_exams[].id`

## Canonical FK Conventions

- `skill_map.career_id` -> `careers.career_id`
- `careers.exams[]` -> `exams.exam_id`
- `careers.typical_employers[]` -> free-text string array (non-FK)
- `institutions.programs[].course_id` -> `courses.course_id` (if/when `courses.json` is materialized)
- `institutions.programs[].exam_ids[]` -> `exams.exam_id`
- `resources.related_career_ids[]` -> `careers.career_id`
- `resources.related_skill_ids[]` -> `skill_map.skill_id`
- `financial_aid.linked_career_ids[]` -> `careers.career_id`
- `financial_aid.linked_exam_ids[]` -> `exams.exam_id`

## Integrity Rules

- No duplicate PKs within canonical files.
- Every non-null FK must resolve to an existing PK.
- Enum and score constraints:
  - `ai_impact_score` int in `[1,10]`
  - `remote_index` int in `[1,10]`
  - `roi_index` float in `[1.0,10.0]`
  - `application_complexity` int in `[1,5]`
- Arrays must always be arrays (never scalar-or-array unions).
