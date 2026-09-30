'use client';
import { Shell, PageHeading } from './components/Shell';
export default function Error({ reset }) {
  return (
    <Shell>
      <div className="sf-wrap sf-content">
        <PageHeading eyebrow="Page unavailable" title="We could not load this page.">
          If you were submitting a report, only a saved receipt confirms it was received. Keep your
          draft open when possible.
        </PageHeading>
        <button className="sf-button" onClick={reset}>
          Try again →
        </button>
      </div>
    </Shell>
  );
}
