import Link from 'next/link';
import { Shell, PageHeading } from '../components/Shell';
export default function Page() {
  return (
    <Shell>
      <div className="sf-wrap sf-content" lang="am">
        <PageHeading eyebrow="አማርኛ" title="ለማውራት የሚሆን ቦታ።">
          ያዩትን ወይም ያጋጠመዎትን ያጋሩ። ሪፖርትዎ በሰው እስኪገመገም ድረስ የግል ይሆናል።
        </PageHeading>
        <Link href="/report?lang=am" className="sf-button">
          ሪፖርት ያድርጉ ↗
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
