# College Finder v2 Backfill Report

Generated on: 2026-05-09

## Coverage Summary

- Colleges: **213**
- Programs: **332**

- Admission route primary populated: **332/332** (100.0%)
- Admission route exam IDs populated: **196/332** (59.0%)
- Admission route = verify fallback: **0/332** (0.0%)

- Cost band populated: **213/213** (100.0%)
- Recognition university status populated: **213/213** (100.0%)
- Recognition regulators_required populated: **213/213** (100.0%)

## Notes

- This pass is rule-based (`method=heuristic`) and should be followed by sample manual review.
- `regulators_verified` is intentionally empty in this phase to avoid false verification claims.
- Exam IDs are mapped only when suitable IDs are found in `pehchaan_exam_data.json`.
