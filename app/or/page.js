import Link from 'next/link';
import { Shell, PageHeading } from '../components/Shell';
export default function Page() {
  return (
    <Shell>
      <div className="sf-wrap sf-content" lang="or">
        <PageHeading eyebrow="Afaan Oromoo" title="Bakka itti dubbattan.">
          Waan argitan ykn isin mudate qoodaa. Gabaasni keessan hanga namni qoratutti iccitii ta’a.
        </PageHeading>
        <Link href="/report?lang=or" className="sf-button">
          Gabaasa ergi ↗
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
