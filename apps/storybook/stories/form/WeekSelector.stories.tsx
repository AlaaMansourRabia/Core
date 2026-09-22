import type {Meta, StoryObj} from "storybook/internal/types";

import {WeekSelector, type WeekSelectorWeek} from "@core/core-ui/week-selector";
import {addDays, getISOWeek, startOfWeek} from "date-fns";
import {useMemo, useState} from "react";

function buildWeeks(count: number): WeekSelectorWeek[] {
	const first = startOfWeek(new Date(2026, 3, 20), {weekStartsOn: 1});
	return Array.from({length: count}, (_, i) => {
		const start = addDays(first, i * 7);
		const end = addDays(start, 6);
		return {value: `W${getISOWeek(start)}`, start, end};
	});
}

const meta = {
	title: "Components/Forms/Week Selector",
	component: WeekSelector,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"A compact week picker: a clickable date-range label that opens a calendar to jump to any week, previous / next chevrons to page the visible weeks, and a segmented row of week tabs (built on the shared `Tabs` component). Controlled or uncontrolled via `value` / `defaultValue`.",
			},
		},
	},
} satisfies Meta<typeof WeekSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

// Full interactive example: the chevrons step the selected week (kept centered in the tabs), and the
// calendar jumps to whichever week contains the picked date.
export const Default: Story = {
	render: () => {
		const weeks = useMemo(() => buildWeeks(20), []);
		const [selected, setSelected] = useState(weeks[Math.floor(weeks.length / 2)]?.value);

		const jumpToDate = (date: Date) => {
			const week = weeks.find((w) => date >= w.start && date <= w.end);
			if (week) setSelected(week.value);
		};

		return (
			<div className="wwc:max-w-3xl">
				<WeekSelector weeks={weeks} value={selected} onValueChange={setSelected} onDateSelect={jumpToDate} />
			</div>
		);
	},
};

// Uncontrolled — the component manages its own selection, centered on the middle week.
export const Uncontrolled: Story = {
	render: () => (
		<div className="wwc:max-w-3xl">
			<WeekSelector weeks={buildWeeks(20)} />
		</div>
	),
};

// Bare — drops the default outer container (border, background, rounding, padding) so the control
// sits flush inside a toolbar or app bar. The inner layout is unchanged.
export const Bare: Story = {
	render: () => (
		<div className="wwc:max-w-3xl">
			<WeekSelector weeks={buildWeeks(20)} bare />
		</div>
	),
};
