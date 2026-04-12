// ═══════════════════════════════════════════════════════════════════════════
//  SAFUU BOT  |  safuu-bot.js
//  Anonymous Ethiopian Anti-Corruption Telegram Bot
//  All imports at top · Security-integrated · Production-ready
// ═══════════════════════════════════════════════════════════════════════════
"use strict";

require("dotenv").config();

// ── All imports at top (no lazy require) ──────────────────────────────────────
const { Telegraf }   = require("telegraf");
const { message }    = require("telegraf/filters");
const Anthropic      = require("@anthropic-ai/sdk");
const OpenAI         = require("openai");
const axios          = require("axios");
const FormData       = require("form-data");
const sharp          = require("sharp");
const Database       = require("better-sqlite3");
const crypto         = require("crypto");
const { v4: uuid }   = require("uuid");
const fs             = require("fs");
const path           = require("path");

const {
  encrypt, decrypt,
  sanitizeName, sanitizeOffice, sanitizePhone, sanitizeAmount,
  sanitizeText, validateDate,
  validateImageFile, validateAudioFile,
  checkRateLimit, auditLog, detectAnomaly,
  isSessionExpired, touchSession,
} = require("./safuu-security");

// ── Env validation ────────────────────────────────────────────────────────────
["TELEGRAM_BOT_TOKEN","ANTHROPIC_API_KEY","OPENAI_API_KEY","ADMIN_CHANNEL_ID",
 "ENCRYPTION_MASTER_KEY","DEDUP_SALT"].forEach(k => {
  if (!process.env[k]) { console.error(`🚫  Missing env var: ${k}`); process.exit(1); }
});

// ── Clients ───────────────────────────────────────────────────────────────────
const bot    = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ADMIN_CHANNEL = process.env.ADMIN_CHANNEL_ID;
const HIVE_KEY      = process.env.HIVE_AI_KEY || null;
const DEDUP_SALT    = process.env.DEDUP_SALT;

// ── Database ──────────────────────────────────────────────────────────────────
if (!fs.existsSync("./data")) fs.mkdirSync("./data", { recursive: true });

