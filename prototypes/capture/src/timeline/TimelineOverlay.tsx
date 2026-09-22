import type {ReactElement} from "react";
import type {TimelineControls, TimelineState} from "./types";

import {Badge} from "@core/core-ui/badge";
import {Button} from "@core/core-ui/button";
import {Progress} from "@core/core-ui/progress";
import {Separator} from "@core/core-ui/separator";
import {Slider} from "@core/core-ui/slider";
import {HoverTooltip} from "@core/core-ui/tooltip";
import {ToggleGroup, ToggleGroupItem} from "@core/core-ui/toggle-group";
import {ChevronLeft, ChevronRight, Loader2, Pause, Play, Rotate3d, SkipBack, SkipForward, X} from "lucide-react";

import {TRADE_BY_KEY} from "./trades";
import {formatDate} from "./types";

// Playback speeds offered by the segmented control (schedule days advanced per real second).
const SPEED_OPTIONS: {value: number; label: string}[] = [
	{value: 3, label: "3d/s"},
	{value: 7, label: "1wk/s"},
	{value: 14, label: "2wk/s"},
	{value: 30, label: "1mo/s"},
];

// A milestone that names the structural "topping out" gets a louder tick + badge than the rest.
function isToppingOut(name: string): boolean {
	return name.trim().toUpperCase().startsWith("TOPPING OUT");
}

/**
 * Presentational 4D construction-timeline scrubber. Receives the resolved {@link TimelineState}
 * and the {@link TimelineControls} that drive playback — it does no BIM/3D work of its own. The
 * parent is expected to wrap this in an absolutely-positioned container (bottom-center of the viewer).
 */
