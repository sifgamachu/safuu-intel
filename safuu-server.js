// ═══════════════════════════════════════════════════════════════════════════
//  SAFUU HARDENED API SERVER  |  safuu-server.js
//  Binds to 127.0.0.1 only — Nginx proxies externally
//  Requires Node >= 18
// ═══════════════════════════════════════════════════════════════════════════
"use strict";

require("dotenv").config();

const {
  validateEnvironment,
  securityHeaders,
  requireAuth,
  requireRole,
  checkRateLimit,
  auditLog,
  detectAnomaly,
  generateJWT,
  encrypt,
  decrypt,
  sanitizeText,
  isUUID,
} = require("./safuu-security");

validateEnvironment();

const express      = require("express");
const cors         = require("cors");
const helmet       = require("helmet");
const { WebSocketServer } = require("ws");
const http         = require("http");
const Database     = require("better-sqlite3");
const rateLimit    = require("express-rate-limit");
const slowDown     = require("express-slow-down");
const compression  = require("compression");
const morgan       = require("morgan");
const nodemailer   = require("nodemailer");
const crypto       = require("crypto");
const fs           = require("fs");

// ── App setup ─────────────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);
const wss    = new WebSocketServer({ server, path: "/ws" });
const PORT   = parseInt(process.env.API_PORT || "3001", 10);

// ── Database ──────────────────────────────────────────────────────────────────
if (!fs.existsSync("./data")) fs.mkdirSync("./data", { recursive: true });

const db = new Database("./data/safuu.db");
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("secure_delete = ON");

// ── Middleware stack ──────────────────────────────────────────────────────────

// 1. Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
}));

// 2. Custom headers
app.use(securityHeaders);

// 3. CORS
const ALLOWED_ORIGINS = (process.env.DASHBOARD_ORIGIN || "http://localhost:3000")
  .split(",").map(s => s.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    auditLog("CORS_BLOCKED", { origin: String(origin).slice(0, 50) });
    cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Api-Key", "X-Request-ID"],
  credentials: true,
  maxAge: 86400,
}));

// 4. Body parsing
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

// 5. Compression
app.use(compression());

// 6. Request ID
app.use((req, res, next) => {
  req.requestId = crypto.randomBytes(8).toString("hex");
  res.setHeader("X-Request-ID", req.requestId);
  next();
});

// 7. Access logging (strip query strings — may contain tokens)
app.use(morgan((tokens, req, res) =>
  [tokens.method(req, res), (tokens.url(req, res) || "").split("?")[0],
   tokens.status(req, res), tokens["response-time"](req, res), "ms", req.requestId].join(" "),
{ skip: req => req.path === "/health" }));

// 8. Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 60_000, max: 120, standardHeaders: true, legacyHeaders: false,
  keyGenerator: req =>
    crypto.createHash("sha256")
      .update(req.ip + (process.env.DEDUP_SALT || "salt"))
      .digest("hex").slice(0, 16),
  handler: (req, res) => {
    auditLog("GLOBAL_RATE_LIMIT", { path: req.path });
    res.status(429).json({ error: "Too many requests", retryAfter: 60 });
  },
});
app.use("/api/", globalLimiter);

// 9. Speed limiter
app.use("/api/", slowDown({
  windowMs: 60_000, delayAfter: 60,
  delayMs: (hits) => hits * 50, maxDelayMs: 5000,
}));

// ── WebSocket (authenticated) ─────────────────────────────────────────────────
const wsClients = new Set();

wss.on("connection", (ws, req) => {
  const url    = new URL(req.url, "http://localhost");
  const apiKey = url.searchParams.get("key");
  const token  = url.searchParams.get("token");
  const expected = process.env.DASHBOARD_API_KEY || "";

  let authed = false;
  try {
    if (apiKey && expected && crypto.timingSafeEqual(Buffer.from(apiKey), Buffer.from(expected))) authed = true;
  } catch {}
  if (!authed && token) {
    const { verifyJWT } = require("./safuu-security");
    if (verifyJWT(token)) authed = true;
  }

  if (!authed) { ws.close(4401, "Unauthorized"); auditLog("WS_AUTH_FAILED"); return; }

  ws.isAlive = true;
  wsClients.add(ws);
  ws.on("pong",  () => { ws.isAlive = true; });
  ws.on("close", () => wsClients.delete(ws));
  ws.on("error", () => { try { ws.terminate(); } catch {} wsClients.delete(ws); });
  ws.send(JSON.stringify({ type: "connected", ts: new Date().toISOString(), clients: wsClients.size }));
});

