/**
 * Pehchaan recommendation engine for connected tool navigation.
 * Deterministic rules only (no model dependency).
 */
(function () {
  var TOOL = {
    salary: "salary",
    skillGap: "skill_gap",
    planB: "plan_b",
    mentor: "mentor",
    financing: "financing",
    roi: "roi",
    examRoadmap: "exam_roadmap",
    collegeFinder: "college_finder",
    assessment: "assessment",
    streamAdvisor: "stream_advisor",
    privateSectorJourney: "private_sector_journey"
  };

  function normalizeCurrentTool(currentTool) {
    return String(currentTool || "").trim().toLowerCase();
  }

  function currentToolQuickLinkKey(currentTool) {
    var t = normalizeCurrentTool(currentTool);
    var map = {
      plan_b: "planB",
      skill_gap: "skillGap",
      financing: "financing",
      roi: "roi",
      exam_roadmap: "examRoadmap",
      college_finder: "collegeFinder"
    };
    return map[t] || "";
  }

  function normalizeContext(ctx) {
    var src = (ctx || {});
    var clean = {};
    [
      "from",
      "career",
      "private_role_id",
      "job",
      "exam",
      "stream",
      "class",
      "state",
      "roiBand",
      "metro",
      "role_family",
      "readiness_band",
      "course",
      "profile"
    ].forEach(function (k) {
      var v = src[k];
      if (v == null || v === "") return;
      clean[k] = String(v).trim();
    });
    return clean;
  }

  function baseState(localState) {
    var s = localState || {};
    return {
      roleSelected: !!s.roleSelected,
      skillResultDone: !!s.skillResultDone,
      actionPlanStarted: !!s.actionPlanStarted,
      outreachStarted: !!s.outreachStarted,
      examDriven: !!s.examDriven
    };
  }

  function toRecommendation(tool, reason, ctx, isPrimary) {
    var toolLinkKeyMap = {
      salary: "salary",
      skill_gap: "skillGap",
      plan_b: "planB",
      mentor: "mentor"
    };
    var labelMap = {
      salary: "Salary Explorer",
      skillGap: "Skill Gap Analyser",
      planB: "Plan B Strategy Builder",
      mentor: "Mentor Connect"
    };
    var href = "#";
    if (window.PehchaanToolLinks && typeof window.PehchaanToolLinks.buildToolUrlWithPrivateContext === "function") {
      href = window.PehchaanToolLinks.buildToolUrlWithPrivateContext(toolLinkKeyMap[tool] || tool, ctx, { from: ctx.from || "" });
    } else if (window.PehchaanToolLinks && typeof window.PehchaanToolLinks.u === "function") {
      href = window.PehchaanToolLinks.u(toolLinkKeyMap[tool] || tool, ctx);
    }
    return {
      tool: tool,
      label: labelMap[tool] || tool,
      href: href,
      reason: reason,
      primary: !!isPrimary
    };
  }

  function buildNextToolRecommendations(currentTool, mergedContext, localState) {
    var thisTool = normalizeCurrentTool(currentTool);
    var ctx = normalizeContext(mergedContext);
    var st = baseState(localState);
    var hasRole = !!(ctx.private_role_id || ctx.career || st.roleSelected);
    var hasMetro = !!ctx.metro;
    var isExamDriven = !!(ctx.exam || st.examDriven);
    var roiLowMid = ctx.roiBand === "low" || ctx.roiBand === "mid";
    var doneSkill = !!(ctx.readiness_band || st.skillResultDone);

    var primary = null;
    var secondary = null;

    if (!hasMetro) {
      primary = toRecommendation("salary", "Pick a metro first to compare real demand and salary ranges.", ctx, true);
      secondary = toRecommendation("planB", "Use Plan B to see parallel income options while you prepare.", ctx, false);
    } else if (hasRole && !doneSkill) {
      primary = toRecommendation("skillGap", "Check your readiness for this role and get a 30/60/90 day plan.", ctx, true);
      secondary = toRecommendation("salary", "Keep salary and growth expectations realistic while planning upskilling.", ctx, false);
    } else if (doneSkill && !st.actionPlanStarted) {
      primary = toRecommendation("planB", "Translate your role plan into immediate earning and action steps.", ctx, true);
      secondary = toRecommendation("mentor", "Validate your plan through real professionals in your target city.", ctx, false);
    } else if (isExamDriven && roiLowMid) {
      primary = toRecommendation("planB", "Lower/medium ROI cases benefit from parallel career options.", ctx, true);
      secondary = toRecommendation("skillGap", "Build practical skills to reduce dependency on one exam outcome.", ctx, false);
    } else if (!st.outreachStarted) {
      primary = toRecommendation("mentor", "Get role and city reality from people already in the field.", ctx, true);
      secondary = toRecommendation("salary", "Re-check salary bands and growth before final decisions.", ctx, false);
    }

    if (!primary) {
      primary = toRecommendation("salary", "Start with role and city comparison to anchor decisions.", ctx, true);
    }
    if (!secondary) {
      secondary = toRecommendation("skillGap", "Then check your skill gaps and execution roadmap.", ctx, false);
    }

    var recOrder = ["salary", "skill_gap", "plan_b", "mentor"];
    function pickFallback(excluded) {
      for (var i = 0; i < recOrder.length; i++) {
        var k = recOrder[i];
        if (k === thisTool) continue;
        if (excluded.indexOf(k) >= 0) continue;
        if (k === "salary") return toRecommendation("salary", "Compare realistic salary paths next.", ctx, true);
        if (k === "skill_gap") return toRecommendation("skillGap", "Build a practical skill plan before deciding.", ctx, true);
        if (k === "plan_b") return toRecommendation("planB", "Keep a parallel plan active while you prepare.", ctx, true);
        if (k === "mentor") return toRecommendation("mentor", "Validate your direction with a mentor conversation.", ctx, true);
      }
      return null;
    }

    if (primary && primary.tool === thisTool) {
      primary = pickFallback([]);
    }
    if (secondary && (secondary.tool === thisTool || (primary && secondary.tool === primary.tool))) {
      secondary = pickFallback(primary ? [primary.tool] : []);
      if (secondary) secondary.primary = false;
    }

    return {
      title: "What to do next",
      context: ctx,
      currentTool: thisTool,
      primary: primary,
      secondary: secondary
    };
  }

  function buildRecommendationsHtml(rec, escFn) {
    var esc = escFn || function (s) {
      return String(s || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    };
    if (!rec || !rec.primary) return "";
    var sec = rec.secondary;
    var ctx = rec.context || {};
    var quickLinks = [];
    var excludedQuickLinkKey = currentToolQuickLinkKey(rec.currentTool);
    var toolSet = [
      { key: "roi", label: "ROI & cost story" },
      { key: "examRoadmap", label: "Exam roadmap" },
      { key: "planB", label: "Plan B (prep paths)" },
      { key: "collegeFinder", label: "College Finder" },
      { key: "skillGap", label: "Skill gap" },
      { key: "financing", label: "Loans & EMI" }
    ].filter(function (t) {
      return t.key !== excludedQuickLinkKey;
    });
    if (window.PehchaanToolLinks && typeof window.PehchaanToolLinks.u === "function") {
      toolSet.forEach(function (t) {
        quickLinks.push({ href: window.PehchaanToolLinks.u(t.key, ctx), label: t.label });
      });
    }
    var html = "";
    html += '<div class="pehchaan-next-tools" style="margin-top:16px;margin-bottom:14px;display:block;width:100%;min-width:100%;flex:1 1 100%;box-sizing:border-box;">';
    html += '<div style="width:100%;box-sizing:border-box;padding:16px;background:linear-gradient(135deg,#FAF6EE,#FFF9F0);border:1.5px solid rgba(232,165,74,0.45);border-radius:14px;">';
    html += '<div style="font-size:12px;font-weight:800;color:#0E6B57;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">Continue exploring</div>';
    html += '<div style="font-size:11px;color:#64748B;line-height:1.55;margin-bottom:10px;">Links pass context when we know it - you can still change everything on the next page.</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:7px;align-items:stretch;">';
    quickLinks.forEach(function (q, idx) {
      var primaryPill = idx === 0;
      html += '<a style="display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:9px 13px;border-radius:10px;max-width:100%;white-space:normal;line-height:1.3;' +
        (primaryPill ? 'background:#085041;color:#EF9F27;border:1px solid #085041;' : 'background:#fff;color:#085041;border:1.5px solid #085041;') +
        'font-size:12px;font-weight:700;text-decoration:none;" href="' + esc(q.href) + '">' + esc(q.label) + ' -></a>';
    });
    html += '</div>';
    html += '</div>';
    html += '<div style="width:100%;box-sizing:border-box;margin-top:12px;padding:16px;background:#F8FAFC;border:1.5px solid #D8E2EE;border-radius:14px;">';
    html += '<div style="font-size:12px;font-weight:800;color:#0E6B57;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">' + esc(rec.title || "What to do next") + '</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:stretch;">';
    html += '<a style="display:inline-flex;align-items:center;justify-content:center;min-height:40px;max-width:100%;white-space:normal;line-height:1.3;padding:10px 14px;border-radius:10px;background:#085041;color:#EF9F27;font-size:12px;font-weight:700;text-decoration:none;" href="' + esc(rec.primary.href) + '">' + esc(rec.primary.label) + ' -></a>';
    if (sec) {
      html += '<a style="display:inline-flex;align-items:center;justify-content:center;min-height:40px;max-width:100%;white-space:normal;line-height:1.3;padding:9px 12px;border-radius:10px;background:#fff;color:#085041;font-size:12px;font-weight:700;text-decoration:none;border:1.5px solid #085041;" href="' + esc(sec.href) + '">' + esc(sec.label) + ' -></a>';
    }
    html += '</div>';
    html += '<div style="font-size:11px;color:#64748B;line-height:1.55;margin-bottom:8px;">' + esc(rec.primary.reason || "") + '</div>';
    if (sec) html += '<div style="font-size:11px;color:#64748B;line-height:1.55;">' + esc(sec.reason || "") + "</div>";
    html += '</div>';
    html += "</div>";
    return html;
  }

  function mountToolRecommendations(hostEl, rec, escFn) {
    if (!hostEl) return "";
    var html = buildRecommendationsHtml(rec, escFn);
    hostEl.innerHTML = html || "";
    var wrap = hostEl.closest(".tool-journey-slot-wrap");
    if (wrap) {
      wrap.hidden = !html;
    } else {
      hostEl.style.display = html ? "" : "none";
    }
    var bundle = hostEl.closest(".tool-results-bundle");
    if (bundle) {
      bundle.style.display = html ? "" : "none";
    }
    return html;
  }

  window.PehchaanToolRecommendations = {
    TOOL: TOOL,
    normalizeContext: normalizeContext,
    buildNextToolRecommendations: buildNextToolRecommendations,
    buildRecommendationsHtml: buildRecommendationsHtml,
    mountToolRecommendations: mountToolRecommendations
  };
})();
