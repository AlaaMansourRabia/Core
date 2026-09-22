import type {Meta, StoryObj} from "storybook/internal/types";

import {type BuildingModelFloor, BuildingModelPlaceholder} from "@corensystem/core-ui/building-model-placeholder";
import {useState} from "react";

const FLOORS: BuildingModelFloor[] = [
	{id: "rf", label: "RF", value: 55},
	{id: "l8", label: "L8", value: 62},
	{id: "l7", label: "L7", value: 68, hasBlueprint: false},
	{id: "l6", label: "L6", value: 73},
	{id: "l3", label: "L3", value: 90},
	{id: "gf", label: "GF", value: 100},
	{id: "b1", label: "B1", value: 100},
];

const meta = {
	title: "Widgets/Map/Building Model Placeholder",
	component: BuildingModelPlaceholder,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"A dependency-free 3D building placeholder: one extruded box (slab + four walls) per floor, stacked and viewed isometrically via CSS 3D. Drag to orbit, click a floor to select it. Meant as the fallback when a real BIM / 3D model isn't available yet — swap it for the model renderer when one exists.",
			},
		},
	},
} satisfies Meta<typeof BuildingModelPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => {
		function Demo() {
			const [active, setActive] = useState("gf");
			return (
				<div className="wwc:h-[520px] wwc:w-full">
					<BuildingModelPlaceholder floors={FLOORS} activeId={active} onFloorSelect={setActive} />
				</div>
			);
		}
		return <Demo />;
	},
};
