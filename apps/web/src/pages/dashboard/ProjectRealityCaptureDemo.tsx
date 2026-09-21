import {ProjectRealityCapture} from "@/components/ui/pages/core-project-reality-capture";
import {MOCK_PROJECTS} from "@/lib/mock-data";

export function ProjectRealityCaptureDemo() {
	const project = MOCK_PROJECTS[0];

	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Project Reality Capture</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Site documentation with 360-degree imagery and BIM model comparisons for a specific project.
				</p>
			</div>

			<div className="wwc:border wwc:rounded-lg wwc:overflow-hidden" style={{height: "700px"}}>
				<ProjectRealityCapture project={project} />
			</div>
		</div>
	);
}
