import Link from 'next/link';
import { SafuuMark } from './SafuuMark';
export function Shell({ children, active }) {
  return (
    <div className="sf">
      <a className="sf-skip" href="#main">
        Skip to content
      </a>
      <header className="sf-nav">
        <div className="sf-wrap sf-nav-inner">
          <Link href="/" className="sf-brand" aria-label="Safuu home">
            <SafuuMark size={27} tile />
            <span>
              SAFUU<small>CIVIC ACCOUNTABILITY</small>
            </span>
          </Link>
          <nav aria-label="Main navigation">
            <Link
              href="/transparency"
              aria-current={active === 'transparency' ? 'page' : undefined}
            >
              Public record
            </Link>
            <Link href="/tracker" aria-current={active === 'tracker' ? 'page' : undefined}>
              Track a report
            </Link>
            <Link href="/about" aria-current={active === 'about' ? 'page' : undefined}>
              Our approach
            </Link>
          </nav>
          <Link className="sf-button sf-small" href="/report">
            Report an incident <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="sf-footer sf-wrap">
        <div>
          <Link href="/" className="sf-wordmark">
            SAFUU <span>ሳፉ</span>
          </Link>
          <p>
            Every voice deserves to be heard.
            <br />
            Every allegation deserves a fair review.
          </p>
        </div>
        <div className="sf-footer-links">
          <Link href="/privacy">Privacy & safety</Link>
          <Link href="/status">Service status</Link>
          <Link href="/analytics">Reporting data</Link>
          <Link href="/admin">Review desk</Link>
        </div>
        <p className="sf-footnote">
          Independent civic reporting · Ethiopia
          <br />A report is an allegation, not a finding of guilt.
        </p>
      </footer>
    </div>
  );
}
export function PageHeading({ eyebrow, title, children }) {
  return (
    <div className="sf-page-heading">
      <p className="sf-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {children && <p className="sf-lead">{children}</p>}
    </div>
  );
}
