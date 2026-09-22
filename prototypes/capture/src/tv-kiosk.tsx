// TV-mode kiosk panel — the auto-playing villa showcase that docks on the right of the Site view while
// the site map (with the current house spotlit + shifted left) plays behind it.
//
// Structure is fixed: HEADER (overline + title) sits above the MODEL (the same FragmentViewer the villa-
// level page uses), and the INFO half sits below it. The panel cycles two views per house, then advances
// to the next house and repeats — a self-driving loop:
//
//   1. Overview — the model does ONE full rotation over 12s; the bottom shows progress + milestones (the
//      look of the villa hover card). One full turn → switch to view 2.
//   2. Active tasks — the model ghosts back and only the elements for this week's activities stay lit; the
//      bottom lists those activities. First every activity is lit at once, then it steps through them one
//      at a time, zooming onto each activity's elements. The model keeps rotating at the same 12s/turn
//      speed until every activity has been stepped through — then the loop advances to the next house.
//
// The schedule's IFC GUIDs do NOT resolve against this villa model, so instead of resolving GUIDs we pull
// the model's REAL element localIds and assign each activity a group of them to highlight + zoom.

import type {MaterialDefinition} from "@thatopen/fragments";
import type {Schedule, ScheduleObject, ScheduleTask} from "./timeline/types";

import workerUrl from "@thatopen/fragments/worker?url";
import * as OBC from "@thatopen/components";
import {FragmentViewer, FragmentViewerProvider, useFragmentViewer} from "@corensystem/core-ui/fragment-viewer";
import {cn} from "@corensystem/core-utils";
import * as THREE from "three";
import {Component, type ReactNode, useEffect, useMemo, useRef, useState} from "react";

import {tradeColor, tradeForActivity} from "./timeline/trades";
import {VILLA_SCHEDULE} from "./timeline/villa-schedule";

// FragmentViewer can throw while starting WebGL (no GPU / WebGL disabled) or on a bad model. Contain it so
// a failure only swaps the top-half canvas for a fallback — the panel's info half stays up.
class ViewerBoundary extends Component<{children: ReactNode}, {failed: boolean}> {
	state = {failed: false};
	static getDerivedStateFromError() {
		return {failed: true};
	}
	render() {
		if (this.state.failed) {
			return (
				<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:text-xs wwc:text-black/40">
					3D view unavailable
				</div>
			);
		}
		return this.props.children;
	}
}

// The one detailed villa model, reused for every house (same asset the villa-level page loads).
const MODEL_SRC = "/models/villa-vl4.frag";
// Frame the building shell (a touch tighter than the whole model) so the villa reads big in the panel.
const BUILDING_CATEGORIES: RegExp[] = [
	/IFCWALL/,
	/IFCSLAB/,
	/IFCROOF/,
	/IFCCOLUMN/,
	/IFCBEAM/,
	/IFCSTAIR/,
	/IFCCURTAINWALL/,
	/IFCWINDOW/,
	/IFCDOOR/,
	/IFCMEMBER/,
	/IFCPLATE/,
	/IFCRAILING/,
	/IFCCOVERING/,
];

const ROTATION_MS = 12000; // one full turn — also the tempo of the per-task rotation while stepping tasks
const ALL_HOLD_MS = 2000; // how long every active task stays lit before stepping one-by-one
const STEP_MS = 2200; // dwell per task while stepping

const SITE_BREADCRUMB = "ALMANAR – Phase 1 – Zone 1 | Phase 1 | Zone 1-A";

// A highlight material per trade colour (cached so we don't churn THREE.Color allocations).
const MATERIAL_CACHE = new Map<string, MaterialDefinition>();
function materialFor(color: string): MaterialDefinition {
	let mat = MATERIAL_CACHE.get(color);
	if (!mat) {
		mat = {
			color: new THREE.Color(color),
			renderedFaces: 0,
			opacity: 1,
			transparent: false,
			preserveOriginalMaterial: false,
		} as unknown as MaterialDefinition;
		MATERIAL_CACHE.set(color, mat);
	}
	return mat;
}

