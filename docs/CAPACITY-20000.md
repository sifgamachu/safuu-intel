# 20,000-client capacity · 1 October 2026

The target is now at least 20,000 simultaneous clients. The original black, gold, and cyan design is unchanged. Capacity measurements below distinguish client requests waiting for completion from database connections, single bursts from sustained traffic, and isolated tests from production.

## What changed

- The database HTTP transport reuses at most 32 connections per application instance. PostgREST continues to own the PostgreSQL connection pool.
- Each instance admits 32 database requests at a time and can hold at most 5,000 waiting requests for up to 45 seconds. Waiting work has not started a transaction. The existing 15-second execution deadline starts on admission and covers response-body consumption. Queue overflow, expiry, and cancellation return an honest error; no receipt is issued without a successful commit.
- The load test starts 20,000 clients together across four application and client processes, avoiding the workspace's 16,384 file-descriptor limit. It measures launch span and actual peak outstanding requests and checks every receipt, ledger link, and aggregate count. No automatic client retries hide a failed first attempt.
- A separate native PostgreSQL profile creates a fresh local cluster with 60 maximum connections, 256 MB shared buffers, a 24-connection service-role pool, fsync, and synchronous commits. It refuses remote database URLs and requires an unprivileged account.

These queues are bounded in-process waiting, not a durable submission inbox. A process failure before commit produces no successful receipt; the browser retains the same request identity for a safe retry. The existing atomic transaction and private tracking code remain authoritative.

## Verified isolated result

Production Next build, Node 24.19.0, four app instances, four synchronized client processes, one temporary PostgreSQL WASM/PGlite database, loopback networking. No production records, file uploads, Telegram sends, regional latency, or provider autoscaling were exercised.

| Burst                    | Clients | Peak outstanding requests | Successful responses | Failures | p95 latency |
| ------------------------ | ------: | ------------------------: | -------------------: | -------: | ----------: |
| Public summary           |  20,000 |                    19,953 |               20,000 |        0 |      5.54 s |
| Report submission        |  20,000 |                    20,000 |               20,000 |        0 |     30.75 s |
| Identical report retries |  20,000 |                    20,000 |               20,000 |        0 |     16.15 s |

After the save and retry bursts: exactly 20,000 reports, ledger entries, and metric counts; zero orphan reports, public names, or broken ledger links. [Full result](load-results-20000-pglite-2026-10-01.json).

The initial 20k write burst with connection pooling alone returned 10,720 failures because waiting requests exhausted their execution deadlines. Bounded admission fixed that failure without removing the 15-second execution deadline. [Before admission control](load-results-20000-before-backpressure-2026-10-01.json). The successful result permits waiting during a large burst; it does **not** achieve a five-second receipt target.

## Production and rollout

At 17:14 UTC, ten synchronized native Edge generators sent 30,000 public-summary reads to `www.safuu.net`. All returned HTTP 200, with **25,795 measured requests outstanding at the peak**, p95 424 ms, p99 483 ms, and a 1.754-second burst duration. There were 29,900 cache HITs and 100 MISSes. This establishes one live public-read burst above the requested 20k overlap; it does not establish sustained, regional, cold-cache, upload, Telegram, or production report throughput. The generators were disabled and JWT enforcement restored immediately after measurement. [Full production record](production-capacity-20000-2026-10-01.json).

The live database currently reports 60 maximum connections and 256 MB shared buffers. Those settings alone do not establish transaction throughput or guarantee 20,000 simultaneous production report saves. Native PostgreSQL validation is recorded separately when complete.

Before a national launch, measure sustained mixed traffic in isolated staging, hot-case contention, uploads, actual Vercel scaling, database CPU/IO and lock wait, recovery, and review backlog. Configure production Turnstile and enroll reviewers. Telegram remains limited to the configured 25 outbound messages/s: 20,000 queued messages require at least 800 seconds before accounting for multi-step conversations.

Reproduce the local test with `npm run build && npm run load:test`. Use the `20,000-client capacity check` workflow for native PostgreSQL. Historical 2k measurements remain in their original files; they are not relabeled as 20k tests.
