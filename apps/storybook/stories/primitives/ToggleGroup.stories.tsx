import type {Meta, StoryObj} from "storybook/internal/types";

import {ToggleGroup, ToggleGroupItem} from "@core/core-ui/toggle-group";

const meta = {
	title: "Components/Primitives/ToggleGroup",
	component: ToggleGroup,
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
		type: {
			control: "select",
			options: ["single", "multiple"],
		},
		disabled: {control: "boolean"},
	},
	args: {
		variant: "default",
		size: "default",
		type: "single",
		disabled: false,
	},
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => (
		<ToggleGroup {...args}>
			<ToggleGroupItem value="left">Left</ToggleGroupItem>
			<ToggleGroupItem value="center">Center</ToggleGroupItem>
			<ToggleGroupItem value="right">Right</ToggleGroupItem>
		</ToggleGroup>
	),
};

export const Outline: Story = {
	render: (args) => (
		<ToggleGroup {...args} variant="outline">
			<ToggleGroupItem value="left">Left</ToggleGroupItem>
			<ToggleGroupItem value="center">Center</ToggleGroupItem>
			<ToggleGroupItem value="right">Right</ToggleGroupItem>
		</ToggleGroup>
	),
};

export const Multiple: Story = {
	render: (args) => (
		<ToggleGroup {...args} type="multiple">
			<ToggleGroupItem value="bold">
				<span className="wwc:font-bold">B</span>
			</ToggleGroupItem>
			<ToggleGroupItem value="italic">
				<span className="wwc:italic">I</span>
			</ToggleGroupItem>
			<ToggleGroupItem value="underline">
				<span className="wwc:underline">U</span>
			</ToggleGroupItem>
		</ToggleGroup>
	),
};

export const Small: Story = {
	render: () => (
		<ToggleGroup type="single" size="sm">
			<ToggleGroupItem value="a">A</ToggleGroupItem>
			<ToggleGroupItem value="b">B</ToggleGroupItem>
			<ToggleGroupItem value="c">C</ToggleGroupItem>
		</ToggleGroup>
	),
};

export const Large: Story = {
	render: () => (
		<ToggleGroup type="single" size="lg">
			<ToggleGroupItem value="a">A</ToggleGroupItem>
			<ToggleGroupItem value="b">B</ToggleGroupItem>
			<ToggleGroupItem value="c">C</ToggleGroupItem>
		</ToggleGroup>
	),
};

export const Disabled: Story = {
	render: () => (
		<ToggleGroup type="single" disabled>
			<ToggleGroupItem value="a">A</ToggleGroupItem>
			<ToggleGroupItem value="b">B</ToggleGroupItem>
			<ToggleGroupItem value="c">C</ToggleGroupItem>
		</ToggleGroup>
	),
};

export const AllVariants: Story = {
	render: () => (
		<div className="wwc:space-y-4">
			<div className="wwc:space-y-1">
				<p className="wwc:text-sm wwc:text-muted-foreground">Default variant</p>
				<ToggleGroup type="single" variant="default">
					<ToggleGroupItem value="a">A</ToggleGroupItem>
					<ToggleGroupItem value="b">B</ToggleGroupItem>
					<ToggleGroupItem value="c">C</ToggleGroupItem>
				</ToggleGroup>
			</div>
			<div className="wwc:space-y-1">
				<p className="wwc:text-sm wwc:text-muted-foreground">Outline variant</p>
				<ToggleGroup type="single" variant="outline">
					<ToggleGroupItem value="a">A</ToggleGroupItem>
					<ToggleGroupItem value="b">B</ToggleGroupItem>
					<ToggleGroupItem value="c">C</ToggleGroupItem>
				</ToggleGroup>
			</div>
		</div>
	),
};
