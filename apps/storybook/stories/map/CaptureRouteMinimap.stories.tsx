import type {Meta, StoryObj} from "storybook/internal/types";

import {
	BASE_CAPTURE_ROUTE,
	type CapturePoint,
	CaptureRouteMinimap,
	FloorPlan,
} from "@corensystem/coren-ui/capture-route-minimap";
import {WalkthroughModal} from "@corensystem/coren-ui/walkthrough-modal";
import {useState} from "react";

// The "main view" the mini-viewer floats over — a large site/map surface (grid + roads + buildings).
function MainView() {
	return (
		<div className="wwc:absolute wwc:inset-0 wwc:h-full wwc:w-full">
			<div className="wwc:absolute wwc:inset-0 wwc:bg-gradient-to-br wwc:from-slate-100 wwc:via-sky-50 wwc:to-emerald-50 dark:wwc:from-slate-900 dark:wwc:via-slate-900 dark:wwc:to-slate-800" />
			<svg className="wwc:absolute wwc:inset-0 wwc:h-full wwc:w-full wwc:text-slate-400/40" aria-hidden="true">
				<defs>
					<pattern id="crm-story-grid" width="48" height="48" patternUnits="userSpaceOnUse">
						<path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="1" />
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#crm-story-grid)" />
				<path d="M0 360 Q 320 280 640 380 T 1280 340" fill="none" stroke="currentColor" strokeWidth="9" />
				<path d="M240 0 L 300 700" fill="none" stroke="currentColor" strokeWidth="6" />
				<path d="M700 0 L 760 700" fill="none" stroke="currentColor" strokeWidth="5" />
				<rect x={120} y={220} width={110} height={90} rx={6} fill="currentColor" opacity={0.3} />
				<rect x={420} y={180} width={190} height={140} rx={8} fill="currentColor" opacity={0.35} />
			</svg>
		</div>
	);
}

const meta = {
	title: "Widgets/Map/Capture Route Minimap",
	component: CaptureRouteMinimap,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"A floating, resizable, collapsible mini-viewer that overlays a main view: an overview of a whole floor plan with the capture walk drawn over it. As a person walks the floor taking photos, their route is a blue path of ordered capture points (positioned as fractions of the plan, so it tracks the plan at any size). Drag any corner to resize, minimize to a map-icon button, and click a point to surface that capture (here, the Walkthrough Modal). Pass your own `plan` and `points`; `FloorPlan` / `captureRouteForFloor` are bundled demo helpers.",
			},
		},
	},
} satisfies Meta<typeof CaptureRouteMinimap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => {
		function Demo() {
			const [openPoint, setOpenPoint] = useState<CapturePoint | null>(null);
			const openIndex = openPoint ? BASE_CAPTURE_ROUTE.findIndex((p) => p.id === openPoint.id) : -1;
			return (
				<div className="wwc:relative wwc:h-[560px] wwc:overflow-hidden wwc:rounded-lg wwc:border">
					<MainView />
					<CaptureRouteMinimap
						className="wwc:absolute wwc:right-4 wwc:top-4 wwc:z-10"
						label="Level 3 — Capture walk"
						plan={<FloorPlan />}
						points={BASE_CAPTURE_ROUTE}
						activeId={openPoint?.id}
						onPointSelect={setOpenPoint}
					/>
					<WalkthroughModal
						open={openPoint != null}
						onOpenChange={(open) => !open && setOpenPoint(null)}
						title={`${openIndex >= 0 ? `Capture ${openIndex + 1} of ${BASE_CAPTURE_ROUTE.length}` : "Capture"}${
							openPoint ? ` · ${openPoint.time}` : ""
						}`}
					/>
				</div>
			);
		}
		return <Demo />;
	},
};
