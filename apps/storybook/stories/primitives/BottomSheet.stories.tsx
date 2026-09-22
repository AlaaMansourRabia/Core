import type {Meta, StoryObj} from "storybook/internal/types";

import {BottomSheet} from "@corensystem/core-ui/bottom-sheet";
import {Button} from "@corensystem/core-ui/button";
import {useState} from "react";

const meta = {
	title: "Components/Primitives/BottomSheet",
	component: BottomSheet,
	tags: ["autodocs"],
} satisfies Meta<typeof meta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<>
				<Button onClick={() => setOpen(true)}>Open Bottom Sheet</Button>
				<BottomSheet
					open={open}
					onClose={() => setOpen(false)}
					title="Bottom Sheet"
					description="This is a bottom sheet"
				>
					<div className="wwc:space-y-4">
						<p>Content goes here</p>
						<Button onClick={() => setOpen(false)}>Close</Button>
					</div>
				</BottomSheet>
			</>
		);
	},
};

export const FullHeight: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<>
				<Button onClick={() => setOpen(true)}>Open Full Height</Button>
				<BottomSheet open={open} onClose={() => setOpen(false)} title="Full Height Sheet" height="full">
					<div className="wwc:space-y-4">
						<p>This sheet takes the full viewport height</p>
					</div>
				</BottomSheet>
			</>
		);
	},
};

export const HalfHeight: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<>
				<Button onClick={() => setOpen(true)}>Open Half Height</Button>
				<BottomSheet open={open} onClose={() => setOpen(false)} title="Half Height Sheet" height="half">
					<div className="wwc:space-y-4">
						<p>This sheet takes half the viewport height</p>
					</div>
				</BottomSheet>
			</>
		);
	},
};

export const NoSwipe: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<>
				<Button onClick={() => setOpen(true)}>Open (No Swipe)</Button>
				<BottomSheet open={open} onClose={() => setOpen(false)} title="No Swipe" swipeable={false}>
					<div className="wwc:space-y-4">
						<p>This sheet cannot be swiped to close</p>
					</div>
				</BottomSheet>
			</>
		);
	},
};
