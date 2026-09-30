import { Shell, PageHeading } from '../components/Shell';
export default function Press() {
  return (
    <Shell>
      <div className="sf-wrap sf-content">
        <PageHeading eyebrow="Platform facts" title="About Safuu.">
          Safuu is an independent civic reporting platform for Ethiopia, with private intake and a
          reviewed public record.
        </PageHeading>
        <article className="sf-prose">
          <h2>Current capabilities</h2>
          <p>
            Written web and Telegram intake, optional private attachments, receipts, an authorized
            review desk, and aggregate reporting data. Guided intake supports five languages.
          </p>
          <h2>Publication standard</h2>
          <p>
            Names are published only after a case meets its configured review threshold and receives
            explicit approval. A published case records reviewed allegations; it does not establish
            legal guilt.
          </p>
          <h2>Claims we can substantiate</h2>
          <p>
            The record and service status pages report measured database information. Safuu does not
            claim automatic referrals, AI verification, guaranteed anonymity, or certified
            nationwide capacity. Capacity results and infrastructure requirements are documented
            with the source code.
          </p>
        </article>
      </div>
    </Shell>
  );
}
