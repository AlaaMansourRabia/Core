import {cn} from "@corensystem/core-utils";
import * as React from "react";

import {Badge} from "./badge";
import {Button} from "./button";
import {Card, CardContent, CardHeader, CardTitle} from "./card";
import {Progress} from "./progress";
import {ScrollArea} from "./scroll-area";
import {Separator} from "./separator";

/* ------------------------------------------------------------------ */
/* Inlined types + mock data (self-contained on purpose)               */
/* ------------------------------------------------------------------ */

type FloorStatus = "complete" | "in-progress" | "not-started";

type FloorSummary = {
	id: string;
	name: string;
	level: number;
	status: FloorStatus;
	progress: number;
	workers: number;
	area: string;
};

const MOCK_FLOORS: FloorSummary[] = [
	{id: "roof", name: "Roof", level: 3, status: "not-started", progress: 0, workers: 0, area: "142 m²"},
	{id: "l02", name: "Second Floor", level: 2, status: "in-progress", progress: 46, workers: 6, area: "168 m²"},
	{id: "l01", name: "First Floor", level: 1, status: "in-progress", progress: 82, workers: 11, area: "168 m²"},
	{id: "l00", name: "Ground Floor", level: 0, status: "complete", progress: 100, workers: 3, area: "174 m²"},
	{id: "found", name: "Foundation", level: -1, status: "complete", progress: 100, workers: 0, area: "180 m²"},
];

const STATUS_LABEL: Record<FloorStatus, string> = {
	complete: "Complete",
	"in-progress": "In progress",
	"not-started": "Not started",
};

const STATUS_VARIANT: Record<FloorStatus, "default" | "secondary" | "outline"> = {
	complete: "default",
	"in-progress": "secondary",
	"not-started": "outline",
};

/* ------------------------------------------------------------------ */
/* Viewer context — mirrors the original FragmentViewerProvider        */
/* ------------------------------------------------------------------ */

type FragmentViewerState = {
	floors: FloorSummary[];
	activeFloorId: string | null;
	setActiveFloorId: (id: string | null) => void;
	isolate: boolean;
	toggleIsolate: () => void;
	loadProgress: number;
	settled: boolean;
};

const FragmentViewerContext = React.createContext<FragmentViewerState | null>(null);

function useFragmentViewer(): FragmentViewerState {
	const ctx = React.useContext(FragmentViewerContext);
	if (!ctx) {
		throw new Error("useFragmentViewer must be used inside FragmentViewerProvider");
	}
	return ctx;
}

function FragmentViewerProvider({
	children,
	initialFloorId,
	onSettled,
}: {
	children: React.ReactNode;
	initialFloorId: string | null;
	onSettled?: () => void;
}) {
	const [activeFloorId, setActiveFloorId] = React.useState<string | null>(initialFloorId);
	const [isolate, setIsolate] = React.useState(false);
	const [loadProgress, setLoadProgress] = React.useState(0);
	const settledRef = React.useRef(false);

	React.useEffect(() => {
		setActiveFloorId(initialFloorId);
	}, [initialFloorId]);

	React.useEffect(() => {
		const timer = setInterval(() => {
			setLoadProgress((prev) => (prev >= 100 ? 100 : Math.min(100, prev + 14)));
		}, 140);
		return () => clearInterval(timer);
	}, []);

	React.useEffect(() => {
		if (loadProgress >= 100 && !settledRef.current) {
			settledRef.current = true;
			onSettled?.();
		}
	}, [loadProgress, onSettled]);

	const toggleIsolate = React.useCallback(() => setIsolate((prev) => !prev), []);

	const value = React.useMemo<FragmentViewerState>(
		() => ({
			floors: MOCK_FLOORS,
			activeFloorId,
			setActiveFloorId,
			isolate,
			toggleIsolate,
			loadProgress,
			settled: loadProgress >= 100,
		}),
		[activeFloorId, isolate, toggleIsolate, loadProgress],
	);

	return <FragmentViewerContext.Provider value={value}>{children}</FragmentViewerContext.Provider>;
}

/* ------------------------------------------------------------------ */
/* Icons (inline so the file has no non-Core imports)              */
/* ------------------------------------------------------------------ */

function IconHouse({className}: {className?: string}) {
	return (
		<svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} className={className} aria-hidden="true">
			<path d="M3 10.5 12 3l9 7.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M5.5 9.5V20h13V9.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M10 20v-5h4v5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

function IconZoomIn({className}: {className?: string}) {
	return (
		<svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} className={className} aria-hidden="true">
			<circle cx="11" cy="11" r="6.5" stroke="currentColor" />
			<path d="M20 20l-4.2-4.2M11 8.5v5M8.5 11h5" stroke="currentColor" strokeLinecap="round" />
		</svg>
	);
}

function IconZoomOut({className}: {className?: string}) {
	return (
		<svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} className={className} aria-hidden="true">
			<circle cx="11" cy="11" r="6.5" stroke="currentColor" />
			<path d="M20 20l-4.2-4.2M8.5 11h5" stroke="currentColor" strokeLinecap="round" />
		</svg>
	);
}

