import {cn} from "@corensystem/coren-utils";
import * as React from "react";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";

import {Badge} from "./badge";
import {Button} from "./button";
import {Card} from "./card";
import {Progress} from "./progress";
import {ScrollArea} from "./scroll-area";
import {Separator} from "./separator";
import {Slider} from "./slider";
import {Switch} from "./switch";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "./tabs";

/* ------------------------------------------------------------------ types */

type ViewerStatus = "idle" | "loading" | "ready" | "error";

type Floor = {
	id: string;
	name: string;
	elevation: string;
	progress: number;
	objects: number;
	workers: number;
};

type ObjectSelection = {
	id: string;
	label: string;
	category: string;
	floorId: string;
};

type ScheduleTask = {
	id: string;
	name: string;
	floorId: string;
	startDay: number;
	endDay: number;
};

type Worker = {
	id: string;
	name: string;
	trade: string;
	floorId: string;
	active: boolean;
};

type LeftTab = "floors" | "schedule" | "workers";

/* ------------------------------------------------------------- mock data */

const TOTAL_DAYS = 42;

const FLOORS: Floor[] = [
	{id: "lvl-04", name: "Level 04 — Roof", elevation: "+14.40 m", progress: 12, objects: 184, workers: 2},
	{id: "lvl-03", name: "Level 03", elevation: "+10.80 m", progress: 38, objects: 412, workers: 6},
	{id: "lvl-02", name: "Level 02", elevation: "+7.20 m", progress: 71, objects: 508, workers: 9},
	{id: "lvl-01", name: "Level 01", elevation: "+3.60 m", progress: 94, objects: 533, workers: 4},
	{id: "lvl-00", name: "Ground", elevation: "±0.00 m", progress: 100, objects: 621, workers: 3},
];

const TASKS: ScheduleTask[] = [
	{id: "t-1", name: "Foundations & slab", floorId: "lvl-00", startDay: 1, endDay: 7},
	{id: "t-2", name: "L01 columns + deck", floorId: "lvl-01", startDay: 6, endDay: 15},
	{id: "t-3", name: "L02 columns + deck", floorId: "lvl-02", startDay: 14, endDay: 24},
	{id: "t-4", name: "L03 shell", floorId: "lvl-03", startDay: 22, endDay: 33},
	{id: "t-5", name: "Roof & envelope", floorId: "lvl-04", startDay: 31, endDay: 42},
];

const WORKERS: Worker[] = [
	{id: "w-1", name: "A. Haddad", trade: "Steel fixer", floorId: "lvl-02", active: true},
	{id: "w-2", name: "M. Rahman", trade: "Carpenter", floorId: "lvl-02", active: true},
	{id: "w-3", name: "S. Okoye", trade: "Electrician", floorId: "lvl-01", active: false},
	{id: "w-4", name: "K. Nasser", trade: "Concrete", floorId: "lvl-03", active: true},
	{id: "w-5", name: "R. Devi", trade: "HVAC", floorId: "lvl-03", active: false},
	{id: "w-6", name: "T. Bello", trade: "Surveyor", floorId: "lvl-00", active: true},
];

const OBJECTS: ObjectSelection[] = [
	{id: "o-1", label: "Beam B-214", category: "IfcBeam", floorId: "lvl-02"},
	{id: "o-2", label: "Column C-08", category: "IfcColumn", floorId: "lvl-01"},
	{id: "o-3", label: "Slab S-31", category: "IfcSlab", floorId: "lvl-03"},
];

/* --------------------------------------------------------------- helpers */

function getFloor(id: string | null): Floor | null {
	if (!id) return null;
	return FLOORS.find((f) => f.id === id) ?? null;
}

function dayLabel(day: number): string {
	const week = Math.floor((day - 1) / 7) + 1;
	return `W${week} · D${day}`;
}

/* ------------------------------------------------------------- component */

