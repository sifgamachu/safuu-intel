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

Use Node 22 or later. Dependencies and lockfiles are pinned.

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
4. Run `npm run worker` as a persistent service. Multiple workers can share the queue. The webhook’s `after()` drain is a best-effort accelerator, not a substitute for a persistent worker during quiet periods or retries. Alternatively an authenticated scheduler can POST `/api/internal/worker` with `Authorization: Bearer <CRON_SECRET>`; protect and monitor that scheduler.
5. Create staff users through an authorized administrative process, enroll TOTP, and grant the verified Auth UUID a `reviewer`, `publisher`, or `admin` entry in `public.staff_members`. Roles do not come from editable user metadata. There is no public staff signup. Do not disable MFA in production.
6. Configure both Turnstile keys, allowed hostname, and edge abuse controls before national promotion. Cookie-based limits alone are easy to evade by obtaining another cookie. Uploaded files are reserved through rate-limited routes; provider-level storage quotas and upload abuse controls are still required.
7. Verify actual hosting quotas, database compute, backups, key recovery, monitoring, and review staffing. See [deployment and capacity plan](docs/SCALING.md).

Existing hosting, checked 30 September 2026: application on Vercel; domain registration and DNS with Cloudflare. Deployment URLs and configured project quotas must be checked in the hosting account; this repository does not provision paid plans.

## Verification

```sh
npm test
npm run build
npm run load:test
```

The load test is **local only**: it starts a production Next server and a temporary PostgreSQL WASM/PGlite PostgREST harness. It submits synthetic reports and refuses production URLs. Default: 2,000 concurrent clients for each of three bursts (public reads, submissions, identical retries). `LOAD_CONCURRENCY=100 npm run load:test` is the CI smoke test.

The transaction tests cover rollback, ownership, replay, receipt access, public isolation, disclosure gates, job deduplication, leases, and session atomicity. PGlite serializes database execution; these tests do not prove multi-connection PostgreSQL lock behaviour, production Supabase performance, provider rate limits, or regional capacity. Those require staging tests against the real deployment. Legacy `backend/test.js` has 76 mocked regression assertions and is not a production security certification.

## Architecture

Web writes use a single Postgres transaction. Reports begin `pending`; encrypted text is available only to authorized staff. Public read endpoints use 60-second server/CDN caching and bounded lists. A receipt capability is submitted in a JSON body, never a URL.

The evidence ledger has 256 independent hash chains. Each transaction locks one head; the report, ledger link, and head change commit together. This avoids a single global head bottleneck. Hashes cover the encrypted report and its attachment references. Evidence files have their own metadata/content hashes when ingested by Telegram; browser files are not independently content-hashed in this release. Tamper evidence is not an external trusted timestamp or a legal admissibility guarantee; an attacker controlling the server, database administrator role, and keys can still rewrite history. Backups and independent checkpoint export remain necessary.

Telegram intake jobs update the session, create any report, enqueue replies, and finish the input job together. Replies retry separately. Telegram has no sendMessage idempotency key: a timeout after Telegram accepts a message can cause a duplicate reply, while duplicate reports are prevented. Standard Telegram delivery is paced at 25 messages/second globally and one/second per private chat. Capacity for web intake and Telegram delivery is therefore different.

See `.env.example`, `docs/SCALING.md`, and `supabase/migrations/` for the deployable contract and rollout requirements.
