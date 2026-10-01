import Link from 'next/link';
import { Shell, PageHeading } from '../components/Shell';
export default function Page() {
  return (
    <Shell>
      <div className="sf-wrap sf-content" lang="so">
        <PageHeading eyebrow="Soomaali" title="Meel aad ku hadasho.">
          La wadaag waxa aad aragtay ama kugu dhacay. Warbixintaadu waa gaar ilaa qof uu dib u eego.
        </PageHeading>
        <Link href="/report?lang=so" className="sf-button">
          Gudbi warbixin ↗
        </Link>
        <p className="sf-muted" style={{ marginTop: 30 }}>
          We do not ask for your name or phone number. Network and messaging providers may still
          identify you.{' '}
          <Link href="/privacy" className="sf-link">
            Privacy guide ↗
          </Link>
        </p>
      </div>
    </Shell>
  );
}
