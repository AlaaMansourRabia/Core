import {ProjectOverview} from "@/components/ui/pages/core-project-overview";
import {MOCK_PROJECTS} from "@/lib/mock-data";

export function ProjectOverviewDemo() {
	const project = MOCK_PROJECTS[0];

	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Project Overview</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Detailed view of a single project with key metrics and status information.
				</p>
			</div>

			<div className="wwc:border wwc:rounded-lg wwc:overflow-hidden" style={{height: "700px"}}>
				<ProjectOverview project={project} />
			</div>
		</div>
	);
}
