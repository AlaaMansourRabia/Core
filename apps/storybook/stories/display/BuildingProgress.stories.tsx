import type {Meta, StoryObj} from "storybook/internal/types";

import {type BuildingFloor, BuildingProgress} from "@corensystem/coren-ui/building-progress";
import {useState} from "react";

// Floors ordered top → bottom (roof first, base last). Construction runs bottom-up, so the base is
// usually further along than the upper floors.
const FLOORS: BuildingFloor[] = [
	{id: "rf", label: "RF", value: 81},
	{id: "uf", label: "UF", value: 31},
	{id: "ff", label: "FF", value: 61},
	{id: "gf", label: "GF", value: 41},
	{id: "sub", label: "SUB", value: 96},
];

const meta = {
	title: "Components/Data Display/Building Progress",
	component: BuildingProgress,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"A building elevation progress stack — one row per floor (top → bottom) with a completion bar and percentage, tapering wider toward the base like a building silhouette. The `activeId` floor is highlighted; pass `onFloorSelect` to make the rows interactive. Built for the lowest level of the Blueprint Viewer hierarchy, where each floor of a level shows its own progress.",
			},
		},
	},
	argTypes: {
		size: {control: "select", options: ["default", "compact"]},
		taperStep: {control: {type: "range", min: 0, max: 48, step: 2}},
		activeId: {control: "select", options: [undefined, ...FLOORS.map((f) => f.id)]},
	},
	args: {
		floors: FLOORS,
		activeId: "gf",
		size: "default",
		taperStep: 24,
	},
	decorators: [
		(Story) => (
			<div style={{maxWidth: 360}}>
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof BuildingProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// No active floor and non-interactive — a read-only progress summary.
export const Static: Story = {
	args: {activeId: undefined},
};

// Clickable rows: `onFloorSelect` drives the highlighted floor.
export const Interactive: Story = {
	render: (args) => {
		const [activeId, setActiveId] = useState("gf");
		return <BuildingProgress {...args} activeId={activeId} onFloorSelect={setActiveId} />;
	},
};

export const Compact: Story = {
	args: {size: "compact"},
};

// A flat stack (no taper) reads as a plain grouped progress list.
export const NoTaper: Story = {
	args: {taperStep: 0},
};
