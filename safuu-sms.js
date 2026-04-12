// ═══════════════════════════════════════════════════════════════════════════
//  SAFUU SMS SERVER  |  safuu-sms.js
//  Africa's Talking integration — reports via SMS shortcode
//  Format: SAFUU [Name] | [Office] | [What happened]
//  Uses native fetch (Node >= 18) — no node-fetch dependency
// ═══════════════════════════════════════════════════════════════════════════
"use strict";

require("dotenv").config();

// All imports at top
const express    = require("express");
const Database   = require("better-sqlite3");
const Anthropic  = require("@anthropic-ai/sdk");
const crypto     = require("crypto");
const { v4: uuid } = require("uuid");
const fs         = require("fs");

const {
  sanitizeText, sanitizeName, sanitizeOffice,
  checkRateLimit, auditLog,
  encrypt,
} = require("./safuu-security");

// ── Env check ─────────────────────────────────────────────────────────────────
["ANTHROPIC_API_KEY","DEDUP_SALT","ADMIN_CHANNEL_ID","TELEGRAM_BOT_TOKEN"].forEach(k => {
  if (!process.env[k]) console.warn(`⚠  Missing env var: ${k} — some features disabled`);
});

const PORT       = parseInt(process.env.SMS_PORT || "3002", 10);
const DEDUP_SALT = process.env.DEDUP_SALT || "safuu_sms_salt";

// ── Africa's Talking setup ────────────────────────────────────────────────────
// Only initialise AT if keys are present (graceful degradation)
let sms = null;
if (process.env.AT_API_KEY && process.env.AT_USERNAME) {
  try {
    const AfricasTalking = require("africastalking");
    const AT = AfricasTalking({ apiKey: process.env.AT_API_KEY, username: process.env.AT_USERNAME });
    sms = AT.SMS;
  } catch (e) {
    console.warn("⚠  Africa's Talking init failed:", e.message);
  }
}

// ── Claude client ──────────────────────────────────────────────────────────────
const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Database ──────────────────────────────────────────────────────────────────
if (!fs.existsSync("./data")) fs.mkdirSync("./data", { recursive: true });

