'use client';

import Link from 'next/link';
import { usePublicData } from './PublicData';

export default function ClassicDashboard() {
  const { data, error } = usePublicData();
  const cases = data?.cases?.slice(0, 6) || [];
  const months = [...(data?.months || [])].reverse();
  const max = Math.max(1, ...months.map((month) => Number(month.count)));
  return (
    <section className="classic-dashboard classic-section" aria-label="Reporting dashboard">
      <div className="classic-dashboard-status" role="status">
        <span className={error ? 'classic-unavailable' : 'classic-record-label'}>
          {error ? 'DATA UNAVAILABLE' : data ? 'CONNECTED TO THE PUBLIC RECORD' : 'CONNECTING…'}
        </span>
        <span>From saved reports · cached public summary</span>
        <Link href="/status">Service status</Link>
      </div>
      <div className="classic-metrics">
        {[
          ['received', 'Reports received'],
          ['reviewed', 'Reports reviewed'],
          ['published', 'Cases published'],
        ].map(([key, label]) => (
          <div key={key}>
            <strong>{data ? Number(data[key]).toLocaleString() : '—'}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="classic-dashboard-grid">
        <article className="classic-panel">
          <div className="classic-panel-heading">
            <h2>REVIEWED PUBLIC RECORD</h2>
            <Link href="/transparency">View the wall</Link>
          </div>
          <div className="classic-record-columns">
            <span>CASE</span>
            <span>OFFICE</span>
            <span>LOCATION</span>
          </div>
          {error ? (
            <p className="classic-empty" role="status">
              The public record is temporarily unavailable. Please try again later.
            </p>
          ) : !data ? (
            <p className="classic-empty" role="status">
              Loading the public record…
            </p>
          ) : cases.length ? (
            cases.map((item) => (
              <Link className="classic-record-row" href={`/transparency/${item.id}`} key={item.id}>
                <strong>{item.display_name}</strong>
                <span>{item.office}</span>
                <span>{[item.city, item.region].filter(Boolean).join(' · ')}</span>
              </Link>
            ))
          ) : (
            <div className="classic-empty">
              <span aria-hidden="true">◎</span>
              <h3>No cases have been published yet</h3>
              <p>
                Reports remain private while they are reviewed. Only approved cases appear here.
              </p>
              <Link href="/report">File a report</Link>
            </div>
          )}
        </article>
        <article className="classic-panel">
          <div className="classic-panel-heading">
            <h2>THE REVIEW PROCESS</h2>
            <span>HUMAN REVIEW</span>
          </div>
          <ol className="classic-review-steps">
            <li>
              <span>01</span>
              <div>
                <h3>Private intake</h3>
                <p>Your report and attachments go to a restricted review queue.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Evidence review</h3>
                <p>Authorized reviewers assess the report and record their decision.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Publication approval</h3>
                <p>
                  The default case threshold is 100 distinct verified reporting identities and
                  explicit staff approval to appear publicly.
                </p>
              </div>
            </li>
          </ol>
          {data && data.review_team !== 'configured' && (
            <p className="classic-panel-note">
              {data.review_team === 'not_configured'
                ? 'Review team setup is pending. Reports can be saved, but human review cannot begin until authorized staff are configured.'
                : 'Review team setup is not confirmed. Check service status before relying on a review.'}{' '}
              <Link href="/status">Service status →</Link>
            </p>
          )}
        </article>
        <article className="classic-panel">
          <div className="classic-panel-heading">
            <h2>INTAKE VOLUME OVER TIME</h2>
            <Link href="/analytics">Reporting data</Link>
          </div>
          {error ? (
            <p className="classic-empty">Statistics are temporarily unavailable.</p>
          ) : !data ? (
            <p className="classic-empty">Loading saved totals…</p>
          ) : !months.length ? (
            <div className="classic-empty">
              <h3>No reports recorded yet</h3>
              <p>Monthly totals will appear after reports are saved.</p>
            </div>
          ) : (
            <div className="classic-months">
              {months.map((month) => (
                <div key={month.month}>
                  <span>
                    {new Date(`${month.month}T12:00:00Z`).toLocaleDateString('en', {
                      month: 'short',
                      year: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </span>
                  <div className="classic-month-track">
                    <div style={{ width: `${(Number(month.count) / max) * 100}%` }} />
                  </div>
                  <strong>{Number(month.count).toLocaleString()}</strong>
                </div>
              ))}
            </div>
          )}
          <p className="classic-panel-note">
            Report volume includes unreviewed allegations. It does not establish guilt.
          </p>
        </article>
        <article className="classic-panel">
          <div className="classic-panel-heading">
            <h2>YOUR PRIVATE RECEIPT</h2>
            <span>KEEP IT SAFE</span>
          </div>
          <div className="classic-receipt-guide">
            <h3>A record you can follow.</h3>
            <p>
              A receipt is issued after your report is saved. Keep its tracking code to follow the
              review without creating an account.
            </p>
            <Link className="classic-outline-button" href="/tracker">
              Track a report
            </Link>
            <Link href="/privacy">Read the privacy & safety guide</Link>
          </div>
        </article>
      </div>
    </section>
  );
}