// Heartbeat — detect dead connections
const heartbeat = setInterval(() => {
  wsClients.forEach(ws => {
    if (!ws.isAlive) { ws.terminate(); wsClients.delete(ws); return; }
    ws.isAlive = false; ws.ping();
  });
}, 30_000);

function broadcast(event, data) {
  const payload = JSON.stringify({ type: event, data, ts: new Date().toISOString() });
  wsClients.forEach(ws => {
    try { if (ws.readyState === 1) ws.send(payload); } catch {}
  });
}

// ── Prepared statements ───────────────────────────────────────────────────────
const q = {
  persons: db.prepare(`
    SELECT id,name,title,office,region,report_count,verified_count,rating,severity,status,first_seen,last_seen
    FROM persons ORDER BY verified_count DESC
  `),
  personById: db.prepare(`
    SELECT id,name,title,office,region,phone,report_count,verified_count,rating,severity,status,first_seen,last_seen
    FROM persons WHERE id=?
  `),
  reportsByPerson: db.prepare(`
    SELECT tip_id,input_type,incident_date,incident_time,location,amount,
      corruption_type,severity,language,is_verified,ai_flagged,
      exif_verified,exif_delta_days,ai_score,timestamp_hour,ledger_hash
    FROM reports WHERE person_id=? ORDER BY created_at DESC LIMIT 100
  `),
  stats: db.prepare(`
    SELECT COUNT(*) as total_persons,
      SUM(report_count)   as total_reports,
      SUM(verified_count) as total_verified,
      COUNT(CASE WHEN status='Court'         THEN 1 END) as court_cases,
      COUNT(CASE WHEN status='Investigation' THEN 1 END) as investigations
    FROM persons
  `),
  trend: db.prepare(`
    SELECT date(created_at) as day, COUNT(*) as reports, SUM(is_verified) as verified
    FROM reports GROUP BY date(created_at) ORDER BY day ASC LIMIT 30
  `),
  offices: db.prepare(`
    SELECT p.office, COUNT(*) as reports, SUM(r.is_verified) as verified
    FROM reports r JOIN persons p ON p.id=r.person_id
    GROUP BY p.office ORDER BY reports DESC LIMIT 10
  `),
  types: db.prepare(`
    SELECT corruption_type, COUNT(*) as count
    FROM reports GROUP BY corruption_type ORDER BY count DESC
  `),
  ledger: db.prepare("SELECT seq,tip_id,event,payload_hash,prev_hash,block_hash,ts FROM ledger ORDER BY seq DESC LIMIT 100"),
  atThreshold: db.prepare("SELECT id,name,office,verified_count,rating,status FROM persons WHERE verified_count>=? AND status='Monitoring' ORDER BY verified_count DESC"),
  updateStatus: db.prepare("UPDATE persons SET status=? WHERE id=?"),
  insertLedger: db.prepare("INSERT INTO ledger (tip_id,event,payload_hash,prev_hash,block_hash) VALUES (?,?,?,?,?)"),
  getLastLedger: db.prepare("SELECT block_hash FROM ledger ORDER BY seq DESC LIMIT 1"),
};

// ── HELPERS ───────────────────────────────────────────────────────────────────

// Decrypt a person's phone — only for admin, returns null if not admin
function maybeDecryptPhone(encryptedPhone, userRole) {
  if (userRole !== "admin") return "[REDACTED]";
  if (!encryptedPhone) return null;
  return decrypt(encryptedPhone) || "[encrypted]";
}

