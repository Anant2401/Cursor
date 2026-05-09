# College Finder v2 Backfill Report

Generated on: 2026-05-09

## Coverage Summary

- Colleges: **325**
- Programs: **449**

- Admission route primary populated: **449/449** (100.0%)
- Admission route exam IDs populated: **231/449** (51.4%)
- Admission route = verify fallback: **32/449** (7.1%)

- Cost band populated: **325/325** (100.0%)
- Recognition university status populated: **325/325** (100.0%)
- Recognition regulators_required populated: **325/325** (100.0%)

## Notes

- This pass is rule-based (`method=heuristic`) and should be followed by sample manual review.
- `regulators_verified` is intentionally empty in this phase to avoid false verification claims.
- Exam IDs are mapped only when suitable IDs are found in `pehchaan_exam_data.json`.
