import Link from 'next/link';
import { Shell, PageHeading } from '../components/Shell';
export default function Privacy() {
  return (
    <Shell>
      <div className="sf-wrap sf-content">
        <PageHeading
          eyebrow="Privacy & safety · updated 30 September 2026"
          title="Know what you share."
        >
          We minimize identity information and keep reports private for review. No reporting tool
          can guarantee complete anonymity.
        </PageHeading>
        <article className="sf-prose">
          <h2>What we ask for</h2>
          <p>
            The form asks about the incident and the person or office involved. Your own name, email
            address, or phone number is not required. Avoid including details that could identify
            you unless you decide they are necessary.
          </p>
          <h2>What is stored</h2>
          <p>
            We store incident details, optional attachments, review decisions, and a receipt. Report
            text and Telegram drafts are encrypted by the application. Authorized reviewers can
            decrypt them. Accused names, offices, coarse locations, and reporting categories are
            private database metadata used for case matching and statistics.
          </p>
          <p>
            A signed browser cookie gives your session a random identifier. We store a keyed hash of
            that identifier to prevent duplicate reports and limit abuse. For Telegram, we use a
            keyed hash of your chat ID. Telegram updates and delivery jobs contain encrypted routing
            information while they await processing. Completed jobs clear that information; expired
            jobs and drafts are cleaned by the worker. These are privacy measures, not a claim that
            identities can never be linked.
          </p>
          <h2>Evidence and the public record</h2>
          <p>
            Files are held in a private bucket. Authorized staff obtain short-lived download links,
            and access is recorded. File contents and metadata may identify people. Preserve
            original evidence when appropriate, and consider identifying information before
            uploading.
          </p>
          <p>
            Public pages show aggregate reporting totals and approved cases. Report narratives,
            attachments, reporting hashes, and pending accused names are not public. Case names
            require human approval after the review threshold is met.
          </p>
          <h2>Your device and providers</h2>
          <p>
            Your internet provider, browser, hosting providers, and Telegram may have information
            about your connection or account. A shared device may retain history or clipboard
            contents. Application encryption does not protect against access to the running server
            and its keys.
          </p>
          <h2>Keep your receipt private</h2>
          <p>
            Anyone with your web tracking code can check that report’s status. The tracking code
            does not display report text or evidence. We cannot recover a lost code without
            collecting additional identity information, so copy it to a place you consider safe.
          </p>
          <h2>Retention and review</h2>
          <p>
            Reports and their tamper-evident receipt records are retained for review. Deletion and
            retention policies for long-term evidence require an operating decision; we do not
            promise immediate deletion. Safuu is not an emergency response service or a legal
            authority. If you face immediate danger, consider trusted local support suitable for
            your situation.
          </p>
          <Link href="/report" className="sf-link">
            Continue to a private report ↗
          </Link>
        </article>
      </div>
    </Shell>
  );
}
