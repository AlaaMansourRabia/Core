import type {Meta, StoryObj} from "storybook/internal/types";

import {Toggle} from "@core/core-ui/toggle";
import {expect, userEvent, within} from "storybook/test";

const meta = {
	title: "Components/Primitives/Toggle",
	component: Toggle,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["default", "outline"],
		},
		size: {
			control: "select",
			options: ["default", "sm", "lg"],
		},
		disabled: {control: "boolean"},
	},
	args: {
		children: "Toggle",
		variant: "default",
		size: "default",
		disabled: false,
	},
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Outline: Story = {
	args: {variant: "outline"},
};

export const Small: Story = {
	args: {size: "sm", children: "Small"},
};

export const Large: Story = {
	args: {size: "lg", children: "Large"},
};

export const Pressed: Story = {
	args: {defaultPressed: true, children: "Pressed"},
};

export const Disabled: Story = {
	args: {disabled: true},
};

export const AllVariants: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-3">
			<Toggle variant="default">Default</Toggle>
			<Toggle variant="outline">Outline</Toggle>
		</div>
	),
};

export const AllSizes: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-3">
			<Toggle size="sm">Small</Toggle>
			<Toggle size="default">Default</Toggle>
			<Toggle size="lg">Large</Toggle>
		</div>
	),
};

export const WithBoldExample: Story = {
	render: () => (
		<Toggle aria-label="Toggle bold" variant="outline">
			<span className="wwc:font-bold">B</span>
		</Toggle>
	),
};

export const PressInteraction: Story = {
	play: async ({canvasElement}) => {
		const canvas = within(canvasElement);
		const toggle = canvas.getByRole("button");

		await expect(toggle).toHaveAttribute("aria-pressed", "false");
		await userEvent.click(toggle);
		await expect(toggle).toHaveAttribute("aria-pressed", "true");
		await userEvent.click(toggle);
		await expect(toggle).toHaveAttribute("aria-pressed", "false");
	},
};
