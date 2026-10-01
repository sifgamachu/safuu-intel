'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Shell, PageHeading } from '../../components/Shell';
export default function Case({ params }) {
  const { id } = use(params),
    [data, setData] = useState(null),
    [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/public/cases/${id}`, { signal: controller.signal })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        return data;
      })
      .then(setData)
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message);
      });
    return () => controller.abort();
  }, [id]);
  return (
    <Shell active="transparency">
      <div className="sf-wrap sf-content">
        <PageHeading eyebrow="Reviewed public case" title={data?.display_name || 'Public case'}>
          {data
            ? `${data.office} · ${data.city}, ${data.region}`
            : 'Loading an approved public record.'}
        </PageHeading>
        {error ? (
          <div className="sf-alert" role="status">
            {error}
          </div>
        ) : data ? (
          <div className="sf-card sf-prose">
            <span className="sf-badge">Publication approved</span>
            <h2>Review record</h2>
            <dl className="sf-review-list">
              <dt>Position</dt>
              <dd>{data.position_title || 'Not provided'}</dd>
              <dt>Reviewed reports</dt>
              <dd>{data.verified_report_count} distinct reporting identities</dd>
              <dt>Published</dt>
              <dd>{new Date(data.disclosed_at).toLocaleDateString()}</dd>
              <dt>Referral</dt>
              <dd>{data.referred_agency || 'No referral recorded'}</dd>
            </dl>
            <p>
              This is a record of reviewed allegations. It does not establish guilt. Reporter
              identities and private evidence are excluded from this page.
            </p>
          </div>
        ) : (
          <p role="status">Loading…</p>
        )}
        <p style={{ marginTop: 30 }}>
          <Link className="sf-link" href="/transparency">
            ← All published cases
          </Link>
        </p>
      </div>
    </Shell>
  );
}