// Decrypt a field that was encrypted by the bot
function maybeDecrypt(encryptedValue) {
  if (!encryptedValue) return null;
  const dec = decrypt(encryptedValue);
  return dec !== null ? dec : encryptedValue; // Fallback: return raw if not encrypted (legacy)
}

function sealEscalation(personId, oldStatus, newStatus, role) {
  const payload   = { type: "STATUS_CHANGE", personId, oldStatus, newStatus, role, ts: Date.now() };
  const hash      = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  const prev      = q.getLastLedger.get();
  const prevHash  = prev?.block_hash || "GENESIS";
  const blockHash = crypto.createHash("sha256").update(`${hash}:${prevHash}`).digest("hex");
  q.insertLedger.run(`ADMIN-${Date.now()}`, "STATUS_ESCALATION", hash, prevHash, blockHash);
  return blockHash;
}

// ── ROUTES ────────────────────────────────────────────────────────────────────

// Health (public)
app.get("/health", rateLimit({ windowMs: 60000, max: 30 }), (req, res) => {
  res.json({ status: "ok", service: "SAFUU API v2", uptime: Math.round(process.uptime()) });
});

// Login → JWT
app.post("/api/auth/login",
  rateLimit({ windowMs: 900_000, max: 10, skipSuccessfulRequests: true }),
  (req, res) => {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: "Password required" });

    const adminPass = process.env.ADMIN_PASSWORD || "";
    // Use constant-time comparison via hash equality (avoids timing attacks on variable-length strings)
    const inputHash    = crypto.createHash("sha256").update(String(password)).digest("hex");
    const expectedHash = crypto.createHash("sha256").update(adminPass).digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(expectedHash))) {
      auditLog("AUTH_FAILED", { method: "password" });
      detectAnomaly("AUTH_BRUTE");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateJWT({ role: "admin" }, 8 * 3600);
    auditLog("AUTH_SUCCESS", { method: "password", role: "admin" });
    res.json({ token, expiresIn: 28800 });
  }
);

// Public stats (no PII, no auth)
app.get("/api/public/stats",
  rateLimit({ windowMs: 60000, max: 60 }),
  (req, res) => {
    const s = q.stats.get();
    res.json({
      persons:        s.total_persons || 0,
      reports:        s.total_reports || 0,
      verified:       s.total_verified || 0,
      investigations: s.investigations || 0,
      court_cases:    s.court_cases || 0,
    });
  }
);

// All persons (auth required)
app.get("/api/persons", requireAuth, (req, res) => {
  const role    = req.user?.role || "viewer";
  const persons = q.persons.all().map(p => ({
    ...p,
    phone: maybeDecryptPhone(p.phone, role),
  }));
  auditLog("DATA_ACCESS", { resource: "persons", count: persons.length, role });
  res.json({ success: true, count: persons.length, data: persons });
});

// Single person + reports
app.get("/api/persons/:id", requireAuth, (req, res) => {
  if (!isUUID(req.params.id)) return res.status(400).json({ error: "Invalid ID format" });
  const role   = req.user?.role || "viewer";
  const person = q.personById.get(req.params.id);
  if (!person) return res.status(404).json({ error: "Not found" });

  // Decrypt encrypted fields from reports
  const reports = q.reportsByPerson.all(req.params.id).map(r => ({
    ...r,
    location: r.location ? (maybeDecrypt(r.location) || r.location) : null,
    // description encrypted at rest — only admin gets it
    ...(role === "admin" ? {} : {}),
  }));

  auditLog("DATA_ACCESS", { resource: "person", pid: req.params.id.slice(0, 8), role });
  res.json({
    success: true,
    data: {
      ...person,
      phone: maybeDecryptPhone(person.phone, role),
      reports,
    },
  });
});

