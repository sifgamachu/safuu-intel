// ═══════════════════════════════════════════════════════════════════════════
//  SAFUU SECURITY CORE  |  safuu-security.js
//  Requires Node >= 18 (native fetch, crypto.timingSafeEqual stable)
// ═══════════════════════════════════════════════════════════════════════════
"use strict";

const crypto  = require("crypto");
const fs      = require("fs");
const Database = require("better-sqlite3");

// ── Constants ─────────────────────────────────────────────────────────────────
const SEC = {
  ALGO:          "aes-256-gcm",
  KEY_LEN:       32,
  IV_LEN:        16,
  TAG_LEN:       16,
  PBKDF2_ITER:   310_000,
  PBKDF2_DIGEST: "sha512",

  LIMITS: {
    report_submit:  { max: 3,   window: 86400 },
    voice_submit:   { max: 5,   window: 3600  },
    image_submit:   { max: 10,  window: 86400 },
    bot_message:    { max: 30,  window: 60    },
    api_request:    { max: 120, window: 60    },
    api_escalate:   { max: 10,  window: 3600  },
    failed_auth:    { max: 5,   window: 900   },
    sms_submit:     { max: 2,   window: 86400 },
  },

  MAX_TEXT_LEN:   5000,
  MAX_NAME_LEN:   120,
  MAX_OFFICE_LEN: 200,
  MAX_AMOUNT_LEN: 80,
  MAX_PHONE_LEN:  20,
  MAX_FILE_MB:    10,
  MAX_VOICE_MB:   20,
  SESSION_TIMEOUT: 1800,
  NONCE_TTL:       300,

  // Magic bytes for file validation
  IMAGE_MAGIC: {
    "ffd8ff":   "image/jpeg",
    "89504e47": "image/png",
    "47494638": "image/gif",
    "52494646": "image/webp",
  },
  AUDIO_MAGIC: {
    "4f676753": "audio/ogg",
    "494433":   "audio/mpeg",
    "fffb":     "audio/mpeg",
    "fff3":     "audio/mpeg",
    "fff2":     "audio/mpeg",
    "52494646": "audio/wav",
    "664c6143": "audio/flac",
  },
};

// ── Key derivation ─────────────────────────────────────────────────────────────
let _encKey = null;
function getEncKey() {
  if (_encKey) return _encKey;
  const master = process.env.ENCRYPTION_MASTER_KEY;
  if (!master || master.length < 32) {
    throw new Error("ENCRYPTION_MASTER_KEY must be ≥ 32 chars. Run: openssl rand -hex 32");
  }
  const salt = process.env.ENCRYPTION_SALT || "safuu_kdf_salt_v1";
  _encKey = crypto.pbkdf2Sync(master, salt, SEC.PBKDF2_ITER, SEC.KEY_LEN, SEC.PBKDF2_DIGEST);
  return _encKey;
}

