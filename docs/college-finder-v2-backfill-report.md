# College Finder v2 Backfill Report

Generated on: 2026-05-09

## Coverage Summary

- Colleges: **307**
- Programs: **431**

- Admission route primary populated: **431/431** (100.0%)
- Admission route exam IDs populated: **224/431** (52.0%)
- Admission route = verify fallback: **30/431** (7.0%)

- Cost band populated: **307/307** (100.0%)
- Recognition university status populated: **307/307** (100.0%)
- Recognition regulators_required populated: **307/307** (100.0%)

## Notes

- This pass is rule-based (`method=heuristic`) and should be followed by sample manual review.
- `regulators_verified` is intentionally empty in this phase to avoid false verification claims.
- Exam IDs are mapped only when suitable IDs are found in `pehchaan_exam_data.json`.
