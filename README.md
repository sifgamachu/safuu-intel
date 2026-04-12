# ሳፉ · SAFUU INTEL

> **Safuu** (ሳፉ) — Oromo: *the moral order that holds society together*

Ethiopia's anonymous anti-corruption intelligence platform. Citizens report corruption via Telegram voice or text in any Ethiopian language. Evidence is forensically verified, cryptographically sealed, and publicly disclosed at a configurable threshold.

---

## Architecture

```
CITIZEN INPUT
├── Telegram Bot     → Voice (Whisper STT) + Text — 11-step structured intake
└── SMS Shortcode    → Africa's Talking — any feature phone, any language

INTELLIGENCE PIPELINE
├── Claude AI        → Tip analysis, categorization, routing
├── OpenAI Whisper   → Voice transcription (AM/OR/TI/SO/AF/SI/WO/HA/DA/GA/BE/EN)
├── Hive Moderation  → AI-generated image detection (94% accuracy)
├── EXIF Forensics   → Date/GPS verification against reported incident
├── Dedup Engine     → SHA-256 + phonetic name matching
└── Evidence Ledger  → Cryptographic hash chain (tamper-evident, court-ready)

DATA LAYER
└── SQLite (WAL)     → Persons, reports, sessions, dedup hashes, ledger, audit log

API LAYER
└── Express + WS     → REST API + WebSocket live streaming (127.0.0.1 only)

DASHBOARDS
├── Admin            → Splunk-grade investigative dashboard + ORACLE AI chat
├── Public Wall      → Progressive name disclosure — city/office shown below threshold
└── Notes Panel      → Multilingual tipper notes browser
```

---

## Features

### Anonymous Intake
- No username, user ID, name, or phone ever stored
- One-way SHA-256 dedup hashing — prevents spam flooding per person
- Sessions expire after 30 minutes of inactivity
- All sensitive fields encrypted at rest (AES-256-GCM, PBKDF2 310k iterations)

### Structured 11-Step Intake
| Step | Field | Notes |
|------|-------|-------|
| 1 | Official's name | Dedup checked before accepting |
| 2 | Title / position | Optional |
| 3 | Office / institution | Required |
| 4 | Incident date | today / yesterday / DD/MM/YYYY |
| 5 | Incident time | Optional |
| 6 | Location | City, building, woreda |
| 7 | Amount demanded | ETB, USD, or "a favour" |
| 8 | Official's phone | Optional, encrypted |
| 9 | Description | Min 20 chars, voice accepted |
| 10 | Photo evidence | EXIF + AI forensics |
| 11 | Notes in any language | Free text or voice, 11 languages |

### Progressive Name Disclosure
Names are hidden until verified reports reach the configurable threshold:
- **Below threshold** → city + office shown, name masked as `T••••••• B•••••`
- **At threshold** → full name disclosed publicly, case flagged for investigation
- **Admin-controlled** via `POST /api/admin/threshold`

### 11 Ethiopian Languages
`አማርኛ` · `Oromiffa` · `ትግርኛ` · `Soomaali` · `Qafar` · `Sidaamu Afoo` · `Wolayttatto` · `Hadiyyissa` · `Dawro` · `Gamo` · `Bench`

Voice notes transcribed by Whisper, language auto-detected, stored encrypted.

### Image Forensics
- Magic-byte validation (rejects PHP/EXE disguised as images)
- EXIF date extraction — compares photo date to reported incident date
- GPS presence detection
- Hive Moderation AI-generation detection
- Claude visual analysis — scene type, relevance, red flags

### Evidence Ledger
Every tip is cryptographically sealed in a hash chain:
```
block_hash = SHA256(tip_id + payload_hash + prev_block_hash + timestamp)
```
Tamper-evident. Court-ready. Integrity verified on every `/api/ledger` call.

---

## Quick Start

```bash
git clone https://github.com/yourusername/safuu-intel
cd safuu-intel
bash setup.sh          # Generates all secrets, installs deps, runs 76 tests
nano .env              # Fill in REPLACE_ME_ values
pm2 start ecosystem.config.js
```

### Required Environment Variables

