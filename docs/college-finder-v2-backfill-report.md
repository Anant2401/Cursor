# College Finder v2 Backfill Report

Generated on: 2026-05-09

## Coverage Summary

- Colleges: **240**
- Programs: **361**

- Admission route primary populated: **361/361** (100.0%)
- Admission route exam IDs populated: **203/361** (56.2%)
- Admission route = verify fallback: **10/361** (2.8%)

- Cost band populated: **240/240** (100.0%)
- Recognition university status populated: **240/240** (100.0%)
- Recognition regulators_required populated: **240/240** (100.0%)

## Notes

- This pass is rule-based (`method=heuristic`) and should be followed by sample manual review.
- `regulators_verified` is intentionally empty in this phase to avoid false verification claims.
- Exam IDs are mapped only when suitable IDs are found in `pehchaan_exam_data.json`.
