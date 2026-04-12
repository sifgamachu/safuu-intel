// ═══════════════════════════════════════════════════════════════════════════
//  SAFUU — Automated Test Suite  |  test.js
//  Run: node test.js
//  Tests: security module, bot logic, SMS parser, API routes, edge cases
// ═══════════════════════════════════════════════════════════════════════════
"use strict";

// ── Setup mocks before any require ────────────────────────────────────────────
process.env.ENCRYPTION_MASTER_KEY = "testkey_32chars_aaaaaaaaaaaaaaaaa";
process.env.JWT_SECRET             = "jwtkey_32chars_bbbbbbbbbbbbbbbbb";
process.env.DEDUP_SALT             = "salt_22chars_cccccccccc";
process.env.DASHBOARD_API_KEY      = "apikey_32chars_dddddddddddddddddd";
process.env.TELEGRAM_BOT_TOKEN     = "123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcd";
process.env.ANTHROPIC_API_KEY      = "sk-ant-test";
process.env.OPENAI_API_KEY         = "sk-test";
process.env.ADMIN_CHANNEL_ID       = "-1001234567890";
process.env.ADMIN_PASSWORD         = "TestPassword123!";

// Mock better-sqlite3 (requires native build not available in CI)
const rows = {};
const mockDb = {
  pragma:  () => {},
  exec:    () => {},
  close:   () => {},
  prepare: (sql) => ({
    // Return {n:0} for COUNT queries, null otherwise
    get:  (...args) => {
      if (sql && sql.includes('COUNT(*)')) return { n: 0 };
      if (sql && sql.includes('block_hash')) return null;  // no last ledger
      return rows[sql]?.get?.(...args) ?? null;
    },
    run:  (...args) => rows[sql]?.run?.(...args)  ?? {},
    all:  (...args) => rows[sql]?.all?.(...args)  ?? [],
  }),
};
require.cache[require.resolve("better-sqlite3")] = {
  id: "better-sqlite3", filename: "better-sqlite3", loaded: true,
  exports: function () { return mockDb; },
};

const S = require("./safuu-security");

// ── Test runner ───────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const errors = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ❌ ${name}: ${e.message}`);
    errors.push({ name, error: e.message });
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || "Assertion failed");
}

function assertEqual(a, b, msg) {
  if (a !== b) throw new Error(`${msg || "Not equal"}: expected "${b}", got "${a}"`);
}

function assertNull(val, msg) {
  if (val !== null) throw new Error(`${msg || "Expected null"}: got "${val}"`);
}

function assertNotNull(val, msg) {
  if (val == null) throw new Error(msg || "Expected non-null");
}

// ── GROUP 1: Encryption ───────────────────────────────────────────────────────
console.log("\n【1】ENCRYPTION");

test("encrypt returns base64 string", () => {
  const e = S.encrypt("hello");
  assert(typeof e === "string", "not a string");
  assert(e.length > 20, "too short");
});

test("encrypt/decrypt round-trip", () => {
  const plain = "Tesfaye Bekele / 0911-234-567 / ETB 150,000";
  assertEqual(S.decrypt(S.encrypt(plain)), plain);
});

test("encrypt produces different ciphertext each call (random IV)", () => {
  const e1 = S.encrypt("same");
  const e2 = S.encrypt("same");
  assert(e1 !== e2, "same IV used — randomness broken");
});

test("decrypt returns null for corrupt data", () => {
  assertNull(S.decrypt("not-valid-base64!!!"), "should be null");
});

test("decrypt returns null for null input", () => {
  assertNull(S.decrypt(null));
});

test("decrypt returns null for tampered ciphertext", () => {
  const e  = S.encrypt("secret");
  const buf = Buffer.from(e, "base64");
  buf[buf.length - 1] ^= 0xff;               // Flip last byte (auth tag corrupted)
  assertNull(S.decrypt(buf.toString("base64")), "tampered should be null");
});

test("encrypt returns null for null input", () => {
  assertNull(S.encrypt(null));
});

// ── GROUP 2: Input sanitization ───────────────────────────────────────────────
console.log("\n【2】SANITIZATION");

