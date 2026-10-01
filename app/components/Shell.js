import Link from 'next/link';
import ClassicNav from './ClassicNav';
export function Shell({ children, active }) {
  return (
    <div className="sf">
      <a className="sf-skip" href="#main">
        Skip to content
      </a>
      <ClassicNav active={active} />
      <main id="main">{children}</main>
      <footer className="sf-footer sf-wrap">
        <div>
          <Link href="/" className="sf-wordmark">
            SAFUU INTEL <span>ሳፉ</span>
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
