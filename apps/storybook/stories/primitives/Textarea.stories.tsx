import type {Meta, StoryObj} from "storybook/internal/types";

import {Textarea} from "@corensystem/core-ui/textarea";
import {expect, userEvent, within} from "storybook/test";

const meta = {
	title: "Components/Primitives/Textarea",
	component: Textarea,
	tags: ["autodocs"],
	argTypes: {
		placeholder: {control: "text"},
		disabled: {control: "boolean"},
		rows: {control: "number"},
	},
	args: {
		placeholder: "Type your message here...",
		disabled: false,
	},
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
	args: {defaultValue: "This is some default text in the textarea."},
};

export const CustomRows: Story = {
	args: {rows: 8, placeholder: "Larger textarea..."},
};

export const Disabled: Story = {
	args: {disabled: true, defaultValue: "This textarea is disabled"},
};

export const TypeInteraction: Story = {
	args: {placeholder: "Type here..."},
	play: async ({canvasElement}) => {
		const canvas = within(canvasElement);
		const textarea = canvas.getByPlaceholderText("Type here...");

		await userEvent.click(textarea);
		await userEvent.type(textarea, "Line 1\nLine 2\nLine 3");
		await expect(textarea).toHaveValue("Line 1\nLine 2\nLine 3");
	},
};