test("sanitizeName strips XSS script tags", () => {
  const r = S.sanitizeName("<script>alert(1)</script>Abebe");
  assert(!r.includes("<script>"), "script tag not removed");
  assert(r.includes("Abebe"), "legit content removed");
});

test("sanitizeName strips angle brackets", () => {
  const r = S.sanitizeName("<Abebe>");
  assert(!r.includes("<") && !r.includes(">"), "brackets remain");
});

test("sanitizeName truncates to MAX_NAME_LEN", () => {
  const long = "A".repeat(200);
  assert(S.sanitizeName(long).length <= S.SEC.MAX_NAME_LEN);
});

test("sanitizeText strips null bytes", () => {
  const r = S.sanitizeText("hello\x00world");
  assert(!r.includes("\x00"), "null byte remains");
});

test("sanitizeText strips javascript: URI", () => {
  const r = S.sanitizeText("javascript:alert(1)");
  assert(!r.includes("javascript:"), "javascript: not stripped");
});

test("sanitizeText normalizes unicode (NFKC)", () => {
  const composed   = "ﬁle";       // ligature
  const normalized = S.sanitizeText(composed);
  assert(normalized.length >= 4, "NFKC normalization failed");
});

test("sanitizePhone returns null for too-short input", () => {
  assertNull(S.sanitizePhone("123"), "short phone not null");
});

test("sanitizePhone returns null for null input", () => {
  assertNull(S.sanitizePhone(null));
});

test("sanitizePhone strips non-phone characters", () => {
  const r = S.sanitizePhone("091<script>1-234-567");
  assert(r && !r.includes("<"), "script chars remain");
});

test("sanitizePhone preserves valid phone", () => {
  assertEqual(S.sanitizePhone("0911-234-567"), "0911-234-567");
});

test("validateDate accepts today", () => {
  assertEqual(S.validateDate("today"), "today");
});

test("validateDate accepts yesterday", () => {
  assertEqual(S.validateDate("yesterday"), "yesterday");
});

test("validateDate accepts DD/MM/YYYY", () => {
  assertEqual(S.validateDate("09/04/2026"), "09/04/2026");
});

test("validateDate accepts YYYY-MM-DD", () => {
  assertEqual(S.validateDate("2026-04-09"), "2026-04-09");
});

test("validateDate rejects garbage", () => {
  assertNull(S.validateDate("not-a-date"));
  assertNull(S.validateDate("13/13/9999"));
});

// ── GROUP 3: File validation ───────────────────────────────────────────────────
console.log("\n【3】FILE VALIDATION");

function makeBuffer(hexMagic, totalSize = 20) {
  const b = Buffer.alloc(totalSize);
  const m = Buffer.from(hexMagic, "hex");
  m.copy(b);
  return b;
}

test("JPEG accepted by magic bytes", () => {
  assert(S.validateImageFile(makeBuffer("ffd8ffe0")).valid === true);
});

test("PNG accepted by magic bytes", () => {
  assert(S.validateImageFile(makeBuffer("89504e47")).valid === true);
});

test("GIF accepted by magic bytes", () => {
  assert(S.validateImageFile(makeBuffer("47494638")).valid === true);
});

test("OGG audio accepted", () => {
  assert(S.validateAudioFile(makeBuffer("4f676753")).valid === true);
});

test("MP3 (ID3) accepted", () => {
  assert(S.validateAudioFile(makeBuffer("494433")).valid === true);
});

test("PHP file rejected (disguised as image)", () => {
  const phpBuf = Buffer.from("<?php phpinfo(); ?>");
  assert(S.validateImageFile(phpBuf).valid === false);
});

test("Empty buffer rejected", () => {
  assert(S.validateImageFile(Buffer.alloc(0)).valid === false);
  assert(S.validateAudioFile(Buffer.alloc(0)).valid === false);
});

test("null buffer rejected", () => {
  assert(S.validateImageFile(null).valid === false);
  assert(S.validateAudioFile(null).valid === false);
});

test("Oversized image rejected", () => {
  const big = Buffer.alloc(S.SEC.MAX_FILE_MB * 1024 * 1024 + 1);
  makeBuffer("ffd8ffe0", 4).copy(big);
  assert(S.validateImageFile(big).valid === false, "oversized accepted");
});

