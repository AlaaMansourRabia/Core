import type {Meta, StoryObj} from "storybook/internal/types";

import {Progress} from "@wakecap/core-ui/progress";
import * as React from "react";

const meta = {
	title: "Components/Primitives/Progress",
	component: Progress,
	tags: ["autodocs"],
	argTypes: {
		value: {control: {type: "range", min: 0, max: 100, step: 1}},
	},
	args: {
		value: 50,
	},
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => <Progress value={args.value} className="wwc:w-[400px]" />,
};

export const Empty: Story = {
	args: {value: 0},
	render: (args) => <Progress value={args.value} className="wwc:w-[400px]" />,
};

export const Quarter: Story = {
	args: {value: 25},
	render: (args) => <Progress value={args.value} className="wwc:w-[400px]" />,
};

export const Half: Story = {
	args: {value: 50},
	render: (args) => <Progress value={args.value} className="wwc:w-[400px]" />,
};

export const ThreeQuarters: Story = {
	args: {value: 75},
	render: (args) => <Progress value={args.value} className="wwc:w-[400px]" />,
};

export const Complete: Story = {
	args: {value: 100},
	render: (args) => <Progress value={args.value} className="wwc:w-[400px]" />,
};

export const WithLabel: Story = {
	args: {value: 66},
	render: (args) => (
		<div className="wwc:space-y-2 wwc:w-[400px]">
			<div className="wwc:flex wwc:justify-between wwc:text-sm">
				<span>Uploading...</span>
				<span className="wwc:text-muted-foreground">{args.value}%</span>
			</div>
			<Progress value={args.value} />
		</div>
	),
};

export const MultipleSteps: Story = {
	render: () => {
		const [steps] = React.useState([
			{label: "Step 1: Upload", value: 100},
			{label: "Step 2: Process", value: 60},
			{label: "Step 3: Complete", value: 0},
		]);
		return (
			<div className="wwc:space-y-4 wwc:w-[400px]">
				{steps.map((step) => (
					<div key={step.label} className="wwc:space-y-1">
						<span className="wwc:text-sm">{step.label}</span>
						<Progress value={step.value} />
					</div>
				))}
			</div>
		);
	},
};
