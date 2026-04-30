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

const state = {
  phoneVerified: false,
  emailVerified: false,
  detailsSaved: false,
};

const LOCAL_API_BASE = "http://localhost:8787/api";
const PRODUCTION_API_BASE = "/api";

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

function setNote(id, text, kind = "") {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.classList.remove("ok", "err");
  if (kind) el.classList.add(kind);
}

function updateAssessmentAccess() {
  const startBtn = document.getElementById("start-assessment-btn");
  if (!startBtn) return;
  const unlocked = state.phoneVerified && state.emailVerified && state.detailsSaved;
  startBtn.classList.toggle("disabled-link", !unlocked);
}

const sendPhoneOtpBtn = document.getElementById("send-phone-otp");
const verifyPhoneOtpBtn = document.getElementById("verify-phone-otp");
const sendEmailOtpBtn = document.getElementById("send-email-otp");
const verifyEmailOtpBtn = document.getElementById("verify-email-otp");
const assessmentForm = document.getElementById("assessment-form");

if (sendPhoneOtpBtn) {
  sendPhoneOtpBtn.addEventListener("click", async () => {
    const phone = document.getElementById("a-phone");
    if (!phone || !/^\d{10}$/.test(phone.value.trim())) {
      setNote("phone-otp-note", "Enter a valid 10-digit mobile number first.", "err");
      return;
    }
    try {
      const data = await apiPost(
        "/otp/send-phone",
        { phone: phone.value.trim() },
        "Could not send mobile OTP."
      );
      state.phoneVerified = false;
      setNote("phone-otp-note", data.message || "Mobile OTP sent.", "ok");
    } catch (error) {
      setNote("phone-otp-note", error.message, "err");
    }
    updateAssessmentAccess();
  });
}

if (verifyPhoneOtpBtn) {
  verifyPhoneOtpBtn.addEventListener("click", async () => {
    const phone = document.getElementById("a-phone");
    const phoneOtp = document.getElementById("phone-otp");
    if (!phoneOtp || !phone) return;
    try {
      const data = await apiPost(
        "/otp/verify-phone",
        {
          phone: phone.value.trim(),
          otp: phoneOtp.value.trim(),
        },
        "Mobile OTP verification failed."
      );
      state.phoneVerified = true;
      setNote("phone-otp-note", data.message || "Mobile number verified successfully.", "ok");
    } catch (error) {
      state.phoneVerified = false;
      setNote("phone-otp-note", error.message, "err");
    }
    updateAssessmentAccess();
  });
}

if (sendEmailOtpBtn) {
  sendEmailOtpBtn.addEventListener("click", async () => {
    const email = document.getElementById("a-email");
    if (!email || !email.value.includes("@")) {
      setNote("email-otp-note", "Enter a valid email first.", "err");
      return;
    }
    try {
      const data = await apiPost(
        "/otp/send-email",
        { email: email.value.trim() },
        "Could not send email OTP."
      );
      state.emailVerified = false;
      const baseMsg = data.message || "Email OTP sent.";
      setNote("email-otp-note", `${baseMsg} If not found, please check your Spam/Junk folder.`, "ok");
    } catch (error) {
      setNote("email-otp-note", error.message, "err");
    }
    updateAssessmentAccess();
  });
}

if (verifyEmailOtpBtn) {
  verifyEmailOtpBtn.addEventListener("click", async () => {
    const email = document.getElementById("a-email");
    const emailOtp = document.getElementById("email-otp");
    if (!emailOtp || !email) return;
    try {
      const data = await apiPost(
        "/otp/verify-email",
        {
          email: email.value.trim(),
          otp: emailOtp.value.trim(),
        },
        "Email OTP verification failed."
      );
      state.emailVerified = true;
      setNote("email-otp-note", data.message || "Email verified successfully.", "ok");
    } catch (error) {
      state.emailVerified = false;
      setNote("email-otp-note", error.message, "err");
    }
    updateAssessmentAccess();
  });
}

if (assessmentForm) {
  assessmentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(assessmentForm);
    const payload = Object.fromEntries(formData.entries());
    const saveNote = document.getElementById("assessment-save-note");
    const requiredFields = ["full_name", "city", "state", "phone", "email", "qualification"];
    const hasAllFields = requiredFields.every((f) => String(payload[f] || "").trim().length > 0);
    if (!hasAllFields) {
      if (saveNote) {
        saveNote.textContent = "Please fill all required fields before saving details.";
        saveNote.className = "otp-note err";
      }
      return;
    }
    try {
      await apiPost("/assessment/submit", payload, "Could not save details.");
      state.detailsSaved = true;
      updateAssessmentAccess();
      if (saveNote) {
        saveNote.textContent = "Details saved successfully.";
        saveNote.className = "otp-note ok";
      }
    } catch (error) {
      state.detailsSaved = false;
      updateAssessmentAccess();
      if (saveNote) {
        saveNote.textContent = error.message;
        saveNote.className = "otp-note err";
      }
    }
  });
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

updateAssessmentAccess();
