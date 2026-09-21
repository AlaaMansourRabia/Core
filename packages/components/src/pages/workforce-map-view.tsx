import type {ReactNode} from "react";

import {cn} from "@wakecap/core-utils";
import {
	AlertTriangle,
	Box,
	Building2,
	Ghost,
	Grid2x2,
	Maximize2,
	Orbit,
	PanelLeftClose,
	PanelLeftOpen,
	PersonStanding,
	Search,
	Sparkles,
	Square,
	Users,
	X,
} from "lucide-react";
import {useEffect, useMemo, useRef, useState} from "react";

import {Avatar, AvatarFallback} from "../avatar";
import {Badge} from "../badge";
import {Button} from "../button";
import {useOptionalFragmentViewer} from "../fragment-viewer/context";
import {ImageZoom} from "../image-zoom";
import {Input} from "../input";
import {Spinner} from "../spinner";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../tabs";
import {TimeScrubber, type TimeScrubberActivity} from "../time-scrubber";
import {ToggleGroup, ToggleGroupItem} from "../toggle-group";
import {HoverTooltip} from "../tooltip";

// Marker colours by worker status.
const MARKER_ACTIVE = "#22c55e";
const MARKER_INACTIVE = "#f59e0b";

// Workforce Map View — the 3D/map stage plus a collapsible left menu of who's in the building. The
// menu is designed to fit without scrolling: a compact headcount strip, then Level / Trade / Crew as
// tabs so only one breakdown shows at a time. The stage engine is injected via `stage` (the template
// can't resolve its worker URL itself). Composed from existing Wakecore primitives — Tabs, Badge,
// Button. Figures are placeholder fixtures.

// The 35 IFC storeys of the `uptown` model, verbatim (the same names the viewer's Levels menu lists).
// Worker counts are placeholder fixtures derived deterministically from the floor index.
const LEVEL_NAMES = [
	"00 begane grond",
	"01 eerste verdieping",
	"02 tweede verdieping",
	"03 derde verdieping",
	"04 vierde verdieping",
	"05 vijfde verdieping",
	"06 zesde verdieping",
	"07 zevende verdieping",
	"08 achtste verdieping",
	"09 negende verdieping",
	"10 tiende verdieping",
	"11 elfde verdieping",
	"12 twaalfde verdieping",
	"13 dertiende verdieping",
	"14 veertiende verdieping",
	"15 vijftiende verdieping",
	"16 zestiende verdieping",
	"17 zeventiende verdieping",
	"18 achttiende verdieping",
	"19 negentiende verdieping",
	"20 twintigste verdieping",
	"21 eenentwintigste verdieping",
	"22 tweeentwintigste verdieping",
	"23 drieentwintigste verdieping",
	"24 vierentwintigste verdieping",
	"25 vijfentwintigste verdieping",
	"26 zesentwintigste verdieping",
	"27 zevenentwintigste verdieping",
	"28 achtentwintigste verdieping",
	"29 negenentwintigste verdieping",
	"30 dertigste verdieping",
	"31 eenendertigste verdieping",
	"32 tweeendertigste verdieping",
	"33 drieendertigste verdieping",
	"34 vierendertigste verdieping",
];

const TRADES: {name: string; count: number}[] = [
	{name: "Direct-Helper", count: 118},
	{name: "Direct-Scaffolder", count: 74},
	{name: "Electrician", count: 63},
	{name: "Steel Fixer", count: 52},
	{name: "Mason", count: 47},
	{name: "Indirect-Driver", count: 31},
	{name: "Welder", count: 27},
];

const CREWS: {name: string; count: number}[] = [
	{name: "TR-TAMIMI", count: 64},
	{name: "TR-RED CAMEL", count: 58},
	{name: "TR-UNITED", count: 49},
	{name: "DSCO", count: 41},
	{name: "TR-FALCON", count: 38},
];

// ─── Per-level worker roster (fixtures) ──────────────────────────────────────

const WORKER_NAMES = [
	"Rajesh Kumar",
	"Bikash Thapa",
	"Arun Nair",
	"Santosh Rana",
	"Deepak Sharma",
	"Imran Khan",
	"Suresh Patel",
	"Nabin Gurung",
	"Vijay Singh",
	"Manoj Yadav",
	"Prakash Rai",
	"Amit Verma",
	"Ram Bahadur",
	"Krishna Magar",
	"Ahmed Al-Rashid",
	"Jorge Mendoza",
	"Ravi Patel",
	"Fatima Noor",
	"Dmitri Ivanov",
	"Chen Wei",
	"Omar Farouk",
	"Layla Hassan",
	"Samuel Okafor",
	"Tej Pakhrin",
];

