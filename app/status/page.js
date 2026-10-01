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
          The database is checked when you open this page. Worker status reflects a recent
          heartbeat.
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
                : status.telegram === 'worker_active'
                  ? 'Recent heartbeat'
                  : 'Not confirmed'}
            </strong>
          </div>
          <p className="sf-caption">
            {status?.checked_at
              ? `Checked ${new Date(status.checked_at).toLocaleString()}`
              : 'Checking the connected services…'}
          </p>
          <p className="sf-muted">
            A successful check does not establish nationwide capacity or guarantee future uptime.
            Voice transcription and automated evidence analysis are not active services in this
            release.
          </p>
        </div>
      </div>
    </Shell>
  );
}
