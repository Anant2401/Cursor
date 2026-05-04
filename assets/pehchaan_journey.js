/**
 * Pehchaan cross-tool journey: URL params + sessionStorage handoff.
 * Query: ?from=roi&career=software_engineer&stream=science&exam=jee&roiBand=low
 */
(function () {
  var STORAGE_KEY = "pehchaan_journey";

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

  function mergeJourney() {
    var fromSession = getFromSession();
    var fromUrl = getFromUrl();
    var merged = Object.assign({}, fromSession, fromUrl);
    Object.keys(merged).forEach(function (k) {
      if (merged[k] === "" || merged[k] == null) delete merged[k];
    });
    return merged;
  }

  function setJourney(partial) {
    try {
      var cur = getFromSession();
      var next = Object.assign({}, cur, partial || {});
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
    buildToolUrl: buildToolUrl,
  };
})();
