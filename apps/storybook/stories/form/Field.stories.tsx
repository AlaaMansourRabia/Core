import type {Meta, StoryObj} from "storybook/internal/types";

import {Field, FieldDescription, FieldError, FieldLabel} from "@wakecap/core-ui/field";
import {Input} from "@wakecap/core-ui/input";
import {Textarea} from "@wakecap/core-ui/textarea";

const meta = {
	title: "Components/Forms/Field",
	component: Field,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Compound component for form field layout. Combines a label, input, description, and error message with consistent spacing.",
			},
		},
	},
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Field className="wwc:w-[320px]">
			<FieldLabel>Email</FieldLabel>
			<Input type="email" placeholder="name@example.com" />
		</Field>
	),
};

export const WithDescription: Story = {
	render: () => (
		<Field className="wwc:w-[320px]">
			<FieldLabel>Username</FieldLabel>
			<Input placeholder="wakecap-user" />
			<FieldDescription>This is your public display name.</FieldDescription>
		</Field>
	),
};

export const WithError: Story = {
	render: () => (
		<Field className="wwc:w-[320px]">
			<FieldLabel>Email</FieldLabel>
			<Input type="email" placeholder="name@example.com" aria-invalid="true" />
			<FieldError>Please enter a valid email address.</FieldError>
		</Field>
	),
};

export const WithDescriptionAndError: Story = {
	render: () => (
		<Field className="wwc:w-[320px]">
			<FieldLabel>Password</FieldLabel>
			<Input type="password" placeholder="Enter password" aria-invalid="true" />
			<FieldDescription>Must be at least 8 characters.</FieldDescription>
			<FieldError>Password is too short.</FieldError>
		</Field>
	),
};

export const WithTextarea: Story = {
	render: () => (
		<Field className="wwc:w-[320px]">
			<FieldLabel>Bio</FieldLabel>
			<Textarea placeholder="Tell us about yourself..." />
			<FieldDescription>Max 500 characters.</FieldDescription>
		</Field>
	),
};

export const MultipleFields: Story = {
	render: () => (
		<div className="wwc:flex wwc:w-[320px] wwc:flex-col wwc:gap-4">
			<Field>
				<FieldLabel>First name</FieldLabel>
				<Input placeholder="John" />
			</Field>
			<Field>
				<FieldLabel>Last name</FieldLabel>
				<Input placeholder="Doe" />
			</Field>
			<Field>
				<FieldLabel>Email</FieldLabel>
				<Input type="email" placeholder="name@example.com" />
				<FieldDescription>We will never share your email.</FieldDescription>
			</Field>
		</div>
	),
};
