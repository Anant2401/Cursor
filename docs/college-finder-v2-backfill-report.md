# College Finder v2 Backfill Report

Generated on: 2026-05-09

## Coverage Summary

- Colleges: **345**
- Programs: **469**

- Admission route primary populated: **469/469** (100.0%)
- Admission route exam IDs populated: **236/469** (50.3%)
- Admission route = verify fallback: **33/469** (7.0%)

- Cost band populated: **345/345** (100.0%)
- Recognition university status populated: **345/345** (100.0%)
- Recognition regulators_required populated: **345/345** (100.0%)

## Notes

- This pass is rule-based (`method=heuristic`) and should be followed by sample manual review.
- `regulators_verified` is intentionally empty in this phase to avoid false verification claims.
- Exam IDs are mapped only when suitable IDs are found in `pehchaan_exam_data.json`.
