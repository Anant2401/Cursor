function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents || "{}");
    var source = String(payload.source || "assessment_form");
    var sheetName = source === "contact_form" ? "ContactSubmissions" : "AssessmentSubmissions";

    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
    }

    if (source === "contact_form") {
      if (sheet.getLastRow() === 0) {
        sheet.appendRow([
          "source",
          "submitted_at_iso",
          "name",
          "email",
          "phone",
          "city",
          "state",
          "current_qualification",
          "message"
        ]);
      }

      sheet.appendRow([
        source,
        payload.submitted_at_iso || new Date().toISOString(),
        payload.name || "",
        payload.email || "",
        payload.phone || "",
        payload.city || "",
        payload.state || "",
        payload.current_qualification || "",
        payload.message || ""
      ]);
    } else {
      if (sheet.getLastRow() === 0) {
        sheet.appendRow([
          "source",
          "submitted_at_iso",
          "full_name",
          "city",
          "state",
          "phone",
          "email",
          "qualification"
        ]);
      }

      sheet.appendRow([
        source,
        payload.submitted_at_iso || new Date().toISOString(),
        payload.full_name || "",
        payload.city || "",
        payload.state || "",
        payload.phone || "",
        payload.email || "",
        payload.qualification || ""
      ]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
