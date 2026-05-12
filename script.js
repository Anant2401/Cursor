document.getElementById("footer-year").textContent = new Date().getFullYear();

const menuButton = document.getElementById("menu-btn");
const nav = document.getElementById("main-nav");
const navTools = document.getElementById("nav-tools");
const navToolsTrigger = document.getElementById("nav-tools-trigger");

if (menuButton && nav) {
  const closeMenu = () => {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    navTools?.classList.remove("open");
    navToolsTrigger?.setAttribute("aria-expanded", "false");
  };

  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    if (link.id === "nav-tools-trigger") return;
    link.addEventListener("click", closeMenu);
  });

  if (navTools && navToolsTrigger) {
    navToolsTrigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const isOpen = navTools.classList.toggle("open");
      navToolsTrigger.setAttribute("aria-expanded", String(isOpen));
    });
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    const isOutsideNav = !menuButton.contains(target) && !nav.contains(target);
    if (isOutsideNav) {
      closeMenu();
      return;
    }
    if (navTools?.classList.contains("open") && target instanceof Element) {
      const insideTools = navTools.contains(target);
      if (!insideTools) {
        navTools.classList.remove("open");
        navToolsTrigger?.setAttribute("aria-expanded", "false");
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

const reveals = document.querySelectorAll(".reveal");

/** Any overlap with the viewport (used so tall blocks like #tools still reveal on narrow screens). */
function revealOverlapsViewport(el) {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const vw = window.innerWidth || document.documentElement.clientWidth;
  return r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
}

function markRevealVisible(el) {
  el.classList.add("visible");
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        markRevealVisible(entry.target);
      }
    });
  },
  /* 0.15 required ~15% of very tall sections (e.g. Career Tools) to show — often never met on mobile. */
  { threshold: 0, rootMargin: "0px 0px 12% 0px" }
);

reveals.forEach((item) => {
  observer.observe(item);
  if (revealOverlapsViewport(item)) {
    markRevealVisible(item);
  }
});

requestAnimationFrame(() => {
  reveals.forEach((item) => {
    if (!item.classList.contains("visible") && revealOverlapsViewport(item)) {
      markRevealVisible(item);
    }
  });
});

