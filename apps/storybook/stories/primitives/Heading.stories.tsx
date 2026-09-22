import type {Meta, StoryObj} from "storybook/internal/types";

import {Heading} from "@corensystem/core-ui/heading";

const meta = {
	title: "Components/Primitives/Heading",
	component: Heading,
	tags: ["autodocs"],
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Levels: Story = {
	render: () => (
		<div className="wwc:space-y-4">
			<Heading level="h1">Heading 1</Heading>
			<Heading level="h2">Heading 2</Heading>
			<Heading level="h3">Heading 3</Heading>
			<Heading level="h4">Heading 4</Heading>
			<Heading level="h5">Heading 5</Heading>
			<Heading level="h6">Heading 6</Heading>
		</div>
	),
};

export const Variants: Story = {
	render: () => (
		<div className="wwc:space-y-4">
			<Heading level="h2" variant="default">
				Default Heading
			</Heading>
			<Heading level="h2" variant="muted">
				Muted Heading
			</Heading>
			<Heading level="h2" variant="accent">
				Accent Heading
			</Heading>
		</div>
	),
};

export const SemanticOverride: Story = {
	render: () => (
		<div className="wwc:space-y-4">
			<Heading level="h1" as="h2">
				Looks like H1, but semantically H2
			</Heading>
			<Heading level="h3" as="h1">
				Looks like H3, but semantically H1
			</Heading>
		</div>
	),
};
