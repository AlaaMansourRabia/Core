import type {Meta, StoryObj} from "storybook/internal/types";

import {OperationsDrawer} from "@wakecap/core-ui/operations-drawer";
import {useState} from "react";

const meta = {
	title: "Widgets/Progress/Operations Drawer",
	component: OperationsDrawer,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"A drawer for reviewing and updating the operations under a single object. The header carries the object identifier, its WBS path, an overall progress bar, and a walkthrough button; a compact table lists each operation with its WT / PREV / BAC / EV metrics and an editable progress field; the footer discards or saves the changes (Save stays disabled until a progress value changes). Composed from Wakecore Table, Progress, Input, and Button.",
			},
		},
	},
} satisfies Meta<typeof OperationsDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => {
		function Demo() {
			const [progress, setProgress] = useState<Record<string, string>>({"BF-01": "100%", "BWBF-01": "0%"});

			return (
				<div className="wwc:h-[560px] wwc:w-fit wwc:rounded-b-lg wwc:bg-muted/30 wwc:p-4">
					<OperationsDrawer
						title="2266-DP1-R-SS"
						wbs="MRM-RS-02-BL-1.CON.Zone 1 – A.1.Block-XX.T.2266.SS"
						progress={50}
						page={{current: 1, total: 4}}
						rows={[
							{
								name: "Backfill",
								code: "BF-01",
								wt: "50%",
								prev: "100%",
								bac: "25.1K",
								ev: "25.1K",
								progress: progress["BF-01"],
								onProgressChange: (v) => setProgress((p) => ({...p, "BF-01": v})),
							},
							{
								name: "Boundary Wall Backfill",
								code: "BWBF-01",
								wt: "50%",
								prev: "0%",
								bac: "25.1K",
								ev: "0",
								progress: progress["BWBF-01"],
								onProgressChange: (v) => setProgress((p) => ({...p, "BWBF-01": v})),
							},
						]}
					/>
				</div>
			);
		}
		return <Demo />;
	},
};