function initCareerToolsSection() {
  const toolsSection = document.getElementById("tools");
  if (!toolsSection) return;

  const allPanel = toolsSection.querySelector("#tools-panel-all");
  const toolCards = toolsSection.querySelectorAll("#tools-grid .tool-card[data-tool]");
  const toolsWrap = toolsSection.querySelector(".tools-wrap");
  if (!allPanel || !toolCards.length) return;

  /** When set, grid shows only these `data-tool` cards. Cleared from Start here or "Show all tools". */
  let startHereToolKeys = null;

  const toolInsights = {
    assessment: {
      bestFor: "Students unsure about best-fit careers",
      time: "8-10 minutes",
      output: "Top-fit career directions + next actions",
      highlights: [
        "Maps strengths and interests to practical career options",
        "Helps you shortlist paths before spending on courses",
        "Gives action-first guidance you can apply immediately",
      ],
      pairsWith: [
        { label: "Salary Explorer", href: "Tools/pehchaan_salary_explorer.html" },
        { label: "Exam Roadmap Builder", href: "Tools/pehchaan_exam_roadmap.html" },
        { label: "Skill Gap Analyser", href: "Tools/pehchaan_skill_gap_analyser.html" },
      ],
    },
    stream: {
      bestFor: "Class 10 students choosing a stream",
      time: "6-8 minutes",
      output: "Stream recommendation with reasoning",
      highlights: [
        "Compares Science, Commerce, and Arts on your preferences",
        "Explains what each stream can lead to in real jobs",
        "Reduces confusion from social pressure and mixed advice",
      ],
      pairsWith: [
        { label: "Salary Explorer", href: "Tools/pehchaan_salary_explorer.html" },
        { label: "Exam Roadmap Builder", href: "Tools/pehchaan_exam_roadmap.html" },
        { label: "Career ROI & Reality Bridge", href: "Tools/pehchaan_career_roi_reality_bridge.html" },
      ],
    },
    salary: {
      bestFor: "Students evaluating long-term earning potential",
      time: "5-7 minutes",
      output: "Career salary journey snapshots",
      highlights: [
        "Shows entry-to-growth salary ranges across career tracks",
        "Lets you compare opportunities before you commit",
        "Supports realistic planning with role progression context",
      ],
      pairsWith: [
        { label: "Career ROI & Reality Bridge", href: "Tools/pehchaan_career_roi_reality_bridge.html" },
        { label: "Financing & EMI", href: "Tools/pehchaan_financing_reality.html" },
        { label: "Plan B Strategy Builder", href: "Tools/pehchaan_plan_b_strategy_builder.html" },
      ],
    },
    privatejourney: {
      bestFor: "Students who want one guided private-sector entry point instead of guessing tool order",
      time: "4-7 minutes",
      output: "Top private-role suggestions, metro-aware fit, and 30/60/90 next steps",
      highlights: [
        "Uses your stage, stream, metro choice, timeline, and role comfort area to suggest practical starting roles.",
        "Provides a compact action plan before sending you to deeper execution tools.",
        "Passes context directly into Salary, Skill Gap, Plan B, and Mentor tools for continuity.",
      ],
      pairsWith: [
        { label: "Salary Explorer", href: "Tools/pehchaan_salary_explorer.html" },
        { label: "Skill Gap Analyser", href: "Tools/pehchaan_skill_gap_analyser.html" },
        { label: "Mentor Connect", href: "Tools/pehchaan_mentor_connect.html" },
      ],
    },
    roadmap: {
      bestFor: "Students planning exam timelines and preparation",
      time: "7-10 minutes",
      output: "Personalised exam roadmap + action guidance",
      highlights: [
        "Maps your class, stream, and career interests to relevant exams",
        "Surfaces registration windows, exam dates, and preparation stages",
        "Gives structured next steps so you can start with clarity",
      ],
      pairsWith: [
        { label: "Plan B Strategy Builder", href: "Tools/pehchaan_plan_b_strategy_builder.html" },
        { label: "Career ROI & Reality Bridge", href: "Tools/pehchaan_career_roi_reality_bridge.html" },
        { label: "Salary Explorer", href: "Tools/pehchaan_salary_explorer.html" },
      ],
    },
    roi: {
      bestFor: "Families comparing career paths on total cost versus realistic earning power",
      time: "8-12 minutes",
      output: "Cost breakdown, payback framing, salary bands, and Chhattisgarh-specific context",
      highlights: [
        "Stacks tuition, coaching, hostel, living, prep years, and a configurable misc buffer in one view",
        "Shows a simple 5-year earnings vs investment lens so conversations at home stay grounded, not emotional",
        "Includes honest reality notes and a print / save-as-PDF option for sharing with parents or mentors",
      ],
      pairsWith: [
        { label: "Financing & EMI Reality", href: "Tools/pehchaan_financing_reality.html" },
        { label: "Plan B Strategy Builder", href: "Tools/pehchaan_plan_b_strategy_builder.html" },
        { label: "Salary Explorer", href: "Tools/pehchaan_salary_explorer.html" },
      ],
    },
    financing: {
      bestFor: "Families discussing education loans, EMI stress, and scholarships",
      time: "5-8 minutes",
      output: "EMI ballpark vs starting salary you enter + pointers for bank and scholarship conversations",
      highlights: [
        "Adjust principal, rate, and tenure to match what the bank actually quoted",
        "See EMI as a share of a simple monthly-income assumption — a conversation starter, not tax advice",
        "Links straight into ROI and Salary Explorer so numbers stay tied to a real career lane",
      ],
      pairsWith: [
        { label: "Career ROI & Reality Bridge", href: "Tools/pehchaan_career_roi_reality_bridge.html" },
        { label: "Salary Explorer", href: "Tools/pehchaan_salary_explorer.html" },
        { label: "Parent FAQ", href: "Tools/parents-guide/index.html" },
      ],
    },
    planb: {
      bestFor:
        "Students preparing competitive exams who also want paid parallel work; anyone mapping national vs state college backups; and families comparing alternative degree routes to the same career direction",
      time: "8-15 minutes",
      output:
        "Actionable backup plans across jobs, colleges, and courses with verification reminders",
      highlights: [
        "Jobs lens: connect your exam prep to transferable skills, parallel roles, and first-step checklists.",
        "College lens: compare national ladder options and state-comfort backups without dead ends.",
        "Course lens: review alternative degree routes that can still reach similar job families.",
      ],
      pairsWith: [
        { label: "Exam Roadmap Builder", href: "Tools/pehchaan_exam_roadmap.html" },
        { label: "Career ROI & Reality Bridge", href: "Tools/pehchaan_career_roi_reality_bridge.html" },
        { label: "Salary Explorer", href: "Tools/pehchaan_salary_explorer.html" },
      ],
    },
    skillgap: {
      bestFor: "Students targeting a software, data, or office role who learn better with a checklist than generic advice",
      time: "8-12 minutes",
      output: "Gap heatmap, prioritised learning resources, self-test platforms, and a phased weeks-to-months timeline",
      highlights: [
        "Tick skills you already have — with select-all / clear — so the gap list matches your real baseline",
        "Each missing skill links to free or low-cost courses and a self-test idea so you can prove skill before interviews",
        "Pulls in practice venues (coding judges, LinkedIn skill assessments) similar to what hiring teams actually check",
      ],
      pairsWith: [
        { label: "Salary Explorer", href: "Tools/pehchaan_salary_explorer.html" },
        { label: "Mentor Connect", href: "Tools/pehchaan_mentor_connect.html" },
        { label: "Career ROI & Reality Bridge", href: "Tools/pehchaan_career_roi_reality_bridge.html" },
      ],
    },
    collegefinder: {
      bestFor: "Students and families finalising college options for a chosen stream and course",
      time: "5-9 minutes",
      output: "Shortlist with exact-state matches first, then neighbour-state and national fallback options",
      highlights: [
        "Lets you filter by geography lens, state, stream, and exact course before comparing colleges",
        "Avoids dead ends by suggesting neighbour-state and national options when in-state results are limited",
        "Keeps planning practical with official-link context and verification reminders",
      ],
      pairsWith: [
        { label: "Plan B Strategy Builder", href: "Tools/pehchaan_plan_b_strategy_builder.html" },
        { label: "Exam Roadmap Builder", href: "Tools/pehchaan_exam_roadmap.html" },
        { label: "Career ROI & Reality Bridge", href: "Tools/pehchaan_career_roi_reality_bridge.html" },
      ],
    },
    mentor: {
      bestFor:
        "Students who want proof, not hype, that someone from their place reached the goal they are chasing",
      time: "5-8 minutes",
      output: "Mentor leads, editable outreach drafts, and LinkedIn search paths",
      highlights: [
        "Find relevant professionals by hometown, role target, and company context.",
        "Use ready message drafts, then personalize before sending.",
        "Validate profiles via direct links and guided LinkedIn searches.",
      ],
      pairsWith: [
        { label: "Salary Explorer", href: "Tools/pehchaan_salary_explorer.html" },
        { label: "Skill Gap Analyser", href: "Tools/pehchaan_skill_gap_analyser.html" },
        { label: "Plan B Strategy Builder", href: "Tools/pehchaan_plan_b_strategy_builder.html" },
      ],
    },
    parentguide: {
      bestFor: "Parents in Tier 2/3 cities anxious about marks, sarkari vs private, arts, safety, and new careers",
      time: "2-5 minutes",
      output:
        "170 searchable Q&As in English or Hinglish across marks, money, and career worries",
      highlights: [
        "Fuzzy search handles typos and Hinglish-style phrasing.",
        "Category filters help parents jump to the exact worry quickly.",
        "English and Hinglish modes are switchable anytime.",
      ],
      pairsWith: [
        { label: "Financing & EMI Reality", href: "Tools/pehchaan_financing_reality.html" },
        { label: "Career ROI & Reality Bridge", href: "Tools/pehchaan_career_roi_reality_bridge.html" },
        { label: "Stream Advisor", href: "Tools/pehchaan_stream_advisor.html" },
      ],
    },
  };

  const setCardExpanded = (card, expanded) => {
    const details = card.querySelector(".tool-card-details");
    const toggle = card.querySelector(".tool-card-expand-btn");
    if (!details || !toggle) return;

    card.classList.toggle("is-expanded", expanded);
    details.hidden = !expanded;
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.textContent = expanded ? "Hide details" : "View details";
  };

  const refreshPanelExpansionState = (panel) => {
    if (!panel) return;
    const hasExpanded = !!panel.querySelector(".tool-card.is-expanded");
    panel.classList.toggle("has-expanded", hasExpanded);
  };

  const enrichToolCards = () => {
    const cards = toolsSection.querySelectorAll(".tool-card[data-tool]");
    cards.forEach((card) => {
      if (card.querySelector(".tool-card-details")) return;

      const detailsConfig = toolInsights[card.dataset.tool];
      const launchButton = card.querySelector(".btn-assessment-primary");
      if (!detailsConfig || !launchButton) return;

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "tool-card-expand-btn";
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "View details";

      const details = document.createElement("div");
      details.className = "tool-card-details";
      details.hidden = true;
      const pairsHtml =
        detailsConfig.pairsWith && detailsConfig.pairsWith.length
          ? `<div class="tool-pairs-line"><strong>Pairs well with:</strong> ${detailsConfig.pairsWith
              .map(
                (p) =>
                  `<a href="${p.href}">${p.label}</a>`
              )
              .join(" · ")}</div>`
          : "";
      details.innerHTML = `
        <div class="tool-details-meta">
          <span><strong>Best for:</strong> ${detailsConfig.bestFor}</span>
          <span><strong>Time:</strong> ${detailsConfig.time}</span>
          <span><strong>You get:</strong> ${detailsConfig.output}</span>
        </div>
        <ul class="tool-details-list">
          ${detailsConfig.highlights.map((item) => `<li>${item}</li>`).join("")}
        </ul>
        ${pairsHtml}
      `;

      toggle.addEventListener("click", () => {
        const isExpanded = card.classList.contains("is-expanded");
        const panel = card.closest(".tools-panel");
        const panelCards = panel?.querySelectorAll(".tool-card[data-tool]") || [];

        panelCards.forEach((panelCard) => {
          if (panelCard !== card) setCardExpanded(panelCard, false);
        });

        const shouldExpand = !isExpanded;
        setCardExpanded(card, shouldExpand);
        refreshPanelExpansionState(panel);

        if (shouldExpand) {
          requestAnimationFrame(() => {
            card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
          });
        }
      });

      card.insertBefore(toggle, launchButton);
      card.insertBefore(details, launchButton);
    });
  };

  const resetStartHereUiOnly = () => {
    startHereToolKeys = null;
    toolsWrap?.classList.remove("tools-wrap--start-picked");
    toolCards.forEach((c) => c.classList.remove("tool-card--start-pick"));
    const clearBtn = document.getElementById("start-here-clear");
    if (clearBtn) clearBtn.hidden = true;
    const pills = document.getElementById("start-here-pills");
    const sub = document.getElementById("start-here-sub");
    if (pills) pills.innerHTML = "";
    if (sub) sub.textContent = "";
  };

  const refreshToolsGrid = () => {
    let visibleCount = 0;
    toolCards.forEach((card) => {
      const key = card.dataset.tool;
      const show = !startHereToolKeys?.length || startHereToolKeys.includes(key);
      card.hidden = !show;
      card.classList.toggle("tool-card--start-pick", !!(startHereToolKeys?.length && show));
      if (!show) setCardExpanded(card, false);
      if (show) visibleCount += 1;
    });

    toolCards.forEach((card) => setCardExpanded(card, false));
    if (visibleCount === 1 && startHereToolKeys?.length) {
      const visibleCard = Array.from(toolCards).find((card) => !card.hidden);
      if (visibleCard) setCardExpanded(visibleCard, true);
    }

    allPanel.classList.add("is-active");
    allPanel.hidden = false;
    allPanel.classList.toggle("single-tool-view", visibleCount === 1);
    refreshPanelExpansionState(allPanel);
  };

  /** @param {boolean} [resetBothDropdowns=true] If true, resets stage & worry selects and hides the Start here result block (used for "Show all tools" and empty stage). */
  const clearStartHereGridFilter = (resetBothDropdowns = true) => {
    resetStartHereUiOnly();
    const outEl = document.getElementById("start-here-out");
    if (resetBothDropdowns) {
      const q1 = document.getElementById("path-q1");
      const q2 = document.getElementById("path-q2");
      const q3 = document.getElementById("path-q3");
      const q4 = document.getElementById("path-q4");
      if (q1) q1.value = "";
      if (q2) q2.value = "";
      if (q3) q3.value = "";
      if (q4) q4.value = "";
    }
    if (outEl) outEl.hidden = true;
    refreshToolsGrid();
  };

  const startHereClearBtn = document.getElementById("start-here-clear");
  if (startHereClearBtn) {
    startHereClearBtn.addEventListener("click", () => clearStartHereGridFilter(true));
  }

  enrichToolCards();
  refreshToolsGrid();

  window.__pehchaanApplyStartHereTools = (keys) => {
    if (!Array.isArray(keys) || !keys.length) return;
    startHereToolKeys = keys;
    toolsWrap?.classList.add("tools-wrap--start-picked");
    refreshToolsGrid();
    const clearBtn = document.getElementById("start-here-clear");
    if (clearBtn) clearBtn.hidden = false;
    requestAnimationFrame(() => {
      toolsSection.querySelector("#tools-grid")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  window.__pehchaanClearStartHereGridFilter = clearStartHereGridFilter;
  window.__pehchaanRefreshToolsGrid = refreshToolsGrid;
}

initCareerToolsSection();

function initStartHere() {
  const q1 = document.getElementById("path-q1");
  const q2 = document.getElementById("path-q2");
  const progressFill = document.getElementById("pathfinder-progress-fill");
  const resultTitle = document.getElementById("pathfinder-result-title");
  const resultText = document.getElementById("pathfinder-result-text");
  const resultLink = document.getElementById("pathfinder-result-link");
  const restartBtn = document.getElementById("start-here-clear");
  const pills = document.getElementById("start-here-pills");
  const sub = document.getElementById("start-here-sub");
  if (!q1 || !q2 || !progressFill || !resultTitle || !resultText || !resultLink || !restartBtn || !pills || !sub) return;

  let persona = "";

  const LABEL = {
    assessment: "Career Assessment",
    stream: "Stream Advisor",
    salary: "Salary Explorer",
    privatejourney: "Private Sector Journey",
    roi: "ROI & Reality Bridge",
    financing: "Financing & EMI",
    roadmap: "Exam Roadmap",
    planb: "Plan B",
    skillgap: "Skill Gap",
    collegefinder: "College Finder",
    mentor: "Mentor Connect",
    parentguide: "Parent's Guide",
  };

  const PATHFINDER_RESULT = {
    stream: {
      title: "Stream Advisor (10th Class)",
      text: "Your first priority is picking the right subjects. Start with stream clarity, then move to deeper career planning.",
      href: "Tools/pehchaan_stream_advisor.html",
      summary: "Result A: Start with Stream Advisor.",
      tools: ["stream", "assessment", "salary"],
    },
    parentguide: {
      title: "Parent's Guide (FAQ)",
      text: "We have a dedicated hub for parent concerns on marks, costs, choices, and practical next steps.",
      href: "Tools/parents-guide/index.html",
      summary: "Result E: Parent's Guide is your best starting point.",
      tools: ["parentguide", "financing", "roi"],
    },
    collegefinder: {
      title: "College Finder",
      text: "Find colleges by rank and budget filters, then compare practical options before finalizing your preference list.",
      href: "Tools/pehchaan_college_finder.html",
      summary: "Best next step: College Finder.",
      tools: ["collegefinder", "planb", "roi"],
    },
    roadmap: {
      title: "Exam Roadmap Builder",
      text: "Build a step-by-step exam plan with timelines, milestones, and action checkpoints for this preparation cycle.",
      href: "Tools/pehchaan_exam_roadmap.html",
      summary: "Best next step: Exam Roadmap Builder.",
      tools: ["roadmap", "planb", "collegefinder"],
    },
    assessment: {
      title: "Career Assessment",
      text: "Use this to confirm fit before locking decisions on exams, colleges, and long-term course investments.",
      href: "Tools/pehchaan_career_assessment.html",
      summary: "Best next step: Career Assessment.",
      tools: ["assessment", "salary", "collegefinder"],
    },
    financing: {
      title: "Financing & EMI Reality",
      text: "Stress-test funding choices using practical EMI and affordability context before committing to major education costs.",
      href: "Tools/pehchaan_financing_reality.html",
      summary: "Best next step: Financing & EMI Reality.",
      tools: ["financing", "roi", "salary"],
    },
    privatejourney: {
      title: "Private Sector Journey",
      text: "Get a practical step-by-step path for corporate hiring, with focused actions that reduce guesswork.",
      href: "Tools/pehchaan_private_sector_journey.html",
      summary: "Best next step: Private Sector Journey.",
      tools: ["privatejourney", "skillgap", "mentor"],
    },
    skillgap: {
      title: "Skill Gap Analyser",
      text: "Check whether your current skills align with target roles and get an action plan to close gaps quickly.",
      href: "Tools/pehchaan_skill_gap_analyser.html",
      summary: "Best next step: Skill Gap Analyser.",
      tools: ["skillgap", "privatejourney", "mentor"],
    },
    roi: {
      title: "Career ROI & Reality Bridge",
      text: "Compare degree costs with realistic outcomes so you can evaluate whether a Master's investment makes sense.",
      href: "Tools/pehchaan_career_roi_reality_bridge.html",
      summary: "Best next step: Career ROI & Reality Bridge.",
      tools: ["roi", "salary", "financing"],
    },
    salary: {
      title: "Salary Explorer",
      text: "Benchmark career compensation bands to check whether your current pay and growth track are competitive.",
      href: "Tools/pehchaan_salary_explorer.html",
      summary: "Best next step: Salary Explorer.",
      tools: ["salary", "skillgap", "planb"],
    },
    planb: {
      title: "Plan B Strategy Builder",
      text: "Create backup pathways for role, course, and market uncertainty so career progress never stalls.",
      href: "Tools/pehchaan_plan_b_strategy_builder.html",
      summary: "Best next step: Plan B Strategy Builder.",
      tools: ["planb", "roadmap", "collegefinder"],
    },
    mentor: {
      title: "Mentor Connect",
      text: "Connect with experienced professionals to get practical advice from people who have already done it.",
      href: "Tools/pehchaan_mentor_connect.html",
      summary: "Best next step: Mentor Connect.",
      tools: ["mentor", "salary", "planb"],
    },
  };

  const slideIds = ["path-slide-q1", "path-slide-q2", "path-slide-result"];
  const stepPercent = { "path-slide-q1": 25, "path-slide-q2": 75, "path-slide-result": 100 };

  const setActiveSlide = (slideId) => {
    const current = document.querySelector(".pathfinder-slide.is-active");
    if (current && current.id !== slideId) {
      current.classList.remove("is-active");
      current.classList.add("is-leaving");
      window.setTimeout(() => current.classList.remove("is-leaving"), 320);
    }
    slideIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (id !== slideId) return;
      el.classList.remove("is-leaving");
      el.classList.add("is-active");
    });
    progressFill.style.width = `${stepPercent[slideId] || 25}%`;
  };

  const renderResult = (toolKey, toolOverride) => {
    const result = PATHFINDER_RESULT[toolKey];
    if (!result) return;
    resultTitle.textContent = result.title;
    resultText.textContent = result.text;
    resultLink.href = result.href;
    sub.textContent = result.summary;
    const sourceTools = Array.isArray(toolOverride) && toolOverride.length
      ? toolOverride
      : (Array.isArray(result.tools) && result.tools.length ? result.tools : [toolKey]);
    const toolKeys = sourceTools.slice(0, 4);
    pills.innerHTML = pillHtml(toolKeys);
    setActiveSlide("path-slide-result");
    window.__pehchaanApplyStartHereTools?.(toolKeys);
  };

  const restart = () => {
    q1.value = "";
    q2.value = "";
    persona = "";
    resultTitle.textContent = "";
    resultText.textContent = "";
    resultLink.href = "#";
    sub.textContent = "";
    pills.innerHTML = "";
    setActiveSlide("path-slide-q1");
    window.__pehchaanClearStartHereGridFilter?.(true);
  };

  const pillHtml = (keys) =>
    keys
      .map(
        (key, i) =>
          `<span class="start-here-pill"><span class="start-here-pill-num" aria-hidden="true">${i + 1}</span>${LABEL[key] || key}</span>`
      )
      .join("");

  q1.addEventListener("change", () => {
    const v = q1.value;
    if (!v) {
      restart();
      return;
    }
    persona = v;
    if (v === "parent") {
      renderResult("parentguide");
      return;
    }
    setActiveSlide("path-slide-q2");
  });

  q2.addEventListener("change", () => {
    const choice = q2.value;
    if (!choice) return;

    // 9th–10th: broad exploration, but prioritised
    if (persona === "school_9_10") {
      if (choice === "clarity_career") return renderResult("assessment", ["assessment", "salary", "collegefinder"]);
      if (choice === "clarity_path") return renderResult("stream", ["stream", "assessment", "salary", "roadmap"]);
      if (choice === "clarity_money") return renderResult("salary", ["salary", "roi", "financing"]);
      if (choice === "clarity_execution") return renderResult("roadmap", ["roadmap", "planb", "collegefinder"]);
    }

    // 11th–12th: exams, colleges, remaining doubt, or money
    if (persona === "school_11_12") {
      if (choice === "clarity_career") return renderResult("assessment", ["assessment", "salary", "collegefinder"]);
      if (choice === "clarity_path") return renderResult("collegefinder", ["roadmap", "collegefinder", "planb", "roi"]);
      if (choice === "clarity_money") return renderResult("financing", ["financing", "roi", "salary"]);
      if (choice === "clarity_execution") return renderResult("roadmap", ["roadmap", "planb", "collegefinder"]);
    }

    // College / recent grads: job entry, skills, or ROI of Masters
    if (persona === "college_grad") {
      if (choice === "clarity_career") return renderResult("privatejourney", ["assessment", "privatejourney", "skillgap", "mentor"]);
      if (choice === "clarity_path") return renderResult("skillgap", ["skillgap", "privatejourney", "mentor"]);
      if (choice === "clarity_money") return renderResult("roi", ["roi", "salary", "financing", "mentor"]);
      if (choice === "clarity_execution") return renderResult("salary", ["salary", "skillgap", "planb", "privatejourney"]);
    }

    // Working professionals: salary check, Plan B, or mentor
    if (persona === "working_pro") {
      if (choice === "clarity_career") return renderResult("salary", ["salary", "skillgap", "planb"]);
      if (choice === "clarity_path") return renderResult("planb", ["planb", "roadmap", "collegefinder"]);
      if (choice === "clarity_money") return renderResult("roi", ["roi", "salary", "financing"]);
      if (choice === "clarity_execution") return renderResult("mentor", ["mentor", "salary", "planb", "privatejourney"]);
    }
  });

  restartBtn.addEventListener("click", restart);
  restart();
}

initStartHere();

const LOCAL_API_BASE = "http://localhost:8787/api";
const PRODUCTION_API_BASE = "https://pehchaan-api.onrender.com/api";

function resolveApiBase() {
  const host = window.location.hostname;
  const isLocalHost = host === "localhost" || host === "127.0.0.1";
  return isLocalHost ? LOCAL_API_BASE : PRODUCTION_API_BASE;
}

const API_BASE = resolveApiBase();

function readableError(error, fallback) {
  if (error && error.name === "TypeError") {
    if (API_BASE === LOCAL_API_BASE) {
      return "Cannot connect to backend. Start backend server on http://localhost:8787 and try again.";
    }
    return "Cannot connect to backend service right now. Please try again in a moment.";
  }
  return error?.message || fallback;
}

async function apiPost(path, payload, fallbackMessage) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || fallbackMessage);
    return data;
  } catch (error) {
    throw new Error(readableError(error, fallbackMessage));
  }
}