const db = new Database("./data/safuu.db");
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ── Ensure schema exists (shared with bot) ────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS persons (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, name_phonetic TEXT,
    title TEXT, office TEXT, region TEXT, phone TEXT,
    report_count INTEGER DEFAULT 0, verified_count INTEGER DEFAULT 0,
    rating REAL DEFAULT 0, severity TEXT DEFAULT 'Low', status TEXT DEFAULT 'Monitoring',
    first_seen TEXT, last_seen TEXT, created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY, person_id TEXT, tip_id TEXT UNIQUE NOT NULL,
    input_type TEXT, incident_date TEXT, incident_time TEXT,
    location TEXT, amount TEXT, description TEXT,
    exif_date TEXT, exif_gps INTEGER DEFAULT 0, exif_delta_days INTEGER,
    ai_score REAL DEFAULT 0, ai_flagged INTEGER DEFAULT 0,
    exif_verified INTEGER DEFAULT 0, is_verified INTEGER DEFAULT 0,
    severity TEXT, corruption_type TEXT, language TEXT,
    timestamp_hour TEXT, ledger_hash TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS dedup_hashes (
    hash TEXT PRIMARY KEY, created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS ledger (
    seq INTEGER PRIMARY KEY AUTOINCREMENT, tip_id TEXT, event TEXT,
    payload_hash TEXT, prev_hash TEXT, block_hash TEXT,
    ts TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_persons_ph ON persons(name_phonetic);
`);

// ── Prepared statements ───────────────────────────────────────────────────────
const stmt = {
  getDup:      db.prepare("SELECT hash FROM dedup_hashes WHERE hash=?"),
  insertDup:   db.prepare("INSERT OR IGNORE INTO dedup_hashes (hash) VALUES (?)"),
  findPerson:  db.prepare("SELECT id FROM persons WHERE name_phonetic=? AND LOWER(office) LIKE ?"),
  insertPerson:db.prepare("INSERT OR IGNORE INTO persons (id,name,name_phonetic,office,first_seen,report_count) VALUES (?,?,?,?,datetime('now'),0)"),
  bumpPerson:  db.prepare("UPDATE persons SET report_count=report_count+1, last_seen=datetime('now') WHERE id=?"),
  insertReport:db.prepare(`INSERT INTO reports (id,person_id,tip_id,input_type,description,corruption_type,severity,language,timestamp_hour,is_verified,ledger_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?)`),
  lastLedger:  db.prepare("SELECT block_hash FROM ledger ORDER BY seq DESC LIMIT 1"),
  insertLedger:db.prepare("INSERT INTO ledger (tip_id,event,payload_hash,prev_hash,block_hash) VALUES (?,?,?,?,?)"),
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function generateTipId() {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return "TIP-" + Array.from({ length: 8 }, () => c[Math.floor(Math.random() * c.length)]).join("");
}

function hashPhone(phone) {
  // One-way — never store raw phone numbers
  return crypto.createHash("sha256")
    .update(`${DEDUP_SALT}:sms_phone:${phone}`).digest("hex").slice(0, 24);
}

function dupHash(phone, personName) {
  return crypto.createHash("sha256")
    .update(`${DEDUP_SALT}:smsdup:${phone}:${personName.toLowerCase().trim()}`).digest("hex");
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

// ── Language detection (simple heuristic) ─────────────────────────────────────
function detectLang(text) {
  if (/[\u1200-\u137F]/.test(text)) return "am";
  if (/\b(fi|irratti|ta'e|hin|yoo|danda)\b/i.test(text)) return "or";
  return "en";
}

// ── SMS tip parser ─────────────────────────────────────────────────────────────
// Supports: SAFUU Name | Office | Description
// Fallback: SAFUU FirstName LastName OfficeWord1 OfficeWord2 rest...
function parseSms(body) {
  const cleaned = body.replace(/^SAFUU\s*/i, "").trim();
  const parts   = cleaned.split("|").map(s => s.trim()).filter(Boolean);

  if (parts.length >= 3) {
    return {
      name:        sanitizeName(parts[0]),
      office:      sanitizeOffice(parts[1]),
      description: sanitizeText(parts.slice(2).join(" | "), 2000),
    };
  }
  if (parts.length === 2) {
    return {
      name:        sanitizeName(parts[0]),
      office:      sanitizeOffice(parts[1]),
      description: parts[1], // minimal
    };
  }

  // Heuristic fallback for space-only format
  const words = cleaned.split(/\s+/);
  return {
    name:        sanitizeName(words.slice(0, 2).join(" ")),
    office:      sanitizeOffice(words.slice(2, 5).join(" ") || "Unknown"),
    description: sanitizeText(words.slice(5).join(" ") || cleaned, 2000),
  };
}

// ── Claude analysis (lean — SMS tips are shorter) ──────────────────────────────
async function analyzeSmsTip(text) {
  try {
    const res = await claude.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      system: `Ethiopian anti-corruption analyst. Respond ONLY as JSON (no markdown):
{"corruption_type":"Bribery|Land Fraud|Extortion|Procurement Fraud|Embezzlement|Nepotism|Tax Evasion|Police Misconduct|Other","severity":"Low|Medium|High|Critical","agency":"FEACC|Federal Police|OFAG|Ombudsman|EHRC","summary":"1 sentence","language":"English|Amharic|Oromiffa|Tigrinya"}`,
      messages: [{ role: "user", content: text }],
    });
    return JSON.parse(res.content[0].text);
  } catch {
    return { corruption_type:"Other", severity:"Medium", agency:"FEACC", summary:text.slice(0,80), language:"Unknown" };
  }
}

// ── Person upsert (matches bot logic) ──────────────────────────────────────────
function upsertPerson(name, office) {
  const ph  = phonetic(name);
  const key = `%${office.split(" ")[0].toLowerCase()}%`;
  const existing = stmt.findPerson.get(ph, key);
  const personId = existing?.id || uuid();
  if (!existing) {
    stmt.insertPerson.run(personId, name, ph, office);
  } else {
    stmt.bumpPerson.run(personId);
  }
  return personId;
}

// ── Ledger seal ────────────────────────────────────────────────────────────────
function sealLedger(tipId, payload) {
  const hash  = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  const prev  = stmt.lastLedger.get();
  const prevH = prev?.block_hash || "GENESIS";
  const block = crypto.createHash("sha256").update(`${tipId}:${hash}:${prevH}:${Date.now()}`).digest("hex");
  stmt.insertLedger.run(tipId, "SMS_REPORT", hash, prevH, block);
  return block;
}

// ── Reply builder ──────────────────────────────────────────────────────────────
function buildReply(tipId, lang, analysis) {
  const msgs = {
    en: `SAFUU: Tip received. Ref: ${tipId}. Identity protected - no data stored. Routed to ${analysis.agency}. For full report use Telegram: t.me/SafuuEthBot`,
    am: `ሳፉ: ሪፖርት ደርሷል። ማጣቀሻ: ${tipId}። ማንነትዎ ተጠብቋል። ለ ${analysis.agency} ተላልፏል።`,
    or: `SAFUU: Gabaasni fuudhatame. Koodii: ${tipId}. Eenyummaan kee eegama. ${analysis.agency} bira geessineerra.`,
  };
  return msgs[lang] || msgs.en;
}

// ── Notify admin via Telegram (native fetch — no node-fetch) ───────────────────
async function notifyAdmin(tipId, parsed, analysis, ledgerHash) {
  const tok = process.env.TELEGRAM_BOT_TOKEN;
  const ch  = process.env.ADMIN_CHANNEL_ID;
  if (!tok || !ch) return;

  const SEV = { Low:"🟡", Medium:"🟠", High:"🔴", Critical:"🚨" };
  const msg = `📱 *SAFUU — SMS TIP*\n\n🔐 Ref: \`${tipId}\`\n🔗 Ledger: \`${ledgerHash.slice(0,16)}...\`\n👤 ${parsed.name}\n🏢 ${parsed.office}\n🏷️ ${analysis.corruption_type} · ${SEV[analysis.severity]||"⚪"} ${analysis.severity}\n🏛️ Route: ${analysis.agency}\n\n_${parsed.description.slice(0, 300)}_\n\n⚠️ _SMS submitter: identity never stored_`;

  try {
    await fetch(`https://api.telegram.org/bot${tok}/sendMessage`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ chat_id: ch, text: msg, parse_mode: "Markdown" }),
      signal:  AbortSignal.timeout(10000),
    });
  } catch (e) {
    console.warn("Admin notify error:", e.message);
  }
}

