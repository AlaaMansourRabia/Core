import {cn} from "@corensystem/core-utils";
import {X} from "lucide-react";
import {useState} from "react";

import {Badge} from "../badge";
import {Card} from "../card";
import {FragmentViewer, FragmentViewerProvider} from "../fragment-viewer";
import {Minimap} from "../minimap";
import {Progress} from "../progress";
import {ViewerToolbar} from "../viewer-toolbar";

const FLOAT_SHADOW = "wwc:shadow-[0_4px_12px_rgba(0,0,0,0.06)]";

// The Capture villa site sits at roughly this lon/lat (drives the minimap tile).
const SITE_LON = 6.1375;
const SITE_LAT = 46.1925;

type FloorStatus = "complete" | "in-progress" | "not-started";
type Floor = {
	id: string;
	name: string;
	level: number;
	status: FloorStatus;
	progress: number;
	workers: number;
	area: string;
};

const FLOORS: Floor[] = [
	{id: "roof", name: "Roof", level: 3, status: "not-started", progress: 0, workers: 0, area: "142 m²"},
	{id: "l02", name: "Second Floor", level: 2, status: "in-progress", progress: 46, workers: 6, area: "168 m²"},
	{id: "l01", name: "First Floor", level: 1, status: "in-progress", progress: 82, workers: 11, area: "168 m²"},
	{id: "l00", name: "Ground Floor", level: 0, status: "complete", progress: 100, workers: 3, area: "174 m²"},
	{id: "found", name: "Foundation", level: -1, status: "complete", progress: 100, workers: 0, area: "180 m²"},
];

const STATUS: Record<FloorStatus, {label: string; variant: "default" | "secondary" | "outline"}> = {
	complete: {label: "Complete", variant: "secondary"},
	"in-progress": {label: "In progress", variant: "default"},
	"not-started": {label: "Not started", variant: "outline"},
};

const TOTAL_WORKERS = FLOORS.reduce((sum, f) => sum + f.workers, 0);

export interface BuildingViewerCaptureProps {
	/** Fragments (.frag) model URL for the villa. Defaults to the bundled UpTown model. */
	src?: string;
	/** Fallback model URL if `src` fails to load. */
	fallbackSrc?: string;
	/** Worker URL for `@thatopen/fragments` (Vite: `import workerUrl from "@thatopen/fragments/worker?url"`). */
	workerUrl?: string;
}

/**
 * BuildingViewerCapture — the beta "Capture UI" variation of the Building Viewer template's 3D Viewer.
 * The villa's real ThatOpen 3D model with the Capture app's villa-level UI around it, built from the
 * design-system's capture components: frosted `Card` panels (a floor list + inspector), the `Minimap`,
 * status `Badge`s and `Progress` bars, and the `ViewerToolbar` — no docked header.
 */
