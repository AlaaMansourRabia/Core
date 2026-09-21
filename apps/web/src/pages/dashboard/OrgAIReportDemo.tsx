import {OrgAIReport} from "@/components/ui/pages/core-org-ai-report";
import {MOCK_ORGANIZATIONS} from "@/lib/mock-data";

export function OrgAIReportDemo() {
	const selectedOrg = MOCK_ORGANIZATIONS[0];

	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">AI Report</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					AI-powered insights and automated report generation for organization analytics.
				</p>
			</div>

			<div className="wwc:border wwc:rounded-lg wwc:overflow-hidden" style={{height: "800px"}}>
				<OrgAIReport selectedOrg={selectedOrg} />
			</div>
		</div>
	);
}