// ── Express app ────────────────────────────────────────────────────────────────
const app = express();
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(express.json({ limit: "10kb" }));

// Security headers
app.use((req, res, next) => {
  res.removeHeader("X-Powered-By");
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});

// ── Incoming SMS webhook ───────────────────────────────────────────────────────
app.post("/sms/incoming", async (req, res) => {
  // Africa's Talking sends: from, text, to, date, id
  const { from, text } = req.body;

  if (!from || !text) return res.sendStatus(400);

  // Sanitise inputs
  const rawText = sanitizeText(String(text), 500);
  const rawFrom = String(from).replace(/[^0-9+]/g, "").slice(0, 20);

  console.log(`📱 SMS from ${rawFrom.slice(0, -4)}XXXX: ${rawText.slice(0, 60)}...`);

  // Usage instructions if not a SAFUU command
  if (!rawText.toUpperCase().trimStart().startsWith("SAFUU")) {
    const usage = "SAFUU: To report, text: SAFUU [Name] | [Office] | [What happened]\nExample: SAFUU Abebe Girma | Bole Police | Asked 2000 birr at checkpoint";
    if (sms) {
      await sms.send({ to:[rawFrom], message:usage, from:process.env.AT_SMS_FROM||"SAFUU" }).catch(()=>{});
    }
    return res.sendStatus(200);
  }

  // Rate limit by hashed phone
  const phoneKey = hashPhone(rawFrom);
  const rl = checkRateLimit(phoneKey, "sms_submit");
  if (!rl.allowed) {
    if (sms) {
      await sms.send({ to:[rawFrom], message:"SAFUU: Too many reports today. Try again tomorrow.", from:process.env.AT_SMS_FROM||"SAFUU" }).catch(()=>{});
    }
    return res.sendStatus(200);
  }

  const parsed = parseSms(rawText);
  const lang   = detectLang(rawText);
  const tipId  = generateTipId();
  const dk     = dupHash(rawFrom, parsed.name);

  // Dedup check
  if (stmt.getDup.get(dk)) {
    const dupMsg = {
      en: "SAFUU: You already reported this official. One report per person allowed.",
      am: "ሳፉ: ስለዚህ ሰው ሪፖርት አስቀድመዋል።",
      or: "SAFUU: Nama kana irratti gabaasa duraan ergiite.",
    }[lang] || "SAFUU: Duplicate report blocked.";
    if (sms) {
      await sms.send({ to:[rawFrom], message:dupMsg, from:process.env.AT_SMS_FROM||"SAFUU" }).catch(()=>{});
    }
    return res.sendStatus(200);
  }

  // Analyze
  const analysis = await analyzeSmsTip(
    `Name: ${parsed.name}\nOffice: ${parsed.office}\nDescription: ${parsed.description}`
  );

  // Persist
  const personId   = upsertPerson(parsed.name, parsed.office);
  const ledgerHash = sealLedger(tipId, {
    name: parsed.name, office: parsed.office,
    type: analysis.corruption_type, ts: Date.now(),
  });

  stmt.insertReport.run(
    uuid(), personId, tipId, "sms",
    encrypt(parsed.description),   // Encrypted at rest
    analysis.corruption_type, analysis.severity,
    analysis.language, hourTimestamp(),
    0, ledgerHash,
  );

  stmt.insertDup.run(dk);

  auditLog("SMS_TIP_RECEIVED", {
    tip_id: tipId, severity: analysis.severity,
    corruption_type: analysis.corruption_type, agency: analysis.agency,
  });

  // Reply to user
  const reply = buildReply(tipId, lang, analysis);
  if (sms) {
    await sms.send({ to:[rawFrom], message:reply, from:process.env.AT_SMS_FROM||"SAFUU" })
      .catch(e => console.warn("SMS reply error:", e.message));
  }

  // Notify admin Telegram channel (async, non-blocking)
  notifyAdmin(tipId, parsed, analysis, ledgerHash).catch(() => {});

  console.log(`✅ SMS tip stored: ${tipId} — ${parsed.name} — ${analysis.corruption_type}`);
  res.sendStatus(200);
});

// ── Delivery report webhook ────────────────────────────────────────────────────
app.post("/sms/delivery", (req, res) => {
  const { id, status } = req.body;
  if (id && status) {
    auditLog("SMS_DELIVERY", { id: String(id).slice(0, 20), status: String(status).slice(0, 20) });
  }
  res.sendStatus(200);
});

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/sms/health", (req, res) => {
  res.json({ status: "ok", service: "SAFUU SMS", at_configured: !!sms });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("SMS server error:", err.message);
  res.sendStatus(200); // Always ACK to AT to prevent retries
});

// ── Shutdown ──────────────────────────────────────────────────────────────────
function shutdown(signal) {
  console.log(`\n⏹  Safuu SMS shutting down (${signal})`);
  db.close(); process.exit(0);
}
process.once("SIGINT",  () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, "127.0.0.1", () => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📱  SAFUU SMS Server — 127.0.0.1:${PORT}`);
  console.log(`   Incoming: POST /sms/incoming`);
  console.log(`   Delivery: POST /sms/delivery`);
  console.log(`   AT: ${sms ? `Configured (${process.env.AT_USERNAME})` : "NOT CONFIGURED"}`);
  console.log(`   Format: SAFUU [Name] | [Office] | [Description]`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});
