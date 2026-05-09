#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const REGISTRY_PATH = path.join(ROOT, "DB", "pehchaan_college_registry.json");

function isHttp(url) {
  return /^https?:\/\//i.test(String(url || "").trim());
}

function normalizeUrl(url) {
  return String(url || "").trim();
}

function collectUrls(registry) {
  const rows = [];
  for (const c of registry.colleges || []) {
    const website = (((c || {}).contacts || {}).website || "");
    if (website) rows.push({ scope: "college.website", id: c.id, url: website });
    for (const src of (((c || {}).verification || {}).source_urls || [])) {
      rows.push({ scope: "college.verification.source_urls", id: c.id, url: src });
    }
    for (const v of ((((c || {}).recognition || {}).verification_urls) || [])) {
      rows.push({ scope: "college.recognition.verification_urls", id: c.id, url: v });
    }
  }
  for (const p of registry.college_programs || []) {
    const v = (((p || {}).admission_route || {}).verification_url || "");
    if (v) rows.push({ scope: "program.admission_route.verification_url", id: p.id, url: v });
  }
  return rows;
}

function main() {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
  const rows = collectUrls(registry);
  const invalid = [];
  const byUrl = new Map();

  for (const row of rows) {
    const u = normalizeUrl(row.url);
    if (!isHttp(u)) invalid.push({ ...row, reason: "non-http-url" });
    const prev = byUrl.get(u) || 0;
    byUrl.set(u, prev + 1);
  }

  const duplicateCandidates = Array.from(byUrl.entries())
    .filter((x) => x[1] > 25)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  if (invalid.length) {
    console.error("validate-college-urls: FAIL");
    console.error("Invalid URLs:", invalid.length);
    invalid.slice(0, 30).forEach((r) => {
      console.error(` - ${r.scope} (${r.id}): ${r.url}`);
    });
    process.exit(1);
  }

  console.log("validate-college-urls: OK");
  console.log("- checked url entries:", rows.length);
  console.log("- unique urls:", byUrl.size);
  if (duplicateCandidates.length) {
    console.log("- high-frequency URLs (review if too generic):");
    duplicateCandidates.forEach(([url, count]) => console.log(`  - ${count}x ${url}`));
  }
}

main();

