#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const REGISTRY_PATH = path.join(ROOT, "DB", "pehchaan_college_registry.json");
const INDEX_PATH = path.join(ROOT, "DB", "pehchaan_college_registry_indexes.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function uniquePush(arr, value) {
  if (!arr.includes(value)) arr.push(value);
}

function buildIndexes(registry) {
  const byState = {};
  const byStream = {};
  const byCourse = {};
  const byStateStreamCourse = {};
  const byNeighborStateStreamCourse = {};
  const collegeStateById = new Map();
  const today = new Date().toISOString().slice(0, 10);

  (registry.colleges || []).forEach((c) => {
    collegeStateById.set(c.id, c.state_id);
    if (!byState[c.state_id]) byState[c.state_id] = [];
    uniquePush(byState[c.state_id], c.id);
  });

  (registry.college_programs || []).forEach((p) => {
    if (!byStream[p.stream_id]) byStream[p.stream_id] = [];
    uniquePush(byStream[p.stream_id], p.id);
    if (!byCourse[p.course_id]) byCourse[p.course_id] = [];
    uniquePush(byCourse[p.course_id], p.id);
    const stateId = collegeStateById.get(p.college_id) || "UNKNOWN";
    const key = [stateId, p.stream_id, p.course_id].join("|");
    if (!byStateStreamCourse[key]) byStateStreamCourse[key] = [];
    uniquePush(byStateStreamCourse[key], p.id);
  });

  const neighbors = registry.state_neighbors || {};
  Object.keys(neighbors).forEach((stateId) => {
    const list = Array.isArray(neighbors[stateId]) ? neighbors[stateId] : [];
    list.forEach((nState) => {
      Object.keys(byStateStreamCourse).forEach((k) => {
        const parts = k.split("|");
        if (parts[0] !== nState) return;
        const nKey = [stateId, parts[1], parts[2]].join("|");
        if (!byNeighborStateStreamCourse[nKey]) byNeighborStateStreamCourse[nKey] = [];
        byStateStreamCourse[k].forEach((pid) => uniquePush(byNeighborStateStreamCourse[nKey], pid));
      });
    });
  });

  return {
    meta: {
      version: "1.1.0",
      last_updated: today,
      generated_from: "DB/pehchaan_college_registry.json",
      notes: "Generated lookup indexes for fast client-side filtering."
    },
    by_state: byState,
    by_stream: byStream,
    by_course: byCourse,
    by_state_stream_course: byStateStreamCourse,
    by_neighbor_state_stream_course: byNeighborStateStreamCourse
  };
}

function main() {
  const registry = readJson(REGISTRY_PATH);
  const indexes = buildIndexes(registry);
  writeJson(INDEX_PATH, indexes);
  console.log("build-college-indexes: OK");
  console.log("- states:", Object.keys(indexes.by_state).length);
  console.log("- state+stream+course keys:", Object.keys(indexes.by_state_stream_course).length);
}

main();
