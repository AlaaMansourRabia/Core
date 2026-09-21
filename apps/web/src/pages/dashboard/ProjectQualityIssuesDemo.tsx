import {ProjectQualityIssues} from "@/components/ui/pages/core-project-quality-issues";
import {MOCK_PROJECTS} from "@/lib/mock-data";

export function ProjectQualityIssuesDemo() {
	const project = MOCK_PROJECTS[0];

	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Quality & Issues</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Quality control tracking and issue management for project oversight.
				</p>
			</div>

			<div className="wwc:border wwc:rounded-lg wwc:overflow-hidden" style={{height: "700px"}}>
				<ProjectQualityIssues project={project} />
			</div>
		</div>
	);
}
