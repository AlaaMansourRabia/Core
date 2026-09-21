import * as React from "react";

import {MapCompareLayout as MapCompareLayoutWidget} from "../map-compare-layout";
import {type TimelineDay, type TimelinePeriod, TimelineRangeSelector} from "../timeline-range-selector";
import {type TimestampEntry, TimestampPicker} from "../timestamp-picker";

// A whole "map" scene; the "as-built" variant is warm-tinted and gains a new structure.
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
				<defs>
					<pattern id={`ml-grid-${variant}`} width="40" height="40" patternUnits="userSpaceOnUse">
						<path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill={`url(#ml-grid-${variant})`} />
				<path d="M0 320 Q 260 240 500 340 T 980 300" fill="none" stroke="currentColor" strokeWidth="7" />
				<path d="M180 0 L 250 520" fill="none" stroke="currentColor" strokeWidth="5" />
				<path d="M540 0 L 590 520" fill="none" stroke="currentColor" strokeWidth="4" />
				<path d="M0 140 L 980 110" fill="none" stroke="currentColor" strokeWidth="4" />
				<rect x="70" y="170" width="70" height="60" rx="4" fill="currentColor" opacity="0.35" />
				<rect x="560" y="360" width="110" height="70" rx="4" fill="currentColor" opacity="0.35" />
				<rect x="760" y="170" width="90" height="80" rx="4" fill="currentColor" opacity="0.35" />
				{built && <rect x="320" y="180" width="150" height="110" rx="6" fill="#f59e0b" opacity="0.55" />}
			</svg>
		</div>
	);
}

// ~100 days of captured timestamps (1–3 per day), shared by both views' pickers, so the
// session timeline renders a realistic, dense strip. Generated deterministically from a fixed
// anchor day (no wall-clock) to keep the demo and screenshots stable.
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

// One dot per capture day, for the session timeline in the timeline-driven variant.
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

// The latest capture on a given day (falls back to the day itself if none).
const latestCaptureOnDay = (day: Date): Date => {
	const key = dayKey(day);
	const times = CAPTURE_ENTRIES.filter((entry) => dayKey(entry.time) === key).map((entry) => entry.time.getTime());
	return times.length > 0 ? new Date(Math.max(...times)) : day;
};

export interface MapCompareLayoutProps {
	/** Dock a "Sessions" TimelineRangeSelector in the bottom bar to scrub the compared dates. Default false. */
	withSessionTimeline?: boolean;
	className?: string;
}

/**
 * Map compare workspace: two geo-aligned scenes (as-planned / as-built) in a single
 * `MapCompareLayout`, each with a per-view `TimestampPicker` to scrub its capture, and an optional
 * bottom `TimelineRangeSelector` to drive both dates from a shared session timeline. Bare (no outer
 * container) — fills its parent. The canonical full-page realization of the map-compare workspace.
 *
 * @deprecated Preview/demo prototype — renders built-in sample data and mock handlers. Not a
 * supported production import: compose your page from the widgets this template uses, wired to your
 * own data (see the MapCompareLayout template docs in Storybook). Slated for removal from the public API in a
 * future major.
 */
export function MapCompareLayout({withSessionTimeline = false, className}: MapCompareLayoutProps) {
	const [planned, setPlanned] = React.useState<Date>(LATEST_ENTRY.time); // left / later view
	const [built, setBuilt] = React.useState<Date>(PREV_DATE_ENTRY.time); // right / earlier view
	const [period, setPeriod] = React.useState<TimelinePeriod>("3m");

	// Bare: fills its parent with no outer border/radius or chrome.
	return (
		<MapCompareLayoutWidget
			className={className}
			defaultBearing={24}
			map={<MapScene variant="planned" />}
			compareMap={<MapScene variant="built" />}
			mapCenter={<TimestampPicker entries={CAPTURE_ENTRIES} value={planned} onChange={setPlanned} compact />}
			compareMapCenter={<TimestampPicker entries={CAPTURE_ENTRIES} value={built} onChange={setBuilt} compact />}
			style={{height: "100%", border: "none", borderRadius: 0}}
			bottomBar={
				withSessionTimeline ? (
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
				) : undefined
			}
		/>
	);
}
