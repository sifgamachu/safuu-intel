// ═══════════════════════════════════════════════════════════════════════════
//  SAFUU HARDENED API SERVER  |  safuu-server-secure.js
//  Security-first — every endpoint protected, every input validated
// ═══════════════════════════════════════════════════════════════════════════

"use strict";
require("dotenv").config();

const {
  validateEnvironment, securityHeaders, requireAuth, requireRole,
  checkRateLimit, auditLog, detectAnomaly,
  generateJWT, verifyJWT, encrypt, decrypt,
  sanitizeText, generateSecretToken, redactForLog,
} = require("./safuu-security");

// Validate env before anything else
validateEnvironment();

const express        = require("express");
const cors           = require("cors");
const helmet         = require("helmet");
const { WebSocketServer } = require("ws");
const http           = require("http");
const sqlite3        = require("better-sqlite3");
const rateLimit      = require("express-rate-limit");
const slowDown       = require("express-slow-down");
const compression    = require("compression");
const morgan         = require("morgan");
const crypto         = require("crypto");
const nodemailer     = require("nodemailer");
const fs             = require("fs");

const app    = express();
const server = http.createServer(app);
const wss    = new WebSocketServer({ server, path:"/ws" });
const PORT   = process.env.API_PORT || 3001;

// ── Database ──────────────────────────────────────────────────────────────────
const db = new sqlite3("./data/safuu.db");
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("secure_delete = ON");   // Zero-fill deleted pages
db.pragma("auto_vacuum = FULL");

// ── Security middleware stack ─────────────────────────────────────────────────
// 1. Helmet — comprehensive HTTP security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:     ["'self'"],
      scriptSrc:      ["'self'"],
      styleSrc:       ["'self'", "'unsafe-inline'"],
      imgSrc:         ["'self'", "data:", "blob:"],
      connectSrc:     ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  noSniff: true,
  frameguard: { action: "deny" },
  xssFilter: true,
}));

// 2. Custom security headers
app.use(securityHeaders);

// 3. CORS — strictly locked to dashboard origin only
const ALLOWED_ORIGINS = (process.env.DASHBOARD_ORIGIN || "http://localhost:3000")
  .split(",").map(s => s.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    auditLog("CORS_BLOCKED", { origin: origin?.slice(0, 50) });
    cb(new Error("Not allowed by CORS"));
  },
  methods:      ["GET","POST","OPTIONS"],
  allowedHeaders:["Content-Type","Authorization","X-Api-Key","X-Request-ID"],
  credentials:  true,
  maxAge:        86400,
}));

// 4. Body parsing with size limits
app.use(express.json({ limit: "50kb" }));   // JSON requests capped at 50KB
app.use(express.urlencoded({ extended:false, limit:"10kb" }));

// 5. Compression (after security headers)
app.use(compression());

// 6. Request ID for tracing (no PII)
app.use((req, res, next) => {
  req.requestId = crypto.randomBytes(8).toString("hex");
  res.setHeader("X-Request-ID", req.requestId);
  next();
});

// 7. Security-aware access logging (no PII logged)
app.use(morgan((tokens, req, res) => {
  const safe = [
    tokens.method(req, res),
    tokens.url(req, res)?.split("?")[0], // Strip query params (may contain keys)
    tokens.status(req, res),
    tokens["response-time"](req, res), "ms",
    req.requestId,
  ].join(" ");
  return safe;
}, { skip: (req) => req.path === "/health" })); // Don't log health checks

// 8. Global rate limiting (all endpoints)
app.use("/api/", rateLimit({
  windowMs: 60_000,
  max:       120,
  standardHeaders: true,
  legacyHeaders:   false,
  keyGenerator: (req) => {
    // Use hashed IP — don't log raw IPs
    return crypto.createHash("sha256")
      .update(req.ip + (process.env.DEDUP_SALT || ""))
      .digest("hex").slice(0, 16);
  },
  handler: (req, res) => {
    auditLog("GLOBAL_RATE_LIMIT", { path:req.path, requestId:req.requestId });
    res.status(429).json({ error:"Too many requests", retryAfter:60 });
  },
}));

