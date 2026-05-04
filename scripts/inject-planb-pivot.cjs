/**
 * One-time style merge: adds pivot_ui, college_plan_b, course_plan_b to Plan B JSON.
 * Run: node scripts/inject-planb-pivot.cjs
 */
const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '..', 'DB', 'pehchaan_plan_b_strategy_builder_data.json');
const d = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

d.version = '2.0';
d.last_updated = '2026-05-04';

d.pivot_ui = {
  "headline": "Choose what you want to plan for",
  "sub": "Same honesty, different lens: paid work now, college backup options, or a different degree path toward a similar career.",
  "options": [
    {
      "id": "job",
      "emoji": "💼",
      "title": "Plan B — Jobs & income",
      "description": "You are preparing for a competitive exam. See skills you already have and concrete jobs (with pay bands, costs, timelines, and links) you can pursue in parallel.",
      "cta": "Continue with jobs →"
    },
    {
      "id": "college",
      "emoji": "🎓",
      "title": "Plan B — Colleges",
      "description": "If you miss the very top tier (IIT / AIIMS / dream campus), which strong national options or state-comfort colleges are realistic for your stream? Curated tiers — you still verify cutoffs and fees every year.",
      "cta": "Explore college Plan B →"
    },
    {
      "id": "course",
      "emoji": "📐",
      "title": "Plan B — Courses (horizontal paths)",
      "description": "If the vertical dream (e.g. B.Tech at X, MBBS) is uncertain or too costly, which degree ladders still reach similar job families? Compare duration, typical fee bands, and next steps.",
      "cta": "Explore course Plan B →"
    }
  ]
};

