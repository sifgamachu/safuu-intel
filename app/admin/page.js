'use client';
import { useEffect, useState } from 'react';
import { Shell, PageHeading } from '../components/Shell';
async function api(path, options = {}) {
  const r = await fetch(path, { cache: 'no-store', ...options });
  const body = await r.json();
  if (!r.ok) throw new Error(body.error || 'Request failed.');
  return body;
}
function post(body) {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}
export default function Admin() {
  const [staff, setStaff] = useState(null),
    [reports, setReports] = useState([]),
    [cases, setCases] = useState([]),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [reason, setReason] = useState({});
  async function refresh() {
    const [r, c] = await Promise.all([api('/api/admin/reports'), api('/api/admin/cases')]);
    setReports(r.reports);
    setCases(c.cases);
  }
  useEffect(() => {
    let active = true;
    api('/api/admin/session')
      .then(async ({ staff }) => {
        if (active) {
          setStaff(staff);
          await refresh();
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  async function login(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const data = new FormData(e.currentTarget);
    try {
      const { staff } = await api('/api/admin/session', post(Object.fromEntries(data)));
      setStaff(staff);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function review(id, decision) {
    setBusy(true);
    setError('');
    try {
      await api(`/api/admin/reports/${id}`, post({ decision, reason: reason[id] || '' }));
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function publish(id) {
    setBusy(true);
    setError('');
    try {
      await api(`/api/admin/cases/${id}`, post({}));
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function evidence(id) {
    try {
      const data = await api(`/api/admin/evidence/${id}`);
      const link = document.createElement('a');
      link.href = data.download_url;
      link.rel = 'noreferrer';
      link.click();
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <Shell>
      <div className="sf-wrap sf-content">
        <PageHeading eyebrow="Authorized staff only" title="The review desk.">
          Review private evidence with care. A submission is an allegation; independent verification
          and a publication decision are separate steps.
        </PageHeading>
        {error && (
          <div className="sf-alert" role="alert">
            {error}
          </div>
        )}
        {!staff ? (
          <form className="sf-card sf-login" onSubmit={login}>
            <h2>Sign in</h2>
            <label htmlFor="email">Staff email</label>
            <input id="email" name="email" type="email" autoComplete="username" required />
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
            <label htmlFor="code">Authenticator code</label>
            <input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
            />
            <button className="sf-button" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in →'}
            </button>
            <p className="sf-caption">
              Access is granted by an administrator. There is no public staff registration.
            </p>
          </form>
        ) : (
          <>
            <div className="sf-form-toolbar">
              <h2>
                Pending reports{' '}
                <small style={{ fontFamily: 'var(--font-body)', fontSize: 12 }}>· latest 25</small>
              </h2>
              <button
                className="sf-text-button"
                onClick={async () => {
                  try {
                    await api('/api/admin/session', { method: 'DELETE' });
                    setStaff(null);
                    setReports([]);
                    setCases([]);
                  } catch (err) {
                    setError(err.message);
                  }
                }}
              >
                Sign out
              </button>
            </div>
            {!reports.length && <div className="sf-empty">No reports are waiting for review.</div>}
            {reports.map((r) => (
              <article className="sf-card sf-review-record" key={r.id}>
                <p className="sf-caption">
                  {r.id} · {new Date(r.created_at).toLocaleString()}
                </p>
                <h3>
                  {r.report?.full_name || 'Legacy report'} · {r.report?.office}
                </h3>
                <p className="sf-muted">
                  {r.report?.city}, {r.report?.region} · {r.report?.corruption_type} ·{' '}
                  {r.report?.incident_date_raw}
                </p>
                <blockquote>
                  {r.report?.description ||
                    'This legacy report requires a manual migration review.'}
                  {r.report?.note && `\n\nAdditional note: ${r.report.note}`}
                </blockquote>
                {r.report?.amount_etb != null && (
                  <p className="sf-muted">Reported amount: {r.report.amount_etb} ETB</p>
                )}
                <div className="sf-actions">
                  {r.report?.evidence_ids?.map((id, i) => (
                    <button className="sf-text-button" key={id} onClick={() => evidence(id)}>
                      Download private evidence {i + 1} ↗
                    </button>
                  ))}
                </div>
                <label htmlFor={`reason-${r.id}`}>Review reasoning (required)</label>
                <textarea
                  id={`reason-${r.id}`}
                  value={reason[r.id] || ''}
                  onChange={(e) => setReason((current) => ({ ...current, [r.id]: e.target.value }))}
                  minLength={10}
                  maxLength={2000}
                />
                <div className="sf-actions">
                  <button
                    className="sf-button"
                    disabled={busy || !r.report}
                    onClick={() => review(r.id, 'verified')}
                  >
                    Mark reviewed & verified
                  </button>
                  <button
                    className="sf-button sf-secondary"
                    disabled={busy || !r.report}
                    onClick={() => review(r.id, 'dismissed')}
                  >
                    Dismiss after review
                  </button>
                </div>
                <p className="sf-caption">
                  Verification does not publish this report or establish a legal finding.
                </p>
              </article>
            ))}
            <h2 style={{ marginTop: 45 }}>Cases awaiting publication</h2>
            {!cases.length && (
              <p className="sf-muted">No reviewed cases are awaiting a publication decision.</p>
            )}
            {cases.map((c) => (
              <article className="sf-card sf-review-record" key={c.id}>
                <h3>
                  {c.full_name} · {c.office}
                </h3>
                <p className="sf-muted">
                  {c.verified_report_count} distinct reporting identities / {c.disclosure_threshold}{' '}
                  required · {c.city}
                  {c.coordination_hold ? ' · Coordination hold' : ''}
                </p>
                <button
                  className="sf-button"
                  disabled={
                    busy ||
                    !['publisher', 'admin'].includes(staff.role) ||
                    c.coordination_hold ||
                    c.verified_report_count < c.disclosure_threshold ||
                    c.full_name.toLowerCase() === 'unknown'
                  }
                  onClick={() => publish(c.id)}
                >
                  Approve public name disclosure
                </button>
              </article>
            ))}
          </>
        )}
      </div>
    </Shell>
  );
}
