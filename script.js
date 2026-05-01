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