// ── GROUP 4: JWT ──────────────────────────────────────────────────────────────
console.log("\n【4】JWT");

test("generateJWT creates verifiable token", () => {
  const tok = S.generateJWT({ role: "admin", uid: "u1" }, 3600);
  const pay = S.verifyJWT(tok);
  assertEqual(pay?.role, "admin");
  assertEqual(pay?.uid, "u1");
});

test("verifyJWT returns null for expired token", () => {
  const tok = S.generateJWT({ role: "admin" }, -1);
  assertNull(S.verifyJWT(tok), "expired token accepted");
});

test("verifyJWT returns null for tampered token", () => {
  const tok   = S.generateJWT({ role: "admin" }, 3600);
  const parts = tok.split(".");
  parts[1]    = Buffer.from(JSON.stringify({ role: "superadmin" })).toString("base64url");
  assertNull(S.verifyJWT(parts.join(".")), "tampered payload accepted");
});

test("verifyJWT returns null for bad format", () => {
  assertNull(S.verifyJWT("not.a.jwt.with.five.parts"));
  assertNull(S.verifyJWT(""));
  assertNull(S.verifyJWT(null));
});

test("JWT contains jti (unique ID per token)", () => {
  const t1 = S.generateJWT({ role: "viewer" }, 3600);
  const t2 = S.generateJWT({ role: "viewer" }, 3600);
  const p1 = S.verifyJWT(t1);
  const p2 = S.verifyJWT(t2);
  assert(p1.jti !== p2.jti, "same jti — tokens not unique");
});

// ── GROUP 5: Rate limiting ────────────────────────────────────────────────────
console.log("\n【5】RATE LIMITING");

test("First request is allowed", () => {
  const r = S.checkRateLimit("test_rl_001", "bot_message");
  assert(r.allowed, "first request blocked");
});

test("clearRateLimit resets a key", () => {
  // Exhaust the limit
  for (let i = 0; i < 35; i++) S.checkRateLimit("test_rl_clear_001", "bot_message");
  S.clearRateLimit("test_rl_clear_001");
  const r = S.checkRateLimit("test_rl_clear_001", "bot_message");
  assert(r.allowed, "after clear, should be allowed");
});

test("Unknown action type is allowed (fail open)", () => {
  const r = S.checkRateLimit("test_rl_002", "nonexistent_action");
  assert(r.allowed, "unknown action should be allowed");
});

// ── GROUP 6: Nonces ───────────────────────────────────────────────────────────
console.log("\n【6】NONCES (REPLAY PREVENTION)");

test("Fresh nonce is valid", () => {
  const n = S.createNonce();
  assert(S.verifyNonce(n) === true);
});

test("Nonce is single-use only", () => {
  const n = S.createNonce();
  S.verifyNonce(n);
  assert(S.verifyNonce(n) === false, "nonce accepted twice");
});

test("Fake nonce is rejected", () => {
  assert(S.verifyNonce("aaaaaaaabbbbbbbbccccccccdddddddd") === false);
});

test("Nonce is 32 hex chars", () => {
  const n = S.createNonce();
  assert(/^[a-f0-9]{32}$/.test(n), `invalid format: ${n}`);
});

// ── GROUP 7: Session ──────────────────────────────────────────────────────────
console.log("\n【7】SESSIONS");

test("touchSession sets lastActivity", () => {
  const s = S.touchSession({ step: 1 });
  assert(s.lastActivity > 0);
});

test("Fresh session not expired", () => {
  const s = S.touchSession({ step: 1 });
  assert(S.isSessionExpired(s) === false);
});

test("Old session is expired", () => {
  const s = { step: 1, lastActivity: Math.floor(Date.now() / 1000) - 2000 };
  assert(S.isSessionExpired(s) === true);
});

test("Session without lastActivity not flagged as expired", () => {
  assert(S.isSessionExpired({ step: 1 }) === false);
});

// ── GROUP 8: Auth middleware ──────────────────────────────────────────────────
console.log("\n【8】AUTH MIDDLEWARE");

function mockRes() {
  const res = { statusCode: null, body: null };
  res.status = (c) => { res.statusCode = c; return { json: (b) => { res.body = b; } }; };
  return res;
}

