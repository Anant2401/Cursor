# College Finder v2 Backfill Report

Generated on: 2026-05-09

## Coverage Summary

- Colleges: **220**
- Programs: **341**

- Admission route primary populated: **341/341** (100.0%)
- Admission route exam IDs populated: **199/341** (58.4%)
- Admission route = verify fallback: **4/341** (1.2%)

- Cost band populated: **220/220** (100.0%)
- Recognition university status populated: **220/220** (100.0%)
- Recognition regulators_required populated: **220/220** (100.0%)

## Notes

- This pass is rule-based (`method=heuristic`) and should be followed by sample manual review.
- `regulators_verified` is intentionally empty in this phase to avoid false verification claims.
- Exam IDs are mapped only when suitable IDs are found in `pehchaan_exam_data.json`.
