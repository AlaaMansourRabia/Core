// Left-hand per-floor construction progress, driven live by the 4D timeline. Each storey shows a
// progress bar (built elements + the time-fraction of elements under construction) that climbs as
// the timeline is scrubbed/played. Floors are listed top → ground, mirroring the building.

import type {TimelineState} from "./types";

import {Badge} from "@core/core-ui/badge";
import {Progress} from "@core/core-ui/progress";

import {TRADE_BY_KEY} from "./trades";

const STATE_BADGE: Record<string, {label: string; variant: "secondary" | "outline"; cls: string}> = {
	built: {label: "Done", variant: "secondary", cls: "wwc:text-green-600 wwc:dark:text-green-400"},
	active: {label: "Building", variant: "secondary", cls: "wwc:text-primary"},
	pending: {label: "—", variant: "outline", cls: "wwc:text-muted-foreground"},
};

export function FloorProgressPanel({state}: {state: TimelineState}) {
	if (!state.schedule) return null;
	const overall = Math.round(state.progress * 100);
	return (
		<div className="wwc:w-[236px] wwc:rounded-xl wwc:border wwc:bg-background/95 wwc:p-3 wwc:shadow-lg wwc:backdrop-blur">
			<div className="wwc:mb-2.5 wwc:flex wwc:items-baseline wwc:justify-between">
				<span className="wwc:text-sm wwc:font-semibold">Floor progress</span>
				<span className="wwc:text-xs wwc:font-medium wwc:tabular-nums wwc:text-muted-foreground">{overall}%</span>
			</div>

			{state.loading && <p className="wwc:text-xs wwc:text-muted-foreground">Resolving model…</p>}

			<div className="wwc:flex wwc:flex-col wwc:gap-1">
				{state.floors.map((f) => {
					const pct = Math.round(f.progress * 100);
					const badge = STATE_BADGE[f.state];
					return (
						<div
							key={f.storey}
							className={`wwc:rounded-lg wwc:px-2 wwc:py-1.5 wwc:transition-colors ${
								f.state === "active" ? "wwc:bg-primary/10 wwc:ring-1 wwc:ring-primary/25" : ""
							}`}
						>
							<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2">
								<span className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-1.5">
									<span className="wwc:truncate wwc:text-xs wwc:font-medium">{f.storey}</span>
									<span className="wwc:shrink-0 wwc:text-[10px] wwc:tabular-nums wwc:text-muted-foreground">
										{f.elevation.toFixed(1)}m
									</span>
								</span>
								<span className="wwc:shrink-0 wwc:text-[11px] wwc:font-medium wwc:tabular-nums">{pct}%</span>
							</div>
							<Progress
								value={pct}
								tone={f.state === "built" ? "success" : "primary"}
								className="wwc:mt-1 wwc:h-1.5"
							/>
							<div className="wwc:mt-1 wwc:flex wwc:items-center wwc:justify-between">
								<span className="wwc:flex wwc:items-center wwc:gap-1.5">
									<span className={`wwc:text-[10px] wwc:font-medium ${badge.cls}`}>
										{f.state === "active" && f.activeObjectCount > 0
											? `Building · ${f.activeObjectCount} active`
											: badge.label}
									</span>
									{/* Colour dot per trade currently being worked on this floor. */}
									{f.activeTrades.map((key) => {
										const tr = TRADE_BY_KEY.get(key);
										return tr ? (
											<span
												key={key}
												title={tr.label}
												className="wwc:size-2 wwc:rounded-full"
												style={{backgroundColor: tr.color}}
											/>
										) : null;
									})}
								</span>
								<span className="wwc:text-[10px] wwc:tabular-nums wwc:text-muted-foreground">
									{f.builtElements}/{f.totalElements}
								</span>
							</div>
						</div>
					);
				})}
			</div>
			<Badge variant="outline" className="wwc:mt-2 wwc:w-full wwc:justify-center wwc:text-[10px]">
				{state.builtElements}/{state.totalElements} elements built
			</Badge>
		</div>
	);
}
