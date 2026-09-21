import {OrgPerformance} from "@/components/ui/pages/core-org-performance";
import {MOCK_ORGANIZATIONS} from "@/lib/mock-data";

export function OrgPerformanceDemo() {
	const selectedOrg = MOCK_ORGANIZATIONS[0];

	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Organization Performance</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Performance metrics and analytics dashboard for organization-wide project monitoring.
				</p>
			</div>

			<div className="wwc:border wwc:rounded-lg wwc:overflow-hidden" style={{height: "800px"}}>
				<OrgPerformance selectedOrg={selectedOrg} />
			</div>
		</div>
	);
}
