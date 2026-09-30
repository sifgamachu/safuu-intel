import Link from 'next/link';
import { Shell, PageHeading } from '../components/Shell';
export default function Page() {
  return (
    <Shell>
      <div className="sf-wrap sf-content" lang="ti">
        <PageHeading eyebrow="ትግርኛ" title="ንምዝራብ ዝኸውን ቦታ።">
          ዝረኣኹምዎ ወይ ዘጋጠመኩም ኣካፍሉ። ጸብጻብኩም ብሰብ ክሳዕ ዝግምገም ብሕታዊ እዩ።
        </PageHeading>
        <Link href="/report?lang=ti" className="sf-button">
          ጸብጻብ ልኣኹ ↗
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
