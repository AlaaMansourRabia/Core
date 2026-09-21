import {OrgWorkforceIntelligence} from "@/components/ui/pages/core-org-workforce-intelligence";
import {MOCK_ORGANIZATIONS} from "@/lib/mock-data";

export function OrgWorkforceDemo() {
	const selectedOrg = MOCK_ORGANIZATIONS[0];

	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Workforce Intelligence</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Real-time workforce tracking and analytics across all organization projects.
				</p>
			</div>

			<div className="wwc:border wwc:rounded-lg wwc:overflow-hidden" style={{height: "800px"}}>
				<OrgWorkforceIntelligence selectedOrg={selectedOrg} />
			</div>
		</div>
	);
}
