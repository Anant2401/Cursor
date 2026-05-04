/**
 * Appends new anchors to course_plan_b.anchors (by id, no duplicates).
 */
const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'DB', 'pehchaan_plan_b_strategy_builder_data.json');
const d = JSON.parse(fs.readFileSync(p, 'utf8'));

const link = (label, url) => ({ label, url });

const newAnchors = [
  {
    id: 'clat_law_miss',
    title: 'I prepared for CLAT / law entrance but may miss NLU dream campus',
    context:
      'Legal reasoning, constitution, and language skills still map to compliance, content, HR policy, and paralegal ladders — plus horizontal law degrees.',
    alternatives: [
      {
        title: 'BA LLB / BBA LLB at strong state private universities (verify Bar Council approval)',
        duration: '5 years typical',
        cost_compare:
          'Often significantly lower total fee than top NLU hostel+fee stacks in the same city tier — but placement variance is higher; verify placement cell PDFs.',
        job_family: 'Litigation support, in-house legal assistant, compliance trainee, content moderation policy teams',
        how_to: [
          'Check BCI approval list for the exact campus before paying token.',
          'Intern at district court + startup legal desk in different summers.',
          'Build one memo portfolio on a consumer or tenancy law topic.'
        ],
        links: [
          link('BCI (Bar Council of India)', 'https://www.barcouncilofindia.org/'),
          link('CLAT Consortium (official)', 'https://consortiumofnlus.ac.in/')
        ]
      },
      {
        title: 'B.Com LLB / integrated programmes where interest matches',
        duration: '5 years',
        cost_compare: 'Compare with pure B.Com + LLB 3+3 total duration and fees in your state.',
        job_family: 'Corporate law support, tax assistant, company secretary track synergy',
        how_to: ['If CS appeals, map subjects to ICSI foundation timeline.', 'Use internship to see if you prefer desk research vs court work.'],
        links: [link('ICSI', 'https://www.icsi.edu/')]
      },
      {
        title: 'Paralegal / legal researcher certificate + graduation in any discipline',
        duration: '6–12 month add-on after UG (varies)',
        cost_compare: 'Lower than a second full law degree if you already have a UG.',
        job_family: 'Law firm research, compliance databases, contract abstraction',
        how_to: ['Shortlist NUJS / NLSIU-style online diplomas if offered — verify recognition with employers.', 'Pair with LinkedIn portfolio of case summaries.'],
        links: [link('Naukri — legal researcher', 'https://www.naukri.com/legal-researcher-jobs-in-india')]
      }
    ]
  },
  {
    id: 'ca_path_uncertain',
    title: 'I am on CA / CMA / CS foundation but unsure about final qualification cost or pace',
    context: 'Accountancy foundation maps to Tally, GST, bookkeeping, internal audit support, and ERP data roles.',
    alternatives: [
      {
        title: 'CMA (Cost Management Accountant) or CS (Company Secretary) as parallel structure',
        duration: 'Foundation → intermediate → final (each institute has own calendar)',
        cost_compare: 'Compare all-in coaching + exam fees across ICAI / ICMAI / ICSI for your city; sometimes one route has fewer papers overlap with your strengths.',
        job_family: 'Costing, secretarial compliance, board filing support',
        how_to: ['Download all three institutes’ syllabi PDFs in one folder — mark overlapping papers.', 'Talk to one working CA, one CMA, one CS for 30 minutes each — ask what they dislike daily.'],
        links: [link('ICAI', 'https://www.icai.org/'), link('ICMAI', 'https://icmai.in/'), link('ICSI', 'https://www.icsi.edu/')]
      },
      {
        title: 'B.Com + GST practitioner + Tally / Zoho Books practice',
        duration: '3 years UG + 3–6 months cert',
        cost_compare: 'Often lowest cash path to earning while you decide on CA final attempt.',
        job_family: 'Junior accountant, GST return preparer, MIS for CA firms',
        how_to: ['Register MSME clients for friends and family pro bono first 5 filings — portfolio.', 'Join local CA firm as article helper if rules allow in your state.'],
        links: [link('GST portal', 'https://www.gst.gov.in/')]
      }
    ]
  },
  {
    id: 'design_nift_miss',
    title: 'I aimed for NIFT / UCEED / top design campus but may miss my first choice',
    context: 'Portfolio and visual thinking matter more than one exam day for many commercial design jobs.',
    alternatives: [
      {
        title: 'B.Des from other UGC-recognised institutes + aggressive Behance / Instagram portfolio',
        duration: '4 years',
        cost_compare: 'Private B.Des fees vary 3–8× inside same city — compare credit hours in studio subjects, not brochure photos alone.',
        job_family: 'Graphic designer, UI designer, packaging, visual merchandising',
        how_to: ['Save 20 process photos per project (sketch → prototype).', 'Do one real client project free for local NGO — case study beats marks.'],
        links: [link('NIFT official', 'https://www.nift.ac.in/'), link('NIRF Design', 'https://www.nirfindia.org/')]
      },
      {
        title: 'Diploma in design + lateral / bridge to UG (where offered)',
        duration: '2–3 + bridge years (verify)',
        cost_compare: 'Staggered fee; can start freelancing earlier.',
        job_family: 'Same with stronger need for portfolio proof',
        how_to: ['Verify AICTE / state board recognition for diploma.', 'Enter national student design challenges with team.'],
        links: [link('WorldSkills India (awareness)', 'https://www.worldskillsindia.co.in/')]
      }
    ]
  },
  {
    id: 'agri_icar_miss',
    title: 'I aimed for ICAR / B.Sc Agriculture top campuses but may miss first counselling round',
    context: 'Agri + biology + chemistry foundation maps to food quality, agritech, extension, and state department roles.',
    alternatives: [
      {
        title: 'B.Sc Agriculture / Horticulture / Forestry from state agricultural universities',
        duration: '4 years',
        cost_compare: 'State varsities often much lower fee than private agri colleges; compare hostel + field tour costs.',
        job_family: 'Agronomist trainee, food QA, seed sales technical, bank agri officer prep',
        how_to: ['Visit KVK (Krishi Vigyan Kendra) summer project — free credibility on CV.', 'Learn basic GIS on QGIS free.'],
        links: [link('ICAR (agriculture education)', 'https://icar.org.in/')]
      },
      {
        title: 'Diploma in agriculture / horticulture → B.Sc lateral where available',
        duration: '2–3 + lateral pattern (verify)',
        cost_compare: 'Lower peak yearly fee; earning in agri-input dealerships possible earlier.',
        job_family: 'Field officer, extension assistant, supply chain for FPOs',
        how_to: ['Map state agricultural department apprentice notifications.', 'Pair with Excel for yield data dashboards.'],
        links: [link('National Career Service', 'https://www.ncs.gov.in/')]
      }
    ]
  },
  {
    id: 'commerce_bcom_mba',
    title: 'I want commerce career but not sure B.Com → MBA vs integrated B.Com+MBA vs professional course',
    context: 'Clarity on time, money, and exam load (CAT later) reduces family conflict.',
    alternatives: [
      {
        title: 'B.Com (Hons) + CAT after 3rd year + MBA',
        duration: '3 + 2 years MBA typical',
        cost_compare: 'Spreads MBA fee later; you can earn internship money in UG if you pick employable minors (data, tax).',
        job_family: 'Finance ops, analyst, sales ops, HR graduate trainee',
        how_to: ['Pick one quantitative minor: Excel + SQL.', 'Run live club budget for college fest — real portfolio.'],
        links: [link('Naukri — finance fresher', 'https://www.naukri.com/finance-fresher-jobs-in-india')]
      },
      {
        title: 'Integrated B.Com–MBA (5 years) where offered',
        duration: '5 years integrated',
        cost_compare: 'One admission cycle; compare total 5-year fee vs separate B.Com + MBA in same institution group.',
        job_family: 'Same graduate trainee pipelines if institute has recruiter relationships',
        how_to: ['Ask for list of recruiters last 3 years with student count placed.', 'Verify AICTE/UGC recognition category on offer letter.'],
        links: [link('UGC', 'https://www.ugc.gov.in/')]
      },
      {
        title: 'B.Com + US CPA / ACCA / Indian CMA modules (pick one with mentor)',
        duration: 'UG parallel modules over 2–4 years',
        cost_compare: 'Exam dollar fees + coaching can rival private MBA prep — build spreadsheet before committing.',
        job_family: 'Accounting advisory, MNC shared services, risk',
        how_to: ['Never pay for all levels upfront — pass one paper, then fund next.', 'Join study pair for discipline.'],
        links: [link('ICAI CA', 'https://www.icai.org/'), link('IFRS resources (awareness)', 'https://www.ifrs.org/')]
      }
    ]
  },
  {
    id: 'upsc_parallel_credentials',
    title: 'I am deep into UPSC GS but want parallel credentials without killing prep time',
    context: 'Policy + writing skills map to short diplomas and freelance that reinforce rather than distract.',
    alternatives: [
      {
        title: 'One-year PG Diploma in Public Policy / Development (weekend or online — verify)',
        duration: '1 year part-time common pattern',
        cost_compare: 'Often ₹30k–1.5L depending on institute — compare to one test series package + mocks; pick only if schedule honest.',
        job_family: 'Research assistant, NGO M&E, content editor',
        how_to: ['Choose programme with assignments that reuse your optional notes.', 'Cap weekly hours in calendar before enrolling.'],
        links: [link('PRS India (policy reading)', 'https://prsindia.org/')]
      },
      {
        title: 'Certificate in data tools (Power BI + Sheets) for policy data roles',
        duration: '6–10 weeks',
        cost_compare: 'Mostly free tiers; paid cert under ₹10k often.',
        job_family: 'MIS for think-tanks, survey data cleaning, dashboard roles',
        how_to: ['Use data.gov.in dataset identical to a PYQ theme — one dashboard project.', 'Post on LinkedIn with methodology thread.'],
        links: [link('Microsoft Learn — Power BI', 'https://learn.microsoft.com/en-us/power-bi/')]
      }
    ]
  }
];

const existing = new Set((d.course_plan_b.anchors || []).map((a) => a.id));
let n = 0;
newAnchors.forEach((a) => {
  if (!existing.has(a.id)) {
    d.course_plan_b.anchors.push(a);
    existing.add(a.id);
    n++;
  }
});
d.last_updated = '2026-05-04';
d.data_notes = (d.data_notes || '') + ' course_plan_b expanded with additional anchors.';
fs.writeFileSync(p, JSON.stringify(d, null, 2), 'utf8');
console.log('Course anchors added:', n, '| Total anchors:', d.course_plan_b.anchors.length);
