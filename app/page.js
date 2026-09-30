import Link from 'next/link';
import { Shell } from './components/Shell';
import { SafuuMark } from './components/SafuuMark';
import { Stats } from './components/PublicData';
export default function Home() {
  return (
    <Shell>
      <section className="sf-hero sf-wrap">
        <div>
          <p className="sf-eyebrow">For a fairer Ethiopia</p>
          <h1>
            Your voice.
            <br />
            Our shared
            <br />
            <em>accountability.</em>
          </h1>
          <p className="sf-lead">
            When corruption touches your life, your experience matters. Share what happened
            privately. Help build a public record grounded in evidence and fair review.
          </p>
          <div className="sf-actions">
            <Link href="/report" className="sf-button">
              Report an incident <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/transparency" className="sf-button sf-secondary">
              Explore the public record
            </Link>
          </div>
          <p className="sf-hero-note">
            <svg className="sf-seal-icon" viewBox="0 0 20 23" fill="none" aria-hidden="true">
              <path d="M10 1 18 4v7c0 5-8 10-8 10S2 16 2 11V4l8-3Z" stroke="currentColor" />
              <path d="m6 11 3 3 5-6" stroke="currentColor" />
            </svg>
            No name or phone number required to report.
          </p>
        </div>
        <div className="sf-feature-visual" aria-label="An illustration of a private report receipt">
          <div className="sf-orbit">
            <span className="sf-visual-dot" />
          </div>
          <div className="sf-receipt-visual">
            <div className="sf-receipt-top">
              <SafuuMark size={34} />
              <span>SAFUU · ሳፉ</span>
            </div>
            <div className="sf-visual-title">
              A voice heard.
              <br />A record kept.
            </div>
            <div className="sf-visual-label">INCIDENT DETAILS</div>
            <div className="sf-redacted" />
            <div className="sf-redacted" style={{ width: '59%' }} />
            <div className="sf-redacted" style={{ width: '72%' }} />
            <span className="sf-visual-check">✓ &nbsp;Private until reviewed</span>
            <div className="sf-visual-example">RECEIPT ILLUSTRATION · NO PERSONAL DATA</div>
          </div>
          <div className="sf-floating-note">
            <strong>Evidence before exposure.</strong>Names appear publicly only after review and
            publication approval.
          </div>
        </div>
      </section>
      <Stats />
      <section className="sf-section sf-wrap">
        <div className="sf-section-heading">
          <div>
            <p className="sf-eyebrow">A clear path forward</p>
            <h2>Speak up, at your own pace.</h2>
          </div>
          <p>
            You do not need every detail to begin. Tell us what you know, and leave what you don’t.
          </p>
        </div>
        <div className="sf-steps">
          {[
            [
              '01',
              'Tell us what happened',
              'Describe the incident, office, and location. A person’s name is optional. You can write in your preferred language.',
            ],
            [
              '02',
              'Keep your private receipt',
              'A receipt is issued after your report is saved. Keep its tracking code to check your report without an account.',
            ],
            [
              '03',
              'Let evidence guide review',
              'Reports go to a private review queue. The public record contains approved cases, without exposing reporters or attachments.',
            ],
          ].map(([n, title, text]) => (
            <div className="sf-step" key={n}>
              <span className="sf-step-number">{n} /</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="sf-language-band">
        <div className="sf-wrap sf-language-inner">
          <div>
            <p className="sf-eyebrow">Many languages. One shared purpose.</p>
            <h2>Tell it in your own words.</h2>
            <p>
              Guided intake in five languages. You can describe an incident in the language you are
              most comfortable using.
            </p>
          </div>
          <div className="sf-language-list">
            {[
              ['en', 'English'],
              ['am', 'አማርኛ'],
              ['or', 'Afaan Oromoo'],
              ['ti', 'ትግርኛ'],
              ['so', 'Soomaali'],
            ].map(([lang, label]) => (
              <Link key={lang} href={`/report?lang=${lang}`} lang={lang}>
                {label} ↗
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="sf-section sf-wrap">
        <div className="sf-callout">
          <div>
            <p className="sf-eyebrow">Trust begins with clarity</p>
            <h2>
              Your story stays private
              <br />
              while it is reviewed.
            </h2>
          </div>
          <div>
            <p>
              We ask about the incident, not your identity. Be careful with details and attachments
              that could identify you. Your network or messaging provider may still have information
              about your visit.
            </p>
            <Link className="sf-link" href="/privacy">
              Read the privacy & safety guide ↗
            </Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
