# College Finder v2 Backfill Report

Generated on: 2026-05-09

## Coverage Summary

- Colleges: **250**
- Programs: **371**

- Admission route primary populated: **371/371** (100.0%)
- Admission route exam IDs populated: **207/371** (55.8%)
- Admission route = verify fallback: **12/371** (3.2%)

- Cost band populated: **250/250** (100.0%)
- Recognition university status populated: **250/250** (100.0%)
- Recognition regulators_required populated: **250/250** (100.0%)

## Notes

- This pass is rule-based (`method=heuristic`) and should be followed by sample manual review.
- `regulators_verified` is intentionally empty in this phase to avoid false verification claims.
- Exam IDs are mapped only when suitable IDs are found in `pehchaan_exam_data.json`.
