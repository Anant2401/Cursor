/**
 * iPhone 13 viewport + child-node clicks (simulates Google Translate wrapping).
 * Requires local server: from repo root, `python -m http.server 8080`
 * Run: npm install && npx playwright install chromium && npm run test:mobile
 */
const { chromium, devices } = require("playwright");

const BASE = (process.env.BASE_URL || "http://127.0.0.1:8080").replace(/\/$/, "");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices["iPhone 13"],
    locale: "en-IN",
  });
  const page = await context.newPage();
  const url = `${BASE}/Tools/pehchaan_career_assessment.html`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

  await page.click("#btn-begin");
  await page.fill("#input-firstname", "Smoke");
  await page.click("#btn-continue");
  await page.waitForSelector("#q-list .btn-row", { timeout: 15000 });

  await page.evaluate(() => {
    function wrapLabel(btn) {
      if (!btn || btn.querySelector("span.gt-sim")) return;
      const w = document.createElement("span");
      w.className = "gt-sim";
      w.textContent = btn.textContent;
      btn.textContent = "";
      btn.appendChild(w);
    }
    const rows = document.querySelectorAll("#q-list .btn-row");
    if (rows.length < 2) throw new Error("expected at least 2 question rows");
    const a = rows[0].querySelectorAll(".opt")[2];
    const b = rows[1].querySelectorAll(".opt")[3];
    wrapLabel(a);
    wrapLabel(b);
  });

  await page.locator("#q-list .btn-row").nth(0).locator("span.gt-sim").first().click();
  await page.locator("#q-list .btn-row").nth(1).locator("span.gt-sim").first().click();

  const sel = await page.locator("#q-list .opt.sel").count();
  const row0 = await page.locator("#q-list .btn-row").nth(0).locator(".opt.sel").count();
  const row1 = await page.locator("#q-list .btn-row").nth(1).locator(".opt.sel").count();

  await browser.close();

  const ok = sel === 2 && row0 === 1 && row1 === 1;
  console.log(JSON.stringify({ viewport: "iPhone 13", sel, row0, row1, ok }, null, 0));
  if (!ok) {
    console.error("FAIL: expected two .sel on two different rows after child-target clicks");
    process.exit(1);
  }
  console.log("OK");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
