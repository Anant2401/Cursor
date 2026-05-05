/**
 * Pehchaan cross-tool journey: URL params + sessionStorage handoff.
 * Query: ?from=roi&career=software_engineer&stream=science&exam=jee&roiBand=low
 */
(function () {
  var STORAGE_KEY = "pehchaan_journey";
  var ALLOWED_KEYS = {
    from: true,
    career: true,
    private_role_id: true,
    job: true,
    exam: true,
    stream: true,
    class: true,
    state: true,
    roiBand: true,
    metro: true,
    role_family: true,
    readiness_band: true,
    profile: true,
    ts: true
  };

  function parseSearch(search) {
    var q = (search || "").replace(/^\?/, "");
    if (!q) return {};
    var out = {};
    q.split("&").forEach(function (pair) {
      var i = pair.indexOf("=");
      var k = decodeURIComponent(i >= 0 ? pair.slice(0, i) : pair).trim();
      var v = decodeURIComponent(i >= 0 ? pair.slice(i + 1) : "").trim();
      if (k) out[k] = v;
    });
    return out;
  }

  function getFromUrl() {
    return parseSearch(window.location.search || "");
  }

  function getFromSession() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw) || {};
    } catch (e) {
      return {};
    }
  }

  function sanitizeParams(obj) {
    var out = {};
    Object.keys(obj || {}).forEach(function (k) {
      if (!ALLOWED_KEYS[k]) return;
      var v = obj[k];
      if (v === "" || v == null) return;
      out[k] = String(v).trim();
    });
    if (out.ts && !/^\d+$/.test(String(out.ts))) delete out.ts;
    return out;
  }

  function mergeJourney() {
    var fromSession = sanitizeParams(getFromSession());
    var fromUrl = sanitizeParams(getFromUrl());
    return Object.assign({}, fromSession, fromUrl);
  }

  function setJourney(partial) {
    try {
      var cur = sanitizeParams(getFromSession());
      var next = Object.assign({}, cur, sanitizeParams(partial || {}));
      next.ts = Date.now();
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {}
  }

  /**
   * @param {string} path - e.g. "Tools/pehchaan_plan_b_strategy_builder.html"
   * @param {Record<string,string>} params
   */
  function buildToolUrl(path, params) {
    var base = path.indexOf("http") === 0 ? path : path;
    var q = [];
    Object.keys(params || {}).forEach(function (k) {
      if (params[k] != null && params[k] !== "") q.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(params[k])));
    });
    if (!q.length) return base;
    return base + (base.indexOf("?") >= 0 ? "&" : "?") + q.join("&");
  }

  window.PehchaanJourney = {
    STORAGE_KEY: STORAGE_KEY,
    parseSearch: parseSearch,
    getFromUrl: getFromUrl,
    getFromSession: getFromSession,
    mergeJourney: mergeJourney,
    setJourney: setJourney,
    sanitizeParams: sanitizeParams,
    buildToolUrl: buildToolUrl,
    ALLOWED_KEYS: ALLOWED_KEYS
  };
})();
