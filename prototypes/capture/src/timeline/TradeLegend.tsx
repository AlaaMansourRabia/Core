// Trade colour legend for the 4D timeline. Lists every trade with its colour swatch; trades that
// are currently being worked (state.activeTrades) are emphasised so it doubles as a live key for
// the trade-coloured elements in the 3D model.

import type {TimelineState} from "./types";

import {TRADES} from "./trades";

export function TradeLegend({state}: {state: TimelineState}) {
	const active = new Set(state.activeTrades);
	return (
		<div className="wwc:w-[210px] wwc:rounded-xl wwc:border wwc:bg-background/95 wwc:p-3 wwc:shadow-lg wwc:backdrop-blur">
			<div className="wwc:mb-2 wwc:flex wwc:items-baseline wwc:justify-between">
				<span className="wwc:text-sm wwc:font-semibold">Trades</span>
				<span className="wwc:text-[10px] wwc:text-muted-foreground">colour = under construction</span>
			</div>
			<ul className="wwc:flex wwc:flex-col wwc:gap-0.5">
				{TRADES.map((tr) => {
					const on = active.has(tr.key);
					return (
						<li
							key={tr.key}
							className={`wwc:flex wwc:items-center wwc:gap-2 wwc:rounded wwc:px-1.5 wwc:py-0.5 wwc:transition-opacity ${
								on ? "" : "wwc:opacity-55"
							}`}
						>
							<span
								className="wwc:size-2.5 wwc:shrink-0 wwc:rounded-sm"
								style={{backgroundColor: tr.color, boxShadow: on ? `0 0 0 2px ${tr.color}44` : undefined}}
							/>
							<span className={`wwc:truncate wwc:text-xs ${on ? "wwc:font-semibold" : "wwc:font-normal"}`}>
								{tr.label}
							</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
