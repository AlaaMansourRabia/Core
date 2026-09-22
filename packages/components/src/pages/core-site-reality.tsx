import type {ReactNode} from "react";

import {
	Calendar,
	CloudSun,
	Clock,
	Eye,
	EyeOff,
	LayoutGrid,
	Map as MapIcon,
	Maximize2,
	MoonStar,
	RefreshCw,
	Search,
	Settings2,
	Signal,
	Sun,
	TrendingUp,
	Truck,
	UserRound,
	Users,
} from "lucide-react";
import {useEffect, useRef, useState} from "react";

import {Badge} from "../badge";
import {Button} from "../button";
import {Input} from "../input";
import {KPIBar, type KPIBarItem} from "../kpi-bar";
import {KPISummary, type KpiMetric} from "../kpi-summary";
import {CoreAppSidebar, type SidebarNavGroup} from "../navigation/core-app-sidebar";
import {CoreAppTopBar} from "../navigation/core-app-top-bar";
import {PropertyList, PropertyRow} from "../property-list";
import {PushPanel, PushPanelContainer, PushPanelMain, PushPanelProvider} from "../push-panel";
import {ScrollArea} from "../scroll-area";
import {SectionPanel, SectionPanelRow} from "../section-panel";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../select";

// Site Reality — the live-site command surface. A full app shell (CoreAppSidebar +
// CoreAppTopBar) over a four-band layout: a KPIBar of headline figures, then three
// columns — the Insights Map panel (levels + layer visibility), the map stage, and a
// PushPanel context column (weather, manpower, equipment). The map stage is filled through the
// `stage` prop - a FragmentViewer, Map, or any engine - and stays empty when nothing is passed,
// so the template itself carries no rendering dependency.
//
// Everything visible is an existing @corensystem/core-ui component — KPIBar, SectionPanel,
// SectionPanelRow, KPISummary, PropertyList, Select, Input, Button, Badge, ScrollArea,
// PushPanel. This file contributes layout and fixture data only; it defines no new UI
// primitive. Every figure is a placeholder.

const SITE_REALITY_GROUPS: SidebarNavGroup[] = [{items: [{id: "site-reality", label: "Site Reality", icon: MapIcon}]}];

// ─── Headline figures (KPIBar) ───────────────────────────────────────────────

// Two groups so KPIBar draws its divider before the project-level summary figure.
const HEADLINE_GROUPS: KPIBarItem[][] = [
	[
		{value: "16.3K", label: "Connected", icon: Users},
		{value: "5,249", label: "Online", icon: Signal},
		{value: "4,052", label: "Active", icon: UserRound},
		{value: "1,197", label: "Inactive", icon: Clock},
		{value: "15K", label: "Today's Manhours", icon: Clock, hideLabelBelow: "md"},
		{value: "135K", label: "Week's Manhours", icon: Calendar, hideLabelBelow: "md"},
	],
	[{value: "15K", label: "Project Manhours", icon: TrendingUp}],
];

// ─── Insights Map panel (left) ───────────────────────────────────────────────

const LEVELS = ["RNGLF"];

const LAYERS = [
	{id: "workforce", label: "Workforce", count: "5,249"},
	{id: "zones", label: "Zones", count: "18"},
	{id: "cameras", label: "Cameras", count: "32"},
	{id: "work-permits", label: "Work Permits", count: "7"},
	{id: "blueprint", label: "Blueprint"},
];