const WORKER_TRADES = [
	"Direct-Helper",
	"Direct-Scaffolder",
	"Electrician",
	"Steel Fixer",
	"Mason",
	"Indirect-Driver",
	"Welder",
];

interface LevelWorker {
	id: string;
	name: string;
	trade: string;
	status: "active" | "inactive";
}

function hashStr(s: string): number {
	let h = 0;
	for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
	return h;
}

/** A deterministic worker roster for a level — stable across renders, seeded from the level name. */
function levelWorkers(levelName: string, count: number): LevelWorker[] {
	const h = hashStr(levelName);
	return Array.from({length: count}, (_, i) => ({
		id: `${levelName}-${i}`,
		name: WORKER_NAMES[(h * 3 + i * 7) % WORKER_NAMES.length],
		trade: WORKER_TRADES[(h + i) % WORKER_TRADES.length],
		status: (h + i) % 8 === 0 ? "inactive" : "active",
	}));
}

function initials(name: string): string {
	return (
		name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((p) => p[0]?.toUpperCase() ?? "")
			.join("") || "?"
	);
}

// Sample blueprint served by the host app (Storybook's public/). Swap per-level or per-project when real
// plans are wired in; the schematic SVG below is the fallback if the image can't load.
const SAMPLE_FLOOR_PLAN = "/images/floor-plan.png";

/** A schematic fallback plan, drawn deterministically from the floor name (used if the image fails). */
function SchematicPlan({name}: {name: string}) {
	const seed = [...name].reduce((sum, c) => sum + c.charCodeAt(0), 0);
	const W = 240;
	const H = 150;
	const m = 10;
	const corridorTop = 64;
	const corridorBot = 90;
	const topRooms = 3 + (seed % 3);
	const botRooms = 3 + ((seed >> 2) % 3);
	const dividers = (count: number) => Array.from({length: count - 1}, (_, i) => m + ((W - 2 * m) * (i + 1)) / count);
	return (
		<svg
			viewBox={`0 0 ${W} ${H}`}
			className="wwc:h-auto wwc:w-full wwc:text-muted-foreground/70"
			fill="none"
			stroke="currentColor"
			aria-hidden="true"
		>
			<rect x={m} y={m} width={W - 2 * m} height={H - 2 * m} rx={3} className="wwc:fill-card" strokeWidth={2.5} />
			<line x1={m} y1={corridorTop} x2={W - m} y2={corridorTop} strokeWidth={1.5} />
			<line x1={m} y1={corridorBot} x2={W - m} y2={corridorBot} strokeWidth={1.5} />
			{dividers(topRooms).map((x) => (
				<line key={`t${x}`} x1={x} y1={m} x2={x} y2={corridorTop} strokeWidth={1.5} />
			))}
			{dividers(botRooms).map((x) => (
				<line key={`b${x}`} x1={x} y1={corridorBot} x2={x} y2={H - m} strokeWidth={1.5} />
			))}
		</svg>
	);
}

/** The 2D floor plan for a level — the sample blueprint via the shared ImageZoom (click to enlarge),
 *  falling back to a schematic if it 404s. */
function FloorPlan2D({name, className}: {name: string; className?: string}) {
	const [failed, setFailed] = useState(false);
	if (failed) {
		return (
			<div className={cn("wwc:overflow-hidden wwc:rounded-md wwc:border wwc:border-border wwc:bg-card", className)}>
				<SchematicPlan name={name} />
			</div>
		);
	}
	return (
		<ImageZoom
			src={SAMPLE_FLOOR_PLAN}
			alt={`Floor plan of ${name}`}
			title={
				<span className="wwc:flex wwc:items-center wwc:gap-2">
					<Building2 className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
					{name} — floor plan
				</span>
			}
			onError={() => setFailed(true)}
			className={cn("wwc:rounded-md wwc:border wwc:border-border wwc:bg-card", className)}
		/>
	);
}

