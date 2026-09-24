import type {Meta, StoryObj} from "storybook/internal/types";

import {MapToolbar, type SplitMode} from "@corensystem/coren-ui/map-toolbar";
import {useState} from "react";

// A muted backdrop the floating toolbar sits over.
function MapCanvas({children}: {children: React.ReactNode}) {
	return (
		<div className="wwc:relative wwc:h-[26rem] wwc:w-[32rem] wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:bg-gradient-to-br wwc:from-emerald-100 wwc:via-sky-100 wwc:to-slate-200">
			{children}
		</div>
	);
}

const meta = {
	title: "Widgets/Map/Map Toolbar",
	component: MapToolbar,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					'A vertical floating toolbar for a map: a split-view control (hover it for a menu of compare modes — side-by-side vs. swipe), a "my location" button, zoom (`VerticalZoomTools`), and a compass — each its own pill in the shared vertical-zoom-tools style, with the compass a separate pill below zoom. Every section is optional and renders only when its handler is provided.',
			},
		},
	},
} satisfies Meta<typeof MapToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullToolbar: Story = {
	render: () => {
		function Demo() {
			const [splitMode, setSplitMode] = useState<SplitMode | null>(null);
			const [zoom, setZoom] = useState(1);
			const [bearing, setBearing] = useState(35);
			return (
				<MapCanvas>
					<div className="wwc:absolute wwc:right-3 wwc:top-3">
						<MapToolbar
							splitMode={splitMode}
							onSplitModeChange={setSplitMode}
							onLocate={() => undefined}
							zoomLevel={zoom}
							minZoom={0.5}
							maxZoom={4}
							onZoomIn={() => setZoom((p) => Math.min(4, p + 0.5))}
							onZoomOut={() => setZoom((p) => Math.max(0.5, p - 0.5))}
							bearing={bearing}
							onResetNorth={() => setBearing(0)}
						/>
					</div>
					<button
						type="button"
						onClick={() => setBearing((b) => (b + 30) % 360)}
						className="wwc:absolute wwc:bottom-3 wwc:right-3 wwc:rounded-md wwc:border wwc:bg-background/80 wwc:px-2 wwc:py-1 wwc:text-xs wwc:backdrop-blur wwc:hover:bg-accent"
					>
						Rotate map +30° ({bearing}°)
					</button>
				</MapCanvas>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					"All four sections wired. Hover the split button for the compare-mode menu (side-by-side vs. swipe), zoom auto-disables at bounds, and the compass resets the bearing to north (rotate the map to see the needle turn).",
			},
		},
	},
};

export const ZoomAndCompassOnly: Story = {
	render: () => {
		function Demo() {
			const [zoom, setZoom] = useState(1);
			const [bearing, setBearing] = useState(20);
			return (
				<MapCanvas>
					<div className="wwc:absolute wwc:right-3 wwc:top-3">
						<MapToolbar
							zoomLevel={zoom}
							minZoom={0.5}
							maxZoom={4}
							onZoomIn={() => setZoom((p) => Math.min(4, p + 0.5))}
							onZoomOut={() => setZoom((p) => Math.max(0.5, p - 0.5))}
							bearing={bearing}
							onResetNorth={() => setBearing(0)}
						/>
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
					"Omitting the split-view and location handlers drops those pills — only zoom and the (separate) compass render.",
			},
		},
	},
};
