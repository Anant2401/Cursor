/**
 * Expands college_plan_b.states and college_plan_b.bundles.
 * Run from repo: node scripts/extend-college-bundles.cjs
 */
const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'DB', 'pehchaan_plan_b_strategy_builder_data.json');
const d = JSON.parse(fs.readFileSync(p, 'utf8'));

const extraStates = [
  { id: 'MH', label: 'Maharashtra', only_for_lens: 'state_comfort' },
  { id: 'KA', label: 'Karnataka', only_for_lens: 'state_comfort' },
  { id: 'TN', label: 'Tamil Nadu', only_for_lens: 'state_comfort' },
  { id: 'TS', label: 'Telangana', only_for_lens: 'state_comfort' },
  { id: 'UP', label: 'Uttar Pradesh', only_for_lens: 'state_comfort' },
  { id: 'RJ', label: 'Rajasthan', only_for_lens: 'state_comfort' },
  { id: 'WB', label: 'West Bengal', only_for_lens: 'state_comfort' },
  { id: 'OD', label: 'Odisha', only_for_lens: 'state_comfort' },
  { id: 'MP', label: 'Madhya Pradesh', only_for_lens: 'state_comfort' }
];

const existingIds = new Set(d.college_plan_b.states.map((s) => s.id));
extraStates.forEach((s) => {
  if (!existingIds.has(s.id)) d.college_plan_b.states.push(s);
});

const link = (label, url) => ({ label, url });