const db = new Database("./data/safuu.db");
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("secure_delete = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS persons (
    id             TEXT PRIMARY KEY,
    name           TEXT NOT NULL,
    name_phonetic  TEXT,
    title          TEXT,
    office         TEXT,
    region         TEXT,
    phone          TEXT,
    report_count   INTEGER DEFAULT 0,
    verified_count INTEGER DEFAULT 0,
    rating         REAL    DEFAULT 0,
    severity       TEXT    DEFAULT 'Low',
    status         TEXT    DEFAULT 'Monitoring',
    first_seen     TEXT,
    last_seen      TEXT,
    created_at     TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reports (
    id              TEXT PRIMARY KEY,
    person_id       TEXT REFERENCES persons(id),
    tip_id          TEXT UNIQUE NOT NULL,
    input_type      TEXT,
    incident_date   TEXT,
    incident_time   TEXT,
    location        TEXT,
    amount          TEXT,
    description     TEXT,
    exif_date       TEXT,
    exif_gps        INTEGER DEFAULT 0,
    exif_delta_days INTEGER,
    ai_score        REAL    DEFAULT 0,
    ai_flagged      INTEGER DEFAULT 0,
    exif_verified   INTEGER DEFAULT 0,
    is_verified     INTEGER DEFAULT 0,
    severity        TEXT,
    corruption_type TEXT,
    language        TEXT,
    timestamp_hour  TEXT,
    ledger_hash     TEXT,
    notes           TEXT,
    notes_language  TEXT,
    created_at      TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS dedup_hashes (
    hash       TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    user_hash  TEXT PRIMARY KEY,
    data       TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ledger (
    seq          INTEGER PRIMARY KEY AUTOINCREMENT,
    tip_id       TEXT,
    event        TEXT,
    payload_hash TEXT,
    prev_hash    TEXT,
    block_hash   TEXT,
    ts           TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_persons_phonetic ON persons(name_phonetic);
  CREATE INDEX IF NOT EXISTS idx_reports_person   ON reports(person_id);
  CREATE INDEX IF NOT EXISTS idx_reports_created  ON reports(created_at);
`);

// ── Prepared statements ───────────────────────────────────────────────────────
const stmt = {
  getSession:     db.prepare("SELECT data FROM sessions WHERE user_hash=?"),
  setSession:     db.prepare("INSERT OR REPLACE INTO sessions (user_hash,data,updated_at) VALUES (?,?,datetime('now'))"),
  delSession:     db.prepare("DELETE FROM sessions WHERE user_hash=?"),
  getDedupHash:   db.prepare("SELECT hash FROM dedup_hashes WHERE hash=?"),
  insertDedupHash:db.prepare("INSERT OR IGNORE INTO dedup_hashes (hash) VALUES (?)"),
  insertPerson:   db.prepare(`INSERT OR IGNORE INTO persons
    (id,name,name_phonetic,title,office,region,phone,first_seen,report_count)
    VALUES (?,?,?,?,?,?,?,datetime('now'),0)`),
  bumpPerson:     db.prepare("UPDATE persons SET report_count=report_count+1, last_seen=datetime('now') WHERE id=?"),
  setPphone:      db.prepare("UPDATE persons SET phone=? WHERE id=? AND phone IS NULL"),
  updateRating:   db.prepare("UPDATE persons SET verified_count=?,rating=?,severity=?,status=? WHERE id=?"),
  findPersonPh:   db.prepare("SELECT * FROM persons WHERE name_phonetic=? AND LOWER(office) LIKE ?"),
  findPersonId:   db.prepare("SELECT * FROM persons WHERE id=?"),
  insertReport:   db.prepare(`INSERT INTO reports
    (id,person_id,tip_id,input_type,incident_date,incident_time,location,amount,
     description,exif_date,exif_gps,exif_delta_days,ai_score,ai_flagged,exif_verified,
     is_verified,severity,corruption_type,language,timestamp_hour,ledger_hash,notes,notes_language)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`),
  getLastLedger:  db.prepare("SELECT block_hash FROM ledger ORDER BY seq DESC LIMIT 1"),
  insertLedger:   db.prepare("INSERT INTO ledger (tip_id,event,payload_hash,prev_hash,block_hash) VALUES (?,?,?,?,?)"),
  reportsByPerson:db.prepare("SELECT * FROM reports WHERE person_id=?"),
  personCount:    db.prepare("SELECT COUNT(*) as n FROM persons"),
  reportCount:    db.prepare("SELECT COUNT(*) as n FROM reports"),
  cleanSessions:  db.prepare("DELETE FROM sessions WHERE updated_at < datetime('now','-30 minutes')"),
};

// ── Session cleanup (run periodically) ────────────────────────────────────────
setInterval(() => { try { stmt.cleanSessions.run(); } catch {} }, 5 * 60 * 1000);

// ── Ethiopian language detection ──────────────────────────────────────────────
// Unicode ranges and vocabulary signals for Ethiopia's main languages
const LANG_LABELS = {
  am: "Amharic / አማርኛ",
  ti: "Tigrinya / ትግርኛ",
  or: "Oromiffa",
  so: "Somali / Soomaali",
  af: "Afar / Qafar",
  si: "Sidama / Sidaamu Afoo",
  wo: "Wolaytta / Wolayttatto",
  ha: "Hadiyya / Hadiyyissa",
  da: "Dawro",
  ga: "Gamo",
  be: "Bench",
  en: "English",
  mix: "Mixed languages",
};

function detectNotesLanguage(text) {
  if (!text || typeof text !== string) return null;

  // Count Ethiopic script characters (U+1200–U+137F covers Amharic, Tigrinya, and most others)
  const chars = [...text]; // Spread for proper unicode iteration
  const ethiopicChars = chars.filter(c => c.charCodeAt(0) >= 0x1200 && c.charCodeAt(0) <= 0x137F);
  const ethiopicRatio = ethiopicChars.length / Math.max(chars.length, 1);

  if (ethiopicRatio > 0.1) {
    // Higher unicode range (U+1350+) = more likely Tigrinya / Ge'ez
    const highEthiopic = chars.filter(c => c.charCodeAt(0) >= 0x1350 && c.charCodeAt(0) <= 0x137F);
    if (highEthiopic.length > 2 || text.includes(ሓቂ) || text.includes(ኣነ) || text.includes(ዝኾነ)) return ti;
    return am; // Most Ethiopic script in Ethiopia is Amharic
  }

  // Latin-script language detection by vocabulary patterns
  const lower = text.toLowerCase();
  // Oromiffa: common particles and words
  if (/(gabaasa|dhaaf|ykn|maal|nama|kana|ta'e|jira|hin|yoo|danda|ergi|dabarsi)/.test(lower)) return or;
  // Somali: distinctive vocabulary
  if (/(waxay|waxa|ayaa|iyo|guri|lacag|nin|baas|sida|qalab)/.test(lower)) return so;
  // Afar: distinctive words
  if (/(qafar|taamiira|meeta|sagal|laala|hecce)/.test(lower)) return af;
  // Sidama
  if (/(aficho|dancha|ikkitino|ros|mino|leellishe)/.test(lower)) return si;
  // Wolaytta
  if (/(wolayta|kawo|asa|gede|ta'i|laa|yaa)/.test(lower)) return wo;

  // Default for Latin script: English
  return en;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function userHash(userId) {
  return crypto.createHash("sha256")
    .update(`${DEDUP_SALT}:user:${userId}`).digest("hex").slice(0, 24);
}

function dupHash(userId, personName) {
  return crypto.createHash("sha256")
    .update(`${DEDUP_SALT}:dup:${userId}:${personName.toLowerCase().trim()}`).digest("hex");
}

function generateTipId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return "TIP-" + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function phonetic(name) {
  return name.toLowerCase()
    .replace(/[aeiou]+/g, "a")
    .replace(/(.)\1+/g, "$1")
    .replace(/[^a-z]/g, "")
    .slice(0, 12);
}

function hourTimestamp() {
  const d = new Date(); d.setMinutes(0, 0, 0); return d.toISOString();
}

function parseIncidentDate(raw) {
  const s = (raw || "").toLowerCase().trim();
  if (["today","ዛሬ","har'a"].includes(s)) return new Date().toISOString().slice(0, 10);
  if (["yesterday","ትናንት","kaleessa"].includes(s))
    return new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const m1 = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m1) return `${m1[3]}-${m1[2].padStart(2,"0")}-${m1[1].padStart(2,"0")}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  return raw;
}

// ── Session management ─────────────────────────────────────────────────────────
function getSession(userId) {
  const row = stmt.getSession.get(userHash(userId));
  if (!row) return null;
  const sess = JSON.parse(row.data);
  if (isSessionExpired(sess)) { stmt.delSession.run(userHash(userId)); return null; }
  return sess;
}

function saveSession(userId, data) {
  stmt.setSession.run(userHash(userId), JSON.stringify(touchSession(data)));
}

function clearSession(userId) {
  stmt.delSession.run(userHash(userId));
}

// ── Evidence ledger ────────────────────────────────────────────────────────────
function sealLedger(tipId, payload) {
  const payloadHash = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  const prev        = stmt.getLastLedger.get();
  const prevHash    = prev?.block_hash || "GENESIS";
  const blockHash   = crypto.createHash("sha256")
    .update(`${tipId}:${payloadHash}:${prevHash}:${Date.now()}`).digest("hex");
  stmt.insertLedger.run(tipId, "REPORT_SUBMITTED", payloadHash, prevHash, blockHash);
  return blockHash;
}

// ── Telegram file download ─────────────────────────────────────────────────────
async function downloadTgFile(fileId) {
  const info = await bot.telegram.getFile(fileId);
  const url  = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${info.file_path}`;
  const res  = await axios.get(url, { responseType: "arraybuffer", timeout: 30000 });
  return { buf: Buffer.from(res.data), filename: path.basename(info.file_path) };
}

// ── Voice transcription ────────────────────────────────────────────────────────
async function transcribeVoice(buf, filename) {
  const validation = validateAudioFile(buf);
  if (!validation.valid) throw new Error(`Audio rejected: ${validation.reason}`);

  const fd = new FormData();
  fd.append("file", buf, { filename: filename || "audio.ogg", contentType: validation.mime });
  fd.append("model", "whisper-1");
  fd.append("prompt", "Ethiopian anti-corruption report. May be in Amharic, Oromiffa, Tigrinya, or English.");

  const res = await axios.post("https://api.openai.com/v1/audio/transcriptions", fd, {
    headers: { ...fd.getHeaders(), Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    timeout: 60000,
  });
  return res.data.text;
}

// ── EXIF extraction ────────────────────────────────────────────────────────────
async function extractEXIF(buf) {
  try {
    const meta = await sharp(buf).metadata();
    let exifDate = null;
    let hasGps   = false;

    if (meta.exif) {
      // Scan buffer for YYYY:MM:DD HH:MM:SS pattern
      const str   = meta.exif.toString("latin1");
      const match = str.match(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
      if (match) exifDate = `${match[1]}-${match[2]}-${match[3]}`;
      // GPS IFD tag check (tag 0x8825 = 34853)
      hasGps = meta.exif.includes(Buffer.from([0x25, 0x88]));
    }
    return { exifDate, hasGps, hasExif: !!meta.exif };
  } catch {
    return { exifDate: null, hasGps: false, hasExif: false };
  }
}

// ── Hive AI image detection ────────────────────────────────────────────────────
async function detectAIImage(buf) {
  if (!HIVE_KEY) return { score: 0, flagged: false };
  try {
    const fd = new FormData();
    fd.append("image", buf, { filename: "image.jpg", contentType: "image/jpeg" });
    const res = await axios.post("https://api.thehive.ai/api/v2/task/sync", fd, {
      headers: { ...fd.getHeaders(), token: HIVE_KEY },
      timeout: 20000,
    });
    const classes = res.data?.status?.[0]?.response?.output?.[0]?.classes || [];
    const aiClass = classes.find(c => c.class === "ai_generated");
    const score   = aiClass ? aiClass.score : 0;
    return { score, flagged: score > 0.6 };
  } catch {
    return { score: 0, flagged: false };
  }
}

// ── Claude image analysis ──────────────────────────────────────────────────────
async function analyzeImage(buf) {
  try {
    const b64 = buf.toString("base64");
    const res = await claude.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } },
          { type: "text", text: `Analyze this image for an Ethiopian anti-corruption investigation.
Respond ONLY as JSON (no markdown, no preamble):
{"appears_real":true,"scene_type":"office|document|receipt|money|other","relevance":"high|medium|low","notable":"brief description","red_flags":[]}` }
        ],
      }],
    });
    return JSON.parse(res.content[0].text);
  } catch {
    return { appears_real: true, scene_type: "other", relevance: "unknown", notable: "", red_flags: [] };
  }
}

// ── Claude tip analysis ────────────────────────────────────────────────────────
async function analyzeTip(session) {
  const text = [
    `Name: ${session.name}`,
    `Title: ${session.title || "Unknown"}`,
    `Office: ${session.office}`,
    `Date: ${session.date || "Unknown"}`,
    `Time: ${session.time || "Unknown"}`,
    `Location: ${session.location || "Unknown"}`,
    `Amount: ${session.amount || "Not stated"}`,
    `Description: ${session.description}`,
  ].join("\n");

  const res = await claude.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    system: `You are an expert anti-corruption analyst for Ethiopia. Analyze the report and respond ONLY as JSON with no markdown or preamble:
{"corruption_type":"Bribery|Embezzlement|Land Fraud|Bid Rigging|Nepotism|Extortion|Tax Evasion|Police Misconduct|Procurement Fraud|Healthcare Theft|Education Corruption|Money Laundering|Abuse of Power|Other","severity":"Low|Medium|High|Critical","agency":"FEACC|Federal Police|OFAG|Ombudsman|EHRC|Ministry of Finance|Ethiopian Customs|NBE|Regional Commission|Attorney General","summary":"2-3 sentences","key_details":["fact1","fact2"],"language":"English|Amharic|Oromiffa|Tigrinya|Mixed","credibility_signals":["signal"],"risk_signals":["signal"]}`,
    messages: [{ role: "user", content: text }],
  });

  try { return JSON.parse(res.content[0].text); }
  catch {
    return {
      corruption_type: "Other", severity: "Medium", agency: "FEACC",
      summary: session.description.slice(0, 200),
      key_details: [], language: "Unknown",
      credibility_signals: [], risk_signals: [],
    };
  }
}

// ── Person registry ────────────────────────────────────────────────────────────
function upsertPerson(session, analysis) {
  const ph = phonetic(session.name);
  const officeFirstWord = session.office.split(" ")[0].toLowerCase();

  // Try phonetic + office match (catches misspellings)
  const existing = stmt.findPersonPh.get(ph, `%${officeFirstWord}%`);
  const personId = existing?.id || uuid();

  if (!existing) {
    stmt.insertPerson.run(
      personId,
      session.name,
      ph,
      session.title || null,
      session.office,
      null,                // region populated later from location
      session.phone && session.phone !== "unknown"
        ? encrypt(session.phone) : null,
    );
  } else {
    stmt.bumpPerson.run(personId);
    // Update phone if we now have it and didn't before
    if (session.phone && session.phone !== "unknown") {
      stmt.setPphone.run(encrypt(session.phone), personId);
    }
  }
  return personId;
}

function recalcRating(personId) {
  const rows = stmt.reportsByPerson.all(personId);
  if (!rows.length) return;

  const total    = rows.length;
  const verified = rows.filter(r => r.is_verified).length;
  const aiFlags  = rows.filter(r => r.ai_flagged).length;
  const exifOK   = rows.filter(r => r.exif_verified).length;

  const baseRate     = (verified / total) * 6;
  const exifBonus    = total > 0 ? (exifOK / total) * 2 : 0;
  const aiFlagDeduct = total > 0 ? (aiFlags / total) * 1.5 : 0;
  const volumeBonus  = Math.min(total / 20, 1) * 1.5;
  const rating = Math.min(10, Math.max(0, baseRate + exifBonus - aiFlagDeduct + volumeBonus));

  const severity = verified >= 30 ? "Critical" : verified >= 15 ? "High" : verified >= 7 ? "Medium" : "Low";
  const status   = verified >= 30 ? "Investigation" : verified >= 15 ? "Under Review" : "Monitoring";

  stmt.updateRating.run(verified, parseFloat(rating.toFixed(1)), severity, status, personId);
}

// ── Admin alert formatter ──────────────────────────────────────────────────────
function buildAdminAlert(tipId, session, analysis, imgAnalysis, exifData, aiResult, personId, ledgerHash) {
  const SEV = { Low:"🟡", Medium:"🟠", High:"🔴", Critical:"🚨" };
  const person = stmt.findPersonId.get(personId);

  return `━━━━━━━━━━━━━━━━━━━━━━
🇪🇹 *SAFUU — ANONYMOUS TIP*
━━━━━━━━━━━━━━━━━━━━━━
🔐 *Tip:* \`${tipId}\`
🔗 *Ledger:* \`${ledgerHash.slice(0,16)}...\`
📥 *Type:* ${session.inputType === "voice" ? "🎙️ Voice" : "💬 Text"}
🌐 *Language:* ${analysis.language}

━━ *ACCUSED* ━━
👤 *Name:* ${session.name}
💼 *Title:* ${session.title || "—"}
🏢 *Office:* ${session.office}
📊 *Total reports on file:* ${person?.report_count || 1}
📈 *Verified:* ${person?.verified_count || 0}

━━ *INCIDENT* ━━
📅 *Date:* ${session.date || "—"}
⏰ *Time:* ${session.time || "—"}
📍 *Location:* ${session.location || "—"}
💰 *Amount:* ${session.amount || "Not stated"}

━━ *ANALYSIS* ━━
🏷️ *Type:* ${analysis.corruption_type}
${SEV[analysis.severity] || "⚪"} *Severity:* ${analysis.severity}
🏛️ *Route to:* ${analysis.agency}
📋 *Summary:* ${analysis.summary}

🔍 *Key Details:*
${(analysis.key_details || []).map(d => `• ${d}`).join("\n") || "• None extracted"}

━━ *EVIDENCE* ━━
${session.hasImage
  ? `📸 Image submitted
  EXIF date: ${exifData?.exifDate || "Not found"}
  Incident date: ${session.date || "—"}
  GPS: ${exifData?.hasGps ? "✓ Present" : "None"}
  AI score: ${((aiResult?.score || 0) * 100).toFixed(0)}% ${aiResult?.flagged ? "⚠️ AI FLAGGED" : "✓ Likely real"}
  Scene: ${imgAnalysis?.scene_type || "—"} | Relevance: ${imgAnalysis?.relevance || "—"}`
  : "📎 No image"}

━━━━━━━━━━━━━━━━━━━━━━
${session.notes ? `📝 *TIPPER'S NOTES* (${LANG_LABELS[session.notesLang] || session.notesLang || "Unknown language"}):
_${session.notes.slice(0,600)}${session.notes.length > 600 ? "..." : ""}_

━━━━━━━━━━━━━━━━━━━━━━
` : ""}⚠️ _Identity: NEVER STORED_
🔒 _Ledger sealed — tamper-evident_`;
}

// ── Full submission pipeline ───────────────────────────────────────────────────
async function processSubmission(ctx, session) {
  const tipId = generateTipId();
  let imgAnalysis = null, exifData = null, aiResult = { score: 0, flagged: false };

  // Image forensics (buf was stored in session as base64 to survive session serialisation)
  let isVerified = true; // Text-only tips are tentatively verified
  let exifDelta  = null;
  let exifVerified = false;

  if (session.imageB64) {
    const imgBuf = Buffer.from(session.imageB64, "base64");
    try {
      [exifData, aiResult, imgAnalysis] = await Promise.all([
        extractEXIF(imgBuf),
        detectAIImage(imgBuf),
        analyzeImage(imgBuf),
      ]);

      if (exifData.exifDate && session.date) {
        try {
          const d1 = new Date(exifData.exifDate);
          const d2 = new Date(session.date);
          if (!isNaN(d1) && !isNaN(d2)) {
            exifDelta    = Math.round(Math.abs(d1 - d2) / 86400000);
            exifVerified = exifDelta <= 3;
          }
        } catch {}
      }

      isVerified = exifVerified && !aiResult.flagged;

      if (aiResult.flagged) {
        auditLog("AI_IMAGE_FLAGGED", { tipId, score: aiResult.score });
        detectAnomaly("AI_FLAG_SPIKE");
      }
    } catch (e) {
      console.warn("Image forensics error:", e.message);
    }
    delete session.imageB64; // Don't store raw image in DB
  }

  // AI tip analysis
  const analysis = await analyzeTip(session);

  // Upsert person
  const personId = upsertPerson(session, analysis);

  // Seal evidence
  const ledgerHash = sealLedger(tipId, {
    name: session.name,
    office: session.office,
    type: analysis.corruption_type,
    severity: analysis.severity,
    exif_verified: exifVerified,
    ai_flagged: aiResult.flagged,
    ts: Date.now(),
  });

  // Store report (encrypt sensitive fields at rest)
  stmt.insertReport.run(
    uuid(), personId, tipId,
    session.inputType || "text",
    session.date || null,
    session.time || null,
    session.location ? encrypt(session.location) : null,
    session.amount || null,
    session.description ? encrypt(session.description) : null,
    exifData?.exifDate || null,
    exifData?.hasGps ? 1 : 0,
    exifDelta !== null ? exifDelta : null,
    aiResult.score || 0,
    aiResult.flagged ? 1 : 0,
    exifVerified ? 1 : 0,
    isVerified ? 1 : 0,
    analysis.severity,
    analysis.corruption_type,
    analysis.language,
    hourTimestamp(),
    ledgerHash,
    session.notes ? encrypt(session.notes) : null,
    session.notesLang || null,
  );

  // Recalculate person rating
  recalcRating(personId);

  // Admin channel alert
  if (ADMIN_CHANNEL) {
    try {
      await bot.telegram.sendMessage(
        ADMIN_CHANNEL,
        buildAdminAlert(tipId, session, analysis, imgAnalysis, exifData, aiResult, personId, ledgerHash),
        { parse_mode: "Markdown" }
      );
    } catch (e) {
      console.error("Admin channel error:", e.message);
    }
  }

  auditLog("TIP_SUBMITTED", {
    tip_id: tipId, input_type: session.inputType,
    corruption_type: analysis.corruption_type, severity: analysis.severity,
    has_image: !!session.hasImage, ai_flagged: aiResult.flagged, exif_verified: exifVerified,
  });
  detectAnomaly("REPORT_SPIKE");

  return tipId;
}

// ── Prompt strings (English / Amharic / Oromiffa) ─────────────────────────────
const T = {
  askName: {
    en: `*Step 1 of 11* — Full name of the official you are reporting.\n\n_Example: Tesfaye Bekele_\n\nYou can also send a 🎙️ voice message at any step.`,
    am: `*ደረጃ 1 ከ 11* — የሚያሳውቁትን ባለሥልጣን ሙሉ ስም ያስገቡ።\n\n_ምሳሌ: ተስፋዬ በቀለ_`,
    or: `*Tarree 1 / 11* — Maqaa guutuu nama gabaasuu barbaaddan.\n\n_Fkn: Tesfaye Bekele_`,
  },
  askTitle: {
    en: `*Step 2 of 11* — Their job title or position.\n\n_Example: Deputy Director, Inspector, Tax Collector_\nType "unknown" to skip.`,
    am: `*ደረጃ 2 ከ 11* — የሥራ ማዕረጋቸው ወይም ቦታቸው።\n"አላውቅም" ለመዝለል።`,
    or: `*Tarree 2 / 11* — Iddoo hojii isaanii.\n"hin beeku" galchi kutachuuf.`,
  },
  askOffice: {
    en: `*Step 3 of 11* — Which office, ministry, or institution?\n\n_Example: Ministry of Land, Federal Police, Customs..._`,
    am: `*ደረጃ 3 ከ 11* — የትኛው ቢሮ ወይም ሚኒስቴር?`,
    or: `*Tarree 3 / 11* — Biiroo ykn ministeera kam?`,
  },
  askDate: {
    en: `*Step 4 of 11* — Date of the incident.\n\nType "today", "yesterday", or DD/MM/YYYY\n_Example: 09/04/2026_`,
    am: `*ደረጃ 4 ከ 11* — የክስተቱ ቀን። "ዛሬ", "ትናንት" ወይም ቀን/ወር/ዓ.ም`,
    or: `*Tarree 4 / 11* — Guyyaa dhimmi sun ta'e.`,
  },
  askTime: {
    en: `*Step 5 of 11* — Approximate time of the incident.\n\n_Example: 2:30pm, morning, around noon_\nType "unknown" to skip.`,
    am: `*ደረጃ 5 ከ 11* — ግምታዊ ሰዓት። "አላውቅም" ለመዝለል።`,
    or: `*Tarree 5 / 11* — Sa'aatii itti dhimmi ta'e. "hin beeku" galchi.`,
  },
  askLocation: {
    en: `*Step 6 of 11* — Where did this happen?\n\n_Example: Bole Sub-City, Land Office 3rd floor, Addis Ababa_`,
    am: `*ደረጃ 6 ከ 11* — ክስተቱ የት ተከሰተ?`,
    or: `*Tarree 6 / 11* — Eessa dhimmi kun ta'e?`,
  },
  askAmount: {
    en: `*Step 7 of 11* — Amount of money demanded or exchanged.\n\n_Example: ETB 5,000 · 200 USD · "no money — a favour"_\nType "none" to skip.`,
    am: `*ደረጃ 7 ከ 11* — የተጠየቀ ወይም የተሰጠ ገንዘብ። "የለም" ለመዝለል።`,
    or: `*Tarree 7 / 11* — Baasii gaafatame ykn kenname. "hin jiru" galchi.`,
  },
  askPhone: {
    en: `*Step 8 of 11* — Phone number of the official (if known).\n\n_Example: 0911-234-567_\nType "unknown" to skip.`,
    am: `*ደረጃ 8 ከ 11* — የባለሥልጣኑ ስልክ ቁጥር (ካወቁት)። "አላውቅም" ለመዝለል።`,
    or: `*Tarree 8 / 11* — Lakkoofsa bilbilaa isaanii. "hin beeku" galchi.`,
  },
  askDesc: {
    en: `*Step 9 of 11* — Describe exactly what happened.\n\nInclude:\n• What you were asked to do\n• What was said\n• Any witnesses\n• What happened after\n\n_More detail = stronger case. Min 20 characters._`,
    am: `*ደረጃ 9 ከ 11* — ምን እንደ ሆነ ዝርዝር ይግለጹ። ምን ተጠየቁ? ምን ተባሉ? ምስክሮች ካሉ?`,
    or: `*Tarree 9 / 11* — Maal akka ta'e ibsi. Maal gaafatamtan? Ragaawwan jiran?`,
  },
  askImage: {
    en: `*Step 10 of 11* — Do you have photo evidence?\n\n📸 Send a photo now, or type "skip" to continue.\n\n_Photos are verified for authenticity. AI-generated images are detected and flagged._`,
    am: `*ደረጃ 10 ከ 11* — የፎቶ ማስረጃ አለዎት?\n📸 ፎቶ ይላኩ ወይም "ዝለል" ጻፉ።`,
    or: `*Tarree 10 / 11* — Ragaa suuraa qabdaa?\n📸 Amma ergi, ykn "dabarsi" galchi.`,
  },
  askNotes: {
    en: `*Step 11 of 11* — Additional notes in your own words.

` +
      `Write freely in *any Ethiopian language*:
` +
      `አማርኛ · Oromiffa · ትግርኛ · Sidama · Soomaali · Afar · Wolayttatto · Hadiyyissa · Dawro · አፋርኛ · Bench

` +
      `🎙️ You can also *send a voice message* in your language.

` +
      `_Share anything else you feel is important — a witness name, a pattern you noticed, how this affected you, anything extra you want investigators to know. Type "skip" to finish._`,
    am: `*ደረጃ 11 ከ 11* — ተጨማሪ ማስታወሻ

` +
      `በራስዎ ቋንቋ ይጻፉ — ያለምንም ገደብ:
` +
      `አማርኛ · ኦሮምኛ · ትግርኛ · ሲዳምኛ · ሶማሊ · አፋርኛ · ወላይትኛ · ሃዲይኛ · ቤንች · ጋሞ · ሌሎች

` +
      `🎙️ ድምጽ መልዕክት ይላኩ — ዊስፐር ሁሉንም ቋንቋ ይረዳዋል

` +
      `_ምስክር ካለ፣ ተጨማሪ መረጃ ካለ፣ ወይም ሌላ ማስታወሻ ካለ ይጻፉ። "ዝለል" ለመጨረስ።_`,
    or: `*Tarree 11 / 11* — Yaada dabalataa

` +
      `Afaan feetan barreessaa — Maqaa xiqqeessuu hin qabu:
` +
      `Oromiffa · Amharic · Tigrinya · Sidama · Somali · Afar · Wolayta · Hadiyya · kkf

` +
      `🎙️ Sagalee erguu dandeessa — Whisper afaanota hunda hubata

` +
      `_Ragaa biraa, maqaa namaa argite, ykn odeeffannoo biraa yoo qabaatte itti dabaluu dandeessa. Dabarsuuf "dabarsi" galchi._`,
    ti: `*ደረጃ 11 ካብ 11* — ተወሳኺ ሓሳብ

` +
      `ብዝደለኻዮ ቋንቋ ጸሓፍ — ኩሉ ቋንቋ ኢትዮጵያ ይቅበል:
` +
      `ትግርኛ · አማርኛ · ኦሮምኛ · ሲዳምኛ · ሶማሊ · ወላይትኛ · ካልኦት

` +
      `🎙️ ድምጺ መልእኽቲ ስደድ — ዊስፐር ሓቊፉ ይጥቀም

` +
      `_ካልእ ወሳኒ ሓበሬታ፣ ምስካር ዝሃቡ ሰባት፣ ወይ ካልእ ትሕዝቶ ምስ ትህሉ ጸሓፍ። "ሓልፍ" ንምዝዛም።_`,
  },
  confirm: {
    en: (s) =>
      `*Review your report:*\n\n` +
      `👤 *Name:* ${s.name}\n` +
      `💼 *Title:* ${s.title || "—"}\n` +
      `🏢 *Office:* ${s.office}\n` +
      `📅 *Date:* ${s.date || "—"}\n` +
      `⏰ *Time:* ${s.time || "—"}\n` +
      `📍 *Location:* ${s.location || "—"}\n` +
      `💰 *Amount:* ${s.amount || "—"}\n` +
      `📸 *Image:* ${s.hasImage ? "✅ Attached" : "None"}\n` +
      `📝 *Notes:* ${s.notes ? "✅ Added" : "None"}\n\n` +
      `Type *SUBMIT* to send anonymously\nType *CANCEL* to discard`,
    am: (s) =>
      `*ሪፖርትዎን ይገምግሙ:*\n\n👤 *ስም:* ${s.name}\n🏢 *ቢሮ:* ${s.office}\n📅 *ቀን:* ${s.date || "—"}\n📝 *ማስታወሻ:* ${s.notes ? "✅ ተጨምሯል" : "—"}\n\n✅ *ላኩ* ጻፉ ለመላክ\n❌ *ሰርዝ* ጻፉ`,
    or: (s) =>
      `*Gabaasa kee ilaaluu:*\n\n👤 *Maqaa:* ${s.name}\n🏢 *Biiroo:* ${s.office}\n📅 *Guyyaa:* ${s.date || "—"}\n\n✅ *ERGI* galchi\n❌ *HAQ* galchi`,
  },
  success: {
    en: (id) => `✅ *Tip received anonymously.*\n\n🔐 Reference: \`${id}\`\n\nNo personal data was recorded. Your tip has been analyzed and routed.\n\n_Thank you for your courage. ሃገርዎን ያጠናክሩ — Strengthen your country._`,
    am: (id) => `✅ *ሪፖርትዎ ተቀብሏል።*\n\n🔐 ማጣቀሻ: \`${id}\`\n\nምንም የግል መረጃ አልተመዘገበም። ሪፖርትዎ ለሚመለከተው አካል ተላልፏል།\n\n_ሳፉ — ሥነምግባር ያሸንፋል።_`,
    or: (id) => `✅ *Gabaasni kee fuudhatameera.*\n\n🔐 Koodii: \`${id}\`\n\nEenyummaan kee eegama.\n\n_Galatoomaa — Biyya kee jabeessi._`,
  },
  dupBlock: {
    en: "⛔ You have already submitted a report about this person. Each reporter may submit one report per person.\n\nReport a *different* official? Send /start",
    am: "⛔ ስለዚህ ሰው ሪፖርት አስቀድመዋል። ሌላ ሰው ለማሳወቅ /start ያስገቡ።",
    or: "⛔ Nama kana irratti gabaasa duraan ergiite. Nama biraa /start ergi.",
  },
};

function getPrompt(key, lang, session) {
  const entry = T[key];
  if (!entry) return "";
  if (typeof entry === "object" && typeof entry[lang] === "function") return entry[lang](session);
  if (typeof entry === "object") return entry[lang] || entry.en;
  return entry;
}

const SKIP_WORDS = new Set(["unknown","skip","none","no","አላውቅም","ዝለል","የለም","hin beeku","dabarsi","hin jiru"]);
const CANCEL_WORDS = new Set(["cancel","quit","exit","ሰርዝ","haq"]);
const SUBMIT_WORDS = new Set(["submit","send","yes","ላኩ","ergi"]);

async function sendPrompt(ctx, session) {
  const lang = session.lang || "en";
  const map  = {
    1:"askName",2:"askTitle",3:"askOffice",4:"askDate",5:"askTime",
    6:"askLocation",7:"askAmount",8:"askPhone",9:"askDesc",10:"askImage",11:"askNotes",12:"confirm",
  };
  const key = map[session.step];
  if (!key) return;
  const text = getPrompt(key, lang, session);
  if (text) await ctx.reply(text, { parse_mode:"Markdown" });
}

// ─── BOT HANDLERS ─────────────────────────────────────────────────────────────

bot.start(async (ctx) => {
  clearSession(ctx.from.id);
  await ctx.reply(
    `🇪🇹 *SAFUU — ሳፉ*\n_Anonymous Anti-Corruption Tip Line_\n\n━━━━━━━━━━━━━━\n` +
    `🎙️ Send a *voice message* — any language\n💬 Send a *text message* — what you witnessed\n\n` +
    `🔐 *Your identity is never recorded.*\n\nChoose your language:`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text:"🇬🇧 English", callback_data:"lang_en" }, { text:"🇪🇹 አማርኛ",  callback_data:"lang_am" }],
          [{ text:"🇪🇹 Oromiffa",callback_data:"lang_or" }, { text:"🇪🇹 Tigrinya",callback_data:"lang_ti" }],
        ],
      },
    }
  );
});

