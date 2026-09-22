import type {Meta, StoryObj} from "storybook/internal/types";

import {DateTimeInput} from "@corensystem/core-ui/date-time-input";
import {useState} from "react";

const meta = {
	title: "Components/Primitives/DateTimeInput",
	component: DateTimeInput,
	tags: ["autodocs"],
} satisfies Meta<typeof DateTimeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => {
		const [value, setValue] = useState<Date | undefined>(new Date());
		return (
			<div className="wwc:w-80">
				<DateTimeInput value={value} onChange={setValue} />
				<p className="wwc:mt-2 wwc:text-sm wwc:text-muted-foreground">Selected: {value?.toLocaleString() || "None"}</p>
			</div>
		);
	},
};

export const WithLabel: Story = {
	render: () => {
		const [value, setValue] = useState<Date | undefined>(new Date());
		return (
			<div className="wwc:w-80 wwc:space-y-2">
				<label className="wwc:text-sm wwc:font-medium">Event Date & Time</label>
				<DateTimeInput value={value} onChange={setValue} />
			</div>
		);
	},
};

export const MinMaxConstraints: Story = {
	render: () => {
		const today = new Date();
		const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
		const [value, setValue] = useState<Date | undefined>(today);
		return (
			<div className="wwc:w-80 wwc:space-y-2">
				<label className="wwc:text-sm wwc:font-medium">Select within next 7 days</label>
				<DateTimeInput value={value} onChange={setValue} minDate={today} maxDate={nextWeek} />
			</div>
		);
	},
};

export const MinuteSteps: Story = {
	render: () => {
		const [value15, setValue15] = useState<Date | undefined>(new Date());
		const [value30, setValue30] = useState<Date | undefined>(new Date());
		return (
			<div className="wwc:space-y-4 wwc:w-80">
				<div className="wwc:space-y-2">
					<label className="wwc:text-sm wwc:font-medium">15-minute steps</label>
					<DateTimeInput value={value15} onChange={setValue15} minuteStep={15} />
				</div>
				<div className="wwc:space-y-2">
					<label className="wwc:text-sm wwc:font-medium">30-minute steps</label>
					<DateTimeInput value={value30} onChange={setValue30} minuteStep={30} />
				</div>
			</div>
		);
	},
};

export const TimeFormat12h: Story = {
	render: () => {
		const [value, setValue] = useState<Date | undefined>(new Date());
		return (
			<div className="wwc:w-80 wwc:space-y-2">
				<label className="wwc:text-sm wwc:font-medium">12-hour format</label>
				<DateTimeInput value={value} onChange={setValue} timeFormat="12h" />
			</div>
		);
	},
};

export const TimeFormat24h: Story = {
	render: () => {
		const [value, setValue] = useState<Date | undefined>(new Date());
		return (
			<div className="wwc:w-80 wwc:space-y-2">
				<label className="wwc:text-sm wwc:font-medium">24-hour format</label>
				<DateTimeInput value={value} onChange={setValue} timeFormat="24h" />
			</div>
		);
	},
};

export const Disabled: Story = {
	render: () => {
		return (
			<div className="wwc:w-80 wwc:space-y-2">
				<label className="wwc:text-sm wwc:font-medium">Disabled</label>
				<DateTimeInput value={new Date()} disabled />
			</div>
		);
	},
};

export const CustomPlaceholder: Story = {
	render: () => {
		const [value, setValue] = useState<Date | undefined>();
		return (
			<div className="wwc:w-80 wwc:space-y-2">
				<label className="wwc:text-sm wwc:font-medium">When should we notify you?</label>
				<DateTimeInput value={value} onChange={setValue} placeholder="Pick a date and time..." />
			</div>
		);
	},
};
