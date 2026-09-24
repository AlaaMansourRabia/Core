import type {Meta, StoryObj} from "storybook/internal/types";

import {MoreMenu} from "@corensystem/coren-ui/more-menu";

const meta = {
	title: "Components/Primitives/MoreMenu",
	component: MoreMenu,
	tags: ["autodocs"],
} satisfies Meta<typeof meta>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
	{label: "Edit", value: "edit"},
	{label: "Duplicate", value: "duplicate"},
	{label: "Archive", value: "archive"},
	{label: "Delete", value: "delete"},
];

export const Horizontal: Story = {
	render: () => <MoreMenu options={options} orientation="horizontal" onSelect={(value) => console.log(value)} />,
};

export const Vertical: Story = {
	render: () => <MoreMenu options={options} orientation="vertical" onSelect={(value) => console.log(value)} />,
};

export const WithDisabled: Story = {
	render: () => (
		<MoreMenu
			options={[
				{label: "Edit", value: "edit"},
				{label: "Delete", value: "delete", disabled: true},
			]}
			onSelect={(value) => console.log(value)}
		/>
	),
};
