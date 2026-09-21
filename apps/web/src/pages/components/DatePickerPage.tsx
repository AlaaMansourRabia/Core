import * as React from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {
	DatePicker,
	DatePickerForm,
	DatePickerWithInput,
	DatePickerWithPresets,
	DateRangePicker,
	DateRangeTimePicker,
	DateTimePicker,
} from "@/components/ui/date-picker";

export function DatePickerPage() {
	const [date, setDate] = React.useState<Date>();
	const [presetDate, setPresetDate] = React.useState<Date>();
	const [dobDate, setDobDate] = React.useState<Date>();
	const [inputDate, setInputDate] = React.useState<Date>();
	const [dateTime, setDateTime] = React.useState<Date>();
	const [dateRangeTime, setDateRangeTime] = React.useState<{
		from: Date | undefined;
		to: Date | undefined;
	}>({from: undefined, to: undefined});
	const [dateRange, setDateRange] = React.useState<{
		from: Date | undefined;
		to: Date | undefined;
	}>({from: undefined, to: undefined});

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Date Picker</h1>
					<CopyButton
						value="Date Picker"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					A date picker component with calendar popup for single date or date range selection.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Date Picker</CardTitle>
						<CopyButton
							value="Date Picker - Date Picker"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>A simple date picker with a button trigger.</CardDescription>
				</CardHeader>
				<CardContent>
					<DatePicker date={date} onDateChange={setDate} />
					{date && (
						<p className="wwc:text-sm wwc:text-muted-foreground wwc:mt-2">Selected: {date.toLocaleDateString()}</p>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Date Picker with Presets</CardTitle>
						<CopyButton
							value="Date Picker - Date Picker with Presets"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>A date picker with preset options like "Today", "Tomorrow", etc.</CardDescription>
				</CardHeader>
				<CardContent>
					<DatePickerWithPresets date={presetDate} onDateChange={setPresetDate} />
					{presetDate && (
						<p className="wwc:text-sm wwc:text-muted-foreground wwc:mt-2">
							Selected: {presetDate.toLocaleDateString()}
						</p>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Date of Birth Picker</CardTitle>
						<CopyButton
							value="Date Picker - Date of Birth Picker"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>A date picker with dropdown navigation for month and year selection.</CardDescription>
				</CardHeader>
				<CardContent>
					<DatePickerForm
						date={dobDate}
						onDateChange={setDobDate}
						label="Date of birth"
						description="Your date of birth is used to calculate your age."
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Date Picker with Input</CardTitle>
						<CopyButton
							value="Date Picker - Date Picker with Input"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Combine an input field with a calendar button for manual entry.</CardDescription>
				</CardHeader>
				<CardContent>
					<DatePickerWithInput date={inputDate} onDateChange={setInputDate} />
					{inputDate && (
						<p className="wwc:text-sm wwc:text-muted-foreground wwc:mt-2">Selected: {inputDate.toLocaleDateString()}</p>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Date and Time Picker</CardTitle>
						<CopyButton
							value="Date Picker - Date and Time Picker"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>A date picker paired with a time input for selecting both date and time.</CardDescription>
				</CardHeader>
				<CardContent>
					<DateTimePicker date={dateTime} onDateChange={setDateTime} />
					{dateTime && (
						<p className="wwc:text-sm wwc:text-muted-foreground wwc:mt-2">Selected: {dateTime.toLocaleString()}</p>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Date Range Picker</CardTitle>
						<CopyButton
							value="Date Picker - Date Range Picker"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Select a range of dates with a two-month calendar view.</CardDescription>
				</CardHeader>
				<CardContent>
					<DateRangePicker
						dateRange={dateRange}
						onDateRangeChange={(range) => setDateRange(range ?? {from: undefined, to: undefined})}
					/>
					{dateRange.from && (
						<p className="wwc:text-sm wwc:text-muted-foreground wwc:mt-2">
							Selected: {dateRange.from.toLocaleDateString()}
							{dateRange.to && ` - ${dateRange.to.toLocaleDateString()}`}
						</p>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Date Range with Time</CardTitle>
						<CopyButton
							value="Date Picker - Date Range with Time"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Select a date range with From/To time selectors in a single popover.</CardDescription>
				</CardHeader>
				<CardContent>
					<DateRangeTimePicker
						dateRange={dateRangeTime}
						onDateRangeChange={(range) => setDateRangeTime(range ?? {from: undefined, to: undefined})}
					/>
					{dateRangeTime.from && (
						<p className="wwc:text-sm wwc:text-muted-foreground wwc:mt-2">
							From: {dateRangeTime.from.toLocaleString()}
							{dateRangeTime.to && ` — wwc:To: ${dateRangeTime.to.toLocaleString()}`}
						</p>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Disabled</CardTitle>
						<CopyButton
							value="Date Picker - Disabled"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>A disabled date picker that cannot be interacted with.</CardDescription>
				</CardHeader>
				<CardContent>
					<DatePicker disabled placeholder="Date picker disabled" />
				</CardContent>
			</Card>

			{/* API Reference */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Date Picker - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Props for the{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<DatePicker>"}</code>{" "}
						component and its variants.
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
									{prop: "date", type: "Date | undefined", def: "—", desc: "The currently selected date."},
									{
										prop: "onDateChange",
										type: "(date: Date | undefined) => void",
										def: "—",
										desc: "Callback when the selected date changes.",
									},
									{
										prop: "placeholder",
										type: "string",
										def: '"Pick a date"',
										desc: "Placeholder text when no date is selected.",
									},
									{prop: "disabled", type: "boolean", def: "false", desc: "Whether the date picker is disabled."},
									{prop: "className", type: "string", def: "—", desc: "Additional CSS class names."},
									{prop: "label", type: "string", def: '"Date of birth"', desc: "Label text (DatePickerForm only)."},
									{
										prop: "description",
										type: "string",
										def: "—",
										desc: "Helper text below the picker (DatePickerForm only).",
									},
									{
										prop: "dateRange",
										type: "{ from: Date | undefined; to: Date | undefined }",
										def: "—",
										desc: "Selected date range (DateRangePicker only).",
									},
									{
										prop: "onDateRangeChange",
										type: "(range: { from: Date | undefined; to: Date | undefined }) => void",
										def: "—",
										desc: "Callback when range changes (DateRangePicker only).",
									},
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
							value="Date Picker - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import {
  DatePicker,
  DatePickerWithPresets,
  DatePickerForm,
  DateTimePicker,
  DateRangePicker,
} from "@/components/ui/date-picker"

const [date, setDate] = useState<Date>()

// Basic date picker
<DatePicker date={date} onDateChange={setDate} />

// With presets
<DatePickerWithPresets date={date} onDateChange={setDate} />

// Date of birth picker (with year/month dropdowns)
<DatePickerForm
  date={date}
  onDateChange={setDate}
  label="Date of birth"
  description="Select your birth date."
/>

// Date and time picker
<DateTimePicker date={date} onDateChange={setDate} />

// Date range picker
const [range, setRange] = useState({ from: undefined, to: undefined })
<DateRangePicker dateRange={range} onDateRangeChange={setRange} />

// Disabled
<DatePicker disabled />`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
