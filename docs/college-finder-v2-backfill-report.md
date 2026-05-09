# College Finder v2 Backfill Report

Generated on: 2026-05-09

## Coverage Summary

- Colleges: **287**
- Programs: **411**

- Admission route primary populated: **411/411** (100.0%)
- Admission route exam IDs populated: **218/411** (53.0%)
- Admission route = verify fallback: **24/411** (5.8%)

- Cost band populated: **287/287** (100.0%)
- Recognition university status populated: **287/287** (100.0%)
- Recognition regulators_required populated: **287/287** (100.0%)

## Notes

- This pass is rule-based (`method=heuristic`) and should be followed by sample manual review.
- `regulators_verified` is intentionally empty in this phase to avoid false verification claims.
- Exam IDs are mapped only when suitable IDs are found in `pehchaan_exam_data.json`.
