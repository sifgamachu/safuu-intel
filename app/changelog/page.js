import Link from 'next/link';
import { Shell, PageHeading } from '../components/Shell';

export default function Changelog() {
  return (
    <Shell>
      <div className="sf-wrap sf-content">
        <PageHeading eyebrow="Platform updates" title="A clearer path to accountability.">
          What changed in Safuu, and how it affects your report.
        </PageHeading>
        <article className="sf-prose">
          <p className="sf-eyebrow">
            <time dateTime="2026-10-01">1 October 2026 · UTC</time>
          </p>
          <h2>Original design. Stronger reporting.</h2>
          <p>
            Safuu’s original black, gold, and cyan design is back, with the declassified headline
            and familiar dashboard panels. The dashboard shows saved totals and approved cases.
            Private report saving, receipt tracking, and background retries remain active.
          </p>
          <h2>Claims checked against delivery.</h2>
          <p>
            Older partnership counts, funding tiers, and promises of automated analysis have been
            corrected. The demo uses clearly fictional examples, and language descriptions match the
            five available guides. The form and status page show whether review staff are
            configured. Dashboard updates now run once a minute while visible, with recovery after
            an unavailable response.
          </p>
          <p>
            Private file delivery and access restrictions were checked on the live service with
            temporary test files, then cleaned up. The release checks also exercise complete queued
            intake and provider failure recovery using controlled Telegram responses. These checks
            do not establish nationwide capacity or promise a review deadline.
          </p>
          <h2>Private reporting. Clearer receipts.</h2>
          <ul>
            <li>
              A redesigned mobile reporting flow with guidance in English, Amharic, Afaan Oromoo,
              Tigrinya, and Somali.
            </li>
            <li>
              A private receipt issued after a report is saved, with a tracking code to check its
              status without an account.
            </li>
            <li>Private evidence attachments and protected access for authorized reviewers.</li>
            <li>
              Human review and explicit approval before a case or name appears in the public record.
            </li>
            <li>Public statistics drawn from saved reports and approved cases.</li>
            <li>
              Background retries for Telegram processing, including a scheduled queue drain during
              quiet periods.
            </li>
          </ul>
          <p>
            A receipt confirms that a report was stored. Review times depend on the review team.
            National traffic capacity and automatic evidence verification are still being evaluated.
          </p>
          <div className="sf-actions">
            <Link href="/report" className="sf-button">
              Report an incident ↗
            </Link>
            <Link href="/privacy" className="sf-button sf-secondary">
              Privacy & safety
            </Link>
          </div>
          <h2>Development history</h2>
          <p>
            <a
              href="https://github.com/sifgamachu/safuu-intel/pull/1"
              target="_blank"
              rel="noreferrer"
            >
              Release details
            </a>{' '}
            and{' '}
            <a
              href="https://github.com/sifgamachu/safuu-intel/commits/main"
              target="_blank"
              rel="noreferrer"
            >
              earlier development changes
            </a>{' '}
            are recorded on GitHub.
          </p>
        </article>
      </div>
    </Shell>
  );
}
