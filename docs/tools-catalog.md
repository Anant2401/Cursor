# Pehchaan Careers — Tools catalog

This document describes each **student- and family-facing tool** shipped in this repository: what it does, who it is for, typical situations to use it, and what you gain. It aligns with the **Career Tools** section on `index.html` (`#tools`), the eight-step **“Your path through the tools”** journey rail, and the technical handoff behaviour documented in [`docs/tool-integration.md`](tool-integration.md).

**Cross-cutting expectations (all tools)**

- Outputs are **for discussion**, not substitutes for professional counselling or official notices. Tools surface the consultation-style disclaimer required in `.cursorrules` (discussion with parents, teachers, counsellors, and independent verification for exams, admissions, fees, and loans).
- Static tools live under **`Tools/`** with data in **`DB/*.json`** where applicable; renaming files or datasets must stay aligned (see `.cursorrules` implementation map).
- Several tools chain together via **`sessionStorage`** (`pehchaan_journey`) and **URL query parameters** (`career`, `stream`, `class`, etc.). Maintainer detail: [`docs/tool-integration.md`](tool-integration.md).

---

## How the homepage organises tools

### Journey rail (suggested thematic order)

The marketing site suggests a sensible arc (not a strict gate—you can open any tool directly):

| Step | Theme | Typical tools |
|------|--------|----------------|
| 1 | Self-discovery | Career Assessment |
| 2 | Stream / course fit | Stream Advisor |
| 3 | Money truth | Salary Explorer, Career ROI & Reality Bridge, Financing & EMI Reality |
| 4 | Exam reality | Exam Roadmap Builder |
| 5 | Plan B income | Plan B Strategy Builder |
| 6 | Skills to get hired | Skill Gap Analyser |
| 7 | Proof & people | Mentor Connect |
| 8 | Family alignment | Parent’s Guide (FAQ) |

### “Start here (30 seconds)”

On `#tools`, the **stage** (Class 10, 11–12, college, parent) and **first worry** (fit, money, exam, job) filters highlight suggested tools. Use this when you want a **fast, low-friction** route instead of reading every card.

---

## Tool-by-tool reference

### 1. Career Assessment

| | |
|---|---|
| **Entry** | `Tools/pehchaan_career_assessment.html` |
| **Data** | In-tool logic and copy (Holland-style interest profile); links out use journey + `profile` query (top-3 codes, e.g. `R-I-A`) for future or cross-tool readers |
| **Homepage chip** | For students exploring options |

**What it does**

- Guided questionnaire across themed sections to surface **interests and strengths**, then summarises a profile and suggests **directions worth exploring** with mentors—not a single “destined” job label.

**When to use it**

- You feel **overwhelmed by choices** and want a structured first pass at “what kinds of work fit me.”
- You want **language** for conversations with parents or counsellors (preference patterns, not a certificate).

**Use cases**

- Class 10–12 before stream or elective decisions; early college when choosing a broad direction.
- After a setback (“I scored low—what next?”): reframing around fit and options rather than panic.

**Benefits**

- **Low overwhelm**: step-by-step, educative framing.
- **Natural on-ramp** to Stream Advisor, Salary Explorer, Exam Roadmap (post-result links honour `profile` for tools that evolve to read it).

**Outbound integration**

- Loads **`pehchaan_journey.js`** + **`pehchaan_tool_links.js`**; sets journey `from=assessment` and passes `profile` on URLs where applicable.

---

### 2. Stream Advisor (10th Class)

| | |
|---|---|
| **Entry** | `Tools/pehchaan_stream_advisor.html` |
| **Data** | `DB/pehchaan_stream_advisor_data.json` |
| **Homepage chip** | For Class 10 students and parents |

**What it does**

- Compares **Science, Commerce, and Arts** using goals and preferences so the stream choice is framed around **fit and clarity**, not only social pressure.

**When to use it**

