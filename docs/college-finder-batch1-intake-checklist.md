# College Finder Batch 1 Intake Checklist

Use this with `docs/college-finder-batch1-intake-template.csv` before adding new records to `DB/pehchaan_college_registry.json`.

## 1) Intake scope for Batch 1

- States: `MH`, `UP`, `TN` (adjust if needed)
- Streams: `engineering`, `medicine`, `management`, `commerce`, `law`
- Target size: 150-250 new colleges

## 2) Row-level requirements (must pass)

- `state_id` is a valid state in registry taxonomies.
- `college_id` is unique and snake_case.
- `college_name`, `city`, `type`, `website` are non-empty.
- `website` starts with `http://` or `https://`.
- `stream_id` + `course_id` are valid taxonomy IDs.
- `geography_lens_ids` uses `state_comfort`, `national_level`, or both (pipe-separated in template).
- `source_url_primary` must be official institute/regulator/counselling source.

## 3) Confidence guidance

- `high`: explicit official evidence and current links.
- `medium`: official source exists, but some details inferred.
- `low`: placeholder with verification pending (use sparingly).

## 4) Data-entry rules

- One CSV row = one stream/course mapping for one college.
- If one college has 3 streams, add 3 rows with same `college_id`.
- Do not invent exam IDs/fees/cutoffs.
- Keep uncertain points in `notes` instead of guessing.

## 5) Merge workflow

1. Fill intake CSV rows.
2. Convert/import rows into registry format:
   - Preview only: `node scripts/import-college-intake-csv.cjs docs/college-finder-batch1-intake-template.csv --dry-run`
   - Apply import: `node scripts/import-college-intake-csv.cjs docs/college-finder-batch1-intake-template.csv`
3. Run:
   - `node scripts/backfill-college-finder-v2.cjs`
   - `node scripts/build-college-indexes.cjs`
   - `node scripts/validate-college-registry.cjs`
4. Generate/refresh QA sample and review 30 records.
5. Fix issues and rerun.

## 6) Publish gate (Batch 1)

- Admission route coverage >= 90% programs.
- Cost band coverage >= 85% colleges.
- Recognition status coverage >= 85% colleges.
- No broken URLs in new rows.
- College Finder cards render without empty sections.