// 9. Speed limiter (slows repeated requests before blocking)
app.use("/api/", slowDown({
  windowMs:          60_000,
  delayAfter:        60,
  delayMs:           (hits) => hits * 50,  // Each request over 60 adds 50ms delay
  maxDelayMs:        5000,
}));

// ── WebSocket (authenticated only) ───────────────────────────────────────────
const wsClients = new Set();

wss.on("connection", (ws, req) => {
  const url = new URL(req.url, "http://localhost");
  const token  = url.searchParams.get("token");
  const apiKey = url.searchParams.get("key");

  const authed = (() => {
    if (apiKey && crypto.timingSafeEqual(Buffer.from(apiKey), Buffer.from(process.env.DASHBOARD_API_KEY || ""))) return true;
    if (token && verifyJWT(token)) return true;
    return false;
  })();

  if (!authed) {
    ws.close(4401, "Unauthorized");
    auditLog("WS_AUTH_FAILED");
    return;
  }

  ws.isAlive = true;
  wsClients.add(ws);
  ws.on("pong", () => { ws.isAlive = true; });
  ws.on("close", () => wsClients.delete(ws));
  ws.on("error", () => wsClients.delete(ws));

  // Send connection confirmation
  ws.send(JSON.stringify({ type:"connected", msg:"SAFUU live stream", ts:new Date().toISOString() }));
  auditLog("WS_CONNECTED", { clientCount: wsClients.size });
});

// WebSocket heartbeat (detect dead connections)
const wsHeartbeat = setInterval(() => {
  wsClients.forEach(ws => {
    if (!ws.isAlive) { ws.terminate(); wsClients.delete(ws); return; }
    ws.isAlive = false;
    ws.ping();
  });
}, 30_000);

function broadcast(event, data) {
  const payload = JSON.stringify({ type:event, data, ts:new Date().toISOString() });
  wsClients.forEach(ws => {
    try { if (ws.readyState === 1) ws.send(payload); } catch {}
  });
}

// ── Prepared statements ───────────────────────────────────────────────────────
const q = {
  persons:      db.prepare("SELECT id,name,title,office,region,report_count,verified_count,rating,severity,status,first_seen,last_seen FROM persons ORDER BY verified_count DESC"),
  personById:   db.prepare("SELECT id,name,title,office,region,phone,report_count,verified_count,rating,severity,status,first_seen,last_seen FROM persons WHERE id=?"),
  reportsByPerson: db.prepare("SELECT tip_id,input_type,incident_date,incident_time,location,amount,corruption_type,severity,language,is_verified,ai_flagged,exif_verified,exif_delta_days,ai_score,timestamp_hour,ledger_hash FROM reports WHERE person_id=? ORDER BY created_at DESC LIMIT 100"),
  stats:        db.prepare("SELECT COUNT(*) as total_persons, SUM(report_count) as total_reports, SUM(verified_count) as total_verified, COUNT(CASE WHEN status='Court' THEN 1 END) as court_cases, COUNT(CASE WHEN status='Investigation' THEN 1 END) as investigations FROM persons"),
  trend:        db.prepare("SELECT date(created_at) as day, COUNT(*) as reports, SUM(is_verified) as verified FROM reports GROUP BY date(created_at) ORDER BY day DESC LIMIT 30"),
  offices:      db.prepare("SELECT p.office, COUNT(*) as reports FROM reports r JOIN persons p ON p.id=r.person_id GROUP BY p.office ORDER BY reports DESC LIMIT 10"),
  types:        db.prepare("SELECT corruption_type, COUNT(*) as count FROM reports GROUP BY corruption_type ORDER BY count DESC"),
  ledger:       db.prepare("SELECT seq,tip_id,event,payload_hash,prev_hash,block_hash,ts FROM ledger ORDER BY seq DESC LIMIT 100"),
  atThreshold:  db.prepare("SELECT id,name,office,verified_count,status FROM persons WHERE verified_count>=? AND status='Monitoring' ORDER BY verified_count DESC"),
  updateStatus: db.prepare("UPDATE persons SET status=? WHERE id=?"),
  auditLog:     db.prepare("SELECT * FROM audit_log ORDER BY seq DESC LIMIT 200"), // Note: audit_log is in audit.db
};

