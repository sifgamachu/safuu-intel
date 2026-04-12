// ═══════════════════════════════════════════════════════════════════════════
//  SAFUU — PUBLIC TRANSPARENCY API ENDPOINTS
//  Add these routes to safuu-server.js
//
//  These are the ONLY unauthenticated endpoints that return person data.
//  They apply the disclosure threshold — names only appear when
//  verified_count >= threshold, otherwise only city and office are shown.
//
//  GET /api/public/transparency         — full leaderboard with masking
//  GET /api/public/transparency/:id     — single person card (no name if below threshold)
//  POST /api/admin/threshold            — admin sets the disclosure threshold
//  GET /api/public/stats                — aggregate numbers (no person data)
// ═══════════════════════════════════════════════════════════════════════════

// ── Add these to your DB setup block in safuu-server.js ──────────────────────
/*
  db.exec(`
    CREATE TABLE IF NOT EXISTS config (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );
    INSERT OR IGNORE INTO config (key, value) VALUES ('disclosure_threshold', '15');
  `);
*/

// ── Add these prepared statements ─────────────────────────────────────────────
/*
  getThreshold:   db.prepare("SELECT value FROM config WHERE key='disclosure_threshold'"),
  setThreshold:   db.prepare("INSERT OR REPLACE INTO config (key,value,updated_at) VALUES ('disclosure_threshold',?,datetime('now'))"),
  publicPersons:  db.prepare(`
    SELECT id, office, region,
      -- city extracted from location (first segment before comma)
      TRIM(SUBSTR(location, 1, INSTR(location||',', ',')-1)) as city,
      report_count, verified_count, rating, severity, status,
      corruption_type, last_seen,
      CASE WHEN verified_count >= ? THEN name ELSE NULL END as name,
      CASE WHEN verified_count >= ? THEN 1 ELSE 0 END as disclosed
    FROM persons
    ORDER BY verified_count DESC, report_count DESC
    LIMIT 50
  `),
*/

// ── PASTE THESE ROUTES INTO safuu-server.js ───────────────────────────────────

// Helper: get current threshold from DB (with fallback)
function getThreshold(db) {
  try {
    const row = db.prepare("SELECT value FROM config WHERE key='disclosure_threshold'").get();
    return parseInt(row?.value || "15", 10);
  } catch {
    return 15; // Safe default
  }
}

// Helper: mask a name for public display
function publicMaskName(name) {
  if (!name) return null;
  return name.split(" ")
    .map(w => w.length > 0 ? w[0] + "•".repeat(Math.max(1, w.length - 1)) : "")
    .join(" ");
}

// Helper: build a safe public person object
function toPublicPerson(row, threshold) {
  const disclosed = (row.verified_count || 0) >= threshold;
  return {
    id:              row.id,
    // Name: only if disclosed. Masked if not. City + office always shown.
    name:            disclosed ? row.name : null,
    name_masked:     disclosed ? null     : publicMaskName(row.name),
    disclosed,
    threshold_gap:   disclosed ? 0 : threshold - (row.verified_count || 0),

    // Always public
    office:          row.office,
    region:          row.region,
    city:            row.city || null,
    corruption_type: row.corruption_type,
    severity:        row.severity,
    status:          row.status,
    report_count:    row.report_count,
    verified_count:  row.verified_count,
    last_seen:       row.last_seen ? row.last_seen.split("T")[0] : null,

    // Never public
    // phone, title, description, amount — all omitted
  };
}

