import type {Meta, StoryObj} from "storybook/internal/types";

import {Label} from "@wakecap/core-ui/label";
import {Switch} from "@wakecap/core-ui/switch";
import {expect, userEvent, within} from "storybook/test";

const meta = {
	title: "Components/Primitives/Switch",
	component: Switch,
	tags: ["autodocs"],
	argTypes: {
		disabled: {control: "boolean"},
		defaultChecked: {control: "boolean"},
	},
	args: {
		disabled: false,
		defaultChecked: false,
	},
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
	args: {defaultChecked: true},
};

export const Disabled: Story = {
	args: {disabled: true},
};

export const DisabledChecked: Story = {
	args: {disabled: true, defaultChecked: true},
};

export const WithLabel: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-center wwc:space-x-2">
			<Switch id="airplane-mode" />
			<Label htmlFor="airplane-mode">Airplane Mode</Label>
		</div>
	),
};

export const FormExample: Story = {
	render: () => (
		<div className="wwc:space-y-4">
			<div className="wwc:flex wwc:items-center wwc:justify-between wwc:rounded-lg wwc:border wwc:p-3">
				<div className="wwc:space-y-0.5">
					<Label className="wwc:text-base">Marketing emails</Label>
					<p className="wwc:text-sm wwc:text-muted-foreground">Receive emails about new products and features.</p>
				</div>
				<Switch defaultChecked />
			</div>
			<div className="wwc:flex wwc:items-center wwc:justify-between wwc:rounded-lg wwc:border wwc:p-3">
				<div className="wwc:space-y-0.5">
					<Label className="wwc:text-base">Security emails</Label>
					<p className="wwc:text-sm wwc:text-muted-foreground">Receive emails about account activity.</p>
				</div>
				<Switch defaultChecked disabled />
			</div>
		</div>
	),
};

export const ToggleInteraction: Story = {
	play: async ({canvasElement}) => {
		const canvas = within(canvasElement);
		const toggle = canvas.getByRole("switch");

		await expect(toggle).toHaveAttribute("aria-checked", "false");
		await userEvent.click(toggle);
		await expect(toggle).toHaveAttribute("aria-checked", "true");
		await userEvent.click(toggle);
		await expect(toggle).toHaveAttribute("aria-checked", "false");
	},
};
