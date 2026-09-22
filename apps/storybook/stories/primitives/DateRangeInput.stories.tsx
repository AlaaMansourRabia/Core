import type {Meta, StoryObj} from "storybook/internal/types";
import {useState} from "react";

import {DateRangeInput, DateRange} from "@core/core-ui/date-range-input";

const meta = {
	title: "Components/Primitives/DateRangeInput",
	component: DateRangeInput,
	tags: ["autodocs"],
} satisfies Meta<typeof DateRangeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => {
		const [range, setRange] = useState<DateRange | undefined>();
		return (
			<div className="wwc:w-[300px]">
				<DateRangeInput value={range} onChange={setRange} />
			</div>
		);
	},
};

export const WithInitialValue: Story = {
	render: () => {
		const [range, setRange] = useState<DateRange | undefined>({
			from: new Date(),
			to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		});
		return (
			<div className="wwc:w-[300px]">
				<DateRangeInput value={range} onChange={setRange} />
			</div>
		);
	},
};

export const SingleMonth: Story = {
	render: () => {
		const [range, setRange] = useState<DateRange | undefined>();
		return (
			<div className="wwc:w-[300px]">
				<DateRangeInput value={range} onChange={setRange} numberOfMonths={1} />
			</div>
		);
	},
};

export const Disabled: Story = {
	render: () => (
		<div className="wwc:w-[300px]">
			<DateRangeInput disabled />
		</div>
	),
};

export const WithMinMax: Story = {
	render: () => {
		const [range, setRange] = useState<DateRange | undefined>();
		const today = new Date();
		const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
		return (
			<div className="wwc:w-[300px]">
				<DateRangeInput value={range} onChange={setRange} minDate={today} maxDate={nextMonth} />
				<p className="wwc:text-xs wwc:text-muted-foreground wwc:mt-2">Only dates between today and next month</p>
			</div>
		);
	},
};