- You (or your child) are **nearing or in Class 10** and must choose a stream.
- Two streams both sound plausible and you want a **structured comparison**.

**Use cases**

- Family discussions where **expectations differ**; the tool supplies neutral prompts.
- Students who like “a bit of everything” and need help **clustering** preferences.

**Benefits**

- **Scenario-based thinking** instead of stereotypes (“only toppers take Science”).
- **Feeds other tools**: result stores `stream` in the journey for Salary Explorer, Exam Roadmap, ROI Bridge.

**Outbound integration**

- After results: `setJourney({ from: 'stream', stream })` and links with `stream=science|commerce|arts`.

---

### 3. Salary Explorer

| | |
|---|---|
| **Entry** | `Tools/pehchaan_salary_explorer.html` |
| **Data** | `DB/pehchaan_salary_explorer_data.json`; careers tie to **`DB/pehchaan_career_registry.json`** |
| **Homepage chip** | For students comparing opportunities |

**What it does**

- Browse **salary ranges and growth-ish bands** across careers (illustrative, not offers or guarantees)—to compare **long-term opportunity shape** before locking a path.

**When to use it**

- You have a **shortlist of careers** and want **order-of-magnitude** comparisons.
- After Stream Advisor or Assessment, to **sanity-check** aspirations against typical ranges.

**Use cases**

- “Is path A materially different from path B over 5–10 years?”
- Grounding family money conversations in **ranges**, not rumours.

**Benefits**

- **Registry-aware**: opening a card can align with `career` tokens from other tools (canonical id, numeric id, or exam-roadmap id when resolvable).
- **Continues the journey**: expanded card updates session for ROI, Financing, Exam Roadmap, Plan B, Skill Gap when mapped.

**Inbound / outbound**

- **Inbound**: `stream` filters; `career` opens the matching card.
- **Outbound**: `setJourney({ from: 'salary', career, stream })` and “Continue exploring” links.

---

### 4. Career ROI & Reality Bridge

| | |
|---|---|
| **Entry** | `Tools/pehchaan_career_roi_reality_bridge.html` |
| **Data** | `DB/pehchaan_career_roi_reality_bridge_data.json` + registry |
| **Homepage chip** | For students and families planning money honestly |

**What it does**

- Builds a **rough total investment picture** (coaching, college, living, buffer—user-adjusted) and relates it to **salary bands** and **break-even style** reflections, plus plain-language **reality checks** (still not financial advice).

**When to use it**

- A path is appealing but **nobody has summed the full cost**.
- You need a **shared spreadsheet moment** without building the spreadsheet.

**Use cases**

- Professional courses with high upfront cost vs modest alternatives.
- Comparing **two careers** where payback horizons differ sharply.

**Benefits**

- Connects money to **`roiBand`** and **`career`** for **Plan B** (weak ROI or long payback), Salary, Financing, Skill Gap (selected profiles), Parent FAQ.
- Helps families speak in **ranges and trade-offs**, not shame or hype.

**Outbound integration**

- `setJourney({ from: 'roi', career, roiBand, stream })`; Plan B links can pass `exam` / `roiBand` context.

---

### 5. Financing & EMI Reality

| | |
|---|---|
| **Entry** | `Tools/pehchaan_financing_reality.html` |
| **Data** | `DB/pehchaan_financing_reality_data.json` |
| **Homepage chip** | For families discussing loans & EMI honestly |

**What it does**

- **Ballpark EMI** vs a **starting salary you type**, plus **scholarship direction** and **bank-conversation** pointers—explicitly **not** financial advice.

**When to use it**

- You are weighing **education loans** and want a **reality sizing** before speaking to banks.
- After ROI Bridge, to translate “total cost” into **monthly repayment feel**.

**Use cases**

- Parent–student negotiation: “Can we responsibly consider this EMI if starting pay looks like X?”
- Checking whether **loan size** passes a basic sniff test against starter salaries.