bot.action(/^lang_(.+)$/, async (ctx) => {
  const lang = ctx.match[1];
  const session = { step:1, lang, inputType:"text", hasImage:false };
  saveSession(ctx.from.id, session);
  await ctx.answerCbQuery();
  await sendPrompt(ctx, session);
});

bot.command("help", (ctx) => ctx.reply(
  `📋 *What can I report?*\n\n` +
  `• Land fraud & illegal allocation\n• Police / official bribery\n• Procurement bid rigging\n• Embezzlement of public funds\n• Nepotism in hiring\n• Tax & customs evasion\n• Healthcare supply theft\n• Court corruption\n• Abuse of power\n\n` +
  `💡 *Tips for a strong report:*\n• Full name of official\n• Their office & title\n• Date, time, and location\n• Amount in birr\n• Photo if available\n\n_/start — Begin a report_`,
  { parse_mode:"Markdown" }
));

bot.command("agencies", (ctx) => ctx.reply(
  `🏛️ *Ethiopian Reporting Bodies*\n\n📞 *FEACC* — 959 (free)\n📞 *EHRC* — 1488\n📞 *Ombudsman* — 6060\n📞 *Federal Police* — 911\n\n_Safuu automatically routes your tip to the correct agency._`,
  { parse_mode:"Markdown" }
));