| Variable | Source |
|----------|--------|
| `TELEGRAM_BOT_TOKEN` | [@BotFather](https://t.me/BotFather) |
| `ADMIN_CHANNEL_ID` | Private Telegram channel (starts with -100) |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) |
| `HIVE_AI_KEY` | [thehive.ai](https://thehive.ai) (free trial) |
| `ENCRYPTION_MASTER_KEY` | `openssl rand -hex 32` |
| `DEDUP_SALT` | `openssl rand -hex 32` |
| `JWT_SECRET` | `openssl rand -hex 32` |
| `DASHBOARD_API_KEY` | `openssl rand -hex 32` |

---

## File Structure

```
safuu-intel/
├── safuu-bot.js              # Telegram bot — full intake pipeline
├── safuu-server.js           # REST API + WebSocket server
├── safuu-sms.js              # Africa's Talking SMS intake
├── safuu-security.js         # AES-256-GCM, JWT, rate limiting, audit, RBAC
├── ecosystem.config.js       # PM2 process manager config
├── setup.sh                  # One-shot server setup script
├── test.js                   # 76 automated tests (no native deps required)
├── safuu-nginx.conf          # Hardened Nginx config (TLS 1.3, WAF-lite)
├── safuu-security.env.example # Full environment variable reference
├── package.json
│
├── dashboard/
│   ├── safuu-v2-dashboard.jsx     # Admin Splunk-grade dashboard + ORACLE AI
│   ├── safuu-public-wall.jsx      # Public transparency wall
│   ├── safuu-notes-panel.jsx      # Multilingual notes browser
│   └── safuu-landing.jsx          # Public landing page
│
└── data/                     # Auto-created, gitignored
    ├── safuu.db              # Main SQLite database
    ├── audit.db              # Tamper-evident audit log
    └── rate_limits.db        # Rate limiting state
```

---

## API Reference

All endpoints require `X-Api-Key` header or `Authorization: Bearer <JWT>`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | None | System health |
| POST | `/api/auth/login` | None | Get JWT token |
| GET | `/api/public/stats` | None | Aggregate counts (no PII) |
| GET | `/api/public/transparency` | None | Leaderboard with name masking |
| GET | `/api/persons` | API key | Full person registry |
| GET | `/api/persons/:id` | API key | Person + reports |
| POST | `/api/persons/:id/escalate` | Analyst+ | Change investigation status |
| GET | `/api/analytics` | API key | Stats, trends, breakdowns |
| GET | `/api/ledger` | API key | Evidence ledger + integrity check |
| GET | `/api/threshold/:n` | API key | Persons at threshold |
| GET | `/api/export/:id` | Analyst+ | Person intelligence file |
| POST | `/api/admin/threshold` | Analyst+ | Set disclosure threshold |
| GET | `/api/security/audit` | Admin | Security audit log |
| WS | `/ws?key=<key>` | API key | Live event stream |

---

## Security Model

- **Transport** — TLS 1.3 only, HSTS preload, OCSP stapling
- **Auth** — JWT HS256 (8hr expiry) + API key, timing-safe comparison
- **RBAC** — admin > analyst > viewer role hierarchy
- **Encryption** — AES-256-GCM at rest, PBKDF2 (SHA-512, 310k iter) key derivation
- **Rate limiting** — per-user sliding window per action (SQLite-backed)
- **Input** — magic-byte file validation, Unicode NFKC normalization, XSS stripping
- **Binding** — API server binds to 127.0.0.1 only, Nginx proxies externally
- **Headers** — Helmet + custom: CSP, HSTS, X-Frame-Options, Referrer-Policy
- **Audit** — tamper-evident hash chain audit log, no PII ever written
- **Anomaly detection** — report spikes, auth brute force, AI flag floods → Telegram alert

---

## Deployment

```bash
# 1. Server (Ubuntu 24.04 LTS, 2 vCPU / 2GB RAM minimum)
sudo apt install nginx certbot python3-certbot-nginx fail2ban unattended-upgrades

# 2. TLS
sudo certbot --nginx -d yourdomain.com
sudo openssl dhparam -out /etc/nginx/dhparam.pem 4096

# 3. Nginx
sudo cp safuu-nginx.conf /etc/nginx/sites-available/safuu-intel
sudo ln -s /etc/nginx/sites-available/safuu-intel /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 4. App
npm install --production
pm2 start ecosystem.config.js
pm2 save && pm2 startup

# 5. Verify
curl https://yourdomain.com/health
node test.js
```

---

## Ethiopian Reporting Bodies

| Agency | Hotline | Jurisdiction |
|--------|---------|-------------|
| **FEACC** — Federal Ethics & Anti-Corruption Commission | **959** | All corruption types |
| **EHRC** — Ethiopian Human Rights Commission | **1488** | Rights violations |
| **Ombudsman** | **6060** | Abuse of power |
| **Federal Police** | **911** | Criminal cases |
| **OFAG** — Office of the Federal Auditor General | +251 111 57 11 11 | Public fund misuse |

Safuu auto-routes each tip to the correct agency based on Claude's analysis.

---

## Test Suite

```bash
node test.js
```

76 automated tests across 14 groups — runs without native module builds, safe for CI:

- Encryption (7 tests) · Sanitization (15) · File validation (9)
- JWT lifecycle (5) · Rate limiting (3) · Nonces (4)
- Sessions (4) · Auth middleware (5) · RBAC (9)
- UUID validation (2) · Webhook verification (2) · SMS parser (4)
- Security headers (3) · Audit log (4)

---

## License

MIT — built for Ethiopian civic accountability.

---

*ሙስናን ሪፖርት አድርጉ። ሃገርዎን ያጠናክሩ።*
*Report corruption. Strengthen your country.*
