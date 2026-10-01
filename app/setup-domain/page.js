import Link from 'next/link';
import { Shell, PageHeading } from '../components/Shell';
export default function Hosting() {
  return (
    <Shell>
      <div className="sf-wrap sf-content">
        <PageHeading eyebrow="Deployment reference" title="Where Safuu runs.">
          The application is deployed on Vercel. Domain registration and DNS for safuu.net are
          managed with Cloudflare, as checked on 30 September 2026.
        </PageHeading>
        <article className="sf-prose">
          <h2>The live application.</h2>
          <p>
            <a className="sf-link" href="https://www.safuu.net">
              www.safuu.net
            </a>{' '}
            serves the production application. Reports, private evidence, and the queue use the
            connected Supabase project. The application source and release checks are on{' '}
            <a
              className="sf-link"
              href="https://github.com/sifgamachu/safuu-intel"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            .
          </p>
          <h2>Changing a domain.</h2>
          <p>
            Open the Vercel project’s Settings → Domains and use the records shown for that project.
            Apply those records in the Cloudflare DNS zone, then verify the domain in Vercel. DNS
            values and propagation times depend on the configuration; a generic IP address is not a
            substitute for the project’s instructions.
          </p>
          <div className="sf-actions">
            <a
              className="sf-button sf-secondary"
              href="https://vercel.com/docs/domains/working-with-domains/add-a-domain"
              target="_blank"
              rel="noreferrer"
            >
              Vercel domain guide ↗
            </a>
            <a
              className="sf-button sf-secondary"
              href="https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/"
              target="_blank"
              rel="noreferrer"
            >
              Cloudflare DNS guide ↗
            </a>
          </div>
          <h2>Check delivery.</h2>
          <p>
            The status page checks the connected services. The validation record describes the
            traffic tests and their limits. A working domain does not establish national
            report-processing capacity.
          </p>
          <Link className="sf-button" href="/status">
            View service status →
          </Link>
        </article>
      </div>
    </Shell>
  );
}
