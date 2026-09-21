import {ChevronDown} from "lucide-react";
import {useState} from "react";

import {Button} from "@/components/ui/button";
import {CalendarView, type CalendarEvent} from "@/components/ui/calendar-view";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";

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

const propsTable: {prop: string; type: string; def: string; desc: string}[] = [
	{prop: "month", type: "Date", def: "today", desc: "Controls which month is visible. Pair with onMonthChange."},
	{prop: "defaultMonth", type: "Date", def: "today", desc: "Initial month for uncontrolled use."},
	{
		prop: "onMonthChange",
		type: "(month: Date) => void",
		def: "undefined",
		desc: "Fires on prev/next/Today navigation.",
	},
	{prop: "today", type: "Date", def: "new Date()", desc: "Day to highlight as today."},
	{prop: "weekStartsOn", type: "0–6", def: "1 (Mon)", desc: "Day-of-week the grid starts on."},
	{
		prop: "events",
		type: "CalendarEvent[]",
		def: "[]",
		desc: "Events grouped by date and rendered as chips inside the cell.",
	},
	{
		prop: "onDayClick",
		type: "(date: Date) => void",
		def: "undefined",
		desc: "Fires when an empty area inside a day cell is clicked.",
	},
	{
		prop: "onEventClick",
		type: "(event: CalendarEvent) => void",
		def: "undefined",
		desc: "Fires when an event chip is clicked.",
	},
	{
		prop: "onAddItem",
		type: "(date: Date) => void",
		def: "undefined",
		desc: "When set, an Add work item affordance appears in each cell on hover.",
	},
	{prop: "addItemLabel", type: "string", def: '"Add work item"', desc: "Label for the add-item affordance."},
	{prop: "headerActions", type: "ReactNode", def: "undefined", desc: "Slot rendered to the right of the Today button."},
];

const eventPropsTable: {prop: string; type: string; def: string; desc: string}[] = [
	{prop: "id", type: "string", def: "—", desc: "Stable identifier, used as a React key."},
	{
		prop: "date",
		type: "Date",
		def: "—",
		desc: "Date the event is anchored on. Used to bucket the chip into the right cell.",
	},
	{
		prop: "identifier",
		type: "string",
		def: "undefined",
		desc: 'Short prefix shown before the title (e.g. "ASMOB-11").',
	},
	{prop: "title", type: "string", def: "—", desc: "Event title."},
	{
		prop: "tone",
		type: '"neutral" | "primary" | "success" | "warning" | "danger" | "info"',
		def: '"neutral"',
		desc: "Drives the chip's left-border color.",
	},
];

export function CalendarViewPage() {
	const [logged, setLogged] = useState<string[]>([]);

	const optionsDropdown = (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="secondary" size="sm" className="wwc:h-7 wwc:gap-1.5">
					Options
					<ChevronDown className="wwc:h-3.5 wwc:w-3.5" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onSelect={() => setLogged((prev) => [...prev, "Show weekends"])}>
					Show weekends
				</DropdownMenuItem>
				<DropdownMenuItem onSelect={() => setLogged((prev) => [...prev, "Compact density"])}>
					Compact density
				</DropdownMenuItem>
				<DropdownMenuItem onSelect={() => setLogged((prev) => [...prev, "Print"])}>Print</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Calendar View</h1>
					<CopyButton
						value="Calendar View"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:text-muted-foreground">
					Month-grid calendar for work item / project scheduling. Header with prev/next, Today, and an actions slot;
					weekday row; 6×7 day grid with events rendered as chips colored by tone. Hover any cell to reveal the
					<code> + Add work item</code> affordance.
				</p>
			</div>

			<div>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-4">Default</h2>
				<p className="wwc:text-muted-foreground wwc:mb-4">
					August 2025 with two events on Aug 28 (ASMOB-11 and ASMOB-8). "Today" is Aug 26 — highlighted with the primary
					token. Hover an empty cell to see the add-work-item affordance.
				</p>
				<CalendarView
					defaultMonth={aug2025}
					today={aug26}
					events={sampleEvents}
					onAddItem={(date) => setLogged((prev) => [...prev, `Add @ ${date.toDateString()}`])}
					onEventClick={(ev) => setLogged((prev) => [...prev, `Click event ${ev.id}`])}
					headerActions={optionsDropdown}
				/>
				{logged.length > 0 && (
					<div className="wwc:mt-4 wwc:rounded-md wwc:border wwc:border-border wwc:bg-muted/40 wwc:p-3">
						<div className="wwc:mb-2 wwc:text-xs wwc:font-semibold wwc:text-muted-foreground">Action log</div>
						<ul className="wwc:space-y-1 wwc:text-sm">
							{logged.slice(-8).map((s, i) => (
								<li key={i} className="wwc:rounded wwc:bg-background wwc:px-2 wwc:py-1 wwc:font-mono wwc:text-xs">
									{s}
								</li>
							))}
						</ul>
					</div>
				)}
			</div>

			<div>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-4">Empty</h2>
				<p className="wwc:text-muted-foreground wwc:mb-4">A month with no events. Today still highlighted.</p>
				<CalendarView defaultMonth={aug2025} today={aug26} />
			</div>

			<div>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-4">Dense</h2>
				<p className="wwc:text-muted-foreground wwc:mb-4">A populated month showing the full tone palette.</p>
				<CalendarView defaultMonth={aug2025} today={aug26} events={denseEvents} />
			</div>

			<div>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-4">Sunday-first week</h2>
				<p className="wwc:text-muted-foreground wwc:mb-4">
					Pass <code>weekStartsOn=&#123;0&#125;</code> for a Sunday-leading grid.
				</p>
				<CalendarView defaultMonth={aug2025} today={aug26} weekStartsOn={0} events={sampleEvents} />
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>CalendarView Props</CardTitle>
						<CopyButton
							value="CalendarView - Props"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-sm">
							<thead>
								<tr className="wwc:border-b wwc:border-border wwc:text-left">
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Prop</th>
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Type</th>
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Default</th>
									<th className="wwc:py-2 wwc:font-semibold">Description</th>
								</tr>
							</thead>
							<tbody>
								{propsTable.map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:font-medium wwc:text-primary wwc:whitespace-nowrap">
											{row.prop}
										</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.type}</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.def}</td>
										<td className="wwc:py-3 wwc:text-muted-foreground">{row.desc}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>CalendarEvent Props</CardTitle>
						<CopyButton
							value="CalendarEvent - Props"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-sm">
							<thead>
								<tr className="wwc:border-b wwc:border-border wwc:text-left">
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Prop</th>
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Type</th>
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Default</th>
									<th className="wwc:py-2 wwc:font-semibold">Description</th>
								</tr>
							</thead>
							<tbody>
								{eventPropsTable.map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:font-medium wwc:text-primary wwc:whitespace-nowrap">
											{row.prop}
										</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.type}</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.def}</td>
										<td className="wwc:py-3 wwc:text-muted-foreground">{row.desc}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Calendar View - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { CalendarView } from "@/components/ui/calendar-view";

<CalendarView
  defaultMonth={new Date(2025, 7, 1)}
  events={[
    {
      id: "ASMOB-11",
      date: new Date(2025, 7, 28),
      identifier: "ASMOB-11",
      title: "ASMobbin Official (copy)",
      tone: "warning",
    },
  ]}
  onEventClick={(ev) => openWorkItem(ev.id)}
  onAddItem={(date) => createWorkItem(date)}
/>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
