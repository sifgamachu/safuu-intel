# Forms, navigation, claims, and setup audit · 1 October 2026 UTC

The original black/gold/cyan design is preserved. Every top-level page, internal link, homepage anchor, FAQ toggle, and available form was inventoried. The supported production application remains the root Next.js app; the separate prototype backend/dashboard are not the live service.

## Functional acceptance

The repeatable browser audit runs the production build against a fresh loopback PostgreSQL/PGlite database. Auth, Storage transport, and Turnstile use controlled provider responses. Report transactions, attachment ownership/reference saves, receipts, review decisions, publication gates, counters, and evidence-access audit entries use the actual SQL and application routes. This verifies integration behavior; it does not certify the managed providers or national capacity.

[Machine-readable browser results](form-audit-browser-2026-10-01.json) record 13 completed workflow groups, 24 top-level pages, 96 responsive layouts at 320/390/768/1440 pixels, and zero page JavaScript errors.

| Surface                                                                                       | Verified behavior                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/report`                                                                                     | Required fields and bounds, optional name/date/region, all entered details in review, decimal Birr, Back preserving the draft, good-faith consent, attachment types/count/size/removal, upload failure recovery, and receipt only after a committed save.                                                                          |
| Interrupted submission                                                                        | The test commits the real report, then drops its HTTP response. Editing/language changes stay locked until an identical retry confirms the same receipt. Four attachments and one ledger entry remain attached to exactly one report; no second upload is needed.                                                                  |
| Receipt and `/tracker`                                                                        | Clipboard copy works. Complete codes, including uppercase hexadecimal, retrieve status. Wrong keys, incomplete codes, and extra text are rejected. Tracking never returns narratives or files.                                                                                                                                     |
| `/admin` sign-in/setup                                                                        | Wrong credentials fail. A role is required before enrollment. QR/manual key setup, cancellation, wrong-code rejection, and successful verification work. The ten-minute setup cookie cannot open private reports. Every staff request checks verified Auth, MFA assurance, and the current server role.                            |
| `/admin` review                                                                               | Empty and unavailable queues remain distinct; Refresh queue recovers. A reasoning entry is required. Private file downloads are audited. Verification and dismissal use real transactions. A full 2,000-character Ethiopic review reason succeeds. Sign-out clears browser access and calls provider sign-out.                     |
| Publication                                                                                   | A reviewer cannot publish, including through a direct POST. An authorized publisher approves a fixture case only after its actual default threshold of 100 distinct reviewed identities is met. Pending/unapproved names stay private.                                                                                             |
| `/transparency`, case detail, `/analytics`, homepage dashboard                                | Approved cases and totals come from SQL. Missing cases show an error. Search is explicitly limited to the latest 50. Public caches include the configured database project so reused builds cannot share another project's snapshot. Dismissed reports count as reviewed, while publication still counts verified identities only. |
| `/status`                                                                                     | Health failures settle to an error with Check again recovery. Visible checks refresh once a minute. Database, private storage, bot configuration, worker heartbeat, staff directory, and anti-spam setup are represented separately.                                                                                               |
| Challenge-enabled form                                                                        | A failed script and widget can retry without reloading or losing the draft; submit remains blocked until a challenge succeeds. This browser check uses a controlled widget, not a provisioned live Turnstile key. Server-side partial-key fail-closed regression also passes.                                                      |
| `/am`, `/or`, `/ti`, `/so`, `/af`                                                             | Four translated guides link to their matching form language; English is the fifth form option. Afar correctly says guidance is unavailable. Native-speaker review remains an operating task.                                                                                                                                       |
| `/about`, `/faq`, `/privacy`, `/press`, `/partners`, `/donate`, `/demo`, `/sms`, `/changelog` | Claims distinguish saved allegations, review, publication, privacy limits, and inactive services. Collaboration links lead to real resources; demo data is labelled fictional; payments and SMS are not offered.                                                                                                                   |
| `/api-docs`, `/backend`, `/setup-domain`                                                      | Backend reference reaches API docs. Setup instructions match server variables, migrations, staff-role assignment before authenticator enrollment, worker configuration, and project-specific domain instructions.                                                                                                                  |
| Navigation                                                                                    | All 24 top-level pages, internal link destinations, homepage anchors, and every FAQ expansion/collapse pass. The footer's Telegram link no longer points to SMS status; the developer link is labelled as a reference.                                                                                                             |

## Corrected gaps

- Allowed decimal Birr amounts in the browser; included position/title in the review summary.
- Preserved the exact attempted report after an uncertain response so changing a language or draft cannot break duplicate-safe recovery.
- Counted dismissals in Reports reviewed and retained verified-only publication thresholds.
- Added authorized staff authenticator enrollment and MFA checks on every staff request.
- Made queue failures visible instead of showing an empty queue; added manual recovery.
- Raised the review request byte budget to accommodate the stated 2,000-character limit in Ethiopic and escaped JSON.
- Added time limits/recovery for public/status/case reads, cleared stale case state, and exposed anti-spam setup accurately.
- Rejected non-object JSON with validation errors instead of generic server failures.
- Scoped public caches to the configured database project.
- Corrected navigation labels and fixed narrow-screen intrinsic widths/long attachment names without changing the theme.

## Release checks

`npm test`: 28 root tests pass. The separate legacy suite has 76 passing mocked assertions. Production build and the 100-client read/write/identical-retry smoke test pass; database counts and ledger links match. The original-design browser suite also checks bundled fonts, keyboard/mobile navigation, reduced motion, minute dashboard refresh, outages/recovery, and the share image.

The current 20,000-client evidence remains scoped as described in [CAPACITY-20000.md](CAPACITY-20000.md). This audit does not add a production write-capacity claim.

Run the additional browser audit with Playwright and Chromium available:

```sh
PLAYWRIGHT_PATH=/path/to/playwright BROWSER_EXECUTABLE=/path/to/chromium \
  AUDIT_REPORT_PATH=docs/form-audit-browser-results.json node scripts/audit-browser.mjs
```

It starts a fresh loopback database and app and creates only synthetic local data. `AUDIT_SKIP_BUILD=1` is for an already verified current build. Provider fixtures are explicitly separate from real managed-provider acceptance.

## Live operating status and acceptance still required

The `20261001190502_count_all_review_decisions` migration is applied to production. Its function remains invoker-based with an empty search path; anonymous/authenticated execution remains denied, and service-role execution remains allowed. No reports or Auth users were created in production by this audit.

Read-only production checks found an available database, verified private evidence bucket, active one-minute queue drain/hourly maintenance, configured bot/webhook, and recent worker heartbeat. There are **zero appointed staff accounts/users/authenticators**, and anti-spam remains **session rate limits only**. The site discloses these states.

Staff account creation/role assignment and a real authenticator/review/publication drill still require designated staff. Turnstile needs real provider keys/allowed hosts. A full live Telegram conversation with an authorized test chat, managed staging write/upload load, multi-region sustained traffic, provider quotas, monitoring, backup/key recovery, and production 20,000 simultaneous report acceptance remain unverified. SMS, financial donations, automatic referrals, transcription, and AI evidence verification remain inactive and are described that way.

A saved receipt confirms storage. It does not promise a review date, anonymity, legal admissibility, or a government outcome.
