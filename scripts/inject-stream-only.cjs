const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "../Tools/pehchaan_stream_advisor.html");
let s = fs.readFileSync(file, "utf8");
const START = "var QUESTIONS = [";
const END = "\n\n/* ===== STATE ===== */";
const i = s.indexOf(START);
const j = s.indexOf(END);
if (i < 0 || j < 0) throw new Error("markers");
const INJ = `var QUESTIONS = [];
var STREAM_DATA = {};
var STREAM_AI = null;
function getStreamAdvisorDataUrl() {
  try {
    return new URL("../DB/pehchaan_stream_advisor_data.json", window.location.href).href;
  } catch (e) {
    return "../DB/pehchaan_stream_advisor_data.json";
  }
}
function tmpl(str, map) {
  return String(str || "").replace(/\\{\\{(\\w+)\\}\\}/g, function (_, k) {
    return map[k] != null ? String(map[k]) : "";
  });
}
function applyStreamPack(data) {
  QUESTIONS = data.questions || [];
  STREAM_DATA = data.streamData || {};
  STREAM_AI = data.ai || {};
}
function nQ() {
  return Math.max(QUESTIONS.length, 1);
}

`;
s = s.slice(0, i) + INJ + s.slice(j);
s = s
  .replace(/\(idx\/15\*100\)/g, "(idx/nQ()*100)")
  .replace(/idx === 14/g, "idx === nQ() - 1")
  .replace(/' of 15'/g, "' of ' + nQ()")
  .replace(/Question ' \+ \(idx\+1\) \+ ' of 15/g, "Question ' + (idx+1) + ' of ' + nQ()")
  .replace(/if \(curQ === 14\)/g, "if (curQ === nQ() - 1)");
fs.writeFileSync(file, s);
console.log("Injected JSON loader + nQ()");
