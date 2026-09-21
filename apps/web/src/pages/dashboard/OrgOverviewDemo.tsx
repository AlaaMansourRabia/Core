import {OrgOverview} from "@/components/ui/pages/core-org-overview";
import {MOCK_ORGANIZATIONS} from "@/lib/mock-data";

export function OrgOverviewDemo() {
	const selectedOrg = MOCK_ORGANIZATIONS[0];

	const handleOpenProject = (project: {id: string; name: string}) => {
		console.log("Open wwc:project:", project);
		alert(`Opening wwc:project: ${project.name}`);
	};

	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Organization Overview</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					A map-based overview of all projects within an organization with KPIs and project details.
				</p>
			</div>

			<div className="wwc:border wwc:rounded-lg wwc:overflow-hidden" style={{height: "700px"}}>
				<OrgOverview selectedOrg={selectedOrg} onOpenProject={handleOpenProject} />
			</div>
		</div>
	);
}
