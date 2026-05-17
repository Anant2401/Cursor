#!/usr/bin/env node
/**
 * Build parent-faq (Next static export) and copy out/ → Tools/parents-guide/.
 * Run from repo root: node scripts/export-parents-guide.cjs
 *
 * Required before committing Parent's Guide HTML/CSS/JS so production matches index.html.
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const appDir = path.join(root, "parent-faq");
const outDir = path.join(appDir, "out");
const destDir = path.join(root, "Tools", "parents-guide");

function main() {
  if (!fs.existsSync(path.join(appDir, "package.json"))) {
    console.error("export-parents-guide: parent-faq/package.json not found");
    process.exit(1);
  }
  if (!fs.existsSync(path.join(appDir, "node_modules"))) {
    console.log("export-parents-guide: installing parent-faq dependencies…");
    execSync("npm install", { cwd: appDir, stdio: "inherit" });
  }
  console.log("export-parents-guide: building Next static export…");
  execSync("npm run build", { cwd: appDir, stdio: "inherit" });
  if (!fs.existsSync(path.join(outDir, "index.html"))) {
    console.error("export-parents-guide: build did not produce parent-faq/out/index.html");
    process.exit(1);
  }
  fs.mkdirSync(destDir, { recursive: true });
  const destNext = path.join(destDir, "_next");
  if (fs.existsSync(destNext)) {
    fs.rmSync(destNext, { recursive: true, force: true });
  }
  console.log("export-parents-guide: copying out/ → Tools/parents-guide/ …");
  fs.cpSync(outDir, destDir, { recursive: true, force: true });

  const chunksDir = path.join(destDir, "_next", "static", "chunks");
  let cssCount = 0;
  let jsCount = 0;
  if (fs.existsSync(chunksDir)) {
    for (const name of fs.readdirSync(chunksDir)) {
      if (name.endsWith(".css")) cssCount++;
      if (name.endsWith(".js")) jsCount++;
    }
  }
  console.log(
    `export-parents-guide: done — ${cssCount} CSS chunk(s), ${jsCount} JS chunk(s) under _next/static/chunks.`
  );
  console.log("Next: node scripts/validate-tool-integration.cjs  (checks asset paths)");
  console.log("Then git add Tools/parents-guide/ and commit the full export (including _next/).");
}

main();
