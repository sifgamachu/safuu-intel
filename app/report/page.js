import { Shell, PageHeading } from '../components/Shell';
import ReportForm from '../components/ReportForm';
export default function Report() {
  return (
    <Shell>
      <div className="sf-wrap sf-content">
        <PageHeading eyebrow="Private reporting" title="A place to speak up.">
          Describe what happened in three steps. Your report stays private while it is reviewed.
        </PageHeading>
        <ReportForm />
      </div>
    </Shell>
  );
}
