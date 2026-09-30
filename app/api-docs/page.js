import { Shell, PageHeading } from '../components/Shell';
export default function API() {
  return (
    <Shell>
      <div className="sf-wrap sf-content">
        <PageHeading eyebrow="Developer reference" title="Reporting interfaces.">
          All sensitive operations use server routes. Database credentials are never sent to the
          browser.
        </PageHeading>
        <article className="sf-prose">
          <h2>Public read endpoints</h2>
          <p>
            GET /api/public/summary returns aggregate totals, monthly counts, and up to 50 approved
            cases. GET /api/public/cases/:id returns one approved case. Responses are cached for 60
            seconds; pending cases and private evidence are excluded.
          </p>
          <h2>Web intake</h2>
          <p>
            GET /api/reports initializes a signed private session cookie. POST /api/evidence/upload
            reserves a private file and returns a signed direct upload URL. POST /api/reports
            validates incident fields and records a report with a client-generated request ID and
            private receipt key. Retries with the same request ID and payload return the same
            receipt.
          </p>
          <h2>Private tracking</h2>
          <p>
            POST /api/reports/status accepts a report ID and private receipt key. It returns only
            receipt status and fingerprints, never report text or evidence. Tracking keys must not
            be placed in URLs.
          </p>
          <h2>Operations</h2>
          <p>
            The Telegram webhook durably queues updates before acknowledging them. Persistent
            workers process leased jobs with bounded concurrency, per-chat ordering, and provider
            rate limits. Staff endpoints require a verified Supabase Auth session, a server-managed
            staff role, and an authenticator by default.
          </p>
        </article>
      </div>
    </Shell>
  );
}
