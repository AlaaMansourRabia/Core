import {OrgRealityCapture} from "@/components/ui/pages/core-org-reality-capture";
import {MOCK_ORGANIZATIONS} from "@/lib/mock-data";

export function OrgRealityCaptureDemo() {
	const selectedOrg = MOCK_ORGANIZATIONS[0];

	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Reality Capture</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					360-degree photos, drone imagery, and BIM model comparison tools for site documentation.
				</p>
			</div>

			<div className="wwc:border wwc:rounded-lg wwc:overflow-hidden" style={{height: "800px"}}>
				<OrgRealityCapture selectedOrg={selectedOrg} />
			</div>
		</div>
	);
}
