import type {Villa} from "@core/core-ui/site-image-viewer";
import type {Meta, StoryObj} from "storybook/internal/types";

import {ProgressSheet, type TimelineWeek} from "@core/core-ui/progress-sheet";
import {useState} from "react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ---- weekly reality-capture timeline (30 ticks from Jan 2025) ----
const TIMELINE: TimelineWeek[] = Array.from({length: 30}, (_, i) => {
	const start = new Date(2025, 0, 6 + i * 7);
	const end = new Date(start);
	end.setDate(start.getDate() + 6);
	const monthStart = start.getDate() <= 7;
	return {
		value: `2025-W${String(i + 1).padStart(2, "0")}`,
		num: i + 1,
		start,
		end,
		monthStart,
		monthLabel: MONTHS[start.getMonth()],
	};
});

// ---- ~48 villas with a spread of approved progress for the §1 waffle ----
const ALL_VILLAS: Villa[] = Array.from({length: 48}, (_, i) => {
	const pct = Math.round((Math.sin(i * 1.3) * 0.5 + 0.5) * 100);
	return {
		id: i + 1,
		linkedLbsItemId: i + 1,
		name: `Villa ${i + 1}`,
		plotNumber: `P-${100 + i}`,
		type: "Polygon",
		points: [
			{x: 0, y: 0},
			{x: 10, y: 0},
			{x: 10, y: 10},
			{x: 0, y: 10},
		],
		x: 0,
		y: 0,
		width: 10,
		height: 10,
		approvedProgressPercent: pct,
		plannedProgressPercent: Math.min(100, pct + 8),
	};
});

const SELECTED = TIMELINE[18];

// The bottom Progress Overview sheet as a controlled Core widget: a week-timeline scrubber in the
// bottom toolbar plus the pull-up Reports sheet (§1 milestone-progression waffle + §3 plan-vs-reality
// timing band). This harness owns `capture` + `reportsOpen` and feeds them back through the callbacks.
const meta = {
	title: "Widgets/ProgressSheet",
	component: ProgressSheet,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"Bottom progress sheet extracted from the Capture UI Enhanced template. Fully controlled: reads the timeline selection + reportsOpen as props and requests changes via onCaptureChange / onReportsOpenChange / onReportScroll. Local state is only the timeline scrubber + date-picker open flags. This story opens with the Reports sheet expanded so the visualizations are visible.",
			},
		},
	},
} satisfies Meta<typeof ProgressSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

function Harness({startOpen}: {startOpen: boolean}) {
	const [capture, setCapture] = useState(SELECTED.value);
	const [reportsOpen, setReportsOpen] = useState(startOpen);

	const selectedWeek = TIMELINE.find((w) => w.value === capture) ?? SELECTED;

	return (
		<div className="wwc:relative wwc:h-screen wwc:w-full wwc:overflow-hidden wwc:bg-muted">
			<div className="wwc:absolute wwc:inset-0 wwc:bg-[radial-gradient(circle_at_50%_35%,#e2e8f0,#94a3b8)]" />
			<ProgressSheet
				capture={capture}
				timeline={TIMELINE}
				selectedWeek={selectedWeek}
				rangeLabel={`${MONTHS[selectedWeek.start.getMonth()]} ${selectedWeek.start.getDate()}, ${selectedWeek.start.getFullYear()} – ${MONTHS[selectedWeek.end.getMonth()]} ${selectedWeek.end.getDate()}, ${selectedWeek.end.getFullYear()}`}
				firstWeek={TIMELINE[0]}
				lastWeek={TIMELINE[TIMELINE.length - 1]}
				reportsOpen={reportsOpen}
				showOnlyProgressionReport
				chromeFade=""
				allVillas={ALL_VILLAS}
				onCaptureChange={setCapture}
				onReportsOpenChange={setReportsOpen}
				onReportScroll={() => {}}
			/>
		</div>
	);
}

export const Default: Story = {
	render: () => <Harness startOpen />,
};

export const Collapsed: Story = {
	render: () => <Harness startOpen={false} />,
};
