import json
from pathlib import Path


DB_PATH = Path("DB/pehchaan_skill_gap_analyser_data.json")


ACRONYMS = {
    "ai": "AI",
    "ml": "ML",
    "hr": "HR",
    "ui": "UI",
    "ux": "UX",
    "sql": "SQL",
    "mbbs": "MBBS",
    "ias": "IAS",
    "upsc": "UPSC",
    "bds": "BDS",
    "bpt": "BPT",
    "bvsc": "BVSc",
    "cma": "CMA",
    "csir": "CSIR",
    "po": "PO",
    "ssc": "SSC",
    "cgpsc": "CGPSC",
    "iti": "ITI",
}


def proper_case_from_id(raw: str) -> str:
    parts = [p for p in str(raw or "").replace("-", "_").split("_") if p]
    out = []
    for p in parts:
        low = p.lower()
        if low in ACRONYMS:
            out.append(ACRONYMS[low])
        else:
            out.append(low.capitalize())
    return " ".join(out).strip() or "Role"


TRACK_SKILLS = {
    "software": [
        "Programming Fundamentals (Python or JavaScript)",
        "Data Structures and Algorithms Basics",
        "SQL and Database Fundamentals",
        "Git and Version Control Workflow",
        "One Framework (React or Node.js or Django)",
    ],
    "data_analyst": [
        "Microsoft Excel / Google Sheets",
        "SQL (Structured Query Language)",
        "Python for Data Analysis (Pandas + NumPy)",
        "Data Visualisation (Power BI or Tableau)",
        "Statistics Basics (Mean, Median, Standard Deviation, Hypothesis Testing)",
    ],
    "data_scientist": [
        "Statistics and Probability (Strong Foundation)",
        "Python for Statistical and ML Computing",
        "SQL for Data Extraction and Feature Building",
        "Machine Learning Fundamentals (Regression, Classification, Clustering)",
        "Model Evaluation, Feature Engineering, and Experiment Design",
    ],
    "cybersecurity": [
        "Networking Fundamentals (TCP/IP, DNS, HTTP)",
        "Linux and Command Line Basics",
        "System and Application Security Fundamentals",
        "Vulnerability Assessment and Threat Analysis",
        "Incident Response and Security Documentation",
    ],
    "finance_accounting": [
        "Accounting Fundamentals and Journal Entries",
        "Taxation Basics (Direct and Indirect)",
        "Excel for Finance and Reconciliation",
        "Financial Statement Analysis",
        "Audit and Compliance Documentation",
    ],
    "banking_govt": [
        "Quantitative Aptitude and Arithmetic",
        "Logical Reasoning and Analytical Thinking",
        "English Comprehension and Grammar",
        "Current Affairs and General Awareness",
        "Timed Mock-Test Strategy and Revision",
    ],
    "legal_judiciary": [
        "Legal Research and Bare Act Reading",
        "Drafting and Case Note Preparation",
        "Constitutional and Procedural Law Basics",
        "Argument Structuring and Judgment Analysis",
        "Courtroom / Interview Communication",
    ],
    "teaching": [
        "Lesson Planning and Curriculum Mapping",
        "Classroom Communication and Pedagogy",
        "Subject Content Mastery",
        "Assessment Design and Evaluation",
        "Student Engagement and Classroom Management",
    ],
    "medical_clinical": [
        "Human Anatomy and Physiology Basics",
        "Clinical Procedures and Case Assessment",
        "Patient Communication and Counselling",
        "Medical Documentation and Reporting",
        "Ethics, Safety, and Infection Control",
    ],
    "allied_health": [
        "Core Domain Fundamentals",
        "Clinical / Lab Procedure Accuracy",
        "Patient Handling and Communication",
        "Documentation and Reporting Quality",
        "Safety, Hygiene, and Protocol Compliance",
    ],
    "design_creative": [
        "Design Fundamentals (Layout, Color, Typography)",
        "Tool Proficiency (Figma, Canva, or Adobe Suite)",
        "Portfolio and Case Study Building",
        "Client Brief Interpretation and Iteration",
        "Visual Storytelling and Presentation",
    ],
    "content_media": [
        "Research and Topic Planning",
        "Writing / Script Structuring",
        "Editing and Quality Control",
        "SEO and Audience Discovery Basics",
        "Content Performance Analysis",
    ],
    "marketing": [
        "Marketing Fundamentals and Funnel Basics",
        "Social Media and Campaign Execution",
        "SEO / SEM Fundamentals",
        "Analytics and Performance Reporting",
        "Communication and Creative Briefing",
    ],
    "sales_bd": [
        "Prospecting and Lead Qualification",
        "Discovery Calls and Need Analysis",
        "Objection Handling and Negotiation Basics",
        "CRM Hygiene and Follow-up Discipline",
        "Presentation and Closing Communication",
    ],
    "hr_recruitment": [
        "Recruitment Lifecycle and Sourcing Basics",
        "Interview Coordination and Screening",
        "HR Operations and Documentation",
        "Stakeholder Communication",
        "Labor Law / Policy Awareness (Basics)",
    ],
    "operations_supply": [
        "Process Mapping and SOP Compliance",
        "Excel / MIS Tracking and Reporting",
        "Inventory / Logistics Coordination Basics",
        "Vendor and Stakeholder Communication",
        "Problem Solving and Escalation Handling",
    ],
    "hospitality_service": [
        "Customer Service and Frontline Communication",
        "Service Operations and SOP Adherence",
        "Complaint Resolution and Recovery",
        "Basic Billing / POS / Tool Usage",
        "Professional Etiquette and Team Coordination",
    ],
    "trades_technical": [
        "Core Technical Theory and Measurements",
        "Tool Handling and Equipment Operation",
        "Blueprint / Diagram Reading Basics",
        "Installation, Testing, and Troubleshooting",
        "Workplace Safety and Compliance",
    ],
    "management_general": [
        "Business Communication and Presentation",
        "Excel and Data-Based Decision Making",
        "Planning and Execution Discipline",
        "Team Coordination and Stakeholder Management",
        "Problem Solving and Structured Thinking",
    ],
    "science_research": [
        "Subject Fundamentals and Scientific Reasoning",
        "Experimental / Field Methodology",
        "Data Collection and Analysis",
        "Technical Writing and Documentation",
        "Research Ethics and Safety",
    ],
    "aviation_defence": [
        "Domain Aptitude and Technical Basics",
        "Physical and Mental Fitness Discipline",
        "Situational Decision Making",
        "Communication Under Pressure",
        "Selection-Test and Interview Readiness",
    ],
}


