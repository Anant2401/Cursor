'use strict';
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const htmlPath = path.join(__dirname, '..', 'Tools', 'pehchaan_salary_explorer.html');
const outPath = path.join(__dirname, '..', 'DB', 'pehchaan_salary_explorer_data.json');

const html = fs.readFileSync(htmlPath, 'utf8');
let careers = null;
const markerStart = 'var CAREERS = ';
const i0 = html.indexOf(markerStart);
const iCut = html.indexOf('var currentFilter');
if (i0 >= 0 && iCut > i0) {
  const arrText = html.slice(i0 + markerStart.length, iCut).trim();
  if (arrText.length > 4) {
    try {
      careers = new Function('return ' + arrText)();
    } catch (e) {
      console.warn('Could not parse careers from HTML:', e.message);
    }
  }
}
if (!careers || careers.length === 0) {
  if (!fs.existsSync(outPath)) {
    console.error('No careers array in HTML and no existing JSON at', outPath);
    process.exit(1);
  }
  careers = JSON.parse(fs.readFileSync(outPath, 'utf8')).careers;
  console.log('Loaded', careers.length, 'careers from existing JSON');
}

function hasGovtTag(c) {
  return Array.isArray(c.tags) && c.tags.includes('Govt Job');
}

function inferSegments(c) {
  const segs = new Set();
  const name = (c.name || '').toLowerCase();
  const tags = (c.tags || []).map((t) => String(t).toLowerCase());
  const tjoin = tags.join(' ');

  if (
    tags.some((t) => t.includes('healthcare')) ||
    name.includes('doctor') ||
    name.includes('nursing') ||
    name.includes('pharmacist') ||
    name.includes('dietitian') ||
    name.includes('therapist') ||
    name.includes('ayush') ||
    name.includes('occupational') ||
    name.includes('public health') ||
    name.includes('psychologist')
  ) {
    segs.add('healthcare');
  }
  if (
    name.includes('iti') ||
    name.includes('polytechnic') ||
    name.includes('electrician') ||
    name.includes('welder') ||
    name.includes('trade') ||
    name.includes('apprentice')
  ) {
    segs.add('trades');
  }
  if (
    tags.some((t) => t.includes('creative')) ||
    name.includes('designer') ||
    name.includes('animator') ||
    name.includes('journalist') ||
    name.includes('content') ||
    name.includes('youtuber') ||
    name.includes('fashion') ||
    name.includes('event manager') ||
    name.includes('marketing')
  ) {
    segs.add('creative');
  }
  if (tags.some((t) => t.includes('tech')) || name.includes('software') || name.includes('data scientist') || name.includes('cyber')) {
    segs.add('tech');
  }
  if (hasGovtTag(c)) segs.add('govt_job');
  return [...segs];
}

