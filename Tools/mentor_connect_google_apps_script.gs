/**
 * Pehchaan Mentor Connect — Google Apps Script backend
 *
 * SETUP
 * 1. Your header row can match the Pehchaan template or this common layout (order for new rows from the form):
 *    Time Stamp | Full Name | Initials | Title | Company | City | Hometown | State | University |
 *    Journey Story | Journey Path | LinkedIn Profile | Tags
 *    (Aliases like Name, College, LinkedIn, Timestamp are also recognised.)
 * 2. Extensions → Apps Script → paste this file → Save → Deploy → **New deployment**
 *    (use “New version” after edits — old deployments keep old code until you redeploy.)
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
 * The script picks whichever tab yields the most parseable mentor rows (see getMentorSheet_).
 */
var MENTOR_SHEET_NAME = 'Mentors'; // reserved for future “always write to this tab” behaviour

function jsonOutput_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Pick the tab where we can actually parse mentor rows (not just the longest tab).
 * Fixes: empty "Mentors" tab while real rows live on "Sheet1", or title rows above headers.
 */
function getMentorSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var best = sheets[0];
  var bestScore = sheetImportScore_(best);
  for (var i = 1; i < sheets.length; i++) {
    var sc = sheetImportScore_(sheets[i]);
    if (sc > bestScore) {
      bestScore = sc;
      best = sheets[i];
    }
  }
  return best;
}

/** How many mentor rows we can parse from the first chunk of this tab (for ranking only). */
function sheetImportScore_(sh) {
  var lr = sh.getLastRow();
  var lc = sh.getLastColumn();
  if (lr < 2 || lc < 1) return -1;
  var probeRows = Math.min(300, lr);
  var rng = sh.getRange(1, 1, probeRows, lc);
  var vals = rng.getValues();
  var fmls = rng.getFormulas();
  var headerRow = findHeaderRowIndex_(vals);
  var headers = vals[headerRow].map(function (h) {
    return String(h || '').trim();
  });
  var count = 0;
  for (var i = headerRow + 1; i < vals.length; i++) {
    var m = rowToMentor_(headers, vals[i], fmls[i] || []);
    if (m && m.name) count++;
  }
  return count * 100000 + lr;
}

