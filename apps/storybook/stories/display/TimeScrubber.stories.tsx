import type {Meta, StoryObj} from "storybook/internal/types";

import {TimeScrubber, type TimeScrubberActivity} from "@wakecap/core-ui/time-scrubber";
import {addMinutes} from "date-fns";
import {useMemo, useState} from "react";

// Fixed day for deterministic Chromatic snapshots.
const DAY_START = new Date(2026, 3, 15, 0, 0, 0);
const DAY_END = new Date(2026, 3, 15, 23, 59, 0);

// A worker-count curve across a day: quiet overnight, ramp at 06:00, peak midday, lunch dip, taper.
function workforceCurve(dayStart: Date): TimeScrubberActivity[] {
	const out: TimeScrubberActivity[] = [];
	for (let m = 0; m <= 24 * 60; m += 20) {
		const h = m / 60;
		let v = 0;
		if (h >= 5.5 && h <= 19) {
			const ramp = Math.min(1, (h - 5.5) / 1.5);
			const taper = Math.min(1, (19 - h) / 2);
			const lunch = h > 12 && h < 13 ? 0.55 : 1;
			v = 3600 * ramp * taper * lunch + 120;
		} else {
			v = 90; // night shift
		}
		out.push({time: addMinutes(dayStart, m), value: Math.round(v)});
	}
	return out;
}

const ACTIVITY = workforceCurve(DAY_START);

function valueAt(t: Date): number {
	let best = ACTIVITY[0];
	for (const a of ACTIVITY)
		if (Math.abs(a.time.getTime() - t.getTime()) < Math.abs(best.time.getTime() - t.getTime())) best = a;
	return best.value;
}

const meta = {
	title: "Components/Data Display/TimeScrubber",
	component: TimeScrubber,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"An intraday playback timeline — drag the playhead to rewind a day. An optional activity band " +
					"shows a value over time (e.g. workers on site) so you can jump to peaks. Controlled via `value` / " +
					"`onValueChange`. Designed to overlay media or a 3D scene.",
			},
		},
	},
} satisfies Meta<typeof TimeScrubber>;

export default meta;
type Story = StoryObj<typeof meta>;

/** barGraph track — a fine bar chart of the value across the day. */
export const BarGraph: Story = {
	render: () => {
		const [value, setValue] = useState(new Date(2026, 3, 15, 12, 0, 0));
		const [playing, setPlaying] = useState(false);
		return (
			<TimeScrubber
				start={DAY_START}
				end={DAY_END}
				variant="barGraph"
				label="Workers"
				data={ACTIVITY}
				value={value}
				onValueChange={setValue}
				playing={playing}
				onPlayingChange={setPlaying}
				sectionLabel="Wed, 15 Apr"
				valueLabel={`${valueAt(value).toLocaleString()} on site`}
			/>
		);
	},
};

/** lineGraph track — a smooth area/line of the same series. */
export const LineGraph: Story = {
	render: () => {
		const [value, setValue] = useState(new Date(2026, 3, 15, 9, 30, 0));
		return (
			<TimeScrubber
				start={DAY_START}
				end={DAY_END}
				variant="lineGraph"
				label="Workers"
				data={ACTIVITY}
				value={value}
				onValueChange={setValue}
				sectionLabel="Wed, 15 Apr"
				valueLabel={`${valueAt(value).toLocaleString()} on site`}
			/>
		);
	},
};

/** dots track — a marker per event (points with value &gt; 0). */
export const Dots: Story = {
	render: () => {
		const [value, setValue] = useState(new Date(2026, 3, 15, 7, 0, 0));
		return (
			<TimeScrubber
				start={DAY_START}
				end={DAY_END}
				variant="dots"
				label="Deliveries"
				data={ACTIVITY.filter((d, i) => i % 5 === 0 && d.value > 400)}
				value={value}
				onValueChange={setValue}
				sectionLabel="Wed, 15 Apr"
			/>
		);
	},
};

/** Date navigation — the header date is a picker; pick a previous day to load its series. */
export const WithDatePicker: Story = {
	// The picker disables future days via `new Date()`, so the snapshot isn't deterministic.
	parameters: {chromatic: {disableSnapshot: true}},
	render: () => {
		const [date, setDate] = useState(DAY_START);
		const end = useMemo(() => new Date(date.getTime() + 24 * 60 * 60 * 1000), [date]);
		const data = useMemo(() => workforceCurve(date), [date]);
		const [value, setValue] = useState(new Date(DAY_START.getTime() + 12 * 60 * 60 * 1000));
		return (
			<TimeScrubber
				start={date}
				end={end}
				variant="barGraph"
				label="Workers"
				data={data}
				value={value}
				onValueChange={setValue}
				date={date}
				onDateChange={(d) => {
					const s = new Date(d);
					s.setHours(0, 0, 0, 0);
					setDate(s);
					setValue(new Date(s.getTime() + 12 * 60 * 60 * 1000));
				}}
				valueLabel={`${valueAt(value).toLocaleString()} on site`}
			/>
		);
	},
};

/** Read-only — no cursor or controls, just the axis and track. */
export const ReadOnly: Story = {
	render: () => (
		<TimeScrubber
			start={DAY_START}
			end={DAY_END}
			variant="barGraph"
			label="Workers"
			data={ACTIVITY}
			sectionLabel="Wed, 15 Apr"
		/>
	),
};

/** Overlaid on a dark viewport, the way it sits under the 3D model in Map View. */
export const OverModel: Story = {
	parameters: {layout: "fullscreen"},
	render: () => {
		const [value, setValue] = useState(new Date(2026, 3, 15, 14, 0, 0));
		const [playing, setPlaying] = useState(false);
		return (
			<div className="wwc:relative wwc:h-[420px] wwc:w-full wwc:bg-neutral-900">
				<div className="wwc:absolute wwc:inset-x-4 wwc:bottom-4">
					<TimeScrubber
						start={DAY_START}
						end={DAY_END}
						variant="barGraph"
						label="Workers"
						data={ACTIVITY}
						value={value}
						onValueChange={setValue}
						playing={playing}
						onPlayingChange={setPlaying}
						sectionLabel="Wed, 15 Apr"
						valueLabel={`${valueAt(value).toLocaleString()} on site`}
					/>
				</div>
			</div>
		);
	},
};

/**
 * Range selection — a second handle turns the track into a window. Drag either end; the band between
 * them is the selection, and the ends cannot cross. `value` still drives the playhead, so a range and
 * a cursor coexist rather than replacing one another.
 */
export const Range: Story = {
	name: "Date Range",
	render: () => {
		function RangeStory() {
			const [range, setRange] = useState<[Date, Date]>([
				new Date(2026, 3, 15, 8, 0, 0),
				new Date(2026, 3, 15, 16, 0, 0),
			]);
			const [cursor, setCursor] = useState(new Date(2026, 3, 15, 12, 0, 0));

			const total = useMemo(
				() => ACTIVITY.filter((a) => a.time >= range[0] && a.time <= range[1]).reduce((sum, a) => sum + a.value, 0),
				[range],
			);
			const fmt = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

			return (
				<TimeScrubber
					start={DAY_START}
					end={DAY_END}
					variant="barGraph"
					data={ACTIVITY}
					label="Workers"
					value={cursor}
					onValueChange={setCursor}
					rangeValue={range}
					onRangeValueChange={setRange}
					sectionLabel="Wed, 15 Apr"
					valueLabel={`${fmt(range[0])}–${fmt(range[1])} · ${total.toLocaleString()} worker-samples`}
				/>
			);
		}
		return <RangeStory />;
	},
};
