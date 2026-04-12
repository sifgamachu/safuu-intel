# SAFUU Backend Services

This folder contains the Node.js backend services:

| File | Description |
|------|-------------|
| `safuu-bot.js` | Telegram bot — 11-step anonymous intake |
| `safuu-server.js` | REST API + WebSocket server |
| `safuu-server-secure.js` | Hardened server variant |
| `safuu-sms.js` | Africa's Talking SMS intake |
| `safuu-security.js` | AES-256-GCM, JWT, RBAC, audit log |
| `safuu-transparency-api.js` | Progressive disclosure endpoints |
| `ecosystem.config.js` | PM2 process manager config |
| `setup.sh` | One-shot server setup script |
| `test.js` | 76 automated security tests |
| `safuu-nginx.conf` | Hardened Nginx config |

## Deploy

```bash
cd backend
cp safuu-security.env.example .env
nano .env  # fill in your values
npm install
pm2 start ecosystem.config.js
```
