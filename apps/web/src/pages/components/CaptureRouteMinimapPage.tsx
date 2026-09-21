import {useState} from "react";

import {
	BASE_CAPTURE_ROUTE,
	type CapturePoint,
	CaptureRouteMinimap,
	FloorPlan,
} from "@/components/ui/capture-route-minimap";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {WalkthroughModal} from "@/components/ui/walkthrough-modal";

// The "main view" the mini-viewer floats over — a large site/map surface (grid + roads + buildings).
function MainView() {
	return (
		<div className="wwc:absolute wwc:inset-0 wwc:h-full wwc:w-full">
			<div className="wwc:absolute wwc:inset-0 wwc:bg-gradient-to-br wwc:from-slate-100 wwc:via-sky-50 wwc:to-emerald-50 dark:wwc:from-slate-900 dark:wwc:via-slate-900 dark:wwc:to-slate-800" />
			<svg className="wwc:absolute wwc:inset-0 wwc:h-full wwc:w-full wwc:text-slate-400/40" aria-hidden="true">
				<defs>
					<pattern id="crm-main-grid" width="48" height="48" patternUnits="userSpaceOnUse">
						<path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="1" />
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#crm-main-grid)" />
				<path d="M0 360 Q 320 280 640 380 T 1280 340" fill="none" stroke="currentColor" strokeWidth="9" />
				<path d="M240 0 L 300 700" fill="none" stroke="currentColor" strokeWidth="6" />
				<path d="M700 0 L 760 700" fill="none" stroke="currentColor" strokeWidth="5" />
				<rect x={120} y={220} width={110} height={90} rx={6} fill="currentColor" opacity={0.3} />
				<rect x={420} y={180} width={190} height={140} rx={8} fill="currentColor" opacity={0.35} />
				<rect x={840} y={430} width={150} height={110} rx={6} fill="currentColor" opacity={0.3} />
			</svg>
		</div>
	);
}

export function CaptureRouteMinimapPage() {
	const [openPoint, setOpenPoint] = useState<CapturePoint | null>(null);
	const openIndex = openPoint ? BASE_CAPTURE_ROUTE.findIndex((p) => p.id === openPoint.id) : -1;

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Capture Route Minimap</h1>
					<CopyButton
						value="Capture Route Minimap"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2 wwc:max-w-2xl">
					A floating mini-viewer that overlays a main view: an overview of a whole floor plan with the capture walk
					drawn over it, as a person walks the floor taking photos their route becomes a blue path of ordered capture
					points. Drag the corner to resize, collapse it to a map button, and click any point to open that capture —
					here, the <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">Map Compare Layout</code> with its
					session timeline.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Floating over a main view</CardTitle>
						<CopyButton
							value="Capture Route Minimap - Walk"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						The viewer floats top-right as a compact overlay. Drag any corner to resize, hit the minimize control to
						collapse it to a map button, hover a point for its capture time, and click a point to open the Map Compare
						Layout (with session timeline).
					</CardDescription>
				</CardHeader>
				<CardContent>
					{/* The "main view" the mini-viewer floats over. */}
					<div className="wwc:relative wwc:h-[620px] wwc:overflow-hidden wwc:rounded-lg wwc:border">
						<MainView />
						<CaptureRouteMinimap
							className="wwc:absolute wwc:right-4 wwc:top-4 wwc:z-10"
							label="Level 3 — Capture walk"
							plan={<FloorPlan />}
							points={BASE_CAPTURE_ROUTE}
							activeId={openPoint?.id}
							onPointSelect={setOpenPoint}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Clicking a capture point opens the walkthrough modal (Map Compare Layout + session timeline). */}
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
