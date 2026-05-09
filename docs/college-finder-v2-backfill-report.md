# College Finder v2 Backfill Report

Generated on: 2026-05-09

## Coverage Summary

- Colleges: **317**
- Programs: **441**

- Admission route primary populated: **441/441** (100.0%)
- Admission route exam IDs populated: **227/441** (51.5%)
- Admission route = verify fallback: **31/441** (7.0%)

- Cost band populated: **317/317** (100.0%)
- Recognition university status populated: **317/317** (100.0%)
- Recognition regulators_required populated: **317/317** (100.0%)

## Notes

- This pass is rule-based (`method=heuristic`) and should be followed by sample manual review.
- `regulators_verified` is intentionally empty in this phase to avoid false verification claims.
- Exam IDs are mapped only when suitable IDs are found in `pehchaan_exam_data.json`.