// The villa model's fragments model, just the bits we call. The schedule's IFC GUIDs don't resolve against
// this villa model, so instead of resolving GUIDs we pull the model's REAL element localIds directly and
// assign each activity a group of them (see buildGroups) to highlight + zoom.
type FragModel = {
	modelId: string;
	getItemsOfCategories(categories: RegExp[]): Promise<Record<string, (number | null)[]>>;
	highlight(localIds: number[], material: MaterialDefinition): Promise<void>;
	resetHighlight(localIds?: number[]): Promise<void>;
};
function firstModel(components: OBC.Components): FragModel | null {
	const fragments = components.get(OBC.FragmentsManager);
	return ([...fragments.list.values()][0] as unknown as FragModel) ?? null;
}

// Give each activity a random contiguous slice of the element pool. Contiguous localIds tend to belong to
// the same type/area, so a slice reads as a coherent cluster the camera can zoom onto (rather than dust
// scattered across the whole villa). Computed once per model load, then reused.
function buildGroups(pool: number[], count: number): number[][] {
	if (pool.length === 0 || count === 0) return [];
	const windowSize = Math.min(Math.max(Math.floor(pool.length / (count * 2)), 6), 22);
	return Array.from({length: count}, () => {
		const maxStart = Math.max(pool.length - windowSize, 0);
		const start = Math.floor(Math.random() * (maxStart + 1));
		return pool.slice(start, start + windowSize);
	});
}

interface WeekPlan {
	day: number; // the schedule day whose active tasks we treat as "this week"
	tasks: ScheduleTask[]; // one geometry-bearing task per object, capped for a clean list
}

// Pick the busiest week: the schedule day with the most geometry-bearing tasks in progress (one per
// object, so the list reads clean), capped to a handful. Deterministic — no wall-clock involved.
function pickWeek(schedule: Schedule): WeekPlan {
	const objById = new Map(schedule.objects.map((o) => [o.id, o] as const));
	let best: WeekPlan = {day: 0, tasks: []};
	for (let day = 0; day <= schedule.meta.totalDays; day++) {
		const seen = new Set<string>();
		const tasks: ScheduleTask[] = [];
		for (const t of schedule.tasks) {
			if (!(t.startDay <= day && day < t.startDay + t.duration)) continue;
			const obj = objById.get(t.objectId);
			if (!obj || obj.guids.length === 0) continue; // needs geometry in the schedule
			if (seen.has(t.objectId)) continue; // one task per object
			seen.add(t.objectId);
			tasks.push(t);
		}
		if (tasks.length > best.tasks.length) best = {day, tasks};
	}
	return {day: best.day, tasks: best.tasks.slice(0, 6)};
}

// Built-element fraction at a day — the "% complete" the overview bar shows.
function progressAt(schedule: Schedule, day: number): number {
	let total = 0;
	let built = 0;
	for (const o of schedule.objects) {
		if (o.guids.length === 0) continue;
		total += o.count;
		if (day >= o.endDay) built += o.count;
	}
	return total ? built / total : 0;
}

type MilestoneState = "done" | "current" | "future";
function milestoneRows(schedule: Schedule, day: number): {name: string; date: string; state: MilestoneState}[] {
	const all = schedule.milestones;
	// Keep it to ~6 evenly-spaced milestones so the row never overflows the panel.
	const picked = all.length <= 6 ? all : all.filter((_, i) => i % Math.ceil(all.length / 6) === 0).slice(0, 6);
	const lastPassed = picked.reduce((acc, m, i) => (m.day <= day ? i : acc), -1);
	const shortDate = (iso: string) =>
		new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {month: "short", year: "2-digit", timeZone: "UTC"});
	return picked.map((m, i) => ({
		name: m.name,
		date: shortDate(m.date),
		state: i < lastPassed ? "done" : i === lastPassed ? "current" : "future",
	}));
}

/**
 * The kiosk panel. Renders nothing when inactive. Owns its own FragmentViewerProvider so the villa model,
 * the rotation driver and the task painter all share one viewport.
 *
 * Sizing rule: 75% of the RIGHT HALF of the screen (37.5% viewport wide, 75% tall), centred in that half.
 */