function normalizeHeaderKey_(h) {
  return String(h || '')
    .replace(/\u00a0/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/** Build map: normalized header string -> column index */
function buildHeaderIndex_(headers) {
  var map = {};
  for (var c = 0; c < headers.length; c++) {
    var key = normalizeHeaderKey_(headers[c]);
    if (key && map[key] === undefined) map[key] = c;
  }
  return map;
}

/** First non-empty cell among columns whose header matches any alias (normalized). */
function getCellByAliases_(headerMap, headers, row, aliases) {
  for (var a = 0; a < aliases.length; a++) {
    var nk = normalizeHeaderKey_(aliases[a]);
    if (headerMap[nk] === undefined) continue;
    var v = row[headerMap[nk]];
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
  }
  return '';
}

/** Known column titles (normalized) — used to find which row is the real header row. */
var HEADER_HINTS_ = [
  'name', 'full name', 'timestamp', 'time stamp', 'initials', 'title', 'company', 'city', 'hometown', 'state',
  'college', 'university', 'journey story', 'journey path', 'linkedin', 'linkedin profile', 'linkedin url', 'tags',
  'email', 'phone'
];

function headerRowScore_(row) {
  var score = 0;
  for (var c = 0; c < row.length; c++) {
    var nk = normalizeHeaderKey_(row[c]);
    if (!nk) continue;
    if (nk.indexOf('linkedin') >= 0 || nk.indexOf('linked in') >= 0 || nk.indexOf('lnkd') >= 0) {
      score++;
      continue;
    }
    for (var h = 0; h < HEADER_HINTS_.length; h++) {
      if (nk === HEADER_HINTS_[h]) {
        score++;
        break;
      }
    }
  }
  return score;
}

/**
 * Many sheets have a title row or blank row before the real headers.
 * Pick the row in the first 25 lines with the strongest header-like match (need at least 2 hints).
 */
function findHeaderRowIndex_(values) {
  if (!values || !values.length) return 0;
  var bestR = 0;
  var bestScore = headerRowScore_(values[0]);
  var maxR = Math.min(40, values.length);
  for (var r = 1; r < maxR; r++) {
    var sc = headerRowScore_(values[r]);
    if (sc > bestScore) {
      bestScore = sc;
      bestR = r;
    }
  }
  if (bestScore >= 2) return bestR;
  if (bestScore === 1) {
    for (var c = 0; c < values[bestR].length; c++) {
      var nk = normalizeHeaderKey_(values[bestR][c]);
      if (nk === 'name' || nk === 'full name' || nk === 'time stamp' || nk === 'timestamp') return bestR;
    }
  }
  return 0;
}

/** Pull a LinkedIn / lnkd.in URL from plain text or from =HYPERLINK("...", "...") */
function extractLinkedInFromString_(s) {
  if (!s) return '';
  var str = String(s);
  var m = str.match(/https?:\/\/(?:[\w.-]+\.)?linkedin\.com\/[^\s"'<>)]+/i);
  if (m) return m[0].replace(/[,;.)]+$/, '');
  m = str.match(/https?:\/\/lnkd\.in\/[^\s"'<>)]+/i);
  if (m) return m[0].replace(/[,;.)]+$/, '');
  m = str.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s"'<>]+/i);
  if (m) {
    var u = m[0].replace(/[,;.)]+$/, '');
    if (!/^https?:\/\//i.test(u)) return 'https://' + u.replace(/^\/+/, '');
    return u;
  }
  return '';
}

function extractLinkedInFromHyperlinkFormula_(f) {
  if (!f || String(f).indexOf('HYPERLINK') < 0) return '';
  var fm = String(f);
  var m = fm.match(/HYPERLINK\s*\(\s*"([^"]+)"/i);
  if (m && m[1] && /linkedin\.com|lnkd\.in/i.test(m[1])) return m[1];
  m = fm.match(/HYPERLINK\s*\(\s*'([^']+)'/i);
  if (m && m[1] && /linkedin\.com|lnkd\.in/i.test(m[1])) return m[1];
  return '';
}

/** If the LinkedIn column is mis-labelled or uses HYPERLINK, scan the whole row. */
function findLinkedInUrlInRow_(row, formulaRow) {
  formulaRow = formulaRow || [];
  for (var c = 0; c < row.length; c++) {
    var cell = String(row[c] == null ? '' : row[c]).trim();
    var fromCell = extractLinkedInFromString_(cell);
    if (fromCell) return fromCell;
    var frm = String(formulaRow[c] == null ? '' : formulaRow[c]).trim();
    var fromF = extractLinkedInFromHyperlinkFormula_(frm);
    if (fromF) return fromF;
    fromF = extractLinkedInFromString_(frm);
    if (fromF) return fromF;
  }
  return '';
}

/** doGet — return all mentor rows as JSON array (camelCase objects). */
function doGet() {
  try {
    var sh = getMentorSheet_();
    var range = sh.getDataRange();
    var values = range.getValues();
    var formulas = range.getFormulas();
    if (!values || values.length < 2) return jsonOutput_([]);
    var headerRow = findHeaderRowIndex_(values);
    var headers = values[headerRow].map(function (h) {
      return String(h || '').trim();
    });
    var out = [];
    for (var i = headerRow + 1; i < values.length; i++) {
      var row = values[i];
      if (!row || !row.length) continue;
      var empty = true;
      for (var j = 0; j < row.length; j++) {
        if (row[j] !== '' && row[j] !== null && row[j] !== undefined) {
          empty = false;
          break;
        }
      }
      if (empty) continue;
      var frow = formulas[i] || [];
      var m = rowToMentor_(headers, row, frow);
      if (m && m.name) out.push(m);
    }
    return jsonOutput_(out);
  } catch (e) {
    return jsonOutput_({ error: String(e.message || e) });
  }
}

function rowToMentor_(headers, row, formulaRow) {
  formulaRow = formulaRow || [];
  var hm = buildHeaderIndex_(headers);
  function get(aliases) {
    return getCellByAliases_(hm, headers, row, aliases);
  }
  var name = get(['Name', 'Full name', 'Full Name', 'Mentor name', 'Mentor Name']);
  // Legacy layout: Timestamp | Name | … in columns A,B,…
  if (!name && row.length >= 2) {
    var h1 = normalizeHeaderKey_(headers[1] || '');
    if (h1 === 'name' || h1 === 'full name') {
      var cand = String(row[1] || '').trim();
      if (cand) name = cand;
    }
  }
  if (!name) return null;
  var initials = get(['Initials']) || deriveInitials_(name);
  var jp = get(['Journey Path', 'Journey path', 'Path']);
  var tg = get(['Tags', 'Tag']);
  var story = get(['Journey Story', 'Journey story', 'Story', 'Bio', 'About']);
  var li = get([
    'LinkedIn Profile',
    'LinkedIn', 'Linkedin', 'LinkedIn URL', 'Linkedin url', 'LinkedIn profile', 'Linkedin profile',
    'LinkedIn Profile URL', 'Linkedin Profile URL', 'Linkedin link', 'LinkedIn Link',
    'Profile URL', 'Profile link', 'Social', 'Social link', 'Linked In', 'LI URL'
  ]);
  if (!li) li = findLinkedInUrlInRow_(row, formulaRow);
  return {
    name: name,
    initials: initials,
    title: get(['Title', 'Current title', 'Job title', 'Role']),
    company: get(['Company', 'Organisation', 'Organization']),
    city: get(['City', 'Current city']),
    hometown: get(['Hometown', 'Home town', 'Home Town']),
    state: get(['State']),
    college: get(['University', 'College', 'School', 'Uni', 'University / College']),
    journeyStory: story,
    journeyPath: jp ? jp.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : [],
    linkedin: li,
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
