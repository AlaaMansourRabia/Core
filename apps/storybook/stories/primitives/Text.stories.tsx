import type {Meta, StoryObj} from "storybook/internal/types";

import {Text} from "@corensystem/core-ui/text";

const meta = {
	title: "Components/Primitives/Text",
	component: Text,
	tags: ["autodocs"],
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
	render: () => (
		<div className="wwc:space-y-2">
			<Text size="xs">Extra small text</Text>
			<Text size="sm">Small text</Text>
			<Text size="md">Medium text (default)</Text>
			<Text size="lg">Large text</Text>
			<Text size="xl">Extra large text</Text>
		</div>
	),
};

export const Weights: Story = {
	render: () => (
		<div className="wwc:space-y-2">
			<Text weight="normal">Normal weight</Text>
			<Text weight="medium">Medium weight</Text>
			<Text weight="semibold">Semibold weight</Text>
			<Text weight="bold">Bold weight</Text>
		</div>
	),
};

export const Variants: Story = {
	render: () => (
		<div className="wwc:space-y-2">
			<Text variant="default">Default text color</Text>
			<Text variant="muted">Muted text color</Text>
			<Text variant="accent">Accent text color</Text>
			<Text variant="error">Error text color</Text>
			<Text variant="success">Success text color</Text>
		</div>
	),
};

export const Alignment: Story = {
	render: () => (
		<div className="wwc:space-y-4">
			<Text align="left">Left aligned text (default)</Text>
			<Text align="center">Center aligned text</Text>
			<Text align="right">Right aligned text</Text>
			<Text align="justify">
				Justified text that stretches to fill the full width of the container, creating even edges on both sides.
			</Text>
		</div>
	),
};

export const AsSpan: Story = {
	render: () => (
		<p>
			This is a paragraph with{" "}
			<Text as="span" variant="accent" weight="semibold">
				inline styled text
			</Text>{" "}
			inside it.
		</p>
	),
};