TRACK_RESOURCES = {
    "software": [
        ("freeCodeCamp", "https://www.freecodecamp.org/"),
        ("roadmap.sh", "https://roadmap.sh/"),
        ("MDN Web Docs", "https://developer.mozilla.org/"),
        ("GitHub Skills", "https://skills.github.com/"),
    ],
    "data_analyst": [
        ("Kaggle Learn", "https://www.kaggle.com/learn"),
        ("SQLBolt", "https://sqlbolt.com/"),
        ("Microsoft Learn (Power BI)", "https://learn.microsoft.com/training/powerplatform/power-bi/"),
        ("Google Data Analytics Resources", "https://www.coursera.org/professional-certificates/google-data-analytics"),
    ],
    "data_scientist": [
        ("Kaggle Learn", "https://www.kaggle.com/learn"),
        ("scikit-learn Documentation", "https://scikit-learn.org/stable/"),
        ("DeepLearning.AI", "https://www.deeplearning.ai/"),
        ("Towards Data Science", "https://towardsdatascience.com/"),
    ],
    "cybersecurity": [
        ("TryHackMe", "https://tryhackme.com/"),
        ("OWASP", "https://owasp.org/"),
        ("Cisco Skills for All", "https://skillsforall.com/"),
        ("NPTEL Cyber Security", "https://nptel.ac.in/"),
    ],
    "finance_accounting": [
        ("ICAI Resources", "https://www.icai.org/"),
        ("NSE Academy", "https://www.nseindia.com/learn"),
        ("Corporate Finance Institute", "https://corporatefinanceinstitute.com/"),
        ("Tally Education", "https://tallyeducation.com/"),
    ],
    "banking_govt": [
        ("RBI Official", "https://www.rbi.org.in/"),
        ("IBPS Official", "https://www.ibps.in/"),
        ("SSC Official", "https://ssc.nic.in/"),
        ("Testbook Practice", "https://testbook.com/"),
    ],
    "legal_judiciary": [
        ("eCourts Services", "https://ecourts.gov.in/"),
        ("SCC Online Blog", "https://www.scconline.com/blog/"),
        ("Bar and Bench", "https://www.barandbench.com/"),
        ("LiveLaw", "https://www.livelaw.in/"),
    ],
    "teaching": [
        ("NCERT", "https://ncert.nic.in/"),
        ("DIKSHA", "https://diksha.gov.in/"),
        ("CBSE Academic", "https://cbseacademic.nic.in/"),
        ("Google for Education", "https://edu.google.com/"),
    ],
    "medical_clinical": [
        ("NMC India", "https://www.nmc.org.in/"),
        ("WHO Learning", "https://openwho.org/"),
        ("Medscape", "https://www.medscape.com/"),
        ("BMJ Learning", "https://new-learning.bmj.com/"),
    ],
    "allied_health": [
        ("NHS Learning Hub (Reference)", "https://www.e-lfh.org.uk/"),
        ("Coursera Health Courses", "https://www.coursera.org/browse/health"),
        ("WHO Learning", "https://openwho.org/"),
        ("CDC Training", "https://www.cdc.gov/training/"),
    ],
    "design_creative": [
        ("Figma Learn", "https://help.figma.com/hc/en-us/articles/360040514593"),
        ("Canva Design School", "https://www.canva.com/designschool/"),
        ("Adobe Learn", "https://helpx.adobe.com/creative-cloud/tutorials-explore.html"),
        ("Behance", "https://www.behance.net/"),
    ],
    "content_media": [
        ("HubSpot Academy", "https://academy.hubspot.com/"),
        ("Ahrefs Academy", "https://ahrefs.com/academy"),
        ("Google Trends", "https://trends.google.com/"),
        ("YouTube Creator Academy", "https://creatoracademy.youtube.com/"),
    ],
    "marketing": [
        ("Google Skillshop", "https://skillshop.withgoogle.com/"),
        ("Meta Blueprint", "https://www.facebookblueprint.com/"),
        ("HubSpot Academy", "https://academy.hubspot.com/"),
        ("Semrush Academy", "https://www.semrush.com/academy/"),
    ],
    "sales_bd": [
        ("HubSpot Sales Training", "https://academy.hubspot.com/"),
        ("LinkedIn Learning (Sales)", "https://www.linkedin.com/learning/topics/sales"),
        ("Gong Labs", "https://www.gong.io/resources/"),
        ("Salesforce Trailhead", "https://trailhead.salesforce.com/"),
    ],
    "hr_recruitment": [
        ("SHRM Resources", "https://www.shrm.org/"),
        ("Naukri Recruiter Resources", "https://recruit.naukri.com/"),
        ("LinkedIn Talent Solutions", "https://business.linkedin.com/talent-solutions"),
        ("Great Learning HR Courses", "https://www.mygreatlearning.com/hr-courses"),
    ],
    "operations_supply": [
        ("CIPS Resources", "https://www.cips.org/"),
        ("APICS / ASCM", "https://www.ascm.org/"),
        ("Oracle SCM Learning", "https://education.oracle.com/"),
        ("Coursera Operations Courses", "https://www.coursera.org/browse/business/operations"),
    ],
    "hospitality_service": [
        ("AHLEI", "https://www.ahlei.org/"),
        ("Skill India", "https://www.skillindia.gov.in/"),
        ("Coursera Hospitality", "https://www.coursera.org/browse/business/hospitality"),
        ("NCS India", "https://www.ncs.gov.in/"),
    ],
    "trades_technical": [
        ("Skill India", "https://www.skillindia.gov.in/"),
        ("NSDC Courses", "https://nsdcindia.org/"),
        ("NPTEL", "https://nptel.ac.in/"),
        ("YouTube - NPTEL", "https://www.youtube.com/c/nptelhrd"),
    ],
    "management_general": [
        ("Harvard Business Review", "https://hbr.org/"),
        ("Coursera Business Courses", "https://www.coursera.org/browse/business"),
        ("edX Management", "https://www.edx.org/learn/management"),
        ("LinkedIn Learning", "https://www.linkedin.com/learning/"),
    ],
    "science_research": [
        ("NPTEL", "https://nptel.ac.in/"),
        ("Khan Academy Science", "https://www.khanacademy.org/science"),
        ("Nature Careers", "https://www.nature.com/naturecareers"),
        ("ResearchGate", "https://www.researchgate.net/"),
    ],
    "aviation_defence": [
        ("DGCA India", "https://www.dgca.gov.in/"),
        ("SSB Crack", "https://www.ssbcrack.com/"),
        ("Indian Air Force", "https://indianairforce.nic.in/"),
        ("Aviation Exam", "https://www.aviationexam.com/"),
    ],
}


