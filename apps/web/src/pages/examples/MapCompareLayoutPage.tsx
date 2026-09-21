import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {MapCompareLayout} from "@/components/ui/pages/core-map-compare-layout";

export function MapCompareLayoutPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Map Compare Layout</h1>
					<CopyButton
						value="Map Compare Layout"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2 wwc:max-w-2xl">
					A map workspace that composes every map feature into one layout: a pannable, zoomable{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">CompareView</code> surface with an optional
					as-planned/as-built compare, a vertical{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">MapToolbar</code> (compare modes, locate,
					zoom, compass) top-right, an overview{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">MapMinimap</code> bottom-right that tracks and
					drives the view, and optional legend / title slots. Published as the{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">MapCompareLayout</code> template.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Full workspace</CardTitle>
						<CopyButton
							value="Map Compare Layout - Full workspace"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Drag to pan, scroll or use the toolbar's ± to zoom, hover the split button to compare (with the divider lock
						in side-by-side), drag the minimap to jump, and reset the compass to north. Activating a compare mode
						reveals a <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">TimestampPicker</code> centered
						over each view for scrubbing that side's capture.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:h-[560px]">
						<MapCompareLayout />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With session timeline</CardTitle>
						<CopyButton
							value="Map Compare Layout - With session timeline"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						A variant that fills the <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">bottomBar</code>{" "}
						slot with a <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">TimelineRangeSelector</code>.
						Activate a compare mode to reveal it, then drag the two handles to scrub the compared dates from the
						timeline instead of the top pickers — the pickers stay in sync.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:h-[560px]">
						<MapCompareLayout withSessionTimeline />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
