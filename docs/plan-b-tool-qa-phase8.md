# Plan B Strategy Builder — Phase 8 QA snapshot (2026-05-04)

## Inconsistency report (UI / structure)

| Area | Severity | Notes |
|------|----------|--------|
| Top bar logo | P2 | Pivot and inner screens now use the full logo SVG; cover and jobs already matched. |
| Top bar back | P0 (fixed) | Only `screen-cover` uses `←` to site home; job results use `backFromJobResultsToExam()`. |
| Footer contact lines | P2 | College/Course flows now include the same email line as Jobs where footers were shorter before. |
| Course picker disclaimer | P3 | Added to align with Jobs/College legal coverage on the picker screen. |
| Duplicate disclaimers | P3 | Removed inline disclaimer from course results JS to avoid doubling with static footer disclaimer. |

## Content gap analysis (voice / clarity)

| Area | Severity | Notes |
|------|----------|--------|
| Cover hero | P2 | Reworked to foreground all three lenses (jobs, colleges, courses) with energetic but honest tone. |
| Jobs path | P2 | Hero tag “Plan B — Jobs & Income”; removed redundant pivot link; exam grid hint references top `←`. |
| College path | P2 | Added “Why Plan B…” power banner on picker; hero copy references IIT/IIM/AIIMS framing; insight + detail blocks on results. |
| Course path | P2 | Parity banners and results insight/detail; `outcome_note` on sample alternative. |
| Fallback bundles | P1 | When no JSON bundle matches, a verification-first template appears — tone is transparent, not apologetic. |
| New exams | P2 | Eight additional national-style exams with distinct job template sets (or intentional reuse for GATE). |

## P0 verification checklist (manual)

1. Cover `←` → main site.
2. Cover Continue → Pivot `←` → Cover.
3. Pivot → Jobs → pick exam → results → top `←` → exam list (selection preserved).
4. Jobs exam list `←` → Pivot.
5. Pivot → Colleges → stream → lens → (if state-comfort) state dropdown → results → `←` → picker state preserved.
6. Pivot → Courses → anchor → results insight visible for `jee_btech_miss` → `←` → picker.
7. College: pick stream+lens+state with **no** bundle (e.g. new stream + state) → fallback banner and template card appear.

## Follow-ups (not blocking)

- Add curated `bundles` rows for new `stream_id` values where product wants deeper state-wise examples.
- Consider moving emoji per exam from `EXAM_EMOJIS` into JSON for editorial control without HTML edits.
