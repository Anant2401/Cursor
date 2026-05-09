# College Finder v2 Backfill Report

Generated on: 2026-05-09

## Coverage Summary

- Colleges: **355**
- Programs: **479**

- Admission route primary populated: **479/479** (100.0%)
- Admission route exam IDs populated: **241/479** (50.3%)
- Admission route = verify fallback: **33/479** (6.9%)

- Cost band populated: **355/355** (100.0%)
- Recognition university status populated: **355/355** (100.0%)
- Recognition regulators_required populated: **355/355** (100.0%)

## Notes

- This pass is rule-based (`method=heuristic`) and should be followed by sample manual review.
- `regulators_verified` is intentionally empty in this phase to avoid false verification claims.
- Exam IDs are mapped only when suitable IDs are found in `pehchaan_exam_data.json`.
