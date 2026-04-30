# Pehchaan OTP Backend

This backend provides:
- Phone OTP (Twilio)
- Email OTP (SMTP)
- Assessment form data storage in SQLite
- Contact form data storage in SQLite
- Optional forwarding to Google Sheets webhook (separate tabs)

## 1) Install

```bash
cd backend
npm install
```

## 2) Configure

Create `.env` by copying `.env.example`, then fill:
- `TWILIO_*` for mobile OTP
- `SMTP_*` and `OTP_EMAIL_FROM` for email OTP
- Optional `GOOGLE_SHEET_WEBHOOK_URL`

## 3) Run

```bash
npm start
```

Default API: `http://localhost:8787/api`

## 4) Data storage

SQLite file is created automatically at:
- `backend/data/pehchaan.db`

## 5) Google Sheets (hello.pehchaan@gmail.com)

To keep all submissions inside the Drive of `hello.pehchaan@gmail.com`, do these steps while logged in with that exact account:

1. Open [Google Sheets](https://sheets.google.com) using `hello.pehchaan@gmail.com`.
2. Create a new Sheet, name it for example: `Pehchaan Assessment Leads`.
3. Open `Extensions -> Apps Script`.
4. Replace default code with file content from:
   - `backend/google-apps-script/Code.gs`
5. Click `Deploy -> New deployment`.
6. Type: `Web app`
   - Execute as: `Me`
   - Who has access: `Anyone`
7. Deploy and copy the Web app URL.
8. In backend `.env`, set:
   - `GOOGLE_SHEET_WEBHOOK_URL=<your-web-app-url>`
9. Restart backend server.

After this:
- Assessment submissions go to `AssessmentSubmissions` tab
- Contact form submissions go to `ContactSubmissions` tab
