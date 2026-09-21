import {ProjectWorkforceSafety} from "@/components/ui/pages/core-project-workforce-safety";
import {MOCK_PROJECTS} from "@/lib/mock-data";

export function ProjectWorkforceSafetyDemo() {
	const project = MOCK_PROJECTS[0];

	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Workforce & Safety</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Workforce management and safety metrics for individual projects.
				</p>
			</div>

			<div className="wwc:border wwc:rounded-lg wwc:overflow-hidden" style={{height: "700px"}}>
				<ProjectWorkforceSafety project={project} />
			</div>
		</div>
	);
}
