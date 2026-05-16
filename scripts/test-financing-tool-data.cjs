#!/usr/bin/env node
/**
 * Simulates pehchaan_financing_reality.html data load + linkage checks.
 * Run from repo root: node scripts/test-financing-tool-data.cjs
 */
const fs = require("fs");
const path = require("path");
const http = require("http");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const errs = [];

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function fail(msg) {
  errs.push(msg);
}

function calcEmi(P, annualRate, years) {
  const r = annualRate / 100 / 12;
  const n = Math.round(years * 12);
  if (P <= 0 || n <= 0) return 0;
  if (r <= 0) return P / n;
  return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function simulateFinancingPageRender(d) {
  const heroTitle = (d.meta && d.meta.title) || "Financing";
  const heroIntro = d.intro || "";
  const heroDisclaimer = (d.meta && d.meta.disclaimer) || "";
  const scholarshipCount = (d.scholarship_pointers || []).length;
  const loanCount = (d.loan_notes || []).length;
  const rate = d.default_rate_annual_pct || 10.5;
  const tenure = d.default_tenure_years || 10;
  const emi = calcEmi(800000, rate, tenure);

  if (!heroTitle) fail("render: empty hero title");
  if (!heroIntro) fail("render: empty hero intro");
  if (!heroDisclaimer) fail("render: empty disclaimer");
  if (scholarshipCount < 1) fail("render: scholarship_pointers empty");
  if (loanCount < 1) fail("render: loan_notes empty");
  if (!Number.isFinite(emi) || emi <= 0) fail("render: EMI calc invalid: " + emi);

  return { heroTitle, scholarshipCount, loanCount, emi };
}

function loadBrowserGlobals() {
  const storage = {};
  const window = {
    location: { search: "?from=salary&career=software_engineer", href: "http://localhost/Tools/pehchaan_financing_reality.html" },
    sessionStorage: {
      getItem: (k) => storage[k] || null,
      setItem: (k, v) => {
        storage[k] = v;
      },
    },
    PehchaanJourney: undefined,
    PehchaanToolLinks: undefined,
    PehchaanToolRecommendations: undefined,
  };
  window.window = window;
  const ctx = vm.createContext(window);
  for (const rel of ["assets/pehchaan_journey.js", "assets/pehchaan_tool_links.js", "assets/pehchaan_tool_recommendations.js"]) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, rel), "utf8"), ctx, { filename: rel });
  }
  return window;
}

function testJourneyIntegration() {
  const w = loadBrowserGlobals();
  if (!w.PehchaanToolLinks || !w.PehchaanToolRecommendations) {
    fail("assets: PehchaanToolLinks or PehchaanToolRecommendations not defined");
    return;
  }
  const finUrl = w.PehchaanToolLinks.u("financing", { from: "salary", career: "software_engineer" });
  if (!finUrl.includes("pehchaan_financing_reality.html")) fail("tool_links: financing URL missing html file: " + finUrl);
  if (!finUrl.includes("career=software_engineer")) fail("tool_links: financing URL missing career param: " + finUrl);

  const rec = w.PehchaanToolRecommendations.buildNextToolRecommendations(
    w.PehchaanToolRecommendations.TOOL.financing,
    { from: "financing", career: "software_engineer" },
    { roleSelected: true }
  );
  if (!rec || !rec.primary) fail("recommendations: missing primary for financing tool");
  const html = w.PehchaanToolRecommendations.buildRecommendationsHtml(rec);
  if (!html || html.indexOf("<a") < 0) fail("recommendations: buildRecommendationsHtml empty");
  if (html.indexOf("pehchaan_financing_reality.html") >= 0) {
    // financing quick link excluded on financing page — OK
  }
  const roiFromSalary = w.PehchaanToolLinks.u("roi", { from: "salary", career: "software_engineer" });
  if (!roiFromSalary.includes("pehchaan_career_roi_reality_bridge.html")) fail("tool_links: roi URL broken");
}

