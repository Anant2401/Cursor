# College Finder v2 Backfill Report

Generated on: 2026-05-09

## Coverage Summary

- Colleges: **216**
- Programs: **335**

- Admission route primary populated: **335/335** (100.0%)
- Admission route exam IDs populated: **198/335** (59.1%)
- Admission route = verify fallback: **0/335** (0.0%)

- Cost band populated: **216/216** (100.0%)
- Recognition university status populated: **216/216** (100.0%)
- Recognition regulators_required populated: **216/216** (100.0%)

## Notes

- This pass is rule-based (`method=heuristic`) and should be followed by sample manual review.
- `regulators_verified` is intentionally empty in this phase to avoid false verification claims.
- Exam IDs are mapped only when suitable IDs are found in `pehchaan_exam_data.json`.