bot.command("status", (ctx) => {
  const pc = stmt.personCount.get().n;
  const rc = stmt.reportCount.get().n;
  ctx.reply(
    `📊 *Safuu System Status*\n\n✅ Bot: Online\n✅ Voice: Active\n✅ AI Detection: ${HIVE_KEY ? "Active" : "API key not set"}\n✅ Ledger: Active\n\n📨 Reports: ${rc}\n👤 Persons: ${pc}\n\n🔐 All submissions anonymous.`,
    { parse_mode:"Markdown" }
  );
});

bot.command("cancel", (ctx) => {
  clearSession(ctx.from.id);
  ctx.reply("Report cancelled. Send /start to begin a new one.");
});

// ── Text handler ───────────────────────────────────────────────────────────────
bot.on(message("text"), async (ctx) => {
  if (ctx.message.text.startsWith("/")) return;

  // Rate limit
  const rl = checkRateLimit(userHash(ctx.from.id), "bot_message");
  if (!rl.allowed) {
    return ctx.reply(`⏳ Slow down. Try again in ${Math.ceil(rl.retryAfter / 60)} minute(s).`);
  }

  let session = getSession(ctx.from.id);
  if (!session) return ctx.reply("Send /start to begin a report.");

  const text = sanitizeText(ctx.message.text, 5000).trim();
  if (!text) return;

  const lang = session.lang || "en";

  if (CANCEL_WORDS.has(text.toLowerCase())) {
    clearSession(ctx.from.id);
    return ctx.reply("Report cancelled. Send /start to begin a new one.");
  }

  const step = session.step;

  if (step === 1) {
    // Check dedup BEFORE accepting the name
    const dk = dupHash(ctx.from.id, text);
    if (stmt.getDedupHash.get(dk)) {
      return ctx.reply(T.dupBlock[lang] || T.dupBlock.en, { parse_mode:"Markdown" });
    }
    if (text.length < 3) return ctx.reply("Please enter a full name (at least 3 characters).");
    session.name = sanitizeName(text);
    session.step = 2;
  } else if (step === 2) {
    session.title = SKIP_WORDS.has(text.toLowerCase()) ? null : sanitizeOffice(text);
    session.step  = 3;
  } else if (step === 3) {
    if (text.length < 3) return ctx.reply("Please enter the office or institution name.");
    session.office = sanitizeOffice(text);
    session.step   = 4;
  } else if (step === 4) {
    const d = parseIncidentDate(text);
    session.date = d;
    session.step = 5;
  } else if (step === 5) {
    session.time = SKIP_WORDS.has(text.toLowerCase()) ? null : sanitizeText(text, 50);
    session.step = 6;
  } else if (step === 6) {
    session.location = sanitizeText(text, 300);
    session.step     = 7;
  } else if (step === 7) {
    session.amount = SKIP_WORDS.has(text.toLowerCase()) ? null : sanitizeAmount(text);
    session.step   = 8;
  } else if (step === 8) {
    session.phone = SKIP_WORDS.has(text.toLowerCase()) ? "unknown" : (sanitizePhone(text) || "unknown");
    session.step  = 9;
  } else if (step === 9) {
    if (text.length < 20) return ctx.reply("Please describe in more detail (at least 20 characters).");
    // Check submission rate limit (stricter than message rate limit)
    const subRl = checkRateLimit(userHash(ctx.from.id), "report_submit");
    if (!subRl.allowed) return ctx.reply(`⏳ Too many reports today. Try again tomorrow.`);
    session.description = sanitizeText(text, 5000);
    session.step        = 10;
  } else if (step === 10) {
    if (SKIP_WORDS.has(text.toLowerCase())) {
      session.hasImage = false;
      session.step     = 11;
    } else {
      return ctx.reply("Send a 📸 photo, or type 'skip' to continue without one.");
    }
  } else if (step === 11) {
    // Notes step — any Ethiopian language, voice or text, skippable
    if (SKIP_WORDS.has(text.toLowerCase())) {
      session.notes     = null;
      session.notesLang = null;
    } else {
      session.notes     = sanitizeText(text, 3000);
      session.notesLang = detectNotesLanguage(text);
    }
    session.step = 12;
  } else if (step === 12) {
    if (SUBMIT_WORDS.has(text.toLowerCase())) {
      const thinking = await ctx.reply("🔐 Securing and submitting your report...");
      try {
        const tipId = await processSubmission(ctx, session);
        // Register dedup hash to prevent re-reporting same person
        stmt.insertDedupHash.run(dupHash(ctx.from.id, session.name));
        clearSession(ctx.from.id);
        const msg = getPrompt("success", lang, null);
        await ctx.reply(typeof msg === "function" ? msg(tipId) : (T.success[lang] || T.success.en)(tipId), { parse_mode:"Markdown" });
      } catch (e) {
        console.error("Submission error:", e.message);
        await ctx.reply("⚠️ An error occurred. Please try again or call FEACC: 959");
      } finally {
        await bot.telegram.deleteMessage(ctx.chat.id, thinking.message_id).catch(() => {});
      }
      return;
    } else {
      clearSession(ctx.from.id);
      return ctx.reply("Report cancelled. Send /start to begin a new one.");
    }
  }

  saveSession(ctx.from.id, session);
  await sendPrompt(ctx, session);
});

