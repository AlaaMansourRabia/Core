import type {Meta, StoryObj} from "storybook/internal/types";

import {
	TimelineRangeSelector,
	type TimelineDay,
	type TimelinePeriod,
} from "@corensystem/coren-ui/timeline-range-selector";
import {useState} from "react";

// One year of daily activity ending on a fixed date, with a wavy count so bars vary in height.
function makeYear(): TimelineDay[] {
	const end = new Date(2025, 5, 30);
	const days: TimelineDay[] = [];
	for (let i = 364; i >= 0; i--) {
		const date = new Date(end.getFullYear(), end.getMonth(), end.getDate() - i);
		const wave = Math.sin(i / 9) * 0.5 + 0.5;
		const count = Math.round(wave * 18) + (i % 7 === 0 ? 6 : 0);
		days.push({date, count});
	}
	return days;
}

const DATA = makeYear();

const meta = {
	title: "Components/Data Display/Timeline Range Selector",
	component: TimelineRangeSelector,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"A compact, embeddable timeline that selects a date range via draggable handles over a visual day strip. Drag either edge to change the range (handles snap to day boundaries and cannot cross), and use the period dropdown to change the visible timespan. `bar` sizes each day by its `count`; `dot` renders a uniform circle per day.",
			},
		},
	},
	argTypes: {
		variant: {control: "inline-radio", options: ["bar", "dot"]},
		period: {control: "inline-radio", options: ["all", "1y", "3m", "1m"]},
		title: {control: "text"},
	},
	args: {
		data: DATA,
		variant: "bar",
		period: "3m",
		title: "Activity Timeline",
	},
	render: (args) => (
		<div className="wwc:w-[36rem] wwc:max-w-full">
			<TimelineRangeSelector {...args} />
		</div>
	),
} satisfies Meta<typeof TimelineRangeSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Bar: Story = {
	args: {variant: "bar"},
};

export const Dot: Story = {
	args: {variant: "dot", title: "Sessions"},
};

export const AllTime: Story = {
	args: {period: "all"},
};

export const OneMonth: Story = {
	args: {period: "1m", variant: "dot"},
};

// Fully controlled: period resets the range; dragging a handle updates it live.
export const Controlled: Story = {
	render: (args) => {
		const [period, setPeriod] = useState<TimelinePeriod>("3m");
		const [range, setRange] = useState<[Date, Date] | undefined>(undefined);
		const fmt = (d: Date) => d.toLocaleDateString(undefined, {month: "short", day: "numeric"});
		return (
			<div className="wwc:w-[36rem] wwc:max-w-full wwc:space-y-3">
				<TimelineRangeSelector
					{...args}
					period={period}
					onPeriodChange={(p) => {
						setPeriod(p);
						setRange(undefined);
					}}
					selectedRange={range}
					onRangeChange={setRange}
				/>
				<p className="wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
					period: {period} · range: {range ? `${fmt(range[0])} → ${fmt(range[1])}` : "full window"}
				</p>
			</div>
		);
	},
};
