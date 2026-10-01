import Link from 'next/link';
import { Shell, PageHeading } from '../components/Shell';
export default function Afar() {
  return (
    <Shell>
      <div className="sf-wrap sf-content">
        <PageHeading eyebrow="Language access" title="Afar guidance is not ready yet.">
          You can write the incident in your own language. Guided intake is currently available in
          English, Amharic, Afaan Oromoo, Tigrinya, and Somali.
        </PageHeading>
        <Link href="/report" className="sf-button">
          Start a report ↗
        </Link>
      </div>
    </Shell>
  );
}