function initStudentVoicesCarousel() {
  const track = document.getElementById("voices-track");
  const prev = document.getElementById("voices-prev");
  const next = document.getElementById("voices-next");
  const dotsContainer = document.getElementById("voices-dots");
  const status = document.getElementById("voices-status");
  const viewport = document.getElementById("voices-viewport");
  if (!track || !prev || !next || !dotsContainer) return;

  const slides = track.querySelectorAll(".voices-slide");
  const total = slides.length;
  if (total === 0) return;

  let index = 0;

  function renderDots() {
    dotsContainer.innerHTML = "";
    for (let i = 0; i < total; i += 1) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "voices-dot";
      btn.setAttribute("aria-label", `Show testimonial ${i + 1} of ${total}`);
      btn.setAttribute("aria-current", i === index ? "true" : "false");
      btn.addEventListener("click", () => {
        index = i;
        update();
      });
      dotsContainer.appendChild(btn);
    }
  }

  function update() {
    track.style.transform = `translateX(-${index * 100}%)`;
    const dotBtns = dotsContainer.querySelectorAll("button");
    dotBtns.forEach((btn, i) => {
      const on = i === index;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-current", on ? "true" : "false");
    });
    if (status) status.textContent = `Testimonial ${index + 1} of ${total}`;
  }

  function go(delta) {
    index = (index + delta + total) % total;
    update();
  }

  prev.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));

  if (viewport) {
    viewport.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    });
  }

  renderDots();
  update();
}