d.college_plan_b = {
  "intro": "Rankings and median salaries change every year. Use this section as a structured checklist, then confirm cutoffs, domicile rules, and fees on JoSAA / state CET / MCC / institute websites and NIRF PDFs.",
  "nirf_portal": { "label": "NIRF India (official rankings & reports)", "url": "https://www.nirfindia.org/" },
  "streams": [
    { "id": "engineering", "label": "Engineering (B.Tech / B.E.)", "short": "JEE / state engineering" },
    { "id": "medicine", "label": "Medicine (MBBS / primary clinical path)", "short": "NEET-UG" }
  ],
  "lenses": [
    { "id": "national_level", "label": "National-level ladder", "hint": "JoSAA / CSAB, MCC — all-India competition" },
    { "id": "state_comfort", "label": "State-comfort", "hint": "Strong options closer to home — always check domicile" }
  ],
  "states": [
    { "id": "IN", "label": "All-India (national counselling)", "only_for_lens": "national_level" },
    { "id": "CG", "label": "Chhattisgarh", "only_for_lens": "state_comfort" },
    { "id": "DL", "label": "Delhi NCR (examples)", "only_for_lens": "state_comfort" }
  ],
  "bundles": [
    {
      "stream_id": "engineering",
      "lens_id": "national_level",
      "state_id": "IN",
      "title": "Engineering — national counselling (JoSAA / CSAB)",
      "summary": "If JEE Main/Advanced ranks do not open IIT dream branches, many students still secure excellent outcomes at NITs, IIITs, GFTIs, and newer IITs through JoSAA. CSAB rounds can offer additional chances — read official business rules each year.",
      "tiers": [
        {
          "tier_title": "Tier A — IITs / top NITs / top IIITs (illustrative band)",
          "colleges": [
            { "name": "Older IITs + top NITs (Trichy, Surathkal, Warangal, etc.)", "nirf_band": "Typically top ~15–40 in Engineering (varies by year — verify)", "notes": "Cutoffs move every year; branch matters as much as institute.", "links": [{ "label": "JoSAA (official)", "url": "https://josaa.nic.in/" }] },
            { "name": "Top IIITs (Hyderabad, Bangalore, etc.)", "nirf_band": "Often strong in Engineering NIRF — verify current PDF", "notes": "Very competitive CSE; read placement report footnotes (median vs mean).", "links": [{ "label": "JoSAA", "url": "https://josaa.nic.in/" }] }
          ]
        },
        {
          "tier_title": "Tier B — Other NITs / IIITs / solid GFTIs",
          "colleges": [
            { "name": "Other NITs & IIITs via JoSAA", "nirf_band": "Wide band — use NIRF + institute placement PDF", "notes": "Good ROI for core branches with your own projects + internships.", "links": [{ "label": "NIRF ranking", "url": "https://www.nirfindia.org/Rankings/2025/Ranking.html" }] }
          ]
        },
        {
          "tier_title": "Tier C — CSAB / participating institutes",
          "colleges": [
            { "name": "Vacant seats after JoSAA rounds", "nirf_band": "Varies", "notes": "Read CSAB eligibility and fee carefully; some seats are at newer campuses.", "links": [{ "label": "CSAB portal (check active year)", "url": "https://csab.nic.in/" }] }
          ]
        }
      ]
    },
    {
      "stream_id": "engineering",
      "lens_id": "state_comfort",
      "state_id": "CG",
      "title": "Engineering — Chhattisgarh comfort picks (examples)",
      "summary": "If you want to stay in or near Chhattisgarh, combine state counselling (CGPET / DTE rules — verify current year) with national exams you already attempted where applicable.",
      "tiers": [
        {
          "tier_title": "National in-state (INI / central in CG)",
          "colleges": [
            { "name": "NIT Raipur", "location": "Raipur", "nirf_band": "Engineering NIRF band typically ~30–50 (verify year)", "type": "Institute of National Importance", "notes": "Strong regional brand; check branch-wise cutoffs.", "links": [{ "label": "NIT Raipur", "url": "https://www.nitrr.ac.in/" }] },
            { "name": "IIIT Naya Raipur", "location": "Naya Raipur", "nirf_band": "Growing IIIT — verify NIRF + placements", "type": "IIIT (PPP)", "notes": "Compare fees and curriculum vs NIT for your branch interest.", "links": [{ "label": "IIIT Naya Raipur", "url": "https://www.iiitnr.ac.in/" }] }
          ]
        },
        {
          "tier_title": "Good — respected state & private universities",
          "colleges": [
            { "name": "BIT Durg (SSIPMT)", "location": "Durg", "nirf_band": "Check NIRF ‘Engineering’ table for current rank", "type": "Affiliated college cluster (verify university)", "notes": "Ask for last 3 years’ branch-wise highest package and median internship stipend.", "links": [{ "label": "CSVTU (university)", "url": "https://csvtu.ac.in/" }] },
            { "name": "Government Engineering College, Raipur (example state college)", "location": "Raipur", "nirf_band": "Varies — verify on NIRF", "type": "State", "notes": "Lower fee than many private colleges; you own outcomes via GATE/projects.", "links": [{ "label": "CSVTU", "url": "https://csvtu.ac.in/" }] }
          ]
        },
        {
          "tier_title": "Average — accredited options to combine with skills",
          "colleges": [
            { "name": "Other AICTE-affiliated colleges in CG", "location": "Multiple cities", "nirf_band": "Wide", "type": "Private / state", "notes": "Verify NBA accreditation for branch; plan internships + coding portfolio early.", "links": [{ "label": "AICTE — CAMP", "url": "https://facilities.aicte-india.org/" }] }
          ]
        }
      ]
    },
    {
      "stream_id": "engineering",
      "lens_id": "state_comfort",
      "state_id": "DL",
      "title": "Engineering — Delhi NCR examples (not exhaustive)",
      "summary": "Delhi NCR has DTU, NSUT, IIIT-Delhi, NIT Delhi (Sonipat campus) and many private universities. Domicile and admission channel differ — read JAC Delhi / institute brochures.",
      "tiers": [
        {
          "tier_title": "Strong public options (examples)",
          "colleges": [
            { "name": "DTU / NSUT / IIIT-D (examples)", "location": "Delhi", "nirf_band": "Typically strong bands — verify", "type": "State / INI", "notes": "Admission via JAC Delhi / JEE — read current year Information Bulletin.", "links": [{ "label": "JAC Delhi", "url": "https://jacdelhi.admissions.nic.in/" }] },
            { "name": "NIT Delhi", "location": "Sonipat region", "nirf_band": "Verify NIRF", "type": "NIT", "notes": "Campus location vs brand — visit if possible.", "links": [{ "label": "NIT Delhi", "url": "https://nitdelhi.ac.in/" }] }
          ]
        },
        {
          "tier_title": "Private universities (do extra diligence)",
          "colleges": [
            { "name": "Established private universities in NCR", "location": "NCR", "nirf_band": "Varies widely", "type": "Private", "notes": "Compare total 4-year cost incl. hostel; ask for audited placement PDF.", "links": [{ "label": "NIRF", "url": "https://www.nirfindia.org/" }] }
          ]
        }
      ]
    },
    {
      "stream_id": "medicine",
      "lens_id": "national_level",
      "state_id": "IN",
      "title": "Medicine — national counselling (MCC / NEET-UG)",
      "summary": "If AIIMS Delhi / top AIIMS-like cutoffs are out of reach, national counselling still offers AIIMS-like institutes, JIPMER-like pathways, central universities, and deemed universities — read MCC Stray Vacancy rules and bond clauses carefully.",
      "tiers": [
        {
          "tier_title": "Tier A — top government medical colleges (illustrative)",
          "colleges": [
            { "name": "AIIMS / JIPMER / top state GMCs via AIQ", "nirf_band": "Medical ranking band changes — verify NIRF Medical", "notes": "Bonds, rural service, and fees differ massively — read offer letter.", "links": [{ "label": "MCC (NEET UG)", "url": "https://mcc.nic.in/" }] }
          ]
        },
        {
          "tier_title": "Tier B — other government / central institutions",
          "colleges": [
            { "name": "ESIC, AFMC pool, other central schemes (when listed)", "nirf_band": "Varies", "notes": "Watch MCC PDFs for eligibility (domicile, PwD, category).", "links": [{ "label": "MCC", "url": "https://mcc.nic.in/" }] }
          ]
        },
        {
          "tier_title": "Tier C — deemed / private (cost-sensitive)",
          "colleges": [
            { "name": "Deemed universities", "nirf_band": "Varies", "notes": "Total course cost can be high — model worst-case fees + hostel + exam fees.", "links": [{ "label": "MCC information", "url": "https://mcc.nic.in/" }] }
          ]
        }
      ]
    },
    {
      "stream_id": "medicine",
      "lens_id": "state_comfort",
      "state_id": "CG",
      "title": "Medicine — Chhattisgarh (examples)",
      "summary": "Chhattisgarh has AIIMS Raipur and government medical colleges; private medical colleges also participate in state/all-India quotas by year — verify current prospectus.",
      "tiers": [
        {
          "tier_title": "INI / flagship in state",
          "colleges": [
            { "name": "AIIMS Raipur", "location": "Raipur", "nirf_band": "Verify Medical NIRF", "type": "AIIMS", "notes": "Highly competitive; still a national draw — not only CG domicile.", "links": [{ "label": "AIIMS Raipur", "url": "https://aiimsraipur.edu.in/" }] }
          ]
        },
        {
          "tier_title": "Government medical colleges (state quota)",
          "colleges": [
            { "name": "GMC Raipur / other CG GMCs (as per state list)", "location": "Chhattisgarh", "nirf_band": "Verify", "type": "State GMC", "notes": "Read CGDME / Ayush dept counselling PDF for domicile.", "links": [{ "label": "CG Health / counselling (search official .gov)", "url": "https://www.cghealth.nic.in/" }] }
          ]
        },
        {
          "tier_title": "Private medical colleges",
          "colleges": [
            { "name": "Private MBBS colleges in CG (verify MCC + state)", "location": "Chhattisgarh", "nirf_band": "Varies", "type": "Private", "notes": "Compare bond, fees, and clinical exposure.", "links": [{ "label": "MCC", "url": "https://mcc.nic.in/" }] }
          ]
        }
      ]
    }
  ]
};