**Benefits**

- **Reads `career` from merged journey** on load when present—continuity from Salary or ROI.
- Footer links back to ROI, Salary, Parent FAQ with consistent `from=financing`.

---

### 6. Exam Roadmap Builder

| | |
|---|---|
| **Entry** | `Tools/pehchaan_exam_roadmap.html` (and/or `Tools/pehchaan_exam_roadmap/index.html`—verify relative paths if you duplicate entry points) |
| **Data** | `DB/pehchaan_exam_data.json` + registry |
| **Homepage chip** | For students preparing exam strategies |

**What it does**

- Produces a **personalised exam calendar**: phases, key deadlines, and **next-step** style guidance from **class, stream, state, and target career**—always to be verified on **official** portals.

**When to use it**

- You know a **target career or exam family** and need a **timeline scaffold**.
- After stream or career shortlist, to see **what exams matter** and when.

**Use cases**

- Class 11–12 planning for national and state-relevant exams.
- Course correction: adding a **parallel exam** without losing the main plan.

**Benefits**

- **`class`, `state`, `stream`, `career`** can be prefilled from URLs or session.
- After “Build my roadmap”, journey passes **`career`** (comma-separated ids when multiple) into Salary, ROI, Plan B, Skill Gap.

---

### 7. Plan B Strategy Builder

| | |
|---|---|
| **Entry** | `Tools/pehchaan_plan_b_strategy_builder.html` |
| **Data** | `DB/pehchaan_plan_b_strategy_builder_data.json` + registry |
| **Homepage chip** | For aspirants who want jobs, college backups, or course ladders—not guesswork |

**What it does**

Multi-track planning (awareness only; verify officially):

- **Jobs & income**: exam choice → prep-as-skills, **parallel roles**, typical pay bands, **copyable first step**.
- **Colleges**: national counselling-style ladders and **state-comfort** backups (domicile-aware framing).
- **Courses**: **horizontal degree ladders** toward a similar job family.

**When to use it**

- You are **exam-centric** and want **income and identity** if results disappoint.
- You need **backup ladders** before counselling windows close.

**Use cases**

- JEE / NEET / CUET-style paths with **explicit Plan B**.
- Commerce / professional exams with **multiple institution tiers**.

**Benefits**

- **Inbound**: `exam` selects an exam row; `career` resolves via registry; `roiBand` optional from ROI.
- Uses **`pehchaan_journey.js`** for session continuity; does **not** load `pehchaan_tool_links.js` (still receives deep links from other tools).

---

### 8. Skill Gap Analyser

| | |
|---|---|
| **Entry** | `Tools/pehchaan_skill_gap_analyser.html` |
| **Data** | `DB/pehchaan_skill_gap_analyser_data.json` + registry |
| **Homepage chip** | For learners targeting a specific role |

**What it does**

- Pick a **target job family**, tick what you already know, receive a **gap heatmap**, curated **learning resources**, practice ideas, and a **phased timeline** toward employability—not a hiring guarantee.

**When to use it**

- You have a **target role** (from Salary, mentorship, or internships) and need a **study plan**.
- College student **pivoting** toward placements.

**Use cases**

- “I’m in semester X; what skills should I prioritise before recruitments?”
- Self-taught learners mapping **courses + projects**.

**Benefits**

- **Inbound**: `job` or `career` (canonical / token resolved via registry).
- Loads **`pehchaan_journey.js`** only; deep-linked from Salary / ROI / Exam Roadmap when registry maps `skill_gap_job_id`.

---

### 8A. College Finder

| | |
|---|---|
| **Entry** | `Tools/pehchaan_college_finder.html` |
| **Data** | `DB/pehchaan_college_registry.json` + `DB/pehchaan_college_registry_indexes.json` |
| **Homepage chip** | For students comparing specific colleges by stream and course |

**What it does**

