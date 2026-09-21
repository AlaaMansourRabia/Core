import type {Meta, StoryObj} from "storybook/internal/types";

import {MapCompareLayout} from "@wakecap/core-ui/map-compare-layout";
import {type TimelineDay, type TimelinePeriod, TimelineRangeSelector} from "@wakecap/core-ui/timeline-range-selector";
import {type TimestampEntry, TimestampPicker} from "@wakecap/core-ui/timestamp-picker";
import * as React from "react";

function MapScene({variant}: {variant: "planned" | "built"}) {
	const built = variant === "built";
	return (
		<div className="wwc:absolute wwc:inset-0 wwc:h-full wwc:w-full">
			<div
				className={
					built
						? "wwc:absolute wwc:inset-0 wwc:bg-gradient-to-br wwc:from-amber-100 wwc:via-orange-100 wwc:to-rose-200"
						: "wwc:absolute wwc:inset-0 wwc:bg-gradient-to-br wwc:from-emerald-100 wwc:via-sky-100 wwc:to-slate-200"
				}
			/>
			<svg className="wwc:absolute wwc:inset-0 wwc:h-full wwc:w-full wwc:text-slate-500/40" aria-hidden="true">
				<path d="M0 320 Q 260 240 500 340 T 980 300" fill="none" stroke="currentColor" strokeWidth="7" />
				<path d="M180 0 L 250 520" fill="none" stroke="currentColor" strokeWidth="5" />
				<path d="M540 0 L 590 520" fill="none" stroke="currentColor" strokeWidth="4" />
				<rect x="70" y="170" width="70" height="60" rx="4" fill="currentColor" opacity="0.35" />
				<rect x="760" y="170" width="90" height="80" rx="4" fill="currentColor" opacity="0.35" />
				{built && <rect x="320" y="180" width="150" height="110" rx="6" fill="#f59e0b" opacity="0.55" />}
			</svg>
		</div>
	);
}

// ~100 days of captured timestamps (1–3 per day), shared by both views' pickers, so the session
// timeline renders a realistic, dense strip. Generated deterministically from a fixed anchor day.
const CAPTURE_ENTRIES: TimestampEntry[] = (() => {
	const anchor = new Date(2026, 5, 24); // latest capture day
	const entries: TimestampEntry[] = [];
	for (let daysAgo = 99; daysAgo >= 0; daysAgo--) {
		const day = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - daysAgo);
		const perDay = daysAgo % 4 === 0 ? 3 : daysAgo % 2 === 0 ? 2 : 1;
		for (let c = 0; c < perDay; c++) {
			const hour = 7 + ((daysAgo + c * 5) % 11); // 07:00–17:00
			const minute = (daysAgo * 7 + c * 13) % 60;
			entries.push({time: new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute)});
		}
	}
	return entries;
})();

// Default-selection rules for the two views:
// - left (before) view starts on the latest capture overall
// - right (after) view starts on the latest capture from an earlier date
const dayKey = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const LATEST_ENTRY = CAPTURE_ENTRIES.reduce((latest, entry) =>
	entry.time.getTime() > latest.time.getTime() ? entry : latest,
);
const PREV_DATE_ENTRIES = CAPTURE_ENTRIES.filter((entry) => dayKey(entry.time) < dayKey(LATEST_ENTRY.time));
const PREV_DATE_ENTRY = PREV_DATE_ENTRIES.reduce(
	(latest, entry) => (entry.time.getTime() > latest.time.getTime() ? entry : latest),
	PREV_DATE_ENTRIES[0] ?? LATEST_ENTRY,
);

function FullWorkspaceDemo() {
	const [planned, setPlanned] = React.useState<Date>(LATEST_ENTRY.time);
	const [built, setBuilt] = React.useState<Date>(PREV_DATE_ENTRY.time);
	return (
		<div className="wwc:p-6">
			<MapCompareLayout
				defaultBearing={24}
				map={<MapScene variant="planned" />}
				compareMap={<MapScene variant="built" />}
				mapCenter={<TimestampPicker entries={CAPTURE_ENTRIES} value={planned} onChange={setPlanned} compact />}
				compareMapCenter={<TimestampPicker entries={CAPTURE_ENTRIES} value={built} onChange={setBuilt} compact />}
			/>
		</div>
	);
}