export interface StageContentProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Fired once the mock model finishes loading (status settles to `ready`). */
	onSettled?: () => void;
	/** Floor id to pre-select on mount (e.g. arriving from a site part-click). */
	initialFloorId?: string | null;
}

/** A fragment/3D viewer stage: an overlay-headed canvas with a floor rail, viewer toggles, and a 4D timeline scrubber. */
const StageContent = React.forwardRef<HTMLDivElement, StageContentProps>(
	({className, onSettled, initialFloorId = null, ...props}, ref) => {
		const [status, setStatus] = useState<ViewerStatus>("loading");
		const [loadProgress, setLoadProgress] = useState(18);

		const [showWorkers, setShowWorkers] = useState(false);
		const [showOverlay, setShowOverlay] = useState(false);
		const [headParallax, setHeadParallax] = useState(false);
		const [show4D, setShow4D] = useState(false);

		const [day, setDay] = useState(1);
		const [playing, setPlaying] = useState(false);
		const [timelineReady, setTimelineReady] = useState(false);

		const [selectedFloorId, setSelectedFloorId] = useState<string | null>(initialFloorId);
		const [objectSel, setObjectSel] = useState<ObjectSelection | null>(null);
		const [tab, setTab] = useState<LeftTab>("floors");

		const selectedFloor = getFloor(selectedFloorId);
		const pendingStartDayRef = useRef<number | null>(null);
		const settledRef = useRef(false);
		const onSettledRef = useRef(onSettled);
		onSettledRef.current = onSettled;

		/* model load → settled */
		useEffect(() => {
			const tick = window.setInterval(() => {
				setLoadProgress((p) => (p >= 100 ? 100 : Math.min(100, p + 14)));
			}, 220);
			return () => window.clearInterval(tick);
		}, []);

		useEffect(() => {
			if (loadProgress < 100 || settledRef.current) return;
			settledRef.current = true;
			setStatus("ready");
			onSettledRef.current?.();
		}, [loadProgress]);

		/* 4D timeline loads asynchronously once enabled */
		useEffect(() => {
			if (!show4D) {
				setTimelineReady(false);
				setPlaying(false);
				return;
			}
			const t = window.setTimeout(() => setTimelineReady(true), 400);
			return () => window.clearTimeout(t);
		}, [show4D]);

		/* deferred seek + play, once the schedule resolves */
		useEffect(() => {
			if (!timelineReady || pendingStartDayRef.current == null) return;
			setDay(pendingStartDayRef.current);
			setPlaying(true);
			pendingStartDayRef.current = null;
		}, [timelineReady]);

		/* playback */
		useEffect(() => {
			if (!playing || !timelineReady) return;
			const tick = window.setInterval(() => {
				setDay((d) => {
					if (d >= TOTAL_DAYS) {
						setPlaying(false);
						return TOTAL_DAYS;
					}
					return d + 1;
				});
			}, 260);
			return () => window.clearInterval(tick);
		}, [playing, timelineReady]);

		const startTimelineAtDay = useCallback(
			(target: number) => {
				pendingStartDayRef.current = target;
				if (show4D) {
					if (timelineReady) {
						setDay(target);
						setPlaying(true);
						pendingStartDayRef.current = null;
					}
					return;
				}
				// The timeline owns the scene — clear floor + object emphasis + workers first.
				setSelectedFloorId(null);
				setObjectSel(null);
				setShowWorkers(false);
				setShow4D(true);
			},
			[show4D, timelineReady],
		);

		const selectFloor = useCallback(
			(id: string) => {
				setSelectedFloorId((cur) => (cur === id ? null : id));
				setObjectSel(null);
				if (show4D) setShow4D(false);
			},
			[show4D],
		);

		const activeTasks = useMemo(() => TASKS.filter((t) => day >= t.startDay && day <= t.endDay), [day]);
		const visibleWorkers = useMemo(
			() => (selectedFloorId ? WORKERS.filter((w) => w.floorId === selectedFloorId) : WORKERS),
			[selectedFloorId],
		);
		const onSiteCount = useMemo(() => WORKERS.filter((w) => w.active).length, []);
		const buildProgress = Math.round((day / TOTAL_DAYS) * 100);
		const inspectorOpen = tab !== "schedule" && (Boolean(selectedFloor) || Boolean(objectSel));

		const toggles: Array<{key: string; label: string; on: boolean; set: (v: boolean) => void; hint: string}> = [
			{key: "workers", label: "Workers", on: showWorkers, set: setShowWorkers, hint: `${onSiteCount} on site`},
			{key: "overlay", label: "GLB", on: showOverlay, set: setShowOverlay, hint: "Overlay mesh"},
			{key: "parallax", label: "Head", on: headParallax, set: setHeadParallax, hint: "Camera required"},
			{
				key: "4d",
				label: "4D",
				on: show4D,
				set: (v: boolean) => {
					if (v) {
						startTimelineAtDay(day);
					} else {
						setShow4D(false);
					}
				},
				hint: timelineReady ? dayLabel(day) : show4D ? "Resolving…" : "Schedule",
			},
		];

		return (
			<div
				ref={ref}
				className={cn(
					"wwc:flex wwc:h-full wwc:min-h-[540px] wwc:w-full wwc:flex-col wwc:gap-1.5 wwc:bg-background wwc:p-1.5 wwc:text-foreground",
					className,
				)}
				{...props}
			>
				{/* Toolbar — everything inline */}
				<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5 wwc:rounded-md wwc:border wwc:border-border wwc:bg-card wwc:px-2 wwc:py-1.5">
					<span className="wwc:text-xs wwc:font-semibold wwc:tracking-tight">Duplex.frag</span>
					<Badge
						variant={status === "ready" ? "secondary" : status === "error" ? "destructive" : "outline"}
						className="wwc:h-5 wwc:px-1.5 wwc:text-[10px] wwc:uppercase"
					>
						{status}
					</Badge>
					{status !== "ready" ? (
						<Progress value={loadProgress} className="wwc:h-1 wwc:w-24" />
					) : (
						<span className="wwc:text-[11px] wwc:text-muted-foreground">
							{FLOORS.length} storeys · {FLOORS.reduce((n, f) => n + f.objects, 0)} objects
						</span>
					)}

					<Separator orientation="vertical" className="wwc:mx-0.5 wwc:h-5" />

					<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-x-3 wwc:gap-y-1">
						{toggles.map((t) => (
							<label
								key={t.key}
								className="wwc:flex wwc:cursor-pointer wwc:items-center wwc:gap-1.5 wwc:text-[11px] wwc:leading-none"
							>
								<Switch checked={t.on} onCheckedChange={t.set} aria-label={t.label} />
								<span className={cn("wwc:font-medium", t.on ? "wwc:text-foreground" : "wwc:text-muted-foreground")}>
									{t.label}
								</span>
								<span className="wwc:text-[10px] wwc:text-muted-foreground">{t.hint}</span>
							</label>
						))}
					</div>

					<div className="wwc:ml-auto wwc:flex wwc:items-center wwc:gap-1">
						<Button
							variant="ghost"
							size="sm"
							className="wwc:h-6 wwc:px-2 wwc:text-[11px]"
							onClick={() => {
								setSelectedFloorId(null);
								setObjectSel(null);
							}}
							disabled={!selectedFloorId && !objectSel}
						>
							Clear
						</Button>
						<Button variant="outline" size="sm" className="wwc:h-6 wwc:px-2 wwc:text-[11px]" onClick={() => setDay(1)}>
							Reset view
						</Button>
					</div>
				</div>

				{/* Stage row */}
				<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:gap-1.5">
					{/* Left panel — floor / section rail */}
					<Card className="wwc:flex wwc:w-56 wwc:shrink-0 wwc:flex-col wwc:gap-0 wwc:overflow-hidden wwc:p-0">
						<Tabs
							value={tab}
							onValueChange={(v) => setTab(v as LeftTab)}
							className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:gap-0"
						>
							<TabsList className="wwc:h-7 wwc:w-full wwc:justify-stretch wwc:rounded-none wwc:border-b wwc:border-border wwc:bg-muted/50 wwc:p-0.5">
								<TabsTrigger value="floors" className="wwc:h-6 wwc:flex-1 wwc:text-[11px]">
									Floors
								</TabsTrigger>
								<TabsTrigger value="schedule" className="wwc:h-6 wwc:flex-1 wwc:text-[11px]">
									Schedule
								</TabsTrigger>
								<TabsTrigger value="workers" className="wwc:h-6 wwc:flex-1 wwc:text-[11px]">
									Crew
								</TabsTrigger>
							</TabsList>

							<TabsContent value="floors" className="wwc:m-0 wwc:min-h-0 wwc:flex-1">
								<ScrollArea className="wwc:h-full">
									<div className="wwc:flex wwc:flex-col wwc:gap-1 wwc:p-1.5">
										{FLOORS.map((f) => {
											const active = f.id === selectedFloorId;
											return (
												<button
													key={f.id}
													type="button"
													onClick={() => selectFloor(f.id)}
													aria-pressed={active}
													className={cn(
														"wwc:w-full wwc:rounded-sm wwc:border wwc:px-2 wwc:py-1.5 wwc:text-left wwc:transition-colors",
														"wwc:hover:bg-accent wwc:hover:text-accent-foreground",
														active ? "wwc:border-primary wwc:bg-primary/10" : "wwc:border-transparent wwc:bg-muted/40",
													)}
												>
													<div className="wwc:flex wwc:items-baseline wwc:justify-between wwc:gap-1">
														<span className="wwc:truncate wwc:text-[11px] wwc:font-medium">{f.name}</span>
														<span className="wwc:shrink-0 wwc:text-[10px] wwc:tabular-nums wwc:text-muted-foreground">
															{f.elevation}
														</span>
													</div>
													<div className="wwc:mt-1 wwc:flex wwc:items-center wwc:gap-1.5">
														<Progress value={f.progress} className="wwc:h-1 wwc:flex-1" />
														<span className="wwc:w-8 wwc:text-right wwc:text-[10px] wwc:tabular-nums wwc:text-muted-foreground">
															{f.progress}%
														</span>
														{showWorkers && f.workers > 0 ? (
															<Badge variant="outline" className="wwc:h-4 wwc:px-1 wwc:text-[9px] wwc:tabular-nums">
																{f.workers}
															</Badge>
														) : null}
													</div>
												</button>
											);
										})}
									</div>
								</ScrollArea>
							</TabsContent>

							<TabsContent value="schedule" className="wwc:m-0 wwc:min-h-0 wwc:flex-1">
								<ScrollArea className="wwc:h-full">
									<div className="wwc:flex wwc:flex-col wwc:gap-1 wwc:p-1.5">
										{TASKS.map((t) => {
											const live = day >= t.startDay && day <= t.endDay;
											return (
												<div
													key={t.id}
													className={cn(
														"wwc:flex wwc:items-center wwc:gap-1.5 wwc:rounded-sm wwc:border wwc:px-2 wwc:py-1",
														live ? "wwc:border-primary/50 wwc:bg-primary/5" : "wwc:border-transparent wwc:bg-muted/40",
													)}
												>
													<div className="wwc:min-w-0 wwc:flex-1">
														<div className="wwc:truncate wwc:text-[11px] wwc:font-medium">{t.name}</div>
														<div className="wwc:text-[10px] wwc:tabular-nums wwc:text-muted-foreground">
															{dayLabel(t.startDay)} → {dayLabel(t.endDay)}
														</div>
													</div>
													<Button
														variant={live ? "default" : "ghost"}
														size="sm"
														className="wwc:h-5 wwc:px-1.5 wwc:text-[10px]"
														onClick={() => startTimelineAtDay(t.startDay)}
													>
														Play
													</Button>
												</div>
											);
										})}
									</div>
								</ScrollArea>
							</TabsContent>

							<TabsContent value="workers" className="wwc:m-0 wwc:min-h-0 wwc:flex-1">
								<ScrollArea className="wwc:h-full">
									<div className="wwc:flex wwc:flex-col wwc:gap-0.5 wwc:p-1.5">
										{visibleWorkers.map((w) => (
											<div
												key={w.id}
												className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:rounded-sm wwc:px-1.5 wwc:py-1 wwc:hover:bg-accent"
											>
												<span
													className={cn(
														"wwc:size-1.5 wwc:shrink-0 wwc:rounded-full",
														w.active ? "wwc:bg-primary" : "wwc:bg-muted-foreground/40",
													)}
													aria-hidden
												/>
												<span className="wwc:truncate wwc:text-[11px] wwc:font-medium">{w.name}</span>
												<span className="wwc:ml-auto wwc:shrink-0 wwc:text-[10px] wwc:text-muted-foreground">
													{w.trade}
												</span>
											</div>
										))}
										{visibleWorkers.length === 0 ? (
											<p className="wwc:px-1.5 wwc:py-2 wwc:text-[11px] wwc:text-muted-foreground">
												No crew on this floor.
											</p>
										) : null}
									</div>
								</ScrollArea>
							</TabsContent>
						</Tabs>
					</Card>

					{/* Viewport */}
					<div className="wwc:relative wwc:min-w-0 wwc:flex-1 wwc:overflow-hidden wwc:rounded-md wwc:border wwc:border-border wwc:bg-muted">
						<div
							className="wwc:absolute wwc:inset-0 wwc:bg-gradient-to-b wwc:from-muted wwc:to-background"
							aria-hidden
						/>
						<div className="wwc:absolute wwc:inset-0 wwc:flex wwc:items-center wwc:justify-center">
							<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-1 wwc:text-center">
								<span className="wwc:text-[11px] wwc:font-medium wwc:text-muted-foreground">
									{status === "ready" ? "Fragment viewer" : "Loading fragments…"}
								</span>
								<span className="wwc:text-[10px] wwc:text-muted-foreground">
									{show4D
										? timelineReady
											? `4D · ${dayLabel(day)} · ${activeTasks.length} active task${activeTasks.length === 1 ? "" : "s"}`
											: "Resolving schedule…"
										: selectedFloor
											? `Storey emphasis · ${selectedFloor.name}`
											: "Orbit · drag to rotate"}
								</span>
							</div>
						</div>

						{/* Inline HUD chips */}
						<div className="wwc:absolute wwc:left-1.5 wwc:top-1.5 wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1">
							{showOverlay ? (
								<Badge variant="secondary" className="wwc:h-5 wwc:px-1.5 wwc:text-[10px]">
									GLB overlay
								</Badge>
							) : null}
							{headParallax ? (
								<Badge variant="secondary" className="wwc:h-5 wwc:px-1.5 wwc:text-[10px]">
									Head parallax
								</Badge>
							) : null}
							{showWorkers ? (
								<Badge variant="secondary" className="wwc:h-5 wwc:px-1.5 wwc:text-[10px] wwc:tabular-nums">
									{onSiteCount} workers
								</Badge>
							) : null}
						</div>

						{/* Object picker — inline row instead of a stacked list */}
						<div className="wwc:absolute wwc:bottom-1.5 wwc:left-1.5 wwc:flex wwc:items-center wwc:gap-1">
							{OBJECTS.map((o) => (
								<Button
									key={o.id}
									variant={objectSel?.id === o.id ? "default" : "outline"}
									size="sm"
									className="wwc:h-6 wwc:px-1.5 wwc:text-[10px]"
									onClick={() => {
										setObjectSel((cur) => (cur?.id === o.id ? null : o));
										setSelectedFloorId(o.floorId);
										setTab("floors");
									}}
								>
									{o.label}
								</Button>
							))}
						</div>
					</div>

					{/* Inspector — hidden on Schedule, same as the original */}
					{inspectorOpen ? (
						<Card className="wwc:flex wwc:w-52 wwc:shrink-0 wwc:flex-col wwc:gap-1.5 wwc:p-2">
							<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-1">
								<span className="wwc:truncate wwc:text-[11px] wwc:font-semibold">
									{objectSel ? objectSel.label : selectedFloor?.name}
								</span>
								<Button
									variant="ghost"
									size="sm"
									className="wwc:h-5 wwc:px-1 wwc:text-[10px]"
									onClick={() => {
										setObjectSel(null);
										setSelectedFloorId(null);
									}}
								>
									Close
								</Button>
							</div>
							<Separator />
							<dl className="wwc:grid wwc:grid-cols-2 wwc:gap-x-2 wwc:gap-y-1 wwc:text-[10px]">
								{(objectSel
									? [
											["Category", objectSel.category],
											["Storey", getFloor(objectSel.floorId)?.name ?? "—"],
											["Id", objectSel.id],
										]
									: [
											["Elevation", selectedFloor?.elevation ?? "—"],
											["Objects", String(selectedFloor?.objects ?? 0)],
											["Crew", String(selectedFloor?.workers ?? 0)],
										]
								).map(([k, v]) => (
									<React.Fragment key={k}>
										<dt className="wwc:text-muted-foreground">{k}</dt>
										<dd className="wwc:truncate wwc:text-right wwc:font-medium wwc:tabular-nums">{v}</dd>
									</React.Fragment>
								))}
							</dl>
							{selectedFloor ? (
								<div className="wwc:mt-0.5 wwc:flex wwc:items-center wwc:gap-1.5">
									<Progress value={selectedFloor.progress} className="wwc:h-1 wwc:flex-1" />
									<span className="wwc:text-[10px] wwc:tabular-nums wwc:text-muted-foreground">
										{selectedFloor.progress}%
									</span>
								</div>
							) : null}
						</Card>
					) : null}
				</div>

				{/* Timeline strip */}
				<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:rounded-md wwc:border wwc:border-border wwc:bg-card wwc:px-2 wwc:py-1.5">
					<Button
						variant={playing ? "secondary" : "default"}
						size="sm"
						className="wwc:h-6 wwc:w-14 wwc:px-2 wwc:text-[11px]"
						disabled={show4D && !timelineReady}
						onClick={() => {
							if (!show4D) {
								startTimelineAtDay(day);
								return;
							}
							setPlaying((p) => !p);
						}}
					>
						{playing ? "Pause" : "Play"}
					</Button>
					<span className="wwc:w-16 wwc:shrink-0 wwc:text-[11px] wwc:tabular-nums wwc:text-muted-foreground">
						{dayLabel(day)}
					</span>
					<Slider
						value={[day]}
						min={1}
						max={TOTAL_DAYS}
						step={1}
						disabled={show4D && !timelineReady}
						onValueChange={(v: number[]) => {
							setPlaying(false);
							setDay(v[0] ?? 1);
						}}
						className="wwc:flex-1"
						aria-label="Schedule day"
					/>
					<Badge variant="outline" className="wwc:h-5 wwc:shrink-0 wwc:px-1.5 wwc:text-[10px] wwc:tabular-nums">
						{buildProgress}% built
					</Badge>
					<span className="wwc:hidden wwc:shrink-0 wwc:truncate wwc:text-[10px] wwc:text-muted-foreground wwc:md:inline">
						{activeTasks.length ? activeTasks.map((t) => t.name).join(" · ") : "No active tasks"}
					</span>
				</div>
			</div>
		);
	},
);
StageContent.displayName = "StageContent";

export {StageContent};
