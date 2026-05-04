/**
 * Prints FAQ count from FAQDB/faqs.json for syncing homepage copy.
 * Usage: node scripts/count-faqs.cjs
 */
const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "../FAQDB/faqs.json");
const j = JSON.parse(fs.readFileSync(p, "utf8"));
const n = Array.isArray(j) ? j.length : 0;
console.log("FAQDB/faqs.json entries:", n);
