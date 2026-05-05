# College Registry Operations Runbook

This runbook defines ownership and release checks for:

- `DB/pehchaan_college_registry.json`
- `DB/pehchaan_college_registry_indexes.json`
- `scripts/migrate-planb-college-registry.cjs`
- `scripts/build-college-indexes.cjs`
- `scripts/validate-college-registry.cjs`

## Ownership model

- **Ingestion owner**
  - Runs migration/import scripts.
  - Updates `meta.last_updated` and `meta.pipeline_stats`.
- **Verification reviewer**
  - Reviews stale rows, link quality, and suspicious duplicates.
  - Spot-checks at least one sample per stream and major state clusters.
- **Release approver**
  - Confirms validation scripts pass.
  - Approves publish to `main`.

## Monthly release checklist

Run from repo root:

```bash
node scripts/migrate-planb-college-registry.cjs
node scripts/build-college-indexes.cjs
node scripts/validate-college-registry.cjs
```

Required checks before merge:

1. `validate-college-registry` exits 0.
2. No missing program mappings (`college_programs` references valid college IDs).
3. `state_neighbors` map references only known state IDs.
4. `meta.pipeline_stats` reflects generated counts.
5. Random manual verification sample:
   - 5 states
   - 3 streams
   - 10 colleges minimum

## Admission-season hot refresh (recommended weekly)

- Re-run full pipeline.
- Prioritize updates for:
  - counselling routes
  - official links
  - high-traffic streams/courses
- Keep stale rows but downgrade confidence to `medium/low` when needed.

## Confidence policy

- `high`: official website + reliable source URLs + recent verification.
- `medium`: partial source confidence or stale but plausible metadata.
- `low`: sparse details; shown for awareness, requires manual verification.

## Incident fallback

If data validation fails near release:

1. Do not publish broken JSON.
2. Keep prior known-good registry/index files.
3. Ship only script fixes; rerun pipeline in next release window.
