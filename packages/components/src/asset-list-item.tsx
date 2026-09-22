import {cn} from "@corensystem/core-utils";
import * as React from "react";

import {Card} from "./card";

/**
 * A selectable row for a captured asset — a camera feed, a drone capture, a timelapse.
 *
 * One 2,199-line template held three of these, structurally identical and differing only in what
 * sits on the thumbnail and what the meta line says. The shell — the card, the selection ring, the
 * 80×56 thumbnail well, the clamped title and subtitle — is the same every time, so it lives here
 * and the differences arrive as slots.
 *
 * `overlay` is positioned over the thumbnail: a LIVE pill, a processing spinner, a play button and
 * duration chip. `children` is the meta line under the subtitle — usually a status `Badge` and a
 * timestamp, but a frames-and-date run of text works just as well.
 */

export interface AssetListItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
	/** Thumbnail image URL. Omit — or pass an asset that has none — to show `fallback` instead. */
	thumbnail?: string;
	/** Alt text for the thumbnail. Required whenever `thumbnail` is set. */
	thumbnailAlt?: string;
	/** Shown in the thumbnail well when there is no image — typically a muted lucide icon. */
	fallback?: React.ReactNode;
	/** Rendered over the thumbnail, absolutely positioned: live pills, spinners, duration chips. */
	overlay?: React.ReactNode;
	/** Primary line. Clamped to one line. */
	title: React.ReactNode;
	/** Secondary line under the title. */
	subtitle?: React.ReactNode;
	/** Draws the selection ring. */
	selected?: boolean;
	/** The meta line — a status badge and a timestamp, or any short run of facts. */
	children?: React.ReactNode;
}

/** Thumbnail, title, subtitle and a meta line, in a selectable card. */
export const AssetListItem = React.forwardRef<HTMLDivElement, AssetListItemProps>(
	(
		{thumbnail, thumbnailAlt, fallback, overlay, title, subtitle, selected = false, className, children, ...props},
		ref,
	) => (
		<Card
			ref={ref}
			data-core-artifact="asset-list-item"
			data-selected={selected || undefined}
			className={cn(
				"wwc:cursor-pointer wwc:overflow-hidden wwc:transition-all wwc:hover:shadow-md",
				selected && "wwc:ring-2 wwc:ring-primary",
				className,
			)}
			{...props}
		>
			<div className="wwc:p-3">
				<div className="wwc:flex wwc:gap-3">
					<div className="wwc:relative wwc:h-14 wwc:w-20 wwc:shrink-0 wwc:overflow-hidden wwc:rounded-md wwc:bg-muted">
						{thumbnail ? (
							<img src={thumbnail} alt={thumbnailAlt ?? ""} className="wwc:h-full wwc:w-full wwc:object-cover" />
						) : (
							<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:bg-muted">
								{fallback}
							</div>
						)}
						{overlay}
					</div>
					<div className="wwc:min-w-0 wwc:flex-1">
						<h3 className="wwc:line-clamp-1 wwc:text-sm wwc:font-medium wwc:text-foreground">{title}</h3>
						{subtitle ? <p className="wwc:text-xs wwc:text-muted-foreground">{subtitle}</p> : null}
						{children ? (
							<div className="wwc:mt-1 wwc:flex wwc:items-center wwc:gap-2 wwc:text-xs wwc:text-muted-foreground">
								{children}
							</div>
						) : null}
					</div>
				</div>
			</div>
		</Card>
	),
);
AssetListItem.displayName = "AssetListItem";
