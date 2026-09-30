import { Shell, PageHeading } from '../components/Shell';
import { Stats, ReportingData } from '../components/PublicData';
export default function Analytics() {
  return (
    <Shell>
      <div className="sf-wrap">
        <PageHeading eyebrow="Aggregate reporting data" title="Understand the record.">
          Statistics come from saved reports. They describe reporting activity and review progress,
          not proven corruption.
        </PageHeading>
      </div>
      <Stats />
      <div className="sf-wrap sf-content" style={{ paddingTop: 40 }}>
        <ReportingData />
      </div>
    </Shell>
  );
}
