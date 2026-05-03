document.getElementById("footer-year").textContent = new Date().getFullYear();

const menuButton = document.getElementById("menu-btn");
const nav = document.getElementById("main-nav");

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
}

const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.15 }
);

reveals.forEach((item) => observer.observe(item));

function initToolsTabs() {
  const toolsSection = document.getElementById("tools");
  if (!toolsSection) return;

  const toolTabs = toolsSection.querySelectorAll(".tools-tab");
  const allPanel = toolsSection.querySelector("#tools-panel-all");
  const toolCards = toolsSection.querySelectorAll("#tools-grid .tool-card[data-tool]");
  if (!toolTabs.length || !allPanel || !toolCards.length) return;

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
    },
    planb: {
      bestFor: "Exam aspirants who want parallel income and identity while they prepare",
      time: "6-9 minutes",
      output: "Hidden transferable skills from your syllabus plus concrete Plan B roles and first steps",
      highlights: [
        "Turns subjects you already study into language employers understand — research, writing, analysis, discipline",
        "Surfaces remote-friendly options and typical fresher pay bands so Plan B feels dignified, not like a backup",
        "One-tap copy of your first-step checklist so you can paste it into Notes or a LinkedIn draft and start today",
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
    },
    mentor: {
      bestFor:
        "Students who want proof, not hype, that someone from their place reached the goal they are chasing",
      time: "About 5–8 minutes",
      output: "People to learn from, draft messages in your name, and LinkedIn paths to explore",
      highlights: [
        "Turn the silent question in your head into proof: real people, real journeys, and a first message you can send with dignity",
        "Search from your hometown toward your dream company or role, so every result feels relevant, not random",
        "Three layers: mentors who chose to help students, public profiles to verify, and one-tap LinkedIn searches with filters ready",
        "Draft outreach uses your first name so your hello sounds human; you edit the rest before you send",
      ],
    },
    parentguide: {
      bestFor: "Parents in Tier 2/3 cities anxious about marks, sarkari vs private, arts, safety, and new careers",
      time: "2–5 minutes to browse; search is instant",
      output:
        "170+ Q&As in English or Hinglish, many topics (CG jobs, money, health, low marks) — contact if you need more",
      highlights: [
        "Fuzzy search (Fuse.js) handles typos and Hinglish — e.g. “Sarkari” still finds government-job topics",
        "Tags are weighted in search so parent-style words match the right worry, not random keywords",
        "Browse all answers or filter by category — from Marks & Streams to new batches like low marks and local industries",
        "Switch English ↔ Hinglish anytime; expand one answer at a time without clutter",
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
      details.innerHTML = `
        <div class="tool-details-meta">
          <span><strong>Best for:</strong> ${detailsConfig.bestFor}</span>
          <span><strong>Time:</strong> ${detailsConfig.time}</span>
          <span><strong>You get:</strong> ${detailsConfig.output}</span>
        </div>
        <ul class="tool-details-list">
          ${detailsConfig.highlights.map((item) => `<li>${item}</li>`).join("")}
        </ul>
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

  const applyActiveTab = (activeTab) => {
    const selectedTool = activeTab.dataset.toolTab || "all";

    toolTabs.forEach((tab) => {
      const isActive = tab === activeTab;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    let visibleCount = 0;
    toolCards.forEach((card) => {
      const show = selectedTool === "all" || card.dataset.tool === selectedTool;
      card.hidden = !show;
      if (!show) setCardExpanded(card, false);
      if (show) visibleCount += 1;
    });

    if (selectedTool === "all") {
      toolCards.forEach((card) => setCardExpanded(card, false));
    }

    allPanel.classList.add("is-active");
    allPanel.hidden = false;
    allPanel.classList.toggle("single-tool-view", visibleCount === 1);

    if (selectedTool !== "all" && visibleCount === 1) {
      const visibleCard = Array.from(toolCards).find((card) => !card.hidden);
      if (visibleCard) setCardExpanded(visibleCard, true);
    }

    refreshPanelExpansionState(allPanel);
  };

  toolTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => applyActiveTab(tab));
    tab.addEventListener("keydown", (event) => {
      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % toolTabs.length;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + toolTabs.length) % toolTabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = toolTabs.length - 1;

      if (nextIndex !== index) {
        event.preventDefault();
        const nextTab = toolTabs[nextIndex];
        applyActiveTab(nextTab);
        nextTab.focus();
      }
    });
  });

  const defaultTab = toolsSection.querySelector('.tools-tab[aria-selected="true"]') || toolTabs[0];
  enrichToolCards();
  applyActiveTab(defaultTab);
}

initToolsTabs();

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
