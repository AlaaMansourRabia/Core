import type {Meta, StoryObj} from "storybook/internal/types";

import {MapMinimap} from "@corensystem/core-ui/map-minimap";
import {useState} from "react";

function Scene() {
	return (
		<div className="wwc:absolute wwc:inset-0 wwc:h-full wwc:w-full">
			<div className="wwc:absolute wwc:inset-0 wwc:bg-gradient-to-br wwc:from-emerald-100 wwc:via-sky-100 wwc:to-amber-100" />
			<svg className="wwc:absolute wwc:inset-0 wwc:h-full wwc:w-full wwc:text-slate-500/40" aria-hidden="true">
				<path d="M0 200 Q 220 150 440 210 T 900 190" fill="none" stroke="currentColor" strokeWidth="7" />
				<path d="M160 0 L 210 360" fill="none" stroke="currentColor" strokeWidth="5" />
				<rect x="300" y="120" width="150" height="110" rx="6" fill="currentColor" opacity="0.45" />
				<rect x="620" y="240" width="110" height="70" rx="4" fill="currentColor" opacity="0.35" />
			</svg>
		</div>
	);
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

const meta = {
	title: "Widgets/Map/Map Minimap",
	component: MapMinimap,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"An overview thumbnail of the whole map with a box marking the region the main view shows. Feed it the current `viewport` (fractions of the full map); with `onNavigate`, dragging/clicking recenters the view. Pairs with `CompareView`'s `onViewChange` / `viewControllerRef`.",
			},
		},
	},
} satisfies Meta<typeof MapMinimap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OverviewAndNavigation: Story = {
	render: () => {
		function Demo() {
			const [zoom] = useState(2.5);
			const [center, setCenter] = useState({x: 0.5, y: 0.5});
			const size = 1 / zoom;
			const half = size / 2;
			const cx = clamp(center.x, half, 1 - half);
			const cy = clamp(center.y, half, 1 - half);
			const viewport = {x: cx - half, y: cy - half, width: size, height: size};
			return (
				<div className="wwc:relative wwc:h-80 wwc:w-[34rem] wwc:overflow-hidden wwc:rounded-lg wwc:border">
					<div
						className="wwc:absolute wwc:inset-0"
						style={{
							transform: `scale(${zoom}) translate(${-viewport.x * 100}%, ${-viewport.y * 100}%)`,
							transformOrigin: "0 0",
						}}
					>
						<Scene />
					</div>
					<MapMinimap
						className="wwc:absolute wwc:bottom-3 wwc:right-3 wwc:z-10"
						viewport={viewport}
						onNavigate={setCenter}
						label="Overview"
						minimizable
					>
						<Scene />
					</MapMinimap>
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {story: "Drag the box in the minimap to pan the main view; the box tracks the visible region."},
		},
	},
};
