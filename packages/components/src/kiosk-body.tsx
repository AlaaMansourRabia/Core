import {cn} from "@corensystem/core-utils";
import * as React from "react";

import {Badge} from "./badge";
import {Button} from "./button";
import {Card, CardContent, CardHeader, CardTitle} from "./card";
import {Progress} from "./progress";
import {Separator} from "./separator";
import {Skeleton} from "./skeleton";

/* ---------------------------------- types --------------------------------- */

type TaskStatus = "done" | "active" | "upcoming";

type Task = {
	id: string;
	name: string;
	trade: string;
	status: TaskStatus;
	progress: number;
	crew: number;
};

type Milestone = {
	id: string;
	label: string;
	date: string;
	hit: boolean;
};

type Week = {
	label: string;
	range: string;
	progress: number;
	tasks: Task[];
	milestones: Milestone[];
};

type Phase = "overview" | "tasks";

/* ------------------------------- mock schedule ------------------------------ */

const WEEK: Week = {
	label: "Week 14",
	range: "12 Aug – 18 Aug",
	progress: 62,
	tasks: [
		{id: "t1", name: "Foundation & Raft Slab", trade: "Civil", status: "done", progress: 100, crew: 12},
		{id: "t2", name: "Blockwork — Ground Floor", trade: "Masonry", status: "done", progress: 100, crew: 9},
		{id: "t3", name: "Column & Beam Casting", trade: "Civil", status: "active", progress: 74, crew: 16},
		{id: "t4", name: "MEP First Fix", trade: "MEP", status: "active", progress: 41, crew: 8},
		{id: "t5", name: "Roof Slab Shuttering", trade: "Formwork", status: "active", progress: 18, crew: 11},
		{id: "t6", name: "External Plaster", trade: "Finishes", status: "upcoming", progress: 0, crew: 0},
		{id: "t7", name: "Joinery & Doors", trade: "Finishes", status: "upcoming", progress: 0, crew: 0},
	],
	milestones: [
		{id: "m1", label: "Substructure Signed Off", date: "02 Aug", hit: true},
		{id: "m2", label: "Superstructure Topped Out", date: "21 Aug", hit: false},
		{id: "m3", label: "Handover to Fit-Out", date: "09 Sep", hit: false},
	],
};

const TRADE_TONE: Record<string, string> = {
	Civil: "wwc:bg-primary",
	Masonry: "wwc:bg-chart-2",
	MEP: "wwc:bg-chart-3",
	Formwork: "wwc:bg-chart-4",
	Finishes: "wwc:bg-chart-5",
};

/* -------------------------------- props ----------------------------------- */

export interface KioskBodyProps extends React.HTMLAttributes<HTMLDivElement> {
	/** The villa currently on stage; `null` while the kiosk selects the next one. */
	house?: string | null;
	/** Called when the kiosk finishes walking the active tasks and should advance to the next villa. */
	onAdvanceHouse?: () => void;
}

/* -------------------------------- component -------------------------------- */

