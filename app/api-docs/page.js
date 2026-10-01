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
            cases. GET /api/public/cases/:id returns one approved case. The server cache refreshes
            after 60 seconds; the CDN can serve a previous public response while refreshing for up
            to five minutes. Pending cases and private evidence are excluded. Visible dashboard
            pages request an update once a minute and show an unavailable state if that request
            fails.
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
            The Telegram webhook durably queues updates before acknowledging them. Persistent worker
            code processes leased jobs with bounded concurrency, per-chat ordering, and provider
            rate limits. Production uses the webhook drain and a one-minute scheduled retry
            backstop; persistent workers for national throughput are not provisioned. Staff
            endpoints require a verified Supabase Auth session, a server-managed staff role, and an
            authenticator by default.
          </p>
          <h2>Complete the setup</h2>
          <p>
            Apply the database migrations and configure the server variables before deploying. An
            administrator must create staff Auth accounts and grant their verified user IDs a role
            in the staff directory. Staff can then use “Set up authenticator” at the review desk,
            scan the code, and verify it before gaining access. Enrollment does not grant a staff
            role.
          </p>
          <p>
            The repository’s{' '}
            <a
              className="sf-link"
              href="https://github.com/sifgamachu/safuu-intel/blob/main/README.md#production-setup"
              target="_blank"
              rel="noreferrer"
            >
              production setup instructions
            </a>{' '}
            cover the webhook, scheduled worker, private storage, anti-spam keys, and recovery
            requirements. Check service status after each configuration change. Paid capacity, staff
            appointments, and provider accounts are separate operating steps.
          </p>
        </article>
      </div>
    </Shell>
  );
}
