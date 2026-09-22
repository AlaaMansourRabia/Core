import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@corensystem/core-ui/button";
import {Toaster, toast} from "@corensystem/core-ui/sonner";

const meta = {
	title: "Components/Feedback/Toast",
	component: Toaster,
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<>
				<Story />
				<Toaster />
			</>
		),
	],
	parameters: {
		docs: {
			description: {
				component:
					"Brief notifications that appear temporarily to provide feedback. Uses Sonner under the hood with support for success, error, warning, info, description, action, and promise toasts.",
			},
		},
	},
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => <Button onClick={() => toast("This is a toast message")}>Show Toast</Button>,
};

export const Variants: Story = {
	render: () => (
		<div className="wwc:flex wwc:flex-wrap wwc:gap-2">
			<Button variant="outline" onClick={() => toast.success("Successfully saved!")}>
				Success
			</Button>
			<Button variant="outline" onClick={() => toast.error("Something went wrong")}>
				Error
			</Button>
			<Button variant="outline" onClick={() => toast.warning("Please review your input")}>
				Warning
			</Button>
			<Button variant="outline" onClick={() => toast.info("New update available")}>
				Info
			</Button>
		</div>
	),
};

export const WithDescription: Story = {
	render: () => (
		<Button
			variant="outline"
			onClick={() =>
				toast("Event created", {
					description: "Your event has been scheduled for tomorrow at 3pm.",
				})
			}
		>
			With Description
		</Button>
	),
};

export const WithAction: Story = {
	render: () => (
		<Button
			variant="outline"
			onClick={() =>
				toast("Message deleted", {
					description: "The message has been removed from your inbox.",
					action: {
						label: "Undo",
						onClick: () => toast.success("Message restored"),
					},
				})
			}
		>
			With Action
		</Button>
	),
};

export const PromiseToast: Story = {
	render: () => (
		<Button
			variant="outline"
			onClick={() => {
				const promise = new Promise((resolve) => setTimeout(resolve, 2000));
				toast.promise(promise, {
					loading: "Loading...",
					success: "Data loaded successfully!",
					error: "Failed to load data",
				});
			}}
		>
			Promise Toast
		</Button>
	),
};

export const CustomDuration: Story = {
	render: () => (
		<Button
			variant="outline"
			onClick={() =>
				toast("This will stay for 10 seconds", {
					duration: 10000,
				})
			}
		>
			Long Duration
		</Button>
	),
};
