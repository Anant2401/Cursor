const fs = require("fs");
const path = require("path");
const src = fs.readFileSync(path.join(__dirname, "../Tools/pehchaan_stream_advisor.html"), "utf8");
const mq = src.match(/var QUESTIONS = (\[[\s\S]*?\]);\s*\/\* ===== STREAM DATA ===== \*\//);
const ms = src.match(/var STREAM_DATA = (\{[\s\S]*?\n\});\s*\/\* ===== STATE ===== \*\//);
if (!mq || !ms) {
  console.error("extract failed", { questions: !!mq, streamData: !!ms });
  process.exit(1);
}
const QUESTIONS = Function("return " + mq[1])();
const STREAM_DATA = Function("return " + ms[1])();
const out = {
  meta: {
    last_updated: new Date().toISOString().slice(0, 10),
    version: "1.0",
    questionCount: QUESTIONS.length,
  },
  questions: QUESTIONS,
  streamData: STREAM_DATA,
  ai: {
    apiUrl: "https://api.anthropic.com/v1/messages",
    model: "claude-sonnet-4-20250514",
    maxTokens: 200,
    useApi: false,
    promptTemplate:
      "You are Pehchaan Careers — an honest, warm elder-sibling career guide for students aged 15-17 in Tier 3 cities of Chhattisgarh, India (Korba, Bilaspur, Raigarh). Write a SHORT, warm, personal message (3-4 sentences, under 120 words) for {{name}} who just completed the Stream Advisor test. Their result: {{stream}} stream (Science {{sPct}}%, Commerce {{cPct}}%, Arts {{aPct}}%). Write directly to them using their name. Be encouraging but honest. Do not use flowery language. Sound like an elder sibling who genuinely cares. Write in simple English — clear sentences, no jargon. End with one encouraging sentence about their specific stream. Do not start with \"Hello\" or \"Hi\".",
    fallbackTemplates: {
      S: "{{name}}, you chose answers that show a mind that genuinely wants to understand how things work — not just memorise, but really understand. That is exactly the kind of thinking that drives good engineers, doctors and scientists. Science stream will feel challenging, but the right kind of challenging. Thousands of students from smaller cities have cracked JEE and NEET — hard work from day one makes all the difference.",
      C: "{{name}}, your answers show someone who thinks practically about resources, planning and outcomes. That is an incredibly valuable way of thinking — and it is exactly what Commerce stream is built for. The path from here to CA, Banking or Business is clear and structured. You are not choosing the easy stream — you are choosing the smart one for your strengths.",
      A: "{{name}}, the fact that you scored highest in Arts tells me you think deeply about people, society and ideas. That is not a weakness — it is a strength that most students in India have been told to ignore. The students who crack UPSC, become lawyers or build media careers are often exactly the kind of thinkers you describe yourself as being. Your stream is one of quiet power.",
    },
  },
};
const dest = path.join(__dirname, "../DB/pehchaan_stream_advisor_data.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2));
console.log("Wrote", dest, "bytes", fs.statSync(dest).size);
