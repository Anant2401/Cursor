(function () {
  function clamp(n, min, max) {
    var v = Number(n);
    if (!isFinite(v)) return min;
    return Math.max(min, Math.min(max, Math.round(v)));
  }

  function parseBand(n) {
    var x = Number(n);
    if (!isFinite(x) || x <= 0) x = 6;
    var lo = Math.max(1, +(x * 0.6).toFixed(1));
    var hi = +(x * 1.4).toFixed(1);
    return lo + "-" + hi;
  }

  function asArray(v) {
    return Array.isArray(v) ? v : [];
  }
  function normalizeWorkMode(v) {
    var m = String(v || "").toLowerCase().trim();
    if (m === "on-site" || m === "onsite") return "onsite";
    if (m === "remote") return "remote";
    if (m === "hybrid") return "hybrid";
    return "mixed";
  }
  function guessEmoji(name, segments) {
    var n = String(name || "").toLowerCase();
    var seg = asArray(segments).join(" ").toLowerCase();
    if (/doctor|nurs|medic|pharma|health/.test(n + " " + seg)) return "🩺";
    if (/engineer|developer|software|data|analyst|ai|cyber/.test(n + " " + seg)) return "💻";
    if (/design|content|media|writer|film|artist/.test(n + " " + seg)) return "🎨";
    if (/teacher|professor|educat|trainer/.test(n + " " + seg)) return "📚";
    if (/finance|account|bank|audit|ca|tax/.test(n + " " + seg)) return "💼";
    if (/law|legal|judge|advocate/.test(n + " " + seg)) return "⚖️";
    if (/sales|marketing|business/.test(n + " " + seg)) return "📈";
    if (/gov|civil|defence|army|police/.test(n + " " + seg)) return "🏛️";
    return "🎯";
  }

  function fetchJson(url) {
    return fetch(url, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status + " for " + url);
      return r.json();
    });
  }

  function loadCanonicalOrLegacy(canonicalUrl, legacyUrl, adaptFn) {
    return fetchJson(canonicalUrl)
      .then(function (canonical) {
        return adaptFn(canonical);
      })
      .catch(function () {
        return fetchJson(legacyUrl);
      });
  }

  function loadFirstAvailable(urls, adaptFn) {
    var list = asArray(urls).filter(function (u) { return !!u; });
    if (!list.length) return Promise.reject(new Error("No data URLs provided."));
    var lastErr = new Error("Unable to load data from all candidates.");
    function tryAt(i) {
      if (i >= list.length) throw lastErr;
      return fetchJson(list[i]).then(function (payload) {
        return typeof adaptFn === "function" ? adaptFn(payload) : payload;
      }).catch(function (err) {
        lastErr = err;
        return tryAt(i + 1);
      });
    }
    return tryAt(0);
  }

  function adaptSalaryFromCanonical(canonical) {
    var careers = asArray(canonical && canonical.careers).map(function (c, i) {
      var legacy = c.legacy_refs || {};
      var sid = Number(legacy.salary_explorer_id || i + 1);
      return {
        id: sid,
        name: c.name || c.career_id || ("Career " + sid),
        emoji: guessEmoji(c.name, c.segments),
        stream: asArray(c.stream).length ? asArray(c.stream) : ["any"],
        tags: [c.career_tier || "Career"],
        segments: asArray(c.segments),
        entryLPA: c.salary_structure && c.salary_structure.fresher_avg ? String(c.salary_structure.fresher_avg) : parseBand(5),
        midLPA: c.salary_structure && c.salary_structure.tier_1_city ? String(c.salary_structure.tier_1_city) : parseBand(10),
        seniorLPA: parseBand(18),
        reality: clamp(100 - (c.ai_impact_score || 5) * 5, 35, 95),
        time: "Varies by pathway",
        exams: asArray(c.exams),
        paths: asArray(c.lateral_entry_paths),
        skills: asArray(c.skills),
        honest: c.description || "Use this as guidance, not guarantee.",
        cg: "Local opportunities vary by city and specialization.",
        typicalEmployers: asArray(c.typical_employers),
        workMode: normalizeWorkMode(c.work_mode),
        demandOutlook: /high/i.test(c.national_demand || "") ? "strong" : "stable",
        salaryContext: c.salary_context || ""
      };
    });
    careers.sort(function (a, b) { return a.id - b.id; });
    return {
      meta: {
        last_updated: new Date().toISOString().slice(0, 10),
        version: "canonical-adapter-1.1",
        dataYear: new Date().getFullYear(),
        title: "Career & Salary Explorer"
      },
      careers: careers
    };
  }

  window.PehchaanDbAdapters = {
    fetchJson: fetchJson,
    loadFirstAvailable: loadFirstAvailable,
    loadCanonicalOrLegacy: loadCanonicalOrLegacy,
    adaptSalaryFromCanonical: adaptSalaryFromCanonical
  };
})();
