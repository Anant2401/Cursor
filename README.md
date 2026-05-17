# Pehchaan Careers — website

Static marketing site and **freemium-style career tools** for students and parents (Tier 2/3 India, including Chhattisgarh). Live site: [pehchaancareers.in](https://pehchaancareers.in).

## Run locally

Open the repo root with a **local HTTP server** so `fetch()` can load JSON from `DB/` (opening `file://` HTML will break tools that load data).

```bash
npx serve .
# or: python -m http.server 8080
```

Then open `http://localhost:3000/` (or the port shown). Tools live under `/Tools/…`.

## Site map

Machine-readable URLs: **`sitemap.xml`** (homepage, all tools, Parent’s Guide export, PDF brochures).

## Tools (`Tools/`)

| Page | Role |
|------|------|
| `pehchaan_career_assessment.html` | Career assessment flow |
| `pehchaan_stream_advisor.html` | Stream advisor (loads `DB/pehchaan_stream_advisor_data.json`) |
| `pehchaan_salary_explorer.html` | Salary bands (`DB/pehchaan_salary_explorer_data.json`) |
| `pehchaan_private_sector_journey.html` | Guided private-sector entry flow (`DB/pehchaan_private_sector_roles.json`) |
| `pehchaan_career_roi_reality_bridge.html` | ROI / cost vs earnings reality |
| `pehchaan_financing_reality.html` | EMI / financing reality (`DB/pehchaan_financing_reality_data.json`) |
| `pehchaan_exam_roadmap.html` | Exam roadmap builder (`DB/pehchaan_exam_data.json`) |
| `pehchaan_plan_b_strategy_builder.html` | Plan B after exams (`DB/pehchaan_plan_b_strategy_builder_data.json`) |
| `pehchaan_college_finder.html` | College discovery by stream/course/state (`DB/pehchaan_college_registry.json` + `DB/pehchaan_college_registry_indexes.json`) |
| `pehchaan_skill_gap_analyser.html` | Skill gap (`DB/pehchaan_skill_gap_analyser_data.json`) |
| `pehchaan_mentor_connect.html` | Mentor connect (optional `DB/pehchaan_mentor_connect_config.json` + Apps Script URL) |

Shared assets: **`assets/pehchaan_translate.js`**, **`assets/pehchaan_journey.js`** (URL/session handoff), **`assets/pehchaan_career_registry_prefill.js`** (registry-driven deep links), **`assets/pehchaan_tool_links.js`** (central cross-tool URL builders). Integration map: **`docs/tool-integration.md`**.

## Parent’s Guide (FAQ)

- **Source app:** `parent-faq/` (Next.js 16, static export, `basePath: /Tools/parents-guide`).
- **Deployed static output:** `Tools/parents-guide/` — run `node scripts/export-parents-guide.cjs` (build + copy); commit HTML **and** `_next/` assets together.
- **FAQ source of truth:** `FAQDB/faqs.json` — sync into `parent-faq/data/faqs.json` when editing (see `parent-faq/README.md`).

## Data (`DB/`)

Key JSON files used by the tools include:

- `pehchaan_salary_explorer_data.json`, `pehchaan_exam_data.json`, `pehchaan_plan_b_strategy_builder_data.json`, `pehchaan_skill_gap_analyser_data.json`, `pehchaan_stream_advisor_data.json`, `pehchaan_financing_reality_data.json`, `pehchaan_career_roi_reality_bridge_data.json`
- **`pehchaan_career_registry.json`** — canonical `career=` slugs → salary / ROI / skill-gap / exam roadmap / Plan B IDs for cross-tool links
- **`pehchaan_private_sector_roles.json`** — shared private-sector role definitions used across Salary / Skill Gap / Plan B / Mentor
- **`pehchaan_college_registry.json`** + **`pehchaan_college_registry_indexes.json`** — College Finder and Plan B college fallback source
- **`pehchaan_college_registry.schema.json`** — schema reference for college registry structure
- **`pehchaan_mentor_connect_config.json`** — optional defaults for mentor Web App URL and Serper endpoint

## Scripts (`scripts/`)

| Script | Purpose |
|--------|---------|
| **`monthly-json-update.cjs`** | Monthly one-shot orchestration: FAQ count, salary build, college registry migration + indexes, registry/integration validation, and parse-check of every `DB/*.json` file |
| **`export-parents-guide.cjs`** | Builds `parent-faq/` and copies static export to `Tools/parents-guide/` |
| **`validate-tool-integration.cjs`** | Verifies `pehchaan_career_registry.json` + private-role mappings; Parent’s Guide `index.html` ↔ `_next/` assets on disk and in git |
| **`validate-local-links.cjs`** | Validates local `href`/`src`/`fetch()` targets exist (tools, assets, DB references) |
| `build-salary-explorer-json.cjs` | Regenerates `DB/pehchaan_salary_explorer_data.json` from explorer HTML + in-file extras |
| `count-faqs.cjs` | Prints FAQ count from `FAQDB/faqs.json` |
| Other `*.cjs` / `*.mjs` | Plan B, stream advisor, college bundles, etc. — include in monthly flow when they become part of routine refresh |

Run from repo root:

```bash
node scripts/monthly-json-update.cjs
node scripts/validate-tool-integration.cjs
node scripts/validate-college-registry.cjs
node scripts/validate-local-links.cjs
```

## Repo layout (high level)

```
index.html, styles.css, script.js   # Homepage + journey
assets/                              # Shared JS, icons
DB/                                  # Tool JSON + registry + configs
Tools/*.html                         # Standalone tool pages
Tools/parents-guide/                 # Exported Parent’s Guide
parent-faq/                          # Next source for Parent’s Guide
FAQDB/                               # Canonical FAQ JSON
docs/                                # Internal notes / QA where present
```

## Other folders

- **`backend/`** — separate backend README if you use that stack.
- **`Presentation/pdf/`** — brochures linked from the site and sitemap.

---

Questions or updates: **buddy@pehchaancareers.in** · **hello.pehchaan@gmail.com**
