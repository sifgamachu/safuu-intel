# ሳፉ · SAFUU INTEL

> **Safuu** (ሳፉ) — Oromo: *the moral order that holds society together*

Ethiopia's anonymous anti-corruption intelligence platform. Citizens report via Telegram voice/text or SMS in any Ethiopian language. Evidence is AI-verified, cryptographically sealed, and publicly disclosed at a configurable threshold.

**🌐 Live:** [safuu-intel.vercel.app](https://safuu-intel.vercel.app) → target domain: [safuu.net](https://safuu.net)  
**📊 Transparency Wall:** [safuu-intel.vercel.app/transparency](https://safuu-intel.vercel.app/transparency)  
**💻 Source:** [github.com/sifgamachu/safuu-intel](https://github.com/sifgamachu/safuu-intel)

---

## Platform Overview

```
CITIZEN INPUT
├── Telegram Bot     → Voice (Whisper STT) + Text — 11-step structured intake
└── SMS Shortcode    → Africa's Talking — any feature phone

INTELLIGENCE PIPELINE
├── Claude AI        → Tip analysis, categorization, routing
├── OpenAI Whisper   → Voice transcription (11 Ethiopian languages)
├── Hive Moderation  → AI-generated image detection (94% accuracy)
├── EXIF Forensics   → Date/GPS verification vs reported incident
├── Dedup Engine     → SHA-256 + phonetic name matching
└── Evidence Ledger  → Cryptographic hash chain (tamper-evident, court-ready)

PUBLIC INTERFACE
├── Landing Page     → safuu.net
└── Transparency Wall → safuu.net/transparency (progressive name disclosure)

ADMIN INTERFACE
└── Dashboard        → Splunk-grade investigative panel + ORACLE AI chat
```

---

## Architecture

### File Structure

```
safuu-intel/
│
├── app/                          ← Next.js website (auto-deployed by Vercel)
│   ├── layout.js                 ← Playfair Display + Space Grotesk fonts
│   ├── page.js                   ← Landing page (investigative cyber design)
│   ├── transparency/page.js      ← Public accountability wall
│   ├── sitemap.js                ← SEO sitemap
│   ├── robots.js                 ← Robots.txt
│   └── not-found.js              ← Custom 404
│
├── backend/                      ← Node.js backend services
│   ├── safuu-bot.js              ← Telegram bot (11-step intake)
│   ├── safuu-server.js           ← REST API + WebSocket
│   ├── safuu-server-secure.js    ← Hardened server variant
│   ├── safuu-sms.js              ← Africa's Talking SMS intake
│   ├── safuu-security.js         ← AES-256-GCM, JWT, RBAC, audit log
│   ├── safuu-transparency-api.js ← Progressive disclosure endpoints
│   ├── ecosystem.config.js       ← PM2 config
│   ├── setup.sh                  ← One-shot server setup
│   ├── test.js                   ← 76 automated security tests
│   └── safuu-nginx.conf          ← Hardened Nginx config
│
├── dashboard/                    ← Admin React components
│   ├── safuu-v2-dashboard.jsx    ← Splunk-grade dashboard + ORACLE AI
│   ├── safuu-public-wall.jsx     ← Public transparency wall (JSX source)
│   ├── safuu-notes-panel.jsx     ← Multilingual notes browser
│   └── safuu-landing.jsx         ← Legacy landing page
│
├── next.config.js
├── package.json
├── vercel.json
└── .gitignore
```

---

## 11 Ethiopian Languages

```
አማርኛ (Amharic)   ·   Oromiffa   ·   ትግርኛ (Tigrinya)   ·   Soomaali
Qafar (Afar)      ·   Sidaamu    ·   Wolayttatto        ·   Hadiyyissa
Dawro              ·   Gamo       ·   Bench               ·   English
```

---

## Progressive Name Disclosure

| Reports | What's Shown |
|---------|-------------|
| 0–14    | City + Office only · Name masked as `T••••••• B•••••` |
| 15+     | Full name disclosed · Case escalated to agency |

Threshold is admin-configurable via `POST /api/admin/threshold`.

---

## Security Architecture

| Layer | Implementation |
|-------|---------------|
| Identity | One-way SHA-256 hash — never stored, never reversible |
| Encryption | AES-256-GCM at rest, PBKDF2 SHA-512 310k iterations |
| Auth | JWT HS256 (8hr) + API key, timing-safe comparison |
| RBAC | admin(3) > analyst(2) > viewer(1) |
| Rate limiting | SQLite sliding-window per action per user |
| Evidence | Tamper-evident hash chain — court-ready |
| Audit | No-PII audit log with hash chain |
| Transport | TLS 1.3 only, HSTS preload |

---

## Quick Start — Backend

```bash
# 1. Clone
git clone https://github.com/sifgamachu/safuu-intel
cd safuu-intel/backend

# 2. Setup (generates secrets, installs deps, runs tests)
bash setup.sh

# 3. Configure
cp safuu-security.env.example .env
nano .env   # fill in REPLACE_ME_ values

# 4. Start
pm2 start ecosystem.config.js
pm2 save && pm2 startup

# 5. Verify
node test.js          # 76 tests, all should pass
curl localhost:3001/health
```

### Required Environment Variables

| Variable | Source |
|----------|--------|
| `TELEGRAM_BOT_TOKEN` | [@BotFather](https://t.me/BotFather) |
| `ADMIN_CHANNEL_ID` | Private Telegram channel (starts with -100) |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) |
| `HIVE_AI_KEY` | [thehive.ai](https://thehive.ai) |
| `ENCRYPTION_MASTER_KEY` | `openssl rand -hex 32` |
| `DEDUP_SALT` | `openssl rand -hex 32` |
| `JWT_SECRET` | `openssl rand -hex 32` |
| `DASHBOARD_API_KEY` | `openssl rand -hex 32` |

---

## Domain Setup (safuu.net → Vercel)

1. **Vercel Dashboard** → safuu-intel project → **Settings → Domains** → Add `safuu.net` and `www.safuu.net`

2. **Add DNS records at your registrar:**

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

3. DNS propagation: 5–30 minutes. Then `safuu.net` will serve the platform.

---

## API Reference

All endpoints require `X-Api-Key` header or `Authorization: Bearer <JWT>`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | None | System health |
| POST | `/api/auth/login` | None | Get JWT |
| GET | `/api/public/stats` | None | Aggregate counts (no PII) |
| GET | `/api/public/transparency` | None | Leaderboard with masking |
| GET | `/api/persons` | API key | Full person registry |
| POST | `/api/persons/:id/escalate` | Analyst+ | Change investigation status |
| GET | `/api/analytics` | API key | Stats, trends, breakdowns |
| GET | `/api/ledger` | API key | Evidence ledger + integrity |
| POST | `/api/admin/threshold` | Analyst+ | Set disclosure threshold |
| GET | `/api/security/audit` | Admin | Audit log |
| WS | `/ws?key=<key>` | API key | Live event stream |

---

## Ethiopian Accountability Bodies

| Agency | Hotline | Jurisdiction |
|--------|---------|-------------|
| **FEACC** | **959** | All corruption types |
| **EHRC** | **1488** | Human rights violations |
| **Ombudsman** | **6060** | Abuse of power |
| **Federal Police** | **911** | Criminal cases |
| **OFAG** | +251 111 57 11 11 | Public fund misuse |

---

## Test Suite

```bash
cd backend && node test.js
```

76 automated tests across 14 groups — no native module builds required:

Identity & Encryption · Input Sanitization · File Validation · JWT Lifecycle  
Rate Limiting · Nonces · Sessions · Auth Middleware · RBAC  
UUID Validation · Webhook Verification · SMS Parser · Security Headers · Audit Log

---

## License

MIT — built for Ethiopian civic accountability.

---

*ሙስናን ሪፖርት አድርጉ። ሃገርዎን ያጠናክሩ།*  
*Report corruption. Strengthen your country.*
