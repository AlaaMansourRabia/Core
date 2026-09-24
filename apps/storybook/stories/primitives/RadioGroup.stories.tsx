import type {Meta, StoryObj} from "storybook/internal/types";

import {Label} from "@corensystem/coren-ui/label";
import {RadioGroup, RadioGroupItem} from "@corensystem/coren-ui/radio-group";
import {expect, userEvent, within} from "storybook/test";

const meta = {
	title: "Components/Primitives/RadioGroup",
	component: RadioGroup,
	tags: ["autodocs"],
	argTypes: {
		disabled: {control: "boolean"},
	},
	args: {
		disabled: false,
	},
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => (
		<RadioGroup defaultValue="option-1" {...args}>
			<div className="wwc:flex wwc:items-center wwc:space-x-2">
				<RadioGroupItem value="option-1" id="option-1" />
				<Label htmlFor="option-1">Option 1</Label>
			</div>
			<div className="wwc:flex wwc:items-center wwc:space-x-2">
				<RadioGroupItem value="option-2" id="option-2" />
				<Label htmlFor="option-2">Option 2</Label>
			</div>
			<div className="wwc:flex wwc:items-center wwc:space-x-2">
				<RadioGroupItem value="option-3" id="option-3" />
				<Label htmlFor="option-3">Option 3</Label>
			</div>
		</RadioGroup>
	),
};

export const Disabled: Story = {
	render: () => (
		<RadioGroup defaultValue="option-1" disabled>
			<div className="wwc:flex wwc:items-center wwc:space-x-2">
				<RadioGroupItem value="option-1" id="d-option-1" />
				<Label htmlFor="d-option-1">Option 1</Label>
			</div>
			<div className="wwc:flex wwc:items-center wwc:space-x-2">
				<RadioGroupItem value="option-2" id="d-option-2" />
				<Label htmlFor="d-option-2">Option 2</Label>
			</div>
		</RadioGroup>
	),
};

export const Horizontal: Story = {
	render: () => (
		<RadioGroup defaultValue="small" className="wwc:flex wwc:gap-4">
			<div className="wwc:flex wwc:items-center wwc:space-x-2">
				<RadioGroupItem value="small" id="size-small" />
				<Label htmlFor="size-small">Small</Label>
			</div>
			<div className="wwc:flex wwc:items-center wwc:space-x-2">
				<RadioGroupItem value="medium" id="size-medium" />
				<Label htmlFor="size-medium">Medium</Label>
			</div>
			<div className="wwc:flex wwc:items-center wwc:space-x-2">
				<RadioGroupItem value="large" id="size-large" />
				<Label htmlFor="size-large">Large</Label>
			</div>
		</RadioGroup>
	),
};

export const FormExample: Story = {
	render: () => (
		<div className="wwc:space-y-3">
			<Label className="wwc:text-base wwc:font-semibold">Notification preference</Label>
			<RadioGroup defaultValue="email">
				<div className="wwc:flex wwc:items-center wwc:space-x-2">
					<RadioGroupItem value="email" id="pref-email" />
					<Label htmlFor="pref-email">Email</Label>
				</div>
				<div className="wwc:flex wwc:items-center wwc:space-x-2">
					<RadioGroupItem value="sms" id="pref-sms" />
					<Label htmlFor="pref-sms">SMS</Label>
				</div>
				<div className="wwc:flex wwc:items-center wwc:space-x-2">
					<RadioGroupItem value="push" id="pref-push" />
					<Label htmlFor="pref-push">Push notification</Label>
				</div>
			</RadioGroup>
		</div>
	),
};

export const SelectionInteraction: Story = {
	render: () => (
		<RadioGroup defaultValue="option-1">
			<div className="wwc:flex wwc:items-center wwc:space-x-2">
				<RadioGroupItem value="option-1" id="r1" />
				<Label htmlFor="r1">Option 1</Label>
			</div>
			<div className="wwc:flex wwc:items-center wwc:space-x-2">
				<RadioGroupItem value="option-2" id="r2" />
				<Label htmlFor="r2">Option 2</Label>
			</div>
		</RadioGroup>
	),
	play: async ({canvasElement}) => {
		const canvas = within(canvasElement);
		const radios = canvas.getAllByRole("radio");

		await expect(radios[0]).toBeChecked();
		await expect(radios[1]).not.toBeChecked();

		await userEvent.click(radios[1]);
		await expect(radios[1]).toBeChecked();
		await expect(radios[0]).not.toBeChecked();
	},
};