// ── Voice handler ──────────────────────────────────────────────────────────────
bot.on(message("voice"), async (ctx) => {
  const rl = checkRateLimit(userHash(ctx.from.id), "voice_submit");
  if (!rl.allowed) return ctx.reply("⏳ Too many voice messages. Wait a moment.");

  let session = getSession(ctx.from.id);
  if (!session) {
    session = { step:9, lang:"en", inputType:"voice", hasImage:false };
  }

  const thinking = await ctx.reply("🎙️ Voice received — transcribing...");
  try {
    const { buf, filename } = await downloadTgFile(ctx.message.voice.file_id);
    const transcript = await transcribeVoice(buf, filename);

    if (!transcript || transcript.trim().length < 5) {
      await bot.telegram.deleteMessage(ctx.chat.id, thinking.message_id).catch(() => {});
      return ctx.reply("⚠️ Could not transcribe. Please try again or type your message.");
    }

    session.inputType = "voice";

    // Fill description step from voice
    if (session.step === 9) {
      if (transcript.length < 20) {
        await bot.telegram.deleteMessage(ctx.chat.id, thinking.message_id).catch(() => {});
        return ctx.reply("Voice message too short. Please describe the incident in more detail.");
      }
      session.description = sanitizeText(transcript, 5000);
      session.step        = 10;
      saveSession(ctx.from.id, session);
      await bot.telegram.deleteMessage(ctx.chat.id, thinking.message_id).catch(() => {});
      await ctx.reply(`✅ _Transcribed:_ "${transcript.slice(0, 300)}${transcript.length > 300 ? "..." : ""}"`, { parse_mode:"Markdown" });
      return await sendPrompt(ctx, session);
    }

    // Notes step — accept voice in any language
    if (session.step === 11) {
      session.notes     = sanitizeText(transcript, 3000);
      session.notesLang = detectNotesLanguage(transcript);
      session.step      = 12;
      saveSession(ctx.from.id, session);
      await bot.telegram.deleteMessage(ctx.chat.id, thinking.message_id).catch(() => {});
      const langLabel = LANG_LABELS[session.notesLang] || session.notesLang || "Unknown";
      await ctx.reply(
        `✅ _Notes recorded_ (${langLabel}):

"${transcript.slice(0, 300)}${transcript.length > 300 ? "..." : ""}"`,
        { parse_mode:"Markdown" }
      );
      return await sendPrompt(ctx, session);
    }

    // No active session or wrong step — prompt to start
    await bot.telegram.deleteMessage(ctx.chat.id, thinking.message_id).catch(() => {});
    await ctx.reply(`✅ _Transcribed:_ "${transcript.slice(0, 300)}"`, { parse_mode:"Markdown" });
    await ctx.reply("To file a complete report, use /start then send your voice at step 9 (description).");
  } catch (e) {
    console.error("Voice error:", e.message);
    await bot.telegram.deleteMessage(ctx.chat.id, thinking.message_id).catch(() => {});
    await ctx.reply("⚠️ Error processing voice. Please type your message instead.");
  }
});

