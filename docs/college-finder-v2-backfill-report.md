# College Finder v2 Backfill Report

Generated on: 2026-05-09

## Coverage Summary

- Colleges: **230**
- Programs: **351**

- Admission route primary populated: **351/351** (100.0%)
- Admission route exam IDs populated: **201/351** (57.3%)
- Admission route = verify fallback: **7/351** (2.0%)

- Cost band populated: **230/230** (100.0%)
- Recognition university status populated: **230/230** (100.0%)
- Recognition regulators_required populated: **230/230** (100.0%)

## Notes

- This pass is rule-based (`method=heuristic`) and should be followed by sample manual review.
- `regulators_verified` is intentionally empty in this phase to avoid false verification claims.
- Exam IDs are mapped only when suitable IDs are found in `pehchaan_exam_data.json`.
