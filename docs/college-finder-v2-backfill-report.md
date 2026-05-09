# College Finder v2 Backfill Report

Generated on: 2026-05-09

## Coverage Summary

- Colleges: **277**
- Programs: **401**

- Admission route primary populated: **401/401** (100.0%)
- Admission route exam IDs populated: **216/401** (53.9%)
- Admission route = verify fallback: **21/401** (5.2%)

- Cost band populated: **277/277** (100.0%)
- Recognition university status populated: **277/277** (100.0%)
- Recognition regulators_required populated: **277/277** (100.0%)

## Notes

- This pass is rule-based (`method=heuristic`) and should be followed by sample manual review.
- `regulators_verified` is intentionally empty in this phase to avoid false verification claims.
- Exam IDs are mapped only when suitable IDs are found in `pehchaan_exam_data.json`.
