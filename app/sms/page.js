import Link from 'next/link';
import { Shell, PageHeading } from '../components/Shell';
export default function SMS() {
  return (
    <Shell>
      <div className="sf-wrap sf-content">
        <PageHeading eyebrow="Reporting channels" title="SMS is not active yet.">
          An SMS short code and provider connection have not been provisioned or verified for this
          release. Please use the private web form.
        </PageHeading>
        <Link href="/report" className="sf-button">
          Report on the web ↗
        </Link>
      </div>
    </Shell>
  );
}
