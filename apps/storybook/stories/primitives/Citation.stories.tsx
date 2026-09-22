import type {Meta, StoryObj} from "storybook/internal/types";

import {Citation} from "@core/core-ui/citation";
import {Blockquote} from "@core/core-ui/blockquote";

const meta = {
	title: "Components/Primitives/Citation",
	component: Citation,
	tags: ["autodocs"],
} satisfies Meta<typeof Citation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => <Citation author="Albert Einstein" />,
};

export const WithSource: Story = {
	render: () => <Citation author="Steve Jobs" source="Stanford Commencement Speech" date="2005" />,
};

export const WithBlockquote: Story = {
	render: () => (
		<Blockquote>
			The only way to do great work is to love what you do.
			<Citation author="Steve Jobs" source="Stanford Commencement Speech" date="2005" />
		</Blockquote>
	),
};

export const WithLink: Story = {
	render: () => (
		<Citation href="https://example.com/article" author="Jane Doe" source="Tech Weekly" date="2024">
			Read more about this topic
		</Citation>
	),
};

export const Sizes: Story = {
	render: () => (
		<div className="wwc:space-y-4">
			<Citation size="sm" author="Small citation" source="Source" />
			<Citation size="md" author="Medium citation" source="Source" />
			<Citation size="lg" author="Large citation" source="Source" />
		</div>
	),
};

export const PlainVariant: Story = {
	render: () => <Citation variant="plain" author="Non-italic citation" source="Source" />,
};
