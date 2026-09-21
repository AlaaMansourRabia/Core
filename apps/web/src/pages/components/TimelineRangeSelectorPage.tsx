import {useMemo, useState} from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {TimelineRangeSelector, type TimelineDay, type TimelinePeriod} from "@/components/ui/timeline-range-selector";

// One year of daily activity ending "today", with a wavy count so bars vary in height.
function makeYear(): TimelineDay[] {
	const today = new Date();
	const days: TimelineDay[] = [];
	for (let i = 364; i >= 0; i--) {
		const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
		const wave = Math.sin(i / 9) * 0.5 + 0.5;
		const count = Math.round(wave * 18) + (i % 7 === 0 ? 6 : 0);
		days.push({date, count});
	}
	return days;
}

export function TimelineRangeSelectorPage() {
	const data = useMemo(() => makeYear(), []);

	const [barPeriod, setBarPeriod] = useState<TimelinePeriod>("3m");
	const [barRange, setBarRange] = useState<[Date, Date] | undefined>(undefined);

	const [dotPeriod, setDotPeriod] = useState<TimelinePeriod>("1m");
	const [dotRange, setDotRange] = useState<[Date, Date] | undefined>(undefined);

	const fmt = (d: Date) => d.toLocaleDateString(undefined, {month: "short", day: "numeric"});

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Timeline Range Selector</h1>
					<CopyButton
						value="Timeline Range Selector"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2 wwc:max-w-2xl">
					A compact, embeddable timeline for selecting a date range via draggable handles over a visual day strip. Drag
					either edge to change the range (handles snap to day boundaries and cannot cross), and use the period dropdown
					to change the visible timespan.
				</p>
			</div>

			{/* Bar variant */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Bar variant</CardTitle>
						<CopyButton
							value="Timeline Range Selector - Bar"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Each day is a vertical bar whose height reflects its <code className="wwc:text-xs">count</code>. Bars inside
						the selection use the accent color; the rest are muted.
					</CardDescription>
				</CardHeader>
				<CardContent className="wwc:space-y-3">
					<TimelineRangeSelector
						data={data}
						variant="bar"
						title="Activity Timeline"
						period={barPeriod}
						onPeriodChange={(p) => {
							setBarPeriod(p);
							setBarRange(undefined);
						}}
						selectedRange={barRange}
						onRangeChange={setBarRange}
					/>
					<p className="wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
						period: {barPeriod} · range: {barRange ? `${fmt(barRange[0])} → ${fmt(barRange[1])}` : "full window"}
					</p>
				</CardContent>
			</Card>

			{/* Dot variant */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Dot variant</CardTitle>
						<CopyButton
							value="Timeline Range Selector - Dot"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Each day is a uniform dot (no value). Tooltip pills above the edges show the selected start and end dates.
					</CardDescription>
				</CardHeader>
				<CardContent className="wwc:space-y-3">
					<TimelineRangeSelector
						data={data}
						variant="dot"
						title="Sessions"
						period={dotPeriod}
						onPeriodChange={(p) => {
							setDotPeriod(p);
							setDotRange(undefined);
						}}
						selectedRange={dotRange}
						onRangeChange={setDotRange}
					/>
					<p className="wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
						period: {dotPeriod} · range: {dotRange ? `${fmt(dotRange[0])} → ${fmt(dotRange[1])}` : "full window"}
					</p>
				</CardContent>
			</Card>

			{/* API */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Timeline Range Selector - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Prop</th>
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:py-3 wwc:text-left wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{
										prop: "data",
										type: "{ date: Date; count?: number }[]",
										desc: "Day entries to display on the timeline.",
									},
									{
										prop: "period",
										type: '"all" | "1y" | "3m" | "1m"',
										desc: "Visible timespan. Changing it resets to the matching trailing window. Default 3m.",
									},
									{
										prop: "onPeriodChange",
										type: "(period) => void",
										desc: "Fires when a period is picked from the dropdown.",
									},
									{
										prop: "selectedRange",
										type: "[Date, Date]",
										desc: "Selected range (controlled). Defaults to the full visible range.",
									},
									{
										prop: "onRangeChange",
										type: "(range) => void",
										desc: "Fires when a handle is dragged. Snaps to day boundaries.",
									},
									{
										prop: "variant",
										type: '"bar" | "dot"',
										desc: "Bar strip (sized by count) or uniform dot row. Default bar.",
									},
									{prop: "title", type: "string", desc: "Top-left label. Default 'Activity Timeline'."},
								].map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:font-medium wwc:text-primary wwc:whitespace-nowrap">
											{row.prop}
										</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.type}</td>
										<td className="wwc:py-3 wwc:text-muted-foreground">{row.desc}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