// Escalate status (analyst and above)
app.post("/api/persons/:id/escalate",
  requireAuth,
  requireRole("analyst"),
  rateLimit({ windowMs: 3_600_000, max: 10 }),
  (req, res) => {
    if (!isUUID(req.params.id)) return res.status(400).json({ error: "Invalid ID" });

    const VALID = ["Monitoring", "Under Review", "Investigation", "Court", "Cleared"];
    const { status } = req.body;
    if (!VALID.includes(status)) return res.status(400).json({ error: "Invalid status value" });

    const person = q.personById.get(req.params.id);
    if (!person) return res.status(404).json({ error: "Not found" });

    q.updateStatus.run(status, req.params.id);
    const blockHash = sealEscalation(req.params.id, person.status, status, req.user?.role || "api_key");

    auditLog("PERSON_ESCALATED", {
      pid: req.params.id.slice(0, 8), old: person.status, new: status,
      role: req.user?.role, requestId: req.requestId,
    });

    broadcast("escalation", {
      person_id: req.params.id, name: person.name,
      old_status: person.status, new_status: status, ledger: blockHash.slice(0, 16),
    });

    // Auto-email FEACC if escalated to Court
    if (status === "Court" && process.env.SMTP_USER && process.env.FEACC_EMAIL) {
      sendFeaccEmail(person, status, q.reportsByPerson.all(req.params.id))
        .catch(e => auditLog("EMAIL_ERROR", { msg: e.message.slice(0, 100) }));
    }

    res.json({ success: true, id: req.params.id, new_status: status, ledger_hash: blockHash });
  }
);

// Analytics bundle
app.get("/api/analytics", requireAuth, (req, res) => {
  auditLog("DATA_ACCESS", { resource: "analytics", role: req.user?.role });
  res.json({
    success:     true,
    stats:       q.stats.get(),
    trend:       q.trend.all(),
    offices:     q.offices.all(),
    types:       q.types.all(),
  });
});

// Evidence ledger + integrity check
app.get("/api/ledger", requireAuth, (req, res) => {
  const data = q.ledger.all();
  let chainIntact = true;
  for (let i = 0; i < data.length - 1; i++) {
    if (data[i].prev_hash !== data[i + 1].block_hash) {
      chainIntact = false;
      auditLog("LEDGER_INTEGRITY_FAIL", { seq: data[i].seq });
      break;
    }
  }
  res.json({ success: true, chain_intact: chainIntact, count: data.length, data });
});

// Persons at threshold
app.get("/api/threshold/:n", requireAuth, (req, res) => {
  const n = parseInt(req.params.n, 10);
  if (isNaN(n) || n < 1 || n > 1000) return res.status(400).json({ error: "n must be 1–1000" });
  res.json({ success: true, threshold: n, data: q.atThreshold.all(n) });
});

// Export person intelligence file (admin only)
app.get("/api/export/:id",
  requireAuth,
  requireRole("analyst"),
  rateLimit({ windowMs: 3_600_000, max: 20 }),
  (req, res) => {
    if (!isUUID(req.params.id)) return res.status(400).json({ error: "Invalid ID" });
    const person  = q.personById.get(req.params.id);
    if (!person) return res.status(404).json({ error: "Not found" });
    const reports = q.reportsByPerson.all(req.params.id);

    auditLog("PERSON_EXPORTED", {
      pid: req.params.id.slice(0, 8), reportCount: reports.length,
      role: req.user?.role, requestId: req.requestId,
    });

    const file = {
      classification: "SAFUU INTELLIGENCE FILE — RESTRICTED",
      exported_at: new Date().toISOString(),
      subject: {
        ...person,
        phone: maybeDecryptPhone(person.phone, req.user?.role || "analyst"),
      },
      summary: {
        total:    reports.length,
        verified: reports.filter(r => r.is_verified).length,
        ai_flags: reports.filter(r => r.ai_flagged).length,
        types:    [...new Set(reports.map(r => r.corruption_type))],
      },
      reports: reports.map(r => ({
        ...r,
        location: r.location ? (maybeDecrypt(r.location) || r.location) : null,
      })),
    };

    res.setHeader("Content-Disposition", `attachment; filename=SAFUU_${req.params.id.slice(0, 8)}.json`);
    res.json(file);
  }
);

// Push event to dashboard WebSocket (for bot to call)
app.post("/api/events/push", requireAuth,
  rateLimit({ windowMs: 60_000, max: 600 }),
  (req, res) => {
    const { event, data } = req.body;
    if (typeof event !== "string" || event.length > 64) {
      return res.status(400).json({ error: "Invalid event name" });
    }
    broadcast(sanitizeText(event, 64), data);
    res.json({ success: true, clients: wsClients.size });
  }
);

