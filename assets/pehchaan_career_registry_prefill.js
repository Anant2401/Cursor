/**
 * Loads DB/pehchaan_career_registry.json and merges URL + PehchaanJourney session params.
 * Optional dependency: ../assets/pehchaan_journey.js (PehchaanJourney.mergeJourney).
 */
(function () {
  var CACHE = null;
  var CACHE_PROMISE = null;

  function registryUrl() {
    return "../DB/pehchaan_career_registry.json";
  }

  function mergeParams() {
    var u = {};
    try {
      new URLSearchParams(window.location.search || "").forEach(function (v, k) {
        if (v != null && String(v).trim() !== "") u[k] = String(v).trim();
      });
    } catch (e) {}
    var j = {};
    if (window.PehchaanJourney && typeof PehchaanJourney.mergeJourney === "function") {
      try {
        j = PehchaanJourney.mergeJourney() || {};
      } catch (e2) {}
    }
    var out = Object.assign({}, j, u);
    ["career", "stream", "class", "state", "exam", "job"].forEach(function (k) {
      if (out[k] == null || out[k] === "") delete out[k];
    });
    return out;
  }

  function load() {
    if (CACHE) return Promise.resolve(CACHE);
    if (CACHE_PROMISE) return CACHE_PROMISE;
    CACHE_PROMISE = fetch(registryUrl(), { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("registry HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        var byCanon = {};
        (data.careers || []).forEach(function (row) {
          if (row && row.canonical_id) byCanon[row.canonical_id] = row;
        });
        CACHE = { raw: data, byCanonical: byCanon, list: data.careers || [] };
        return CACHE;
      })
      .catch(function (err) {
        CACHE_PROMISE = null;
        throw err;
      });
    return CACHE_PROMISE;
  }

  function resolveRow(canonicalOrRow, reg) {
    if (!canonicalOrRow || !reg || !reg.byCanonical) return null;
    return reg.byCanonical[canonicalOrRow] || null;
  }

  function findRowByExamRoadmapCareerId(reg, rid) {
    if (!reg || !reg.list || !rid) return null;
    var id = String(rid).trim();
    for (var i = 0; i < reg.list.length; i++) {
      if (reg.list[i].exam_roadmap_career_id === id) return reg.list[i];
    }
    return null;
  }

  function findRowBySalaryExplorerId(reg, numId) {
    if (!reg || !reg.list || numId == null || numId === "") return null;
    var n = parseInt(numId, 10);
    if (isNaN(n)) return null;
    for (var i = 0; i < reg.list.length; i++) {
      if (Number(reg.list[i].salary_explorer_id) === n) return reg.list[i];
    }
    return null;
  }

  /** Resolve URL/session `career` token to a registry row: canonical id, exam roadmap career id, or numeric salary explorer id. */
  function resolveCareerTokenRow(reg, token) {
    if (!reg || !token) return null;
    var t = String(token).trim();
    var fromCanon = resolveRow(t, reg);
    if (fromCanon) return fromCanon;
    var fromExam = findRowByExamRoadmapCareerId(reg, t);
    if (fromExam) return fromExam;
    if (/^\d+$/.test(t)) return findRowBySalaryExplorerId(reg, parseInt(t, 10));
    return null;
  }

  window.PehchaanRegistryPrefill = {
    load: load,
    mergeParams: mergeParams,
    resolveRow: resolveRow,
    findRowByExamRoadmapCareerId: findRowByExamRoadmapCareerId,
    findRowBySalaryExplorerId: findRowBySalaryExplorerId,
    resolveCareerTokenRow: resolveCareerTokenRow,
    clearCache: function () {
      CACHE = null;
      CACHE_PROMISE = null;
    },
  };
})();
