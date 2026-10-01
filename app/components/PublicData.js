'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
export function usePublicData() {
  const [data, setData] = useState(null),
    [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let loading = false;
    async function refresh() {
      if (loading || document.hidden) return;
      loading = true;
      try {
        const response = await fetch('/api/public/summary', { signal: controller.signal });
        if (!response.ok) throw new Error();
        const next = await response.json();
        if (!controller.signal.aborted) {
          setData(next);
          setError(false);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setData(null);
          setError(true);
        }
      } finally {
        loading = false;
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
  }, []);
  return { data, error };
}
export function Stats() {
  const { data, error } = usePublicData();
  return (
    <section className="sf-stats sf-wrap" aria-label="Reporting statistics">
      <div className="sf-stat-intro">
        <span className="sf-dot" />{' '}
        <span>
          The reporting record
          <small>
            {error
              ? 'Data temporarily unavailable'
              : data
                ? 'From saved reports · updates once a minute while visible'
                : 'Connecting to the reporting record…'}
          </small>
        </span>
      </div>
      {[
        ['received', 'Reports received'],
        ['reviewed', 'Reports reviewed'],
        ['published', 'Cases published'],
      ].map(([key, label]) => (
        <div className="sf-stat" key={key}>
          <strong>{data ? Number(data[key]).toLocaleString() : '—'}</strong>
          <span>{label}</span>
        </div>
      ))}
    </section>
  );
}
export function CaseList() {
  const { data, error } = usePublicData(),
    [query, setQuery] = useState('');
  const cases =
    data?.cases?.filter((c) =>
      [c.display_name, c.office, c.city, c.region]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase()),
    ) || [];
  return (
    <>
      <div className="sf-filter">
        <label htmlFor="case-search">Search published cases</label>
        <input
          id="case-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name, office, or location"
        />
        <span>{data ? `${cases.length} shown · latest 50` : 'Loading…'}</span>
      </div>
      {error ? (
        <div className="sf-alert" role="status">
          The public record is temporarily unavailable. Please try again later.
        </div>
      ) : !data ? (
        <div className="sf-empty" role="status">
          Loading the public record…
        </div>
      ) : !cases.length ? (
        <div className="sf-empty">
          <span className="sf-empty-icon" aria-hidden="true">
            ◎
          </span>
          <h2>{query ? 'No matching cases' : 'No cases have been published yet'}</h2>
          <p>
            {query
              ? 'Try another name or location.'
              : 'Reports remain private while they are reviewed. Only approved cases appear here.'}
          </p>
          <Link href="/report" className="sf-link">
            Report an incident ↗
          </Link>
        </div>
      ) : (
        <div className="sf-case-grid">
          {cases.map((c) => (
            <Link href={`/transparency/${c.id}`} key={c.id} className="sf-card sf-case-card">
              <span className="sf-badge">Reviewed & published</span>
              <h2>{c.display_name}</h2>
              <p>{c.office}</p>
              <span className="sf-muted">
                {c.city} · {c.region}
              </span>
              <div className="sf-case-bottom">
                <span>{c.verified_report_count} distinct reporting identities</span>
                <span aria-hidden="true">↗</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
export function ReportingData() {
  const { data, error } = usePublicData();
  return (
    <div className="sf-card">
      <h2>Reports by month</h2>
      <p className="sf-muted">
        Received reports include unreviewed allegations. Volume does not establish corruption.
      </p>
      {error ? (
        <p role="status">Statistics are unavailable.</p>
      ) : !data ? (
        <p>Loading…</p>
      ) : !data.months.length ? (
        <div className="sf-empty">
          <h3>No reports recorded yet</h3>
          <p>Monthly totals appear after reports are saved.</p>
        </div>
      ) : (
        <div className="sf-bars">
          {[...data.months].reverse().map((m) => (
            <div key={m.month}>
              <span>
                {new Date(`${m.month}T12:00:00Z`).toLocaleDateString('en', {
                  month: 'short',
                  year: 'numeric',
                  timeZone: 'UTC',
                })}
              </span>
              <div className="sf-bar-track">
                <div
                  style={{
                    width: `${Math.max(2, (Number(m.count) / Math.max(...data.months.map((x) => Number(x.count)))) * 100)}%`,
                  }}
                />
              </div>
              <strong>{Number(m.count).toLocaleString()}</strong>
            </div>
          ))}
        </div>
      )}
      <p className="sf-caption">
        {data
          ? `Updated ${new Date(data.updated_at).toLocaleString()}`
          : 'Totals come from the report database.'}
      </p>
    </div>
  );
}