export function BuildingViewerCapture({
	src = "/models/villa-vl4.frag",
	fallbackSrc = "/models-bundled/uptown.frag",
	workerUrl,
}: BuildingViewerCaptureProps = {}) {
	const [selectedId, setSelectedId] = useState<string | null>("l01");
	const [showInspector, setShowInspector] = useState(true);
	const selected = FLOORS.find((f) => f.id === selectedId) ?? null;

	return (
		<div className="wwc:relative wwc:h-full wwc:min-h-0 wwc:w-full wwc:overflow-hidden wwc:bg-background wwc:text-foreground">
			{/* ── 3D canvas + floating viewer toolbar ─────────────────────────────── */}
			{workerUrl ? (
				<FragmentViewerProvider>
					<div className="wwc:absolute wwc:inset-0">
						<FragmentViewer
							src={src}
							fallbackSrc={fallbackSrc}
							modelId="villa"
							workerUrl={workerUrl}
							showLogo={false}
						/>
					</div>
					<div className="wwc:pointer-events-none wwc:absolute wwc:inset-x-0 wwc:bottom-11 wwc:z-10 wwc:flex wwc:h-0 wwc:items-end wwc:justify-center">
						<ViewerToolbar className={cn("wwc:pointer-events-auto wwc:max-w-full", FLOAT_SHADOW)} />
					</div>
				</FragmentViewerProvider>
			) : (
				<div className="wwc:absolute wwc:inset-0 wwc:flex wwc:items-center wwc:justify-center wwc:bg-muted/30 wwc:p-6 wwc:text-center wwc:text-sm wwc:text-muted-foreground">
					Pass a <code className="wwc:mx-1 wwc:font-mono">workerUrl</code> to load the villa's 3D model.
				</div>
			)}

			{/* ── Floating floor panel (top-left) — the design-system frosted Card + floor list ─────── */}
			<Card
				variant="floating"
				className="wwc:absolute wwc:left-3 wwc:top-3 wwc:bottom-44 wwc:z-10 wwc:flex wwc:w-72 wwc:max-w-[60%] wwc:flex-col wwc:overflow-hidden"
			>
				<div className="wwc:flex wwc:items-baseline wwc:justify-between wwc:gap-2 wwc:px-3 wwc:pb-2 wwc:pt-3">
					<span className="wwc:text-sm wwc:font-semibold">Floors</span>
					<span className="wwc:text-xs wwc:text-muted-foreground">{FLOORS.length} levels · Villa A-12</span>
				</div>
				<div className="wwc:h-px wwc:w-full wwc:bg-border/60" />
				{/* The list owns the gap; the `li` collapses to `contents` so the button is the flex child.
				    Row padding (px-1.5) + the list's px-1.5 land the row text at the same 12px inset as the
				    header title, so header and rows share one left edge. */}
				<ul className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:list-none wwc:flex-col wwc:gap-1 wwc:overflow-y-auto wwc:p-1.5">
					{FLOORS.map((floor) => {
						const active = floor.id === selectedId;
						return (
							<li key={floor.id} className="wwc:contents">
								<button
									type="button"
									onClick={() => setSelectedId(active ? null : floor.id)}
									aria-pressed={active}
									className={cn(
										"wwc:w-full wwc:rounded-md wwc:border wwc:px-1.5 wwc:py-2 wwc:text-left wwc:transition-colors wwc:focus-visible:outline-none",
										active ? "wwc:border-primary wwc:bg-accent" : "wwc:border-transparent wwc:hover:bg-accent/60",
									)}
								>
									<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2">
										<span className="wwc:text-sm wwc:font-medium">{floor.name}</span>
										<Badge variant={STATUS[floor.status].variant}>{STATUS[floor.status].label}</Badge>
									</div>
									<div className="wwc:mt-2 wwc:flex wwc:items-center wwc:gap-2">
										<Progress value={floor.progress} className="wwc:h-1.5 wwc:flex-1" />
										<span className="wwc:w-9 wwc:text-right wwc:text-xs wwc:tabular-nums wwc:text-muted-foreground">
											{floor.progress}%
										</span>
									</div>
									<div className="wwc:mt-1.5 wwc:flex wwc:items-center wwc:gap-3 wwc:text-xs wwc:text-muted-foreground">
										<span>Level {floor.level}</span>
										<span>{floor.area}</span>
										<span>{floor.workers} on site</span>
									</div>
								</button>
							</li>
						);
					})}
				</ul>
			</Card>

			{/* ── Bottom-left: status + worker chips, then the design-system Minimap ─── */}
			<div className="wwc:absolute wwc:bottom-3 wwc:left-3 wwc:z-10 wwc:flex wwc:flex-col wwc:gap-2">
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<Badge variant="secondary">Model ready</Badge>
					<span className="wwc:rounded wwc:bg-background/80 wwc:px-1.5 wwc:py-0.5 wwc:text-xs wwc:text-muted-foreground wwc:shadow-sm">
						{TOTAL_WORKERS} workers on site
					</span>
				</div>
				<Minimap lon={SITE_LON} lat={SITE_LAT} label="Site" size="sm" />
			</div>

			{/* ── Right: floating floor inspector (frosted Card) ────────────────────── */}
			{showInspector && (
				<Card
					variant="floating"
					className="wwc:absolute wwc:right-3 wwc:top-3 wwc:bottom-28 wwc:z-20 wwc:flex wwc:w-[340px] wwc:max-w-[46%] wwc:flex-col wwc:overflow-hidden"
				>
					<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2 wwc:px-3 wwc:pb-2 wwc:pt-3">
						<span className="wwc:text-sm wwc:font-semibold">{selected ? selected.name : "Villa A-12"}</span>
						<button
							type="button"
							aria-label="Close inspector"
							onClick={() => setShowInspector(false)}
							className="wwc:text-muted-foreground wwc:transition-colors wwc:hover:text-foreground wwc:focus-visible:outline-none"
						>
							<X className="wwc:size-3.5" />
						</button>
					</div>
					<div className="wwc:h-px wwc:w-full wwc:bg-border/60" />
					<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:gap-4 wwc:overflow-y-auto wwc:p-3">
						{selected ? (
							<>
								<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2">
									<Badge variant={STATUS[selected.status].variant}>{STATUS[selected.status].label}</Badge>
									<span className="wwc:text-2xl wwc:font-semibold wwc:tabular-nums">{selected.progress}%</span>
								</div>
								<Progress value={selected.progress} />
								<dl className="wwc:grid wwc:grid-cols-2 wwc:gap-x-3 wwc:gap-y-2 wwc:text-sm">
									<dt className="wwc:text-muted-foreground">Level</dt>
									<dd className="wwc:text-right wwc:font-medium">{selected.level}</dd>
									<dt className="wwc:text-muted-foreground">Area</dt>
									<dd className="wwc:text-right wwc:font-medium">{selected.area}</dd>
									<dt className="wwc:text-muted-foreground">On site</dt>
									<dd className="wwc:text-right wwc:font-medium">{selected.workers} workers</dd>
								</dl>
							</>
						) : (
							<p className="wwc:text-sm wwc:text-muted-foreground">
								Select a floor from the panel to inspect its progress, area and crew.
							</p>
						)}
					</div>
				</Card>
			)}
		</div>
	);
}