export function TimelineOverlay({
	state,
	controls,
	onClose,
}: {
	state: TimelineState;
	controls: TimelineControls;
	onClose?: () => void;
}): ReactElement | null {
	if (!state.schedule) return null;

	const {schedule, totalDays, currentDay, progress} = state;
	const currentDayInt = Math.round(currentDay);
	const percent = Math.round(progress * 100);
	const project = schedule.meta.project;

	// Milestone ticks are positioned as a fraction of the full track width.
	const milestones = schedule.milestones;

	// "Now on site" summary line.
	const summary = (() => {
		if (state.loading) return "Resolving model…";
		if (currentDayInt <= 0) return "Not started";
		if (state.activeObjects.length === 0 && progress >= 1) return "Building complete ✔";
		if (state.activeObjects.length === 0) return "No active work";
		const labels = state.activeObjects.slice(0, 3).map((o) => o.label);
		const extra = state.activeObjects.length - labels.length;
		return `${state.activeObjects.length} objects being worked · ${labels.join(", ")}${extra > 0 ? ` +${extra} more` : ""}`;
	})();

	return (
		<div className="wwc:relative wwc:w-[860px] wwc:max-w-[calc(100vw-2rem)] wwc:rounded-xl wwc:border wwc:bg-background/95 wwc:p-4 wwc:text-foreground wwc:shadow-lg wwc:backdrop-blur">
			{/* Close */}
			<Button
				variant="ghost"
				size="sm"
				icon
				tooltip="Close timeline"
				onClick={() => onClose?.()}
				className="wwc:absolute wwc:right-2 wwc:top-2 wwc:text-muted-foreground"
				aria-label="Close timeline"
			>
				<X />
			</Button>

			{/* Header row: transport · date readout · speed */}
			<div className="wwc:flex wwc:items-center wwc:gap-4">
				{/* Transport controls */}
				<div className="wwc:flex wwc:items-center wwc:gap-1">
					<Button
						variant="ghost"
						size="sm"
						icon
						tooltip="Reset to start"
						onClick={() => controls.reset()}
						aria-label="Reset to start"
					>
						<SkipBack />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						icon
						tooltip="Step back one day"
						onClick={() => controls.stepDays(-1)}
						aria-label="Step back one day"
					>
						<ChevronLeft />
					</Button>
					<Button
						variant="default"
						size="lg"
						icon
						tooltip={state.playing ? "Pause" : "Play"}
						onClick={() => controls.toggle()}
						aria-label={state.playing ? "Pause" : "Play"}
					>
						{state.playing ? <Pause /> : <Play />}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						icon
						tooltip="Step forward one day"
						onClick={() => controls.stepDays(1)}
						aria-label="Step forward one day"
					>
						<ChevronRight />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						icon
						tooltip="Skip to end"
						onClick={() => controls.jumpToEnd()}
						aria-label="Skip to end"
					>
						<SkipForward />
					</Button>
					<Button
						variant={state.autoRotate ? "secondary" : "ghost"}
						size="sm"
						icon
						tooltip={state.autoRotate ? "Auto-rotate on (orbits while playing)" : "Auto-rotate off"}
						onClick={() => controls.toggleAutoRotate()}
						aria-label="Toggle auto-rotate"
						aria-pressed={state.autoRotate}
						className={state.autoRotate ? "wwc:text-primary" : "wwc:text-muted-foreground"}
					>
						<Rotate3d />
					</Button>
				</div>

				<Separator orientation="vertical" className="wwc:h-10" />

				{/* Date readout */}
				<div className="wwc:min-w-0 wwc:flex-1">
					<div className="wwc:flex wwc:items-baseline wwc:gap-2">
						<span className="wwc:text-xl wwc:font-semibold wwc:tabular-nums wwc:leading-none">
							{formatDate(state.currentDate)}
						</span>
						{state.loading && <Loader2 className="wwc:size-4 wwc:animate-spin wwc:text-muted-foreground" />}
					</div>
					<div className="wwc:mt-1 wwc:flex wwc:items-center wwc:gap-2 wwc:text-xs wwc:text-muted-foreground">
						<span className="wwc:tabular-nums">
							Day {currentDayInt} of {totalDays}
						</span>
						<span className="wwc:text-muted-foreground/50">·</span>
						<span className="wwc:truncate">{project}</span>
					</div>
				</div>

				{/* Speed control */}
				<div className="wwc:flex wwc:flex-col wwc:items-end wwc:gap-1">
					<span className="wwc:text-[10px] wwc:font-medium wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
						Speed
					</span>
					<ToggleGroup
						type="single"
						variant="outline"
						size="sm"
						value={String(state.speed)}
						onValueChange={(value) => {
							if (value) controls.setSpeed(Number(value));
						}}
					>
						{SPEED_OPTIONS.map((opt) => (
							<ToggleGroupItem key={opt.value} value={String(opt.value)} aria-label={`${opt.label} playback`}>
								{opt.label}
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				</div>
			</div>

			{/* Scrubber with milestone ticks */}
			<div className="wwc:relative wwc:mt-4 wwc:px-1">
				<Slider
					min={0}
					max={totalDays}
					step={1}
					value={[Math.min(Math.max(currentDay, 0), totalDays)]}
					onValueChange={([day]) => controls.seek(day)}
					aria-label="Timeline scrubber"
				/>
				{/* Milestone ticks, overlaid on the track. pointer-events-none so they never block the thumb;
				    each label re-enables pointer events for its own tooltip. */}
				<div className="wwc:pointer-events-none wwc:absolute wwc:inset-x-1 wwc:top-1/2 wwc:h-0">
					{milestones.map((m) => {
						const left = totalDays > 0 ? (m.day / totalDays) * 100 : 0;
						const topping = isToppingOut(m.name);
						return (
							<HoverTooltip
								key={m.id}
								content={
									<span>
										<span className="wwc:font-semibold">{m.name}</span>
										<br />
										{formatDate(m.date)}
									</span>
								}
							>
								<span
									className="wwc:pointer-events-auto wwc:absolute wwc:-translate-x-1/2 wwc:-translate-y-1/2 wwc:cursor-help"
									style={{left: `${left}%`}}
								>
									<span
										className={
											topping
												? "wwc:block wwc:h-4 wwc:w-1 wwc:rounded-full wwc:bg-primary wwc:shadow"
												: "wwc:block wwc:h-2.5 wwc:w-0.5 wwc:rounded-full wwc:bg-foreground/40"
										}
									/>
								</span>
							</HoverTooltip>
						);
					})}
				</div>
			</div>

			{/* Progress + element counts */}
			<div className="wwc:mt-4 wwc:flex wwc:items-center wwc:gap-4">
				<div className="wwc:flex wwc:items-baseline wwc:gap-1.5">
					<span className="wwc:text-lg wwc:font-semibold wwc:tabular-nums wwc:text-primary">{percent}%</span>
					<span className="wwc:text-xs wwc:text-muted-foreground">built</span>
				</div>
				<div className="wwc:flex-1">
					<Progress value={percent} tone={percent >= 100 ? "success" : "primary"} />
				</div>
				<span className="wwc:text-xs wwc:tabular-nums wwc:text-muted-foreground">
					{state.builtElements.toLocaleString()} / {state.totalElements.toLocaleString()} elements
				</span>
			</div>

			<Separator className="wwc:my-3" />

			{/* "Now on site" strip */}
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<span className="wwc:text-[10px] wwc:font-medium wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
					Now on site
				</span>
				<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1">
					{state.activeTrades.length > 0 ? (
						state.activeTrades.map((key) => {
							const tr = TRADE_BY_KEY.get(key);
							if (!tr) return null;
							return (
								<span
									key={key}
									className="wwc:inline-flex wwc:items-center wwc:gap-1.5 wwc:rounded-full wwc:border wwc:px-2 wwc:py-0.5 wwc:text-xs wwc:font-medium"
									style={{borderColor: tr.color, color: tr.color, backgroundColor: `${tr.color}1a`}}
								>
									<span className="wwc:size-2 wwc:rounded-full" style={{backgroundColor: tr.color}} />
									{tr.label}
								</span>
							);
						})
					) : (
						<Badge variant="outline">{currentDayInt <= 0 ? "Not started" : "Idle"}</Badge>
					)}
				</div>
				<span className="wwc:ml-auto wwc:truncate wwc:text-xs wwc:text-muted-foreground">{summary}</span>
			</div>

			{/* Error state */}
			{state.error && (
				<p className="wwc:mt-2 wwc:text-xs wwc:font-medium wwc:text-destructive">{state.error}</p>
			)}
		</div>
	);
}
