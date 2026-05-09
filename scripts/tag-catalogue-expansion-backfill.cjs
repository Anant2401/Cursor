#!/usr/bin/env node
/**
 * Ensure availability.catalogue_expansion=true for exp_* programme IDs (expanded catalogue rows).
 * Safe and idempotent.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const REGISTRY_PATH = path.join(ROOT, "DB", "pehchaan_college_registry.json");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
function writeJson(p, d) {
  fs.writeFileSync(p, JSON.stringify(d, null, 2), "utf8");
}

function main() {
  const registry = readJson(REGISTRY_PATH);
  const today = new Date().toISOString().slice(0, 10);
  let tagged = 0;
  (registry.college_programs || []).forEach((p) => {
    if (/^exp_/i.test(String(p.id || ""))) {
      const av = p.availability || {};
      if (av.catalogue_expansion !== true) tagged += 1;
      p.availability = { ...av, catalogue_expansion: true };
    }
  });
  registry.meta = registry.meta || {};
  registry.meta.last_updated = today;
  registry.meta.pipeline_stats = registry.meta.pipeline_stats || {};
  registry.meta.pipeline_stats.last_pipeline_run = today;
  writeJson(REGISTRY_PATH, registry);
  console.log("tag-catalogue-expansion-backfill: OK");
  console.log("- exp_ rows tagged (or reaffirmed):", tagged);
}

main();