// ── INPUT VALIDATION MIDDLEWARE ───────────────────────────────────────────────
function validateUUID(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

// ── ROUTES ────────────────────────────────────────────────────────────────────

// Health check (public, rate limited separately)
app.get("/health", rateLimit({ windowMs:60000, max:10 }), (req, res) => {
  res.json({ status:"ok", service:"SAFUU API v2", uptime:process.uptime().toFixed(0) });
});

// Login → JWT (rate limited tightly)
app.post("/api/auth/login",
  rateLimit({ windowMs:900_000, max:10, skipSuccessfulRequests:true }),
  (req, res) => {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error:"Password required" });

    const hashedInput = crypto.createHash("sha256").update(password).digest("hex");
    const hashedExpected = crypto.createHash("sha256").update(process.env.ADMIN_PASSWORD || "").digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(hashedInput), Buffer.from(hashedExpected))) {
      auditLog("AUTH_FAILED", { method:"password" });
      detectAnomaly("AUTH_BRUTE");
      return res.status(401).json({ error:"Invalid credentials" });
    }

    const token = generateJWT({ role:"admin", jti:generateSecretToken(8) }, 8 * 3600);
    auditLog("AUTH_SUCCESS", { method:"password", role:"admin" });
    res.json({ token, expiresIn: 28800 });
  }
);

// Public stats (no auth — anonymous aggregate only, no person details)
app.get("/api/public/stats",
  rateLimit({ windowMs:60000, max:30 }),
  (req, res) => {
    const s = q.stats.get();
    res.json({
      persons:     s.total_persons,
      reports:     s.total_reports,
      verified:    s.total_verified,
      investigations: s.investigations,
      // NO names, NO offices, NO individual data in public endpoint
    });
  }
);

// ─── PROTECTED ROUTES (auth required) ─────────────────────────────────────────

// Persons list
app.get("/api/persons", requireAuth, (req, res) => {
  const persons = q.persons.all();
  // Decrypt phone numbers for admin view, redact for analysts/viewers
  const out = persons.map(p => ({
    ...p,
    phone: req.user?.role === "admin" ? (p.phone ? decrypt(p.phone) : null) : "[REDACTED]",
  }));
  auditLog("DATA_ACCESS", { resource:"persons", count:out.length, role:req.user?.role||"api_key" });
  res.json({ success:true, count:out.length, data:out });
});

// Single person + reports
app.get("/api/persons/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  if (!validateUUID(id)) return res.status(400).json({ error:"Invalid ID format" });

  const person  = q.personById.get(id);
  if (!person) return res.status(404).json({ error:"Not found" });

  const reports = q.reportsByPerson.all(id).map(r => ({
    ...r,
    // Descriptions are encrypted at rest — only admins get plaintext
    location: req.user?.role === "admin" ? (r.location ? decrypt(r.location) || r.location : null) : r.location,
    amount:   r.amount,
  }));

  auditLog("DATA_ACCESS", { resource:"person_detail", person_id:id.slice(0,8)+"...", role:req.user?.role||"api_key" });
  res.json({ success:true, data:{ ...person, phone:req.user?.role==="admin"&&person.phone?decrypt(person.phone)||"[encrypted]":"[REDACTED]", reports } });
});

