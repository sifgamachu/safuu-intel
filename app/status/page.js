'use client';
import { useEffect, useState } from 'react';
import { Shell, PageHeading } from '../components/Shell';
export default function Status() {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/health', { cache: 'no-store', signal: controller.signal })
      .then((r) => r.json())
      .then(setStatus)
      .catch((e) => {
        if (e.name !== 'AbortError')
          setStatus({ database: 'unavailable', telegram: 'unconfirmed' });
      });
    return () => controller.abort();
  }, []);
  return (
    <Shell>
      <div className="sf-wrap sf-content">
        <PageHeading eyebrow="Measured service health" title="Service status.">
          The database is checked when you open this page. Configuration checks are cached for up to
          30 seconds. A worker heartbeat does not prove that a message was delivered.
        </PageHeading>
        <div className="sf-card sf-prose">
          <div className="sf-status-row">
            <span>Web page delivery</span>
            <strong>Available</strong>
          </div>
          <div className="sf-status-row">
            <span>Report database</span>
            <strong>
              {!status
                ? 'Checking…'
                : status.database === 'available'
                  ? 'Available'
                  : 'Unavailable'}
            </strong>
          </div>
          <div className="sf-status-row">
            <span>Telegram processing worker</span>
            <strong>
              {!status
                ? 'Checking…'
                : status.telegram_worker === 'worker_active'
                  ? 'Recent heartbeat'
                  : 'Not confirmed'}
            </strong>
          </div>
          <div className="sf-status-row">
            <span>Private evidence storage</span>
            <strong>
              {!status
                ? 'Checking…'
                : status.evidence === 'private_storage_verified'
                  ? 'Private configuration verified'
                  : 'Not confirmed'}
            </strong>
          </div>
          <div className="sf-status-row">
            <span>Review team access</span>
            <strong>
              {!status
                ? 'Checking…'
                : status.review_team === 'configured'
                  ? 'Staff access configured'
                  : status.review_team === 'not_configured'
                    ? 'Setup pending'
                    : 'Not confirmed'}
            </strong>
          </div>
          <div className="sf-status-row">
            <span>Telegram bot and webhook</span>
            <strong>
              {!status
                ? 'Checking…'
                : {
                    configuration_verified: 'Configuration verified',
                    not_configured: 'Setup pending',
                    configuration_incomplete: 'Configuration needs attention',
                    provider_error: 'Provider reports an error',
                  }[status.telegram] || 'Not confirmed'}
            </strong>
          </div>
          {status?.review_team === 'not_configured' && (
            <p className="sf-alert">
              Reports can be saved, but human review cannot begin until authorized staff are
              configured. No review deadline is promised.
            </p>
          )}
          <p className="sf-caption">
            {status?.checked_at
              ? `Checked ${new Date(status.checked_at).toLocaleString()}`
              : 'Checking the connected services…'}
          </p>
          <p className="sf-muted">
            A successful check does not establish nationwide capacity or guarantee future uptime.
            Telegram configuration checks do not test a complete reporting conversation. Voice
            transcription and automated evidence analysis are not active services in this release.
          </p>
        </div>
      </div>
    </Shell>
  );
}
