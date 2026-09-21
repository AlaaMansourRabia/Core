import type {Meta, StoryObj} from "storybook/internal/types";

import {AssetListItem} from "@wakecap/core-ui/asset-list-item";
import {Badge} from "@wakecap/core-ui/badge";
import {Camera, Play, RefreshCw} from "lucide-react";
import {useState} from "react";

const THUMB =
	"data:image/svg+xml;utf8," +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" width="160" height="112"><rect width="160" height="112" fill="#5b6763"/><rect x="0" y="70" width="160" height="42" fill="#3d4a46"/><circle cx="120" cy="28" r="14" fill="#8a9591"/></svg>',
	);

const meta = {
	title: "Components/Data Display/Asset List Item",
	component: AssetListItem,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"Selectable row for a captured asset — a camera feed, a drone capture, a timelapse. One 2,199-line template held three of these, structurally identical and differing only in what sits on the thumbnail and what the meta line says, so the shell lives here and the differences arrive as slots: `overlay` is positioned over the thumbnail well, `children` is the meta line under the subtitle.",
			},
		},
	},
	args: {title: "Tower crane east", subtitle: "Zone B · Level 12"},
} satisfies Meta<typeof AssetListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A live camera: a LIVE pill over the thumbnail, status and freshness on the meta line. */
export const Default: Story = {
	render: (args) => (
		<div className="wwc:max-w-sm">
			<AssetListItem
				{...args}
				thumbnail={THUMB}
				thumbnailAlt="Tower crane east"
				overlay={
					<div className="wwc:absolute wwc:top-1 wwc:left-1 wwc:flex wwc:items-center wwc:gap-1 wwc:rounded wwc:bg-red-600 wwc:px-1.5 wwc:py-0.5 wwc:text-[10px] wwc:font-medium wwc:text-white">
						<span className="wwc:h-1 wwc:w-1 wwc:animate-pulse wwc:rounded-full wwc:bg-white" />
						LIVE
					</div>
				}
			>
				<Badge className="wwc:bg-green-600 wwc:text-xs">online</Badge>
				<span>2 min ago</span>
			</AssetListItem>
		</div>
	),
};

/** No image to show — the fallback fills the thumbnail well instead of leaving a broken frame. */
export const Offline: Story = {
	args: {title: "Gate camera", subtitle: "North entrance"},
	render: (args) => (
		<div className="wwc:max-w-sm">
			<AssetListItem {...args} fallback={<Camera className="wwc:h-5 wwc:w-5 wwc:text-muted-foreground/50" />}>
				<Badge variant="secondary" className="wwc:text-xs">
					offline
				</Badge>
				<span>4 hours ago</span>
			</AssetListItem>
		</div>
	),
};

/** Selection drives the map beside it, so it is marked in the DOM as well as drawn. */
export const Selection: Story = {
	render: () => {
		const [selected, setSelected] = useState("a");
		return (
			<div className="wwc:max-w-sm wwc:space-y-2">
				{[
					{id: "a", title: "Tower crane east", subtitle: "Zone B · Level 12"},
					{id: "b", title: "Gate camera", subtitle: "North entrance"},
				].map((asset) => (
					<AssetListItem
						key={asset.id}
						thumbnail={THUMB}
						thumbnailAlt={asset.title}
						title={asset.title}
						subtitle={asset.subtitle}
						selected={selected === asset.id}
						onClick={() => setSelected(asset.id)}
					>
						<Badge className="wwc:bg-green-600 wwc:text-xs">online</Badge>
					</AssetListItem>
				))}
			</div>
		);
	},
};

/** Two other overlays from the same template: a processing veil and a play button with a duration chip. */
export const Overlays: Story = {
	render: () => (
		<div className="wwc:max-w-sm wwc:space-y-2">
			<AssetListItem
				thumbnail={THUMB}
				thumbnailAlt="Orthomosaic"
				title="Orthomosaic"
				subtitle="Falcon Heights Medical Tower"
				overlay={
					<div className="wwc:absolute wwc:inset-0 wwc:flex wwc:items-center wwc:justify-center wwc:bg-black/40">
						<RefreshCw className="wwc:h-4 wwc:w-4 wwc:animate-spin wwc:text-white" />
					</div>
				}
			>
				<Badge variant="secondary" className="wwc:bg-amber-600 wwc:text-xs">
					Processing
				</Badge>
				<span>12 Aug</span>
			</AssetListItem>

			<AssetListItem
				thumbnail={THUMB}
				thumbnailAlt="East elevation build"
				title="East elevation build"
				subtitle="Falcon Heights Medical Tower"
				overlay={
					<>
						<div className="wwc:absolute wwc:inset-0 wwc:flex wwc:items-center wwc:justify-center">
							<div className="wwc:flex wwc:h-8 wwc:w-8 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-background/80">
								<Play className="wwc:ml-0.5 wwc:h-3 wwc:w-3" />
							</div>
						</div>
						<div className="wwc:absolute wwc:right-1 wwc:bottom-1 wwc:rounded wwc:bg-black/70 wwc:px-1 wwc:py-0.5 wwc:text-[10px] wwc:font-medium wwc:text-white">
							0:42
						</div>
					</>
				}
			>
				<span>1,284 frames</span>
				<span>•</span>
				<span>18 Aug</span>
			</AssetListItem>
		</div>
	),
};
