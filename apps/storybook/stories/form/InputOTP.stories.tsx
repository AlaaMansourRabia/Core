import type {Meta, StoryObj} from "storybook/internal/types";

import {InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot} from "@core/core-ui/input-otp";

const meta = {
	title: "Components/Forms/Input OTP",
	component: InputOTP,
	tags: ["autodocs"],
	argTypes: {
		maxLength: {control: {type: "number", min: 3, max: 8, step: 1}, description: "Total number of OTP slots."},
		disabled: {control: "boolean", description: "Disable all OTP input slots."},
	},
	parameters: {
		docs: {
			description: {
				component:
					"One-time password input component with individual character slots. Supports grouping slots with separators, built on top of input-otp.",
			},
		},
	},
} satisfies Meta<typeof InputOTP>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<InputOTP maxLength={6}>
			<InputOTPGroup>
				<InputOTPSlot index={0} />
				<InputOTPSlot index={1} />
				<InputOTPSlot index={2} />
				<InputOTPSlot index={3} />
				<InputOTPSlot index={4} />
				<InputOTPSlot index={5} />
			</InputOTPGroup>
		</InputOTP>
	),
};

export const WithSeparator: Story = {
	render: () => (
		<InputOTP maxLength={6}>
			<InputOTPGroup>
				<InputOTPSlot index={0} />
				<InputOTPSlot index={1} />
				<InputOTPSlot index={2} />
			</InputOTPGroup>
			<InputOTPSeparator />
			<InputOTPGroup>
				<InputOTPSlot index={3} />
				<InputOTPSlot index={4} />
				<InputOTPSlot index={5} />
			</InputOTPGroup>
		</InputOTP>
	),
};

export const FourDigits: Story = {
	render: () => (
		<InputOTP maxLength={4}>
			<InputOTPGroup>
				<InputOTPSlot index={0} />
				<InputOTPSlot index={1} />
				<InputOTPSlot index={2} />
				<InputOTPSlot index={3} />
			</InputOTPGroup>
		</InputOTP>
	),
};

export const Disabled: Story = {
	render: () => (
		<InputOTP maxLength={6} disabled>
			<InputOTPGroup>
				<InputOTPSlot index={0} />
				<InputOTPSlot index={1} />
				<InputOTPSlot index={2} />
			</InputOTPGroup>
			<InputOTPSeparator />
			<InputOTPGroup>
				<InputOTPSlot index={3} />
				<InputOTPSlot index={4} />
				<InputOTPSlot index={5} />
			</InputOTPGroup>
		</InputOTP>
	),
};
