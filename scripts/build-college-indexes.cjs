#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const REGISTRY_PATH = path.join(ROOT, "DB", "pehchaan_college_registry.json");
const INDEX_PATH = path.join(ROOT, "DB", "pehchaan_college_registry_indexes.json");
const SHARDS_ROOT = path.join(ROOT, "DB", "shards");
const COLLEGE_SHARDS_ROOT = path.join(SHARDS_ROOT, "college_registry");
const INSTITUTION_SHARDS_DIR = path.join(COLLEGE_SHARDS_ROOT, "institutions");
const PROGRAM_SHARDS_DIR = path.join(COLLEGE_SHARDS_ROOT, "programs");
const SHARD_MANIFEST_PATH = path.join(SHARDS_ROOT, "college_registry_manifest.json");
const SHARD_INDEXES_PATH = path.join(SHARDS_ROOT, "college_registry_indexes.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
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
  const byStreamCourse = {};
  const byStreamCourseStates = {};
  const programStateById = {};
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
    programStateById[p.id] = stateId;
    const key = [stateId, p.stream_id, p.course_id].join("|");
    if (!byStateStreamCourse[key]) byStateStreamCourse[key] = [];
    uniquePush(byStateStreamCourse[key], p.id);
    const streamCourseKey = [p.stream_id, p.course_id].join("|");
    if (!byStreamCourse[streamCourseKey]) byStreamCourse[streamCourseKey] = [];
    uniquePush(byStreamCourse[streamCourseKey], p.id);
    if (!byStreamCourseStates[streamCourseKey]) byStreamCourseStates[streamCourseKey] = [];
    uniquePush(byStreamCourseStates[streamCourseKey], stateId);
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
    by_neighbor_state_stream_course: byNeighborStateStreamCourse,
    by_stream_course: byStreamCourse,
    by_stream_course_states: byStreamCourseStates,
    program_state_by_id: programStateById
  };
}

function buildCollegeRegistryShards(registry, indexes) {
  const byStateInstitutions = {};
  const byStatePrograms = {};
  const states = (registry.taxonomies && registry.taxonomies.states) || [];
  const stateNeighbors = registry.state_neighbors || {};
  const stateLabelById = {};
  states.forEach((state) => {
    stateLabelById[state.id] = state.label;
  });

  (registry.colleges || []).forEach((college) => {
    const stateId = college.state_id || "UNKNOWN";
    if (!byStateInstitutions[stateId]) byStateInstitutions[stateId] = [];
    byStateInstitutions[stateId].push(college);
  });

  (registry.college_programs || []).forEach((program) => {
    const stateId = indexes.program_state_by_id[program.id] || "UNKNOWN";
    if (!byStatePrograms[stateId]) byStatePrograms[stateId] = [];
    byStatePrograms[stateId].push(program);
  });

  const allStateIds = new Set(
    Object.keys(byStateInstitutions)
      .concat(Object.keys(byStatePrograms))
      .concat(Object.keys(stateNeighbors))
  );
  const stateShardMap = {};
  const shardRows = [];

  Array.from(allStateIds)
    .sort()
    .forEach((stateId) => {
      const institutionFile = `DB/shards/college_registry/institutions/${stateId}.json`;
      const programFile = `DB/shards/college_registry/programs/${stateId}.json`;
      const institutions = byStateInstitutions[stateId] || [];
      const programs = byStatePrograms[stateId] || [];
      writeJson(path.join(INSTITUTION_SHARDS_DIR, `${stateId}.json`), {
        meta: {
          shard_type: "institutions",
          state_id: stateId,
          state_label: stateLabelById[stateId] || stateId,
          count: institutions.length,
          generated_on: new Date().toISOString().slice(0, 10)
        },
        institutions
      });
      writeJson(path.join(PROGRAM_SHARDS_DIR, `${stateId}.json`), {
        meta: {
          shard_type: "programs",
          state_id: stateId,
          state_label: stateLabelById[stateId] || stateId,
          count: programs.length,
          generated_on: new Date().toISOString().slice(0, 10)
        },
        programs
      });
      stateShardMap[stateId] = {
        institutions_file: institutionFile,
        programs_file: programFile,
        institutions_count: institutions.length,
        programs_count: programs.length
      };
      shardRows.push({
        state_id: stateId,
        state_label: stateLabelById[stateId] || stateId,
        institutions_count: institutions.length,
        programs_count: programs.length,
        institutions_file: institutionFile,
        programs_file: programFile
      });
    });

  const manifest = {
    meta: {
      schema_version: "1.0.0",
      generated_on: new Date().toISOString().slice(0, 10),
      generated_from: "DB/pehchaan_college_registry.json",
      notes: "State-sharded institution and program datasets for lazy browser loading."
    },
    taxonomies: registry.taxonomies || {},
    state_neighbors: stateNeighbors,
    state_shards: shardRows,
    state_shard_map: stateShardMap
  };

  const shardIndexes = {
    meta: {
      schema_version: "1.0.0",
      generated_on: new Date().toISOString().slice(0, 10),
      generated_from: "DB/pehchaan_college_registry.json",
      notes: "Indexes paired with state shards for fast filter-first access."
    },
    by_state_stream_course: indexes.by_state_stream_course,
    by_neighbor_state_stream_course: indexes.by_neighbor_state_stream_course,
    by_stream_course: indexes.by_stream_course,
    by_stream_course_states: indexes.by_stream_course_states,
    program_state_by_id: indexes.program_state_by_id
  };

  writeJson(SHARD_MANIFEST_PATH, manifest);
  writeJson(SHARD_INDEXES_PATH, shardIndexes);
}

function main() {
  const registry = readJson(REGISTRY_PATH);
  const indexes = buildIndexes(registry);
  writeJson(INDEX_PATH, indexes);
  buildCollegeRegistryShards(registry, indexes);
  console.log("build-college-indexes: OK");
  console.log("- states:", Object.keys(indexes.by_state).length);
  console.log("- state+stream+course keys:", Object.keys(indexes.by_state_stream_course).length);
  console.log("- shard manifest:", path.relative(ROOT, SHARD_MANIFEST_PATH));
  console.log("- shard indexes:", path.relative(ROOT, SHARD_INDEXES_PATH));
}

main();
