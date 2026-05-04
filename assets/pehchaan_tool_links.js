/**
 * Central Pehchaan cross-tool URL builders (uses PehchaanJourney.buildToolUrl).
 * Paths are filenames under Tools/ — same convention as existing hand-built links.
 */
(function () {
  var FILES = {
    salary: "pehchaan_salary_explorer.html",
    examRoadmap: "pehchaan_exam_roadmap.html",
    roi: "pehchaan_career_roi_reality_bridge.html",
    financing: "pehchaan_financing_reality.html",
    planB: "pehchaan_plan_b_strategy_builder.html",
    skillGap: "pehchaan_skill_gap_analyser.html",
    parentGuide: "parents-guide/index.html",
    streamAdvisor: "pehchaan_stream_advisor.html",
    assessment: "pehchaan_career_assessment.html",
    mentor: "pehchaan_mentor_connect.html"
  };

  function u(fileKey, params) {
    var path = FILES[fileKey];
    if (!path) return "#";
    if (window.PehchaanJourney && typeof PehchaanJourney.buildToolUrl === "function") {
      return PehchaanJourney.buildToolUrl(path, params || {});
    }
    var q = Object.keys(params || {})
      .filter(function (k) {
        return params[k] != null && params[k] !== "";
      })
      .map(function (k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(String(params[k]));
      })
      .join("&");
    return q ? path + "?" + q : path;
  }

  function inferStreamFromRegistryTags(row) {
    if (!row || !row.tags) return "";
    var t = row.tags;
    if (t.indexOf("commerce") >= 0 && t.indexOf("science") < 0) return "commerce";
    if (t.indexOf("arts") >= 0 && t.indexOf("science") < 0 && t.indexOf("tech") < 0) return "arts";
    if (t.indexOf("science") >= 0) return "science";
    return "";
  }

  function buildStreamAdvisorNextInner(streamParam) {
    var sp = streamParam || "";
    return (
      '<a href="' +
      u("salary", { from: "stream", stream: sp }) +
      '">Salary Explorer →</a>' +
      '<a class="sec" href="' +
      u("examRoadmap", { from: "stream", stream: sp }) +
      '">Exam Roadmap →</a>' +
      '<a class="sec" href="' +
      u("roi", { from: "stream", stream: sp }) +
      '">ROI reality bridge →</a>'
    );
  }

  function buildRoiNextLinksSpecs(ctx) {
    var roiPct = ctx.roiPct;
    var beYrs = ctx.breakEvenYears;
    var cid = ctx.careerId || "";
    var st0 = ctx.streamTag || "";
    var band = ctx.roiBand || "";
    var specs = [];
    if (roiPct < 100 || beYrs > 8) {
      specs.push({
        href: u("planB", { from: "roi", career: cid, roiBand: band, stream: st0 }),
        label: "Plan B (parallel path) →",
        primary: true
      });
    }
    specs.push({ href: u("salary", { from: "roi", career: cid, stream: st0 }), label: "Salary Explorer →", primary: false });
    specs.push({ href: u("financing", { from: "roi", career: cid }), label: "Loans & EMI reality →", primary: false });
    if (["software_engineer", "data_analyst", "digital_marketing"].indexOf(cid) >= 0) {
      specs.push({ href: u("skillGap", { from: "roi", career: cid }), label: "Skill Gap Analyser →", primary: false });
    }
    specs.push({ href: u("parentGuide", { from: "roi" }), label: "Parent FAQ (money worries) →", primary: false });
    return specs;
  }

  function buildRoiNextLinksHtml(escFn, ctx) {
    var esc = escFn || function (s) {
      return String(s || "");
    };
    return buildRoiNextLinksSpecs(ctx)
      .map(function (s) {
        var cls = s.primary ? "journey-link" : "journey-link secondary";
        return '<a class="' + cls + '" href="' + esc(s.href) + '">' + s.label + "</a>";
      })
      .join("");
  }

  function buildFinancingFooterInner(career) {
    var c = career || "";
    return (
      '<a href="' +
      u("roi", { from: "financing", career: c }) +
      '">Career ROI bridge →</a>' +
      '<a class="sec" href="' +
      u("salary", { from: "financing", career: c }) +
      '">Salary Explorer →</a>' +
      '<a class="sec" href="' +
      u("parentGuide", { from: "financing" }) +
      '">Parent FAQ →</a>'
    );
  }

  /** @param {object|null} regRow — row from pehchaan_career_registry.json */
  function buildSalaryCardNextLinks(regRow, streamGuess) {
    if (!regRow) return "";
    var canon = regRow.canonical_id || "";
    var st = streamGuess || inferStreamFromRegistryTags(regRow);
    var parts = [];
    if (regRow.roi_career_id) {
      parts.push({
        href: u("roi", { from: "salary", career: canon, stream: st }),
        label: "ROI & cost story →",
        primary: true
      });
    }
    parts.push({
      href: u("examRoadmap", { from: "salary", career: canon, stream: st }),
      label: "Exam roadmap →",
      primary: false
    });
    if (regRow.plan_b_exam_id) {
      parts.push({
        href: u("planB", { from: "salary", career: canon, exam: regRow.plan_b_exam_id }),
        label: "Plan B (prep paths) →",
        primary: false
      });
    }
    if (regRow.skill_gap_job_id) {
      parts.push({
        href: u("skillGap", { from: "salary", career: canon, job: regRow.skill_gap_job_id }),
        label: "Skill gap →",
        primary: false
      });
    }
    parts.push({
      href: u("financing", { from: "salary", career: canon }),
      label: "Loans & EMI →",
      primary: false
    });
    var priS =
      "display:inline-block;padding:10px 14px;margin:2px 4px 0 0;border-radius:10px;background:#085041;color:#EF9F27;font-size:12px;font-weight:700;text-decoration:none;";
    var secS =
      "display:inline-block;padding:9px 12px;margin:2px 4px 0 0;border-radius:10px;background:#fff;color:#085041;font-size:12px;font-weight:700;text-decoration:none;border:1.5px solid #085041;";
    return parts
      .map(function (x) {
        return '<a style="' + (x.primary ? priS : secS) + '" href="' + x.href + '">' + x.label + "</a>";
      })
      .join("");
  }

  function wrapNextCard(title, linksInnerHtml) {
    if (!linksInnerHtml) return "";
    return (
      '<div class="pehchaan-journey-next" style="margin-top:14px;padding:14px 16px;background:linear-gradient(135deg,#FAF6EE,#FFF9F0);border:1.5px solid rgba(232,165,74,0.45);border-radius:14px;">' +
      '<div style="font-size:11px;font-weight:700;color:#085041;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">' +
      (title || "Continue with other tools") +
      "</div>" +
      '<p style="font-size:11px;color:#64748B;margin-bottom:10px;line-height:1.55;">Links pass context when we know it — you can still change everything on the next page.</p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">' +
      linksInnerHtml +
      "</div></div>"
    );
  }

  function buildExamRoadmapResultInner(selClass, selStream, stateVal, careerCsv) {
    var c = careerCsv || "";
    var first = c.split(",")[0] || c;
    var st = selStream || "";
    var priS =
      "display:inline-block;padding:10px 14px;margin:2px 4px 0 0;border-radius:10px;background:#085041;color:#EF9F27;font-size:12px;font-weight:700;text-decoration:none;";
    var secS =
      "display:inline-block;padding:9px 12px;margin:2px 4px 0 0;border-radius:10px;background:#fff;color:#085041;font-size:12px;font-weight:700;text-decoration:none;border:1.5px solid #085041;";
    return (
      '<a style="' +
      priS +
      '" href="' +
      u("salary", { from: "roadmap", career: first, stream: st }) +
      '">Salary bands →</a>' +
      '<a style="' +
      secS +
      '" href="' +
      u("roi", { from: "roadmap", career: first, stream: st }) +
      '">ROI bridge →</a>' +
      '<a style="' +
      secS +
      '" href="' +
      u("planB", { from: "roadmap", career: first }) +
      '">Plan B →</a>' +
      '<a style="' +
      secS +
      '" href="' +
      u("skillGap", { from: "roadmap", career: first }) +
      '">Skill gap →</a>'
    );
  }

  function buildAssessmentNextInner(profileCode) {
    var p = profileCode || "";
    var priS =
      "display:inline-block;padding:10px 14px;margin:2px 4px 0 0;border-radius:10px;background:#085041;color:#EF9F27;font-size:12px;font-weight:700;text-decoration:none;";
    var secS =
      "display:inline-block;padding:9px 12px;margin:2px 4px 0 0;border-radius:10px;background:#fff;color:#085041;font-size:12px;font-weight:700;text-decoration:none;border:1.5px solid #085041;";
    return (
      '<a style="' +
      priS +
      '" href="' +
      u("streamAdvisor", { from: "assessment", profile: p }) +
      '">Stream advisor →</a>' +
      '<a style="' +
      secS +
      '" href="' +
      u("salary", { from: "assessment", profile: p }) +
      '">Salary Explorer →</a>' +
      '<a style="' +
      secS +
      '" href="' +
      u("examRoadmap", { from: "assessment", profile: p }) +
      '">Exam roadmap →</a>'
    );
  }

  function buildMentorSearchResultInner() {
    var priS =
      "display:inline-block;padding:10px 14px;margin:2px 4px 0 0;border-radius:10px;background:#085041;color:#EF9F27;font-size:12px;font-weight:700;text-decoration:none;";
    var secS =
      "display:inline-block;padding:9px 12px;margin:2px 4px 0 0;border-radius:10px;background:#fff;color:#085041;font-size:12px;font-weight:700;text-decoration:none;border:1.5px solid #085041;";
    return (
      '<a style="' +
      priS +
      '" href="' +
      u("salary", { from: "mentor" }) +
      '">Salary Explorer →</a>' +
      '<a style="' +
      secS +
      '" href="' +
      u("planB", { from: "mentor" }) +
      '">Plan B →</a>' +
      '<a style="' +
      secS +
      '" href="' +
      u("parentGuide", { from: "mentor" }) +
      '">Parent FAQ →</a>'
    );
  }

  window.PehchaanToolLinks = {
    FILES: FILES,
    u: u,
    inferStreamFromRegistryTags: inferStreamFromRegistryTags,
    buildStreamAdvisorNextInner: buildStreamAdvisorNextInner,
    buildRoiNextLinksSpecs: buildRoiNextLinksSpecs,
    buildRoiNextLinksHtml: buildRoiNextLinksHtml,
    buildFinancingFooterInner: buildFinancingFooterInner,
    buildSalaryCardNextLinks: buildSalaryCardNextLinks,
    wrapNextCard: wrapNextCard,
    buildExamRoadmapResultInner: buildExamRoadmapResultInner,
    buildAssessmentNextInner: buildAssessmentNextInner,
    buildMentorSearchResultInner: buildMentorSearchResultInner
  };
})();