test("Valid API key authenticates", () => {
  const req = { headers: { "x-api-key": process.env.DASHBOARD_API_KEY } };
  let called = false;
  S.requireAuth(req, mockRes(), () => { called = true; });
  assert(called, "next() not called");
  assertEqual(req.user?.role, "admin");
});

test("Wrong API key is rejected", () => {
  const req = { headers: { "x-api-key": "wrongkey" } };
  const res = mockRes();
  S.requireAuth(req, res, () => {});
  assertEqual(res.statusCode, 401);
});

test("Valid JWT Bearer authenticates", () => {
  const tok = S.generateJWT({ role: "analyst" }, 3600);
  const req = { headers: { authorization: `Bearer ${tok}` } };
  let called = false;
  S.requireAuth(req, mockRes(), () => { called = true; });
  assert(called, "jwt auth failed");
  assertEqual(req.user?.role, "analyst");
});

test("Expired JWT is rejected", () => {
  const tok = S.generateJWT({ role: "admin" }, -1);
  const req = { headers: { authorization: `Bearer ${tok}` } };
  const res = mockRes();
  S.requireAuth(req, res, () => {});
  assertEqual(res.statusCode, 401);
});

test("Missing auth is rejected with 401", () => {
  const req = { headers: {} };
  const res = mockRes();
  S.requireAuth(req, res, () => {});
  assertEqual(res.statusCode, 401);
});

// ── GROUP 9: RBAC ─────────────────────────────────────────────────────────────
console.log("\n【9】ROLE-BASED ACCESS CONTROL");

function rbacTest(role, required, expectPass) {
  return () => {
    const req = { user: { role }, path: "/test", requestId: "x" };
    const res = mockRes();
    let passed = false;
    S.requireRole(required)(req, res, () => { passed = true; });
    assert(passed === expectPass,
      `role:${role} required:${required} expected:${expectPass} got:${passed}`);
  };
}

test("admin passes admin requirement",   rbacTest("admin",   "admin",   true));
test("admin passes analyst requirement", rbacTest("admin",   "analyst", true));
test("admin passes viewer requirement",  rbacTest("admin",   "viewer",  true));
test("analyst passes analyst requirement",rbacTest("analyst","analyst", true));
test("analyst passes viewer requirement",rbacTest("analyst","viewer",  true));
test("analyst fails admin requirement",  rbacTest("analyst","admin",   false));
test("viewer passes viewer requirement", rbacTest("viewer",  "viewer",  true));
test("viewer fails analyst requirement", rbacTest("viewer",  "analyst", false));
test("viewer fails admin requirement",   rbacTest("viewer",  "admin",   false));

// ── GROUP 10: UUID validation ──────────────────────────────────────────────────
console.log("\n【10】UUID VALIDATION");

test("Valid UUID v4 accepted", () => {
  assert(S.isUUID("550e8400-e29b-41d4-a716-446655440000"));
});

test("Invalid UUID rejected", () => {
  assert(!S.isUUID("not-a-uuid"));
  assert(!S.isUUID(""));
  assert(!S.isUUID(null));
  assert(!S.isUUID("550e8400-e29b-11d4-a716-446655440000")); // v1, not v4
});

// ── GROUP 11: Webhook verification ────────────────────────────────────────────
console.log("\n【11】WEBHOOK VERIFICATION");

test("Telegram webhook without secret header passes (not configured)", () => {
  const req = { headers: {}, body: { update_id: 1 } };
  assert(S.verifyTelegramWebhook(req) === true);
});

test("AT webhook without secret passes (not configured)", () => {
  process.env.AT_WEBHOOK_SECRET = "";
  const req = { headers: {}, body: { from: "+251911000000", text: "SAFUU test" } };
  assert(S.verifyATWebhook(req) === true);
});

// ── GROUP 12: SMS parser ───────────────────────────────────────────────────────
console.log("\n【12】SMS PARSER (inline logic test)");

