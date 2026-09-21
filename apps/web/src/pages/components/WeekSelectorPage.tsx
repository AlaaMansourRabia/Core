import {addDays, getISOWeek, startOfWeek} from "date-fns";
import {useMemo, useState} from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {WeekSelector, type WeekSelectorWeek} from "@/components/ui/week-selector";

// Build a run of ISO weeks around a base date so the tabs read like "W110 … W114".
function buildWeeks(count: number): WeekSelectorWeek[] {
	const first = startOfWeek(new Date(2026, 3, 20), {weekStartsOn: 1}); // a Monday
	return Array.from({length: count}, (_, i) => {
		const start = addDays(first, i * 7);
		const end = addDays(start, 6);
		return {value: `W${getISOWeek(start)}`, start, end};
	});
}

export function WeekSelectorPage() {
	const weeks = useMemo(() => buildWeeks(20), []);
	// Start on the latest (last) week — the most recent available.
	const [selected, setSelected] = useState(weeks[weeks.length - 1]?.value);

	const jumpToDate = (date: Date) => {
		const week = weeks.find((w) => date >= w.start && date <= w.end);
		if (week) setSelected(week.value);
	};

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Week Selector</h1>
					<CopyButton
						value="Week Selector"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2 wwc:max-w-2xl">
					A compact week picker: click the date range to open a calendar and jump to any week, or step weeks with the
					chevrons. It shows three week tabs at a time and starts on the latest week; the visible window follows the
					selection. The tabs are built on the shared{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">Tabs</code> component.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Interactive</CardTitle>
						<CopyButton
							value="Week Selector - Interactive"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Click the date to open the calendar, step weeks with the chevrons, or select a week tab.
					</CardDescription>
				</CardHeader>
				<CardContent className="wwc:space-y-3">
					<WeekSelector weeks={weeks} value={selected} onValueChange={setSelected} onDateSelect={jumpToDate} />
					<p className="wwc:font-mono wwc:text-xs wwc:text-muted-foreground">selected: {selected}</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Bare</CardTitle>
						<CopyButton
							value="Week Selector - Bare"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						With <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">bare</code>, the outer container
						(border, background, rounding, and padding) is dropped so the control sits flush inside a toolbar or app
						bar. The inner layout is unchanged.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<WeekSelector weeks={weeks} value={selected} onValueChange={setSelected} onDateSelect={jumpToDate} bare />
				</CardContent>
			</Card>
		</div>
	);
}