- Lets students pick **geography lens, state, stream, and exact course** to discover colleges with structured context (courses, admission exam hints, rationale, official links).

**When to use it**

- You already know your **stream + course target** and want state-wise options.
- You want a **neighbour-state backup list** when the exact course is unavailable in your chosen state.

**Use cases**

- Counselling preparation where families need a shortlist before seat rounds.
- Parallel planning for national vs state-comfort options.

**Benefits**

- No dead-end responses: resolver always attempts exact -> neighbour -> national.
- Uses the same registry model that Plan B college mode now consumes.

---

### 9. Mentor Connect

| | |
|---|---|
| **Entry** | `Tools/pehchaan_mentor_connect.html` |
| **Data** | `DB/pehchaan_mentor_connect_config.json` |
| **Homepage chip** | For students who need proof, not noise |

**What it does**

- Search-style flow to **find professionals** linked to roles or companies you aim for—grounded in **place and credibility signals**—with **respectful draft outreach** you can paste into LinkedIn or email (you send it; the tool does not auto-message).

**When to use it**

- You want **human proof** that a path is viable from someone with a **similar background**.
- You are ready for **one real networking step**, not passive scrolling.

**Use cases**

- “Has anyone from my city made it to role X?”
- Turning ambition into **one concrete DM** after interviews or rejections.

**Benefits**

- Reduces blank-page paralysis with **ethical, student-owned** drafts.
- Post-results strip to Salary, Plan B, Parent FAQ (`from=mentor`).

---

### 10. Parent’s Guide (FAQ)

| | |
|---|---|
| **Entry (static export)** | `Tools/parents-guide/index.html` |
| **Source app** | `parent-faq/` (Next.js — see `parent-faq/AGENTS.md`) |
| **Homepage chip** | For parents & families |

**What it does**

- Large set of **short answers** (English / Hinglish) on marks, institutional choices, money, exams, anxiety, and stigma—**fuzzy search** tuned to how parents actually type questions.

**When to use it**

- **Parents** onboarding late to career conversations.
- **Students** sharing one link so family hears **neutral, sane** framing.

**Use cases**

- “Sarkari vs private”, local jobs, low marks—without hour-long counselling.

**Benefits**

- **Fast retrieval** vs blogs or random groups.
- Linked from ROI / Financing / Mentor flows for **family alignment**.

**Maintainer note**

- Prefer edits in **`parent-faq/`** then rebuild/export so **Pehchaan tool chrome** and footers stay aligned with `parent-faq/components/PehchaanToolChrome.tsx`.

---

## Choosing a tool in one minute

| I need… | Start with |
|---------|------------|
| “What fits my personality/interests?” | Career Assessment |
| “Science vs Commerce vs Arts?” | Stream Advisor |
| “Rough pay across options?” | Salary Explorer |
| “Total cost vs payback intuition?” | Career ROI & Reality Bridge |
| “EMI vs starting salary?” | Financing & EMI Reality |
| “What exams and when?” | Exam Roadmap Builder |
| “If Plan A fails, what do I do?” | Plan B Strategy Builder |
| “Which colleges offer my course in my state?” | College Finder |
| “What to learn for this job?” | Skill Gap Analyser |
| “Talk to someone who did it?” | Mentor Connect |
| “Help my parents understand?” | Parent’s Guide |

---

## Technical pointer (for builders)

- **Registry**: `DB/pehchaan_career_registry.json` maps canonical career ids to tool-specific ids (salary, ROI, exam roadmap, Plan B exam, skill gap job).
- **Handoffs**: [`docs/tool-integration.md`](tool-integration.md) — query keys, emitters, and validation script `node scripts/validate-tool-integration.cjs`.
- **Brand / QA**: `.cursorrules` — taglines, colours, tool chrome, footers, disclaimer wording.

---

*Document version: aligned with repository structure and `index.html` tool grid as of authoring; if tool names or copy change on the homepage, update this file in the same PR.*
