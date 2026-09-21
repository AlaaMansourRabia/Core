import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@wakecap/core-ui/button";
import {WalkthroughModal} from "@wakecap/core-ui/walkthrough-modal";
import {useState} from "react";

const meta = {
	title: "Widgets/Overlay/Walkthrough Modal",
	component: WalkthroughModal,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"The capture walkthrough: a large, edge-to-edge `MapCompareLayout` (with the session timeline) shown in a dialog. Opened from a capture point to compare that capture against another session. The header is a single compact 14px title (no subtitle); the map fills the dialog flush to every edge. Activate a compare mode (side-by-side or swipe) to reveal the session timeline and scrub the two dates.",
			},
		},
	},
} satisfies Meta<typeof WalkthroughModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => {
		function Demo() {
			const [open, setOpen] = useState(false);
			return (
				<>
					<Button type="button" onClick={() => setOpen(true)}>
						Open walkthrough
					</Button>
					<WalkthroughModal open={open} onOpenChange={setOpen} title="Capture 2 of 17 · Ground Floor · 10:05" />
				</>
			);
		}
		return <Demo />;
	},
};
