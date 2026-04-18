# SAFUU Intel — Bot Activation Guide

Everything needed to go from an empty Supabase project to a live, receiving-reports bot.

## Files in this package

```
supabase/001_schema.sql          — Paste into Supabase SQL Editor
lib/supabase.js                   — Supabase client (server-side)
lib/tipper-hash.js                — One-way tipper anonymization
lib/telegram.js                   — Telegram Bot API helper
lib/intake-prompts.js             — 11-language prompts + corruption types
app/api/telegram/webhook/route.js — Main webhook handler (the bot)
```

## One-time setup (you do this)

### 1. Rotate all exposed credentials FIRST

- Telegram: `@BotFather` → `/revoke` → pick `@SafuuIntelBot` → new token
- Supabase: Project Settings → API Keys → rotate both `publishable` and `secret`

### 2. Run the schema in Supabase

- Supabase dashboard → **SQL Editor** → **New query**
- Paste the full contents of `supabase/001_schema.sql`
- Click **Run**
- Verify in **Table Editor** — you should see: `persons`, `reports`, `telegram_sessions`, `subscribers`, `broadcasts`, `evidence_ledger`, `audit_log`

### 3. Generate a tipper hash salt

In your terminal, run:
```bash
openssl rand -hex 32
```
Copy the output. This goes in Vercel env vars as `TIPPER_HASH_SALT`.

### 4. Generate a webhook secret

```bash
openssl rand -hex 24
```
Copy the output. Goes in Vercel as `TELEGRAM_WEBHOOK_SECRET`.

### 5. Add 5 env vars to Vercel

Go to: `vercel.com/<your-org>/safuu-intel/settings/environment-variables`

| Name | Value | Environments |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | New token from BotFather | Production, Preview, Development |
| `TELEGRAM_WEBHOOK_SECRET` | Output of `openssl rand -hex 24` | All |
| `SUPABASE_URL` | `https://chrsmcxqyfcsrcvbamky.supabase.co` | All |
| `SUPABASE_SERVICE_ROLE_KEY` | New rotated `secret` key from Supabase | All |
| `TIPPER_HASH_SALT` | Output of `openssl rand -hex 32` | All |

### 6. Push the code

Copy the 5 files above into the `sifgamachu/safuu-intel` repo at their exact paths, commit, push. Vercel auto-deploys.

Also add `@supabase/supabase-js` to `package.json`:
```bash
npm install @supabase/supabase-js
```

### 7. Register the webhook with Telegram

Once the deployment is live, run this curl (substitute your values):

```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://safuu.net/api/telegram/webhook",
    "secret_token": "<TELEGRAM_WEBHOOK_SECRET>",
    "allowed_updates": ["message", "callback_query"],
    "drop_pending_updates": true
  }'
```

Expected response: `{"ok":true,"result":true,"description":"Webhook was set"}`

Verify with:
```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

### 8. Test

Open `t.me/SafuuIntelBot` → tap **Start** → send `/report`. You should see the language menu appear.

Submit a test report end-to-end. Then go to Supabase → Table Editor → `reports` and confirm the row is there.

## Troubleshooting

- **Bot doesn't respond** → Check `getWebhookInfo`. If `last_error_message` is set, look at Vercel function logs.
- **"unauthorized" errors in logs** → webhook secret mismatch between Telegram and `TELEGRAM_WEBHOOK_SECRET` env var.
- **DB write failures** → service role key is wrong, or RLS is misconfigured. Confirm `SUPABASE_SERVICE_ROLE_KEY` is the `secret`, not the `publishable`.
- **Session stuck** → Send `/cancel` to clear the in-flight session, or in Supabase run `DELETE FROM telegram_sessions WHERE last_activity < now() - interval '1 hour';`

## Security checklist before going public

- [ ] All env vars in Vercel, none in git
- [ ] Supabase RLS enabled on all tables (schema does this)
- [ ] `TIPPER_HASH_SALT` is 32+ hex chars, set once and never rotated without a migration plan
- [ ] `TELEGRAM_WEBHOOK_SECRET` is set — webhook rejects unsigned requests
- [ ] Webhook URL uses HTTPS (Vercel does this by default)
- [ ] No logging of raw `chat_id`, phone numbers, or message content in application logs
- [ ] Supabase Pro plan (so DB doesn't auto-pause)
- [ ] Backup/retention policy decided (Supabase Pro includes PITR)
