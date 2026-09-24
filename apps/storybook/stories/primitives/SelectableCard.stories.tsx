import type {Meta, StoryObj} from "storybook/internal/types";

import {SelectableCard, SelectableCardGroup} from "@corensystem/coren-ui/selectable-card";
import {useState} from "react";

const meta = {
	title: "Components/Primitives/SelectableCard",
	component: SelectableCard,
	tags: ["autodocs"],
} satisfies Meta<typeof SelectableCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => {
		const [selected, setSelected] = useState(false);
		return (
			<SelectableCard selected={selected} onSelect={setSelected} className="wwc:w-64">
				<h3 className="wwc:font-semibold">Basic Plan</h3>
				<p className="wwc:text-sm wwc:text-muted-foreground">$9/month</p>
			</SelectableCard>
		);
	},
};

export const SingleSelect: Story = {
	render: () => {
		const [value, setValue] = useState<string[]>([]);
		return (
			<SelectableCardGroup value={value} onValueChange={setValue} className="wwc:grid-cols-3 wwc:max-w-2xl">
				<SelectableCard value="basic" className="wwc:text-center">
					<h3 className="wwc:font-semibold">Basic</h3>
					<p className="wwc:text-2xl wwc:font-bold wwc:my-2">$9</p>
					<p className="wwc:text-sm wwc:text-muted-foreground">per month</p>
				</SelectableCard>
				<SelectableCard value="pro" className="wwc:text-center">
					<h3 className="wwc:font-semibold">Pro</h3>
					<p className="wwc:text-2xl wwc:font-bold wwc:my-2">$29</p>
					<p className="wwc:text-sm wwc:text-muted-foreground">per month</p>
				</SelectableCard>
				<SelectableCard value="enterprise" className="wwc:text-center">
					<h3 className="wwc:font-semibold">Enterprise</h3>
					<p className="wwc:text-2xl wwc:font-bold wwc:my-2">$99</p>
					<p className="wwc:text-sm wwc:text-muted-foreground">per month</p>
				</SelectableCard>
			</SelectableCardGroup>
		);
	},
};

export const MultiSelect: Story = {
	render: () => {
		const [value, setValue] = useState<string[]>([]);
		return (
			<div className="wwc:space-y-4">
				<p className="wwc:text-sm wwc:text-muted-foreground">Selected: {value.join(", ") || "None"}</p>
				<SelectableCardGroup multiple value={value} onValueChange={setValue} className="wwc:grid-cols-2 wwc:max-w-md">
					<SelectableCard value="notifications">
						<h3 className="wwc:font-medium">Notifications</h3>
						<p className="wwc:text-sm wwc:text-muted-foreground">Receive email notifications</p>
					</SelectableCard>
					<SelectableCard value="newsletter">
						<h3 className="wwc:font-medium">Newsletter</h3>
						<p className="wwc:text-sm wwc:text-muted-foreground">Weekly product updates</p>
					</SelectableCard>
					<SelectableCard value="marketing">
						<h3 className="wwc:font-medium">Marketing</h3>
						<p className="wwc:text-sm wwc:text-muted-foreground">Promotional emails</p>
					</SelectableCard>
					<SelectableCard value="security">
						<h3 className="wwc:font-medium">Security</h3>
						<p className="wwc:text-sm wwc:text-muted-foreground">Security alerts</p>
					</SelectableCard>
				</SelectableCardGroup>
			</div>
		);
	},
};

export const CheckmarkPositions: Story = {
	render: () => (
		<div className="wwc:grid wwc:grid-cols-2 wwc:gap-4 wwc:max-w-md">
			<SelectableCard selected checkmarkPosition="top-left">
				<p className="wwc:pl-6">Top Left</p>
			</SelectableCard>
			<SelectableCard selected checkmarkPosition="top-right">
				<p>Top Right</p>
			</SelectableCard>
			<SelectableCard selected checkmarkPosition="bottom-left">
				<p className="wwc:pl-6">Bottom Left</p>
			</SelectableCard>
			<SelectableCard selected checkmarkPosition="bottom-right">
				<p>Bottom Right</p>
			</SelectableCard>
		</div>
	),
};

export const Disabled: Story = {
	render: () => (
		<SelectableCard disabled className="wwc:w-64">
			<h3 className="wwc:font-semibold">Disabled Card</h3>
			<p className="wwc:text-sm wwc:text-muted-foreground">Cannot be selected</p>
		</SelectableCard>
	),
};
