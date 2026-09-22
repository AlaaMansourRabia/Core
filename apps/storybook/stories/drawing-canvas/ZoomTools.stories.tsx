import type {Meta, StoryObj} from "storybook/internal/types";

import {ZoomTools} from "@core/core-ui/zoom-tools";
import {useState} from "react";

const meta = {
	title: "Components/Drawing Canvas/Zoom Tools",
	component: ZoomTools,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Canvas zoom toolbar: Scale calibration + Zoom In / Zoom Out + Fit to view. Pairs with `DrawingActions` on the canvas top bar. Zoom buttons disable automatically when the level hits the configured min/max bounds.",
			},
		},
	},
} satisfies Meta<typeof ZoomTools>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomLabels: Story = {
	args: {scaleLabel: "1:100", fitLabel: "Fit to page"},
	parameters: {
		docs: {
			description: {
				story: "Override `scaleLabel` and `fitLabel` to surface the current calibration ratio or localise the buttons.",
			},
		},
	},
};

export const AtMaxZoom: Story = {
	args: {zoomLevel: 10, maxZoom: 10},
	parameters: {
		docs: {
			description: {
				story: "When `zoomLevel >= maxZoom`, Zoom In renders disabled.",
			},
		},
	},
};

export const AtMinZoom: Story = {
	args: {zoomLevel: 0.1, minZoom: 0.1},
	parameters: {
		docs: {
			description: {
				story: "When `zoomLevel <= minZoom`, Zoom Out renders disabled.",
			},
		},
	},
};

export const Controlled: Story = {
	render: () => {
		function Demo() {
			const [zoomLevel, setZoomLevel] = useState(1);
			const [history, setHistory] = useState<string[]>([]);
			const log = (entry: string) => setHistory((prev) => [...prev, entry]);

			return (
				<div className="wwc:flex wwc:flex-col wwc:gap-4">
					<ZoomTools
						zoomLevel={zoomLevel}
						minZoom={0.25}
						maxZoom={4}
						onZoomIn={() => {
							setZoomLevel((prev) => Math.min(4, prev + 0.25));
							log("zoom in");
						}}
						onZoomOut={() => {
							setZoomLevel((prev) => Math.max(0.25, prev - 0.25));
							log("zoom out");
						}}
						onFit={() => {
							setZoomLevel(1);
							log("fit");
						}}
						onScale={() => log("scale")}
					/>
					<div className="wwc:rounded-md wwc:border wwc:bg-muted/30 wwc:p-3 wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
						<div>zoomLevel: {zoomLevel.toFixed(2)}x</div>
						<div>history: [{history.slice(-5).join(", ")}]</div>
					</div>
				</div>
			);
		}
		return <Demo />;
	},
};
