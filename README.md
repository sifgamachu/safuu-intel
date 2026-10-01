# Safuu · civic accountability

Private corruption reporting for Ethiopia, with a receipt after a confirmed save, human review, and an approved public record.

## Current application

The supported production path is **Next.js + Supabase**, in the root of this repository. The `backend/` SQLite bots and the separate `dashboard/` are legacy prototypes, not the production database or review desk. Do not run a polling bot alongside the webhook for the same Telegram token.

- Three-step web intake in English, Amharic, Afaan Oromoo, Tigrinya, and Somali.
- Text Telegram intake with optional private photo, PDF, or audio evidence. Automatic transcription and translation are not enabled.
- Atomic report, case, evidence references, ledger entry, and receipt save.
- Client request IDs and keyed fingerprints prevent duplicate submissions on retry.
- Private storage with direct signed uploads (up to four files, 10 MB each).
- Durable encrypted Telegram jobs, per-chat ordering, leased workers, and provider throttling.
- Protected staff review desk at `/admin`. Staff access requires Supabase Auth, a server-managed role, and MFA by default.
- Public totals and cases come from the database. Pending names, narratives, and evidence are not exposed.
- Publication requires a case threshold of distinct reviewed reporting identities and a separate authorized human decision. Distinct identities are not proof of distinct people.

SMS is not provisioned. A receipt confirms storage, not guilt or a review deadline. No service can guarantee complete anonymity.

## Development

Use Node 22.19.0 or later. Dependencies and lockfiles are pinned.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Set the required server variables in `.env.local`; never prefix the service key or privacy salt with `NEXT_PUBLIC_`. The browser calls server routes and only receives narrowly scoped private upload/download links.

For an existing Supabase project initialized with `supabase/001_schema.sql`, apply the SQL files in `supabase/migrations/` in timestamp order before deploying this app. It adds the v2 tables/RPCs and removes automatic disclosure. For a new project, initialize `001_schema.sql` and then apply the migration files. The historical schema comments describe the old prototype; the v2 migration and this README are authoritative for current behaviour.

## Production setup

1. Apply the migration in staging and verify the app there. Keep the migration ahead of the app deployment.
2. Configure the same `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `TIPPER_HASH_SALT` in the app and workers. The privacy salt also derives the application encryption key: back it up separately from the database and do not rotate it blindly. A versioned key rotation process is required before a broad rollout.
3. Configure Telegram webhook secrets and a bot token. The webhook acknowledges only after a durable enqueue; it returns 503 on persistence failure so Telegram can retry. Use private chats only.
4. The scheduled-drain migration prepares a one-minute Supabase Cron backstop and hourly queue maintenance, both initially inactive. It keeps the bearer credential in Vault; the app reads only a digest through a service-only RPC. After the production route is live, verify `SELECT safuu_ops.request_worker();` through `net._http_response`, then activate the two named jobs using `cron.alter_job(jobid, active := true)`. Never print Vault values or request headers. For staging, change the fixed endpoint to the staging app before enabling any job. A separate scheduler can still POST `/api/internal/worker` using a strong `CRON_SECRET`. For national throughput, run `npm run worker` as a persistent service with the same app secrets; multiple workers can share the queue. The webhook's `after()` drain accelerates processing while the scheduled drain covers quiet-period retries.
5. Create staff users through an authorized administrative process and grant the verified Auth UUID a `reviewer`, `publisher`, or `admin` entry in `public.staff_members`. Then staff enter their credentials at `/admin`, choose **Set up authenticator**, scan the QR code or enter the setup key in their authenticator app, and verify a six-digit code. The ten-minute enrollment cookie cannot access private reports; review access starts only after verification. Existing enrolled staff sign in with their code. Roles do not come from editable user metadata. There is no public staff signup. Do not disable MFA in production. A lost authenticator requires an authorized administrator-assisted recovery; this UI does not remove verified factors.
6. Configure both Turnstile keys, allowed hostname, and edge abuse controls before national promotion. Cookie-based limits alone are easy to evade by obtaining another cookie. Uploaded files are reserved through rate-limited routes; provider-level storage quotas and upload abuse controls are still required.
7. Verify actual hosting quotas, database compute, backups, key recovery, monitoring, and review staffing. See [deployment and capacity plan](docs/SCALING.md).

Existing hosting, checked 30 September 2026: application on Vercel; domain registration and DNS with Cloudflare. Deployment URLs and configured project quotas must be checked in the hosting account; this repository does not provision paid plans.

## Delivery status

See [the public claims and delivery audit](docs/DELIVERY-AUDIT.md) and [the forms and setup acceptance record](docs/FORM-AND-SETUP-AUDIT.md). Live `/status` separates database/storage checks, staff setup, bot/webhook configuration, and the worker heartbeat. The reporting form discloses pending review setup. A configured directory is not a review deadline; appoint and enroll real staff before relying on human review.

## Verification

```sh
npm test
npm run build
npm run load:test
```

The load test is **local only**: it starts production Next instances and a temporary database HTTP harness. It submits synthetic reports and refuses production URLs. Default: **20,000 clients**, starting together for each of three bursts (public reads, submissions, identical retries), across four application/client processes. The report records actual peak outstanding requests, failures, latency, and transaction integrity. `LOAD_CONCURRENCY=100 npm run load:test` is the CI smoke test.

For a real, isolated PostgreSQL 17 database rather than the default PostgreSQL WASM/PGlite harness, run as an unprivileged user with `LOAD_POSTGRES_BIN=/path/to/postgresql/17/bin npm run load:test`. The `20,000-client capacity check` workflow runs this profile on GitHub Actions. It never connects to the live whistleblower database. [Capacity changes and measured evidence](docs/CAPACITY-20000.md).

The transaction tests cover rollback, ownership, replay, receipt access, public isolation, disclosure gates, job deduplication, leases, and session atomicity. PGlite serializes database execution; these tests do not prove multi-connection PostgreSQL lock behaviour, production Supabase performance, provider rate limits, or regional capacity. Those require staging tests against the real deployment. Legacy `backend/test.js` has 76 mocked regression assertions and is not a production security certification.

## Architecture

Web writes use a single Postgres transaction. Reports begin `pending`; encrypted text is available only to authorized staff. Public read endpoints use 60-second server/CDN caching and bounded lists. A receipt capability is submitted in a JSON body, never a URL.

The evidence ledger has 256 independent hash chains. Each transaction locks one head; the report, ledger link, and head change commit together. This avoids a single global head bottleneck. Hashes cover the encrypted report and its attachment references. Evidence files have their own metadata/content hashes when ingested by Telegram; browser files are not independently content-hashed in this release. Tamper evidence is not an external trusted timestamp or a legal admissibility guarantee; an attacker controlling the server, database administrator role, and keys can still rewrite history. Backups and independent checkpoint export remain necessary.

Telegram intake jobs update the session, create any report, enqueue replies, and finish the input job together. Replies retry separately. Telegram has no sendMessage idempotency key: a timeout after Telegram accepts a message can cause a duplicate reply, while duplicate reports are prevented. Standard Telegram delivery is paced at 25 messages/second globally and one/second per private chat. Capacity for web intake and Telegram delivery is therefore different.

See `.env.example`, `docs/SCALING.md`, and `supabase/migrations/` for the deployable contract and rollout requirements.
