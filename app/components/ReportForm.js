'use client';
import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { LANGUAGES, CORRUPTION_TYPES, getPrompts } from '../../lib/intake-prompts.mjs';
import { validateReport, validateEvidence } from '../../lib/domain.mjs';
const COPY = {
  en: {
    steps: ['Incident', 'Details', 'Review'],
    name: 'Person’s name',
    office: 'Office or organization',
    title: 'Position or job title',
    city: 'City or town',
    region: 'Region',
    category: 'Type of incident',
    date: 'When did it happen?',
    description: 'What happened?',
    amount: 'Amount in Ethiopian Birr',
    note: 'Anything else?',
    next: 'Continue',
    back: 'Back',
    submit: 'Submit privately',
    optional: 'optional',
    heading: 'Share what you know.',
  },
  am: {
    steps: ['ድርጊት', 'ዝርዝር', 'ግምገማ'],
    name: 'የሰውየው ስም',
    office: 'ቢሮ ወይም ድርጅት',
    title: 'የሥራ ማዕረግ',
    city: 'ከተማ',
    region: 'ክልል',
    category: 'የድርጊቱ ዓይነት',
    date: 'መቼ ተከሰተ?',
    description: 'ምን ተከሰተ?',
    amount: 'መጠን በኢትዮጵያ ብር',
    note: 'ሌላ ነገር?',
    next: 'ይቀጥሉ',
    back: 'ተመለስ',
    submit: 'በግል ይላኩ',
    optional: 'አማራጭ',
    heading: 'የሚያውቁትን ያጋሩ።',
  },
  or: {
    steps: ['Taatee', 'Bal’ina', 'Ilaaluu'],
    name: 'Maqaa namaa',
    office: 'Waajjira ykn dhaabbata',
    title: 'Sadarkaa hojii',
    city: 'Magaalaa',
    region: 'Naannoo',
    category: 'Gosa taatee',
    date: 'Yoom raawwate?',
    description: 'Maal ta’e?',
    amount: 'Hamma Birrii Itoophiyaan',
    note: 'Waan biraa?',
    next: 'Itti fufi',
    back: 'Duubatti',
    submit: 'Iccitiin ergi',
    optional: 'filannoo',
    heading: 'Waan beektan qoodaa.',
  },
  ti: {
    steps: ['ፍጻመ', 'ዝርዝር', 'ግምገማ'],
    name: 'ስም እቲ ሰብ',
    office: 'ቤት ጽሕፈት ወይ ትካል',
    title: 'ናይ ስራሕ መዓርግ',
    city: 'ከተማ',
    region: 'ዞባ',
    category: 'ዓይነት ፍጻመ',
    date: 'መዓስ ተፈጺሙ?',
    description: 'እንታይ ተፈጺሙ?',
    amount: 'መጠን ብብር ኢትዮጵያ',
    note: 'ካልእ ነገር?',
    next: 'ቀጽል',
    back: 'ተመለስ',
    submit: 'ብብሕቲ ልኣኽ',
    optional: 'ኣማራጺ',
    heading: 'እትፈልጥዎ ኣካፍሉ።',
  },
  so: {
    steps: ['Dhacdada', 'Faahfaahin', 'Dib u eeg'],
    name: 'Magaca qofka',
    office: 'Xafiiska ama hay’adda',
    title: 'Jagada shaqada',
    city: 'Magaalada',
    region: 'Gobolka',
    category: 'Nooca dhacdada',
    date: 'Goorma ayay dhacday?',
    description: 'Maxaa dhacay?',
    amount: 'Qaddarka Birr Itoobiya',
    note: 'Wax kale?',
    next: 'Sii wad',
    back: 'Dib',
    submit: 'Si gaar ah u gudbi',
    optional: 'ikhtiyaari',
    heading: 'La wadaag waxa aad ogtahay.',
  },
};
const EMPTY = {
  full_name: '',
  office: '',
  position_title: '',
  city: '',
  region: '',
  corruption_type: '',
  incident_date_raw: '',
  description: '',
  amount_etb: '',
  note: '',
};
function secret() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('');
}
async function jsonRequest(path, body) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed. Please retry.');
  return data;
}
export default function ReportForm() {
  const [language, setLanguage] = useState('en'),
    [draft, setDraft] = useState(EMPTY),
    [step, setStep] = useState(0),
    [files, setFiles] = useState([]),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [ready, setReady] = useState(false),
    [connecting, setConnecting] = useState(true),
    [keys, setKeys] = useState(null),
    [receipt, setReceipt] = useState(null),
    [consent, setConsent] = useState(false),
    [copied, setCopied] = useState(false),
    [siteKey, setSiteKey] = useState(null),
    [reviewTeam, setReviewTeam] = useState('unconfirmed'),
    [evidenceReady, setEvidenceReady] = useState(false),
    [challenge, setChallenge] = useState('');
  const widget = useRef(null),
    widgetId = useRef(null),
    reconnect = useRef(null),
    title = useRef(null);
  const c = COPY[language];
  useEffect(() => {
    const lang = new URLSearchParams(location.search).get('lang');
    if (COPY[lang]) setLanguage(lang);
    setKeys({ id: crypto.randomUUID(), secret: secret() });
    let active = true;
    let fetching = false;
    const controller = new AbortController();
    async function initialize() {
      if (fetching) return;
      fetching = true;
      setConnecting(true);
      try {
        const response = await fetch('/api/reports', {
          cache: 'no-store',
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (active) {
          setReady(true);
          setSiteKey(data.turnstile_site_key);
          setReviewTeam(data.review_team);
          setEvidenceReady(data.evidence === 'private_storage_verified');
          setError('');
        }
      } catch {
        if (active)
          setError(
            'Reporting is temporarily unavailable. Keep your draft on this page and try again later.',
          );
      } finally {
        fetching = false;
        if (active) setConnecting(false);
      }
    }
    reconnect.current = initialize;
    initialize();
    return () => {
      active = false;
      controller.abort();
      reconnect.current = null;
    };
  }, []);
  useEffect(() => {
    if (!draft.office && !draft.description) return;
    const guard = (e) => {
      if (!receipt) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [draft.office, draft.description, receipt]);
  function renderChallenge() {
    if (window.turnstile && widget.current && widgetId.current === null)
      widgetId.current = window.turnstile.render(widget.current, {
        sitekey: siteKey,
        action: 'report',
        theme: 'dark',
        callback: setChallenge,
        'expired-callback': () => setChallenge(''),
      });
  }
  useEffect(() => {
    if (siteKey && step === 2) renderChallenge();
  }, [siteKey, step]);
  useEffect(() => {
    if (siteKey && step !== 2 && widgetId.current !== null) {
      window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
      setChallenge('');
    }
  }, [step, siteKey]);
  const change = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  function go(next) {
    setError('');
    setStep(next);
    requestAnimationFrame(() => title.current?.focus());
  }
  function advance(e) {
    e.preventDefault();
    try {
      if (step === 0) {
        validateReport({
          ...draft,
          language,
          description: 'Validation placeholder for the incident step.',
          evidence_ids: [],
        });
      } else validateReport({ ...draft, language, evidence_ids: [] });
      go(step + 1);
    } catch (err) {
      setError(err.message);
    }
  }
  function addFiles(event) {
    try {
      const incoming = Array.from(event.target.files || []);
      if (files.length + incoming.length > 4) throw new Error('Attach up to four files.');
      incoming.forEach((file) => validateEvidence({ type: file.type, size: file.size }));
      setFiles((current) => [
        ...current,
        ...incoming.map((file) => ({ key: crypto.randomUUID(), file, id: null })),
      ]);
      setError('');
    } catch (err) {
      setError(err.message);
    }
    event.target.value = '';
  }
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    if (!consent) {
      setError('Confirm that you are submitting in good faith.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const evidence = [];
      for (const item of files) {
        let id = item.id;
        if (!id) {
          const reservation = await jsonRequest('/api/evidence/upload', {
            type: item.file.type,
            size: item.file.size,
          });
          const uploaded = await fetch(reservation.upload_url, {
            method: 'PUT',
            headers: { 'Content-Type': item.file.type, 'x-upsert': 'false' },
            body: item.file,
            signal: AbortSignal.timeout(120000),
          });
          if (!uploaded.ok)
            throw new Error(
              'An attachment could not be uploaded. Your draft is here; please retry.',
            );
          id = reservation.id;
          setFiles((current) => current.map((f) => (f.key === item.key ? { ...f, id } : f)));
        }
        evidence.push(id);
      }
      const { receipt: saved } = await jsonRequest('/api/reports', {
        request_id: keys.id,
        receipt_secret: keys.secret,
        report: { ...draft, language, evidence_ids: evidence },
        challenge_token: challenge,
      });
      setReceipt(saved);
      setDraft(EMPTY);
      setFiles([]);
      requestAnimationFrame(() => window.scrollTo({ top: 0 }));
    } catch (err) {
      setError(
        err.name === 'TimeoutError'
          ? 'The connection timed out before we could confirm a save. Keep this page open and retry.'
          : err.message || 'We could not confirm a save. Keep this page open and retry.',
      );
      if (siteKey) {
        window.turnstile?.reset(widgetId.current);
        setChallenge('');
      }
    } finally {
      setBusy(false);
    }
  }
  function field(
    key,
    label,
    { optional = false, maxLength = 180, placeholder = '', wide = false, type = 'text' } = {},
  ) {
    return (
      <div className={wide ? 'sf-field-wide' : undefined}>
        <label htmlFor={key}>
          {label}
          {optional && <small>{c.optional}</small>}
        </label>
        <input
          id={key}
          name={key}
          value={draft[key]}
          onChange={(e) => change(key, e.target.value)}
          required={!optional}
          type={type}
          maxLength={maxLength}
          placeholder={placeholder}
          autoComplete="off"
        />
      </div>
    );
  }
  if (receipt) {
    const code = `${keys.id}.${keys.secret}`;
    return (
      <section className="sf-receipt" role="status">
        <p className="sf-eyebrow">Saved for human review</p>
        <h1>
          Your report has
          <br />
          been received.
        </h1>
        <p>
          Your report was saved on {new Date(receipt.saved_at).toLocaleString()}. It remains private
          while it is reviewed.
        </p>
        <p>
          <strong>Keep this private tracking code.</strong>
          <br />
          We cannot recover it for you. Anyone with this code can see your report’s status.
        </p>
        <code>{code}</code>
        <button
          className="sf-button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
            } catch {
              setCopied(false);
              setError('Select and copy the code above.');
            }
          }}
        >
          {copied ? 'Copied ✓' : 'Copy tracking code'}
        </button>
        {error && <p>{error}</p>}
        <p className="sf-field-help">Receipt fingerprint: {receipt.ledger_hash}</p>
        <p>
          A receipt confirms storage. It does not verify the allegation or promise a review date.
        </p>
        {reviewTeam !== 'configured' && (
          <p className="sf-alert">
            Review team setup is pending. Your report is saved, but human review cannot begin until
            authorized staff are configured.
          </p>
        )}
        <Link href="/tracker" className="sf-link">
          Check a report’s status ↗
        </Link>
      </section>
    );
  }
  return (
    <div className="sf-form-layout">
      <div className="sf-card">
        {!ready && !connecting && error && (
          <button
            className="sf-button sf-secondary"
            type="button"
            onClick={() => reconnect.current?.()}
          >
            Retry connection
          </button>
        )}
        {ready && reviewTeam !== 'configured' && (
          <p className="sf-alert" role="status">
            Review team setup is pending. Reports can be saved privately, but human review cannot
            begin until authorized staff are configured. No review deadline is promised.
          </p>
        )}
        {ready && !evidenceReady && (
          <p className="sf-alert" role="status">
            Private attachments are temporarily unavailable. You can continue with a written report.
          </p>
        )}
        <ol className="sf-form-steps" aria-label="Report progress">
          {c.steps.map((label, i) => (
            <li key={i} aria-current={i === step ? 'step' : undefined}>
              <span>{i < step ? '✓' : i + 1}</span>
              {label}
            </li>
          ))}
        </ol>
        <div className="sf-form-toolbar">
          <h2 ref={title} tabIndex={-1}>
            {step === 0 ? c.heading : step === 1 ? c.description : c.steps[2]}
          </h2>
          <select
            aria-label="Reporting language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.native}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <div className="sf-alert" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={step === 2 ? submit : advance} lang={language}>
          {step === 0 && (
            <div className="sf-form-grid">
              {field('full_name', c.name, {
                optional: true,
                placeholder: language === 'en' ? 'Leave blank if unknown' : '',
              })}
              {field('position_title', c.title, { optional: true })}
              {field('office', c.office, {
                wide: true,
                placeholder: language === 'en' ? 'For example, a district land office' : '',
              })}
              {field('city', c.city, { maxLength: 120 })}
              {field('region', c.region, { maxLength: 120, optional: true })}
              <div>
                <label htmlFor="corruption_type">{c.category}</label>
                <select
                  id="corruption_type"
                  value={draft.corruption_type}
                  onChange={(e) => change('corruption_type', e.target.value)}
                  required
                >
                  <option value="">—</option>
                  {CORRUPTION_TYPES.map((t) => (
                    <option value={t.code} key={t.code}>
                      {t[language] || t.en}
                    </option>
                  ))}
                </select>
              </div>
              {field('incident_date_raw', c.date, {
                optional: true,
                maxLength: 120,
                placeholder: language === 'en' ? 'An approximate date is fine' : '',
              })}
            </div>
          )}
          {step === 1 && (
            <>
              <label htmlFor="description">{c.description}</label>
              <textarea
                id="description"
                value={draft.description}
                onChange={(e) => change('description', e.target.value)}
                required
                minLength={20}
                maxLength={5000}
                placeholder={
                  language === 'en'
                    ? 'What did you see or experience? Include the sequence of events and relevant details.'
                    : ''
                }
              />
              <p className="sf-field-help">
                {draft.description.length.toLocaleString()} / 5,000 ·{' '}
                {getPrompts(language)
                  .step7.replace(/<[^>]*>/g, '')
                  .replace('7/11', '')
                  .trim()}
              </p>
              <div className="sf-form-grid" style={{ marginTop: 25 }}>
                {field('amount_etb', c.amount, { optional: true, type: 'number', maxLength: 24 })}
                <div>
                  <label htmlFor="note">
                    {c.note}
                    <small>{c.optional}</small>
                  </label>
                  <input
                    id="note"
                    value={draft.note}
                    onChange={(e) => change('note', e.target.value)}
                    maxLength={1500}
                  />
                </div>
              </div>
              <label className="sf-upload">
                Add private evidence
                <span>JPG, PNG, PDF, or audio · up to 4 files · 10 MB each</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,application/pdf,audio/ogg,audio/mpeg,audio/mp4"
                  aria-label="Attach private evidence"
                  onChange={addFiles}
                  disabled={!evidenceReady || busy}
                />
              </label>
              <ul className="sf-files">
                {files.map((item) => (
                  <li key={item.key}>
                    <span>
                      {item.file.name} · {(item.file.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                    <button
                      type="button"
                      className="sf-text-button"
                      aria-label={`Remove ${item.file.name}`}
                      onClick={() =>
                        setFiles((current) => current.filter((f) => f.key !== item.key))
                      }
                    >
                      Remove ×
                    </button>
                  </li>
                ))}
              </ul>
              <p className="sf-field-help">
                Attachments are private. Files can contain names, locations, or other identifying
                details. Consider what you share.
              </p>
            </>
          )}
          {step === 2 && (
            <>
              <p className="sf-muted">
                Check your account of the incident. Your report will be saved privately for review.
              </p>
              <dl className="sf-review-list">
                {[
                  [c.name, draft.full_name || 'Unknown'],
                  [c.office, draft.office],
                  [c.city, `${draft.city}${draft.region ? `, ${draft.region}` : ''}`],
                  [c.date, draft.incident_date_raw || 'Unknown'],
                  [
                    c.category,
                    CORRUPTION_TYPES.find((x) => x.code === draft.corruption_type)?.[language],
                  ],
                  [c.description, draft.description],
                  [c.amount, draft.amount_etb || 'Not provided'],
                  [c.note, draft.note || 'Not provided'],
                  ['Attachments', `${files.length} private file(s)`],
                ].map(([label, value], i) => (
                  <div key={i} style={{ display: 'contents' }}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <label className="sf-checkbox">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                />
                <span>
                  I am providing this account in good faith. I understand it is an allegation
                  requiring review, and I have read the{' '}
                  <Link href="/privacy" className="sf-link" target="_blank">
                    privacy guide
                  </Link>
                  .
                </span>
              </label>
              {siteKey && (
                <>
                  <Script
                    src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
                    onReady={renderChallenge}
                  />
                  <div ref={widget} style={{ marginTop: 20 }} />
                </>
              )}
            </>
          )}
          <div className="sf-form-actions">
            {step > 0 ? (
              <button
                type="button"
                className="sf-button sf-secondary"
                disabled={busy}
                onClick={() => go(step - 1)}
              >
                ← {c.back}
              </button>
            ) : (
              <span>No account needed. Your draft stays on this page.</span>
            )}
            <button
              className="sf-button"
              type="submit"
              disabled={busy || !ready || (step === 2 && siteKey && !challenge)}
            >
              {busy ? 'Saving your report…' : step === 2 ? c.submit : c.next}{' '}
              <span aria-hidden="true">{step === 2 ? '↗' : '→'}</span>
            </button>
          </div>
        </form>
      </div>
      <aside>
        <h3>
          Share the incident.
          <br />
          Protect your identity.
        </h3>
        <p>You do not need to provide your own name, phone number, or email address.</p>
        <h3>A name is optional.</h3>
        <p>
          If you don’t know the person’s name, the office and location can still help a reviewer
          understand your report.
        </p>
        <h3>Evidence stays private.</h3>
        <p>
          Attachments are available only through the authorized review desk. Submissions do not
          appear on the public record automatically.
        </p>
        <Link className="sf-link" href="/privacy">
          Privacy & safety guide ↗
        </Link>
      </aside>
    </div>
  );
}
