'use client';
import { useEffect, useState } from 'react';
import { Shell, PageHeading } from '../components/Shell';
export default function Status() {
  const [status, setStatus] = useState(null);
  const [revision, setRevision] = useState(0);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    let loading = false;
    async function refresh() {
      if (loading || document.hidden) return;
      loading = true;
      setChecking(true);
      try {
        const response = await fetch('/api/health', {
          cache: 'no-store',
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]),
        });
        const body = await response.json();
        if (!body.checked_at || !['available', 'unavailable'].includes(body.database))
          throw new Error('Invalid health response');
        if (!controller.signal.aborted) {
          setStatus(body);
          setError('');
        }
      } catch {
        if (!controller.signal.aborted) {
          setStatus({ database: 'unconfirmed' });
          setError('The service check could not be completed. Try again.');
        }
      } finally {
        loading = false;
        if (!controller.signal.aborted) setChecking(false);
      }
    }
    refresh();
    const timer = setInterval(refresh, 60000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      controller.abort();
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [revision]);
  return (
    <Shell>
      <div className="sf-wrap sf-content">
        <PageHeading eyebrow="Measured service health" title="Service status.">
          Checks refresh once a minute while this page is visible. Configuration checks are cached
          for up to 30 seconds. A worker heartbeat does not prove that a message was delivered.
        </PageHeading>
        <div className="sf-card sf-prose">
          {error && (
            <p className="sf-alert" role="alert">
              {error}
            </p>
          )}
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
                  : status.database === 'unavailable'
                    ? 'Unavailable'
                    : 'Not confirmed'}
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
          <div className="sf-status-row">
            <span>Anti-spam protection</span>
            <strong>
              {!status
                ? 'Checking…'
                : {
                    challenge_enabled: 'Challenge configured',
                    rate_limits_only: 'Session rate limits only',
                    configuration_incomplete: 'Configuration needs attention',
                  }[status.anti_spam] || 'Not confirmed'}
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
              : checking
                ? 'Checking the connected services…'
                : 'No completed check is available.'}
          </p>
          <button
            className="sf-button sf-secondary"
            type="button"
            disabled={checking}
            onClick={() => setRevision((value) => value + 1)}
          >
            {checking ? 'Checking…' : 'Check again'}
          </button>
          {status?.anti_spam === 'rate_limits_only' && (
            <p className="sf-caption">
              The anti-spam challenge still needs setup before broad promotion.
            </p>
          )}
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