TRACK_BY_ID = {
    "software_engineer": "software",
    "software_developer": "software",
    "ai_ml_engineer": "software",
    "data_analyst": "data_analyst",
    "statistician_data_analyst_bsc": "data_analyst",
    "data_scientist": "data_scientist",
    "cybersecurity_analyst": "cybersecurity",
    "chartered_accountant": "finance_accounting",
    "cost_accountant_cma": "finance_accounting",
    "company_secretary": "finance_accounting",
    "bank_po": "banking_govt",
    "ssc_government": "banking_govt",
    "cgpsc_state_services": "banking_govt",
    "govt_jobs_admin": "banking_govt",
    "bank_finance": "finance_accounting",
    "ias_upsc": "banking_govt",
    "lawyer": "legal_judiciary",
    "civil_judge_judicial": "legal_judiciary",
    "teacher": "teaching",
    "teacher_educator": "teaching",
    "doctor_mbbs": "medical_clinical",
    "nursing": "allied_health",
    "dentist_bds": "allied_health",
    "physiotherapist_bpt": "allied_health",
    "occupational_therapist": "allied_health",
    "medical_lab_technologist": "allied_health",
    "radiographer_imaging": "allied_health",
    "clinical_research_associate": "allied_health",
    "veterinarian_bvsc": "allied_health",
    "pharmacist": "allied_health",
    "ayush_doctor": "medical_clinical",
    "public_health_professional": "allied_health",
    "dietitian_nutritionist": "allied_health",
    "graphic_ui_designer": "design_creative",
    "graphic_designer": "design_creative",
    "interior_designer": "design_creative",
    "fashion_designer": "design_creative",
    "architect": "design_creative",
    "animator_game_designer": "design_creative",
    "journalist_content_writer": "content_media",
    "content_creator_youtuber": "content_media",
    "content_writer": "content_media",
    "digital_marketing": "marketing",
    "digital_marketer": "marketing",
    "sales_business_development": "sales_bd",
    "hr_manager": "hr_recruitment",
    "supply_chain_logistics": "operations_supply",
    "event_manager": "operations_supply",
    "hotel_hospitality": "hospitality_service",
    "chef_culinary": "hospitality_service",
    "social_worker_ngo": "management_general",
    "bba_mba_management": "management_general",
    "commercial_pilot": "aviation_defence",
    "defence_officer": "aviation_defence",
    "civil_mechanical_engineer": "trades_technical",
    "electrician_electrical_tech": "trades_technical",
    "electrical_engineer_power": "trades_technical",
    "welder_fabricator": "trades_technical",
    "iti_electrician": "trades_technical",
    "biotechnology_life_sciences": "science_research",
    "scientist_csir": "science_research",
    "environmental_green_energy": "science_research",
    "agricultural_officer": "science_research",
    "actuarial_scientist": "data_scientist",
    "psychologist_counsellor": "allied_health",
}