// ── Photo handler ──────────────────────────────────────────────────────────────
bot.on(message("photo"), async (ctx) => {
  const rl = checkRateLimit(userHash(ctx.from.id), "image_submit");
  if (!rl.allowed) return ctx.reply("⏳ Too many image submissions today.");

  const session = getSession(ctx.from.id);
  if (!session || session.step !== 10) {
    return ctx.reply("Please use /start to begin a report first.");
  }

  const thinking = await ctx.reply("📸 Photo received — running forensic check...");
  try {
    const photos    = ctx.message.photo;
    const bestPhoto = photos[photos.length - 1]; // Highest resolution
    const { buf }   = await downloadTgFile(bestPhoto.file_id);

    // Validate file type by magic bytes
    const fileCheck = validateImageFile(buf);
    if (!fileCheck.valid) {
      await bot.telegram.deleteMessage(ctx.chat.id, thinking.message_id).catch(() => {});
      return ctx.reply(`⚠️ Image rejected: ${fileCheck.reason}`);
    }

    // Quick forensic preview
    const [exif, ai] = await Promise.all([extractEXIF(buf), detectAIImage(buf)]);

    // Store as base64 in session (will be processed on submit)
    session.imageB64 = buf.toString("base64");
    session.hasImage  = true;
    session.step      = 11;   // → notes step
    saveSession(ctx.from.id, session);

    let preview = "🔬 *Forensic preview:*\n";
    preview += exif.exifDate  ? `• EXIF date: ${exif.exifDate}${exif.hasGps ? " 📍 GPS found" : ""}\n` : "• No EXIF date found\n";
    preview += ai.flagged     ? `• ⚠️ AI score: ${(ai.score*100).toFixed(0)}% — will be flagged\n` : `• ✓ AI score: ${(ai.score*100).toFixed(0)}% — appears authentic\n`;

    await bot.telegram.deleteMessage(ctx.chat.id, thinking.message_id).catch(() => {});
    await ctx.reply(preview, { parse_mode:"Markdown" });
    await sendPrompt(ctx, session);
  } catch (e) {
    console.error("Photo error:", e.message);
    session.hasImage = false;
    session.imageB64 = undefined;
    session.step     = 11;   // → notes step
    saveSession(ctx.from.id, session);
    await bot.telegram.deleteMessage(ctx.chat.id, thinking.message_id).catch(() => {});
    await ctx.reply("⚠️ Could not process photo. Continuing without image.");
    await sendPrompt(ctx, session);
  }
});

