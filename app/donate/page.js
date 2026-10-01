import Link from 'next/link';
import { Shell, PageHeading } from '../components/Shell';

const WAYS = [
  {
    icon: '💻',
    name: 'Contribute code',
    description:
      'Review the production source, propose a fix, or improve tests through GitHub. Keep incident evidence and credentials out of public issues.',
    href: 'https://github.com/sifgamachu/safuu-intel',
    action: 'View the repository',
  },
  {
    icon: '🌐',
    name: 'Review language guidance',
    description:
      'Help native speakers review the five guided intake languages. Automatic translation and transcription are not active services.',
    href: 'https://github.com/sifgamachu/safuu-intel/issues/new',
    action: 'Propose a language improvement',
  },
  {
    icon: '🤝',
    name: 'Build a collaboration',
    description:
      'Explore ways civil society, researchers, and technical contributors can use the public record and help improve the service.',
    href: '/partners',
    action: 'Explore collaboration',
  },
  {
    icon: '📢',
    name: 'Share accurate information',
    description:
      'Use the press reference to describe what Safuu currently does, including the limits of privacy, review, and national capacity.',
    href: '/press',
    action: 'Read the press reference',
  },
];
export default function Support() {
  return (
    <Shell>
      <div className="sf-wrap sf-content">
        <PageHeading eyebrow="Sustain the mission" title="Keep accountability alive.">
          Support Safuu through code, language review, and informed civic collaboration.
        </PageHeading>
        <div className="sf-card sf-prose" style={{ marginBottom: 32 }}>
          <h2>Financial donations are not open.</h2>
          <p>
            This site has no active payment checkout or verified donation program. We do not publish
            donation tiers or claim that a payment will fund a fixed number of reports. Verified
            operating costs and a funding policy are needed before financial contributions can be
            offered.
          </p>
        </div>
        <div className="classic-dashboard-grid">
          {WAYS.map((way) => (
            <article className="sf-card sf-prose" key={way.name}>
              <p className="sf-eyebrow">{way.icon} CONTRIBUTE</p>
              <h2 style={{ fontSize: 26 }}>{way.name}</h2>
              <p>{way.description}</p>
              <Link
                className="sf-link"
                href={way.href}
                {...(way.href.startsWith('https:') ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                {way.action} →
              </Link>
            </article>
          ))}
        </div>
        <div className="sf-card sf-prose" style={{ marginTop: 32 }}>
          <h2>Follow the work.</h2>
          <p>
            The source code, release checks, and capacity validation records are available in the
            repository. Serving Ethiopia at national scale remains a rollout goal; the measured
            limits are documented.
          </p>
          <div className="sf-actions">
            <a
              className="sf-button"
              href="https://github.com/sifgamachu/safuu-intel"
              target="_blank"
              rel="noreferrer"
            >
              View Safuu on GitHub →
            </a>
            <Link className="sf-button sf-secondary" href="/status">
              Check service status
            </Link>
          </div>
        </div>
      </div>
    </Shell>
  );
}