const extraCareers = [
  {
    id: 41,
    name: 'Dentist (BDS / MDS)',
    emoji: '🦷',
    stream: ['science'],
    segments: ['healthcare'],
    tags: ['Science', 'Healthcare', 'Govt & Private'],
    entryLPA: '4–10',
    midLPA: '10–25',
    seniorLPA: '25–80+',
    reality: 55,
    time: '5 years BDS + optional 3 years MDS',
    exams: ['NEET UG (for BDS)', 'NEET MDS (for specialisation)', 'State dental council registration'],
    paths: ['Class 12 PCB → NEET → BDS → Private practice or hospital', 'BDS → MDS (Orthodontics / Oral Surgery) → Specialist clinic'],
    skills: ['Clinical dentistry and radiograph reading', 'Practice management and patient communication', 'Infection control protocols'],
    honest:
      '<strong>Most honest fact:</strong> BDS seat competition is lower than MBBS but capitation at private dental colleges can still be high. Income varies sharply: corporate chain associate dentists often start ₹25,000–45,000/month in Tier 2, while an established own-clinic dentist in a busy area can earn several lakhs monthly after 8–12 years of reputation building.',
    cg:
      '<strong>From Chhattisgarh:</strong> Dental OPD load is rising in Raipur and Bilaspur; government dental posts come through CGVYAPAM. A dentist willing to serve smaller towns often faces less competition than in saturated metro markets.',
    typicalEmployers: ['Private dental chains', 'Multi-speciality hospitals', 'Own practice', 'CG state health posts'],
    workMode: 'mixed',
    demandOutlook: 'stable',
    salaryContext:
      'Starting packages often quoted “per month” in clinics; ₹4–10 LPA equivalent is typical for early associates outside top metros.',
  },
  {
    id: 42,
    name: 'Physiotherapist (BPT)',
    emoji: '🏃',
    stream: ['science'],
    segments: ['healthcare'],
    tags: ['Science', 'Healthcare', 'Private'],
    entryLPA: '2.5–6',
    midLPA: '6–14',
    seniorLPA: '12–35',
    reality: 78,
    time: '4.5 years BPT + optional MPT',
    exams: ['NEET at some state universities; others use merit / entrance', 'State health university BPT counselling'],
    paths: ['Class 12 PCB → BPT → Sports clinic / hospital rehab', 'BPT → MPT → Specialised neuro or sports physiotherapy'],
    skills: ['Manual therapy and exercise prescription', 'Gait and posture assessment', 'Documentation for insurance / medico-legal cases'],
    honest:
      '<strong>Most honest fact:</strong> Hospital staff physiotherapist roles can start modestly; sports teams, ortho OPDs, and home-visit rehab in affluent pockets pay better. Building repeat clientele matters more than brand of college once you are licensed.',
    cg:
      '<strong>From Chhattisgarh:</strong> Mining and industrial ergonomics, post-stroke rehab demand, and Khelo India sports infrastructure create steady need; Tier 3 towns often have fewer qualified BPTs than patients.',
    typicalEmployers: ['Corporate hospitals', 'Orthopaedic surgeons’ clinics', 'Sports academies', 'Home care agencies'],
    workMode: 'onsite',
    demandOutlook: 'strong',
    salaryContext: 'Private clinic commission models can push effective income above fixed salary in busy practices.',
  },
  {
    id: 43,
    name: 'Company Secretary (CS)',
    emoji: '📋',
    stream: ['commerce'],
    segments: [],
    tags: ['Commerce', 'Law', 'Private'],
    entryLPA: '5–12',
    midLPA: '12–28',
    seniorLPA: '30–100+',
    reality: 58,
    time: '3 years after Class 12 (CS Executive, Professional, Final) + practical training',
    exams: ['CSEET', 'CS Executive', 'CS Professional (ICSI)'],
    paths: ['Class 12 → CSEET → CS modules + training → Listed company compliance roles', 'LLB + CS (strong combo for board work)'],
    skills: ['Companies Act, SEBI LODR, corporate governance', 'Board meeting minutes and filings', 'Due diligence support'],
    honest:
      '<strong>Most honest fact:</strong> CS is narrower than CA in headcount but critical for every listed entity. Stipend during training is modest; post-membership, Mumbai / Bengaluru compliance teams pay a clear premium over very small towns.',
    cg:
      '<strong>From Chhattisgarh:</strong> PSUs, large private miners, and banks with CG offices need company secretarial support; some roles are hub-based, others hybrid with periodic travel.',
    typicalEmployers: ['Listed companies', 'Big 4 / law firms (compliance desks)', 'Large NBFCs'],
    workMode: 'hybrid',
    demandOutlook: 'stable',
    salaryContext: 'Figures assume compliance roles; independent practice varies with client portfolio.',
  },
  {
    id: 44,
    name: 'Cost & Management Accountant (CMA India)',
    emoji: '💹',
    stream: ['commerce'],
    segments: [],
    tags: ['Commerce', 'Finance', 'Private'],
    entryLPA: '4–10',
    midLPA: '10–24',
    seniorLPA: '25–70+',
    reality: 60,
    time: '~3–4 years (foundation through final) + practical training',
    exams: ['CMA Foundation / Intermediate / Final (ICMAI)'],
    paths: ['BCom parallel with CMA (common)', 'Manufacturing plant cost control → FP&A roles'],
    skills: ['Costing standards and variance analysis', 'Management reporting', 'Excel modelling', 'ERP cost modules'],
    honest:
      '<strong>Most honest fact:</strong> CMA shines in manufacturing, infra, and internal finance. It is less “household famous” than CA but can be faster for students who prefer management accounting over audit-heavy CA workloads.',
    cg:
      '<strong>From Chhattisgarh:</strong> Steel, cement, coal, and power companies around Bhilai and Korba employ cost accountants in plant finance teams.',
    typicalEmployers: ['Manufacturing', 'EPC contractors', 'Large infra', 'Conglomerate corporate centres'],
    workMode: 'onsite',
    demandOutlook: 'stable',
    salaryContext: 'Plant postings may include location allowances that improve in-hand cash.',
  },
  {
    id: 45,
    name: 'AI / ML Engineer',
    emoji: '🤖',
    stream: ['science'],
    segments: ['tech'],
    tags: ['Science', 'Tech', 'Private'],
    entryLPA: '5–12',
    midLPA: '14–32',
    seniorLPA: '35–90+',
    reality: 62,
    time: '4 years BTech + projects; many roles expect MTech / strong Kaggle / papers',
    exams: ['GATE CS / DA for MTech', 'Campus placements at tier-1/2 CS departments'],
    paths: ['BTech CSE → ML electives + internships', 'BSc Stats + Python → M.Sc. Data Science'],
    skills: ['Python (PyTorch / TensorFlow)', 'Linear algebra & probability', 'MLOps basics (Docker, CI for models)', 'Experiment tracking'],
    honest:
      '<strong>Most honest fact:</strong> “AI engineer” job titles are inflated; many openings are actually data engineering + light models. True research ML roles cluster at a few product firms and require exceptional math + portfolio.',
    cg:
      '<strong>From Chhattisgarh:</strong> Remote-first employers make this feasible from CG if latency and power backup are sorted; local internships are rarer—online open-source contributions matter.',
    typicalEmployers: ['Product startups', 'IT services AI practices', 'Auto / health / fintech R&D'],
    workMode: 'remote',
    demandOutlook: 'strong',
    salaryContext: 'Wide spread: mass recruiters with “AI” rebranding vs niche product teams differ by 2–3× at the same “years of experience”.',
  },
  {
    id: 46,
    name: 'Cybersecurity Analyst / SOC',
    emoji: '🔐',
    stream: ['science', 'any'],
    segments: ['tech'],
    tags: ['Science', 'Tech', 'Private'],
    entryLPA: '3.5–9',
    midLPA: '9–22',
    seniorLPA: '22–55',
    reality: 70,
    time: 'BTech / BCA + CEH / CompTIA Security+ / GIAC (employer-funded later)',
    exams: ['Degree campus; certifications matter more than one “national” entrance'],
    paths: ['Network admin → SOC Tier-1 analyst → Incident response', 'BTech IT + CTF competitions → Appsec'],
    skills: ['SIEM (Splunk, QRadar basics)', 'TCP/IP and Windows/Linux hardening', 'Threat intelligence triage', 'Scripting for automation'],
    honest:
      '<strong>Most honest fact:</strong> Night-shift SOC jobs are common early career; pay bumps come with cloud security (AWS/Azure certs) and incident response experience.',
    cg:
      '<strong>From Chhattisgarh:</strong> Banks and PSUs with large CG offices run security operations; many seats are vendor-managed from hubs but keep some local L1 roles.',
    typicalEmployers: ['IT services SOC', 'Banks', 'Telecom', 'MSSP vendors'],
    workMode: 'hybrid',
    demandOutlook: 'strong',
    salaryContext: 'Shift allowances can add 10–20% to CTC in 24×7 SOCs.',
  },
  {
    id: 47,
    name: 'Civil Judge (Judicial Services)',
    emoji: '⚖️',
    stream: ['arts', 'any'],
    segments: ['govt_job'],
    tags: ['Arts', 'Govt Job', 'Law'],
    entryLPA: '8–14+',
    midLPA: '16–24+',
    seniorLPA: '22–40+',
    reality: 35,
    time: 'LLB + 2–4 years focused judicial services prep',
    exams: [
      'State Judicial Service Examination (state-specific cadre — verify current High Court / PSC notification)',
      'Prelims → Mains → Viva',
    ],
    paths: ['BA LLB → Judicial services', 'LLB → Practice briefly → Judicial prep'],
    skills: ['Bare Act mastery', 'Judgment writing', 'Procedural law speed', 'Local language court work'],
    honest:
      '<strong>Most honest fact:</strong> Vacancies per year are small and preparation is as intense as top PSC exams; starting salary is respectable but the real draw is prestige and pensioned career.',
    cg:
      '<strong>From Chhattisgarh:</strong> Hindi and Chhattisgarhi courtroom comfort is a practical edge in lower judiciary postings in the state.',
    typicalEmployers: ['State judiciary'],
    workMode: 'onsite',
    demandOutlook: 'stable',
    salaryContext: 'Plus official residence / vehicle entitlements at senior cadres—compare total package, not basic alone.',
  },
  {
    id: 48,
    name: 'Scientist / Technical Officer (CSIR / Labs)',
    emoji: '🔬',
    stream: ['science'],
    segments: ['govt_job', 'tech'],
    tags: ['Science', 'Govt Job', 'Research'],
    entryLPA: '6–12',
    midLPA: '12–22',
    seniorLPA: '20–40',
    reality: 45,
    time: 'MSc / MTech + NET / GATE + recruitment exam',
    exams: ['CSIR labs recruitment', 'ICMR / DRDO allied technical posts', 'GATE'],
    paths: ['MSc Chemistry / Life Sciences → Project assistant → SRF → Scientist', 'MTech → lab technical officer'],
    skills: ['Lab instrumentation', 'Grant writing', 'Publication record', 'Safety compliance'],
    honest:
      '<strong>Most honest fact:</strong> Stability and pension track beat private R&D for risk-averse learners; cash salary may lag industry until senior grades.',
    cg:
      '<strong>From Chhattisgarh:</strong> Fewer lab HQs inside CG itself, but all-India postings with seniority-based transfers are common—plan mobility.',
    typicalEmployers: ['CSIR', 'ICMR institutes', 'DRDO technical cadre', 'State forensic labs'],
    workMode: 'onsite',
    demandOutlook: 'stable',
    salaryContext: 'Includes HRA by city class; scientists in Class X cities see higher components.',
  },
  {
    id: 49,
    name: 'Agricultural Officer / Extension (State Services)',
    emoji: '🌾',
    stream: ['science', 'any'],
    segments: ['govt_job'],
    tags: ['Science', 'Govt Job', 'Any Stream'],
    entryLPA: '5–9',
    midLPA: '9–16',
    seniorLPA: '14–24',
    reality: 65,
    time: 'BSc Agriculture / Horticulture + state PSC agriculture cadre',
    exams: ['CGPSC / state agriculture service exams', 'IBPS AFO (for banking agriculture field officer track)'],
    paths: ['BSc Ag → State agriculture officer', 'BSc Ag → MBA Agribusiness → private agri-input firms'],
    skills: ['Crop science', 'Soil testing interpretation', 'Scheme implementation on ground', 'Farmer training'],
    honest:
      '<strong>Most honest fact:</strong> Field postings are physically demanding but politically visible—good for impact-focused students.',
    cg:
      '<strong>From Chhattisgarh:</strong> Paddy, maize, millets, and forest produce value chains give local context questions an edge for CGPSC agri aspirants.',
    typicalEmployers: ['State agriculture dept', 'NABARD allied projects', 'Agri-input companies'],
    workMode: 'onsite',
    demandOutlook: 'stable',
    salaryContext: 'Government scales follow pay commission revisions; arrears can temporarily spike reported “annual” numbers in news.',
  },
  {
    id: 50,
    name: 'Medical Lab Technologist (BMLT / DMLT)',
    emoji: '🧪',
    stream: ['science'],
    segments: ['healthcare'],
    tags: ['Science', 'Healthcare', 'Private'],
    entryLPA: '2–5',
    midLPA: '4–10',
    seniorLPA: '8–18',
    reality: 85,
    time: '3 years BMLT or 2 years DMLT',
    exams: ['State paramedical entrances', 'Some institutes use NEET scores'],
    paths: ['DMLT → Hospital lab technician', 'BMLT → QC in diagnostics chains'],
    skills: ['Haematology / biochemistry analysers', 'Sample handling and QC logs', 'Biosafety'],
    honest:
      '<strong>Most honest fact:</strong> Shift work in diagnostics is common; automation reduces headcount growth but raises skill bar for maintenance and QC roles.',
    cg:
      '<strong>From Chhattisgarh:</strong> District hospital labs and private chains expanding in Raipur corridor hire steadily.',
    typicalEmployers: ['Diagnostic chains', 'Government hospital labs', 'Blood banks'],
    workMode: 'onsite',
    demandOutlook: 'stable',
    salaryContext: 'Night differential in some corporate labs.',
  },
  {
    id: 51,
    name: 'Radiographer / Imaging Technologist',
    emoji: '🩻',
    stream: ['science'],
    segments: ['healthcare'],
    tags: ['Science', 'Healthcare', 'Private'],
    entryLPA: '2.5–6',
    midLPA: '5–12',
    seniorLPA: '10–22',
    reality: 80,
    time: '3–4 years BSc Medical Radiology / Imaging Technology',
    exams: ['University / state entrance; AIIMS institutes have separate paramedical counselling'],
    paths: ['BSc MIT → CT/MRI suite technician', 'Super-speciality hospital imaging teams'],
    skills: ['Radiation safety', 'Patient positioning', 'PACS workflow', 'Contrast protocol basics under radiologist orders'],
    honest:
      '<strong>Most honest fact:</strong> MRI/CT suite skills command premium over general X-ray-only roles; radiation safety certification is non-negotiable.',
    cg:
      '<strong>From Chhattisgarh:</strong> New tertiary hospitals increase demand faster than graduate supply in some years—check course recognition before enrolling.',
    typicalEmployers: ['Multi-speciality hospitals', 'Diagnostic imaging centres'],
    workMode: 'onsite',
    demandOutlook: 'strong',
    salaryContext: 'Metro corporate hospitals at higher end of ranges; Tier 3 at lower end.',
  },
  {
    id: 52,
    name: 'Veterinarian (BVSc)',
    emoji: '🐄',
    stream: ['science'],
    segments: ['healthcare'],
    tags: ['Science', 'Healthcare', 'Govt & Private'],
    entryLPA: '4–9',
    midLPA: '8–18',
    seniorLPA: '15–40',
    reality: 58,
    time: '5.5 years BVSc & AH',
    exams: ['NEET UG for veterinary seats (India)'],
    paths: ['BVSc → Government veterinary officer', 'BVSc → Poultry / dairy industry', 'BVSc → Own practice'],
    skills: ['Large and small animal medicine', 'Epidemics and vaccination drives', 'Animal husbandry schemes'],
    honest:
      '<strong>Most honest fact:</strong> Government veterinary officer posts are stable but not as numerous as human healthcare roles; private poultry integration can pay well but has biosecurity stress.',
    cg:
      '<strong>From Chhattisgarh:</strong> Livestock economy in rural CG keeps field veterinary roles relevant; postings can be rural-heavy early career.',
    typicalEmployers: ['State animal husbandry dept', 'Poultry integrators', 'Dairy cooperatives'],
    workMode: 'mixed',
    demandOutlook: 'stable',
    salaryContext: 'Industry roles may include performance-linked bonuses during high production seasons.',
  },
  {
    id: 53,
    name: 'Interior Designer / Spatial Designer',
    emoji: '🛋️',
    stream: ['any'],
    segments: ['creative'],
    tags: ['Any Stream', 'Creative', 'Private'],
    entryLPA: '2.5–6',
    midLPA: '6–16',
    seniorLPA: '15–45+',
    reality: 72,
    time: '3–4 years B.Des Interior / diploma + apprenticeship',
    exams: ['NID / NIFT / CEED for design schools', 'Portfolio-based hiring dominates later'],
    paths: ['Design school → Studio associate', 'Any degree + AutoCAD + site supervision → contractor-linked designer'],
    skills: ['AutoCAD / SketchUp', 'Material costing', 'Lighting basics', 'Client change-request management'],
    honest:
      '<strong>Most honest fact:</strong> Real estate cycles swing income; designers who can execute site coordination get paid more than pure concept-only roles.',
    cg:
      '<strong>From Chhattisgarh:</strong> Naya Raipur and smart-city linked residential boom created pockets of high-ticket residential projects.',
    typicalEmployers: ['Architect firms', 'Retail rollout agencies', 'Independent studio'],
    workMode: 'onsite',
    demandOutlook: 'cyclical',
    salaryContext: 'Commission on material passes through varies—clarify ethics and written contracts.',
  },
  {
    id: 54,
    name: 'Sales / Business Development (B2B)',
    emoji: '🤝',
    stream: ['commerce', 'any'],
    segments: [],
    tags: ['Commerce', 'Any Stream', 'Private'],
    entryLPA: '3–8',
    midLPA: '8–20',
    seniorLPA: '18–50+',
    reality: 82,
    time: 'Any graduation + on-job training; MBA helps at account manager level',
    exams: ['Campus placements; no single national exam'],
    paths: ['BCom → FMCG sales trainee', 'BTech → Industrial B2B sales (components, machinery)'],
    skills: ['Pipeline CRM discipline', 'Negotiation', 'Territory planning', 'Basic finance for pricing'],
    honest:
      '<strong>Most honest fact:</strong> Variable pay (incentives) can double CTC in good years or vanish in bad quarters—ask recruiters for fixed vs variable split.',
    cg:
      '<strong>From Chhattisgarh:</strong> Industrial belts need components, consumables, and logistics services sold by field teams based in Raipur / Korba / Bhilai.',
    typicalEmployers: ['FMCG', 'Cement / steel trading', 'IT services account mining'],
    workMode: 'mixed',
    demandOutlook: 'stable',
    salaryContext: 'Entry “CTC” with high variable may list ₹7 LPA but fixed can be ₹4.5 LPA—read offer letters carefully.',
  },
  {
    id: 55,
    name: 'Welder / Fabricator (Advanced trades)',
    emoji: '🔥',
    stream: ['any'],
    segments: ['trades'],
    tags: ['Any Stream', 'Technical', 'Private'],
    entryLPA: '2–5',
    midLPA: '5–12',
    seniorLPA: '10–22',
    reality: 88,
    time: 'ITI Welder + apprenticeship / NSQF diplomas',
    exams: ['ITI merit lists', 'Company apprenticeship boards'],
    paths: ['ITI → Shipyard / heavy fabrication shop', 'Multi-skill (welding + fitting) for maintenance teams'],
    skills: ['WPS / WQT documentation awareness', 'NDT coordination', 'Safety in confined spaces'],
    honest:
      '<strong>Most honest fact:</strong> Certified welders for pressure vessels and stainless TIG can earn overseas-linked wages on project sites; unskilled imitation welding pays poorly and is unsafe.',
    cg:
      '<strong>From Chhattisgarh:</strong> Fabrication workshops serving mining and plant shutdowns value multi-trade technicians.',
    typicalEmployers: ['EPC contractors', 'Steel fabrication yards', 'Plant maintenance contractors'],
    workMode: 'onsite',
    demandOutlook: 'stable',
    salaryContext: 'Project sites may include per-diem; check PF/ESI compliance on contractor rolls.',
  },
  {
    id: 56,
    name: 'Chef / Culinary Professional',
    emoji: '👨‍🍳',
    stream: ['any'],
    segments: ['creative'],
    tags: ['Any Stream', 'Private', 'Service'],
    entryLPA: '2–5',
    midLPA: '5–14',
    seniorLPA: '12–40+',
    reality: 75,
    time: 'Diploma / degree from IHM or craft certificate + kitchen stages',
    exams: ['NCHM JEE for IHM', 'Direct apprenticeship in hotel kitchens'],
    paths: ['Commis → CDP → Sous Chef → Executive Chef', 'Cloud kitchen → own brand'],
    skills: ['Mise en place speed', 'Costing per plate', 'Hygiene audits', 'Menu R&D'],
    honest:
      '<strong>Most honest fact:</strong> Kitchen heat and long hours are real; cruise and Middle East postings can multiply savings if you tolerate contracts.',
    cg:
      '<strong>From Chhattisgarh:</strong> Resort and highway hospitality growth needs trained CDPs, not only interns.',
    typicalEmployers: ['Hotels', 'QSR chains', 'Catering', 'Cruise lines'],
    workMode: 'onsite',
    demandOutlook: 'strong',
    salaryContext: 'Tips and service charge policies differ by employer—ask HR explicitly.',
  },
  {
    id: 57,
    name: 'Electrical Engineer (Power Systems)',
    emoji: '⚙️',
    stream: ['science'],
    segments: ['tech'],
    tags: ['Science', 'Engineering', 'Govt & Private'],
    entryLPA: '3.5–8',
    midLPA: '8–18',
    seniorLPA: '18–40',
    reality: 72,
    time: '4 years BTech Electrical + GATE for PSUs',
    exams: ['GATE EE', 'State GENCO / TRANSCO recruitment'],
    paths: ['BTech EE → OEM (switchgear, motors)', 'BTech EE → Power utility maintenance'],
    skills: ['Load flow basics', 'Protection relays', 'SCADA exposure', 'Safety tagging (LOTO)'],
    honest:
      '<strong>Most honest fact:</strong> Utility and OEM roles differ: utilities emphasise shift operations and seniority; OEMs emphasise travel commissioning.',
    cg:
      '<strong>From Chhattisgarh:</strong> NTPC, CSPTCL, and large industries maintain strong electrical maintenance teams in Korba / Raipur corridors.',
    typicalEmployers: ['Power utilities', 'NTPC', 'OEMs', 'EPC'],
    workMode: 'onsite',
    demandOutlook: 'stable',
    salaryContext: 'PSU CTC includes allowances; compare with private on-call overtime norms.',
  },
  {
    id: 58,
    name: 'Clinical Research Associate (CRA)',
    emoji: '📝',
    stream: ['science', 'any'],
    segments: ['healthcare', 'tech'],
    tags: ['Science', 'Healthcare', 'Private'],
    entryLPA: '3.5–7',
    midLPA: '8–16',
    seniorLPA: '16–30',
    reality: 68,
    time: 'BPharm / BSc Life Sciences + certification (ICH-GCP) + monitoring exposure',
    exams: ['Campus + walk-in; GCP training certificates'],
    paths: ['CRC site coordinator → CRA', 'Clinical data associate → CRA'],
    skills: ['ICH-GCP', 'Source data verification', 'Regulatory filing support', 'Travel stamina'],
    honest:
      '<strong>Most honest fact:</strong> CRA life is travel-heavy; pays better than bench roles for same base degree if you can handle airports weekly.',
    cg:
      '<strong>From Chhattisgarh:</strong> Few CRA hubs physically in CG; remote monitoring grew post-COVID—verify employer travel policy.',
    typicalEmployers: ['CROs', 'Pharma R&D', 'Hospital trial units'],
    workMode: 'hybrid',
    demandOutlook: 'stable',
    salaryContext: 'Allowances for travel reimbursements can inflate “CTC” vs fixed.',
  },
];

