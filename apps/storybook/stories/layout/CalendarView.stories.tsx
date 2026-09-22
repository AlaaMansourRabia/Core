import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@core/core-ui/button";
import {CalendarView, type CalendarEvent} from "@core/core-ui/calendar-view";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@core/core-ui/dropdown-menu";
import {ChevronDown} from "lucide-react";

const meta = {
	title: "Widgets/Schedule/Calendar View",
	component: CalendarView,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"Month-grid calendar for work item / project scheduling. Header with prev/next, Today, and an actions slot; weekday row; 6×7 day grid with events rendered as chips colored by tone. Hover any cell to reveal the + Add work item affordance.",
			},
		},
	},
} satisfies Meta<typeof CalendarView>;

export default meta;
type Story = StoryObj<typeof meta>;

const aug2025 = new Date(2025, 7, 1);
const aug26 = new Date(2025, 7, 26);

const sampleEvents: CalendarEvent[] = [
	{
		id: "ASMOB-11",
		date: new Date(2025, 7, 28),
		identifier: "ASMOB-11",
		title: "ASMobbin Official (copy)",
		tone: "warning",
	},
	{
		id: "ASMOB-8",
		date: new Date(2025, 7, 28),
		identifier: "ASMOB-8",
		title: "ASMobbin Official",
		tone: "neutral",
	},
];

const denseEvents: CalendarEvent[] = [
	{id: "ev-1", date: new Date(2025, 7, 4), identifier: "WC-1", title: "Site walkthrough", tone: "primary"},
	{id: "ev-2", date: new Date(2025, 7, 5), identifier: "WC-2", title: "Crew briefing", tone: "info"},
	{id: "ev-3", date: new Date(2025, 7, 6), identifier: "WC-3", title: "Inspection", tone: "warning"},
	{id: "ev-4", date: new Date(2025, 7, 12), identifier: "WC-4", title: "Vendor sync", tone: "neutral"},
	{id: "ev-5", date: new Date(2025, 7, 14), identifier: "WC-5", title: "Phase review", tone: "success"},
	{id: "ev-6", date: new Date(2025, 7, 14), identifier: "WC-6", title: "Risk audit", tone: "danger"},
	{id: "ev-7", date: new Date(2025, 7, 19), identifier: "WC-7", title: "Cost report", tone: "info"},
	{id: "ev-8", date: new Date(2025, 7, 22), identifier: "WC-8", title: "Tower 3 power", tone: "primary"},
	{id: "ev-9", date: new Date(2025, 7, 26), identifier: "WC-9", title: "Calibration", tone: "warning"},
	{id: "ev-10", date: new Date(2025, 7, 28), identifier: "WC-10", title: "Headcount", tone: "neutral"},
	{id: "ev-11", date: new Date(2025, 7, 28), identifier: "WC-11", title: "Quality checks", tone: "danger"},
];

const optionsDropdown = (
	<DropdownMenu>
		<DropdownMenuTrigger asChild>
			<Button variant="secondary" size="sm" className="wwc:h-7 wwc:gap-1.5">
				Options
				<ChevronDown className="wwc:h-3.5 wwc:w-3.5" />
			</Button>
		</DropdownMenuTrigger>
		<DropdownMenuContent align="end">
			<DropdownMenuItem>Show weekends</DropdownMenuItem>
			<DropdownMenuItem>Compact density</DropdownMenuItem>
			<DropdownMenuItem>Print</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
);

export const Default: Story = {
	render: () => (
		<div className="wwc:p-4">
			<CalendarView
				defaultMonth={aug2025}
				today={aug26}
				events={sampleEvents}
				onAddItem={() => {}}
				headerActions={optionsDropdown}
			/>
		</div>
	),
};

export const Empty: Story = {
	render: () => (
		<div className="wwc:p-4">
			<CalendarView defaultMonth={aug2025} today={aug26} headerActions={optionsDropdown} />
		</div>
	),
};

export const Dense: Story = {
	render: () => (
		<div className="wwc:p-4">
			<CalendarView defaultMonth={aug2025} today={aug26} events={denseEvents} headerActions={optionsDropdown} />
		</div>
	),
};

export const SundayFirst: Story = {
	render: () => (
		<div className="wwc:p-4">
			<CalendarView
				defaultMonth={aug2025}
				today={aug26}
				weekStartsOn={0}
				events={sampleEvents}
				headerActions={optionsDropdown}
			/>
		</div>
	),
};
