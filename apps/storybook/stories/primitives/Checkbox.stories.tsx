import type {Meta, StoryObj} from "storybook/internal/types";

import {Checkbox} from "@corensystem/core-ui/checkbox";
import {Label} from "@corensystem/core-ui/label";
import {expect, userEvent, within} from "storybook/test";

const meta = {
	title: "Components/Primitives/Checkbox",
	component: Checkbox,
	tags: ["autodocs"],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-center wwc:space-x-2">
			<Checkbox id="terms" />
			<Label htmlFor="terms">Accept terms and conditions</Label>
		</div>
	),
};

export const Checked: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-center wwc:space-x-2">
			<Checkbox id="checked" defaultChecked />
			<Label htmlFor="checked">Checked</Label>
		</div>
	),
};

export const Disabled: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-center wwc:space-x-2">
			<Checkbox id="disabled" disabled />
			<Label htmlFor="disabled" className="wwc:opacity-50">
				Disabled
			</Label>
		</div>
	),
};

export const DisabledChecked: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-center wwc:space-x-2">
			<Checkbox id="disabled-checked" disabled defaultChecked />
			<Label htmlFor="disabled-checked" className="wwc:opacity-50">
				Disabled Checked
			</Label>
		</div>
	),
};

export const WithDescription: Story = {
	render: () => (
		<div className="wwc:items-top wwc:flex wwc:space-x-2">
			<Checkbox id="terms2" />
			<div className="wwc:grid wwc:gap-1.5 wwc:leading-none">
				<Label htmlFor="terms2">Accept terms and conditions</Label>
				<p className="wwc:text-sm wwc:text-muted-foreground">You agree to our Terms of Service and Privacy Policy.</p>
			</div>
		</div>
	),
};

export const FormExample: Story = {
	render: () => (
		<div className="wwc:space-y-3">
			<div className="wwc:flex wwc:items-center wwc:space-x-2">
				<Checkbox id="email-notifications" defaultChecked />
				<Label htmlFor="email-notifications">Email notifications</Label>
			</div>
			<div className="wwc:flex wwc:items-center wwc:space-x-2">
				<Checkbox id="sms-notifications" />
				<Label htmlFor="sms-notifications">SMS notifications</Label>
			</div>
			<div className="wwc:flex wwc:items-center wwc:space-x-2">
				<Checkbox id="push-notifications" disabled />
				<Label htmlFor="push-notifications" className="wwc:opacity-50">
					Push notifications (coming soon)
				</Label>
			</div>
		</div>
	),
};

export const ToggleInteraction: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-center wwc:space-x-2">
			<Checkbox id="toggle" />
			<Label htmlFor="toggle">Toggle me</Label>
		</div>
	),
	play: async ({canvasElement}) => {
		const canvas = within(canvasElement);
		const checkbox = canvas.getByRole("checkbox");

		await expect(checkbox).not.toBeChecked();
		await userEvent.click(checkbox);
		await expect(checkbox).toBeChecked();
		await userEvent.click(checkbox);
		await expect(checkbox).not.toBeChecked();
	},
};

export const AriaInteraction: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-center wwc:space-x-2">
			<Checkbox id="aria" defaultChecked />
			<Label htmlFor="aria">Aria checked</Label>
		</div>
	),
	play: async ({canvasElement}) => {
		const canvas = within(canvasElement);
		const checkbox = canvas.getByRole("checkbox");

		await expect(checkbox).toHaveAttribute("aria-checked", "true");
		await userEvent.click(checkbox);
		await expect(checkbox).toHaveAttribute("aria-checked", "false");
	},
};
