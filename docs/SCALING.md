# Capacity and rollout · 30 September 2026

Safuu is intended to serve a population of 130 million. Population is not a concurrency or requests-per-second target. The code now handles a measured local burst of 2,000 simultaneous HTTP clients with transaction integrity. **Production capacity is not yet established.**

## Measured local result

Next 16.3.8 production build, Node 24.19.0, one local process, loopback network, temporary PostgreSQL WASM/PGlite database. No evidence files, Telegram sends, real regional network latency, real multi-connection Postgres, autoscaling, or managed-provider quotas were exercised.

| Burst                           | Concurrent clients | Successful requests | Failures | Throughput | p95 latency |
| ------------------------------- | -----------------: | ------------------: | -------: | ---------: | ----------: |
| Warm public summary             |              2,000 |               2,000 |        0 |      537/s |      3.30 s |
| Transactional report submission |              2,000 |               2,000 |        0 |      204/s |      9.80 s |
| Identical retries               |              2,000 |               2,000 |        0 |      283/s |      6.57 s |

After both write bursts: exactly 2,000 reports, 2,000 ledger entries, and 2,000 metric counts; zero orphan reports, zero automatically published names, and zero broken ledger links. This is a successful burst-integrity result, not a promise of 2,000 reports per second. The current local p95 for an instant 2,000-report burst exceeds the proposed 5-second production receipt goal.

Run `npm run build && npm run load:test` to reproduce. JSON results are in `docs/load-results-2026-09-30.json`. An initial run found a proxy Origin/Host mismatch; the corrected guard is tested, and the results above are from the successful run.

## Initial traffic model (assumptions, not observed usage)

| Scenario                                                      |         Daily volume |        Average requests/s | Assumed 20× peak |
| ------------------------------------------------------------- | -------------------: | ------------------------: | ---------------: |
| 1% of the population visits, 5 public page/data requests each |      6,500,000 reads |                      75.2 |          1,505/s |
| 0.1% of the population submits one report                     |      130,000 reports |                      1.50 |           30.1/s |
| One-time synchronized reporting burst                         | 2,000 writes at once | Depends on burst duration |  Test separately |

At 130,000 reports/day and an assumed 1 MB of evidence per report, evidence alone grows by roughly 130 GB/day before backups. Four maximum-size files would be 40 MB per report. Actual evidence rates, retention, spending controls, and review capacity need an operating budget. A sustainable review queue needs staff throughput matched to incoming reports, not only more servers.

## Architecture and limits

| Layer        | Implemented                                                                                                 | Production work still required                                                                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public pages | Static shells; bounded API payloads; 60-second Next/CDN cache                                               | Verify edge cache hit ratio, origin shielding, regional latency, and cache behaviour under cold starts                                                      |
| Web intake   | Small bounded JSON requests; direct private file upload; atomic RPC; request idempotency                    | Size Supabase compute/PostgREST pool using real mixed load; configure abuse controls and storage quotas                                                     |
| Database     | 256 ledger heads, delta counters, indexed queues, RLS, service-only RPCs                                    | Test 2+ workers/connections, same-case contention, backups/restores, lock timeout behaviour, large table plans, and maintenance overhead                    |
| Telegram     | Durable encrypted inbox/outbox, leases, ordered chats, bounded worker concurrency, scheduled retry backstop | Deploy persistent workers for national throughput and monitor backlog/oldest-job age; actual Telegram pacing and 429 handling require a controlled bot test |
| Review       | Auth-verified staff, server-managed roles, MFA by default, audit trail, explicit publication                | Provision staff, verify language copy with native speakers, define investigative standards, coordination review, retention, and staffing                    |
| Evidence     | Private bucket, non-overwriting upload links, short staff download links                                    | Independent content hashing and malware isolation, unattached-file cleanup, immutable checkpoints, evidence backup and key recovery                         |

The whole application can autoscale only as far as its slowest dependency. A Vercel concurrency limit does not establish Supabase transaction capacity. Telegram delivery is provider-limited; 2,000 queued messages at 25/s take at least 80 seconds even with idle workers. A complete intake generates multiple replies, so a large launch must use the web channel as the primary burst path.

The ledger is tamper-evident at the application level, with 256 chains. It is not anchored outside the administrator's control. Copy signed checkpoints to independently controlled storage before relying on it for long-term integrity assurance. The current encryption key derives from `TIPPER_HASH_SALT`; loss or blind rotation makes encrypted reports unreadable. Introduce and rehearse versioned key rotation before national rollout.

## Staging acceptance targets

These are proposed acceptance goals, not achieved production measurements:

- 2,000 concurrently active clients over representative mobile connections.
- Public reads: 1,500 requests/s for 30 minutes, with a target p95 below 1 second at the edge and at least 95% cache hits.
- Reports: 30 accepted writes/s sustained, then 2,000-report bursts; target p95 receipt time below 5 seconds, with zero silent loss, duplicates, or broken ledger links. Measure the file-upload path separately.
- Repeat with duplicate retries, provider 429s, workers killed mid-job, database timeouts, and two or more worker instances. Public failures must remain honest; receipts require successful commits.
- Run same-case submissions, not only many independent cases. A hot case still serializes on its person row and requires coordination controls.
- Define queue oldest-job age and dead-letter alerts; stop a rollout if they exceed operational response capacity. Do not automatically publish to drain a queue.
- Test database restore and evidence/key recovery in a separate environment. Establish response ownership and an actual incident process.

Use synthetic data in an isolated staging project. Never load-test the live whistleblower database with fake allegations. Provider quotas and paid plan changes are administrative deployment steps; this change does not purchase resources or silently certify a national launch.

## Deployment sequence

1. Confirm the target database, current empty/report counts, backup posture, and key custody. The additive migration does not delete existing reports or ledger entries.
2. Apply `20260930202052_reliable_intake_scale.sql` to staging, run SQL/integration checks, and configure the preview deployment to that project. The original `001_schema.sql` precedes the new migration for a fresh database.
3. Configure app/worker secrets and Turnstile. Keep service keys server-only. For regional placement, compare application-to-database latency; the connected production project is currently in `eu-west-2`, so a distant function region adds write latency.
4. Run the staging acceptance workload and tune database/hosting resources from the measurements. Arrange capacity with the providers ahead of a national traffic surge.
5. Apply the migration ahead of the app release. Deploy the feature branch preview, test private intake and status, then release the reviewed code to the production branch. A code rollback must keep the new protected publication behaviour; reverting to the legacy webhook is not a recommended rollback.
6. Verify and enable the one-minute scheduled drain and hourly queue maintenance from `20261001020622_scheduled_queue_drain.sql`. This closes quiet-period retry gaps without relying on a new webhook. Deploy and observe persistent workers for national throughput, enroll staff, and confirm real service health. The scheduled drain has a bounded execution budget and is not a capacity certification.
7. Increase traffic in stages and compare receipt latency, cache misses, database saturation, queue age, storage growth, and review backlog with the agreed targets.

## Provider references checked during implementation

- [Vercel function limits](https://vercel.com/docs/functions/limitations): provider concurrency, memory, duration, descriptors, and regions have separate limits; defaults and enabled features must be checked on the actual project.
- [Supabase production checklist](https://supabase.com/docs/guides/deployment/going-into-prod): staging load testing, suitable indexes, compute sizing, recovery, and advance provider coordination for expected surges.
- [Cloudflare Turnstile server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/): validate on the server and check hostname/action; client-only widgets are insufficient.
- [Telegram bot limits](https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this): standard provider limits constrain outbound delivery independently of accepted webhook concurrency.
