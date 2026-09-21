import type {Meta, StoryObj} from "storybook/internal/types";

import {Spinner} from "@wakecap/core-ui/spinner";

const meta = {
	title: "Components/Primitives/Spinner",
	component: Spinner,
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["sm", "default", "lg", "xl"],
		},
	},
	args: {
		size: "default",
	},
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
	args: {size: "sm"},
};

export const Large: Story = {
	args: {size: "lg"},
};

export const ExtraLarge: Story = {
	args: {size: "xl"},
};

export const AllSizes: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-center wwc:gap-4">
			<Spinner size="sm" />
			<Spinner size="default" />
			<Spinner size="lg" />
			<Spinner size="xl" />
		</div>
	),
};

export const WithText: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-center wwc:gap-2">
			<Spinner size="default" />
			<span className="wwc:text-sm wwc:text-muted-foreground">Loading...</span>
		</div>
	),
};

export const InButton: Story = {
	render: () => (
		<button
			className="wwc:inline-flex wwc:items-center wwc:gap-2 wwc:rounded-md wwc:bg-primary wwc:px-4 wwc:py-2 wwc:text-sm wwc:font-medium wwc:text-primary-foreground"
			disabled
		>
			<Spinner size="sm" className="wwc:text-primary-foreground" />
			Processing...
		</button>
	),
};

export const CenteredLoadingState: Story = {
	render: () => (
		<div className="wwc:flex wwc:h-32 wwc:items-center wwc:justify-center wwc:rounded-lg wwc:border">
			<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-2">
				<Spinner size="lg" />
				<span className="wwc:text-sm wwc:text-muted-foreground">Loading content...</span>
			</div>
		</div>
	),
};
