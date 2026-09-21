import * as React from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {type TimestampEntry, TimestampPicker} from "@/components/ui/timestamp-picker";

// Build a realistic set of captured timestamps spread across a few days.
function makeEntry(year: number, month: number, day: number, hour: number, minute: number): TimestampEntry {
	return {time: new Date(year, month, day, hour, minute)};
}

const SAMPLE_ENTRIES: TimestampEntry[] = [
	makeEntry(2026, 5, 12, 8, 15),
	makeEntry(2026, 5, 12, 14, 2),
	makeEntry(2026, 5, 14, 9, 30),
	makeEntry(2026, 5, 14, 11, 45),
	makeEntry(2026, 5, 14, 16, 20),
	makeEntry(2026, 5, 16, 6, 5),
	makeEntry(2026, 5, 16, 10, 39),
	makeEntry(2026, 5, 16, 13, 12),
	makeEntry(2026, 5, 16, 17, 58),
	makeEntry(2026, 5, 19, 7, 45),
	makeEntry(2026, 5, 19, 12, 0),
	makeEntry(2026, 5, 22, 15, 33),
	makeEntry(2026, 5, 24, 9, 10),
	makeEntry(2026, 5, 24, 18, 47),
];

export function TimestampPickerPage() {
	// Start on the most recent capture so the selector shows its "Latest" badge.
	const [value, setValue] = React.useState<Date | undefined>(SAMPLE_ENTRIES[SAMPLE_ENTRIES.length - 1].time);
	const [empty, setEmpty] = React.useState<Date>();

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Timestamp Picker</h1>
					<CopyButton
						value="Timestamp Picker"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					A pill selector for choosing a captured timestamp. Clicking it opens a calendar where dates with data are
					marked with a dot; selecting a date reveals a scrollable list of the times captured on that day.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Timestamp Picker - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Dates with captures show a dot; dates without data are disabled. Pick a date to browse its times. When the
						most recent capture is selected, the selector shows a blue "Latest" badge.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<TimestampPicker entries={SAMPLE_ENTRIES} value={value} onChange={setValue} />
					{value && (
						<p className="wwc:text-sm wwc:text-muted-foreground wwc:mt-3">Selected: {value.toLocaleString()}</p>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Compact</CardTitle>
						<CopyButton
							value="Timestamp Picker - Compact"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						A denser variant with smaller day cells (32px), nav, and spacing for tight layouts like toolbars and side
						panels. Font sizes stay the same as the default.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<TimestampPicker entries={SAMPLE_ENTRIES} value={value} onChange={setValue} compact />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>No selection</CardTitle>
						<CopyButton
							value="Timestamp Picker - No selection"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Starts empty with a placeholder until a time is chosen.</CardDescription>
				</CardHeader>
				<CardContent>
					<TimestampPicker
						entries={SAMPLE_ENTRIES}
						value={empty}
						onChange={setEmpty}
						placeholder="Select a capture time"
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Disabled</CardTitle>
						<CopyButton
							value="Timestamp Picker - Disabled"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>A disabled picker that cannot be opened.</CardDescription>
				</CardHeader>
				<CardContent>
					<TimestampPicker entries={SAMPLE_ENTRIES} value={value} disabled />
				</CardContent>
			</Card>

			{/* API Reference */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Timestamp Picker - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Props for the{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">
							{"<TimestampPicker>"}
						</code>{" "}
						component.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Prop</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Default</th>
									<th className="wwc:text-left wwc:py-3 wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{
										prop: "entries",
										type: "TimestampEntry[]",
										def: "—",
										desc: "All available captured timestamps (each { time: Date }).",
									},
									{prop: "value", type: "Date | undefined", def: "—", desc: "The currently selected timestamp."},
									{
										prop: "onChange",
										type: "(value: Date) => void",
										def: "—",
										desc: "Called with the selected timestamp when a time is picked.",
									},
									{
										prop: "placeholder",
										type: "string",
										def: '"Select a timestamp"',
										desc: "Trigger text shown when nothing is selected.",
									},
									{
										prop: "compact",
										type: "boolean",
										def: "false",
										desc: "Denser trigger, calendar, and time list for tight layouts.",
									},
									{prop: "disabled", type: "boolean", def: "false", desc: "Whether the picker is disabled."},
									{prop: "className", type: "string", def: "—", desc: "Additional CSS class names for the trigger."},
								].map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-primary wwc:font-medium wwc:whitespace-nowrap">
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
							value="Timestamp Picker - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import {
  TimestampPicker,
  type TimestampEntry,
} from "@/components/ui/timestamp-picker"

const entries: TimestampEntry[] = [
  { time: new Date(2026, 5, 16, 10, 39) },
  { time: new Date(2026, 5, 16, 13, 12) },
]

const [value, setValue] = useState<Date>()

<TimestampPicker
  entries={entries}
  value={value}
  onChange={setValue}
/>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
