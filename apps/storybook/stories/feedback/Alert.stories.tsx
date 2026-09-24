import type {Meta, StoryObj} from "storybook/internal/types";

import {Alert, AlertDescription, AlertTitle} from "@corensystem/coren-ui/alert";
import {AlertCircle, Terminal} from "lucide-react";

const meta = {
	title: "Components/Feedback/Alert",
	component: Alert,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["default", "destructive"],
		},
	},
	args: {
		variant: "default",
	},
	parameters: {
		docs: {
			description: {
				component:
					"Displays a callout for important information. Supports default and destructive variants. Compound component with AlertTitle and AlertDescription.",
			},
		},
	},
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Alert>
			<Terminal className="wwc:h-4 wwc:w-4" />
			<AlertTitle>Heads up!</AlertTitle>
			<AlertDescription>You can add components to your app using the cli.</AlertDescription>
		</Alert>
	),
};

export const Destructive: Story = {
	render: () => (
		<Alert variant="destructive">
			<AlertCircle className="wwc:h-4 wwc:w-4" />
			<AlertTitle>Error</AlertTitle>
			<AlertDescription>Your session has expired. Please log in again.</AlertDescription>
		</Alert>
	),
};

export const AllVariants: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-col wwc:gap-4">
			<Alert variant="default">
				<Terminal className="wwc:h-4 wwc:w-4" />
				<AlertTitle>Default Alert</AlertTitle>
				<AlertDescription>This is a default alert with informational content.</AlertDescription>
			</Alert>
			<Alert variant="destructive">
				<AlertCircle className="wwc:h-4 wwc:w-4" />
				<AlertTitle>Destructive Alert</AlertTitle>
				<AlertDescription>This is a destructive alert indicating an error or warning.</AlertDescription>
			</Alert>
		</div>
	),
};
