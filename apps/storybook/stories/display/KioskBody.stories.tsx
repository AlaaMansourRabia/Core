import type {Meta, StoryObj} from "storybook/internal/types";

import {KioskBody} from "@core/core-ui/kiosk-body";
import {fn} from "storybook/test";

const meta = {
	title: "Components/Data Display/KioskBody",
	component: KioskBody,
	tags: ["autodocs"],
	args: {
		house: "Villa 12 — Cluster B",
		onAdvanceHouse: fn(),
	},
	decorators: [
		(Story) => (
			<div className="wwc:h-[640px] wwc:w-full">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof KioskBody>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
