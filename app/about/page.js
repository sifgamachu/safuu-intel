import Link from 'next/link';
import { Shell, PageHeading } from '../components/Shell';
export default function About() {
  return (
    <Shell active="about">
      <div className="sf-wrap sf-content">
        <PageHeading eyebrow="Our approach" title="Accountability with care.">
          Safuu is a civic reporting platform for Ethiopia. We help people document experiences of
          corruption and build a record through human review.
        </PageHeading>
        <article className="sf-prose">
          <h2>Start with what happened.</h2>
          <p>
            You can submit a written report and optional evidence without creating an account. We
            ask about the incident, office, and location. We do not require the reporter’s name,
            phone number, or email address.
          </p>
          <h2>A receipt after a real save.</h2>
          <p>
            The report and its receipt are recorded together. A private tracking code lets web
            reporters check the report’s status. A receipt confirms storage, not the truth of an
            allegation.
          </p>
          <h2>Review before publication.</h2>
          <p>
            Reports stay in a private review queue. Authorized reviewers consider their content and
            evidence. A case needs its configured threshold of reviewed reports from distinct
            reporting identities and explicit publication approval before a name appears publicly.
            Distinct identities do not guarantee distinct people; coordinated reporting still
            requires human assessment.
          </p>
          <h2>Clear limits.</h2>
          <p>
            Safuu does not make legal findings, promise a review deadline, or guarantee anonymity
            from network and messaging providers. Automatic translation, voice transcription, and AI
            evidence verification are not active in this release. Guided intake is available in
            English, Amharic, Afaan Oromoo, Tigrinya, and Somali; local language copy should be
            reviewed by native speakers.
          </p>
          <div className="sf-actions">
            <Link href="/report" className="sf-button">
              Report an incident ↗
            </Link>
            <Link href="/privacy" className="sf-button sf-secondary">
              Privacy & safety
            </Link>
          </div>
        </article>
      </div>
    </Shell>
  );
}
