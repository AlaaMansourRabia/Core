import type {Meta, StoryObj} from "storybook/internal/types";

import {MapCompass} from "@corensystem/coren-ui/map-compass";
import {useState} from "react";

const meta = {
	title: "Widgets/Map/Map Compass",
	component: MapCompass,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					'A compass-realignment control: a two-tone needle (red north / slate south) that rotates to reflect the current map `bearing` and, when pressed, calls `onResetNorth`. Mirrors the `VerticalZoomTools` UI so it floats over a map or nests (`variant="bare"`) inside a larger vertical toolbar.',
			},
		},
	},
} satisfies Meta<typeof MapCompass>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => {
		function Demo() {
			const [bearing, setBearing] = useState(35);
			return (
				<div className="wwc:flex wwc:items-center wwc:gap-6">
					<MapCompass bearing={bearing} onResetNorth={() => setBearing(0)} />
					<button
						type="button"
						onClick={() => setBearing((b) => (b + 30) % 360)}
						className="wwc:rounded-md wwc:border wwc:px-3 wwc:py-1.5 wwc:text-sm wwc:hover:bg-accent"
					>
						Rotate +30° (now {bearing}°)
					</button>
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					"The needle counter-rotates with `bearing` so it keeps pointing north; pressing it resets the bearing to 0.",
			},
		},
	},
};
