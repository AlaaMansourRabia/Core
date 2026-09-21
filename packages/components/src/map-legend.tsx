import {cn} from "@core/core-utils";
import {PanelLeft, PanelLeftClose} from "lucide-react";
import * as React from "react";

import {Button} from "./button";
import {FLOAT_SHADOW} from "./float-shadow";

/** How a legend entry is drawn, matching how the thing itself appears on the map. */
export type MapLegendShape = "circle" | "square" | "fill" | "line" | "dashed";

export interface MapLegendItem {
	label: string;
	/** Swatch colour. */
	color: string;
	/** Default `circle`. Use `square` for fixtures, `fill`/`line`/`dashed` for map layers. */
	shape?: MapLegendShape;
	/** Glyph drawn inside the swatch, as inner SVG markup on a 24x24 viewBox. */
	icon?: string;
}

export interface MapLegendSection {
	title: string;
	items: MapLegendItem[];
}

export interface MapLegendProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
	/** Header text. Default "Map legend". */
	title?: React.ReactNode;
	sections: MapLegendSection[];
	/** Start folded to just the header. Default false. */
	defaultCollapsed?: boolean;
	collapsed?: boolean;
	onCollapsedChange?: (collapsed: boolean) => void;
	/** Width in px. Default `150` — a key, not a panel. */
	width?: number;
	/** Width while collapsed. Default `160`, matching a collapsed `MapControlPanel`. */
	collapsedWidth?: number;
	/** Cap on the card's height; the body scrolls beneath it. Default `"50vh"`. */
	maxHeight?: string;
}

function Swatch({item}: {item: MapLegendItem}) {
	const shape = item.shape ?? "circle";
	if (shape === "line" || shape === "dashed") {
		return (
			<span
				aria-hidden="true"
				className="wwc:h-0 wwc:w-3.5 wwc:shrink-0 wwc:border-t-2"
				style={{borderColor: item.color, borderStyle: shape === "dashed" ? "dashed" : "solid"}}
			/>
		);
	}
	return (
		<span
			aria-hidden="true"
			className={cn(
				"wwc:flex wwc:size-3 wwc:shrink-0 wwc:items-center wwc:justify-center",
				shape === "circle" && "wwc:rounded-full",
				shape === "square" && "wwc:rounded-[3px]",
				shape === "fill" && "wwc:rounded-[2px] wwc:opacity-60",
			)}
			style={{backgroundColor: item.color}}
		>
			{item.icon && (
				// Same trick the markers use: the glyph fills white and its detail is knocked back out.
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width={8}
					height={8}
					viewBox="0 0 24 24"
					fill="#fff"
					stroke="none"
					style={{color: item.color}}
					// biome-ignore lint/security/noDangerouslySetInnerHtml: the glyph is library-authored markup
					dangerouslySetInnerHTML={{__html: item.icon}}
				/>
			)}
		</span>
	);
}

/**
 * A compact key for what is currently drawn on a map: swatches shaped like the thing they describe, so
 * a round entry means a round marker and a dashed entry means a dashed outline. Grouped into sections
 * and foldable, with the same chrome as the other floating map panels.
 */
const MapLegend = React.forwardRef<HTMLDivElement, MapLegendProps>(
	(
		{
			className,
			title = "Map legend",
			sections,
			defaultCollapsed = false,
			collapsed: collapsedProp,
			onCollapsedChange,
			width = 150,
			collapsedWidth = 160,
			maxHeight = "50vh",
			style,
			...props
		},
		ref,
	) => {
		const [uncontrolled, setUncontrolled] = React.useState(defaultCollapsed);
		const collapsed = collapsedProp ?? uncontrolled;

		const toggle = () => {
			const next = !collapsed;
			if (collapsedProp == null) setUncontrolled(next);
			onCollapsedChange?.(next);
		};

		return (
			<div
				ref={ref}
				className={cn(
					"wwc:flex wwc:flex-col wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:text-card-foreground",
					FLOAT_SHADOW,
					className,
				)}
				style={{width: collapsed ? collapsedWidth : width, maxHeight, transition: "width 200ms ease", ...style}}
				{...props}
			>
				<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:justify-between wwc:gap-2 wwc:px-2.5 wwc:py-1.5">
					<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">{title}</span>
					<Button
						variant="ghost"
						size="sm"
						icon
						aria-label={collapsed ? "Show map legend" : "Hide map legend"}
						aria-expanded={!collapsed}
						className="wwc:h-6 wwc:w-6 wwc:text-muted-foreground"
						onClick={toggle}
					>
						{collapsed ? (
							<PanelLeft className="wwc:h-3.5 wwc:w-3.5" />
						) : (
							<PanelLeftClose className="wwc:h-3.5 wwc:w-3.5" />
						)}
					</Button>
				</div>

				{!collapsed && (
					<div className="wwc:min-h-0 wwc:flex-1 wwc:space-y-2 wwc:overflow-y-auto wwc:border-t wwc:border-border wwc:px-2.5 wwc:py-2">
						{sections.map((section) => (
							<div key={section.title} className="wwc:space-y-1">
								<p className="wwc:text-[11px] wwc:font-semibold">{section.title}</p>
								<ul className="wwc:space-y-0.5">
									{section.items.map((item) => (
										<li
											key={item.label}
											className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:text-[11px] wwc:leading-5"
										>
											<Swatch item={item} />
											<span className="wwc:truncate wwc:text-muted-foreground">{item.label}</span>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				)}
			</div>
		);
	},
);
MapLegend.displayName = "MapLegend";

export {MapLegend};
