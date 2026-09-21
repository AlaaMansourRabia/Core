import {cn} from "@wakecap/core-utils";
import * as React from "react";

import {FLOAT_SHADOW} from "./float-shadow";

export interface MapHoverCardRow {
	label: string;
	value: React.ReactNode;
}

export interface MapHoverCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
	title: React.ReactNode;
	/** Badges or meta under the title. */
	badges?: React.ReactNode;
	/** A preview strip above the title — a camera still, an image, a chart. */
	media?: React.ReactNode;
	/** Label/value lines. Keep it to a handful; this is a peek, not the record. */
	rows?: MapHoverCardRow[];
	/** A closing line — a hint, a count, an action. */
	footer?: React.ReactNode;
	/** Width in px. Default `220`. */
	width?: number;
}

/**
 * The card shown while hovering a marker: a peek at what is under the cursor, sized to be read without
 * moving the eye far. It carries only what identifies the thing and what you would decide on — opening
 * it is what the full panel is for.
 */
const MapHoverCard = React.forwardRef<HTMLDivElement, MapHoverCardProps>(
	({className, title, badges, media, rows, footer, width = 220, style, ...props}, ref) => (
		<div
			ref={ref}
			className={cn(
				"wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:text-card-foreground",
				FLOAT_SHADOW,
				className,
			)}
			style={{width, ...style}}
			{...props}
		>
			{media}
			<div className="wwc:space-y-1.5 wwc:px-2.5 wwc:py-2">
				<div className="wwc:space-y-1">
					<p className="wwc:truncate wwc:text-xs wwc:font-semibold">{title}</p>
					{badges && <div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1">{badges}</div>}
				</div>

				{rows && rows.length > 0 && (
					<div className="wwc:space-y-0.5">
						{rows.map((row) => (
							<div key={row.label} className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-2 wwc:text-[11px]">
								<span className="wwc:shrink-0 wwc:text-muted-foreground">{row.label}</span>
								<span className="wwc:min-w-0 wwc:truncate wwc:text-right wwc:font-medium">{row.value}</span>
							</div>
						))}
					</div>
				)}

				{footer && <div className="wwc:pt-0.5 wwc:text-[11px] wwc:text-muted-foreground">{footer}</div>}
			</div>
		</div>
	),
);
MapHoverCard.displayName = "MapHoverCard";

export {MapHoverCard};