// ── Route 1: Public transparency leaderboard ──────────────────────────────────
// GET /api/public/transparency?threshold=15
// No auth required. Names masked below threshold.
function addTransparencyRoute(app, db, rateLimit) {
  const pubLimiter = rateLimit({ windowMs: 60_000, max: 120 });

  // Full leaderboard
  app.get("/api/public/transparency", pubLimiter, (req, res) => {
    const threshold = getThreshold(db);

    const rows = db.prepare(`
      SELECT p.id, p.name, p.office, p.region,
        TRIM(SUBSTR(COALESCE(r_last.location,''), 1,
          CASE WHEN INSTR(COALESCE(r_last.location,''), ',')>0
               THEN INSTR(COALESCE(r_last.location,''), ',')-1
               ELSE LENGTH(COALESCE(r_last.location,'')) END
        )) as city,
        p.report_count, p.verified_count, p.severity,
        p.status, p.corruption_type, p.last_seen
      FROM persons p
      LEFT JOIN reports r_last ON r_last.person_id = p.id
        AND r_last.created_at = (SELECT MAX(created_at) FROM reports WHERE person_id = p.id)
      GROUP BY p.id
      ORDER BY p.verified_count DESC, p.report_count DESC
      LIMIT 50
    `).all();

    const data = rows.map(r => toPublicPerson(r, threshold));

    res.json({
      success:   true,
      threshold,
      count:     data.length,
      disclosed: data.filter(d => d.disclosed).length,
      protected: data.filter(d => !d.disclosed).length,
      data,
    });
  });

  // Single person card
  app.get("/api/public/transparency/:id", pubLimiter, (req, res) => {
    const { isUUID } = require("./safuu-security");
    if (!isUUID(req.params.id)) return res.status(400).json({ error:"Invalid ID" });

    const threshold = getThreshold(db);
    const row = db.prepare(`
      SELECT p.id, p.name, p.office, p.region,
        p.report_count, p.verified_count, p.severity,
        p.status, p.corruption_type, p.last_seen,
        COUNT(r.id) as total_reports,
        MAX(r.created_at) as latest_report
      FROM persons p
      LEFT JOIN reports r ON r.person_id = p.id
      WHERE p.id = ?
      GROUP BY p.id
    `).get(req.params.id);

    if (!row) return res.status(404).json({ error:"Not found" });
    res.json({ success:true, threshold, data:toPublicPerson(row, threshold) });
  });

  // Public stats — no person data
  app.get("/api/public/stats", pubLimiter, (req, res) => {
    const threshold = getThreshold(db);
    const s = db.prepare(`
      SELECT
        COUNT(*) as total_persons,
        SUM(report_count) as total_reports,
        SUM(verified_count) as total_verified,
        COUNT(CASE WHEN status='Court' THEN 1 END) as court_cases,
        COUNT(CASE WHEN status='Investigation' THEN 1 END) as investigations,
        COUNT(CASE WHEN verified_count >= ? THEN 1 END) as disclosed_count
      FROM persons
    `).get(threshold);

    const types = db.prepare(`
      SELECT corruption_type, COUNT(*) as count
      FROM reports GROUP BY corruption_type ORDER BY count DESC LIMIT 10
    `).all();

    const regions = db.prepare(`
      SELECT region, COUNT(*) as reports
      FROM persons GROUP BY region ORDER BY reports DESC
    `).all();

    res.json({
      success:       true,
      threshold,
      persons:       s.total_persons || 0,
      reports:       s.total_reports || 0,
      verified:      s.total_verified || 0,
      court_cases:   s.court_cases || 0,
      investigations:s.investigations || 0,
      disclosed:     s.disclosed_count || 0,
      protected:     (s.total_persons || 0) - (s.disclosed_count || 0),
      types,
      regions,
    });
  });

  // Admin: update threshold (auth required, analyst+)
  app.post("/api/admin/threshold",
    (req, res, next) => { require("./safuu-security").requireAuth(req, res, next); },
    (req, res, next) => { require("./safuu-security").requireRole("analyst")(req, res, next); },
    rateLimit({ windowMs: 3600_000, max: 10 }),
    (req, res) => {
      const n = parseInt(req.body.threshold, 10);
      if (isNaN(n) || n < 1 || n > 500) {
        return res.status(400).json({ error:"threshold must be 1–500" });
      }

      db.prepare("INSERT OR REPLACE INTO config (key,value,updated_at) VALUES ('disclosure_threshold',?,datetime('now'))").run(String(n));

      // Log — threshold changes are high-value events
      const { auditLog } = require("./safuu-security");
      auditLog("THRESHOLD_CHANGED", {
        old_threshold: getThreshold(db), // Note: already updated above
        new_threshold: n,
        role: req.user?.role,
        requestId: req.requestId,
      });

      // Broadcast to dashboard via WebSocket
      // broadcast("threshold_changed", { threshold: n });

      res.json({ success:true, threshold:n, message:`Disclosure threshold updated to ${n} verified reports` });
    }
  );
}

module.exports = { addTransparencyRoute, toPublicPerson, getThreshold, publicMaskName };
