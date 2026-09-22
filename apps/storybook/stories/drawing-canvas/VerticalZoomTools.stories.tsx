import type {Meta, StoryObj} from "storybook/internal/types";

import {Toolbar, ToolbarButton, ToolbarSeparator} from "@corensystem/core-ui/toolbar";
import {VerticalZoomTools} from "@corensystem/core-ui/vertical-zoom-tools";
import {Compass, Layers, Maximize} from "lucide-react";
import {useState} from "react";

// A muted backdrop the floating control sits over.
function MapCanvas({children}: {children: React.ReactNode}) {
	return (
		<div className="wwc:relative wwc:h-72 wwc:w-[28rem] wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:bg-gradient-to-br wwc:from-emerald-100 wwc:via-sky-100 wwc:to-slate-200">
			{children}
		</div>
	);
}

const meta = {
	title: "Components/Drawing Canvas/Vertical Zoom Tools",
	component: VerticalZoomTools,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					'A compact vertical zoom control (Zoom In over Zoom Out) intended to float over a map or canvas — the vertical counterpart to `ZoomTools`. Built on the orientation-aware `Toolbar` primitive, so it can be the first section of a larger vertical floating toolbar (pass `variant="bare"` to nest it). Buttons auto-disable at the min/max bounds.',
			},
		},
	},
} satisfies Meta<typeof VerticalZoomTools>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => <VerticalZoomTools />,
	parameters: {
		docs: {
			description: {
				story: "Uncontrolled — buttons stay enabled. Wire `onZoomIn` / `onZoomOut` to your map or canvas.",
			},
		},
	},
};

export const FloatingOverMap: Story = {
	render: () => {
		function Demo() {
			const [zoom, setZoom] = useState(1);
			return (
				<MapCanvas>
					<div className="wwc:absolute wwc:right-3 wwc:top-3">
						<VerticalZoomTools
							zoomLevel={zoom}
							minZoom={0.5}
							maxZoom={4}
							onZoomIn={() => setZoom((p) => Math.min(4, p + 0.5))}
							onZoomOut={() => setZoom((p) => Math.max(0.5, p - 0.5))}
						/>
					</div>
					<div className="wwc:absolute wwc:bottom-3 wwc:left-3 wwc:rounded-md wwc:bg-background/80 wwc:px-2 wwc:py-1 wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
						zoom: {zoom.toFixed(1)}x
					</div>
				</MapCanvas>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					"Positioned absolutely over a map. Controlled — Zoom In / Out disable at the configured `minZoom` / `maxZoom`.",
			},
		},
	},
};

export const InAVerticalToolbar: Story = {
	render: () => (
		<MapCanvas>
			<div className="wwc:absolute wwc:right-3 wwc:top-3">
				<Toolbar orientation="vertical">
					<VerticalZoomTools variant="bare" />
					<ToolbarSeparator orientation="horizontal" className="wwc:mx-0 wwc:w-full" />
					<ToolbarButton icon label="Reset bearing">
						<Compass className="wwc:h-4 wwc:w-4" />
					</ToolbarButton>
					<ToolbarButton icon label="Layers">
						<Layers className="wwc:h-4 wwc:w-4" />
					</ToolbarButton>
					<ToolbarButton icon label="Fit to view">
						<Maximize className="wwc:h-4 wwc:w-4" />
					</ToolbarButton>
				</Toolbar>
			</div>
		</MapCanvas>
	),
	parameters: {
		docs: {
			description: {
				story:
					'`variant="bare"` nests it as the first section of a single vertical `Toolbar`, with more tools stacked below (the extra buttons are placeholders for future parts).',
			},
		},
	},
};
