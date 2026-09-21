import {ProjectScheduleCost} from "@/components/ui/pages/core-project-schedule-cost";
import {MOCK_PROJECTS} from "@/lib/mock-data";

export function ProjectScheduleCostDemo() {
	const project = MOCK_PROJECTS[0];

	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Schedule & Cost</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Project schedule tracking, cost performance, and budget analysis.
				</p>
			</div>

			<div className="wwc:border wwc:rounded-lg wwc:overflow-hidden" style={{height: "700px"}}>
				<ProjectScheduleCost project={project} />
			</div>
		</div>
	);
}