export function TvKiosk({
	active,
	house,
	onAdvanceHouse,
}: {
	active: boolean;
	/** House code shown as the villa title (e.g. "DP4-2050"). Changing it restarts the cycle. */
	house: string | null;
	/** Called once a house's full overview→tasks cycle has played, so the parent can spotlight the next. */
	onAdvanceHouse: () => void;
}) {
	if (!active) return null;
	return (
		<div
			// Sizing rule: the modal is 75% of the RIGHT HALF of the screen (so 37.5% of the viewport wide,
			// 75% tall) and centred within that right half — centre at 75% across, 50% down. The remaining
			// 25% of the right half is the even gap between the modal and the screen edges, at any size.
			className="wwc:pointer-events-auto wwc:absolute wwc:left-[75%] wwc:top-1/2 wwc:z-40 wwc:flex wwc:h-[75%] wwc:w-[37.5%] wwc:-translate-x-1/2 wwc:-translate-y-1/2 wwc:flex-col wwc:overflow-hidden wwc:rounded"
			// Same treatment as the villa hover card (see site-canvas.ts): near-white translucent panel with
			// a soft blur, a subtle light border, and a gentle drop + inset shadow.
			style={{
				background: "rgba(255,255,255,0.95)",
				backdropFilter: "blur(8px)",
				WebkitBackdropFilter: "blur(8px)",
				border: "1px solid rgba(255,255,255,0.5)",
				boxShadow: "0 12px 40px rgba(0,0,0,0.05), inset 0 0 24px 4px rgba(0,0,0,0.05)",
			}}
		>
			<FragmentViewerProvider>
				<KioskBody house={house} onAdvanceHouse={onAdvanceHouse} />
			</FragmentViewerProvider>
		</div>
	);
}