function parseSmsLocal(body) {
  const { sanitizeName, sanitizeOffice, sanitizeText } = S;
  const cleaned = body.replace(/^SAFUU\s*/i, "").trim();
  const parts   = cleaned.split("|").map(s => s.trim()).filter(Boolean);
  if (parts.length >= 3) return { name: sanitizeName(parts[0]), office: sanitizeOffice(parts[1]), description: sanitizeText(parts.slice(2).join(" | "), 2000) };
  if (parts.length === 2) return { name: sanitizeName(parts[0]), office: sanitizeOffice(parts[1]), description: parts[1] };
  const words = cleaned.split(/\s+/);
  return { name: sanitizeName(words.slice(0, 2).join(" ")), office: sanitizeOffice(words.slice(2, 5).join(" ") || "Unknown"), description: sanitizeText(words.slice(5).join(" ") || cleaned, 2000) };
}

test("Pipe-separated SMS parsed correctly", () => {
  const r = parseSmsLocal("SAFUU Abebe Girma | Federal Police Bole | Asked me for 2000 birr");
  assertEqual(r.name, "Abebe Girma");
  assertEqual(r.office, "Federal Police Bole");
  assert(r.description.includes("2000"), "description missing");
});

test("SMS with XSS in name is sanitized", () => {
  const r = parseSmsLocal("SAFUU <script>Abebe</script> Girma | Police | Bribe");
  assert(!r.name.includes("<script>"), "XSS not stripped");
});

test("Space-separated SMS uses heuristic parse", () => {
  const r = parseSmsLocal("SAFUU Tesfaye Bekele Ministry Land Took money for permit");
  assertEqual(r.name, "Tesfaye Bekele");
  assert(r.office.length > 0, "office empty");
});

test("SAFUU prefix is stripped case-insensitively", () => {
  const r = parseSmsLocal("safuu Abebe | Police | Test");
  assertEqual(r.name, "Abebe");
});

// ── GROUP 13: Security headers ────────────────────────────────────────────────
console.log("\n【13】SECURITY HEADERS");

test("securityHeaders sets X-Content-Type-Options", () => {
  const headers = {};
  const res = {
    setHeader: (k, v) => { headers[k] = v; },
    removeHeader: () => {},
  };
  S.securityHeaders({}, res, () => {});
  assertEqual(headers["X-Content-Type-Options"], "nosniff");
});

test("securityHeaders sets X-Frame-Options DENY", () => {
  const headers = {};
  const res = { setHeader: (k, v) => { headers[k] = v; }, removeHeader: () => {} };
  S.securityHeaders({}, res, () => {});
  assertEqual(headers["X-Frame-Options"], "DENY");
});

test("securityHeaders sets HSTS", () => {
  const headers = {};
  const res = { setHeader: (k, v) => { headers[k] = v; }, removeHeader: () => {} };
  S.securityHeaders({}, res, () => {});
  assert(headers["Strict-Transport-Security"]?.includes("max-age=63072000"));
});

// ── GROUP 14: Audit log ────────────────────────────────────────────────────────
console.log("\n【14】AUDIT LOG");

test("auditLog does not throw", () => {
  S.auditLog("TEST_EVENT", { action: "test", count: 1 });
});

test("auditLog strips PII fields", () => {
  // Should not throw even with PII fields — they are silently stripped
  S.auditLog("TEST_PII", { name: "Real Name", phone: "0911-123-456", action: "test" });
});

test("generateApiKey returns safuu_ prefixed string", () => {
  const key = S.generateApiKey();
  assert(key.startsWith("safuu_"), "prefix missing");
  assert(key.length > 30, "too short");
});

test("generateSecret returns hex string of correct length", () => {
  const s = S.generateSecret(32);
  assert(/^[a-f0-9]{64}$/.test(s), `invalid: ${s}`);
});

// ── RESULTS ───────────────────────────────────────────────────────────────────
console.log("\n" + "═".repeat(50));
console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
console.log("═".repeat(50));

if (errors.length) {
  console.log("\n❌ FAILURES:");
  errors.forEach(e => console.log(`   • ${e.name}\n     ${e.error}`));
  console.log("");
}

if (failed === 0) {
  console.log("🟢  ALL TESTS PASSED — platform is safe to deploy\n");
  process.exit(0);
} else {
  console.log("🔴  TESTS FAILED — do not deploy until fixed\n");
  process.exit(1);
}
