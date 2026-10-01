'use client';
import { useState } from 'react';
import { Shell, PageHeading } from '../components/Shell';
const STATUS = {
  pending: 'Saved · waiting for human review',
  verified: 'Reviewed',
  dismissed: 'Review closed',
  investigating: 'Under investigation',
  disclosed: 'Included in a published case',
  ai_flagged: 'Requires further review',
};
export default function Tracker() {
  const [code, setCode] = useState(''),
    [receipt, setReceipt] = useState(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function check(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setReceipt(null);
    try {
      const [id, secret] = code.trim().split('.');
      const r = await fetch('/api/reports/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, secret }),
        signal: AbortSignal.timeout(15000),
      });
      const body = await r.json();
      if (!r.ok) throw new Error(body.error);
      setReceipt(body.receipt);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Shell active="tracker">
      <div className="sf-wrap sf-content">
        <PageHeading eyebrow="Your private receipt" title="Follow your report.">
          Enter the tracking code you received after submitting through this website. No account is
          needed.
        </PageHeading>
        <div className="sf-card sf-prose">
          {error && (
            <div className="sf-alert" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={check}>
            <label htmlFor="tracking-code">Private tracking code</label>
            <input
              id="tracking-code"
              className="sf-private-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Report ID.private key"
              autoComplete="off"
              spellCheck="false"
              required
              maxLength={110}
            />
            <p className="sf-field-help">
              Keep this code private. It provides access to the report’s status.
            </p>
            <button className="sf-button" disabled={busy} style={{ marginTop: 20 }}>
              {busy ? 'Checking…' : 'Check status →'}
            </button>
          </form>
          {receipt && (
            <div style={{ marginTop: 30 }} role="status">
              <span className="sf-badge">{STATUS[receipt.status] || 'Saved'}</span>
              <dl className="sf-review-list">
                <dt>Report ID</dt>
                <dd>{receipt.id}</dd>
                <dt>Saved</dt>
                <dd>{new Date(receipt.saved_at).toLocaleString()}</dd>
                <dt>Fingerprint</dt>
                <dd style={{ fontFamily: 'monospace', fontSize: 11 }}>{receipt.ledger_hash}</dd>
              </dl>
              <p className="sf-muted">
                This receipt confirms that a report was saved. Private details and attachments are
                not displayed here.
              </p>
            </div>
          )}
        </div>
        <p className="sf-caption">
          Telegram receipts currently confirm submission only; private web tracking codes are issued
          by the web form.
        </p>
      </div>
    </Shell>
  );
}