function initNavScrollSpy() {
  const nav = document.getElementById("main-nav");
  if (!nav) return;
  const links = [...nav.querySelectorAll('a.nav-link[href^="#"]')];
  if (links.length === 0) return;

  const sections = links
    .map((a) => {
      const id = a.getAttribute("href")?.slice(1);
      return id ? document.getElementById(id) : null;
    })
    .filter(Boolean);

  if (sections.length === 0) return;

  function sectionTop(el) {
    return el.getBoundingClientRect().top + window.scrollY;
  }

  function computeActive() {
    const header = document.querySelector(".site-header");
    const strip = document.querySelector(".translate-strip");
    const offset = (header?.offsetHeight ?? 72) + (strip?.offsetHeight ?? 0) + 32;
    const y = window.scrollY + offset;
    const sorted = sections.slice().sort((a, b) => sectionTop(a) - sectionTop(b));
    let currentId = sorted[0]?.id ?? "home";
    for (const sec of sorted) {
      if (sectionTop(sec) <= y) currentId = sec.id;
    }
    links.forEach((a) => {
      const href = a.getAttribute("href")?.slice(1);
      a.classList.toggle("nav-active", href === currentId);
    });
  }

  window.addEventListener("scroll", () => window.requestAnimationFrame(computeActive), { passive: true });
  window.addEventListener("resize", computeActive);
  computeActive();
}

initStudentVoicesCarousel();
initNavScrollSpy();

const contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(contactForm);
    const payload = Object.fromEntries(formData.entries());
    const saveNote = document.getElementById("contact-save-note");
    try {
      const data = await apiPost("/contact/submit", payload, "Could not submit contact form.");
      if (saveNote) {
        saveNote.textContent = data.message || "Message submitted successfully.";
        saveNote.className = "otp-note ok";
      }
      contactForm.reset();
    } catch (error) {
      if (saveNote) {
        saveNote.textContent = error.message;
        saveNote.className = "otp-note err";
      }
    }
  });
}
