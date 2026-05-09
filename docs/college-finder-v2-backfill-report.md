# College Finder v2 Backfill Report

Generated on: 2026-05-09

## Coverage Summary

- Colleges: **267**
- Programs: **391**

- Admission route primary populated: **391/391** (100.0%)
- Admission route exam IDs populated: **212/391** (54.2%)
- Admission route = verify fallback: **19/391** (4.9%)

- Cost band populated: **267/267** (100.0%)
- Recognition university status populated: **267/267** (100.0%)
- Recognition regulators_required populated: **267/267** (100.0%)

## Notes

- This pass is rule-based (`method=heuristic`) and should be followed by sample manual review.
- `regulators_verified` is intentionally empty in this phase to avoid false verification claims.
- Exam IDs are mapped only when suitable IDs are found in `pehchaan_exam_data.json`.