function KioskBody({house, onAdvanceHouse}: {house: string | null; onAdvanceHouse: () => void}) {
	const {state, api} = useFragmentViewer();
	// The real villa schedule is bundled (no fetch) — the single source, adapted from the P6 export.
	const [schedule] = useState<Schedule | null>(VILLA_SCHEDULE);
	const week = useMemo(() => (schedule ? pickWeek(schedule) : null), [schedule]);

	const modelRef = useRef<FragModel | null>(null);
	const modelIdRef = useRef<string>("");
	const groupsRef = useRef<number[][]>([]); // per-activity element groups to highlight + zoom
	const [resolved, setResolved] = useState(false);
	const [modelShown, setModelShown] = useState(false); // false until the model is ready + grid hidden
	const prevHighlightRef = useRef<number[] | null>(null);

	const [phase, setPhase] = useState<"overview" | "tasks">("overview");
	const [taskStep, setTaskStep] = useState(-1); // -1 = every active task lit at once

	// Keep the advance callback in a ref so the engine effect doesn't re-run when the parent re-renders.
	const onAdvanceRef = useRef(onAdvanceHouse);
	onAdvanceRef.current = onAdvanceHouse;

	// Once the viewer is ready, pull the villa model's REAL building elements and slice them into one group
	// per activity. These groups are what we highlight + zoom onto (the schedule GUIDs don't map here).
	useEffect(() => {
		if (state.status !== "ready" || !week || modelRef.current) return;
		const components = api.viewport()?.components;
		if (!components) return;
		let cancelled = false;
		void (async () => {
			const model = firstModel(components);
			if (!model) return;
			const cats = await model.getItemsOfCategories(BUILDING_CATEGORIES);
			const pool = ([] as (number | null)[]).concat(...Object.values(cats)).filter((x): x is number => typeof x === "number");
			if (cancelled || pool.length === 0) return;
			pool.sort((a, b) => a - b);
			modelRef.current = model;
			modelIdRef.current = model.modelId;
			groupsRef.current = buildGroups(pool, week.tasks.length);
			setResolved(true);
		})();
		return () => {
			cancelled = true;
		};
	}, [state.status, week, api]);

	// Hide the ground grid in the kiosk viewer — the model floats on a clean white background here.
	useEffect(() => {
		if (state.status !== "ready") return;
		const components = api.viewport()?.components;
		if (!components) return;
		try {
			const grids = components.get(OBC.Grids);
			const list = grids.list as unknown as Map<unknown, {three?: THREE.Object3D; config?: {visible?: boolean}}>;
			for (const g of list.values()) {
				if (g.three) g.three.visible = false;
				if (g.config) g.config.visible = false;
			}
		} catch {
			/* no grid to hide */
		}
		// Grid is hidden now — safe to lift the white cover and reveal the model.
		setModelShown(true);
	}, [state.status, api]);

	// Frame + zoom onto a group of elements (used per activity). fitToSphere keeps the current orbit angle,
	// so the continuous rotation carries on — it just orbits these elements now.
	async function zoomToIds(ids: number[]) {
		const components = api.viewport()?.components;
		const controls = api.viewport()?.world.camera.controls;
		const modelId = modelIdRef.current;
		if (!components || !controls || !modelId || ids.length === 0) return;
		const boxer = components.get(OBC.BoundingBoxer);
		boxer.list.clear();
		await boxer.addFromModelIdMap({[modelId]: new Set(ids)});
		const box = boxer.get().clone();
		boxer.list.clear();
		if (box.isEmpty()) return;
		const sphere = box.getBoundingSphere(new THREE.Sphere());
		sphere.radius *= 1.6; // a little breathing room around the group
		await controls.fitToSphere(sphere, true);
	}

	// Paint helper: reset the previous highlight, then light each group in its trade colour over the ghost.
	async function paint(groups: {ids: number[]; color: string}[]) {
		const model = modelRef.current;
		const components = api.viewport()?.components;
		if (!model || !components) return;
		const fragments = components.get(OBC.FragmentsManager);
		if (prevHighlightRef.current?.length) await model.resetHighlight(prevHighlightRef.current);
		const all: number[] = [];
		for (const g of groups) {
			if (!g.ids.length) continue;
			await model.highlight(g.ids, materialFor(g.color));
			all.push(...g.ids);
		}
		prevHighlightRef.current = all;
		await fragments.core.update(true);
	}
	async function clearPaint() {
		const model = modelRef.current;
		const components = api.viewport()?.components;
		if (!model || !components) return;
		if (prevHighlightRef.current?.length) await model.resetHighlight(prevHighlightRef.current);
		prevHighlightRef.current = null;
		await components.get(OBC.FragmentsManager).core.update(true);
	}

	// The engine: continuous rotation + the overview→tasks→advance state machine. Re-runs per house.
	useEffect(() => {
		if (!resolved || !week) return;
		// Each activity → its element group (real model elements) tinted in the activity's trade colour.
		const groupFor = (i: number) => ({ids: groupsRef.current[i] ?? [], color: tradeColor(week.tasks[i].activity)});
		let cancelled = false;
		let raf = 0;
		let last = performance.now();
		let acc = 0;
		const localPhase = {current: "overview" as "overview" | "tasks"};
		const timers: number[] = [];
		const controls = () => api.viewport()?.world.camera.controls;

		// Start each house on the overview: normal (un-ghosted) model, no highlight, framed whole (a
		// previous house's task view may have left the camera zoomed into a single object).
		setPhase("overview");
		setTaskStep(-1);
		void api.setGhost(false);
		void clearPaint();
		void api.fit();

		const startTasks = () => {
			if (cancelled) return;
			localPhase.current = "tasks";
			setPhase("tasks");
			setTaskStep(-1);
			void api.setGhost(true);
			// Every active task lit at once.
			void paint(week.tasks.map((_, i) => groupFor(i)));
			if (week.tasks.length === 0) {
				timers.push(window.setTimeout(() => !cancelled && onAdvanceRef.current(), ALL_HOLD_MS));
				return;
			}
			let step = 0;
			const advance = () => {
				if (cancelled) return;
				if (step >= week.tasks.length) {
					void clearPaint();
					void api.setGhost(false);
					onAdvanceRef.current();
					return;
				}
				setTaskStep(step);
				void paint([groupFor(step)]);
				void zoomToIds(groupsRef.current[step] ?? []); // zoom the camera onto this activity's elements
				step++;
				timers.push(window.setTimeout(advance, STEP_MS));
			};
			// Hold the "all lit" state, then step through one task at a time.
			timers.push(window.setTimeout(advance, ALL_HOLD_MS));
		};

		const tick = (now: number) => {
			if (cancelled) return;
			const dt = now - last;
			last = now;
			// Same rotation speed in both phases: a full 2π over ROTATION_MS.
			controls()?.rotate((2 * Math.PI) * (dt / ROTATION_MS), 0, false);
			if (localPhase.current === "overview") {
				acc += dt;
				if (acc >= ROTATION_MS) startTasks(); // one full turn done → active-tasks view
			}
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);

		return () => {
			cancelled = true;
			cancelAnimationFrame(raf);
			timers.forEach((id) => window.clearTimeout(id));
			void clearPaint();
			void api.setGhost(false);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [resolved, week, house]);

	const title = house ?? "Villa";
	const objById = useMemo(
		() => new Map((schedule?.objects ?? []).map((o) => [o.id, o] as [string, ScheduleObject])),
		[schedule],
	);

	return (
		<>
			{/* HEADER — overline (breadcrumb + milestone badge) and title, sitting above the model. */}
			<div className="wwc:shrink-0 wwc:px-4 wwc:pb-3 wwc:pt-4">
				<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2">
					<span className="wwc:min-w-0 wwc:truncate wwc:text-[11px] wwc:font-medium wwc:text-muted-foreground">
						{SITE_BREADCRUMB}
					</span>
					<span className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-1 wwc:rounded-full wwc:border wwc:border-border wwc:bg-muted wwc:px-2 wwc:py-0.5 wwc:text-[11px] wwc:font-semibold">
						<span className="wwc:h-1.5 wwc:w-1.5 wwc:rounded-full wwc:bg-emerald-500" />
						M35
					</span>
				</div>
				<h2 className="wwc:mt-1.5 wwc:text-xl wwc:font-semibold wwc:leading-tight wwc:text-foreground">{title}</h2>
			</div>

			{/* MODEL — the live villa. A solid white cover masks the viewer (and its grid) until the model
			    has loaded and the grid is hidden, so the grid never flashes in. */}
			<div className="wwc:relative wwc:min-h-0 wwc:flex-1 wwc:bg-white">
				<ViewerBoundary>
					<FragmentViewer
						src={MODEL_SRC}
						modelId="kiosk-villa"
						workerUrl={workerUrl}
						background="#ffffff"
						fitCategories={BUILDING_CATEGORIES}
						fitFactor={0.9}
						showLogo={false}
					/>
				</ViewerBoundary>
				{!modelShown && state.status !== "error" && <div className="wwc:absolute wwc:inset-0 wwc:z-10 wwc:bg-white" />}
				<div className="wwc:pointer-events-none wwc:absolute wwc:left-3 wwc:top-3 wwc:z-20 wwc:rounded wwc:border wwc:border-border wwc:bg-white/80 wwc:px-2 wwc:py-1 wwc:text-[11px] wwc:font-medium wwc:uppercase wwc:tracking-wide wwc:text-foreground/60">
					{phase === "overview" ? "Overview" : "Active this week"}
				</div>
			</div>

			{/* INFO — progress + milestones (overview) or the active-task list. */}
			<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:overflow-y-auto wwc:px-4 wwc:pb-4">
				{phase === "overview" ? (
					<OverviewBody schedule={schedule} day={week?.day ?? 0} />
				) : (
					<TasksBody tasks={week?.tasks ?? []} taskStep={taskStep} objById={objById} />
				)}
			</div>
		</>
	);
}

function OverviewBody({schedule, day}: {schedule: Schedule | null; day: number}) {
	if (!schedule) return <div className="wwc:mt-4 wwc:text-sm wwc:text-muted-foreground">Loading progress…</div>;
	const approved = Math.round(progressAt(schedule, day) * 100);
	const planned = Math.max(approved - 11, 0); // demo variance, mirroring the villa hover card
	const rows = milestoneRows(schedule, day);
	return (
		<div className="wwc:mt-4 wwc:flex wwc:flex-col wwc:gap-4">
			{/* Progress — Approved vs Planned tiles, like the hover card. */}
			<div className="wwc:grid wwc:grid-cols-2 wwc:gap-2">
				<Stat label="Approved" value={`${approved}%`} accent="wwc:bg-emerald-500" fill={approved} />
				<Stat label="Planned" value={`${planned}%`} accent="wwc:bg-muted-foreground/40" fill={planned} />
			</div>

			{/* Milestones — a compact timeline of the programme markers. */}
			<div>
				<div className="wwc:mb-2 wwc:text-[11px] wwc:font-medium wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
					Milestones
				</div>
				<div className="wwc:flex wwc:items-start wwc:gap-1">
					{rows.map((m) => (
						<div key={m.name} className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col wwc:items-center wwc:gap-1">
							<span
								className={cn(
									"wwc:flex wwc:h-5 wwc:w-5 wwc:items-center wwc:justify-center wwc:rounded-full wwc:text-[10px] wwc:text-white",
									m.state === "current"
										? "wwc:bg-emerald-500"
										: m.state === "done"
											? "wwc:bg-muted-foreground/50"
											: "wwc:border wwc:border-border wwc:bg-transparent",
								)}
							>
								{m.state === "future" ? "" : "✓"}
							</span>
							<span className="wwc:text-[10px] wwc:leading-none wwc:text-muted-foreground">{m.date}</span>
							<span
								className={cn(
									"wwc:truncate wwc:text-[10px] wwc:font-semibold wwc:leading-none",
									m.state === "current" ? "wwc:text-foreground" : "wwc:text-muted-foreground",
								)}
							>
								{m.name}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function Stat({label, value, accent, fill}: {label: string; value: string; accent: string; fill: number}) {
	return (
		<div className="wwc:rounded wwc:border wwc:border-border wwc:bg-background wwc:p-2.5">
			<div className="wwc:text-lg wwc:font-semibold wwc:leading-none wwc:text-foreground">{value}</div>
			<div className="wwc:mt-1 wwc:text-[11px] wwc:text-muted-foreground">{label}</div>
			<div className="wwc:mt-2 wwc:h-1 wwc:w-full wwc:overflow-hidden wwc:rounded-full wwc:bg-muted">
				<div className={cn("wwc:h-full wwc:rounded-full", accent)} style={{width: `${Math.min(Math.max(fill, 0), 100)}%`}} />
			</div>
		</div>
	);
}

function TasksBody({
	tasks,
	taskStep,
	objById,
}: {
	tasks: ScheduleTask[];
	taskStep: number;
	objById: Map<string, ScheduleObject>;
}) {
	return (
		<div className="wwc:mt-4 wwc:flex wwc:min-h-0 wwc:flex-col wwc:gap-2">
			<div className="wwc:text-[11px] wwc:font-medium wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
				Active this week
			</div>
			<ul className="wwc:flex wwc:flex-col wwc:gap-1">
				{tasks.map((t, i) => {
					// -1 lights every row; otherwise only the stepped row is emphasised.
					const on = taskStep === -1 || taskStep === i;
					const obj = objById.get(t.objectId);
					return (
						<li
							key={t.id}
							className={cn(
								"wwc:flex wwc:items-center wwc:gap-2.5 wwc:rounded wwc:border wwc:px-2.5 wwc:py-2 wwc:transition-all",
								on
									? "wwc:border-border wwc:bg-background wwc:opacity-100"
									: "wwc:border-transparent wwc:opacity-40",
							)}
						>
							<span
								className="wwc:h-2.5 wwc:w-2.5 wwc:shrink-0 wwc:rounded-full"
								style={{backgroundColor: tradeColor(t.activity)}}
							/>
							<div className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col">
								<span className="wwc:truncate wwc:text-[13px] wwc:font-medium wwc:text-foreground">{t.name}</span>
								<span className="wwc:truncate wwc:text-[11px] wwc:text-muted-foreground">
									{tradeForActivity(t.activity).label}
									{obj ? ` · ${obj.storey}` : ""}
								</span>
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