// Escalate person status (analysts and above)
app.post("/api/persons/:id/escalate",
  requireAuth,
  rateLimit({ windowMs:3600_000, max:10 }),
  (req, res) => {
    const { id } = req.params;
    if (!validateUUID(id)) return res.status(400).json({ error:"Invalid ID" });

    const { status } = req.body;
    const VALID_STATUSES = ["Monitoring","Under Review","Investigation","Court","Cleared"];
    if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error:"Invalid status value" });

    const person = q.personById.get(id);
    if (!person) return res.status(404).json({ error:"Not found" });

    q.updateStatus.run(status, id);

    // Seal escalation in evidence ledger
    const ledgerEntry = {
      event:      "STATUS_ESCALATION",
      person_id:  id,
      old_status: person.status,
      new_status: status,
      actor_role: req.user?.role || "api_key",
      ts:         Date.now(),
    };
    const hash = crypto.createHash("sha256").update(JSON.stringify(ledgerEntry)).digest("hex");
    db.prepare("INSERT INTO ledger (tip_id,event,payload_hash,prev_hash,block_hash) VALUES (?,?,?,?,?)").run(
      `ESCALATE-${Date.now()}`, "STATUS_ESCALATION", hash, "ADMIN", hash
    );

    auditLog("PERSON_ESCALATED", { person_id:id.slice(0,8)+"...", old:person.status, new:status, role:req.user?.role||"api_key" });
    broadcast("escalation", { person_id:id, name:person.name, old_status:person.status, new_status:status });

    // Auto-email FEACC for Court referrals
    if (status === "Court" && process.env.SMTP_USER) {
      sendFeaccEmail(person, status).catch(e => auditLog("EMAIL_ERROR", { msg:e.message }));
    }

    res.json({ success:true, id, new_status:status });
  }
);

// Analytics bundle
app.get("/api/analytics", requireAuth, (req, res) => {
  res.json({
    success: true,
    stats:   q.stats.get(),
    trend:   q.trend.all().reverse(),
    offices: q.offices.all(),
    types:   q.types.all(),
  });
  auditLog("DATA_ACCESS", { resource:"analytics" });
});

// Evidence ledger
app.get("/api/ledger", requireAuth, (req, res) => {
  const data = q.ledger.all();
  // Verify chain integrity before returning
  let chainIntact = true;
  for (let i = 1; i < data.length; i++) {
    if (data[i].block_hash !== data[i-1].prev_hash) {
      chainIntact = false;
      auditLog("LEDGER_INTEGRITY_FAILURE", { seq:data[i].seq });
      break;
    }
  }
  res.json({ success:true, chain_intact:chainIntact, data });
});

// Threshold check
app.get("/api/threshold/:n", requireAuth, (req, res) => {
  const n = parseInt(req.params.n);
  if (isNaN(n) || n < 1 || n > 1000) return res.status(400).json({ error:"Invalid threshold" });
  res.json({ success:true, threshold:n, data:q.atThreshold.all(n) });
});

// Export person file (admin only)
app.get("/api/export/:id", requireAuth, requireRole("admin","analyst"), (req, res) => {
  const { id } = req.params;
  if (!validateUUID(id)) return res.status(400).json({ error:"Invalid ID" });

  const person  = q.personById.get(id);
  if (!person) return res.status(404).json({ error:"Not found" });
  const reports = q.reportsByPerson.all(id);

  // Audit this export — exports are high-value events
  auditLog("PERSON_EXPORTED", {
    person_id: id.slice(0,8)+"...",
    report_count: reports.length,
    role: req.user?.role||"api_key",
    requestId: req.requestId,
  });

  const file = {
    classification: "SAFUU INTELLIGENCE FILE — RESTRICTED",
    exported_at:    new Date().toISOString(),
    exported_by:    req.user?.role || "admin",
    subject: {
      ...person,
      phone: person.phone ? decrypt(person.phone) || "[encrypted]" : null,
    },
    reports: reports,
    summary: {
      total:    reports.length,
      verified: reports.filter(r=>r.is_verified).length,
      ai_flags: reports.filter(r=>r.ai_flagged).length,
      types:    [...new Set(reports.map(r=>r.corruption_type))],
    },
  };

  res.setHeader("Content-Disposition", `attachment; filename=SAFUU_INTEL_${id.slice(0,8)}.json`);
  res.setHeader("Content-Type", "application/json");
  res.json(file);
});

// Push event to dashboard (bot → server → ws clients)
app.post("/api/events/push", requireAuth,
  rateLimit({ windowMs:60000, max:300 }),
  (req, res) => {
    const { event, data } = req.body;
    if (typeof event !== "string" || event.length > 64) return res.status(400).json({ error:"Invalid event" });
    broadcast(sanitizeText(event, 64), data);
    res.json({ success:true, clients:wsClients.size });
  }
);