// ── AES-256-GCM ───────────────────────────────────────────────────────────────
function encrypt(plaintext) {
  if (plaintext == null) return null;
  const key  = getEncKey();
  const iv   = crypto.randomBytes(SEC.IV_LEN);
  const cipher = crypto.createCipheriv(SEC.ALGO, key, iv);
  const enc  = Buffer.concat([cipher.update(String(plaintext), "utf8"), cipher.final()]);
  const tag  = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

function decrypt(ciphertext) {
  if (!ciphertext) return null;
  try {
    const key  = getEncKey();
    const buf  = Buffer.from(ciphertext, "base64");
    const iv   = buf.subarray(0, SEC.IV_LEN);
    const tag  = buf.subarray(SEC.IV_LEN, SEC.IV_LEN + SEC.TAG_LEN);
    const data = buf.subarray(SEC.IV_LEN + SEC.TAG_LEN);
    const dec  = crypto.createDecipheriv(SEC.ALGO, key, iv);
    dec.setAuthTag(tag);
    return Buffer.concat([dec.update(data), dec.final()]).toString("utf8");
  } catch {
    return null; // Auth tag mismatch or corrupt data
  }
}

// ── Input sanitisation ─────────────────────────────────────────────────────────
function sanitizeText(input, maxLen = SEC.MAX_TEXT_LEN) {
  if (typeof input !== "string") return "";
  return input
    .normalize("NFKC")
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim()
    .slice(0, maxLen);
}

const sanitizeName   = (s) => sanitizeText(s, SEC.MAX_NAME_LEN).replace(/[<>{}[\]\\]/g, "");
const sanitizeOffice = (s) => sanitizeText(s, SEC.MAX_OFFICE_LEN).replace(/[<>{}[\]\\]/g, "");
const sanitizeAmount = (s) => sanitizeText(s, SEC.MAX_AMOUNT_LEN).replace(/[<>{}[\]`]/g, "");

function sanitizePhone(input) {
  if (!input) return null;
  const c = sanitizeText(input, SEC.MAX_PHONE_LEN).replace(/[^0-9+\-\s()ext]/gi, "");
  return c.length >= 5 ? c : null;
}

function validateDate(input) {
  const s = sanitizeText(input, 20);
  if (/^(today|yesterday|ዛሬ|ትናንት|har'a|kaleessa)$/i.test(s)) return s;
  // Validate DD/MM/YYYY with real month/day range
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const day = parseInt(m[1], 10), mon = parseInt(m[2], 10), yr = parseInt(m[3], 10);
    if (mon >= 1 && mon <= 12 && day >= 1 && day <= 31 && yr >= 2000 && yr <= 2100) return s;
    return null;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return null;
}

// ── File magic validation ──────────────────────────────────────────────────────
function _matchMagic(buf, table) {
  const h8 = buf.subarray(0, 4).toString("hex");
  for (const [magic, mime] of Object.entries(table)) {
    if (h8.startsWith(magic)) return { valid: true, mime };
  }
  return { valid: false, mime: null };
}

function validateImageFile(buf) {
  if (!buf || buf.length < 4)                              return { valid:false, reason:"Too small" };
  if (buf.length > SEC.MAX_FILE_MB * 1024 * 1024)         return { valid:false, reason:`Exceeds ${SEC.MAX_FILE_MB}MB` };
  const r = _matchMagic(buf, SEC.IMAGE_MAGIC);
  return r.valid ? r : { valid:false, reason:"Only JPEG/PNG/GIF/WebP allowed" };
}

function validateAudioFile(buf) {
  if (!buf || buf.length < 4)                              return { valid:false, reason:"Too small" };
  if (buf.length > SEC.MAX_VOICE_MB * 1024 * 1024)        return { valid:false, reason:`Exceeds ${SEC.MAX_VOICE_MB}MB` };
  const r = _matchMagic(buf, SEC.AUDIO_MAGIC);
  return r.valid ? r : { valid:false, reason:"Unsupported audio format" };
}

// ── Telegram webhook verification ──────────────────────────────────────────────
function verifyTelegramWebhook(req) {
  const secret = req.headers["x-telegram-bot-api-secret-token"];
  if (!secret) return true; // Header only present when secret is configured
  const token  = process.env.TELEGRAM_BOT_TOKEN || "";
  const key    = crypto.createHash("sha256").update(token).digest();
  const body   = JSON.stringify(req.body);
  const hmac   = crypto.createHmac("sha256", key).update(body).digest("hex");
  try { return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(secret)); }
  catch { return false; }
}

// Africa's Talking webhook verification
function verifyATWebhook(req) {
  const webhookSecret = process.env.AT_WEBHOOK_SECRET;
  if (!webhookSecret) return true;
  const sig  = req.headers["x-africastalking-signature"] || "";
  const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
  const exp  = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex");
  try { return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(exp, "hex")); }
  catch { return false; }
}

// ── Rate limiter (SQLite sliding window, lazy initialised) ─────────────────────
let _rateDb = null;
function getRateDb() {
  if (_rateDb) return _rateDb;
  if (!fs.existsSync("./data")) fs.mkdirSync("./data", { recursive: true });
  _rateDb = new Database("./data/rate_limits.db");
  _rateDb.pragma("journal_mode = WAL");
  _rateDb.exec(`
    CREATE TABLE IF NOT EXISTS rate_events (
      key TEXT NOT NULL, ts INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_rate ON rate_events(key, ts);
    CREATE TABLE IF NOT EXISTS blocked_keys (
      key TEXT PRIMARY KEY, blocked_until INTEGER NOT NULL, reason TEXT
    );
  `);
  return _rateDb;
}

function checkRateLimit(key, action) {
  const cfg = SEC.LIMITS[action];
  if (!cfg) return { allowed: true };
  const rdb  = getRateDb();
  const now  = Math.floor(Date.now() / 1000);
  const since = now - cfg.window;

  const blocked = rdb.prepare("SELECT blocked_until FROM blocked_keys WHERE key=? AND blocked_until>?").get(key, now);
  if (blocked) return { allowed: false, reason: "Rate limit exceeded", retryAfter: blocked.blocked_until - now };

  rdb.prepare("DELETE FROM rate_events WHERE ts<?").run(since);
  const count = rdb.prepare("SELECT COUNT(*) as n FROM rate_events WHERE key=? AND ts>=?").get(key, since).n;

  if (count >= cfg.max) {
    rdb.prepare("INSERT OR REPLACE INTO blocked_keys (key,blocked_until,reason) VALUES (?,?,?)").run(key, now + cfg.window, action);
    auditLog("RATE_LIMIT_EXCEEDED", { key_prefix: key.slice(0,8), action, count });
    return { allowed: false, reason: `Too many ${action} attempts`, retryAfter: cfg.window };
  }

  rdb.prepare("INSERT INTO rate_events (key,ts) VALUES (?,?)").run(key, now);
  return { allowed: true, remaining: cfg.max - count - 1 };
}

function clearRateLimit(key) {
  const rdb = getRateDb();
  rdb.prepare("DELETE FROM blocked_keys WHERE key=?").run(key);
  rdb.prepare("DELETE FROM rate_events WHERE key=?").run(key);
}

// ── Nonce (replay attack prevention) ──────────────────────────────────────────
const _nonceStore = new Map();
function createNonce() {
  const nonce = crypto.randomBytes(16).toString("hex");
  _nonceStore.set(nonce, Date.now());
  const cutoff = Date.now() - SEC.NONCE_TTL * 1000;
  for (const [k, v] of _nonceStore) if (v < cutoff) _nonceStore.delete(k);
  return nonce;
}
function verifyNonce(nonce) {
  if (!nonce || !_nonceStore.has(nonce)) return false;
  const ts = _nonceStore.get(nonce);
  _nonceStore.delete(nonce);
  return (Date.now() - ts) < SEC.NONCE_TTL * 1000;
}

// ── JWT (HS256) ────────────────────────────────────────────────────────────────
function generateJWT(payload, expirySeconds = 3600) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error("JWT_SECRET must be ≥ 32 chars");
  const header = Buffer.from(JSON.stringify({ alg:"HS256", typ:"JWT" })).toString("base64url");
  const now    = Math.floor(Date.now() / 1000);
  const claims = Buffer.from(JSON.stringify({
    ...payload, exp: now + expirySeconds, iat: now, jti: crypto.randomBytes(8).toString("hex"),
  })).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(`${header}.${claims}`).digest("base64url");
  return `${header}.${claims}.${sig}`;
}

function verifyJWT(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const secret = process.env.JWT_SECRET || "";
    const parts  = token.split(".");
    if (parts.length !== 3) return null;
    const [header, claims, sig] = parts;
    const expected = crypto.createHmac("sha256", secret).update(`${header}.${claims}`).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(claims, "base64url").toString("utf8"));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

// ── Audit log (tamper-evident, no PII) ────────────────────────────────────────
let _auditDb = null;
function getAuditDb() {
  if (_auditDb) return _auditDb;
  if (!fs.existsSync("./data")) fs.mkdirSync("./data", { recursive: true });
  _auditDb = new Database("./data/audit.db");
  _auditDb.pragma("journal_mode = WAL");
  _auditDb.exec(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      ts         TEXT DEFAULT (datetime('now')),
      ts_unix    INTEGER,
      event      TEXT NOT NULL,
      meta       TEXT,
      prev_hash  TEXT,
      entry_hash TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_audit_ts    ON audit_log(ts_unix);
    CREATE INDEX IF NOT EXISTS idx_audit_event ON audit_log(event);
  `);
  return _auditDb;
}

// Fields we never write to logs
const PII_FIELDS = new Set(["phone","name","username","first_name","last_name","email","user_id","description","transcript","location"]);

function auditLog(event, meta = {}) {
  try {
    const adb      = getAuditDb();
    const safeMeta = Object.fromEntries(Object.entries(meta).filter(([k]) => !PII_FIELDS.has(k.toLowerCase())));
    const prev     = adb.prepare("SELECT entry_hash FROM audit_log ORDER BY id DESC LIMIT 1").get();
    const prevHash = prev?.entry_hash || "GENESIS";
    const tsUnix   = Math.floor(Date.now() / 1000);
    const str      = JSON.stringify({ event, meta: safeMeta, ts: tsUnix, prev: prevHash });
    const hash     = crypto.createHash("sha256").update(str).digest("hex");
    adb.prepare("INSERT INTO audit_log (ts_unix,event,meta,prev_hash,entry_hash) VALUES (?,?,?,?,?)")
       .run(tsUnix, event, JSON.stringify(safeMeta), prevHash, hash);
  } catch (e) {
    console.error("[AUDIT ERROR]", e.message);
  }
}

// ── Intrusion detection ────────────────────────────────────────────────────────
function detectAnomaly(trigger) {
  try {
    const adb  = getAuditDb();
    const now  = Math.floor(Date.now() / 1000);
    let anomaly = null;

    if (trigger === "REPORT_SPIKE") {
      const n = adb.prepare("SELECT COUNT(*) as n FROM audit_log WHERE event='TIP_SUBMITTED' AND ts_unix>?").get(now - 3600).n;
      if (n > 50) anomaly = `Report spike: ${n} tips in 1 hour`;
    } else if (trigger === "AUTH_BRUTE") {
      const n = adb.prepare("SELECT COUNT(*) as n FROM audit_log WHERE event='AUTH_FAILED' AND ts_unix>?").get(now - 300).n;
      if (n > 10) anomaly = `Auth brute force: ${n} failures in 5 min`;
    } else if (trigger === "AI_FLAG_SPIKE") {
      const n = adb.prepare("SELECT COUNT(*) as n FROM audit_log WHERE event='AI_IMAGE_FLAGGED' AND ts_unix>?").get(now - 3600).n;
      if (n > 15) anomaly = `AI flag spike: ${n} in 1 hour`;
    }

    if (anomaly) {
      auditLog("ANOMALY_DETECTED", { check: trigger, detail: anomaly });
      // Use native fetch (Node >= 18) — no node-fetch dependency
      const tok = process.env.TELEGRAM_BOT_TOKEN;
      const ch  = process.env.ADMIN_CHANNEL_ID;
      if (tok && ch) {
        const msg = `🚨 *SAFUU SECURITY ALERT*\n\n⚠️ ${anomaly}\n\n${new Date().toISOString()}`;
        fetch(`https://api.telegram.org/bot${tok}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: ch, text: msg, parse_mode: "Markdown" }),
        }).catch(() => {});
      }
    }
    return anomaly;
  } catch { return null; }
}

// ── HTTP security headers ──────────────────────────────────────────────────────
function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options",   "nosniff");
  res.setHeader("X-Frame-Options",           "DENY");
  res.setHeader("X-XSS-Protection",          "1; mode=block");
  res.setHeader("Referrer-Policy",           "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy",        "camera=(), microphone=(), geolocation=()");
  res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.removeHeader("X-Powered-By");
  res.removeHeader("Server");
  next();
}

// ── Auth middleware ────────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  const bearer = (req.headers["authorization"] || "").replace(/^Bearer\s+/i, "");

  if (apiKey) {
    const expected = process.env.DASHBOARD_API_KEY || "";
    try {
      if (expected && crypto.timingSafeEqual(Buffer.from(apiKey), Buffer.from(expected))) {
        req.authMethod = "api_key";
        req.user = { role: "admin" };
        return next();
      }
    } catch { /* length mismatch — fall through */ }
  }

  if (bearer) {
    const payload = verifyJWT(bearer);
    if (payload) {
      req.authMethod = "jwt";
      req.user = payload;
      return next();
    }
  }

  auditLog("AUTH_FAILED", { method: apiKey ? "api_key" : bearer ? "jwt" : "none" });
  detectAnomaly("AUTH_BRUTE");
  return res.status(401).json({ error: "Authentication required" });
}

// ── Role-based access control ──────────────────────────────────────────────────
// FIX: previous version had broken logic — this is correct
const ROLE_HIERARCHY = { admin: 3, analyst: 2, viewer: 1 };

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role || "viewer";
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const minRequired = Math.min(...allowedRoles.map(r => ROLE_HIERARCHY[r] || 99));
    if (userLevel >= minRequired) return next();
    auditLog("AUTHZ_DENIED", { role: userRole, required: allowedRoles.join(","), path: req.path });
    return res.status(403).json({ error: "Insufficient permissions" });
  };
}

// ── Session helpers ────────────────────────────────────────────────────────────
function isSessionExpired(session) {
  if (!session?.lastActivity) return false;
  return (Math.floor(Date.now() / 1000) - session.lastActivity) > SEC.SESSION_TIMEOUT;
}

function touchSession(session) {
  return { ...session, lastActivity: Math.floor(Date.now() / 1000) };
}

// ── Utility ────────────────────────────────────────────────────────────────────
function generateApiKey() {
  return "safuu_" + crypto.randomBytes(24).toString("base64url");
}

function generateSecret(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

// UUID v4 validator
function isUUID(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

// ── Startup environment validation ─────────────────────────────────────────────
function validateEnvironment() {
  const required = [
    "TELEGRAM_BOT_TOKEN",
    "ANTHROPIC_API_KEY",
    "OPENAI_API_KEY",
    "ADMIN_CHANNEL_ID",
    "ENCRYPTION_MASTER_KEY",
    "DEDUP_SALT",
    "DASHBOARD_API_KEY",
    "JWT_SECRET",
  ];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    console.error("🚫  SAFUU: Missing required env vars:\n" + missing.map(k => `    • ${k}`).join("\n"));
    process.exit(1);
  }
  if ((process.env.ENCRYPTION_MASTER_KEY || "").length < 32) {
    console.error("🚫  ENCRYPTION_MASTER_KEY must be ≥ 32 chars"); process.exit(1);
  }
  if ((process.env.JWT_SECRET || "").length < 32) {
    console.error("🚫  JWT_SECRET must be ≥ 32 chars"); process.exit(1);
  }
  console.log("✅  SAFUU Security: environment validated");
  auditLog("SYSTEM_START", { node: process.version });
}

module.exports = {
  SEC,
  encrypt, decrypt,
  sanitizeText, sanitizeName, sanitizeOffice, sanitizePhone, sanitizeAmount, validateDate,
  validateImageFile, validateAudioFile,
  verifyTelegramWebhook, verifyATWebhook,
  checkRateLimit, clearRateLimit,
  createNonce, verifyNonce,
  generateJWT, verifyJWT,
  auditLog, detectAnomaly,
  securityHeaders, requireAuth, requireRole,
  isSessionExpired, touchSession,
  generateApiKey, generateSecret, isUUID,
  validateEnvironment,
};
