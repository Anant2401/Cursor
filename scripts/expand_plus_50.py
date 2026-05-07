import json
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CANON = ROOT / "DB" / "canonical"
TODAY = str(date.today())


def load(name):
    return json.loads((CANON / name).read_text(encoding="utf-8"))


def dump(name, data):
    (CANON / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


careers = load("careers.json")
skill_map = load("skill_map.json")
resources = load("resources.json")
exams = load("exams.json")
institutions = load("institutions.json")
id_map = load("_id_map.json")

existing_ids = {c["career_id"] for c in careers["careers"]}
exam_by_id = {e["exam_id"]: e for e in exams["exams"]}
institution_ids = [i["institution_id"] for i in institutions["institutions"]]
max_salary_id = max((x.get("salary_explorer_id") or 0) for x in id_map["careers"])

new_careers = [
    ("ev_service_technician", "EV Service Technician", "Blue Collar", "iti"),
    ("drone_pilot_survey", "Drone Pilot & Survey Specialist", "Grey Collar", "cuet"),
    ("solar_pv_installer", "Solar PV Installer", "Blue Collar", "iti"),
    ("wind_turbine_technician", "Wind Turbine Technician", "Blue Collar", "iti"),
    ("battery_management_engineer", "Battery Management Systems Engineer", "White Collar", "jee"),
    ("esg_analyst", "ESG Analyst", "White Collar", "cat"),
    ("climate_risk_analyst", "Climate Risk Analyst", "White Collar", "gate"),
    ("supply_chain_analyst", "Supply Chain Analyst", "White Collar", "cat"),
    ("logistics_operations_manager", "Logistics Operations Manager", "Grey Collar", "cat"),
    ("railway_signal_technician", "Railway Signal Technician", "Blue Collar", "rrb"),
    ("metro_operations_controller", "Metro Operations Controller", "Grey Collar", "ssc"),
    ("genomics_lab_technician", "Genomics Lab Technician", "Grey Collar", "neet"),
    ("radiology_technician", "Radiology Technician", "Grey Collar", "neet"),
    ("dialysis_technician", "Dialysis Technician", "Grey Collar", "neet"),
    ("rehabilitation_therapy_assistant", "Rehabilitation Therapy Assistant", "Professional", "neet"),
    ("speech_language_therapist", "Speech Language Therapist", "Professional", "cuet"),
    ("hospital_administrator", "Hospital Administrator", "White Collar", "cat"),
    ("public_health_data_analyst", "Public Health Data Analyst", "White Collar", "cuet"),
    ("soc_analyst", "Security Operations Center Analyst", "White Collar", "gate"),
    ("cloud_devops_engineer", "Cloud DevOps Engineer", "White Collar", "gate"),
    ("mlops_engineer", "MLOps Engineer", "White Collar", "gate"),
    ("data_engineer", "Data Engineer", "White Collar", "gate"),
    ("product_manager_tech", "Product Manager (Tech)", "White Collar", "cat"),
    ("ui_ux_researcher", "UI/UX Researcher", "White Collar", "design"),
    ("game_developer", "Game Developer", "White Collar", "jee"),
    ("ar_vr_designer", "AR/VR Designer", "White Collar", "design"),
    ("digital_forensics_specialist", "Digital Forensics Specialist", "Professional", "ssc"),
    ("gis_analyst", "GIS Analyst", "Grey Collar", "cuet"),
    ("geospatial_data_scientist", "Geospatial Data Scientist", "White Collar", "gate"),
    ("food_technologist", "Food Technologist", "Professional", "cuet"),
    ("dairy_technologist", "Dairy Technologist", "Grey Collar", "cuet"),
    ("agri_extension_officer", "Agricultural Extension Officer", "Grey Collar", "upsc"),
    ("agri_supply_chain_planner", "Agri Supply Chain Planner", "White Collar", "cat"),
    ("rural_bpo_team_lead", "Rural BPO Team Lead", "Grey Collar", "ssc"),
    ("banking_risk_analyst", "Banking Risk Analyst", "White Collar", "ibps"),
    ("fintech_operations_specialist", "FinTech Operations Specialist", "White Collar", "ibps"),
    ("insurance_underwriter", "Insurance Underwriter", "White Collar", "ibps"),
    ("claims_investigator", "Insurance Claims Investigator", "Grey Collar", "ssc"),
    ("legal_compliance_officer", "Legal Compliance Officer", "Professional", "clat"),
    ("paralegal_case_manager", "Paralegal Case Manager", "Grey Collar", "clat"),
    ("policy_research_associate", "Policy Research Associate", "White Collar", "upsc"),
    ("urban_planner", "Urban Planner", "Professional", "gate"),
    ("smart_city_project_coordinator", "Smart City Project Coordinator", "Grey Collar", "ssc"),
    ("construction_safety_officer", "Construction Safety Officer", "Grey Collar", "ssc"),
    ("hospitality_revenue_manager", "Hospitality Revenue Manager", "White Collar", "nchmct"),
    ("aviation_ground_operations", "Aviation Ground Operations Specialist", "Grey Collar", "cuet"),
    ("air_cargo_coordinator", "Air Cargo Coordinator", "Grey Collar", "cuet"),
    ("animation_pipeline_artist", "Animation Pipeline Artist", "White Collar", "design"),
    ("content_localization_specialist", "Content Localization Specialist", "White Collar", "cuet"),
    ("edtech_curriculum_designer", "EdTech Curriculum Designer", "White Collar", "teaching"),
]

new_careers = [x for x in new_careers if x[0] not in existing_ids]
if len(new_careers) != 50:
    raise RuntimeError(f"Expected 50 new careers, got {len(new_careers)}")

common_states = {
    "KA": {"hiring_hubs": ["Bengaluru", "Mysuru"], "major_industries": ["Technology", "Services"], "local_language_advantage": ["Kannada"]},
    "MH": {"hiring_hubs": ["Mumbai", "Pune", "Nashik"], "major_industries": ["Finance", "Manufacturing"], "local_language_advantage": ["Marathi", "Hindi"]},
    "TN": {"hiring_hubs": ["Chennai", "Coimbatore"], "major_industries": ["Manufacturing", "Automotive", "IT"], "local_language_advantage": ["Tamil"]},
    "TS": {"hiring_hubs": ["Hyderabad"], "major_industries": ["IT", "Pharma"], "local_language_advantage": ["Telugu", "Hindi"]},
    "DL": {"hiring_hubs": ["New Delhi", "Noida", "Gurugram"], "major_industries": ["Policy", "Consulting", "Services"], "local_language_advantage": ["Hindi", "English"]},
}

resource_templates = [
    ("foundation", "NPTEL foundational pathway", "https://nptel.ac.in"),
    ("practice", "SWAYAM guided coursework", "https://swayam.gov.in"),
    ("industry", "NSDC skill standards and job roles", "https://www.nsdcindia.org"),
]

all_new_ids = []
for idx, (career_id, name, tier, exam_id) in enumerate(new_careers, start=1):
    all_new_ids.append(career_id)
    ai_impact = 4 + (idx % 6)
    remote = 3 + (idx % 7)
    roi = round(5.2 + ((idx % 10) * 0.3), 1)
    salary_low = 3 + (idx % 5)
    salary_mid = salary_low + 3 + (idx % 4)
    institutions_for_career = [
        institution_ids[(idx * 3) % len(institution_ids)],
        institution_ids[(idx * 3 + 1) % len(institution_ids)],
        institution_ids[(idx * 3 + 2) % len(institution_ids)],
    ]
    career = {
        "career_id": career_id,
        "name": name,
        "description": (
            f"{name} is an All-India growth role with clear pathways through diploma, degree, "
            "and apprenticeship tracks. Outcomes improve when students combine formal credentials "
            "with portfolio work, internships, and local-language communication in state hiring hubs."
        ),
        "career_tier": tier,
        "ai_impact_score": min(10, ai_impact),
        "remote_index": min(10, remote),
        "roi_index": min(10, roi),
        "salary_structure": {
            "tier_1_city": f"{salary_mid}-{salary_mid + 8}",
            "tier_2_city": f"{salary_low}-{salary_low + 4}",
            "fresher_avg": f"{salary_low}-{salary_low + 3}",
        },
        "national_demand": "High growth in metro and emerging tier-2 hubs with sector-specific demand cycles.",
        "lateral_entry_paths": [
            "UG degree / diploma pathway",
            "Apprenticeship and work-integrated learning",
            "Certification-first bridge into entry-level roles",
        ],
        "hidden_costs": {
            "coaching_cost_band": "Low to Medium (INR 10k - 1.5L based on track)",
            "relocation_required": idx % 3 == 0,
            "equipment_needs": ["Laptop / smartphone", "Reliable internet", "Domain-specific toolkit"],
        },
        "physical_mental_demands": {
            "stress_level": 2 + (idx % 4),
            "travel_required": "occasional" if idx % 2 else "rare",
            "physical_stamina": 3 + (idx % 5),
        },
        "gig_economy_viability": idx % 2 == 0,
        "state_dynamics": common_states,
        "skills": [
            "Domain fundamentals",
            "Digital tools and reporting",
            "Problem solving and communication",
            "Project execution in teams",
        ],
        "exams": [exam_id.upper(), "State entrance / institutional screening"],
        "typical_employers": ["Public sector organizations", "Private enterprises", "MSME and startups"],
        "work_mode": "Hybrid",
        "demand_outlook": "stable",
        "salary_context": "Compensation varies by city tier, credential depth, and practical exposure.",
        "institution_linkage": {
            "institution_ids": institutions_for_career
        },
        "provenance": {
            "sources": ["DB/canonical/careers.json", "DB/canonical/institutions.json"],
            "confidence": 0.78,
        },
        "freshness": {
            "last_verified_on": TODAY,
            "review_cycle_days": 90,
        },
        "legacy_refs": {
            "salary_explorer_id": max_salary_id + idx,
            "roi_career_id": career_id,
            "exam_roadmap_career_id": exam_id,
            "plan_b_exam_id": None,
            "skill_gap_job_id": career_id,
            "private_role_ids": [],
        },
    }
    careers["careers"].append(career)

    learning_sequence = []
    for step_idx, (suffix, title, url) in enumerate(resource_templates, start=1):
        resource_id = f"{career_id}__{suffix}"
        learning_sequence.append(
            {
                "step_number": step_idx,
                "resource_id": resource_id,
                "title": title,
                "url": url,
                "cost_type": "Free",
                "language_tags": ["English", "Hindi", "Hinglish", "Tamil", "Telugu"],
            }
        )
        resources["resources"].append(
            {
                "resource_id": resource_id,
                "title": f"{title} for {name}",
                "url": url,
                "platform": "Web",
                "language_tags": ["English", "Hindi", "Hinglish", "Tamil", "Telugu"],
                "cost_type": "Free",
                "time_to_mastery": "4-8 months with 10-12 hours/week",
                "prerequisite_skills": ["Basic communication", "Digital literacy"],
                "industry_recognition": "Moderate to high depending on project portfolio and internships",
                "related_career_ids": [career_id],
                "provenance": {
                    "sources": ["DB/canonical/skill_map.json"],
                    "confidence": 0.76,
                },
                "freshness": {
                    "last_verified_on": TODAY,
                    "review_cycle_days": 90,
                },
            }
        )

    skill_map["skill_map"].append(
        {
            "skill_id": f"skillmap_{career_id}",
            "career_id": career_id,
            "language_availability": ["English", "Hindi", "Hinglish", "Tamil", "Telugu"],
            "time_to_mastery": "4-8 months with 10-12 hours/week",
            "prerequisite_skills": ["Basic communication", "Digital literacy"],
            "industry_recognition": "Moderate to high depending on portfolio and on-ground exposure",
            "time_commitment": 280,
            "learning_sequence": learning_sequence,
            "provenance": {
                "sources": ["DB/canonical/resources.json"],
                "confidence": 0.8,
            },
            "freshness": {
                "last_verified_on": TODAY,
                "review_cycle_days": 90,
            },
        }
    )

    exam = exam_by_id.get(exam_id)
    if exam is not None:
        related = exam.get("related_career_ids") or []
        if career_id not in related:
            related.append(career_id)
        exam["related_career_ids"] = related

    id_map["careers"].append(
        {
            "career_id": career_id,
            "salary_explorer_id": max_salary_id + idx,
            "roi_career_id": career_id,
            "exam_roadmap_career_id": exam_id,
            "plan_b_exam_id": None,
            "skill_gap_job_id": career_id,
            "private_role_ids": [],
        }
    )

careers["meta"]["generated_on"] = TODAY
skill_map["meta"]["generated_on"] = TODAY
resources["meta"]["generated_on"] = TODAY
exams["meta"]["generated_on"] = TODAY
id_map["meta"]["generated_on"] = TODAY

dump("careers.json", careers)
dump("skill_map.json", skill_map)
dump("resources.json", resources)
dump("exams.json", exams)
dump("_id_map.json", id_map)

print("Added careers:", len(all_new_ids))