const extraBundles = [
  {
    stream_id: 'engineering',
    lens_id: 'state_comfort',
    state_id: 'MH',
    title: 'Engineering — Maharashtra comfort picks (examples)',
    summary:
      'Maharashtra has strong state universities, autonomous colleges in Mumbai/Pune clusters, and multiple admission channels (MHT-CET / JEE / institute-level — verify current year Information Brochures). Compare total 4-year cost including hostel.',
    tiers: [
      {
        tier_title: 'Tier A — flagship & INI in / near Maharashtra',
        colleges: [
          {
            name: 'IIT Bombay',
            location: 'Mumbai',
            nirf_band: 'Among top Engineering institutes in India — verify NIRF year',
            type: 'IIT',
            notes: 'JEE Advanced; extremely competitive. Strong alumni network for internships.',
            links: [link('IIT Bombay', 'https://www.iitb.ac.in/'), link('JoSAA', 'https://josaa.nic.in/')]
          },
          {
            name: 'ICT Mumbai (Institute of Chemical Technology)',
            location: 'Mumbai',
            nirf_band: 'Strong in Pharmacy/Chemical Eng — verify Engineering table',
            type: 'Deemed / statutory',
            notes: 'Niche excellence; read branch-wise placements vs generic B.Tech.',
            links: [link('ICT Mumbai', 'https://www.ictmumbai.edu.in/')]
          },
          {
            name: 'VNIT Nagpur',
            location: 'Nagpur',
            nirf_band: 'NIT — verify NIRF band yearly',
            type: 'NIT',
            notes: 'JoSAA; good core-branch ecosystem outside metros.',
            links: [link('VNIT Nagpur', 'https://vnit.ac.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier B — strong state & autonomous colleges',
        colleges: [
          {
            name: 'COEP Technological University (COEP)',
            location: 'Pune',
            nirf_band: 'Verify NIRF Engineering rank yearly',
            type: 'State university',
            notes: 'Historic brand in Pune; check MHT-CET vs other quotas.',
            links: [link('COEP', 'https://www.coep.org.in/')]
          },
          {
            name: 'VJTI Mumbai',
            location: 'Mumbai',
            nirf_band: 'Verify NIRF',
            type: 'State aided autonomous',
            notes: 'Competitive cutoffs; strong recruiter footfall for core branches.',
            links: [link('VJTI', 'https://vjti.ac.in/')]
          },
          {
            name: 'Walchand College of Engineering (WCE)',
            location: 'Sangli',
            nirf_band: 'Verify NIRF',
            type: 'Autonomous (affiliated)',
            notes: 'Good ROI story for many students — still verify placements by branch.',
            links: [link('WCE Sangli', 'https://www.wce.ac.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier C — solid private & university-affiliated (do diligence)',
        colleges: [
          {
            name: 'SPPU-affiliated / private universities in Pune–Mumbai corridor',
            location: 'Maharashtra',
            nirf_band: 'Wide variance',
            type: 'Private / university',
            notes: 'Ask for NBA branch accreditation, audited placement PDF, and fee refund rules.',
            links: [link('SPPU (Savitribai Phule Pune University)', 'https://www.unipune.ac.in/'), link('AICTE CAMP', 'https://facilities.aicte-india.org/')]
          }
        ]
      }
    ]
  },
  {
    stream_id: 'engineering',
    lens_id: 'state_comfort',
    state_id: 'KA',
    title: 'Engineering — Karnataka comfort picks (examples)',
    summary:
      'Karnataka has a dense engineering ecosystem (Bangalore + regional hubs). Admission mixes KCET, COMEDK, JEE, and institute rules — verify domicile and fee structures every year.',
    tiers: [
      {
        tier_title: 'Tier A — INI / top national draw in state',
        colleges: [
          {
            name: 'IISc Bangalore (UG programmes where applicable)',
            location: 'Bengaluru',
            nirf_band: 'Top research institute — verify UG entry routes yearly',
            type: 'Deemed university / INI',
            notes: 'Not a generic B.Tech factory — read programme brochures carefully.',
            links: [link('IISc', 'https://www.iisc.ac.in/')]
          },
          {
            name: 'NITK Surathkal',
            location: 'Mangaluru (coastal Karnataka)',
            nirf_band: 'Strong NIT — verify NIRF',
            type: 'NIT',
            notes: 'JoSAA; coastal campus — check branch vs location preferences.',
            links: [link('NITK', 'https://www.nitk.ac.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier B — well-known Bengaluru & state colleges',
        colleges: [
          {
            name: 'RV College of Engineering (RVCE)',
            location: 'Bengaluru',
            nirf_band: 'Often cited in NIRF — verify year',
            type: 'Private autonomous (affiliated)',
            notes: 'High demand; compare 4-year total cost vs NIT out-of-state.',
            links: [link('RVCE', 'https://www.rvce.edu.in/')]
          },
          {
            name: 'PES University / PESCE (verify campus)',
            location: 'Bengaluru',
            nirf_band: 'Verify NIRF',
            type: 'Private',
            notes: 'Multiple campuses — confirm which campus your seat maps to.',
            links: [link('PES University', 'https://pes.edu/')]
          },
          {
            name: 'BMS College of Engineering',
            location: 'Bengaluru',
            nirf_band: 'Verify NIRF',
            type: 'Private aided / autonomous',
            notes: 'Check COMEDK vs KCET fee differences.',
            links: [link('BMSCE', 'https://bmsce.ac.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier C — accredited options + your portfolio',
        colleges: [
          {
            name: 'VTU-affiliated colleges across Karnataka',
            location: 'Multiple cities',
            nirf_band: 'Wide',
            type: 'Affiliated',
            notes: 'VTU reforms change often — verify grading, MOOCs, and internship support.',
            links: [link('VTU', 'https://vtu.ac.in/'), link('NIRF', 'https://www.nirfindia.org/')]
          }
        ]
      }
    ]
  },
  {
    stream_id: 'engineering',
    lens_id: 'state_comfort',
    state_id: 'TN',
    title: 'Engineering — Tamil Nadu comfort picks (examples)',
    summary:
      'Tamil Nadu combines Anna University-affiliated colleges, autonomous institutions, and strong public brands. TNEA / JoSAA / JEE roles differ by institute — read official prospectus.',
    tiers: [
      {
        tier_title: 'Tier A — IIT / top national in TN',
        colleges: [
          {
            name: 'IIT Madras',
            location: 'Chennai',
            nirf_band: 'Among top Engineering institutes — verify NIRF',
            type: 'IIT',
            notes: 'JEE Advanced; research + placement ecosystem.',
            links: [link('IIT Madras', 'https://www.iitm.ac.in/')]
          },
          {
            name: 'NIT Tiruchirappalli',
            location: 'Tiruchirappalli',
            nirf_band: 'Top NIT band — verify yearly',
            type: 'NIT',
            notes: 'JoSAA; strong peer group across branches.',
            links: [link('NIT Trichy', 'https://www.nitt.edu/')]
          }
        ]
      },
      {
        tier_title: 'Tier B — Anna University & autonomous colleges',
        colleges: [
          {
            name: 'College of Engineering, Guindy (CEG) — Anna University',
            location: 'Chennai',
            nirf_band: 'Verify NIRF / state ranking',
            type: 'State',
            notes: 'Historic brand; check TNEA cutoffs and campus allotment.',
            links: [link('Anna University', 'https://www.annauniv.edu/')]
          },
          {
            name: 'PSG College of Technology',
            location: 'Coimbatore',
            nirf_band: 'Verify NIRF',
            type: 'Autonomous',
            notes: 'Strong industry connect in Western TN belt.',
            links: [link('PSG Tech', 'https://www.psgtech.edu/')]
          },
          {
            name: 'SSN College of Engineering',
            location: 'Kalavakkam (near Chennai)',
            nirf_band: 'Verify NIRF',
            type: 'Private',
            notes: 'Ask for median package by branch and internship mandate.',
            links: [link('SSN', 'https://www.ssn.edu.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier C — wide affiliated network',
        colleges: [
          {
            name: 'Affiliated engineering colleges under Anna University',
            location: 'Tamil Nadu',
            nirf_band: 'Wide',
            type: 'Affiliated',
            notes: 'Use NBA branch data + NIRF where listed; build GitHub + internships early.',
            links: [link('Anna University affiliated info', 'https://www.annauniv.edu/')]
          }
        ]
      }
    ]
  },
  {
    stream_id: 'engineering',
    lens_id: 'state_comfort',
    state_id: 'TS',
    title: 'Engineering — Telangana comfort picks (examples)',
    summary:
      'Hyderabad is a major tech hub; options span IIT-H, IIIT-H, OU-affiliated colleges, and private universities. Compare fee, transport, and internship access.',
    tiers: [
      {
        tier_title: 'Tier A — INI / top IIIT',
        colleges: [
          {
            name: 'IIT Hyderabad',
            location: 'Sangareddy (Hyderabad region)',
            nirf_band: 'Verify NIRF',
            type: 'IIT',
            notes: 'JEE Advanced; younger IIT with strong CS/ECE narrative — verify placement PDFs.',
            links: [link('IIT Hyderabad', 'https://www.iith.ac.in/')]
          },
          {
            name: 'IIIT Hyderabad',
            location: 'Hyderabad',
            nirf_band: 'Verify NIRF',
            type: 'IIIT',
            notes: 'Separate admission channels — read UGEE/spec programme rules; not JoSAA for all seats.',
            links: [link('IIIT Hyderabad', 'https://www.iiit.ac.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier B — strong university & autonomous',
        colleges: [
          {
            name: 'BITS Pilani — Hyderabad campus',
            location: 'Hyderabad',
            nirf_band: 'Verify NIRF',
            type: 'Private deemed',
            notes: 'BITSAT channel; compare 4-year total fee vs scholarships.',
            links: [link('BITS Hyderabad', 'https://www.bits-pilani.ac.in/hyderabad')]
          },
          {
            name: 'JNTUH-affiliated top autonomous colleges (examples in Hyderabad)',
            location: 'Hyderabad',
            nirf_band: 'Varies',
            type: 'State-affiliated',
            notes: 'TS EAMCET / other channels — verify current convener list.',
            links: [link('JNTUH', 'https://jntuh.ac.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier C — budget private colleges',
        colleges: [
          {
            name: 'Private engineering colleges across Telangana',
            location: 'Hyderabad + Tier-2 cities',
            nirf_band: 'Wide',
            type: 'Private',
            notes: 'Prioritise labs, faculty FTE, and internship shuttle partnerships.',
            links: [link('AICTE', 'https://www.aicte-india.org/')]
          }
        ]
      }
    ]
  },
  {
    stream_id: 'engineering',
    lens_id: 'state_comfort',
    state_id: 'UP',
    title: 'Engineering — Uttar Pradesh comfort picks (examples)',
    summary:
      'UP combines IIT Kanpur, IIT BHU, NIT Allahabad, HBTU, AKTU-affiliated colleges, and many private campuses. Domicile and exam channels vary — read UPSEE/JEE/MJPRU rules for the active year.',
    tiers: [
      {
        tier_title: 'Tier A — IIT / NIT in UP',
        colleges: [
          {
            name: 'IIT Kanpur',
            location: 'Kanpur',
            nirf_band: 'Top Engineering band — verify NIRF',
            type: 'IIT',
            notes: 'JEE Advanced.',
            links: [link('IIT Kanpur', 'https://www.iitk.ac.in/')]
          },
          {
            name: 'IIT (BHU) Varanasi',
            location: 'Varanasi',
            nirf_band: 'Verify NIRF',
            type: 'IIT',
            notes: 'JEE Advanced; unique campus culture — read branch-wise data.',
            links: [link('IIT BHU', 'https://www.iitbhu.ac.in/')]
          },
          {
            name: 'MNNIT Allahabad (Prayagraj)',
            location: 'Prayagraj',
            nirf_band: 'Strong NIT — verify',
            type: 'NIT',
            notes: 'JoSAA.',
            links: [link('MNNIT', 'https://www.mnnit.ac.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier B — state technical universities',
        colleges: [
          {
            name: 'HBTU Kanpur (Harcourt Butler Technical University)',
            location: 'Kanpur',
            nirf_band: 'Verify NIRF',
            type: 'State university',
            notes: 'Good for core branches; track counselling PDFs.',
            links: [link('HBTU', 'https://hbtu.ac.in/')]
          },
          {
            name: 'KIET Group of Institutions (example private)',
            location: 'Ghaziabad region',
            nirf_band: 'Verify',
            type: 'Private',
            notes: 'Large intake — ask for section-wise faculty and lab hours.',
            links: [link('AKTU (affiliating university)', 'https://aktu.ac.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier C — AKTU-affiliated ecosystem',
        colleges: [
          {
            name: 'AKTU-affiliated colleges (NCR + Lucknow belt)',
            location: 'Uttar Pradesh',
            nirf_band: 'Wide',
            type: 'Affiliated',
            notes: 'Use NBA + NIRF where available; negotiate hostel contracts carefully.',
            links: [link('AKTU', 'https://aktu.ac.in/')]
          }
        ]
      }
    ]
  },
  {
    stream_id: 'engineering',
    lens_id: 'state_comfort',
    state_id: 'RJ',
    title: 'Engineering — Rajasthan comfort picks (examples)',
    summary:
      'Rajasthan hosts MNIT Jaipur, IIT Jodhpur, BITS Pilani (Pilani campus), and many RTU-affiliated colleges. Desert cities — factor hostel AC, travel, and internship travel to metros.',
    tiers: [
      {
        tier_title: 'Tier A — INI / BITS',
        colleges: [
          {
            name: 'IIT Jodhpur',
            location: 'Jodhpur',
            nirf_band: 'Verify NIRF',
            type: 'IIT',
            notes: 'JEE Advanced.',
            links: [link('IIT Jodhpur', 'https://www.iitj.ac.in/')]
          },
          {
            name: 'MNIT Jaipur',
            location: 'Jaipur',
            nirf_band: 'Strong NIT — verify',
            type: 'NIT',
            notes: 'JoSAA.',
            links: [link('MNIT Jaipur', 'https://mnit.ac.in/')]
          },
          {
            name: 'BITS Pilani (Pilani campus)',
            location: 'Pilani',
            nirf_band: 'Verify NIRF',
            type: 'Private deemed',
            notes: 'BITSAT; compare fee with hostel.',
            links: [link('BITS Pilani', 'https://www.bits-pilani.ac.in/pilani')]
          }
        ]
      },
      {
        tier_title: 'Tier B — state universities & known private',
        colleges: [
          {
            name: 'RTU (Rajasthan Technical University) main + key affiliated colleges',
            location: 'Kota / Jaipur belt',
            nirf_band: 'Varies',
            type: 'State',
            notes: 'Coaching city ecosystem — stay disciplined about academics vs only exam prep culture.',
            links: [link('RTU', 'https://www.rtu.ac.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier C — wide private network',
        colleges: [
          {
            name: 'AICTE-approved private colleges (Jaipur / Udaipur / Jodhpur)',
            location: 'Rajasthan',
            nirf_band: 'Wide',
            type: 'Private',
            notes: 'Visit campus; verify NBA; ask for alumni on LinkedIn by branch.',
            links: [link('NIRF', 'https://www.nirfindia.org/')]
          }
        ]
      }
    ]
  },
  {
    stream_id: 'engineering',
    lens_id: 'state_comfort',
    state_id: 'WB',
    title: 'Engineering — West Bengal comfort picks (examples)',
    summary:
      'West Bengal combines Jadavpur, IIEST Shibpur, IIT Kharagpur (geographically WB), and MAKAUT-affiliated colleges. WBJEE / JEE / institute rules — verify current year.',
    tiers: [
      {
        tier_title: 'Tier A — IIT / Jadavpur / IIEST',
        colleges: [
          {
            name: 'IIT Kharagpur',
            location: 'Kharagpur',
            nirf_band: 'Top Engineering band — verify',
            type: 'IIT',
            notes: 'JEE Advanced; large campus + deep alumni.',
            links: [link('IIT KGP', 'https://www.iitkgp.ac.in/')]
          },
          {
            name: 'Jadavpur University — Faculty of Engineering & Technology',
            location: 'Kolkata',
            nirf_band: 'Verify NIRF',
            type: 'State',
            notes: 'Very competitive WBJEE; strong value for money.',
            links: [link('Jadavpur University', 'https://www.jaduniv.edu.in/')]
          },
          {
            name: 'IIEST Shibpur',
            location: 'Howrah',
            nirf_band: 'Verify NIRF',
            type: 'INI',
            notes: 'JoSAA; historic brand.',
            links: [link('IIEST Shibpur', 'https://www.iiests.ac.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier B — strong private & university institutes',
        colleges: [
          {
            name: 'Heritage Institute of Technology (example Kolkata private)',
            location: 'Kolkata',
            nirf_band: 'Verify',
            type: 'Private',
            notes: 'Ask for median package and internship geography.',
            links: [link('MAKAUT (WB Tech University)', 'https://makautwb.ac.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier C — MAKAUT-affiliated colleges',
        colleges: [
          {
            name: 'Affiliated engineering colleges across districts',
            location: 'West Bengal',
            nirf_band: 'Wide',
            type: 'Affiliated',
            notes: 'Use NBA + faculty FTE data; plan GATE early if targeting PSUs.',
            links: [link('MAKAUT', 'https://makautwb.ac.in/')]
          }
        ]
      }
    ]
  },
  {
    stream_id: 'engineering',
    lens_id: 'state_comfort',
    state_id: 'OD',
    title: 'Engineering — Odisha comfort picks (examples)',
    summary:
      'Odisha offers IIT Bhubaneswar, NIT Rourkela, and BPUT-affiliated colleges in Bhubaneswar–Cuttack corridor. Check OJEE / JEE channels.',
    tiers: [
      {
        tier_title: 'Tier A — IIT / NIT',
        colleges: [
          {
            name: 'IIT Bhubaneswar',
            location: 'Bhubaneswar',
            nirf_band: 'Verify NIRF',
            type: 'IIT',
            notes: 'JEE Advanced; growing campus.',
            links: [link('IIT Bhubaneswar', 'https://www.iitbbs.ac.in/')]
          },
          {
            name: 'NIT Rourkela',
            location: 'Rourkela',
            nirf_band: 'Strong NIT — verify',
            type: 'NIT',
            notes: 'JoSAA; steel-city industry visits possible.',
            links: [link('NIT Rourkela', 'https://nitrkl.ac.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier B — state institutes (examples)',
        colleges: [
          {
            name: 'OUTR / IGIT / government colleges under BPUT (verify active names)',
            location: 'Odisha',
            nirf_band: 'Verify',
            type: 'State',
            notes: 'Names and affiliations can change — read OJEE brochure.',
            links: [link('BPUT', 'https://bput.ac.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier C — private colleges',
        colleges: [
          {
            name: 'KIIT University (example large private)',
            location: 'Bhubaneswar',
            nirf_band: 'Verify NIRF',
            type: 'Private deemed',
            notes: 'Compare scholarship rules; read branch-wise intake.',
            links: [link('KIIT', 'https://kiit.ac.in/')]
          }
        ]
      }
    ]
  },
  {
    stream_id: 'engineering',
    lens_id: 'state_comfort',
    state_id: 'MP',
    title: 'Engineering — Madhya Pradesh comfort picks (examples)',
    summary:
      'MP includes IIT Indore, MANIT Bhopal, and DAVV / RGPV-affiliated colleges. Factor Bhopal vs Indore vs Gwalior belts for internships.',
    tiers: [
      {
        tier_title: 'Tier A — IIT / NIT',
        colleges: [
          {
            name: 'IIT Indore',
            location: 'Indore',
            nirf_band: 'Verify NIRF',
            type: 'IIT',
            notes: 'JEE Advanced.',
            links: [link('IIT Indore', 'https://www.iiti.ac.in/')]
          },
          {
            name: 'MANIT Bhopal',
            location: 'Bhopal',
            nirf_band: 'Strong NIT — verify',
            type: 'NIT',
            notes: 'JoSAA.',
            links: [link('MANIT', 'https://www.manit.ac.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier B — IIITDM Jabalpur & state universities',
        colleges: [
          {
            name: 'IIITDM Jabalpur',
            location: 'Jabalpur',
            nirf_band: 'Verify NIRF',
            type: 'IIIT',
            notes: 'Design/manufacturing tilt — read curriculum fit.',
            links: [link('IIITDM Jabalpur', 'https://www.iiitdmj.ac.in/')]
          },
          {
            name: 'UIT RGPV / DAVV clusters (verify programmes)',
            location: 'Bhopal / Indore',
            nirf_band: 'Varies',
            type: 'State',
            notes: 'Lower fee; you must own skill-building via clubs and internships.',
            links: [link('RGPV', 'https://www.rgpv.ac.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier C — RGPV-affiliated private colleges',
        colleges: [
          {
            name: 'Private engineering colleges across MP',
            location: 'Multiple cities',
            nirf_band: 'Wide',
            type: 'Private',
            notes: 'Verify NBA; avoid colleges with frequent exam postponement patterns (ask seniors).',
            links: [link('AICTE', 'https://www.aicte-india.org/')]
          }
        ]
      }
    ]
  },
  {
    stream_id: 'medicine',
    lens_id: 'state_comfort',
    state_id: 'MH',
    title: 'Medicine — Maharashtra (examples)',
    summary:
      'Maharashtra has GMCs in Mumbai/Pune/Aurangabad belts, strong deemed universities, and intense competition. Read MCC + state CET bulletins for seat matrix and bond rules.',
    tiers: [
      {
        tier_title: 'Tier A — flagship GMCs (illustrative names)',
        colleges: [
          {
            name: 'Seth GS Medical College & KEM Hospital (KEM)',
            location: 'Mumbai',
            nirf_band: 'Verify Medical NIRF / state lists',
            type: 'State GMC',
            notes: 'Extremely competitive state quota; read bond for rural service if any.',
            links: [link('MUHS (regulator info)', 'https://www.muhs.ac.in/')]
          },
          {
            name: 'BJ Government Medical College / GMC Pune cluster (verify current names)',
            location: 'Pune',
            nirf_band: 'Verify',
            type: 'State GMC',
            notes: 'Check domicile category definitions yearly.',
            links: [link('MCC', 'https://mcc.nic.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier B — other government / municipal colleges',
        colleges: [
          {
            name: 'Government medical colleges across divisions (Marathwada, Vidarbha, etc.)',
            location: 'Maharashtra',
            nirf_band: 'Varies',
            type: 'State',
            notes: 'Compare clinical load vs hostel distance.',
            links: [link('DMER Maharashtra (search official)', 'https://www.maharashtra.gov.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier C — deemed & private (cost + bond diligence)',
        colleges: [
          {
            name: 'Deemed universities in Maharashtra (multiple)',
            location: 'Mumbai / Pune / other',
            nirf_band: 'Varies',
            type: 'Deemed / private',
            notes: 'Model 5-year total cost incl. hostel; read MCC fee structure PDF line by line.',
            links: [link('MCC', 'https://mcc.nic.in/')]
          }
        ]
      }
    ]
  },
  {
    stream_id: 'medicine',
    lens_id: 'state_comfort',
    state_id: 'KA',
    title: 'Medicine — Karnataka (examples)',
    summary:
      'Karnataka hosts Bangalore Medical College, KIMS Hubli, and many private medical colleges. Verify KEA / MCC seat distribution.',
    tiers: [
      {
        tier_title: 'Tier A — flagship institutes',
        colleges: [
          {
            name: 'Bangalore Medical College and Research Institute (BMRI / BMCRI)',
            location: 'Bengaluru',
            nirf_band: 'Verify',
            type: 'State GMC',
            notes: 'High clinical volume; check bond updates.',
            links: [link('KEA (search active portal)', 'https://kea.kar.nic.in/')]
          },
          {
            name: 'KIMS Hubli (Karnataka Institute of Medical Sciences)',
            location: 'Hubballi',
            nirf_band: 'Verify',
            type: 'State',
            notes: 'Good clinical exposure in North Karnataka hub.',
            links: [link('KIMS Hubli', 'https://www.kimshubli.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier B — other government medical colleges',
        colleges: [
          {
            name: 'GMCs in Mysuru, Mangaluru, Belagavi (verify seat matrix)',
            location: 'Karnataka',
            nirf_band: 'Varies',
            type: 'State GMC',
            notes: 'Read KEA category document slowly — mistakes are costly.',
            links: [link('KEA', 'https://kea.kar.nic.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier C — private medical colleges',
        colleges: [
          {
            name: 'Private medical colleges (Bengaluru + Tier-2 cities)',
            location: 'Karnataka',
            nirf_band: 'Varies',
            type: 'Private',
            notes: 'Compare NMC recognition status and hospital tie-ups.',
            links: [link('NMC', 'https://www.nmc.org.in/')]
          }
        ]
      }
    ]
  },
  {
    stream_id: 'medicine',
    lens_id: 'state_comfort',
    state_id: 'TN',
    title: 'Medicine — Tamil Nadu (examples)',
    summary:
      'Tamil Nadu has a dense GMC network and private medical colleges. Domicile and 7.5% internal quota rules have changed historically — read current-year GO + MCC.',
    tiers: [
      {
        tier_title: 'Tier A — Chennai flagship GMCs',
        colleges: [
          {
            name: 'Madras Medical College (MMC)',
            location: 'Chennai',
            nirf_band: 'Verify Medical NIRF',
            type: 'State GMC',
            notes: 'Very competitive; huge clinical volume.',
            links: [link('TN Health (official portal search)', 'https://www.tn.gov.in/health')]
          },
          {
            name: 'Stanley Medical College',
            location: 'Chennai',
            nirf_band: 'Verify',
            type: 'State GMC',
            notes: 'Read bond and service clauses in offer letter.',
            links: [link('MCC', 'https://mcc.nic.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier B — regional GMCs',
        colleges: [
          {
            name: 'GMCs in Madurai, Coimbatore, Tirunelveli (examples)',
            location: 'Tamil Nadu',
            nirf_band: 'Varies',
            type: 'State GMC',
            notes: 'Good training; verify hostel and stipend during internship year.',
            links: [link('MCC', 'https://mcc.nic.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier C — private & deemed',
        colleges: [
          {
            name: 'Private medical colleges across TN',
            location: 'Tamil Nadu',
            nirf_band: 'Varies',
            type: 'Private',
            notes: 'Ask for patient load per bed; verify MCI/NMC listing.',
            links: [link('NMC', 'https://www.nmc.org.in/')]
          }
        ]
      }
    ]
  },
  {
    stream_id: 'medicine',
    lens_id: 'state_comfort',
    state_id: 'DL',
    title: 'Medicine — Delhi NCR (examples)',
    summary:
      'NCR includes MAMC, UCMS, AIIMS Delhi, and multiple private hospitals with attached colleges. Seat type (AIQ vs DU vs IP) changes — read MCC + DU bulletins.',
    tiers: [
      {
        tier_title: 'Tier A — top draw',
        colleges: [
          {
            name: 'AIIMS New Delhi',
            location: 'New Delhi',
            nirf_band: 'Top Medical band — verify',
            type: 'AIIMS',
            notes: 'NEET-UG AIQ; separate from state.',
            links: [link('AIIMS Delhi', 'https://www.aiims.edu/')]
          },
          {
            name: 'Maulana Azad Medical College (MAMC)',
            location: 'New Delhi',
            nirf_band: 'Verify',
            type: 'State / DU',
            notes: 'Read seat matrix carefully with DU rules.',
            links: [link('MCC', 'https://mcc.nic.in/')]
          },
          {
            name: 'University College of Medical Sciences (UCMS)',
            location: 'Delhi',
            nirf_band: 'Verify',
            type: 'DU',
            notes: 'Attached GTB Hospital — verify internship structure.',
            links: [link('UCMS', 'https://ucms.ac.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier B — other Delhi + NCR attached institutes',
        colleges: [
          {
            name: 'ESIC Medical College Faridabad (example NCR)',
            location: 'Haryana (NCR)',
            nirf_band: 'Verify',
            type: 'Central',
            notes: 'Watch MCC special rounds.',
            links: [link('MCC', 'https://mcc.nic.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier C — private NCR medical colleges',
        colleges: [
          {
            name: 'Private medical colleges Gurugram / Noida belt',
            location: 'NCR',
            nirf_band: 'Varies',
            type: 'Private',
            notes: 'Compare total cost and clinical posting hospitals.',
            links: [link('NMC', 'https://www.nmc.org.in/')]
          }
        ]
      }
    ]
  },
  {
    stream_id: 'medicine',
    lens_id: 'state_comfort',
    state_id: 'UP',
    title: 'Medicine — Uttar Pradesh (examples)',
    summary:
      'UP includes KGMU Lucknow, IMS BHU Varanasi, AIIMS Gorakhpur / Rae Bareli (verify active campuses), and many GMCs. Read UPDGME bulletins.',
    tiers: [
      {
        tier_title: 'Tier A — flagship',
        colleges: [
          {
            name: 'King George Medical University (KGMU)',
            location: 'Lucknow',
            nirf_band: 'Verify Medical NIRF',
            type: 'State university',
            notes: 'High patient load; competitive domicile rules.',
            links: [link('KGMU', 'https://www.kgmu.org/')]
          },
          {
            name: 'Institute of Medical Sciences, BHU Varanasi',
            location: 'Varanasi',
            nirf_band: 'Verify',
            type: 'Central university institute',
            notes: 'NEET + BHU channels can differ — read brochure.',
            links: [link('IMS BHU', 'https://www.bhu.ac.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier B — other GMCs / new AIIMS',
        colleges: [
          {
            name: 'AIIMS Gorakhpur / Raebareli / other UP AIIMS (verify seat opening)',
            location: 'Uttar Pradesh',
            nirf_band: 'Varies',
            type: 'AIIMS',
            notes: 'Younger AIIMS — compare hostel readiness vs established GMC.',
            links: [link('MCC', 'https://mcc.nic.in/')]
          },
          {
            name: 'Regional GMCs (Prayagraj, Meerut, Kanpur — verify list)',
            location: 'Uttar Pradesh',
            nirf_band: 'Varies',
            type: 'State GMC',
            notes: 'Read bond for rural posting if applicable.',
            links: [link('UPDGME (search .gov)', 'https://www.updgme.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier C — private medical colleges',
        colleges: [
          {
            name: 'Private MBBS colleges across UP',
            location: 'Uttar Pradesh',
            nirf_band: 'Varies',
            type: 'Private',
            notes: 'Verify NMC recognition; ask for clinical bed:student ratio.',
            links: [link('NMC', 'https://www.nmc.org.in/')]
          }
        ]
      }
    ]
  },
  {
    stream_id: 'medicine',
    lens_id: 'state_comfort',
    state_id: 'RJ',
    title: 'Medicine — Rajasthan (examples)',
    summary:
      'Rajasthan includes SN Medical College Jodhpur, SMS Jaipur, and AIIMS Jodhpur. Desert-state logistics — factor travel for rural postings.',
    tiers: [
      {
        tier_title: 'Tier A — flagship',
        colleges: [
          {
            name: 'AIIMS Jodhpur',
            location: 'Jodhpur',
            nirf_band: 'Verify',
            type: 'AIIMS',
            notes: 'NEET AIQ; compare with older state GMCs for clinical volume trade-offs.',
            links: [link('AIIMS Jodhpur', 'https://www.aiimsjodhpur.edu.in/')]
          },
          {
            name: 'SMS Medical College Jaipur',
            location: 'Jaipur',
            nirf_band: 'Verify',
            type: 'State GMC',
            notes: 'Capital city clinical exposure.',
            links: [link('RUHS (Rajasthan university health sciences)', 'https://www.ruhsraj.org/')]
          }
        ]
      },
      {
        tier_title: 'Tier B — other GMCs',
        colleges: [
          {
            name: 'SN Medical College Jodhpur',
            location: 'Jodhpur',
            nirf_band: 'Verify',
            type: 'State GMC',
            notes: 'Historic brand; verify bond updates.',
            links: [link('RUHS', 'https://www.ruhsraj.org/')]
          }
        ]
      },
      {
        tier_title: 'Tier C — private colleges',
        colleges: [
          {
            name: 'Private medical colleges (Jaipur / Udaipur belt)',
            location: 'Rajasthan',
            nirf_band: 'Varies',
            type: 'Private',
            notes: 'Compare fee with hostel + instruments.',
            links: [link('MCC', 'https://mcc.nic.in/')]
          }
        ]
      }
    ]
  },
  {
    stream_id: 'medicine',
    lens_id: 'state_comfort',
    state_id: 'TS',
    title: 'Medicine — Telangana (examples)',
    summary:
      'Telangana includes Osmania Medical College, Gandhi Medical College, and AIIMS Bibinagar (verify seat status). Read KNRUHS + MCC.',
    tiers: [
      {
        tier_title: 'Tier A — flagship GMCs + AIIMS',
        colleges: [
          {
            name: 'Osmania Medical College',
            location: 'Hyderabad',
            nirf_band: 'Verify',
            type: 'State GMC',
            notes: 'Large hospital complex; competitive state quota.',
            links: [link('KNRUHS', 'https://www.knruhs.in/')]
          },
          {
            name: 'Gandhi Medical College',
            location: 'Secunderabad / Hyderabad',
            nirf_band: 'Verify',
            type: 'State GMC',
            notes: 'Read latest seat pooling rules.',
            links: [link('MCC', 'https://mcc.nic.in/')]
          },
          {
            name: 'AIIMS Bibinagar (verify intake and phases)',
            location: 'Telangana',
            nirf_band: 'Verify',
            type: 'AIIMS',
            notes: 'Younger campus — compare hospital commissioning timelines.',
            links: [link('AIIMS Bibinagar', 'https://aiimsbibinagar.edu.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier B — other government colleges',
        colleges: [
          {
            name: 'Kakatiya Medical College Warangal (example)',
            location: 'Warangal',
            nirf_band: 'Verify',
            type: 'State GMC',
            notes: 'Good regional option; verify hostel.',
            links: [link('KNRUHS', 'https://www.knruhs.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier C — private medical colleges',
        colleges: [
          {
            name: 'Private medical colleges in Hyderabad belt',
            location: 'Telangana',
            nirf_band: 'Varies',
            type: 'Private',
            notes: 'Ask for affiliated teaching hospital name and distance.',
            links: [link('NMC', 'https://www.nmc.org.in/')]
          }
        ]
      }
    ]
  },
  {
    stream_id: 'medicine',
    lens_id: 'state_comfort',
    state_id: 'WB',
    title: 'Medicine — West Bengal (examples)',
    summary:
      'West Bengal includes Medical College Kolkata, NRS, CNMC, and private colleges. Read WBMCC / MCC notices for domicile and round rules.',
    tiers: [
      {
        tier_title: 'Tier A — Kolkata flagship GMCs',
        colleges: [
          {
            name: 'Medical College & Hospital, Kolkata',
            location: 'Kolkata',
            nirf_band: 'Verify',
            type: 'State GMC',
            notes: 'Very high clinical load; competitive.',
            links: [link('WBMCC (search official)', 'https://wbmcc.nic.in/')]
          },
          {
            name: 'Nil Ratan Sircar Medical College (NRS)',
            location: 'Kolkata',
            nirf_band: 'Verify',
            type: 'State GMC',
            notes: 'Read bond updates carefully.',
            links: [link('MCC', 'https://mcc.nic.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier B — regional GMCs',
        colleges: [
          {
            name: 'CNMC Bankura / Burdwan Medical College (examples — verify list)',
            location: 'West Bengal',
            nirf_band: 'Varies',
            type: 'State GMC',
            notes: 'Good training; check hostel and stipend.',
            links: [link('WBMCC', 'https://wbmcc.nic.in/')]
          }
        ]
      },
      {
        tier_title: 'Tier C — private colleges',
        colleges: [
          {
            name: 'Private medical colleges in WB',
            location: 'West Bengal',
            nirf_band: 'Varies',
            type: 'Private',
            notes: 'Verify NMC; compare clinical years hospital mapping.',
            links: [link('NMC', 'https://www.nmc.org.in/')]
          }
        ]
      }
    ]
  }
];

const bundleKey = (b) => b.stream_id + '|' + b.lens_id + '|' + b.state_id;
const existingKeys = new Set(d.college_plan_b.bundles.map(bundleKey));
let added = 0;
extraBundles.forEach((b) => {
  const k = bundleKey(b);
  if (!existingKeys.has(k)) {
    d.college_plan_b.bundles.push(b);
    existingKeys.add(k);
    added++;
  }
});

d.last_updated = '2026-05-04';
if (!d.data_notes) d.data_notes = '';
d.data_notes += ' College bundles expanded with additional state_comfort regions; verify all ranks and admissions on official portals.';

fs.writeFileSync(p, JSON.stringify(d, null, 2), 'utf8');
console.log('Added states (if new):', extraStates.length, '| Bundles added:', added, '| Total bundles:', d.college_plan_b.bundles.length);
