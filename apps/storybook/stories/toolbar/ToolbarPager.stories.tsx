import type {Meta, StoryObj} from "storybook/internal/types";

import {ToolbarPager} from "@corensystem/coren-ui/toolbar-pager";
import {useState} from "react";

const meta = {
	title: "Components/Navigation/Toolbar Pager",
	component: ToolbarPager,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Compact prev / `index / count` / next pager built from `ToolbarButton`. Uses a 1-based `index`; the prev/next buttons disable automatically at the bounds.",
			},
		},
	},
} satisfies Meta<typeof ToolbarPager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {index: 2, count: 5},
};

export const Controlled: Story = {
	render: () => {
		function Demo() {
			const [index, setIndex] = useState(1);
			const count = 8;

			return (
				<div className="wwc:flex wwc:flex-col wwc:gap-4">
					<ToolbarPager index={index} count={count} onIndexChange={setIndex} />
					<div className="wwc:rounded-md wwc:border wwc:bg-muted/30 wwc:p-3 wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
						<div>
							index: {index} / {count}
						</div>
					</div>
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story: "Track the 1-based `index` in state via `onIndexChange`. The readout reflects the current page.",
			},
		},
	},
};
