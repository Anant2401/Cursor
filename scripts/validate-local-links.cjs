#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SCAN_EXT = new Set([".html", ".js", ".xml", ".md", ".css"]);
const SKIP_DIRS = new Set([".git", "node_modules"]);

function walk(dir, out) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    const rel = path.relative(ROOT, abs).replace(/\\/g, "/");
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      if (rel.startsWith("parent-faq/out/")) continue;
      if (rel.startsWith("parent-faq/.next/")) continue;
      if (rel.startsWith("Tools/parents-guide/_next/")) continue;
      walk(abs, out);
      continue;
    }
    if (SCAN_EXT.has(path.extname(entry.name).toLowerCase())) {
      out.push(abs);
    }
  }
}

function shouldSkipUrl(url) {
  if (!url) return true;
  if (url.startsWith("#")) return true;
  if (url.startsWith("mailto:")) return true;
  if (url.startsWith("tel:")) return true;
  if (url.startsWith("data:")) return true;
  if (/^https?:\/\//i.test(url)) return true;
  if (url.startsWith("//")) return true;
  if (url.startsWith("/")) return true; // site-root absolute links (valid in deploy)
  if (url.includes("${")) return true;
  if (url.includes("' +")) return true;
  if (url.includes("+ '")) return true;
  if (url.includes(" + ")) return true;
  if (url.includes("\\n")) return true;
  return false;
}

function extractRefs(content, ext) {
  const refs = [];
  const patterns = [];
  if (ext === ".html" || ext === ".xml" || ext === ".md") {
    patterns.push(/href="([^"]+)"/g, /src="([^"]+)"/g);
  }
  // Keep fetch checks for HTML + JS; this catches DB/data path regressions.
  if (ext === ".html" || ext === ".js") {
    patterns.push(/fetch\(\s*["']([^"']+)["']/g);
  }
  for (const re of patterns) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(content))) refs.push(m[1].trim());
  }
  return refs;
}

function main() {
  const files = [];
  walk(ROOT, files);
  let scannedRefs = 0;
  const broken = [];

  for (const absFile of files) {
    const relFile = path.relative(ROOT, absFile).replace(/\\/g, "/");
    const ext = path.extname(absFile).toLowerCase();
    const content = fs.readFileSync(absFile, "utf8");
    const refs = extractRefs(content, ext);
    for (const raw of refs) {
      if (shouldSkipUrl(raw)) continue;
      const clean = raw.split("#")[0].split("?")[0].trim();
      if (!clean) continue;
      scannedRefs += 1;
      const target = path.resolve(path.dirname(absFile), clean);
      if (!fs.existsSync(target)) {
        broken.push({ file: relFile, ref: raw });
      }
    }
  }

  if (broken.length) {
    console.error("validate-local-links: " + broken.length + " broken local references found");
    broken.slice(0, 200).forEach((b) => {
      console.error(" - " + b.file + " -> " + b.ref);
    });
    process.exit(1);
  }

  console.log("validate-local-links: OK");
  console.log(" - files scanned:", files.length);
  console.log(" - local refs checked:", scannedRefs);
}

main();

