import type {Meta, StoryObj} from "storybook/internal/types";

import {MultiSelect} from "@corensystem/core-ui/multi-select";
import * as React from "react";
import {expect, screen, userEvent, waitFor, within} from "storybook/test";

const projects = [
	{value: "8f1d-neom", label: "NEOM"},
	{value: "2c4a-qiddiya", label: "Qiddiya"},
	{value: "7b3e-diriyah", label: "Diriyah"},
	{value: "9a5f-red-sea", label: "Red Sea Global"},
	{value: "1e6c-roshn", label: "ROSHN"},
	{value: "4d8b-aramco", label: "Aramco", disabled: true},
];

const meta = {
	title: "Components/Forms/MultiSelect",
	component: MultiSelect,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"A searchable multi-select field combining a Popover, Command palette, and Button. The dropdown stays open while picking, and selections render as removable pills below the field. Search matches the option label, so opaque ids can be used as values.",
			},
		},
	},
	args: {
		options: projects,
		value: [],
		onValueChange: () => {},
		placeholder: "Select project(s)",
		searchPlaceholder: "Search projects...",
		emptyMessage: "No project found.",
	},
	decorators: [
		(Story) => (
			<div className="wwc:w-[320px]">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
	args: {
		value: ["8f1d-neom", "7b3e-diriyah"],
	},
};

export const Invalid: Story = {
	args: {
		invalid: true,
	},
};

export const Disabled: Story = {
	args: {
		value: ["8f1d-neom"],
		disabled: true,
	},
};

export const WithoutPills: Story = {
	args: {
		value: ["8f1d-neom", "7b3e-diriyah"],
		showPills: false,
	},
};

export const SelectInteraction: Story = {
	render: (args) => {
		const [value, setValue] = React.useState<string[]>([]);
		return <MultiSelect {...args} value={value} onValueChange={setValue} />;
	},
	play: async ({canvasElement}) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole("combobox");

		await userEvent.click(trigger);
		await userEvent.click(await screen.findByRole("option", {name: /neom/i}));
		await userEvent.click(await screen.findByRole("option", {name: /diriyah/i}));
		await userEvent.keyboard("{Escape}");

		await waitFor(() => expect(trigger).toHaveTextContent("2 selected"));

		// Removing a pill drops it from the value.
		await userEvent.click(canvas.getByRole("button", {name: "Remove NEOM"}));
		await waitFor(() => expect(trigger).toHaveTextContent("1 selected"));
	},
};
