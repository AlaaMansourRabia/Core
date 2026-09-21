import {Camera, Play, RefreshCw} from "lucide-react";
import * as React from "react";

import {AssetListItem} from "@/components/ui/asset-list-item";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";

const THUMB =
	"data:image/svg+xml;utf8," +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" width="160" height="112"><rect width="160" height="112" fill="#5b6763"/><rect x="0" y="70" width="160" height="42" fill="#3d4a46"/><circle cx="120" cy="28" r="14" fill="#8a9591"/></svg>',
	);

function SelectionExample() {
	const [selected, setSelected] = React.useState("a");
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
}

export function AssetListItemPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">AssetListItem</h1>
					<CopyButton
						value="AssetListItem"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Selectable row for a captured asset — thumbnail with an overlay slot, clamped title and subtitle, and a meta
					line.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Default</CardTitle>
					<CardDescription>A live camera: a LIVE pill over the thumbnail, status and freshness below.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:max-w-sm">
						<AssetListItem
							thumbnail={THUMB}
							thumbnailAlt="Tower crane east"
							title="Tower crane east"
							subtitle="Zone B · Level 12"
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
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>No thumbnail</CardTitle>
					<CardDescription>The fallback fills the well instead of leaving a broken frame.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:max-w-sm">
						<AssetListItem
							title="Gate camera"
							subtitle="North entrance"
							fallback={<Camera className="wwc:text-muted-foreground/50 wwc:h-5 wwc:w-5" />}
						>
							<Badge variant="secondary" className="wwc:text-xs">
								offline
							</Badge>
							<span>4 hours ago</span>
						</AssetListItem>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Selection</CardTitle>
					<CardDescription>
						Selection drives the map beside it, so it is marked in the DOM as well as drawn.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SelectionExample />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Other overlays</CardTitle>
					<CardDescription>A processing veil, and a play button with a duration chip.</CardDescription>
				</CardHeader>
				<CardContent>
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
										<div className="wwc:bg-background/80 wwc:flex wwc:h-8 wwc:w-8 wwc:items-center wwc:justify-center wwc:rounded-full">
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
				</CardContent>
			</Card>
		</div>
	);
}