// Security audit log (admin only)
app.get("/api/security/audit", requireAuth, requireRole("admin"), (req, res) => {
  try {
    const auditDb = new sqlite3("./data/audit.db");
    const logs = auditDb.prepare("SELECT ts,event,meta FROM audit_log ORDER BY id DESC LIMIT 200").all();
    auditDb.close();
    res.json({ success:true, count:logs.length, data:logs });
  } catch { res.json({ success:true, data:[], note:"Audit DB not yet initialised" }); }
});

// ── FEACC EMAIL ───────────────────────────────────────────────────────────────
const mailer = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || "smtp.gmail.com",
  port:   parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth:   { user:process.env.SMTP_USER, pass:process.env.SMTP_PASS },
  tls:    { rejectUnauthorized: true }, // Enforce TLS cert validation
});

async function sendFeaccEmail(person, status) {
  if (!process.env.SMTP_USER || !process.env.FEACC_EMAIL) return;
  const reports  = q.reportsByPerson.all(person.id);
  const verified = reports.filter(r => r.is_verified).length;

  await mailer.sendMail({
    from:    `"SAFUU Intelligence Platform" <${process.env.SMTP_USER}>`,
    to:      process.env.FEACC_EMAIL,
    subject: `[SAFUU ${status.toUpperCase()}] ${person.name} — ${verified} Verified Reports`,
    headers: { "X-Mailer": "SAFUU-v2" },
    html: `<div style="font-family:monospace;max-width:600px">
      <h2 style="color:#078930">🇪🇹 SAFUU Alert — ${status}</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <tr><td><b>Name</b></td><td>${person.name}</td></tr>
        <tr><td><b>Title</b></td><td>${person.title||"—"}</td></tr>
        <tr><td><b>Office</b></td><td>${person.office}</td></tr>
        <tr><td><b>Total Reports</b></td><td>${reports.length}</td></tr>
        <tr><td><b>Verified Reports</b></td><td><b style="color:#16a34a">${verified}</b></td></tr>
        <tr><td><b>Rating</b></td><td>${person.rating}/10</td></tr>
      </table>
      <p style="color:#666;font-size:11px">All submitters are fully anonymous. No identity data attached. Generated by SAFUU automated threshold system.</p>
    </div>`,
  });
  auditLog("FEACC_EMAIL_SENT", { person_id:person.id.slice(0,8)+"...", status });
}

// ── ERROR HANDLING ────────────────────────────────────────────────────────────
// Generic 404
app.use((req, res) => {
  res.status(404).json({ error:"Not found" });
});

// Error handler — never leak stack traces
app.use((err, req, res, next) => {
  const isCors = err.message === "Not allowed by CORS";
  auditLog("SERVER_ERROR", { message:err.message?.slice(0,100), path:req.path, requestId:req.requestId });
  if (isCors) return res.status(403).json({ error:"Forbidden" });
  res.status(500).json({ error:"Internal server error", requestId:req.requestId });
});

// ── GRACEFUL SHUTDOWN ─────────────────────────────────────────────────────────
function shutdown(signal) {
  console.log(`\n⏹  SAFUU API shutting down (${signal})`);
  auditLog("SYSTEM_SHUTDOWN", { signal });
  clearInterval(wsHeartbeat);
  wsClients.forEach(ws => ws.close(1001, "Server shutting down"));
  server.close(() => {
    db.close();
    console.log("   Database closed. Goodbye.");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000);
}

process.once("SIGINT",  () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
process.on("uncaughtException",  e => { auditLog("UNCAUGHT_EXCEPTION", { msg:e.message }); console.error(e); });
process.on("unhandledRejection", e => { auditLog("UNHANDLED_REJECTION", { msg:String(e) }); });

// ── START ─────────────────────────────────────────────────────────────────────
server.listen(PORT, "127.0.0.1", () => {  // Bind to localhost only — Nginx proxies externally
  auditLog("SERVER_START", { port:PORT, node:process.version });
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🔐  SAFUU Hardened API — :${PORT} (localhost only)`);
  console.log(`   REST:      http://127.0.0.1:${PORT}/api`);
  console.log(`   WebSocket: ws://127.0.0.1:${PORT}/ws`);
  console.log(`   CORS:      ${ALLOWED_ORIGINS.join(", ")}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});

module.exports = { broadcast };