d.course_plan_b = {
  "intro": "These are alternative degree ladders toward similar job families if Plan A is uncertain or too expensive. Numbers are indicative — always verify fees and accreditation on official sites.",
  "anchors": [
    {
      "id": "jee_btech_miss",
      "title": "I aimed for IIT / top NIT B.Tech but may miss my dream branch / campus",
      "context": "Strong maths/physics from JEE prep still maps to CS careers via other ladders.",
      "alternatives": [
        {
          "title": "BCA + MCA (horizontal path to software roles)",
          "duration": "Typically 3 years BCA + 2 years MCA",
          "cost_compare": "Total 5-year spend at many universities is often materially lower than private B.Tech at the same city tier — sometimes roughly 35–55% depending on hostel and college (wide variance; build your own spreadsheet).",
          "job_family": "Developer, QA engineer, data/IT roles after internships + LeetCode-style practice",
          "how_to": ["Shortlist universities with strong MCA placement cells; ask for median not max package.", "Start GitHub in BCA year 1 — treat side projects as non-negotiable.", "Target summer internships after 2nd year.", "Consider GATE for M.Tech at NITs if you want another reset."],
          "links": [{ "label": "NIRF (compare institutions)", "url": "https://www.nirfindia.org/" }, { "label": "freeCodeCamp (skills)", "url": "https://www.freecodecamp.org/" }]
        },
        {
          "title": "B.Sc Computer Science / IT + M.Sc / MCA",
          "duration": "3 + 2/3 depending on route",
          "cost_compare": "Often lower fee than B.Tech in same city; may need more self-driven coding portfolio.",
          "job_family": "Same as above with stronger need for internships",
          "how_to": ["Pick B.Sc with maths + programming depth in syllabus.", "Add online specialisation (cloud, backend) with receipts (certs + projects)."],
          "links": [{ "label": "Internshala", "url": "https://internshala.com/" }]
        },
        {
          "title": "Diploma (polytechnic) + lateral B.Tech",
          "duration": "3 diploma + 3 B.Tech lateral common pattern (verify institute)",
          "cost_compare": "Staggered fees; can start earning earlier via apprentice / trainee roles in some regions.",
          "job_family": "Core engineering + IT support ladders",
          "how_to": ["Verify lateral entry rules for target state universities.", "Keep maths strength for GATE if you want PSUs later."],
          "links": [{ "label": "AICTE", "url": "https://www.aicte-india.org/" }]
        }
      ]
    },
    {
      "id": "neet_mbbs_miss",
      "title": "I prepared for NEET-UG but MBBS seat looks unlikely this year",
      "context": "Your biology + chemistry depth still opens clinical-adjacent and pharma paths.",
      "alternatives": [
        {
          "title": "B.Pharm + practice licences / industry",
          "duration": "4 years",
          "cost_compare": "Usually far lower than MBBS private capitation paths; good employability in pharma/regulatory with right internships.",
          "job_family": "Medical affairs, QC, RA, hospital pharmacy (rules vary by state)",
          "how_to": ["Shortlist PCI-approved colleges.", "Intern at hospital + industry both summers if possible.", "Explore GPAT if relevant to your plan."],
          "links": [{ "label": "PCI (Pharmacy council)", "url": "https://www.pci.nic.in/" }]
        },
        {
          "title": "B.Sc Life Sciences / Biotech + M.Sc",
          "duration": "3 + 2",
          "cost_compare": "Moderate; research careers may need higher degrees — plan early.",
          "job_family": "Lab research, diagnostics R&D, MSc→PhD path",
          "how_to": ["Pick syllabus with molecular biology + instrumentation hours.", "Publish poster / preprint only with ethical mentor guidance."],
          "links": [{ "label": "Naukri — lab / biotech fresher", "url": "https://www.naukri.com/biotechnology-research-jobs-in-india" }]
        },
        {
          "title": "Allied health degrees (BMLT, BPT, etc.)",
          "duration": "3–4 years depending on course",
          "cost_compare": "Often structured employability; verify clinical posting hours.",
          "job_family": "Allied health practitioner / technician ladders",
          "how_to": ["Check state paramedical council recognition.", "Visit hospital labs and ask supervisors which diplomas they respect."],
          "links": [{ "label": "MoHFW portals (verify current)", "url": "https://www.mohfw.gov.in/" }]
        }
      ]
    },
    {
      "id": "banking_ssc_path",
      "title": "I am on SSC / banking track but want a parallel employable skill",
      "context": "Quant + English + reasoning maps to MIS, operations, and sales support.",
      "alternatives": [
        {
          "title": "Excel + SQL + MIS ladder (already in Job Plan B — here as course bundle)",
          "duration": "8–12 weeks focused nights",
          "cost_compare": "Mostly free tools; paid cert optional under ₹5,000.",
          "job_family": "MIS, reporting, operations",
          "how_to": ["Microsoft Learn Excel + SQL basics.", "One dashboard project on public dataset.", "Naukri alerts for MIS trainee."],
          "links": [{ "label": "Microsoft Learn", "url": "https://learn.microsoft.com/" }, { "label": "Naukri MIS jobs", "url": "https://www.naukri.com/mis-executive-jobs-in-india" }]
        }
      ]
    }
  ]
};

fs.writeFileSync(dataPath, JSON.stringify(d, null, 2), 'utf8');
console.log('Injected pivot_ui, college_plan_b, course_plan_b into', dataPath);