def guess_track(role_id: str) -> str:
    if role_id in TRACK_BY_ID:
        return TRACK_BY_ID[role_id]
    text = role_id.lower()
    if any(k in text for k in ["software", "developer", "ai_ml", "program"]):
        return "software"
    if any(k in text for k in ["data_analyst", "statistician"]):
        return "data_analyst"
    if "data_scientist" in text:
        return "data_scientist"
    if any(k in text for k in ["security", "cyber"]):
        return "cybersecurity"
    if any(k in text for k in ["account", "finance", "cma", "secretary"]):
        return "finance_accounting"
    return "management_general"


def build_skill_rows(track: str):
    skills = TRACK_SKILLS[track]
    resources = TRACK_RESOURCES[track]
    rows = []
    for i, skill in enumerate(skills, start=1):
        how_to_learn = []
        res = resources[(i - 1) % len(resources)]
        how_to_learn.append(
            {
                "resource": res[0],
                "type": "Free",
                "url": res[1],
                "duration": "",
                "note": "",
            }
        )
        rows.append(
            {
                "skill": skill,
                "level_required": "Foundation" if i <= 2 else "Intermediate",
                "priority": i,
                "is_foundation": i <= 2,
                "time_to_learn_weeks": 4 if i <= 3 else 5,
                "how_to_learn": how_to_learn,
                "self_test": "",
                "paid_option": "",
            }
        )
    return rows


def main():
    data = json.loads(DB_PATH.read_text(encoding="utf-8"))
    jobs = data.get("job_categories", [])
    for job in jobs:
        role_id = str(job.get("id", "")).strip()
        if not role_id:
            continue
        track = guess_track(role_id)
        job["label"] = proper_case_from_id(role_id)
        job["category"] = "Canonical"
        job["skills"] = build_skill_rows(track)
    DB_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {len(jobs)} role entries in {DB_PATH}")


if __name__ == "__main__":
    main()
