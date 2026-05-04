/**
 * Applies researched unique_point + why_choose strings to every college_plan_b tier card.
 * Keys are "stream_id|college name" so duplicate names (e.g. NIFT Mumbai in design vs fashion_media) differ.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const jsonPath = path.join(root, "DB", "pehchaan_plan_b_strategy_builder_data.json");

function loadVoiceMap() {
  const parts = ["planb-college-voice-part1.json", "planb-college-voice-part2.json", "planb-college-voice-part3.json"];
  const merged = {};
  for (const f of parts) {
    const p = path.join(__dirname, f);
    if (!fs.existsSync(p)) throw new Error("Missing voice part: " + f);
    const chunk = JSON.parse(fs.readFileSync(p, "utf8"));
    Object.assign(merged, chunk);
  }
  return merged;
}

function main() {
  const voice = loadVoiceMap();
  const raw = fs.readFileSync(jsonPath, "utf8");
  const data = JSON.parse(raw);
  const cp = data.college_plan_b;
  let applied = 0;
  let missing = [];
  for (const b of cp.bundles || []) {
    const sid = b.stream_id || "";
    for (const t of b.tiers || []) {
      for (const c of t.colleges || []) {
        if (!c || typeof c !== "object" || !c.name) continue;
        const key = sid + "|" + c.name;
        const v = voice[key];
        if (!v || typeof v.unique_point !== "string" || typeof v.why_choose !== "string") {
          missing.push(key);
          continue;
        }
        c.unique_point = v.unique_point;
        c.why_choose = v.why_choose;
        applied++;
      }
    }
  }
  if (missing.length) {
    console.error("Missing voice keys:", missing);
    process.exit(1);
  }
  data.version = "2.6";
  data.last_updated = "2026-05-04";
  if (!String(data.data_notes || "").includes("College voice")) {
    data.data_notes =
      "College cards: unique_point and why_choose refreshed with institute-specific research (see scripts/planb-college-voice-part*.json). " +
      (data.data_notes || "");
  }
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("Applied voice to", applied, "college cards.");
}

main();
