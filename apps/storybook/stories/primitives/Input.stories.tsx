import type {Meta, StoryObj} from "storybook/internal/types";

import {Field, FieldError, FieldLabel} from "@corensystem/core-ui/field";
import {Input} from "@corensystem/core-ui/input";
import {Label} from "@corensystem/core-ui/label";
import {expect, userEvent, within} from "storybook/test";

const meta = {
	title: "Components/Primitives/Input",
	component: Input,
	tags: ["autodocs"],
	excludeStories: ["coreInventory"],
	argTypes: {
		type: {
			control: "select",
			options: ["text", "password", "email", "number", "search", "tel", "url"],
		},
		placeholder: {control: "text"},
		disabled: {control: "boolean"},
	},
	args: {
		type: "text",
		placeholder: "Enter text...",
		disabled: false,
	},
	parameters: {
		docs: {
			description: {
				component:
					"Single-line text entry for a form field. **When to use:** one short value (name, email, search). **When NOT to " +
					"use:** multi-line text → `Textarea`; pick-from-a-known-list → `Select`/`Combobox`; a one-time code → `InputOTP`. " +
					"Always pair with a `Label` (or wire it inside a `Form` `Field` for validation + error display). Related: `Label`, " +
					"`Field`, `Textarea`, `Select`, `InputGroup`.",
			},
		},
	},
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const coreInventory = {
	templates: [],
	widgets: [],
	components: ["Field", "FieldError", "FieldLabel", "Input", "Label"],
	tokens: ["destructive"],
};

export const Default: Story = {};

export const WithValue: Story = {
	args: {defaultValue: "Hello World"},
};

export const Password: Story = {
	args: {type: "password", placeholder: "Enter password..."},
};

export const Email: Story = {
	args: {type: "email", placeholder: "name@example.com"},
};

export const Number: Story = {
	args: {type: "number", placeholder: "0"},
};

export const Disabled: Story = {
	args: {disabled: true, defaultValue: "Disabled input"},
};

export const File: Story = {
	args: {type: "file"},
};

export const WithLabel: Story = {
	parameters: {
		docs: {
			description: {story: "The default pairing: a `Label` bound to the input via `htmlFor`/`id` for accessibility."},
		},
	},
	render: () => (
		<div className="wwc:flex wwc:flex-col wwc:gap-1.5 wwc:max-w-xs">
			<Label htmlFor="project-name">Project name</Label>
			<Input id="project-name" placeholder="e.g. Tower A fit-out" />
		</div>
	),
};

export const ErrorState: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"An invalid field: set `aria-invalid` (the input shows the error ring) and render an error message below. " +
					"Inside a `Form`, `Field`/`FormMessage` does this wiring for you.",
			},
		},
	},
	render: () => (
		<Field
			className="wwc:max-w-xs"
			data-core-region="input-error-state"
			data-core-surface-owner="input"
			data-core-interaction="inspect invalid outline"
		>
			<FieldLabel htmlFor="email-err">Email</FieldLabel>
			<Input
				id="email-err"
				type="email"
				defaultValue="not-an-email"
				aria-invalid="true"
				data-core-artifact="input"
				data-core-interaction="focus invalid input"
			/>
			<FieldError>Enter a valid email address.</FieldError>
		</Field>
	),
	play: async ({canvasElement}) => {
		const canvas = within(canvasElement);
		const input = canvas.getByLabelText("Email");

		await expect(input).toHaveAttribute("aria-invalid", "true");
		await expect(input).toHaveClass(
			"wwc:aria-invalid:border-destructive",
			"wwc:aria-invalid:focus-visible:ring-destructive",
		);
	},
};

export const ReadOnly: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"`readOnly` shows a value the user can select/copy but not edit (vs `disabled`, which dims and removes it from the tab order).",
			},
		},
	},
	args: {readOnly: true, defaultValue: "WC-2026-0042"},
};

export const States: Story = {
	parameters: {
		docs: {
			description: {story: "The common states side by side: default, filled, focus-ring (error), read-only, disabled."},
		},
	},
	render: () => (
		<div className="wwc:flex wwc:flex-col wwc:gap-3 wwc:max-w-xs">
			<Input placeholder="Default" />
			<Input defaultValue="Filled value" />
			<Input defaultValue="invalid@" aria-invalid="true" />
			<Input readOnly defaultValue="Read-only" />
			<Input disabled defaultValue="Disabled" />
		</div>
	),
};

export const TypeInteraction: Story = {
	args: {placeholder: "Type here..."},
	play: async ({canvasElement}) => {
		const canvas = within(canvasElement);
		const input = canvas.getByPlaceholderText("Type here...");

		await userEvent.click(input);
		await userEvent.type(input, "Hello World");
		await expect(input).toHaveValue("Hello World");
	},
};

export const ClearInteraction: Story = {
	args: {defaultValue: "Clear me"},
	play: async ({canvasElement}) => {
		const canvas = within(canvasElement);
		const input = canvas.getByDisplayValue("Clear me");

		await userEvent.clear(input);
		await expect(input).toHaveValue("");
	},
};
