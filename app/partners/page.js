import Link from 'next/link';
import { Shell, PageHeading } from '../components/Shell';

const AREAS = [
  {
    icon: '⚖️',
    type: 'ADVOCACY',
    name: 'Civil Rights Organizations',
    desc: 'Use the approved public record to inform accountability work. Private reports and evidence are not available through a partner portal.',
    href: '/transparency',
    cta: 'View the public record',
  },
  {
    icon: '🎓',
    type: 'EDUCATION',
    name: 'Universities & Researchers',
    desc: 'Explore saved aggregate totals and monthly reporting counts. These are reports of allegations, not a representative survey or verified measure of corruption.',
    href: '/analytics',
    cta: 'Explore reporting data',
  },
  {
    icon: '📰',
    type: 'JOURNALISM',
    name: 'Investigative Journalists',
    desc: 'Check the published record and Safuu’s current capabilities before describing the service. Private case dossiers and reporter identities are not a public offering.',
    href: '/press',
    cta: 'Read the press reference',
  },
  {
    icon: '🏛️',
    type: 'LEGAL',
    name: 'Legal Aid Organizations',
    desc: 'Understand the review and publication process. Safuu does not provide legal findings, legal representation, or automatic referrals to authorities.',
    href: '/about',
    cta: 'Read the review approach',
  },
  {
    icon: '🤝',
    type: 'COMMUNITY',
    name: 'Community Organizations',
    desc: 'Share the reporting and privacy guides with people who choose to document an incident. Reporting does not guarantee a response or protection from retaliation.',
    href: '/privacy',
    cta: 'Read the privacy guide',
  },
  {
    icon: '💻',
    type: 'TECH',
    name: 'Technical Contributors',
    desc: 'The production source and release history are available on GitHub. Propose improvements through issues or pull requests without including sensitive evidence.',
    href: 'https://github.com/sifgamachu/safuu-intel',
    cta: 'View GitHub',
  },
];
export default function Partners() {
  return (
    <Shell>
      <div className="sf-wrap sf-content">
        <PageHeading eyebrow="Civil society collaboration" title="Build accountability together.">
          Safuu welcomes contributions to civic reporting. A formal partner network, private data
          access program, and referral agreements have not been established.
        </PageHeading>
        <div className="sf-card sf-prose" style={{ marginBottom: 32 }}>
          <h2>What you can use today.</h2>
          <p>
            The public record, reporting totals, privacy guide, and source code are available
            through the links below. No organization is listed here as an endorsed or active Safuu
            partner.
          </p>
        </div>
        <div className="classic-dashboard-grid">
          {AREAS.map((area) => (
            <article className="sf-card sf-prose" key={area.type}>
              <p className="sf-eyebrow">
                {area.icon} {area.type}
              </p>
              <h2 style={{ fontSize: 26 }}>{area.name}</h2>
              <p>{area.desc}</p>
              <Link
                className="sf-link"
                href={area.href}
                {...(area.href.startsWith('https:') ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                {area.cta} →
              </Link>
            </article>
          ))}
        </div>
        <div className="sf-card sf-prose" style={{ marginTop: 32 }}>
          <h2>Propose a collaboration.</h2>
          <p>
            Open a GitHub issue describing a non-sensitive contribution or collaboration idea.
            Issues are public: do not post incident reports, attachments, private tracking codes, or
            personal information there. Use the private form for an incident report.
          </p>
          <div className="sf-actions">
            <a
              className="sf-button"
              href="https://github.com/sifgamachu/safuu-intel/issues/new"
              target="_blank"
              rel="noreferrer"
            >
              Propose on GitHub →
            </a>
            <Link className="sf-button sf-secondary" href="/report">
              File a private report
            </Link>
          </div>
        </div>
      </div>
    </Shell>
  );
}