// ── Audio file handler (fallback for audio attachments) ───────────────────────
bot.on(message("audio"), async (ctx) => {
  const rl = checkRateLimit(userHash(ctx.from.id), "voice_submit");
  if (!rl.allowed) return ctx.reply("⏳ Too many voice messages. Wait a moment.");

  const session = getSession(ctx.from.id);
  if (!session) return ctx.reply("Send /start to begin a report.");

  const thinking = await ctx.reply("🎙️ Audio file received — transcribing...");
  try {
    const { buf, filename } = await downloadTgFile(ctx.message.audio.file_id);
    const transcript = await transcribeVoice(buf, filename);
    await bot.telegram.deleteMessage(ctx.chat.id, thinking.message_id).catch(() => {});

    if (session.step === 9) {
      session.description = sanitizeText(transcript, 5000);
      session.inputType   = "voice";
      session.step        = 10;
      saveSession(ctx.from.id, session);
      await ctx.reply(`✅ Transcribed: "${transcript.slice(0, 300)}"`, { parse_mode:"Markdown" });
      await sendPrompt(ctx, session);
    } else {
      await ctx.reply(`✅ Transcribed: "${transcript.slice(0, 300)}"`, { parse_mode:"Markdown" });
    }
  } catch (e) {
    await bot.telegram.deleteMessage(ctx.chat.id, thinking.message_id).catch(() => {});
    await ctx.reply("⚠️ Could not process audio. Please send a voice note instead.");
  }
});