// Security audit log (admin only)
app.get("/api/security/audit", requireAuth, requireRole("admin"), (req, res) => {
  try {
    const auditDb = new Database("./data/audit.db");
    const logs    = auditDb.prepare("SELECT ts,event,meta FROM audit_log ORDER BY id DESC LIMIT 500").all();
    auditDb.close();
    res.json({ success: true, count: logs.length, data: logs });
  } catch {
    res.json({ success: true, count: 0, data: [], note: "Audit DB not yet initialised" });
  }
});

// ── FEACC EMAIL ───────────────────────────────────────────────────────────────
const mailer = nodemailer.createTransport({
  host:   process.env.SMTP_HOST || "smtp.gmail.com",
  port:   parseInt(process.env.SMTP_PORT || "587", 10),
  secure: false,
  auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  tls:    { rejectUnauthorized: true },
});

async function sendFeaccEmail(person, status, reports = []) {
  const verified = reports.filter(r => r.is_verified).length;
  await mailer.sendMail({
    from:    `"SAFUU Intelligence" <${process.env.SMTP_USER}>`,
    to:      process.env.FEACC_EMAIL,
    subject: `[SAFUU ${status.toUpperCase()}] ${person.name} — ${verified} Verified Reports`,
    html: `
<div style="font-family:monospace;max-width:600px;border:1px solid #ddd;border-radius:6px;overflow:hidden">
  <div style="background:#078930;color:#fff;padding:16px">
    <strong>🇪🇹 SAFUU Alert — ${status}</strong>
  </div>
  <div style="padding:20px">
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      ${[["Name",person.name],["Title",person.title||"—"],["Office",person.office],
         ["Total Reports",reports.length],["Verified",verified],["Rating",`${person.rating}/10`]]
        .map(([k,v])=>`<tr><td style="padding:6px;background:#f9f9f9;width:40%"><b>${k}</b></td><td style="padding:6px">${v}</td></tr>`).join("")}
    </table>
    <p style="color:#888;font-size:11px;margin-top:16px">
      All submitters are fully anonymous. No identity data is attached. 
      Generated automatically when SAFUU verified report threshold was reached.
    </p>
  </div>
</div>`,
  });
  auditLog("FEACC_EMAIL_SENT", { pid: person.id?.slice(0, 8), status, verified });
}

// ── ERROR HANDLERS ────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") return res.status(403).json({ error: "Forbidden" });
  auditLog("SERVER_ERROR", { msg: err.message?.slice(0, 100), path: req.path });
  res.status(500).json({ error: "Internal server error", requestId: req.requestId });
});

// ── SHUTDOWN ──────────────────────────────────────────────────────────────────
function shutdown(signal) {
  console.log(`\n⏹  Safuu API shutting down (${signal})`);
  auditLog("SERVER_SHUTDOWN", { signal });
  clearInterval(heartbeat);
  wsClients.forEach(ws => { try { ws.close(1001, "Server shutting down"); } catch {} });
  server.close(() => { db.close(); process.exit(0); });
  setTimeout(() => process.exit(1), 10_000);
}

process.once("SIGINT",  () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
process.on("uncaughtException",  e => { auditLog("UNCAUGHT", { msg: e.message }); console.error(e); });
process.on("unhandledRejection", e => { auditLog("UNHANDLED", { msg: String(e) }); });

// ── START ─────────────────────────────────────────────────────────────────────
server.listen(PORT, "127.0.0.1", () => {
  auditLog("SERVER_START", { port: PORT, node: process.version });
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🔐  SAFUU API — 127.0.0.1:${PORT}`);
  console.log(`   REST:      http://127.0.0.1:${PORT}/api`);
  console.log(`   WebSocket: ws://127.0.0.1:${PORT}/ws`);
  console.log(`   CORS:      ${ALLOWED_ORIGINS.join(", ")}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});

module.exports = { broadcast };