/** Left column: the active level and the map layers, each with a visibility toggle. */
function InsightsPanel() {
	const [level, setLevel] = useState(LEVELS[0]);
	const [query, setQuery] = useState("");
	const [hidden, setHidden] = useState<string[]>([]);

	const toggle = (id: string) =>
		setHidden((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
	const matches = LEVELS.filter((name) => name.toLowerCase().includes(query.trim().toLowerCase()));

	return (
		<div className="wwc:flex wwc:h-full wwc:min-h-0 wwc:w-72 wwc:shrink-0 wwc:flex-col wwc:gap-3 wwc:overflow-auto wwc:border-r wwc:border-border wwc:p-3">
			<SectionPanel icon={TrendingUp} title="Levels" count={<Badge variant="neutralSoft">5,249 total</Badge>}>
				<Select value={level} onValueChange={setLevel}>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{LEVELS.map((name) => (
							<SelectItem key={name} value={name}>
								{name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<div className="wwc:mt-2 wwc:flex wwc:items-center wwc:gap-2">
					<Badge variant="successSoft">4,052 active</Badge>
					<Badge variant="neutralSoft">1,197 inactive</Badge>
				</div>

				<div className="wwc:relative wwc:mt-3">
					<Search className="wwc:pointer-events-none wwc:absolute wwc:left-2.5 wwc:top-1/2 wwc:h-3.5 wwc:w-3.5 wwc:-translate-y-1/2 wwc:text-muted-foreground" />
					<Input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search levels..."
						className="wwc:pl-8"
					/>
				</div>

				<div className="wwc:mt-1">
					{matches.map((name) => (
						<SectionPanelRow
							key={name}
							title={name}
							trailing={name === level ? <Badge variant="secondary">Active</Badge> : undefined}
							onClick={() => setLevel(name)}
						/>
					))}
				</div>
			</SectionPanel>

			<SectionPanel icon={LayoutGrid} title="Layers" count={<Badge variant="neutralSoft">{LAYERS.length}</Badge>}>
				{LAYERS.map((layer) => {
					const off = hidden.includes(layer.id);
					return (
						<SectionPanelRow
							key={layer.id}
							title={layer.label}
							trailing={
								<>
									{layer.count && <Badge variant="neutralSoft">{layer.count}</Badge>}
									<Button
										variant="ghost"
										size="sm"
										icon
										aria-label={`${off ? "Show" : "Hide"} ${layer.label}`}
										aria-pressed={!off}
										onClick={() => toggle(layer.id)}
									>
										{off ? <EyeOff /> : <Eye />}
									</Button>
								</>
							}
						/>
					);
				})}
			</SectionPanel>
		</div>
	);
}

// ─── Site context panel (right) ──────────────────────────────────────────────

const WEATHER: {label: string; value: string}[] = [
	{label: "Wind", value: "0 km/h"},
	{label: "Humidity", value: "0% relative"},
	{label: "UV index", value: "0 — low risk"},
	{label: "Visibility", value: "0 km"},
];

const SHIFT_METRICS: KpiMetric[] = [
	{title: "Day Shift", value: "16,277", subtitle: "Manpower", icon: Sun},
	{title: "Night Shift", value: "0", subtitle: "Manpower", icon: MoonStar},
];

const EQUIPMENT_METRICS: KpiMetric[] = [
	{title: "Total", value: "2,086"},
	{title: "Tracked", value: "977"},
	{title: "Online", value: "409", status: "success"},
	{title: "Offline", value: "180"},
	{title: "Idle", value: "388", status: "warning"},
	{title: "No Signal", value: "974", status: "warning"},
	{title: "Not Tracked", value: "135"},
	{title: "Newly Added", value: "35", status: "success"},
	{title: "AVL Equipped", value: "1,317"},
	{title: "Expired", value: "0", status: "danger"},
	{title: "Expiring Soon", value: "0", status: "danger"},
	{title: "Expired Inspections", value: "4", status: "danger"},
	{title: "Expiring Inspections", value: "0", status: "danger"},
	{title: "Insurance Expired", value: "1,194", status: "danger"},
	{title: "Insurance Due", value: "0", status: "danger"},
];

/** Right column: ambient site context beside the map — weather, manpower, equipment. */
function ContextPanel({header}: {header?: ReactNode}) {
	return (
		<ScrollArea className="wwc:h-full wwc:min-h-0">
			<div className="wwc:flex wwc:flex-col wwc:gap-3 wwc:p-3">
				{header}
				<SectionPanel icon={CloudSun} title="Weather Station" count={<Badge variant="neutralSoft">10:10 AM</Badge>}>
					<div className="wwc:flex wwc:items-baseline wwc:gap-2">
						<span className="wwc:text-3xl wwc:font-semibold wwc:tracking-tight">0°C</span>
						<span className="wwc:text-sm wwc:text-muted-foreground">No data · feels like 0°C</span>
					</div>
					<PropertyList className="wwc:mt-3" labelWidth="7rem">
						<PropertyRow label="Site">1925073288</PropertyRow>
						{WEATHER.map((reading) => (
							<PropertyRow key={reading.label} label={reading.label}>
								{reading.value}
							</PropertyRow>
						))}
					</PropertyList>
				</SectionPanel>

				<SectionPanel icon={Clock} title="Manpower by Shift">
					<KPISummary metrics={SHIFT_METRICS} columns={2} />
				</SectionPanel>

				<SectionPanel
					icon={Truck}
					title="Equipment"
					count={<Badge variant="neutralSoft">2,086</Badge>}
					action={
						<Button variant="ghost" size="sm" icon aria-label="Equipment settings">
							<Settings2 />
						</Button>
					}
				>
					<KPISummary metrics={EQUIPMENT_METRICS} columns={2} />
				</SectionPanel>
			</div>
		</ScrollArea>
	);
}

// ─── Map stage (center) ──────────────────────────────────────────────────────

const MAP_FOOTER_GROUPS: KPIBarItem[][] = [
	[
		{value: "5,249/5,249", label: "Workers", icon: Users},
		{value: "18/18", label: "Crews", icon: LayoutGrid},
		{value: "32/32", label: "Companies", icon: Truck},
	],
];

/**
 * The map stage — the slot an engine mounts into via the `stage` prop (FragmentViewer, Map,
 * Cesium, a That Open world). Empty when nothing is passed. The chrome around it (panel
 * toggles, refresh cadence, live counts) is what the template contributes.
 */
function MapStage({
	insightsOpen,
	contextOpen,
	onToggleInsights,
	onToggleContext,
	stage,
}: {
	insightsOpen: boolean;
	contextOpen: boolean;
	onToggleInsights: () => void;
	onToggleContext: () => void;
	stage?: ReactNode;
}) {
	return (
		<div className="wwc:relative wwc:flex wwc:min-h-0 wwc:min-w-0 wwc:flex-1 wwc:flex-col wwc:bg-muted/30">
			<div className="wwc:pointer-events-none wwc:absolute wwc:inset-x-0 wwc:top-0 wwc:z-10 wwc:flex wwc:items-start wwc:justify-between wwc:p-2">
				<Button
					variant="outline"
					size="sm"
					icon
					aria-label={insightsOpen ? "Hide insights panel" : "Show insights panel"}
					aria-pressed={insightsOpen}
					className="wwc:pointer-events-auto"
					onClick={onToggleInsights}
				>
					<LayoutGrid />
				</Button>
				<div className="wwc:pointer-events-auto wwc:flex wwc:gap-1">
					<Button variant="outline" size="sm" icon aria-label="Fullscreen">
						<Maximize2 />
					</Button>
					<Button
						variant="outline"
						size="sm"
						icon
						aria-label={contextOpen ? "Hide context panel" : "Show context panel"}
						aria-pressed={contextOpen}
						onClick={onToggleContext}
					>
						<CloudSun />
					</Button>
				</div>
			</div>

			{/* Map canvas — blank until an engine is passed in via `stage`. Positioned so a stage can
			    fill it with `absolute inset-0`: percentage heights collapse through this flex chain. */}
			<div className="wwc:relative wwc:min-h-0 wwc:flex-1">{stage}</div>

			<KPIBar
				groups={MAP_FOOTER_GROUPS}
				className="wwc:h-11 wwc:justify-end wwc:border-b-0 wwc:border-t wwc:bg-background"
			/>
		</div>
	);
}

// ─── Template ────────────────────────────────────────────────────────────────

export interface SiteRealityProps {
	/**
	 * What fills the map stage — a FragmentViewer, Map, or any engine. Left empty when omitted, so
	 * the template carries no rendering dependency of its own.
	 */
	stage?: ReactNode;
	/** Rendered at the top of the context column, above Weather Station (e.g. the picked element). */
	contextHeader?: ReactNode;
}

// The flanking panels are fixed-width, so on a narrow stage they can starve the map canvas of every
// pixel — the FragmentViewer collapses to zero width and the model (and any worker overlay on it)
// simply isn't there to see. Rather than trust the viewport width — wrong the moment this template is
// embedded (the Hub iframes it beside its own sidebar) — measure the row itself and drop panels until
// the stage keeps a usable minimum. Context is shed last: it carries the picked-element props.
const STAGE_MIN_WIDTH = 380;
const INSIGHTS_PANEL_WIDTH = 288; // w-72
const CONTEXT_PANEL_WIDTH = 340; // PushPanel width

/**
 * Site Reality template. Renders its own app shell (CoreAppSidebar + CoreAppTopBar) over a
 * KPIBar of headline figures and a three-column body: Insights Map panel, the map stage, and
 * the site context panel. Both flanking panels collapse into the stage — automatically as the row
 * narrows, and manually via the stage toggles when they fit.
 *
 * @deprecated Preview/demo prototype — renders built-in sample data and mock handlers. Not a
 * supported production import: compose your page from the widgets this template uses, wired to your
 * own data (see the CoreSiteReality template docs in Storybook). Slated for removal from the public API in a
 * future major.
 */
export function SiteReality({stage, contextHeader}: SiteRealityProps = {}) {
	// What the user asked for; what actually shows also depends on whether there's room (below).
	const [insightsWanted, setInsightsWanted] = useState(true);
	const [contextWanted, setContextWanted] = useState(true);

	const mainRef = useRef<HTMLElement>(null);
	const [rowWidth, setRowWidth] = useState(Number.POSITIVE_INFINITY);
	useEffect(() => {
		const el = mainRef.current;
		if (!el || typeof ResizeObserver === "undefined") return;
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) setRowWidth(entry.contentRect.width);
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const fitsContext = rowWidth >= STAGE_MIN_WIDTH + CONTEXT_PANEL_WIDTH;
	const fitsBoth = rowWidth >= STAGE_MIN_WIDTH + CONTEXT_PANEL_WIDTH + INSIGHTS_PANEL_WIDTH;
	const insightsOpen = insightsWanted && fitsBoth;
	const contextOpen = contextWanted && fitsContext;

	return (
		<div className="wwc:flex wwc:h-full wwc:min-h-0 wwc:bg-background wwc:text-foreground">
			<CoreAppSidebar
				viewLevel="org"
				orgGroups={SITE_REALITY_GROUPS}
				activeItemId="site-reality"
				showSearch={false}
				showNotifications={false}
			/>

			<div className="wwc:relative wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col">
				<CoreAppTopBar
					activeLabel="Site Reality / Insights Map"
					showProjectSwitcher={false}
					showNotifications
					notificationCount={3}
					rightContent={
						<div className="wwc:ml-auto wwc:flex wwc:items-center wwc:gap-2">
							<Badge variant="secondary">5m</Badge>
							<span className="wwc:text-xs wwc:text-muted-foreground">Updated 1m ago</span>
							<Button variant="ghost" size="sm" icon aria-label="Refresh now">
								<RefreshCw />
							</Button>
						</div>
					}
				/>

				<KPIBar groups={HEADLINE_GROUPS} />

				<main ref={mainRef} className="wwc:flex wwc:min-h-0 wwc:flex-1">
					{insightsOpen && <InsightsPanel />}

					{/* The context column pushes the map rather than overlaying it — PushPanel is the
					    library's docked-panel contract, so collapse/restore behaves like every other surface. */}
					<PushPanelProvider open={contextOpen} onOpenChange={setContextWanted} side="right">
						<PushPanelContainer className="wwc:min-h-0 wwc:min-w-0 wwc:flex-1">
							<PushPanelMain className="wwc:flex wwc:h-full wwc:min-h-0 wwc:min-w-0">
								<MapStage
									insightsOpen={insightsOpen}
									contextOpen={contextOpen}
									onToggleInsights={() => setInsightsWanted((v) => !v)}
									onToggleContext={() => setContextWanted((v) => !v)}
									stage={stage}
								/>
							</PushPanelMain>
							<PushPanel width={340} className="wwc:h-full wwc:border-l wwc:border-border">
								<ContextPanel header={contextHeader} />
							</PushPanel>
						</PushPanelContainer>
					</PushPanelProvider>
				</main>
			</div>
		</div>
	);
}