// One dot per capture day, for the session timeline.
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const TIMELINE_DAYS: TimelineDay[] = (() => {
	const byDay = new Map<number, TimelineDay>();
	for (const entry of CAPTURE_ENTRIES) {
		const key = dayKey(entry.time);
		const day = byDay.get(key);
		if (day) {
			day.count = (day.count ?? 0) + 1;
		} else {
			byDay.set(key, {date: startOfDay(entry.time), count: 1});
		}
	}
	return [...byDay.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
})();

const latestCaptureOnDay = (day: Date): Date => {
	const key = dayKey(day);
	const times = CAPTURE_ENTRIES.filter((entry) => dayKey(entry.time) === key).map((entry) => entry.time.getTime());
	return times.length > 0 ? new Date(Math.max(...times)) : day;
};

// Variant: a "Sessions" TimelineRangeSelector in the bottomBar slot drives both view dates.
function TimelineControlledDemo() {
	const [planned, setPlanned] = React.useState<Date>(LATEST_ENTRY.time);
	const [built, setBuilt] = React.useState<Date>(PREV_DATE_ENTRY.time);
	const [period, setPeriod] = React.useState<TimelinePeriod>("3m");
	return (
		<div className="wwc:p-6">
			<MapCompareLayout
				defaultBearing={24}
				map={<MapScene variant="planned" />}
				compareMap={<MapScene variant="built" />}
				mapCenter={<TimestampPicker entries={CAPTURE_ENTRIES} value={planned} onChange={setPlanned} compact />}
				compareMapCenter={<TimestampPicker entries={CAPTURE_ENTRIES} value={built} onChange={setBuilt} compact />}
				bottomBar={
					<TimelineRangeSelector
						title="Sessions"
						variant="dot"
						period={period}
						onPeriodChange={setPeriod}
						data={TIMELINE_DAYS}
						selectedRange={[startOfDay(built), startOfDay(planned)]}
						onRangeChange={([start, end]) => {
							setBuilt(latestCaptureOnDay(start));
							setPlanned(latestCaptureOnDay(end));
						}}
					/>
				}
			/>
		</div>
	);
}

const meta = {
	title: "Templates/Map Compare Layout/Interactive Example",
	component: MapCompareLayout,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"A map workspace composing every map feature: a pannable/zoomable `CompareView` surface with an optional as-planned/as-built compare, a vertical `MapToolbar` (compare, locate, zoom, compass) top-right, an overview `MapMinimap` bottom-right that tracks and drives the view, and optional legend / title slots.",
			},
		},
	},
} satisfies Meta<typeof MapCompareLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullWorkspace: Story = {
	render: () => <FullWorkspaceDemo />,
	parameters: {
		docs: {
			description: {
				story:
					"Drag to pan, scroll or use the toolbar ± to zoom, hover the split button to compare (with the divider lock in side-by-side), drag the minimap to jump, and reset the compass to north. Activating a compare mode reveals a `TimestampPicker` centered over each view for scrubbing that side's capture.",
			},
		},
	},
};

export const WithTimeline: Story = {
	render: () => <TimelineControlledDemo />,
	parameters: {
		docs: {
			description: {
				story:
					"A variant that fills the `bottomBar` slot with a `TimelineRangeSelector`. Activate a compare mode to reveal the session timeline, then drag its two handles to scrub the compared dates from the timeline instead of the top pickers — the pickers stay in sync.",
			},
		},
	},
};

export const SingleMap: Story = {
	render: () => (
		<div className="wwc:p-6">
			<MapCompareLayout className="wwc:h-96" map={<MapScene variant="planned" />} />
		</div>
	),
	parameters: {
		docs: {
			description: {story: "Without `compareMap` the toolbar drops the split control; pan/zoom and minimap remain."},
		},
	},
};
