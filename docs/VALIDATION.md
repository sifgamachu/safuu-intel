# Validation record · 30 September 2026

- Production build: Next 16.3.8; compiled and prerendered successfully.
- Root dependency audit: zero reported vulnerabilities after upgrading Next and pinning current Supabase/sharp.
- Eleven integration/domain tests passed, including real PostgreSQL WASM transactions, rollbacks, owner checks, receipt replay, public isolation, service-role execution after extension relocation, staff publication gates, queue leases, and session/reply atomicity.
- Follow-up: fourteen tests pass with the scheduler authorizer checks. Forged/malformed credentials are rejected, concurrent authorization shares one digest read, rotation takes effect after cache expiry, and database outages fail closed. Anonymous access to the worker credential table and RPC is denied.
- Seventy-six legacy mocked security regressions passed; these do not certify production security.
- A local 2,000-client burst test passed for public reads, report submissions, and identical retries. Database counts and all ledger links matched. [Results and limits](SCALING.md).
- Chromium browser checks passed at desktop and 390px mobile sizes: three-step save through the real local database harness, private receipt tracking, public empty state, staff sign-in wall, Amharic labels and Ethiopic font rendering, 422 invalid requests, 413 oversized requests, 401 private queue protection, and a simulated interrupted save that preserved the draft and succeeded on retry. No page JavaScript errors or horizontal overflow were observed.
- Applied migration versions on the connected production Supabase project: `20260930202052_reliable_intake_scale` and `20260930202616_security_cleanup`. Files match recorded migration history.
- Follow-up migration `20261001020622_scheduled_queue_drain` prepares protected Cron/Net/Vault integration. Both jobs are initially inactive until the production route accepts a signed request. The production service-role digest lookup and client/Vault access denials were verified.
- A single real Postgres service-role transaction smoke test verified save + identical retry + exactly one ledger entry, then rolled back. No synthetic reports or changed ledger heads remained in production.
- Follow-up: eight parallel same-case save/retry checks passed on eight distinct production PostgreSQL connections. Each checked its receipt and exactly one ledger entry, then rolled back; zero test reports remained. This is a contention smoke test, not a production throughput benchmark.
- Supabase security advisor after cleanup: no WARN/ERROR findings; fourteen informational notices are expected because private tables intentionally have no client policies. Extension helpers were moved outside the API schema and execution of the administrative event trigger was revoked from client roles. [Advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
- Production performance advisor: unused-index informational notices are expected for an empty reporting database. Auth currently has an absolute ten-connection allocation; review it during compute sizing. [Provider guidance](https://supabase.com/docs/guides/deployment/going-into-prod).

Production national capacity, evidence-file throughput, actual Telegram delivery, live staff MFA sessions, recovery drills, and sustained multi-connection contention remain deployment acceptance work. Existing Auth users and reports were zero when the migration was applied. Staff accounts, persistent workers for national throughput, and national traffic quotas have not been provisioned by this change.

## Production release · 1 October 2026 UTC

- [PR #1](https://github.com/sifgamachu/safuu-intel/pull/1) merged to `main`; production GitHub CI and Vercel deployment passed. Both `www.safuu.net` and `safuu-intel.vercel.app` serve the redesign and current API routes.
- A follow-up cold CI build exposed a `next/font/google` loader error. The four existing font families are now pinned Fontsource packages served as application assets. A clean production build and Chromium flow checks passed after the change; display/body/Ethiopic fonts loaded successfully from local assets, including the Amharic mobile form, with no page errors or horizontal overflow.
- Live form initialization, secure/HttpOnly/SameSite cookie attributes, malformed input, cross-origin writes, oversized requests, protected staff/worker routes, and unknown receipts/cases were checked. Expected 200/422/403/413/401/404 responses all passed. These checks did not submit synthetic reports to production.
- A signed manual queue drain succeeded. The one-minute Supabase Cron job was activated and recurring runs returned HTTP 200 with fresh worker heartbeats. Hourly queue maintenance is enabled. This is a retry backstop; persistent workers for national throughput remain unprovisioned.
- The workspace runner repeatedly completed 256 public requests, then cancelled the remaining transports without receiving server error responses. Those attempts are retained as invalid capacity evidence rather than presented as server throughput.
- A separate native-HTTP Supabase Edge probe in `eu-west-2` completed **2,000 simultaneous production public-summary reads**, all HTTP 200/cache HIT, with zero failures. The burst took 476 ms: 4,197 requests/s, p95 234 ms, p99 246 ms. This is a warm-cache, single-source, sub-second burst, not a sustained or nationwide capacity measurement.
- The temporary probe was disabled after measurement and its gateway JWT verification restored. Its checked-in source also defaults to disabled. Credentials stayed in Vault/server environment and were not placed in Git or logs.

[Detailed production record](production-validation-2026-10-01.json). Production report-write/file/Telegram throughput, provider quotas, staff enrollment, Turnstile, persistent workers, and recovery acceptance remain outstanding. The successful public-read result does not establish report-ingestion capacity.

## Original design restoration · 1 October 2026 UTC

- Restored the pre-redesign black/gold/cyan appearance from `e89b542`, including the declassified headline, Ge’ez background, original section structure, and footer. Shared navigation and working reporting pages now use the same visual theme.
- The dashboard uses actual saved aggregate totals and approved public cases. It no longer presents a simulated ledger seal, private intake feed, automated evidence verification, or automatic agency referrals as live services.
- Private intake, evidence protection, receipt tracking, publication gates, database migrations, worker authorization, queue retries, and all server routes are unchanged by this visual restoration.
- A fresh production build and Chromium checks passed: 320/390/768/1440px layouts without clipped controls or headings, mobile navigation and Escape handling, keyboard-accessible FAQs, reduced motion, bundled display/body/Ethiopic fonts, real local report saving and receipt lookup, interrupted saves and retries, staff sign-in protection, and empty/populated/unavailable public dashboard states. Populated/error display fixtures and synthetic reports were local only.
- The existing capacity measurements and their limits remain applicable to the unchanged API/database implementation. This visual release does not add evidence of national write capacity.