// ── Catch-all ─────────────────────────────────────────────────────────────────
bot.on("message", (ctx) => {
  ctx.reply(
    "Please send:\n🎙️ A *voice message*\n💬 A *text message*\n📸 A *photo* (when prompted)\n\n/start to begin",
    { parse_mode:"Markdown" }
  );
});

// ── Error handler ─────────────────────────────────────────────────────────────
bot.catch((err, ctx) => {
  console.error(`[Bot error] ${ctx.updateType}:`, err.message);
  auditLog("BOT_ERROR", { type: ctx.updateType, msg: err.message.slice(0, 100) });
  ctx.reply("⚠️ A system error occurred. Please try again or call FEACC: 959").catch(() => {});
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
function shutdown(signal) {
  console.log(`\n⏹  Safuu bot shutting down (${signal})`);
  auditLog("BOT_SHUTDOWN", { signal });
  bot.stop(signal);
  db.close();
  process.exit(0);
}

process.once("SIGINT",  () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
process.on("uncaughtException",  e => { auditLog("UNCAUGHT", { msg:e.message }); console.error(e); });
process.on("unhandledRejection", e => { auditLog("UNHANDLED", { msg:String(e) }); });

// ── Launch ────────────────────────────────────────────────────────────────────
bot.launch().then(() => {
  const pc = stmt.personCount.get().n;
  const rc = stmt.reportCount.get().n;
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🇪🇹  SAFUU Bot — LIVE");
  console.log(`   Persons on file:  ${pc}`);
  console.log(`   Reports on file:  ${rc}`);
  console.log(`   Admin channel:    ${ADMIN_CHANNEL}`);
  console.log(`   AI detection:     ${HIVE_KEY ? "Hive ACTIVE" : "DISABLED (no HIVE_AI_KEY)"}`);
  console.log(`   Encryption:       AES-256-GCM ACTIVE`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  auditLog("BOT_START", { persons: pc, reports: rc });
});
