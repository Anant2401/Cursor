/**
 * Merges FAQDB/faq-core.json (faq_001–008) + all gemini-code-*.json into FAQDB/faqs.json.
 * Does not read faqs.json as input (that file is the output) — safe to re-run.
 * Run from repo: node FAQDB/merge-faqs.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseFaqNum(id) {
  const m = /^faq_(\d+)$/.exec(id);
  return m ? parseInt(m[1], 10) : 0;
}

/** Short, credible context lines — framed so parents verify official sources for amounts/dates. */
function enrichAnswers(item) {
  const { id, answer_en, answer_hi_hinglish } = item;

  const extras = {
    faq_001: {
      en: " In India’s graduate surveys, employers often rank communication and practical tools above raw marks alone—but marks still matter for some college gates, so balance both.",
      hi: " Bharat ke kai surveys mein companies ko marks se zyada communication aur practical skills matter karti hain—par admission ke liye marks ab bhi zaroori ho sakte hain, dono balance rakhein.",
    },
    faq_002: {
      en: " National graduate-employment data keeps shifting by city and year; creative and digital roles have grown faster than many traditional streams in the last decade.",
      hi: " Har saal aur har shehar ka data alag hota hai; digital aur creative roles pichle dashak mein tezi se badhi hain.",
    },
    faq_003: {
      en: " Nationwide, popular SSC CGL–style exams often see selection rates in low single digits per stage—so a parallel employable skill matters.",
      hi: " India ke kai competitive exams mein har stage par selection rate bahut kam hota hai—isliye employable skill ka backup zaroori hai.",
    },
    faq_004: {
      en: " Globally, hybrid/remote policies vary widely by company—what matters is a formal offer, payroll in your bank account, and verifiable employer identity.",
      hi: " Remote/hybrid policy har company mein alag hoti hai—asli pehchaan formal offer, salary bank mein aana aur employer verify hona hai.",
    },
    faq_005: {
      en: " Analytics and AI-related roles show up across sectors now—not only IT—because decisions run on data in hospitals, banks, logistics, and government programmes.",
      hi: " Data/analytics roles ab sirf IT mein nahi—hospital, bank, logistics aur sarkari schemes har jagah data se decisions lete hain.",
    },
    faq_006: {
      en: " Surveys of workplaces worldwide consistently show AI literacy rising as a requirement alongside domain skills—not ‘either/or’, but ‘both’.",
      hi: " Workplace surveys mein AI literacy domain skill ke saath maangi ja rahi hai—sirf ek hi kaafi nahi, dono ka mix important hai.",
    },
    faq_007: {
      en: " Always verify programme approval on the UGC ‘recognised institutions / programmes’ lists for the intake year—approval status can change.",
      hi: " Har admission year ke liye UGC ki recognised list zaroor dekhein—approval status badal sakta hai.",
    },
    faq_008: {
      en: " Remote-first and hybrid teams have expanded choices for safe commuting patterns—confirm written policies on timing, travel, and security.",
      hi: " Remote/hybrid roles se commute aur timing flexible ho sakti hai—likhit policy aur safety norms zaroor confirm karein.",
    },
    faq_009: {
      en: " Scholarship amounts and eligibility change—confirm BPL status, course type (UG/PG), and bank–Aadhaar seeding on the official CG scholarship portal before each term.",
      hi: " Scholarship ki rakam aur rules badal sakte hain—har session se pehle official CG scholarship portal par course type aur bank–Aadhaar seeding zaroor check karein.",
    },
    faq_011: {
      en: " Global creator-economy estimates run into tens of billions USD yearly; even a small slice of demand for editors translates to steady freelance work if skills are strong.",
      hi: " Duniya bhar mein creator economy ka size bahut bada hai—agar editing skill strong hai to freelance ka steady kaam milta rehta hai.",
    },
    faq_013: {
      en: " Long repeated gaps without income can hurt confidence and CV timelines—many families pick a skill-led job first and attempt exams alongside.",
      hi: " Lamba gap bina kaam ke confidence aur CV dono par asar daal sakta hai—kai families pehle skill-based job karti hain aur sath mein exam deti rehti hain.",
    },
    faq_017: {
      en: " Steel and mining belts often recruit diploma holders for maintenance and operations; watch PSU and contractor notices—vacancies vary sharply by quarter.",
      hi: " Steel/mining zone mein diploma walo ki demand hoti hai; PSU aur contractor ki notices dekhte rahein—har quarter vacancies alag hoti hain.",
    },
    faq_018: {
      en: " Education-loan rules are updated centrally—use only the official PM-Vidyalaxmi / VIDYA Lakshmi portals for collateral-free terms that apply to your admission letter.",
      hi: " Loan rules centre se update hote hain—sirf official PM-Vidyalaxmi / VIDYA Lakshmi portal se apne admission ke hisaab se terms confirm karein.",
    },
    faq_021: {
      en: " Income-linked interest relief is policy-defined—keep income proofs ready and re-check the circular for the academic year (slabs like ₹4.5L / ₹8L appear in policy text).",
      hi: " Income par interest relief policy ke hisaab se milti hai—har saal ka circular aur income proof taiyar rakhein.",
    },
    faq_025: {
      en: " India trains one of the world’s largest nursing workforces; Gulf and OECD employers actively recruit Indian nurses when licensing and language tests are cleared.",
      hi: " India duniya ke sabse bade nursing workforce mein se ek hai; Gulf/OECD mein language aur licence tests clear karke demand rehti hai.",
    },
    faq_030: {
      en: " India’s digital ad spend keeps growing double-digit year-on-year in many reports—local shops moving online is a small but expanding slice of that demand.",
      hi: " Digital ads par kharcha har saal badhta ja raha hai; chhoti dukaane online aana chahti hain—local demand badh rahi hai.",
    },
  };

  const ex = extras[id];
  if (ex) {
    const fpEn = ex.en.trim().slice(0, 48);
    const fpHi = ex.hi.trim().slice(0, 40);
    if (answer_en.includes(fpEn) || answer_hi_hinglish.includes(fpHi)) {
      return item;
    }
    return {
      ...item,
      answer_en: answer_en.trimEnd() + ex.en,
      answer_hi_hinglish: answer_hi_hinglish.trimEnd() + ex.hi,
    };
  }

  return item;
}