/** Always-on TV kiosk panel that auto-advances through a villa's weekly overview and active tasks. */
const KioskBody = React.forwardRef<HTMLDivElement, KioskBodyProps>(
	({house = "Villa 12 — Cluster B", onAdvanceHouse = () => {}, className, ...props}, ref) => {
		const week = React.useMemo(() => WEEK, []);
		const activeTasks = React.useMemo(() => week.tasks.filter((t) => t.status === "active"), [week]);

		// Mirrors the original viewer lifecycle: resolved (element groups sliced) → modelShown (grid hidden).
		const [resolved, setResolved] = React.useState(false);
		const [modelShown, setModelShown] = React.useState(false);

		const [phase, setPhase] = React.useState<Phase>("overview");
		const [taskStep, setTaskStep] = React.useState(-1); // -1 = every active task lit at once

		// Keep the advance callback in a ref so the engine effect doesn't re-run when the parent re-renders.
		const onAdvanceRef = React.useRef(onAdvanceHouse);
		onAdvanceRef.current = onAdvanceHouse;

		React.useEffect(() => {
			let cancelled = false;
			const a = window.setTimeout(() => {
				if (!cancelled) setResolved(true);
			}, 700);
			const b = window.setTimeout(() => {
				if (!cancelled) setModelShown(true);
			}, 1100);
			return () => {
				cancelled = true;
				window.clearTimeout(a);
				window.clearTimeout(b);
			};
		}, []);

		// Kiosk engine: hold on the overview, then walk the active tasks one by one, then advance the house.
		React.useEffect(() => {
			if (!modelShown) return;
			let cancelled = false;
			const timers: number[] = [];
			const at = (ms: number, fn: () => void) => {
				timers.push(
					window.setTimeout(() => {
						if (!cancelled) fn();
					}, ms),
				);
			};

			let t = 0;
			setPhase("overview");
			setTaskStep(-1);
			at((t += 5000), () => setPhase("tasks"));
			activeTasks.forEach((_, i) => {
				at((t += 4000), () => setTaskStep(i));
			});
			at((t += 4000), () => {
				setPhase("overview");
				setTaskStep(-1);
				onAdvanceRef.current();
			});

			return () => {
				cancelled = true;
				timers.forEach(window.clearTimeout);
			};
		}, [modelShown, activeTasks, house]);

		const highlighted = React.useCallback(
			(task: Task) => {
				if (task.status !== "active") return false;
				if (phase === "overview" || taskStep < 0) return true;
				return activeTasks[taskStep]?.id === task.id;
			},
			[phase, taskStep, activeTasks],
		);

		const focused = phase === "tasks" && taskStep >= 0 ? activeTasks[taskStep] : null;

		return (
			<section
				ref={ref}
				className={cn(
					"wwc:flex wwc:h-full wwc:min-h-0 wwc:w-full wwc:flex-col wwc:gap-4 wwc:bg-background wwc:p-6 wwc:text-foreground wwc:lg:flex-row",
					className,
				)}
				{...props}
			>
				{/* ------------------------------- viewer ------------------------------- */}
				<div className="wwc:relative wwc:flex wwc:min-h-96 wwc:flex-1 wwc:overflow-hidden wwc:rounded-xl wwc:border wwc:border-border wwc:bg-card">
					<div className="wwc:absolute wwc:inset-x-0 wwc:top-0 wwc:z-20 wwc:flex wwc:items-start wwc:justify-between wwc:gap-3 wwc:p-4">
						<div className="wwc:flex wwc:flex-col wwc:gap-1">
							<span className="wwc:text-xs wwc:font-medium wwc:uppercase wwc:tracking-widest wwc:text-muted-foreground">
								Now showing
							</span>
							<h2 className="wwc:text-2xl wwc:font-semibold wwc:leading-tight wwc:tracking-tight">
								{house ?? "Selecting next villa…"}
							</h2>
						</div>
						<Badge variant={phase === "tasks" ? "default" : "secondary"} className="wwc:shrink-0">
							{phase === "tasks" ? "Task walkthrough" : "Weekly overview"}
						</Badge>
					</div>

					{/* model stage — clean background, ground grid hidden */}
					<div
						className={cn(
							"wwc:absolute wwc:inset-0 wwc:flex wwc:items-center wwc:justify-center wwc:transition-opacity wwc:duration-700",
							modelShown ? "wwc:opacity-100" : "wwc:opacity-0",
						)}
					>
						<div
							className={cn(
								"wwc:relative wwc:aspect-[4/3] wwc:w-3/5 wwc:max-w-lg wwc:rounded-lg wwc:border wwc:border-border wwc:bg-muted/40 wwc:transition-transform wwc:duration-700",
								focused ? "wwc:scale-110" : "wwc:scale-100",
							)}
						>
							<div className="wwc:absolute wwc:inset-x-6 wwc:bottom-6 wwc:top-1/2 wwc:rounded-md wwc:bg-muted" />
							<div className="wwc:absolute wwc:inset-x-12 wwc:bottom-1/2 wwc:top-10 wwc:rounded-md wwc:bg-muted/70" />
							{activeTasks.map((task, i) => (
								<span
									key={task.id}
									className={cn(
										"wwc:absolute wwc:size-6 wwc:rounded-full wwc:ring-4 wwc:ring-background wwc:transition-all wwc:duration-500",
										TRADE_TONE[task.trade] ?? "wwc:bg-primary",
										highlighted(task) ? "wwc:opacity-100 wwc:scale-100" : "wwc:opacity-20 wwc:scale-75",
									)}
									style={{left: `${18 + i * 26}%`, top: `${34 + (i % 2) * 24}%`}}
								/>
							))}
						</div>
					</div>

					{!modelShown && (
						<div className="wwc:absolute wwc:inset-0 wwc:z-10 wwc:flex wwc:flex-col wwc:items-center wwc:justify-center wwc:gap-3">
							<Skeleton className="wwc:h-40 wwc:w-2/5 wwc:rounded-lg" />
							<span className="wwc:text-sm wwc:text-muted-foreground">
								{resolved ? "Preparing view…" : "Loading model elements…"}
							</span>
						</div>
					)}

					{focused && (
						<div className="wwc:absolute wwc:inset-x-4 wwc:bottom-4 wwc:z-20 wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card/95 wwc:p-4 wwc:shadow-sm wwc:backdrop-blur">
							<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-3">
								<div className="wwc:flex wwc:items-center wwc:gap-3">
									<span className={cn("wwc:size-3 wwc:rounded-full", TRADE_TONE[focused.trade] ?? "wwc:bg-primary")} />
									<span className="wwc:text-base wwc:font-medium">{focused.name}</span>
									<Badge variant="outline">{focused.trade}</Badge>
								</div>
								<span className="wwc:text-sm wwc:text-muted-foreground">{focused.crew} crew on site</span>
							</div>
							<Progress value={focused.progress} className="wwc:mt-3" />
						</div>
					)}
				</div>

				{/* ------------------------------- side rail ----------------------------- */}
				<div className="wwc:flex wwc:w-full wwc:flex-col wwc:gap-4 wwc:lg:w-96 wwc:lg:shrink-0">
					<Card>
						<CardHeader>
							<CardTitle className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2">
								<span>{week.label}</span>
								<span className="wwc:text-sm wwc:font-normal wwc:text-muted-foreground">{week.range}</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="wwc:flex wwc:flex-col wwc:gap-3">
							<div className="wwc:flex wwc:items-baseline wwc:justify-between">
								<span className="wwc:text-sm wwc:text-muted-foreground">Planned completion</span>
								<span className="wwc:text-2xl wwc:font-semibold wwc:tabular-nums">{week.progress}%</span>
							</div>
							<Progress value={week.progress} />
							<div className="wwc:flex wwc:items-center wwc:gap-4 wwc:text-sm wwc:text-muted-foreground">
								<span>{week.tasks.filter((t) => t.status === "done").length} done</span>
								<span>{activeTasks.length} active</span>
								<span>{week.tasks.filter((t) => t.status === "upcoming").length} upcoming</span>
							</div>
						</CardContent>
					</Card>

					<Card className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col">
						<CardHeader>
							<CardTitle>This week&apos;s activities</CardTitle>
						</CardHeader>
						<CardContent className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:gap-2 wwc:overflow-y-auto">
							{week.tasks.map((task) => (
								<div
									key={task.id}
									className={cn(
										"wwc:flex wwc:flex-col wwc:gap-2 wwc:rounded-lg wwc:border wwc:p-3 wwc:transition-colors",
										highlighted(task) ? "wwc:border-primary wwc:bg-accent" : "wwc:border-border wwc:bg-transparent",
										task.status === "upcoming" && "wwc:opacity-60",
									)}
								>
									<div className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-2">
										<div className="wwc:flex wwc:items-center wwc:gap-2">
											<span
												className={cn("wwc:size-2.5 wwc:rounded-full", TRADE_TONE[task.trade] ?? "wwc:bg-primary")}
											/>
											<span className="wwc:text-sm wwc:font-medium wwc:leading-snug">{task.name}</span>
										</div>
										<Badge
											variant={task.status === "done" ? "secondary" : task.status === "active" ? "default" : "outline"}
											className="wwc:shrink-0"
										>
											{task.status === "done" ? "Done" : task.status === "active" ? "Active" : "Upcoming"}
										</Badge>
									</div>
									<div className="wwc:flex wwc:items-center wwc:gap-3">
										<Progress value={task.progress} className="wwc:flex-1" />
										<span className="wwc:w-10 wwc:shrink-0 wwc:text-right wwc:text-xs wwc:tabular-nums wwc:text-muted-foreground">
											{task.progress}%
										</span>
									</div>
								</div>
							))}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Milestones</CardTitle>
						</CardHeader>
						<CardContent className="wwc:flex wwc:flex-col wwc:gap-3">
							{week.milestones.map((m, i) => (
								<div key={m.id} className="wwc:flex wwc:flex-col wwc:gap-3">
									{i > 0 && <Separator />}
									<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2">
										<div className="wwc:flex wwc:items-center wwc:gap-2">
											<span
												className={cn(
													"wwc:size-2.5 wwc:rounded-full",
													m.hit ? "wwc:bg-primary" : "wwc:bg-muted-foreground/40",
												)}
											/>
											<span className={cn("wwc:text-sm", m.hit ? "wwc:text-foreground" : "wwc:text-muted-foreground")}>
												{m.label}
											</span>
										</div>
										<span className="wwc:text-xs wwc:tabular-nums wwc:text-muted-foreground">{m.date}</span>
									</div>
								</div>
							))}
						</CardContent>
					</Card>

					<div className="wwc:flex wwc:items-center wwc:gap-2">
						<Button
							variant="outline"
							className="wwc:flex-1"
							onClick={() => {
								setPhase((p) => (p === "overview" ? "tasks" : "overview"));
								setTaskStep(-1);
							}}
						>
							{phase === "overview" ? "Walk tasks" : "Back to overview"}
						</Button>
						<Button
							className="wwc:flex-1"
							onClick={() => {
								setPhase("overview");
								setTaskStep(-1);
								onAdvanceRef.current();
							}}
						>
							Next villa
						</Button>
					</div>
				</div>
			</section>
		);
	},
);
KioskBody.displayName = "KioskBody";

export {KioskBody};
