'use client';
import { useEffect, useState } from 'react';
import { Shell, PageHeading } from '../components/Shell';
async function api(path, options = {}) {
  const r = await fetch(path, {
    cache: 'no-store',
    signal: AbortSignal.timeout(75000),
    ...options,
  });
  const body = await r.json();
  if (!r.ok) {
    const error = new Error(body.error || 'Request failed.');
    error.status = r.status;
    throw error;
  }
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
    [reason, setReason] = useState({}),
    [loaded, setLoaded] = useState(false),
    [setup, setSetup] = useState(null);
  async function refresh() {
    setLoaded(false);
    const [r, c] = await Promise.all([api('/api/admin/reports'), api('/api/admin/cases')]);
    setReports(r.reports);
    setCases(c.cases);
    setLoaded(true);
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
      .catch((err) => {
        if (active && err.status !== 401) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, []);
  async function login(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const data = new FormData(e.currentTarget);
    const enroll = e.nativeEvent.submitter?.value === 'enroll';
    try {
      const response = await api(
        enroll ? '/api/admin/authenticator' : '/api/admin/session',
        post(Object.fromEntries(data)),
      );
      if (enroll) setSetup(response.setup);
      else {
        setStaff(response.staff);
        await refresh();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function enroll(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const body = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const { staff } = await api('/api/admin/authenticator', { ...post(body), method: 'PUT' });
      setSetup(null);
      setStaff(staff);
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function cancelSetup() {
    setBusy(true);
    setError('');
    try {
      await api('/api/admin/authenticator', { method: 'DELETE' });
      setSetup(null);
    } catch (err) {
      if (err.status === 401) setSetup(null);
      else setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function reload() {
    setBusy(true);
    setError('');
    try {
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
        {setup ? (
          <form className="sf-card sf-login" onSubmit={enroll}>
            <h2>Set up your authenticator</h2>
            <p>
              Scan this code in your authenticator app, or enter the setup key manually. Keep the
              key private.
            </p>
            <img
              src={setup.qr_code}
              alt="Authenticator setup QR code"
              width={224}
              height={224}
              style={{ maxWidth: '100%', background: 'white', margin: '16px 0' }}
            />
            <code
              className="sf-private-code"
              style={{ display: 'block', overflowWrap: 'anywhere' }}
            >
              {setup.secret}
            </code>
            <label htmlFor="setup-code">Six-digit authenticator code</label>
            <input
              id="setup-code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
            />
            <button className="sf-button" disabled={busy}>
              {busy ? 'Verifying…' : 'Verify and sign in →'}
            </button>
            <button
              className="sf-button sf-secondary"
              type="button"
              disabled={busy}
              onClick={cancelSetup}
            >
              Cancel setup
            </button>
            <p className="sf-caption">
              Setup expires after ten minutes. Review access begins only after a valid code is
              verified.
            </p>
          </form>
        ) : !staff ? (
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
            <button className="sf-button" type="submit" value="login" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in →'}
            </button>
            <button className="sf-button sf-secondary" type="submit" value="enroll" disabled={busy}>
              Set up authenticator
            </button>
            <p className="sf-caption">
              An administrator must create your account and grant a staff role first. Set up your
              authenticator here before your first sign-in. There is no public staff registration.
            </p>
          </form>
        ) : (
          <>
            <div className="sf-form-toolbar">
              <h2>
                Pending reports{' '}
                <small style={{ fontFamily: 'var(--font-body)', fontSize: 12 }}>· oldest 25</small>
              </h2>
              <button className="sf-text-button" type="button" disabled={busy} onClick={reload}>
                Refresh queue
              </button>
              <button
                className="sf-text-button"
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setError('');
                  try {
                    await api('/api/admin/session', { method: 'DELETE' });
                    setStaff(null);
                    setReports([]);
                    setCases([]);
                    setLoaded(false);
                  } catch (err) {
                    setError(err.message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Sign out
              </button>
            </div>
            {!loaded && (
              <div className="sf-alert" role="status">
                {busy
                  ? 'Loading the review queue…'
                  : 'The review queue has not been loaded. Use Refresh queue to try again.'}
              </div>
            )}
            {loaded && !reports.length && (
              <div className="sf-empty">No reports are waiting for review.</div>
            )}
            {(loaded ? reports : []).map((r) => (
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
                    disabled={busy || !r.report || (reason[r.id] || '').trim().length < 10}
                    onClick={() => review(r.id, 'verified')}
                  >
                    Mark reviewed & verified
                  </button>
                  <button
                    className="sf-button sf-secondary"
                    disabled={busy || !r.report || (reason[r.id] || '').trim().length < 10}
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
            {loaded && !cases.length && (
              <p className="sf-muted">No reviewed cases are awaiting a publication decision.</p>
            )}
            {(loaded ? cases : []).map((c) => (
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
