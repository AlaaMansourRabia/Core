import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@core/core-ui/button";
import {Stack} from "@core/core-ui/stack";

const meta = {
	title: "Components/Primitives/Stack",
	component: Stack,
	tags: ["autodocs"],
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
	render: () => (
		<Stack direction="column">
			<div className="wwc:h-10 wwc:bg-primary wwc:rounded" />
			<div className="wwc:h-10 wwc:bg-secondary wwc:rounded" />
			<div className="wwc:h-10 wwc:bg-accent wwc:rounded" />
		</Stack>
	),
};

export const Horizontal: Story = {
	render: () => (
		<Stack direction="row">
			<div className="wwc:h-10 wwc:w-20 wwc:bg-primary wwc:rounded" />
			<div className="wwc:h-10 wwc:w-20 wwc:bg-secondary wwc:rounded" />
			<div className="wwc:h-10 wwc:w-20 wwc:bg-accent wwc:rounded" />
		</Stack>
	),
};

export const Gaps: Story = {
	render: () => (
		<div className="wwc:space-y-4">
			<Stack direction="row" gap="none">
				<Button size="sm">No Gap</Button>
				<Button size="sm">Items</Button>
				<Button size="sm">Together</Button>
			</Stack>
			<Stack direction="row" gap="xs">
				<Button size="sm">XS</Button>
				<Button size="sm">Gap</Button>
			</Stack>
			<Stack direction="row" gap="sm">
				<Button size="sm">SM</Button>
				<Button size="sm">Gap</Button>
			</Stack>
			<Stack direction="row" gap="md">
				<Button size="sm">MD</Button>
				<Button size="sm">Gap</Button>
			</Stack>
			<Stack direction="row" gap="lg">
				<Button size="sm">LG</Button>
				<Button size="sm">Gap</Button>
			</Stack>
			<Stack direction="row" gap="xl">
				<Button size="sm">XL</Button>
				<Button size="sm">Gap</Button>
			</Stack>
		</div>
	),
};

export const Alignment: Story = {
	render: () => (
		<div className="wwc:space-y-4">
			<Stack direction="row" align="start" className="wwc:h-20 wwc:bg-muted wwc:rounded">
				<div className="wwc:h-10 wwc:w-20 wwc:bg-primary wwc:rounded" />
				<div className="wwc:h-16 wwc:w-20 wwc:bg-secondary wwc:rounded" />
			</Stack>
			<Stack direction="row" align="center" className="wwc:h-20 wwc:bg-muted wwc:rounded">
				<div className="wwc:h-10 wwc:w-20 wwc:bg-primary wwc:rounded" />
				<div className="wwc:h-16 wwc:w-20 wwc:bg-secondary wwc:rounded" />
			</Stack>
			<Stack direction="row" align="end" className="wwc:h-20 wwc:bg-muted wwc:rounded">
				<div className="wwc:h-10 wwc:w-20 wwc:bg-primary wwc:rounded" />
				<div className="wwc:h-16 wwc:w-20 wwc:bg-secondary wwc:rounded" />
			</Stack>
		</div>
	),
};

export const Justify: Story = {
	render: () => (
		<div className="wwc:space-y-4">
			<Stack direction="row" justify="start" className="wwc:bg-muted wwc:rounded wwc:p-2">
				<Button size="sm">Start</Button>
				<Button size="sm">Aligned</Button>
			</Stack>
			<Stack direction="row" justify="center" className="wwc:bg-muted wwc:rounded wwc:p-2">
				<Button size="sm">Center</Button>
				<Button size="sm">Aligned</Button>
			</Stack>
			<Stack direction="row" justify="end" className="wwc:bg-muted wwc:rounded wwc:p-2">
				<Button size="sm">End</Button>
				<Button size="sm">Aligned</Button>
			</Stack>
			<Stack direction="row" justify="between" className="wwc:bg-muted wwc:rounded wwc:p-2">
				<Button size="sm">Space</Button>
				<Button size="sm">Between</Button>
			</Stack>
		</div>
	),
};
