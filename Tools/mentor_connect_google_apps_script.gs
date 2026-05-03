/**
 * Pehchaan Mentor Connect — Google Apps Script backend
 *
 * SETUP
 * 1. Create a new Google Sheet. Row 1 must be exactly these headers (same order helps appendRow):
 *    Timestamp | Name | Initials | Title | Company | City | Hometown | State | College | Journey Story | Journey Path | LinkedIn | Tags
 * 2. Extensions → Apps Script → paste this file → Save → Deploy → New deployment
 *    Type: Web app
 *    Execute as: Me
 *    Who has access: Anyone (students’ browsers call this without Google sign-in)
 * 3. Copy the Web App URL into Tools/pehchaan_mentor_connect.html → MENTOR_WEB_APP_URL
 *    (or use the optional “Mentor database URL” field on the page, saved in localStorage.)
 *
 * CORS: Deployed Web Apps return JSON via ContentService; browsers can call your /exec URL
 * cross-origin (Google sets the needed behaviour for this endpoint). The Pehchaan page
 * sends POST as application/x-www-form-urlencoded with a JSON string in `payload` so the
 * request stays a “simple” CORS request (avoids OPTIONS preflight issues with application/json).
 *
 * Optional: add a sheet named exactly "Mentors" or the first sheet is used.
 */
var MENTOR_SHEET_NAME = 'Mentors';

function jsonOutput_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getMentorSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(MENTOR_SHEET_NAME);
  if (!sh) sh = ss.getSheets()[0];
  return sh;
}

/** doGet — return all mentor rows as JSON array (camelCase objects). */
function doGet() {
  try {
    var sh = getMentorSheet_();
    var values = sh.getDataRange().getValues();
    if (!values || values.length < 2) return jsonOutput_([]);
    var headers = values[0].map(function (h) {
      return String(h || '').trim();
    });
    var out = [];
    for (var i = 1; i < values.length; i++) {
      var m = rowToMentor_(headers, values[i]);
      if (m && m.name) out.push(m);
    }
    return jsonOutput_(out);
  } catch (e) {
    return jsonOutput_({ error: String(e.message || e) });
  }
}

function rowToMentor_(headers, row) {
  function get(label) {
    var idx = -1;
    for (var i = 0; i < headers.length; i++) {
      if (headers[i] === label) {
        idx = i;
        break;
      }
    }
    if (idx < 0 || row[idx] === undefined || row[idx] === null) return '';
    return String(row[idx]).trim();
  }
  var name = get('Name');
  if (!name) return null;
  var initials = get('Initials') || deriveInitials_(name);
  var jp = get('Journey Path');
  var tg = get('Tags');
  return {
    name: name,
    initials: initials,
    title: get('Title'),
    company: get('Company'),
    city: get('City'),
    hometown: get('Hometown'),
    state: get('State'),
    college: get('College'),
    journeyStory: get('Journey Story'),
    journeyPath: jp ? jp.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : [],
    linkedin: get('LinkedIn'),
    tags: tg ? tg.split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean) : []
  };
}

function deriveInitials_(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(function (p) {
      return (p[0] || '').toUpperCase();
    })
    .join('');
}

/**
 * doPost — append one mentor row.
 * Body: application/x-www-form-urlencoded with field `payload` = JSON string
 *   { name, initials?, title, company, city, hometown, state, college, journeyStory, journeyPath, linkedin, tags? }
 * journeyPath and tags may be strings (comma-separated) or arrays.
 */
function doPost(e) {
  try {
    var raw = '';
    if (e.postData && e.postData.contents) raw = e.postData.contents;
    var data = {};
    if (e.parameter && e.parameter.payload) {
      data = JSON.parse(e.parameter.payload);
    } else if (raw) {
      try {
        data = JSON.parse(raw);
      } catch (ignore) {
        data = {};
      }
    }
    appendMentorRow_(data);
    return jsonOutput_({ ok: true });
  } catch (err) {
    return jsonOutput_({ ok: false, error: String(err.message || err) });
  }
}

function appendMentorRow_(payload) {
  var sh = getMentorSheet_();
  var now = new Date();
  var name = String(payload.name || '').trim();
  if (!name) throw new Error('Name is required');
  var initials = String(payload.initials || '').trim() || deriveInitials_(name);
  var jp = payload.journeyPath;
  if (Array.isArray(jp)) jp = jp.join(', ');
  else jp = String(jp || '').trim();
  var tg = payload.tags;
  if (Array.isArray(tg)) tg = tg.join(', ');
  else tg = String(tg || '').trim();
  sh.appendRow([
    now,
    name,
    initials,
    String(payload.title || '').trim(),
    String(payload.company || '').trim(),
    String(payload.city || '').trim(),
    String(payload.hometown || '').trim(),
    String(payload.state || '').trim(),
    String(payload.college || '').trim(),
    String(payload.journeyStory || '').trim(),
    jp,
    String(payload.linkedin || '').trim(),
    tg
  ]);
}
