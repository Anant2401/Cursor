import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sqlite3 from "sqlite3";
import nodemailer from "nodemailer";
import twilio from "twilio";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "*" }));

const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const dbPath = path.join(dbDir, "pehchaan.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS otp_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel TEXT NOT NULL,
      target TEXT NOT NULL,
      otp TEXT NOT NULL,
      verified INTEGER DEFAULT 0,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS assessment_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      qualification TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      current_qualification TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);
});

const twilioReady =
  !!process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_ACCOUNT_SID.startsWith("AC") &&
  !!process.env.TWILIO_AUTH_TOKEN &&
  !process.env.TWILIO_AUTH_TOKEN.startsWith("REPLACE_WITH_") &&
  !!process.env.TWILIO_FROM_PHONE &&
  process.env.TWILIO_FROM_PHONE.startsWith("+");
const twilioClient = twilioReady
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const smtpReady =
  !!process.env.SMTP_HOST &&
  !!process.env.SMTP_PORT &&
  !!process.env.SMTP_USER &&
  !!process.env.SMTP_PASS;
const smtpPassword = String(process.env.SMTP_PASS || "").replace(/\s+/g, "");
const transporter = smtpReady
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: smtpPassword,
      },
    })
  : null;

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length !== 10) return null;
  return `+91${digits}`;
}

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

app.get("/api/health", (_, res) => {
  res.json({ ok: true });
});

app.post("/api/otp/send-phone", async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    if (!phone) return res.status(400).json({ message: "Enter a valid 10-digit mobile number." });

    const otp = generateOtp();
    const now = Date.now();
    const expiresAt = now + 5 * 60 * 1000;

    if (twilioClient) {
      await twilioClient.messages.create({
        body: `Your Pehchaan Careers OTP is ${otp}. It expires in 5 minutes.`,
        from: process.env.TWILIO_FROM_PHONE,
        to: phone,
      });
    }

    await runQuery(
      `INSERT INTO otp_codes (channel, target, otp, expires_at, created_at) VALUES (?, ?, ?, ?, ?)`,
      ["phone", phone, otp, expiresAt, now]
    );
    if (!twilioClient) {
      return res.json({
        message: `Mobile OTP generated in demo mode (Twilio not configured). OTP: ${otp}`,
      });
    }
    res.json({ message: "Mobile OTP sent successfully." });
  } catch (error) {
    res.status(500).json({ message: `Could not send mobile OTP. ${String(error.message || "")}` });
  }
});

app.post("/api/otp/verify-phone", async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const otp = String(req.body.otp || "").trim();
    if (!phone || !otp) return res.status(400).json({ message: "Phone and OTP are required." });

    const row = await getQuery(
      `SELECT * FROM otp_codes WHERE channel = ? AND target = ? AND otp = ? ORDER BY id DESC LIMIT 1`,
      ["phone", phone, otp]
    );
    if (!row) return res.status(400).json({ message: "Invalid OTP." });
    if (Date.now() > row.expires_at) return res.status(400).json({ message: "OTP has expired." });

    await runQuery(`UPDATE otp_codes SET verified = 1 WHERE id = ?`, [row.id]);
    res.json({ message: "Mobile OTP verified." });
  } catch (error) {
    res.status(500).json({ message: "Could not verify mobile OTP." });
  }
});

app.post("/api/otp/send-email", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!email.includes("@")) return res.status(400).json({ message: "Enter a valid email address." });
    if (!transporter) {
      return res.status(500).json({
        message: "Email OTP is not configured yet. Add SMTP credentials in backend .env.",
      });
    }
    const otp = generateOtp();
    const now = Date.now();
    const expiresAt = now + 5 * 60 * 1000;

    await transporter.sendMail({
      from: process.env.OTP_EMAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Pehchaan Careers OTP Verification",
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    });

    await runQuery(
      `INSERT INTO otp_codes (channel, target, otp, expires_at, created_at) VALUES (?, ?, ?, ?, ?)`,
      ["email", email, otp, expiresAt, now]
    );
    res.json({ message: "Email OTP sent successfully." });
  } catch (error) {
    res.status(500).json({ message: `Could not send email OTP. ${String(error.message || "")}` });
  }
});

app.post("/api/otp/verify-email", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const otp = String(req.body.otp || "").trim();
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required." });

    const row = await getQuery(
      `SELECT * FROM otp_codes WHERE channel = ? AND target = ? AND otp = ? ORDER BY id DESC LIMIT 1`,
      ["email", email, otp]
    );
    if (!row) return res.status(400).json({ message: "Invalid OTP." });
    if (Date.now() > row.expires_at) return res.status(400).json({ message: "OTP has expired." });

    await runQuery(`UPDATE otp_codes SET verified = 1 WHERE id = ?`, [row.id]);
    res.json({ message: "Email OTP verified." });
  } catch (error) {
    res.status(500).json({ message: "Could not verify email OTP." });
  }
});

app.post("/api/assessment/submit", async (req, res) => {
  try {
    const { full_name, city, state, phone, email, qualification } = req.body;
    if (!full_name || !city || !state || !phone || !email || !qualification) {
      return res.status(400).json({ message: "All assessment fields are required." });
    }

    await runQuery(
      `INSERT INTO assessment_submissions (full_name, city, state, phone, email, qualification, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [full_name, city, state, phone, email, qualification, Date.now()]
    );

    if (process.env.GOOGLE_SHEET_WEBHOOK_URL) {
      const sheetPayload = {
        source: "assessment_form",
        submitted_at_iso: new Date().toISOString(),
        full_name,
        city,
        state,
        phone,
        email,
        qualification,
      };
      fetch(process.env.GOOGLE_SHEET_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sheetPayload),
      }).catch(() => null);
    }

    res.json({ message: "Assessment details saved." });
  } catch (error) {
    res.status(500).json({ message: "Could not save assessment details." });
  }
});

app.post("/api/contact/submit", async (req, res) => {
  try {
    const { name, email, phone, city, state, current_qualification, message } = req.body;
    if (!name || !email || !city || !state || !current_qualification || !message) {
      return res.status(400).json({ message: "All required contact fields must be filled." });
    }

    await runQuery(
      `INSERT INTO contact_submissions (name, email, phone, city, state, current_qualification, message, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone || "", city, state, current_qualification, message, Date.now()]
    );

    if (process.env.GOOGLE_SHEET_WEBHOOK_URL) {
      const sheetPayload = {
        source: "contact_form",
        submitted_at_iso: new Date().toISOString(),
        name,
        email,
        phone: phone || "",
        city,
        state,
        current_qualification,
        message,
      };
      fetch(process.env.GOOGLE_SHEET_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sheetPayload),
      }).catch(() => null);
    }

    res.json({ message: "Contact form submitted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Could not submit contact form." });
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Pehchaan backend running on port ${port}`);
});
