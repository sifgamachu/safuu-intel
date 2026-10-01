import Link from 'next/link';
import { Shell, PageHeading } from '../components/Shell';
export default function FAQ() {
  const questions = [
    [
      'Do I need an account?',
      'No. You can submit through the web form without providing your own name, phone number, or email address.',
    ],
    [
      'What if I do not know the person’s name?',
      'Leave it blank. Describe the office, location, and incident as clearly as you can.',
    ],
    [
      'What can I attach?',
      'Up to four JPG, PNG, PDF, or supported audio files, each up to 10 MB. Attachments stay private. Audio is stored as evidence; automatic transcription is not enabled.',
    ],
    [
      'When will I get a receipt?',
      'Only after the database confirms that the report, evidence references, and receipt were saved together. If the connection fails, keep the page open and retry. The form reuses the same request identifier to avoid a duplicate report.',
    ],
    [
      'Does my report appear in public?',
      'No. Public names require a case review threshold and a separate publication approval. A report is an allegation, not a legal finding.',
    ],
    [
      'What languages can I use?',
      'Guided intake is available in English, Amharic, Afaan Oromoo, Tigrinya, and Somali. You can write incident details in another language, but translation is not automatic.',
    ],
    [
      'Is SMS available?',
      'SMS intake has not been provisioned or verified in this release. Use the web form or the Telegram bot.',
    ],
    [
      'Am I completely anonymous?',
      'We minimize identity information, but your device, network, or messaging provider may still identify you. Read the privacy guide before sharing sensitive details.',
    ],
  ];
  return (
    <Shell>
      <div className="sf-wrap sf-content">
        <PageHeading eyebrow="Questions & answers" title="Before you report." />
        <article className="sf-prose">
          {questions.map(([q, a]) => (
            <section key={q}>
              <h2 style={{ fontSize: 25 }}>{q}</h2>
              <p>{a}</p>
            </section>
          ))}
          <Link href="/report" className="sf-button">
            Start a report ↗
          </Link>
        </article>
      </div>
    </Shell>
  );
}
