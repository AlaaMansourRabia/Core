import type {Meta, StoryObj} from "storybook/internal/types";

import {
	DatePicker,
	DatePickerForm,
	DatePickerWithInput,
	DatePickerWithPresets,
	DateRangePicker,
	DateRangeTimePicker,
	DateTimePicker,
} from "@wakecap/core-ui/date-picker";
import * as React from "react";

const meta = {
	title: "Components/Forms/Date Picker",
	component: DatePicker,
	tags: ["autodocs"],
	argTypes: {
		placeholder: {control: "text", description: "Placeholder text when no date is selected."},
		disabled: {control: "boolean", description: "Disable the date picker."},
		className: {control: "text", description: "Additional CSS classes for the trigger button."},
	},
	args: {
		placeholder: "Pick a date",
		disabled: false,
	},
	parameters: {
		docs: {
			description: {
				component:
					"Date picker with 7 variants: basic, presets, date of birth, input, date-time, range, and range with time. Built on react-day-picker with popover UI.",
			},
		},
	},
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => {
		const [date, setDate] = React.useState<Date | undefined>();
		return (
			<div className="wwc:space-y-2">
				<DatePicker
					date={date}
					onDateChange={setDate}
					placeholder={args.placeholder}
					disabled={args.disabled}
					className={args.className}
				/>
				{date && <p className="wwc:text-sm wwc:text-muted-foreground">Selected: {date.toLocaleDateString()}</p>}
			</div>
		);
	},
};

export const WithPresets: Story = {
	render: () => {
		const [date, setDate] = React.useState<Date | undefined>();
		return (
			<div className="wwc:space-y-2">
				<DatePickerWithPresets date={date} onDateChange={setDate} />
				{date && <p className="wwc:text-sm wwc:text-muted-foreground">Selected: {date.toLocaleDateString()}</p>}
			</div>
		);
	},
};

export const DateOfBirth: Story = {
	render: () => {
		const [date, setDate] = React.useState<Date | undefined>();
		return (
			<div className="wwc:space-y-2">
				<DatePickerForm
					date={date}
					onDateChange={setDate}
					label="Date of birth"
					description="Used to calculate your age."
				/>
				{date && <p className="wwc:text-sm wwc:text-muted-foreground">Selected: {date.toLocaleDateString()}</p>}
			</div>
		);
	},
};

export const WithInput: Story = {
	render: () => {
		const [date, setDate] = React.useState<Date | undefined>();
		return (
			<div className="wwc:space-y-2">
				<DatePickerWithInput date={date} onDateChange={setDate} />
				{date && <p className="wwc:text-sm wwc:text-muted-foreground">Selected: {date.toLocaleDateString()}</p>}
			</div>
		);
	},
};

export const DateTime: Story = {
	render: () => {
		const [date, setDate] = React.useState<Date | undefined>();
		return (
			<div className="wwc:space-y-2">
				<DateTimePicker date={date} onDateChange={setDate} />
				{date && <p className="wwc:text-sm wwc:text-muted-foreground">Selected: {date.toLocaleString()}</p>}
			</div>
		);
	},
};

export const Range: Story = {
	render: () => {
		const [range, setRange] = React.useState<{from: Date | undefined; to: Date | undefined}>({
			from: undefined,
			to: undefined,
		});
		return (
			<div className="wwc:space-y-2">
				<DateRangePicker dateRange={range} onDateRangeChange={(r) => setRange(r ?? {from: undefined, to: undefined})} />
				{range.from && (
					<p className="wwc:text-sm wwc:text-muted-foreground">
						Selected: {range.from.toLocaleDateString()}
						{range.to && ` - ${range.to.toLocaleDateString()}`}
					</p>
				)}
			</div>
		);
	},
};

export const RangeWithTime: Story = {
	render: () => {
		const [range, setRange] = React.useState<{from: Date | undefined; to: Date | undefined}>({
			from: undefined,
			to: undefined,
		});
		return (
			<div className="wwc:space-y-2">
				<DateRangeTimePicker
					dateRange={range}
					onDateRangeChange={(r) => setRange(r ?? {from: undefined, to: undefined})}
				/>
				{range.from && (
					<p className="wwc:text-sm wwc:text-muted-foreground">
						From: {range.from.toLocaleString()}
						{range.to && ` — To: ${range.to.toLocaleString()}`}
					</p>
				)}
			</div>
		);
	},
};

export const Disabled: Story = {
	args: {
		disabled: true,
		placeholder: "Disabled picker",
	},
	render: (args) => <DatePicker disabled={args.disabled} placeholder={args.placeholder} />,
};