/** Right-hand menu: the clicked level's worker count and the roster on it. */
function LevelDetailsPanel({name, count, onClose}: {name: string; count: number; onClose: () => void}) {
	const workers = useMemo(() => levelWorkers(name, count), [name, count]);
	const active = workers.filter((w) => w.status === "active").length;

	return (
		<div className="wwc:flex wwc:max-h-[60vh] wwc:min-h-0 wwc:w-full wwc:flex-col wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:shadow-lg">
			<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:justify-between wwc:gap-2 wwc:border-b wwc:border-border wwc:px-3 wwc:py-2">
				<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-2">
					<Building2 className="wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-muted-foreground" />
					<span className="wwc:truncate wwc:text-sm wwc:font-semibold">{name}</span>
				</div>
				<Button
					variant="ghost"
					icon
					aria-label="Close level details"
					className="wwc:h-6 wwc:w-6 wwc:shrink-0"
					onClick={onClose}
				>
					<X className="wwc:h-4 wwc:w-4" />
				</Button>
			</div>

			<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col">
				{/* 2D floor plan — a placeholder plan image for this level, shown first. */}
				<div className="wwc:shrink-0 wwc:border-b wwc:border-border wwc:px-4 wwc:py-3">
					<span className="wwc:text-[11px] wwc:font-semibold wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground/70">
						Floor plan
					</span>
					<FloorPlan2D name={name} className="wwc:mt-2" />
				</div>

				{/* Workers total count */}
				<div className="wwc:shrink-0 wwc:border-b wwc:border-border wwc:px-4 wwc:py-3">
					<div className="wwc:flex wwc:items-baseline wwc:gap-1.5">
						<span className="wwc:text-2xl wwc:font-bold wwc:tabular-nums">{count}</span>
						<span className="wwc:text-xs wwc:text-muted-foreground">workers on this level</span>
					</div>
					<div className="wwc:mt-1 wwc:flex wwc:gap-3 wwc:text-xs wwc:text-muted-foreground">
						<span>
							<span className="wwc:font-semibold wwc:text-green-600">{active}</span> active
						</span>
						<span>
							<span className="wwc:font-semibold wwc:text-amber-600">{count - active}</span> inactive
						</span>
					</div>
				</div>

				{/* Workers names */}
				<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto wwc:p-2">
					{workers.map((w) => (
						<div
							key={w.id}
							className="wwc:flex wwc:items-center wwc:gap-2 wwc:rounded wwc:px-2 wwc:py-1.5 wwc:transition-colors wwc:hover:bg-muted/50"
						>
							<Avatar className="wwc:h-7 wwc:w-7">
								<AvatarFallback className="wwc:text-[10px]">{initials(w.name)}</AvatarFallback>
							</Avatar>
							<div className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col">
								<span className="wwc:truncate wwc:text-sm wwc:font-medium">{w.name}</span>
								<span className="wwc:truncate wwc:text-xs wwc:text-muted-foreground">{w.trade}</span>
							</div>
							<span
								className={cn(
									"wwc:h-2 wwc:w-2 wwc:shrink-0 wwc:rounded-full",
									w.status === "active" ? "wwc:bg-green-500" : "wwc:bg-amber-500",
								)}
								aria-label={w.status}
							/>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

/** A compact single-line "name — count" row, optionally selectable (used by the Level tab). */
function CountRow({
	name,
	count,
	active,
	onClick,
}: {
	name: string;
	count: number;
	active?: boolean;
	onClick?: () => void;
}) {
	const body = (
		<div
			className={cn(
				"wwc:flex wwc:items-center wwc:justify-between wwc:gap-2 wwc:rounded wwc:px-2 wwc:py-1",
				onClick && "wwc:transition-colors wwc:hover:bg-muted/60",
				active && "wwc:bg-muted",
			)}
		>
			<span className={cn("wwc:truncate wwc:text-sm", active && "wwc:font-semibold")}>{name}</span>
			<Badge variant={active ? "secondary" : "neutralSoft"} className="wwc:h-5 wwc:tabular-nums">
				{count}
			</Badge>
		</div>
	);
	return onClick ? (
		<button type="button" data-level={name} onClick={onClick} className="wwc:block wwc:w-full wwc:text-left">
			{body}
		</button>
	) : (
		body
	);
}

/** The collapsible left menu: a compact headcount strip and Level / Trade / Crew tabs. */
function WorkersPanel({
	onClose,
	levels,
	activeLevel,
	onSelectLevel,
}: {
	onClose: () => void;
	levels: {name: string; count: number}[];
	activeLevel: string | null;
	onSelectLevel: (name: string) => void;
}) {
	const [tab, setTab] = useState("level");
	const [query, setQuery] = useState("");
	const filteredLevels = levels.filter((l) => l.name.toLowerCase().includes(query.trim().toLowerCase()));

	// Keep the active level in view as ↑/↓ pages through floors.
	const levelListRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (!activeLevel) return;
		const row = levelListRef.current?.querySelector(`[data-level="${activeLevel}"]`);
		row?.scrollIntoView({block: "nearest"});
	}, [activeLevel]);

	// Headcount derived from the level totals, so the strip stays in step with the model's population.
	const total = levels.reduce((sum, l) => sum + l.count, 0);
	const active = Math.round(total * 0.93);
	const day = Math.round(total * 0.97);
	const headStats: {label: string; value: number; tone?: string}[] = [
		{label: "Active", value: active, tone: "wwc:text-green-600"},
		{label: "Inactive", value: total - active, tone: "wwc:text-amber-600"},
		{label: "Day", value: day},
		{label: "Night", value: total - day},
	];

	return (
		<div className="wwc:flex wwc:max-h-[60vh] wwc:min-h-0 wwc:w-full wwc:flex-col wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:shadow-lg">
			{/* Header */}
			<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:justify-between wwc:gap-2 wwc:border-b wwc:border-border wwc:px-3 wwc:py-2">
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<Users className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
					<span className="wwc:text-sm wwc:font-semibold">Workers in Building</span>
				</div>
				<Button variant="ghost" size="sm" icon aria-label="Collapse panel" onClick={onClose}>
					<PanelLeftClose />
				</Button>
			</div>

			{/* Compact headcount strip */}
			<div className="wwc:shrink-0 wwc:border-b wwc:border-border wwc:px-3 wwc:py-2">
				<div className="wwc:flex wwc:items-baseline wwc:gap-1.5">
					<span className="wwc:text-xl wwc:font-bold wwc:tabular-nums">{total.toLocaleString()}</span>
					<span className="wwc:text-xs wwc:text-muted-foreground">on site</span>
				</div>
				<div className="wwc:mt-1 wwc:flex wwc:flex-wrap wwc:gap-x-3 wwc:gap-y-0.5 wwc:text-xs wwc:text-muted-foreground">
					{headStats.map((s) => (
						<span key={s.label}>
							<span className={cn("wwc:font-semibold wwc:tabular-nums", s.tone ?? "wwc:text-foreground")}>
								{s.value.toLocaleString()}
							</span>{" "}
							{s.label}
						</span>
					))}
				</div>
			</div>

			{/* Level / Trade / Crew tabs — one breakdown at a time, no scroll */}
			<Tabs
				value={tab}
				onValueChange={setTab}
				variant="underline"
				size="sm"
				className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col"
			>
				<TabsList className="wwc:shrink-0 wwc:px-3">
					<TabsTrigger value="level" className="wwc:flex-1 wwc:py-1.5 wwc:text-xs">
						Level
					</TabsTrigger>
					<TabsTrigger value="trade" className="wwc:flex-1 wwc:py-1.5 wwc:text-xs">
						Trade
					</TabsTrigger>
					<TabsTrigger value="crew" className="wwc:flex-1 wwc:py-1.5 wwc:text-xs">
						Crew
					</TabsTrigger>
				</TabsList>

				{/* Only the Level list scrolls — the model has many storeys. The header, headcount, and tab
				    bar stay fixed, and the shorter Trade / Crew lists don't scroll. */}
				<TabsContent value="level" className="wwc:mt-0 wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:p-0">
					{activeLevel ? (
						<div className="wwc:shrink-0 wwc:border-b wwc:border-border wwc:bg-primary/5 wwc:px-3 wwc:py-1.5 wwc:text-xs wwc:text-muted-foreground">
							Isolating <span className="wwc:font-medium wwc:text-foreground">{activeLevel}</span> — click it again to
							exit.
						</div>
					) : null}
					<div className="wwc:shrink-0 wwc:p-2 wwc:pb-1">
						<div className="wwc:relative">
							<Search className="wwc:pointer-events-none wwc:absolute wwc:left-2.5 wwc:top-1/2 wwc:h-3.5 wwc:w-3.5 wwc:-translate-y-1/2 wwc:text-muted-foreground" />
							<Input
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Search levels…"
								className="wwc:h-8 wwc:pl-8"
							/>
						</div>
					</div>
					<div ref={levelListRef} className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto wwc:px-2 wwc:pb-2">
						{filteredLevels.length === 0 ? (
							<p className="wwc:px-2 wwc:py-4 wwc:text-center wwc:text-sm wwc:text-muted-foreground">
								No levels match.
							</p>
						) : (
							filteredLevels.map((level) => (
								<CountRow
									key={level.name}
									name={level.name}
									count={level.count}
									active={level.name === activeLevel}
									onClick={() => onSelectLevel(level.name)}
								/>
							))
						)}
					</div>
				</TabsContent>

				<TabsContent value="trade" className="wwc:mt-0 wwc:min-h-0 wwc:flex-1 wwc:p-2">
					{TRADES.map((trade) => (
						<CountRow key={trade.name} name={trade.name} count={trade.count} />
					))}
				</TabsContent>

				<TabsContent value="crew" className="wwc:mt-0 wwc:min-h-0 wwc:flex-1 wwc:p-2">
					{CREWS.map((crew) => (
						<CountRow key={crew.name} name={crew.name} count={crew.count} />
					))}
				</TabsContent>
			</Tabs>
		</div>
	);
}

// Per-floor headcount — deliberately large so the model demonstrates thousands of workers at once.
const levelCount = (i: number) => 55 + ((i * 37 + 13) % 95);

interface WorkerMarker {
	id: string;
	storeyId: string;
	position: [number, number, number];
	status: "active" | "inactive";
	/** 0..1 — the worker is present once the time-of-day factor reaches this. Evenly spread per floor. */
	presence: number;
}

// Fraction of the workforce on site at a given time of day: quiet overnight, ramp from ~05:30, peak
// midday with a lunch dip, taper to evening.
function dayFactor(t: Date): number {
	const h = t.getHours() + t.getMinutes() / 60;
	if (h < 5.5 || h > 19.5) return 0.04;
	const ramp = Math.min(1, (h - 5.5) / 1.5);
	const taper = Math.min(1, (19.5 - h) / 2.5);
	const lunch = h > 12 && h < 13 ? 0.6 : 1;
	return Math.max(0.04, Math.min(1, ramp * taper * lunch));
}

/** Small deterministic PRNG so worker scatter is stable across renders. */
function rng(seed: number): () => number {
	let s = seed >>> 0 || 1;
	return () => {
		s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
		return s / 4294967296;
	};
}

type WorldBox = {min: [number, number, number]; max: [number, number, number]};

/**
 * Place each storey's workers *inside its own footprint* — the real per-floor world box, so upper-floor
 * workers sit in the tower rather than out over the podium void, at floor height rather than floating.
 * World-space (the marker mesh lives in the world scene), seeded so positions don't jump.
 */
function buildWorkerMarkers(
	storeys: {id: string; elevation: number}[],
	bounds: WorldBox,
	footprints: Record<string, WorldBox>,
): WorkerMarker[] {
	const out: WorkerMarker[] = [];
	storeys.forEach((storey, i) => {
		const count = levelCount(i);
		// The floor's own box when we have it; fall back to the whole model footprint.
		const box = footprints[storey.id] ?? bounds;
		const [minX, minY, minZ] = box.min;
		const [maxX, , maxZ] = box.max;
		// Inset hard so workers land in the interior, clear of the exterior walls.
		const insetX = (maxX - minX) * 0.2;
		const insetZ = (maxZ - minZ) * 0.2;
		const x0 = minX + insetX;
		const x1 = maxX - insetX;
		const z0 = minZ + insetZ;
		const z1 = maxZ - insetZ;
		// A metre above the slab, so the sphere reads as a person standing on the floor.
		const y = minY + 1;
		const r = rng(hashStr(storey.id) ^ 0x9e3779b9);
		for (let k = 0; k < count; k++) {
			const x = x0 + r() * (x1 - x0);
			const z = z0 + r() * (z1 - z0);
			out.push({
				id: `${storey.id}#${k}`,
				storeyId: storey.id,
				position: [x, y, z],
				status: Math.floor(r() * 100) % 12 === 0 ? "inactive" : "active",
				// Evenly spread so "presence <= factor" yields ~round(count × factor) workers on the floor.
				presence: (k + 0.5) / count,
			});
		}
	});
	return out;
}

/** Map View surface — the collapsible workers menu beside the injected 3D/map stage. */
export function WorkforceMapView({stage}: {stage?: ReactNode}) {
	const [open, setOpen] = useState(true);
	// View mode — only 3D is live; 2D is a placeholder for a future top-down plan.
	const [viewMode, setViewMode] = useState("3d");
	const viewer = useOptionalFragmentViewer();
	// Fallback active level when the stage isn't a FragmentViewer (design/preview only).
	const [localActive, setLocalActive] = useState<string | null>(null);

	// Ask the viewer for the model's real storeys once it's ready.
	const storeyCount = viewer?.state.storeys.length ?? 0;
	const viewerReady = viewer?.state.ready ?? false;
	useEffect(() => {
		if (viewer && viewerReady && storeyCount === 0) void viewer.api.loadStoreys();
	}, [viewer, viewerReady, storeyCount]);

	// Level list: the model's storeys when available, else the placeholder floors. Counts are fixtures.
	const storeyKey = viewer?.state.storeys.map((s) => s.name).join("|") ?? "";
	const levels = useMemo(() => {
		const names = storeyKey ? storeyKey.split("|") : LEVEL_NAMES;
		return names.map((name, i) => ({name, count: levelCount(i)}));
	}, [storeyKey]);

	// ── Time-of-day scrubbing: pick a day and rewind it to see the workforce for that moment. ──
	const [selectedDate, setSelectedDate] = useState(() => {
		const s = new Date();
		s.setHours(0, 0, 0, 0);
		return s;
	});
	const day = useMemo(
		() => ({start: selectedDate, end: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)}),
		[selectedDate],
	);
	const [currentTime, setCurrentTime] = useState(() => new Date());
	// The cursor can't scrub past "now" on the live (today's) timeline; a past day is fully historical.
	const maxTime = useMemo(() => {
		const now = new Date();
		const sameDay =
			selectedDate.getFullYear() === now.getFullYear() &&
			selectedDate.getMonth() === now.getMonth() &&
			selectedDate.getDate() === now.getDate();
		return sameDay ? now : day.end;
	}, [selectedDate, day]);
	// Switch day, keeping the same time-of-day on the cursor.
	const changeDate = (d: Date) => {
		const start = new Date(d);
		start.setHours(0, 0, 0, 0);
		setSelectedDate(start);
		const mins = currentTime.getHours() * 60 + currentTime.getMinutes();
		setCurrentTime(new Date(start.getTime() + mins * 60 * 1000));
	};
	const [playing, setPlaying] = useState(false);
	// Back to now — reset the date to today and the cursor to the current time.
	const goToNow = () => {
		const now = new Date();
		const start = new Date(now);
		start.setHours(0, 0, 0, 0);
		setSelectedDate(start);
		setCurrentTime(now);
		setPlaying(false);
	};
	const timeFactor = dayFactor(currentTime);

	// Level counts scaled to the current time — drives the panel, the details roster, and the markers.
	const scaledLevels = useMemo(
		() => levels.map((l) => ({name: l.name, count: Math.round(l.count * timeFactor)})),
		[levels, timeFactor],
	);
	const totalNow = scaledLevels.reduce((sum, l) => sum + l.count, 0);

	// The activity band under the scrubber — active (green) / inactive (amber) stacked per 20 min. The rest
	// of the day (after "now") reads zero so the bars stop at the live edge.
	const baseTotal = useMemo(() => levels.reduce((sum, l) => sum + l.count, 0), [levels]);
	const activity = useMemo<TimeScrubberActivity[]>(() => {
		const out: TimeScrubberActivity[] = [];
		const cutoff = maxTime.getTime();
		for (let m = 0; m <= 24 * 60; m += 20) {
			const t = new Date(day.start.getTime() + m * 60 * 1000);
			const hhmm = `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
			if (t.getTime() > cutoff) {
				out.push({time: t, value: 0, title: `${hhmm} — no data yet`});
				continue;
			}
			const total = Math.round(baseTotal * dayFactor(t));
			const active = Math.round(total * 0.93);
			const inactive = total - active;
			out.push({
				time: t,
				value: total,
				title: `${hhmm} — ${active.toLocaleString()} active · ${inactive.toLocaleString()} inactive`,
				segments: [
					{value: active, className: "wwc:bg-green-400/70"},
					{value: inactive, className: "wwc:bg-amber-400/70"},
				],
			});
		}
		return out;
	}, [day, baseTotal, maxTime]);

	// Worker markers — built once the model's storeys (with elevations) and footprint are known, then
	// drawn as one InstancedMesh (thousands stay cheap). Visibility follows the isolated floor and the
	// Workers toggle.
	const [showWorkers, setShowWorkers] = useState(true);
	// Shading (postproduction) toggle state — the viewer has no field for it, so we track it here.
	const [shading, setShading] = useState(false);
	const [workers, setWorkers] = useState<WorkerMarker[]>([]);
	// Marker sphere radius in world metres — person-sized, small relative to the rooms.
	const [markerRadius, setMarkerRadius] = useState(0.3);
	useEffect(() => {
		if (!viewer || storeyCount === 0) {
			setWorkers([]);
			return;
		}
		// The bounding boxer can lag a beat behind storey load, so poll until the footprint resolves.
		let cancelled = false;
		let tries = 0;
		const build = async () => {
			if (cancelled || !viewer) return;
			const b = viewer.api.bounds();
			if (!b) {
				if (tries++ < 40) setTimeout(build, 200);
				return;
			}
			const footprints = await viewer.api.storeyFootprints();
			if (cancelled) return;
			setWorkers(buildWorkerMarkers(viewer.state.storeys, b, footprints));
			setMarkerRadius(Math.max(0.2, Math.min(0.5, (b.max[0] - b.min[0]) / 300)));
		};
		void build();
		return () => {
			cancelled = true;
		};
		// Keyed on storeyKey: rebuilt once when the model's storeys load.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [storeyKey]);

	const activeStorey = viewer?.state.activeStorey ?? null;
	useEffect(() => {
		if (!viewer) return;
		if (!showWorkers) {
			// Empty (count 0) rather than clearMarkers() so the mesh persists — no rebuild flicker on re-toggle.
			viewer.api.setMarkers([], {occluded: false, radius: markerRadius});
			return;
		}
		// Only the workers present at the scrubbed time; when a floor is isolated, only its workers.
		const visible = workers.filter(
			(w) => w.presence <= timeFactor && (activeStorey ? w.storeyId === activeStorey : true),
		);
		viewer.api.setMarkers(
			visible.map((w) => ({
				id: w.id,
				position: w.position,
				color: w.status === "active" ? MARKER_ACTIVE : MARKER_INACTIVE,
			})),
			{occluded: false, radius: markerRadius},
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [workers, activeStorey, showWorkers, markerRadius, timeFactor]);

	const activeLevel = viewer ? viewer.state.activeStorey : localActive;
	const selectLevel = (name: string) => {
		if (viewer) {
			// Toggle: clicking the open level exits ghost mode; picking another isolates + fits to it.
			if (viewer.state.activeStorey === name) void viewer.api.closeStorey();
			else void viewer.api.openStorey(name);
		} else {
			setLocalActive((prev) => (prev === name ? null : name));
		}
	};
	const clearLevel = () => {
		if (viewer) {
			if (viewer.state.activeStorey) void viewer.api.closeStorey();
		} else {
			setLocalActive(null);
		}
	};

	// ↑/↓ move between levels (isolating each). Latest values via refs so the listener attaches once.
	const navRef = useRef({levels, activeLevel, viewer, setLocalActive});
	navRef.current = {levels, activeLevel, viewer, setLocalActive};
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
			const target = e.target as HTMLElement | null;
			if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
			const {levels: ls, activeLevel: cur, viewer: v} = navRef.current;
			const names = ls.map((l) => l.name);
			if (names.length === 0) return;
			const idx = cur ? names.indexOf(cur) : -1;
			const next =
				e.key === "ArrowDown"
					? idx < 0
						? 0
						: Math.min(names.length - 1, idx + 1)
					: idx < 0
						? names.length - 1
						: Math.max(0, idx - 1);
			if (next === idx) return;
			e.preventDefault();
			if (v) void v.api.openStorey(names[next]);
			else navRef.current.setLocalActive(names[next]);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	// The clicked level, resolved to its time-scaled count, drives the right details menu.
	const activeLevelData = activeLevel ? scaledLevels.find((l) => l.name === activeLevel) : undefined;

	// Loading state — up until the model is rendered, its storeys are known, and the workers are placed.
	const modelStatus = viewer?.state.status;
	const modelError = modelStatus === "error";
	const modelLoading =
		!!viewer && !modelError && (modelStatus !== "ready" || storeyCount === 0 || workers.length === 0);

	return (
		// The stage fills the whole area; the workers menu and the level details float on top of it.
		<div className="wwc:relative wwc:min-h-0 wwc:min-w-0 wwc:flex-1 wwc:overflow-hidden">
			{stage}

			{/* Workers menu — a floating card on the left, or a "Workers" pill when collapsed. */}
			{open ? (
				<div className="wwc:absolute wwc:left-3 wwc:top-3 wwc:z-20 wwc:w-72">
					<WorkersPanel
						onClose={() => setOpen(false)}
						levels={scaledLevels}
						activeLevel={activeLevel}
						onSelectLevel={selectLevel}
					/>
				</div>
			) : (
				<div className="wwc:absolute wwc:left-3 wwc:top-3 wwc:z-20">
					<Button variant="outline" size="sm" className="wwc:gap-1.5 wwc:shadow-sm" onClick={() => setOpen(true)}>
						<PanelLeftOpen className="wwc:h-4 wwc:w-4" />
						Workers
					</Button>
				</div>
			)}

			{/* Top controls — 3D/2D switch, view controls, and element toggles, all icons. */}
			<div className="wwc:absolute wwc:left-1/2 wwc:top-3 wwc:z-20 wwc:flex wwc:-translate-x-1/2 wwc:items-center wwc:gap-2">
				<ToggleGroup
					type="single"
					value={viewMode}
					onValueChange={(v) => v && setViewMode(v)}
					variant="outline"
					size="sm"
					className="wwc:rounded-md wwc:border wwc:border-border wwc:bg-card wwc:p-0.5 wwc:shadow-md"
				>
					<ToggleGroupItem value="3d" aria-label="3D view" className="wwc:gap-1.5">
						<Box className="wwc:h-4 wwc:w-4" />
						3D
					</ToggleGroupItem>
					<ToggleGroupItem value="2d" aria-label="2D view — coming soon" disabled className="wwc:gap-1.5">
						<Square className="wwc:h-4 wwc:w-4" />
						2D
						<Badge variant="secondary" className="wwc:h-4 wwc:px-1 wwc:text-[9px]">
							Soon
						</Badge>
					</ToggleGroupItem>
				</ToggleGroup>

				<div className="wwc:flex wwc:items-center wwc:gap-0.5 wwc:rounded-md wwc:border wwc:border-border wwc:bg-card wwc:p-0.5 wwc:shadow-md">
					{viewer && (
						<>
							{(
								[
									{
										key: "orbit",
										label: "Orbit",
										Icon: Orbit,
										active: viewer.state.navigation === "Orbit",
										onClick: () => viewer.api.setNavigation("Orbit"),
									},
									{key: "fit", label: "Fit", Icon: Maximize2, active: false, onClick: () => void viewer.api.fit()},
									{
										key: "ortho",
										label: "Ortho",
										Icon: Grid2x2,
										active: viewer.state.projection === "Orthographic",
										onClick: () => void viewer.api.toggleProjection(),
									},
									{
										key: "shading",
										label: "Shading",
										Icon: Sparkles,
										active: shading,
										onClick: () => {
											const next = !shading;
											setShading(next);
											viewer.api.setPostproduction(next);
										},
									},
									{
										key: "ghost",
										label: "Ghost",
										Icon: Ghost,
										active: viewer.state.ghost,
										onClick: () => void viewer.api.setGhost(!viewer.state.ghost),
									},
								] as const
							).map(({key, label, Icon, active, onClick}) => (
								<HoverTooltip key={key} content={label} side="bottom">
									<Button
										variant={active ? "secondary" : "ghost"}
										size="sm"
										icon
										aria-label={label}
										className="wwc:h-8 wwc:w-8 wwc:text-muted-foreground"
										disabled={!viewerReady}
										onClick={onClick}
									>
										<Icon className="wwc:h-4 wwc:w-4" />
									</Button>
								</HoverTooltip>
							))}
							<span aria-hidden className="wwc:mx-0.5 wwc:h-5 wwc:w-px wwc:bg-border" />
						</>
					)}
					{/* Element toggles — show/hide the workers layer and (soon) the 3D walkthrough. */}
					<HoverTooltip content={showWorkers ? "Hide workers" : "Show workers"} side="bottom">
						<Button
							variant={showWorkers ? "secondary" : "ghost"}
							size="sm"
							icon
							aria-label="Toggle workers on model"
							className="wwc:h-8 wwc:w-8 wwc:text-muted-foreground"
							onClick={() => setShowWorkers(!showWorkers)}
						>
							<Users className="wwc:h-4 wwc:w-4" />
						</Button>
					</HoverTooltip>
					<HoverTooltip content="3D walk — coming soon" side="bottom">
						<Button
							variant="ghost"
							size="sm"
							icon
							aria-label="3D walk — coming soon"
							disabled
							className="wwc:h-8 wwc:w-8 wwc:text-muted-foreground"
						>
							<PersonStanding className="wwc:h-4 wwc:w-4" />
						</Button>
					</HoverTooltip>
				</div>
			</div>

			{/* Time scrubber — rewind the day; the count and markers follow the time. Full width: the floating
			    panels are capped in height at the top, so they never reach the timeline at the bottom. */}
			<div className="wwc:absolute wwc:inset-x-3 wwc:bottom-3 wwc:z-10">
				<TimeScrubber
					start={day.start}
					end={day.end}
					variant="barGraph"
					data={activity}
					value={currentTime}
					onValueChange={setCurrentTime}
					max={maxTime}
					date={selectedDate}
					onDateChange={changeDate}
					playing={playing}
					onPlayingChange={setPlaying}
					onNow={goToNow}
					valueLabel={`${totalNow.toLocaleString()} on site`}
					className="wwc:bg-card"
				/>
			</div>

			{/* Level details — a floating card on the right, opened by selecting a level or a space. */}
			{activeLevelData && (
				<div className="wwc:absolute wwc:right-3 wwc:top-3 wwc:z-20 wwc:w-80">
					<LevelDetailsPanel name={activeLevelData.name} count={activeLevelData.count} onClose={clearLevel} />
				</div>
			)}

			{/* Loading / error overlay — covers the stage until the model + workers are ready. */}
			{(modelLoading || modelError) && (
				<div className="wwc:absolute wwc:inset-0 wwc:z-30 wwc:flex wwc:flex-col wwc:items-center wwc:justify-center wwc:gap-3 wwc:bg-background/80 wwc:backdrop-blur-sm">
					{modelError ? (
						<>
							<AlertTriangle className="wwc:h-8 wwc:w-8 wwc:text-destructive" />
							<span className="wwc:text-sm wwc:text-muted-foreground">Couldn't load the model.</span>
						</>
					) : (
						<>
							<Spinner className="wwc:h-8 wwc:w-8 wwc:text-primary" />
							<span className="wwc:text-sm wwc:text-muted-foreground">Loading model…</span>
						</>
					)}
				</div>
			)}
		</div>
	);
}