const merged = new Map();
for (const c of careers) merged.set(c.id, Object.assign({}, c));
for (const c of extraCareers) {
  const prev = merged.get(c.id) || {};
  const row = Object.assign({}, prev, c);
  if (!row.segments || row.segments.length === 0) {
    row.segments = inferSegments(row);
  }
  merged.set(c.id, row);
}
const all = [...merged.keys()]
  .sort((a, b) => a - b)
  .map((id) => merged.get(id));
for (const c of all) {
  if (!c.segments || c.segments.length === 0) c.segments = inferSegments(c);
}

const meta = {
  last_updated: '2026-05-04',
  version: '2.0',
  dataYear: 2026,
  title: 'Career & Salary Explorer',
  heroBlurb:
    'Browse careers with indicative India salary bands, which stream fits, which exams matter, how long entry takes, and an honest reality check. Every career includes a note for students from Chhattisgarh. Figures are ranges—not guarantees.',
  salaryDisclaimer:
    'Salary figures are approximate ranges based on public reports (AmbitionBox, Glassdoor, LinkedIn Salary) and India skills reports. Actual pay varies with college tier, city, company, and performance. Top bands reflect exceptional cases—use mid ranges for planning. Career decisions should involve your parents, teachers, and a qualified counsellor who knows your specific situation.',
  filterDefinitions: [
    { id: 'all', label: 'All', emoji: '' },
    { id: 'science', label: 'Science', emoji: '🔬' },
    { id: 'commerce', label: 'Commerce', emoji: '📊' },
    { id: 'arts', label: 'Arts', emoji: '🎨' },
    { id: 'govt', label: 'Govt Job', emoji: '🏛️' },
    { id: 'any', label: 'Any Stream', emoji: '✅' },
    { id: 'healthcare', label: 'Healthcare', emoji: '🩺' },
    { id: 'trades', label: 'Trades & ITI', emoji: '🔧' },
    { id: 'creative', label: 'Creative & Media', emoji: '✨' },
    { id: 'tech', label: 'Tech & Digital', emoji: '💻' },
  ],
};

const payload = { meta, careers: all };
const serialized = JSON.stringify(payload, null, 2);
const nextHash = crypto.createHash('sha256').update(serialized).digest('hex');
let prevHash = null;
if (fs.existsSync(outPath)) {
  prevHash = crypto.createHash('sha256').update(fs.readFileSync(outPath, 'utf8')).digest('hex');
}
if (prevHash === nextHash) {
  console.log('Salary explorer JSON unchanged — skipped write:', outPath, 'careers:', all.length);
  process.exit(0);
}
fs.writeFileSync(outPath, serialized, 'utf8');
console.log('Wrote', outPath, 'careers:', all.length);