function main() {
  const dir = __dirname;
  const corePath = path.join(dir, "faq-core.json");
  const geminiFiles = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("gemini-code-") && f.endsWith(".json"))
    .sort();

  const filesToRead = [corePath, ...geminiFiles.map((f) => path.join(dir, f))];

  if (!fs.existsSync(corePath)) {
    console.error("Missing", corePath, "— create it with the base faq_001–008 items.");
    process.exit(1);
  }

  const byId = new Map();

  for (const filePath of filesToRead) {
    const raw = fs.readFileSync(filePath, "utf8");
    let arr;
    try {
      arr = JSON.parse(raw);
    } catch {
      console.warn("Skip non-array JSON:", filePath);
      continue;
    }
    if (!Array.isArray(arr)) continue;

    const base = path.basename(filePath);
    for (const item of arr) {
      if (!item || typeof item.id !== "string") continue;
      if (byId.has(item.id)) {
        console.warn("Duplicate id (overwriting):", item.id, "from", base);
      }
      byId.set(item.id, item);
    }
  }

  const merged = [...byId.values()]
    .map(enrichAnswers)
    .sort((a, b) => parseFaqNum(a.id) - parseFaqNum(b.id));

  const outPath = `${dir}/faqs.json`;
  fs.writeFileSync(outPath, JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log("Wrote", merged.length, "items to", outPath);

  const copyTo = `${dir}/../parent-faq/data/faqs.json`;
  fs.writeFileSync(copyTo, JSON.stringify(merged, null, 2) + "\n", "utf8");
  console.log("Copied to", copyTo);
}

main();