function IconOrbit({className}: {className?: string}) {
	return (
		<svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} className={className} aria-hidden="true">
			<circle cx="12" cy="12" r="3" stroke="currentColor" />
			<ellipse cx="12" cy="12" rx="9.5" ry="4.5" stroke="currentColor" transform="rotate(-28 12 12)" />
		</svg>
	);
}

function IconLayers({className}: {className?: string}) {
	return (
		<svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} className={className} aria-hidden="true">
			<path d="M12 3.5 21 8l-9 4.5L3 8l9-4.5Z" stroke="currentColor" strokeLinejoin="round" />
			<path d="M3 12.5 12 17l9-4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M3 16.5 12 21l9-4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

function IconReset({className}: {className?: string}) {
	return (
		<svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} className={className} aria-hidden="true">
			<path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5" stroke="currentColor" strokeLinecap="round" />
			<path d="M4 4v4h4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

/* ------------------------------------------------------------------ */
/* Stage — the 3D fragment canvas stand-in                             */
/* ------------------------------------------------------------------ */

const SLAB_GEOMETRY: Record<string, {y: number; depth: number}> = {
	roof: {y: 34, depth: 26},
	l02: {y: 76, depth: 30},
	l01: {y: 122, depth: 30},
	l00: {y: 168, depth: 30},
	found: {y: 214, depth: 22},
};

function HouseFragments() {
	const {floors, activeFloorId, setActiveFloorId, isolate} = useFragmentViewer();

	return (
		<svg
			viewBox="0 0 320 264"
			role="img"
			aria-label="Single house fragment model"
			className="wwc:h-full wwc:w-full wwc:max-h-[420px]"
		>
			<g transform="translate(0, 6)">
				{floors
					.slice()
					.reverse()
					.map((floor) => {
						const geo = SLAB_GEOMETRY[floor.id] ?? {y: 120, depth: 28};
						const isActive = activeFloorId === floor.id;
						const dimmed = isolate && activeFloorId !== null && !isActive;
						return (
							<g
								key={floor.id}
								onClick={() => setActiveFloorId(isActive ? null : floor.id)}
								className={cn(
									"wwc:cursor-pointer wwc:transition-opacity",
									dimmed ? "wwc:opacity-15" : "wwc:opacity-100",
								)}
							>
								{/* top face */}
								<polygon
									points={`160,${geo.y - 26} 262,${geo.y} 160,${geo.y + 26} 58,${geo.y}`}
									className={cn("wwc:stroke-border", isActive ? "wwc:fill-primary" : "wwc:fill-muted")}
									strokeWidth={1}
								/>
								{/* left face */}
								<polygon
									points={`58,${geo.y} 160,${geo.y + 26} 160,${geo.y + 26 + geo.depth} 58,${geo.y + geo.depth}`}
									className={cn("wwc:stroke-border", isActive ? "wwc:fill-primary/70" : "wwc:fill-secondary")}
									strokeWidth={1}
								/>
								{/* right face */}
								<polygon
									points={`262,${geo.y} 160,${geo.y + 26} 160,${geo.y + 26 + geo.depth} 262,${geo.y + geo.depth}`}
									className={cn("wwc:stroke-border", isActive ? "wwc:fill-primary/40" : "wwc:fill-muted")}
									strokeWidth={1}
								/>
							</g>
						);
					})}
			</g>
		</svg>
	);
}

function StageOverlayHeader() {
	const {activeFloorId, floors, settled} = useFragmentViewer();
	const active = floors.find((floor) => floor.id === activeFloorId) ?? null;

	return (
		<div className="wwc:pointer-events-none wwc:absolute wwc:left-4 wwc:top-4 wwc:flex wwc:items-center wwc:gap-3">
			<div className="wwc:flex wwc:size-9 wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:border-border wwc:bg-background/85 wwc:text-foreground wwc:shadow-sm wwc:backdrop-blur">
				<IconHouse className="wwc:size-5" />
			</div>
			<div className="wwc:flex wwc:flex-col">
				<span className="wwc:text-sm wwc:font-semibold wwc:leading-tight wwc:text-foreground">Villa A-12</span>
				<span className="wwc:text-xs wwc:leading-tight wwc:text-muted-foreground">
					{active ? `${active.name} · ${active.area}` : "Whole building"}
				</span>
			</div>
			<Badge variant={settled ? "secondary" : "outline"}>{settled ? "Model ready" : "Loading"}</Badge>
		</div>
	);
}

function StageToolbar() {
	const {isolate, toggleIsolate, setActiveFloorId} = useFragmentViewer();

	return (
		<div className="wwc:absolute wwc:bottom-4 wwc:left-1/2 wwc:flex wwc:-translate-x-1/2 wwc:items-center wwc:gap-1 wwc:rounded-lg wwc:border wwc:border-border wwc:bg-background/90 wwc:p-1 wwc:shadow-md wwc:backdrop-blur">
			<Button variant="ghost" size="sm" className="wwc:size-8 wwc:p-0" aria-label="Zoom in">
				<IconZoomIn className="wwc:size-4" />
			</Button>
			<Button variant="ghost" size="sm" className="wwc:size-8 wwc:p-0" aria-label="Zoom out">
				<IconZoomOut className="wwc:size-4" />
			</Button>
			<Button variant="ghost" size="sm" className="wwc:size-8 wwc:p-0" aria-label="Orbit">
				<IconOrbit className="wwc:size-4" />
			</Button>
			<Separator orientation="vertical" className="wwc:mx-1 wwc:h-5" />
			<Button
				variant={isolate ? "secondary" : "ghost"}
				size="sm"
				className="wwc:size-8 wwc:p-0"
				aria-label="Isolate selected floor"
				aria-pressed={isolate}
				onClick={toggleIsolate}
			>
				<IconLayers className="wwc:size-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				className="wwc:size-8 wwc:p-0"
				aria-label="Reset view"
				onClick={() => setActiveFloorId(null)}
			>
				<IconReset className="wwc:size-4" />
			</Button>
		</div>
	);
}

function LoadingVeil() {
	const {loadProgress, settled} = useFragmentViewer();
	if (settled) return null;

	return (
		<div className="wwc:absolute wwc:inset-0 wwc:z-10 wwc:flex wwc:flex-col wwc:items-center wwc:justify-center wwc:gap-3 wwc:bg-background/70 wwc:backdrop-blur-sm">
			<span className="wwc:text-sm wwc:font-medium wwc:text-foreground">Streaming fragments…</span>
			<Progress value={loadProgress} className="wwc:h-1.5 wwc:w-56" />
			<span className="wwc:text-xs wwc:tabular-nums wwc:text-muted-foreground">{loadProgress}%</span>
		</div>
	);
}

function FloorRail() {
	const {floors, activeFloorId, setActiveFloorId} = useFragmentViewer();

	return (
		<Card className="wwc:flex wwc:w-72 wwc:shrink-0 wwc:flex-col wwc:gap-0 wwc:overflow-hidden">
			<CardHeader className="wwc:gap-1">
				<CardTitle className="wwc:text-sm">Floors</CardTitle>
				<span className="wwc:text-xs wwc:text-muted-foreground">{floors.length} levels · click to isolate</span>
			</CardHeader>
			<Separator />
			<CardContent className="wwc:p-0">
				<ScrollArea className="wwc:h-[420px]">
					<div className="wwc:flex wwc:flex-col wwc:gap-1 wwc:p-2">
						{floors.map((floor) => {
							const isActive = floor.id === activeFloorId;
							return (
								<button
									key={floor.id}
									type="button"
									onClick={() => setActiveFloorId(isActive ? null : floor.id)}
									aria-pressed={isActive}
									className={cn(
										"wwc:w-full wwc:rounded-md wwc:border wwc:px-3 wwc:py-2 wwc:text-left wwc:transition-colors",
										"wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring",
										isActive ? "wwc:border-primary wwc:bg-accent" : "wwc:border-transparent wwc:hover:bg-accent/60",
									)}
								>
									<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2">
										<span className="wwc:text-sm wwc:font-medium wwc:text-foreground">{floor.name}</span>
										<Badge variant={STATUS_VARIANT[floor.status]}>{STATUS_LABEL[floor.status]}</Badge>
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
							);
						})}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}

function StageContent() {
	return (
		<div className="wwc:flex wwc:h-full wwc:w-full wwc:min-h-[480px] wwc:gap-4">
			<div className="wwc:relative wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-center wwc:justify-center wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border wwc:bg-muted/40">
				<StageOverlayHeader />
				<HouseFragments />
				<StageToolbar />
				<LoadingVeil />
			</div>
			<FloorRail />
		</div>
	);
}

/* ------------------------------------------------------------------ */
/* Public component                                                    */
/* ------------------------------------------------------------------ */

export interface SingleHouseViewProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Floor id to isolate on first render (e.g. "l01"); `null` shows the whole building. */
	initialFloorId?: string | null;
	/** Fired once the streaming loading veil settles and the model is ready. */
	onSettled?: () => void;
}

/** Single-building fragment viewer: an isolatable 3D house model stage beside a floor rail of levels with status and progress. */
const SingleHouseView = React.forwardRef<HTMLDivElement, SingleHouseViewProps>(
	({className, initialFloorId = "l01", onSettled, ...props}, ref) => (
		<div ref={ref} className={cn("wwc:h-full wwc:w-full", className)} {...props}>
			<FragmentViewerProvider initialFloorId={initialFloorId ?? null} onSettled={onSettled}>
				<StageContent />
			</FragmentViewerProvider>
		</div>
	),
);
SingleHouseView.displayName = "SingleHouseView";

export {SingleHouseView};
