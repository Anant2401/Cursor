# College Finder v2 Backfill Report

Generated on: 2026-05-09

## Coverage Summary

- Colleges: **297**
- Programs: **421**

- Admission route primary populated: **421/421** (100.0%)
- Admission route exam IDs populated: **221/421** (52.5%)
- Admission route = verify fallback: **27/421** (6.4%)

- Cost band populated: **297/297** (100.0%)
- Recognition university status populated: **297/297** (100.0%)
- Recognition regulators_required populated: **297/297** (100.0%)

## Notes

- This pass is rule-based (`method=heuristic`) and should be followed by sample manual review.
- `regulators_verified` is intentionally empty in this phase to avoid false verification claims.
- Exam IDs are mapped only when suitable IDs are found in `pehchaan_exam_data.json`.
