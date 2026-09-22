import type {Meta, StoryObj} from "storybook/internal/types";

import {Timestamp} from "@corensystem/core-ui/timestamp";

const meta = {
	title: "Components/Primitives/Timestamp",
	component: Timestamp,
	tags: ["autodocs"],
} satisfies Meta<typeof meta>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = new Date();
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

export const Relative: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-col wwc:gap-2">
			<Timestamp date={twoHoursAgo} format="relative" />
			<Timestamp date={yesterday} format="relative" />
			<Timestamp date={lastWeek} format="relative" />
		</div>
	),
};

export const DateFormat: Story = {
	render: () => <Timestamp date={new Date("2024-01-15")} format="date" />,
};

export const DateTime: Story = {
	render: () => <Timestamp date={new Date("2024-01-15T14:30:00")} format="datetime" />,
};

export const Time: Story = {
	render: () => <Timestamp date={new Date("2024-01-15T14:30:00")} format="time" />,
};

export const CustomFormatter: Story = {
	render: () => (
		<Timestamp
			date={new Date("2024-01-15T14:30:00")}
			formatter={(date) => `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`}
		/>
	),
};
