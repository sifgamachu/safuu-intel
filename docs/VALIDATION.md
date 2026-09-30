# Validation record · 30 September 2026

- Production build: Next 16.3.8; compiled and prerendered successfully.
- Root dependency audit: zero reported vulnerabilities after upgrading Next and pinning current Supabase/sharp.
- Eleven integration/domain tests passed, including real PostgreSQL WASM transactions, rollbacks, owner checks, receipt replay, public isolation, service-role execution after extension relocation, staff publication gates, queue leases, and session/reply atomicity.
- Seventy-six legacy mocked security regressions passed; these do not certify production security.
- A local 2,000-client burst test passed for public reads, report submissions, and identical retries. Database counts and all ledger links matched. [Results and limits](SCALING.md).
- Chromium browser checks passed at desktop and 390px mobile sizes: three-step save through the real local database harness, private receipt tracking, public empty state, staff sign-in wall, Amharic labels and Ethiopic font rendering, 422 invalid requests, 413 oversized requests, 401 private queue protection, and a simulated interrupted save that preserved the draft and succeeded on retry. No page JavaScript errors or horizontal overflow were observed.
- Applied migration versions on the connected production Supabase project: `20260930202052_reliable_intake_scale` and `20260930202616_security_cleanup`. Files match recorded migration history.
- A single real Postgres service-role transaction smoke test verified save + identical retry + exactly one ledger entry, then rolled back. No synthetic reports or changed ledger heads remained in production.
- Supabase security advisor after cleanup: no WARN/ERROR findings; fourteen informational notices are expected because private tables intentionally have no client policies. Extension helpers were moved outside the API schema and execution of the administrative event trigger was revoked from client roles. [Advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
- Production performance advisor: unused-index informational notices are expected for an empty reporting database. Auth currently has an absolute ten-connection allocation; review it during compute sizing. [Provider guidance](https://supabase.com/docs/guides/deployment/going-into-prod).

Production national capacity, evidence-file throughput, actual Telegram delivery, live staff MFA sessions, recovery drills, and multi-connection lock behaviour remain deployment acceptance work. Existing Auth users and reports were zero when the migration was applied. Staff accounts, a persistent worker, and national traffic quotas have not been provisioned by this change.