function main() {
  testJourneyIntegration();
  const legacy = readJson("DB/pehchaan_financing_reality_data.json");
  const registry = readJson("DB/pehchaan_career_registry.json");
  const idMap = readJson("DB/canonical/_id_map.json");
  const canonical = readJson("DB/canonical/financial_aid.json");

  const aidById = new Map((canonical.financial_aid || []).map((a) => [a.aid_id, a]));
  const aidIds = new Set(aidById.keys());

  // canonical_aid_file path
  const canonRel = legacy.canonical_aid_file;
  if (!canonRel) fail("legacy: missing canonical_aid_file");
  else if (!fs.existsSync(path.join(ROOT, canonRel))) fail(`legacy: canonical_aid_file not on disk: ${canonRel}`);

  // cg_priority_aids FK
  for (const id of legacy.cg_priority_aids || []) {
    if (!aidIds.has(id)) fail(`legacy: cg_priority_aids unknown aid_id "${id}"`);
  }

  // aid_type_order values exist in data
  const typesInData = new Set((canonical.financial_aid || []).map((a) => a.aid_type));
  for (const t of legacy.aid_type_order || []) {
    if (!typesInData.has(t)) fail(`legacy: aid_type_order "${t}" not used by any financial_aid entry`);
  }

  // _id_map financial_aid_ids FK
  for (const c of idMap.careers || []) {
    if (!Array.isArray(c.financial_aid_ids)) {
      fail(`_id_map: ${c.career_id} missing financial_aid_ids`);
      continue;
    }
    for (const aidId of c.financial_aid_ids) {
      if (!aidIds.has(aidId)) fail(`_id_map: ${c.career_id} references unknown aid_id "${aidId}"`);
    }
  }

  // registry paths
  const paths = registry.tool_integration && registry.tool_integration.paths;
  if (!paths || paths.length !== 7) fail(`registry: tool_integration.paths count ${paths ? paths.length : 0}, expected 7`);
  const financingPath = "Tools/pehchaan_financing_reality.html";
  if (!paths.includes(financingPath)) fail("registry: missing financing tool path");
  if (!fs.existsSync(path.join(ROOT, financingPath))) fail("registry: financing HTML missing on disk");

  const render = simulateFinancingPageRender(legacy);
  console.log("simulateFinancingPageRender:", render);

  // HTTP fetch like browser (file:// blocked for fetch in real browser; server required)
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, "http://127.0.0.1");
      let rel = decodeURIComponent(url.pathname);
      if (rel === "/") rel = "/Tools/pehchaan_financing_reality.html";
      const filePath = path.join(ROOT, rel.replace(/^\//, "").replace(/\//g, path.sep));
      if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      const ext = path.extname(filePath);
      const types = { ".html": "text/html", ".json": "application/json", ".js": "text/javascript", ".css": "text/css" };
      res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
      res.end(fs.readFileSync(filePath));
    });
    server.listen(0, "127.0.0.1", async () => {
      const port = server.address().port;
      const base = `http://127.0.0.1:${port}`;
      try {
        const jsonUrl = `${base}/DB/pehchaan_financing_reality_data.json`;
        const r = await fetch(jsonUrl);
        if (!r.ok) fail(`HTTP fetch legacy JSON: ${r.status}`);
        else {
          const d = await r.json();
          if (!d.canonical_aid_file) fail("HTTP: canonical_aid_file missing in fetched JSON");
          simulateFinancingPageRender(d);
        }
        const htmlUrl = `${base}/Tools/pehchaan_financing_reality.html`;
        const hr = await fetch(htmlUrl);
        if (!hr.ok) fail(`HTTP fetch HTML: ${hr.status}`);
        const html = await hr.text();
        if (!html.includes("pehchaan_financing_reality_data.json")) fail("HTML: missing data json reference");
        if (!html.includes("pehchaan_journey.js")) fail("HTML: missing journey script");
        if (!html.includes("pehchaan_tool_recommendations.js")) fail("HTML: missing recommendations script");

        for (const asset of [
          "/assets/pehchaan_journey.js",
          "/assets/pehchaan_tool_links.js",
          "/assets/pehchaan_tool_recommendations.js",
          "/assets/pehchaan_tool_ui.css",
        ]) {
          const ar = await fetch(base + asset);
          if (!ar.ok) fail(`HTTP asset ${asset}: ${ar.status}`);
        }
      } catch (e) {
        fail("HTTP test: " + e.message);
      }
      server.close();
      if (errs.length) {
        console.error("test-financing-tool-data: FAILED (" + errs.length + ")");
        errs.forEach((e) => console.error("  - " + e));
        process.exit(1);
      }
      console.log("test-financing-tool-data: OK");
      resolve();
    });
  });
}

main();
