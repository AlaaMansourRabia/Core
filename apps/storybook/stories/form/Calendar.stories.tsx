import type {Meta, StoryObj} from "storybook/internal/types";

import {Calendar} from "@wakecap/core-ui/calendar";
import {addDays} from "date-fns";
import * as React from "react";
import {type DateRange as DayPickerDateRange} from "react-day-picker";
import {expect, userEvent, within} from "storybook/test";

// Fixed date for deterministic Chromatic snapshots
const FIXED_TODAY = new Date(2026, 3, 15); // April 15, 2026

const meta = {
	title: "Components/Forms/Calendar",
	component: Calendar,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Date picker calendar built on react-day-picker. Supports single date, date range, and multiple month layouts with dropdown navigation.",
			},
		},
	},
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => {
		const [date, setDate] = React.useState<Date | undefined>(FIXED_TODAY);
		return <Calendar mode="single" selected={date} onSelect={setDate} className="wwc:rounded-md wwc:border" />;
	},
};

export const DateRangeSelection: Story = {
	render: () => {
		const [range, setRange] = React.useState<DayPickerDateRange | undefined>({
			from: FIXED_TODAY,
			to: addDays(FIXED_TODAY, 7),
		});
		return (
			<Calendar
				mode="range"
				selected={range}
				onSelect={setRange}
				numberOfMonths={2}
				className="wwc:rounded-md wwc:border"
			/>
		);
	},
};

export const MultipleMonths: Story = {
	render: () => <Calendar mode="single" numberOfMonths={2} className="wwc:rounded-md wwc:border" />,
};

export const WithDropdowns: Story = {
	render: () => (
		<Calendar
			mode="single"
			captionLayout="dropdown"
			fromYear={2020}
			toYear={2030}
			className="wwc:rounded-md wwc:border"
		/>
	),
};

export const DisabledDates: Story = {
	render: () => {
		return <Calendar mode="single" disabled={{before: FIXED_TODAY}} className="wwc:rounded-md wwc:border" />;
	},
};

export const DisabledWeekends: Story = {
	render: () => <Calendar mode="single" disabled={{dayOfWeek: [0, 6]}} className="wwc:rounded-md wwc:border" />,
};

export const NavigationInteraction: Story = {
	render: () => <Calendar mode="single" className="wwc:rounded-md wwc:border" />,
	play: async ({canvasElement}) => {
		const canvas = within(canvasElement);

		const nextButton = canvas.getByRole("button", {name: /next month/i});
		await userEvent.click(nextButton);

		const prevButton = canvas.getByRole("button", {name: /previous month/i});
		await userEvent.click(prevButton);
		await userEvent.click(prevButton);

		await expect(prevButton).toBeVisible();
	},
};
