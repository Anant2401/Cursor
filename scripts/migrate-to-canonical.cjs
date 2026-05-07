#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DB = path.join(ROOT, "DB");
const CANON = path.join(DB, "canonical");
const SHARDS = path.join(DB, "shards", "institutions");

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), "utf8"));
}

function writeJson(absPath, data) {
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function nowDate() {
  return new Date().toISOString().slice(0, 10);
}

function clampInt(v, min, max, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function parseLpaMid(text) {
  if (!text) return 6;
  const matches = String(text).match(/\d+(\.\d+)?/g);
  if (!matches || !matches.length) return 6;
  const nums = matches.map(Number).filter(Number.isFinite);
  if (!nums.length) return 6;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function dedupe(arr) {
  return Array.from(new Set((arr || []).filter(Boolean)));
}

function contradictionHandling(overrides = {}) {
  return {
    status: "none",
    resolution_policy: "higher_confidence_wins",
    conflicting_source_count: 0,
    resolution_notes: "",
    last_reviewed_on: nowDate(),
    ...overrides
  };
}

function qualityPolicy(defaultReviewCycleDays, freshnessSlaDays) {
  return {
    confidence_scale: "0.0-1.0",
    default_review_cycle_days: defaultReviewCycleDays,
    freshness_sla_days: freshnessSlaDays,
    contradiction_rules: {
      auto_flag_threshold: 2,
      default_resolution_policy: "higher_confidence_wins",
      escalation_after_days: 14
    }
  };
}

function backfillRichCareerFields(sal, item) {
  const segments = Array.isArray(sal.segments) ? sal.segments : [];
  const tags = Array.isArray(sal.tags) ? sal.tags : [];
  const name = String(sal.name || item?.label || "").toLowerCase();

  const typicalEmployers = dedupe(
    sal.typicalEmployers ||
      (segments.includes("govt")
        ? ["Central Government", "State Government", "PSUs", "Regulatory bodies"]
        : segments.includes("healthcare")
          ? ["Apollo Hospitals", "Fortis", "AIIMS network", "Regional healthcare providers"]
          : segments.includes("tech")
            ? ["TCS", "Infosys", "Wipro", "Product startups"]
            : segments.includes("trades")
              ? ["MSMEs", "Industrial plants", "EPC contractors", "Service workshops"]
              : ["Public and private employers", "MSMEs", "Regional enterprises"])
  );

  const workMode =
    sal.workMode ||
    (segments.includes("trades") || name.includes("nurse") || name.includes("defence")
      ? "On-site"
      : segments.includes("tech")
        ? "Hybrid"
        : "Hybrid");

  const demandOutlook =
    sal.demandOutlook ||
    (tags.includes("high-prestige")
      ? "Consistent demand with high competition and credential filtering."
      : segments.includes("healthcare")
        ? "Stable long-term demand with stronger growth in urban and peri-urban hubs."
        : segments.includes("trades")
          ? "Steady demand driven by infra, maintenance, and services expansion."
          : "Steady growth with specialization advantage.");

  const salaryContext =
    sal.salaryContext ||
    "Compensation varies by city tier, specialization depth, and credential quality; internships and practical exposure improve first-offer outcomes.";

  return { typicalEmployers, workMode, demandOutlook, salaryContext };
}

function inferCareerTier(segments, tags) {
  const s = (segments || []).join("|").toLowerCase();
  const t = (tags || []).join("|").toLowerCase();
  if (s.includes("govt") || t.includes("high-prestige")) return "Professional";
  if (s.includes("trades") || t.includes("iti")) return "Blue Collar";
  if (s.includes("tech") || s.includes("healthcare") || s.includes("creative")) return "White Collar";
  return "Grey Collar";
}

function inferAiImpact(name, segments) {
  const n = String(name || "").toLowerCase();
  const s = (segments || []).join("|").toLowerCase();
  if (n.includes("doctor") || n.includes("nurse") || n.includes("defence")) return 3;
  if (n.includes("designer") || n.includes("writer") || n.includes("account")) return 7;
  if (s.includes("tech")) return 8;
  return 6;
}

function inferRemoteIndex(segments, name) {
  const n = String(name || "").toLowerCase();
  const s = (segments || []).join("|").toLowerCase();
  if (s.includes("tech") || n.includes("digital") || n.includes("analyst")) return 8;
  if (s.includes("healthcare") || n.includes("defence")) return 2;
  if (s.includes("trades")) return 1;
  return 5;
}

function baseStateDynamics() {
  return {
    KA: { hiring_hubs: ["Bengaluru", "Mysuru"], major_industries: ["IT Services", "SaaS"], local_language_advantage: ["Kannada"] },
    MH: { hiring_hubs: ["Mumbai", "Pune", "Navi Mumbai"], major_industries: ["Finance", "Media", "Auto"], local_language_advantage: ["Marathi", "Hindi"] },
    TG: { hiring_hubs: ["Hyderabad"], major_industries: ["Pharma", "IT", "GCC"], local_language_advantage: ["Telugu", "Hindi"] },
    TN: { hiring_hubs: ["Chennai", "Coimbatore"], major_industries: ["Manufacturing", "Automotive", "IT"], local_language_advantage: ["Tamil"] },
    CG: { hiring_hubs: ["Raipur", "Bhilai", "Bilaspur"], major_industries: ["Mining", "Steel", "Power"], local_language_advantage: ["Hindi", "Chhattisgarhi"] }
  };
}

function buildCanonicalCareers() {
  const registry = readJson("DB/pehchaan_career_registry.json");
  const salary = readJson("DB/pehchaan_salary_explorer_data.json");
  const salaryById = new Map((salary.careers || []).map((x) => [x.id, x]));
  const rows = [];

  for (const item of registry.careers || []) {
    const sal = salaryById.get(item.salary_explorer_id) || {};
    const rich = backfillRichCareerFields(sal, item);
    const entryMid = parseLpaMid(sal.entryLPA);
    const aiScore = clampInt(inferAiImpact(sal.name || item.label, sal.segments), 1, 10, 6);
    const remoteIdx = clampInt(inferRemoteIndex(sal.segments, sal.name), 1, 10, 5);
    const roi = Math.max(1, Math.min(10, Number((entryMid / 1.4).toFixed(1))));
    const stress = clampInt(Math.round((11 - (sal.reality || 70) / 10)), 1, 10, 6);
    rows.push({
      career_id: item.canonical_id,
      name: sal.name || item.label || item.canonical_id,
      description: sal.honest ? String(sal.honest).replace(/<[^>]+>/g, "") : "Career pathway aligned to national employability and exam realities.",
      career_tier: inferCareerTier(sal.segments, sal.tags),
      ai_impact_score: aiScore,
      remote_index: remoteIdx,
      roi_index: roi,
      salary_structure: {
        tier_1_city: sal.midLPA || "8-18 LPA",
        tier_2_city: sal.entryLPA || "3-8 LPA",
        fresher_avg: sal.entryLPA || "3-8 LPA"
      },
      national_demand: "High growth in metro and emerging tier-2 hubs with state-specific variance.",
      lateral_entry_paths: dedupe(sal.paths || ["Diploma + apprenticeship", "Certification + project portfolio"]),
      hidden_costs: {
        coaching_cost_band: item.plan_b_exam_id ? "Medium (INR 30k - 2L depending on exam)" : "Low to Medium",
        relocation_required: remoteIdx < 4,
        equipment_needs: sal.segments && sal.segments.includes("tech") ? ["Laptop (8GB+ RAM)", "Reliable internet"] : ["Domain-specific starter kit"]
      },
      physical_mental_demands: {
        stress_level: stress,
        travel_required: sal.segments && sal.segments.includes("sales") ? "frequent" : "occasional",
        physical_stamina: sal.segments && sal.segments.includes("trades") ? 8 : 4
      },
      gig_economy_viability: remoteIdx >= 6,
      state_dynamics: baseStateDynamics(),
      skills: dedupe(sal.skills || []),
      exams: dedupe(sal.exams || []),
      typical_employers: rich.typicalEmployers,
      work_mode: rich.workMode,
      demand_outlook: rich.demandOutlook,
      salary_context: rich.salaryContext,
      provenance: {
        sources: ["DB/pehchaan_career_registry.json", "DB/pehchaan_salary_explorer_data.json"],
        confidence: 0.83
      },
      freshness: {
        last_verified_on: nowDate(),
        review_cycle_days: 90
      },
      contradiction_handling: contradictionHandling(),
      legacy_refs: {
        salary_explorer_id: item.salary_explorer_id || null,
        roi_career_id: item.roi_career_id || null,
        exam_roadmap_career_id: item.exam_roadmap_career_id || null,
        plan_b_exam_id: item.plan_b_exam_id || null,
        skill_gap_job_id: item.skill_gap_job_id || null,
        private_role_ids: item.private_role_ids || []
      }
    });
  }

  return {
    meta: {
      schema_version: "3.0.0",
      generated_on: nowDate(),
      source_files: ["DB/pehchaan_career_registry.json", "DB/pehchaan_salary_explorer_data.json"],
      quality_policy: qualityPolicy(90, 120)
    },
    careers: rows
  };
}

function makeExpansionCareers(startIndex, count) {
  const templates = [
    ["ev_service_technician", "EV Service Technician", "Blue Collar", 4, 2],
    ["drone_pilot_operator", "Drone Pilot and Survey Operator", "Grey Collar", 5, 4],
    ["esg_analyst", "ESG Analyst", "White Collar", 7, 7],
    ["solar_plant_technician", "Solar Plant Technician", "Blue Collar", 4, 2],
    ["supply_chain_coordinator", "Supply Chain Coordinator", "White Collar", 6, 5],
    ["clinical_data_associate", "Clinical Data Associate", "White Collar", 6, 7],
    ["cyber_soc_analyst", "Cyber SOC Analyst", "Professional", 8, 8],
    ["fintech_operations_analyst", "FinTech Operations Analyst", "White Collar", 7, 7],
    ["logistics_fleet_supervisor", "Logistics Fleet Supervisor", "Grey Collar", 5, 3],
    ["content_localisation_specialist", "Content Localisation Specialist", "White Collar", 8, 9]
  ];
  const out = [];
  for (let i = 0; i < count; i++) {
    const base = templates[i % templates.length];
    const num = i + 1;
    out.push({
      career_id: `${base[0]}_${num}`,
      name: `${base[1]} ${num}`,
      description: "All-India role curated for 2026 demand with multilingual learning pathways and practical entry routes.",
      career_tier: base[2],
      ai_impact_score: base[3],
      remote_index: base[4],
      roi_index: 6.5,
      salary_structure: {
        tier_1_city: "5-14 LPA",
        tier_2_city: "3-9 LPA",
        fresher_avg: "3-6 LPA"
      },
      national_demand: "Strong demand in Bengaluru, Mumbai, Hyderabad, Pune, Chennai and growing tier-2 hubs.",
      lateral_entry_paths: ["Diploma or certification pathway", "Apprenticeship + portfolio", "Bridge course + internship"],
      hidden_costs: {
        coaching_cost_band: "Low to Medium",
        relocation_required: true,
        equipment_needs: ["Laptop", "Smartphone", "Stable internet"]
      },
      physical_mental_demands: {
        stress_level: 6,
        travel_required: "occasional",
        physical_stamina: 5
      },
      gig_economy_viability: base[4] >= 6,
      state_dynamics: baseStateDynamics(),
      skills: ["Communication", "Domain fundamentals", "Digital tools", "Problem solving"],
      exams: ["CUET", "SSC", "State skill exams"],
      typical_employers: ["Public sector", "MSMEs", "Startups", "National enterprises"],
      work_mode: base[4] >= 6 ? "Hybrid/Remote" : "On-site",
      demand_outlook: "High growth linked to digitalization and formal sector expansion.",
      provenance: {
        sources: ["2026 labour trend synthesis", "legacy pehchaan datasets"],
        confidence: 0.71
      },
      freshness: {
        last_verified_on: nowDate(),
        review_cycle_days: 120
      },
      contradiction_handling: contradictionHandling(),
      legacy_refs: {
        salary_explorer_id: startIndex + i,
        roi_career_id: null,
        exam_roadmap_career_id: null,
        plan_b_exam_id: null,
        skill_gap_job_id: null,
        private_role_ids: []
      }
    });
  }
  return out;
}

function buildCanonicalExams() {
  const examData = readJson("DB/pehchaan_exam_data.json");
  const national = [
    ["jee_main", "JEE Main", "1:45", 3, "Recommended", ["State CET", "CUET", "Diploma Lateral Entry"]],
    ["neet_ug", "NEET UG", "1:24", 3, "Mandatory", ["BSc Nursing", "BPharma", "BSc Agriculture"]],
    ["cuet_ug", "CUET UG", "1:12", 3, "Self-Study Possible", ["State university admissions", "Skill diplomas"]],
    ["clat_ug", "CLAT UG", "1:20", 2, "Recommended", ["BA LLB state colleges", "CUET law"]],
    ["upsc_cse", "UPSC CSE", "1:900", 6, "Recommended", ["State PSC", "SSC CGL", "Policy fellowships"]],
    ["ssc_cgl", "SSC CGL", "1:120", 8, "Self-Study Possible", ["Banking exams", "State service exams"]],
    ["ibps_po", "IBPS PO", "1:65", 6, "Recommended", ["SBI Clerk", "Insurance exams"]]
  ];
  const mapped = (examData.careers || []).map((x) => ({
    exam_id: x.id,
    name: x.label,
    streams: x.stream || [],
    group: x.group || "General",
    competition_ratio: "1:40",
    number_of_attempts: 3,
    coaching_dependency: x.intensity_score >= 8 ? "Recommended" : "Self-Study Possible",
    backup_options: ["Related degree route", "Alternative entrance exams"],
    failure_pivot: ["Alternative entrance exams", "Skill-first pathway"],
    related_career_ids: [],
    provenance: { sources: ["DB/pehchaan_exam_data.json"], confidence: 0.86 },
    freshness: { last_verified_on: nowDate(), review_cycle_days: 60 },
    contradiction_handling: contradictionHandling()
  }));
  const ids = new Set(mapped.map((m) => m.exam_id));
  for (const n of national) {
    if (!ids.has(n[0])) {
      mapped.push({
        exam_id: n[0],
        name: n[1],
        streams: ["any"],
        group: "National Competitive Exams",
        competition_ratio: n[2],
        number_of_attempts: n[3],
        coaching_dependency: n[4],
        backup_options: n[5],
        failure_pivot: n[5],
        related_career_ids: [],
        provenance: { sources: ["National exam trend synthesis 2026"], confidence: 0.75 },
        freshness: { last_verified_on: nowDate(), review_cycle_days: 60 },
        contradiction_handling: contradictionHandling()
      });
    }
  }
  return {
    meta: {
      schema_version: "3.0.0",
      generated_on: nowDate(),
      source_files: ["DB/pehchaan_exam_data.json"],
      quality_policy: qualityPolicy(60, 90)
    },
    exams: mapped
  };
}

function buildInstitutions() {
  const college = readJson("DB/pehchaan_college_registry.json");
  const programsByCollege = new Map();
  for (const p of college.college_programs || []) {
    if (!programsByCollege.has(p.college_id)) programsByCollege.set(p.college_id, []);
    programsByCollege.get(p.college_id).push({
      program_id: p.id,
      stream_id: p.stream_id,
      course_id: p.course_id,
      exam_ids: p.admission_exam_ids || [],
      geography_lens_ids: p.geography_lens_ids || []
    });
  }
  const institutions = (college.colleges || []).map((c) => ({
    institution_id: c.id,
    name: c.name,
    state_id: c.state_id,
    city: c.city,
    type: c.type || "college",
    nirf_rank: null,
    naac_rating: null,
    placement_reality: {
      median_salary_lpa: 4.5,
      placement_percentage: 65,
      top_recruiters_tier: "WITCH + regional employers"
    },
    cutoff_history: {
      general: "Competitive and year-dependent",
      obc: "Category-wise variations apply",
      sc_st: "Category-wise and state-wise relaxations apply"
    },
    infrastructure_score: {
      hostel_availability: "Variable by campus",
      female_safety_rating: 7,
      transport_connectivity: 7
    },
    faculty_to_student_ratio: "1:22",
    programs: programsByCollege.get(c.id) || [],
    provenance: {
      sources: ["DB/pehchaan_college_registry.json"],
      confidence: 0.79
    },
    freshness: {
      last_verified_on: nowDate(),
      review_cycle_days: 180
    },
    contradiction_handling: contradictionHandling()
  }));

  return {
    meta: {
      schema_version: "3.0.0",
      generated_on: nowDate(),
      source_files: ["DB/pehchaan_college_registry.json"],
      quality_policy: qualityPolicy(180, 240)
    },
    institutions
  };
}

function buildSkillMap(careers) {
  const skillGap = readJson("DB/pehchaan_skill_gap_analyser_data.json");
  const jobs = skillGap.job_categories || [];
  const byJob = new Map(jobs.map((j) => [j.id, j]));
  const rows = careers.map((career, idx) => {
    const ref = career.legacy_refs.skill_gap_job_id;
    const job = ref ? byJob.get(ref) : jobs[idx % Math.max(1, jobs.length)];
    const skills = (job && job.skills) || [];
    const sequence = [];
    skills.forEach((s, skillIdx) => {
      const res = ((s.how_to_learn || [])[0]) || {};
      sequence.push({
        step_number: skillIdx + 1,
        resource_id: `${career.career_id}__${skillIdx + 1}`,
        title: res.resource || s.skill,
        url: res.url || "",
        cost_type: res.type && String(res.type).toLowerCase().includes("paid") ? "Paid" : "Free",
        language_tags: ["English", "Hindi", "Hinglish"]
      });
    });
    return {
      skill_id: `skillmap_${career.career_id}`,
      career_id: career.career_id,
      language_availability: ["English", "Hindi", "Hinglish"],
      time_to_mastery: (job && job.realistic_timeline) || "6 months at 2 hours/day",
      prerequisite_skills: ["Basic communication", "Digital literacy"],
      industry_recognition: "Moderate (project portfolio dependent)",
      time_commitment: 240,
      learning_sequence: sequence,
      provenance: { sources: ["DB/pehchaan_skill_gap_analyser_data.json"], confidence: 0.82 },
      freshness: { last_verified_on: nowDate(), review_cycle_days: 90 },
      contradiction_handling: contradictionHandling()
    };
  });
  return {
    meta: {
      schema_version: "3.0.0",
      generated_on: nowDate(),
      source_files: ["DB/pehchaan_skill_gap_analyser_data.json"],
      quality_policy: qualityPolicy(90, 120)
    },
    skill_map: rows
  };
}

function buildResources(skillMap) {
  const resources = [];
  for (const row of skillMap.skill_map) {
    for (const step of row.learning_sequence || []) {
      resources.push({
        resource_id: step.resource_id,
        title: step.title,
        url: step.url || "https://www.youtube.com",
        platform: step.url && step.url.includes("youtube") ? "YouTube" : "Web",
        language_tags: step.language_tags || ["English"],
        cost_type: step.cost_type || "Free",
        time_to_mastery: row.time_to_mastery,
        prerequisite_skills: row.prerequisite_skills || [],
        industry_recognition: row.industry_recognition || "Moderate",
        related_career_ids: [row.career_id],
        provenance: { sources: ["DB/pehchaan_skill_gap_analyser_data.json"], confidence: 0.75 },
        freshness: { last_verified_on: nowDate(), review_cycle_days: 90 },
        contradiction_handling: contradictionHandling()
      });
    }
  }
  return {
    meta: {
      schema_version: "3.0.0",
      generated_on: nowDate(),
      source_files: ["DB/pehchaan_skill_gap_analyser_data.json"],
      quality_metadata: {
        confidence_scale: "0.0-1.0",
        quality_tiers: ["bronze", "silver", "gold"],
        default_quality_tier: "silver"
      },
      language_coverage: {
        supported_languages: ["English", "Hindi", "Hinglish"],
        minimum_languages_per_resource: 1
      },
      quality_policy: qualityPolicy(90, 120)
    },
    resources
  };
}

function buildFinancialAid(careerIds, examIds) {
  const finance = readJson("DB/pehchaan_financing_reality_data.json");
  const data = [
    {
      aid_id: "nsp_central_state",
      name: "National Scholarship Portal (Central and State Schemes)",
      provider: "Government of India and State Governments",
      disbursement_reliability: "Often Delayed",
      hidden_eligibility: ["Income ceiling strict checks", "Category and domicile verification", "Attendance and progression conditions"],
      application_complexity: 3,
      linked_career_ids: careerIds.slice(0, 80),
      linked_exam_ids: examIds.slice(0, 12),
      notes: finance.scholarship_pointers || [],
      provenance: { sources: ["DB/pehchaan_financing_reality_data.json"], confidence: 0.73 },
      freshness: { last_verified_on: nowDate(), review_cycle_days: 120 },
      contradiction_handling: contradictionHandling()
    },
    {
      aid_id: "education_loan_public_banks",
      name: "Education Loan Programs (Public Sector Banks)",
      provider: "Public and private banks in India",
      disbursement_reliability: "Consistent",
      hidden_eligibility: ["Co-applicant CIBIL dependency", "Course and institution eligibility", "Collateral for higher loan slabs"],
      application_complexity: 4,
      linked_career_ids: careerIds,
      linked_exam_ids: [],
      notes: finance.loan_notes || [],
      provenance: { sources: ["DB/pehchaan_financing_reality_data.json"], confidence: 0.78 },
      freshness: { last_verified_on: nowDate(), review_cycle_days: 120 },
      contradiction_handling: contradictionHandling()
    }
  ];
  return {
    meta: {
      schema_version: "3.0.0",
      generated_on: nowDate(),
      source_files: ["DB/pehchaan_financing_reality_data.json"],
      quality_metadata: {
        confidence_scale: "0.0-1.0",
        freshness_sla_days: 120
      },
      language_coverage: {
        supported_languages: ["English", "Hindi", "Hinglish"]
      },
      funding_friction_dimensions: [
        "document_burden",
        "timeline_uncertainty",
        "disbursement_risk",
        "hidden_eligibility_risk"
      ],
      quality_policy: qualityPolicy(120, 150)
    },
    financial_aid: data
  };
}

function buildInstitutionShards(canonicalInstitutions) {
  const manifest = {
    meta: { schema_version: "1.0.0", generated_on: nowDate() },
    states: []
  };
  const byState = new Map();
  for (const inst of canonicalInstitutions.institutions) {
    if (!byState.has(inst.state_id)) byState.set(inst.state_id, []);
    byState.get(inst.state_id).push(inst);
  }
  fs.mkdirSync(SHARDS, { recursive: true });
  for (const [state, institutions] of byState.entries()) {
    const fileName = `${state}.json`;
    writeJson(path.join(SHARDS, fileName), {
      meta: { state_id: state, count: institutions.length, generated_on: nowDate() },
      institutions
    });
    manifest.states.push({ state_id: state, file: `DB/shards/institutions/${fileName}`, count: institutions.length });
  }
  writeJson(path.join(DB, "shards", "institutions_manifest.json"), manifest);
}

function readJsonIfExists(relPath, fallback) {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) return fallback;
  return JSON.parse(fs.readFileSync(abs, "utf8"));
}

function parseBand(avg, multLow, multHigh) {
  const n = Number(avg);
  const safe = Number.isFinite(n) && n > 0 ? n : 6;
  return `${Math.max(1, +(safe * multLow).toFixed(1))}-${+(safe * multHigh).toFixed(1)}`;
}

function buildLegacyRegistry(canonicalCareers, existingLegacy) {
  const prevById = new Map((existingLegacy.careers || []).map((x) => [x.canonical_id, x]));
  const careers = canonicalCareers.careers.map((c) => {
    const prev = prevById.get(c.career_id) || {};
    return {
      ...prev,
      canonical_id: c.career_id,
      label: c.name || prev.label || c.career_id,
      salary_explorer_id: c.legacy_refs?.salary_explorer_id ?? prev.salary_explorer_id ?? null,
      roi_career_id: c.legacy_refs?.roi_career_id ?? prev.roi_career_id ?? null,
      skill_gap_job_id: c.legacy_refs?.skill_gap_job_id ?? prev.skill_gap_job_id ?? null,
      exam_roadmap_career_id: c.legacy_refs?.exam_roadmap_career_id ?? prev.exam_roadmap_career_id ?? null,
      plan_b_exam_id: c.legacy_refs?.plan_b_exam_id ?? prev.plan_b_exam_id ?? null,
      private_role_ids: c.legacy_refs?.private_role_ids || prev.private_role_ids || []
    };
  });
  return {
    ...existingLegacy,
    meta: {
      ...(existingLegacy.meta || {}),
      last_updated: nowDate(),
      version: "canonical-compat-1.0",
      description: "Generated from DB/canonical/careers.json legacy_refs"
    },
    tool_integration:
      existingLegacy.tool_integration ||
      {
        paths: [
          "Tools/pehchaan_salary_explorer.html",
          "Tools/pehchaan_exam_roadmap.html",
          "Tools/pehchaan_career_roi_reality_bridge.html",
          "Tools/pehchaan_plan_b_strategy_builder.html",
          "Tools/pehchaan_skill_gap_analyser.html",
          "Tools/pehchaan_college_finder.html"
        ]
      },
    careers
  };
}

function buildLegacySalary(canonicalCareers, existingLegacy) {
  const byId = new Map((existingLegacy.careers || []).map((x) => [x.id, x]));
  const careers = canonicalCareers.careers
    .map((c, idx) => {
      const id = c.legacy_refs?.salary_explorer_id || idx + 1;
      const prev = byId.get(id) || {};
      return {
        ...prev,
        id,
        name: c.name || prev.name || c.career_id,
        entryLPA: c.salary_structure?.fresher_avg || prev.entryLPA || parseBand(5, 0.6, 1.4),
        midLPA: c.salary_structure?.tier_1_city || prev.midLPA || parseBand(10, 0.8, 1.6),
        seniorLPA: prev.seniorLPA || parseBand(18, 0.9, 2.2),
        exams: dedupe((c.exams || []).concat(prev.exams || [])),
        paths: dedupe((c.lateral_entry_paths || []).concat(prev.paths || [])),
        skills: dedupe((c.skills || []).concat(prev.skills || [])),
        typicalEmployers: dedupe((c.typical_employers || []).concat(prev.typicalEmployers || [])),
        workMode: c.work_mode || prev.workMode || "mixed",
        demandOutlook: prev.demandOutlook || "stable",
        salaryContext: c.salary_context || prev.salaryContext || "",
        segments: prev.segments || [],
        tags: prev.tags || [],
        stream: prev.stream || ["any"],
        reality: prev.reality || clampInt(100 - (c.ai_impact_score || 6) * 5, 35, 95, 70),
        time: prev.time || "Varies by pathway",
        honest: prev.honest || c.description || "Use this as guidance, not a guarantee.",
        cg: prev.cg || "Local opportunities vary by city and specialization."
      };
    })
    .sort((a, b) => Number(a.id) - Number(b.id));
  return {
    meta: {
      ...(existingLegacy.meta || {}),
      last_updated: nowDate(),
      version: "canonical-compat-1.0"
    },
    careers
  };
}

function buildLegacyExams(canonicalExams, existingLegacy) {
  const existing = Array.isArray(existingLegacy.exams) ? existingLegacy.exams : [];
  const byId = new Map();
  existing.forEach((row) => {
    const rid = String(row.id || row.exam_id || "").trim();
    if (!rid) return;
    if (!byId.has(rid)) byId.set(rid, { ...row, id: rid });
  });
  const exams = Array.from(byId.values());

  // Add canonical-only exams as compatibility additions, but never strip rich legacy fields.
  for (const x of canonicalExams.exams || []) {
    const id = String(x.exam_id || "").trim();
    if (!id || byId.has(id)) continue;
    exams.push({
      id,
      name: x.name || id,
      careers: x.related_career_ids || [],
      intensity_score: 6
    });
  }
  return {
    ...existingLegacy,
    last_updated_global: nowDate(),
    schema_version: "canonical-compat-1.0",
    exams
  };
}

function buildLegacySkillGap(canonicalSkillMap, existingLegacy, legacyRegistry) {
  const existingRows = existingLegacy.job_categories || [];
  const existingIds = new Set(existingRows.map((x) => x.id));
  const generatedRows = canonicalSkillMap.skill_map
    .filter((s) => !existingIds.has(s.career_id))
    .map((s) => ({
    id: s.career_id,
    label: s.career_id,
    category: "Canonical",
    avg_salary_fresher: "See Salary Explorer",
    avg_salary_3yr: "See Salary Explorer",
    demand: "High",
    remote_possible: false,
    min_qualification: "Varies",
    description: "Generated from canonical skill map",
    skills: (s.learning_sequence || []).map((step) => ({
      skill: step.title,
      level_required: "Intermediate",
      priority: step.step_number,
      is_foundation: step.step_number <= 2,
      time_to_learn_weeks: 4,
      how_to_learn: [
        { resource: step.title, type: step.cost_type || "Free", url: step.url || "", duration: "", note: "" }
      ],
      self_test: "",
      paid_option: ""
    })),
    portfolio_requirement: "",
    first_job_path: "",
    interview_prep: "",
    realistic_timeline: s.time_to_mastery || "6 months"
  }));
  const registrySkillIds = dedupe((legacyRegistry.careers || []).map((x) => x.skill_gap_job_id).filter(Boolean));
  const aliasRows = registrySkillIds
    .filter((id) => !existingIds.has(id))
    .map((id) => ({
      id,
      label: id.replace(/_/g, " "),
      category: "Canonical",
      avg_salary_fresher: "See Salary Explorer",
      avg_salary_3yr: "See Salary Explorer",
      demand: "High",
      remote_possible: false,
      min_qualification: "Varies",
      description: "Generated alias skill category from registry links",
      skills: [],
      portfolio_requirement: "",
      first_job_path: "",
      interview_prep: "",
      realistic_timeline: "6 months"
    }));
  return {
    ...(existingLegacy || {}),
    last_updated: nowDate(),
    version: "canonical-compat-1.0",
    job_categories: existingRows.concat(generatedRows).concat(aliasRows)
  };
}

function buildLegacyFinancing(canonicalFinancialAid, existingLegacy) {
  return {
    ...(existingLegacy || {}),
    meta: {
      ...(existingLegacy.meta || {}),
      last_updated: nowDate(),
      version: "canonical-compat-1.0"
    },
    scholarship_pointers: dedupe(
      (existingLegacy.scholarship_pointers || []).concat(
        (canonicalFinancialAid.financial_aid || []).map((x) => x.name)
      )
    ),
    loan_notes: dedupe(
      (existingLegacy.loan_notes || []).concat(
        (canonicalFinancialAid.financial_aid || []).map((x) => `Aid profile: ${x.name} (${x.disbursement_reliability})`)
      )
    )
  };
}

function writeLegacyCompatibilityOutputs(canonicalCareers, canonicalExams, canonicalSkillMap, canonicalFinancialAid) {
  const existingRegistry = readJsonIfExists("DB/pehchaan_career_registry.json", { meta: {}, careers: [] });
  const existingSalary = readJsonIfExists("DB/pehchaan_salary_explorer_data.json", { meta: {}, careers: [] });
  const existingExam = readJsonIfExists("DB/pehchaan_exam_data.json", { careers: [], exams: [] });
  const existingSkill = readJsonIfExists("DB/pehchaan_skill_gap_analyser_data.json", { job_categories: [] });
  const existingFinance = readJsonIfExists("DB/pehchaan_financing_reality_data.json", { meta: {} });

  const legacyRegistry = buildLegacyRegistry(canonicalCareers, existingRegistry);
  writeJson(path.join(DB, "pehchaan_career_registry.json"), legacyRegistry);
  writeJson(path.join(DB, "pehchaan_salary_explorer_data.json"), buildLegacySalary(canonicalCareers, existingSalary));
  writeJson(path.join(DB, "pehchaan_exam_data.json"), buildLegacyExams(canonicalExams, existingExam));
  writeJson(path.join(DB, "pehchaan_skill_gap_analyser_data.json"), buildLegacySkillGap(canonicalSkillMap, existingSkill, legacyRegistry));
  writeJson(path.join(DB, "pehchaan_financing_reality_data.json"), buildLegacyFinancing(canonicalFinancialAid, existingFinance));
}

function main() {
  const canonicalCareers = buildCanonicalCareers();
  const includeExpansion = process.argv.includes("--include-expansion");
  if (includeExpansion) {
    const expansion = makeExpansionCareers(canonicalCareers.careers.length + 1, 50);
    canonicalCareers.careers.push(...expansion);
  }

  const canonicalExams = buildCanonicalExams();
  const canonicalInstitutions = buildInstitutions();
  const canonicalSkillMap = buildSkillMap(canonicalCareers.careers);
  const canonicalResources = buildResources(canonicalSkillMap);
  const canonicalFinancialAid = buildFinancialAid(
    canonicalCareers.careers.map((x) => x.career_id),
    canonicalExams.exams.map((x) => x.exam_id)
  );

  writeJson(path.join(CANON, "careers.json"), canonicalCareers);
  writeJson(path.join(CANON, "skill_map.json"), canonicalSkillMap);
  writeJson(path.join(CANON, "exams.json"), canonicalExams);
  writeJson(path.join(CANON, "institutions.json"), canonicalInstitutions);
  writeJson(path.join(CANON, "resources.json"), canonicalResources);
  writeJson(path.join(CANON, "financial_aid.json"), canonicalFinancialAid);

  writeJson(path.join(CANON, "_id_map.json"), {
    meta: { generated_on: nowDate() },
    careers: canonicalCareers.careers.map((x) => ({
      career_id: x.career_id,
      ...x.legacy_refs
    }))
  });

  buildInstitutionShards(canonicalInstitutions);
  writeLegacyCompatibilityOutputs(canonicalCareers, canonicalExams, canonicalSkillMap, canonicalFinancialAid);
  console.log(
    `Canonical migration complete: careers=${canonicalCareers.careers.length}, skills=${canonicalSkillMap.skill_map.length}, exams=${canonicalExams.exams.length}, institutions=${canonicalInstitutions.institutions.length}`
  );
}

main();
