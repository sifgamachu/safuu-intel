import { Shell, PageHeading } from '../components/Shell';
import { CaseList, Stats } from '../components/PublicData';
export default function Wall() {
  return (
    <Shell active="transparency">
      <div className="sf-wrap">
        <PageHeading eyebrow="Evidence before exposure" title="The public record.">
          Only reviewed cases with publication approval appear here. An allegation is not a finding
          of guilt.
        </PageHeading>
      </div>
      <Stats />
      <div className="sf-wrap sf-content" style={{ paddingTop: 30 }}>
        <CaseList />
        <p className="sf-caption">
          Private report text, reporter identifiers, and attachments are excluded. Published names
          require the case’s review threshold and a separate human decision.
        </p>
      </div>
    </Shell>
  );
}
