import {cn} from "@corensystem/core-utils";
import * as React from "react";

// AppCard — a marketplace / app-store listing card: a branded icon, an optional top-right status badge, a
// title (which may contain a search highlight), a clamped description, and a footer action row. Purely
// presentational and slot-driven — the caller supplies the icon, badge, and action buttons.

const clampByLines: Record<2 | 3 | 4, string> = {
	2: "wwc:line-clamp-2",
	3: "wwc:line-clamp-3",
	4: "wwc:line-clamp-4",
};

const minHeightByLines: Record<2 | 3 | 4, string> = {
	2: "wwc:min-h-[2.5rem]",
	3: "wwc:min-h-[3.75rem]",
	4: "wwc:min-h-[5rem]",
};

export interface AppCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
	/** Branded app icon/logo — an `<img>`, an SVG, or a sized lucide icon. */
	icon: React.ReactNode;
	/** App name. May be a string or a node (e.g. a search-highlighted fragment). */
	name: React.ReactNode;
	/** Short description. Clamped to `descriptionLines`. */
	description?: React.ReactNode;
	/** Status shown at the top-right (e.g. an "Installed" `Badge`). */
	badge?: React.ReactNode;
	/** Footer action row — typically two equal-width buttons (Details + Install). Wrapped in a flex row. */
	actions?: React.ReactNode;
	/** How many lines of description before truncation. Defaults to 3, keeping card heights aligned. */
	descriptionLines?: 2 | 3 | 4;
}

/** A marketplace app-store listing card — icon, status badge, title, description, and an action footer. */
const AppCard = React.forwardRef<HTMLDivElement, AppCardProps>(
	({icon, name, description, badge, actions, descriptionLines = 3, className, ...props}, ref) => (
		<div
			ref={ref}
			className={cn(
				"wwc:flex wwc:flex-col wwc:gap-3 wwc:rounded-xl wwc:border wwc:bg-card wwc:p-4 wwc:text-card-foreground",
				className,
			)}
			{...props}
		>
			<div className="wwc:flex wwc:items-start wwc:gap-3">
				<div className="wwc:flex wwc:h-12 wwc:w-12 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:overflow-hidden wwc:rounded-xl">
					{icon}
				</div>
				{badge && <div className="wwc:ml-auto wwc:shrink-0">{badge}</div>}
			</div>

			<h3 className="wwc:truncate wwc:text-base wwc:font-semibold wwc:leading-tight">{name}</h3>

			{description && (
				<p
					className={cn(
						"wwc:text-sm wwc:text-muted-foreground",
						clampByLines[descriptionLines],
						minHeightByLines[descriptionLines],
					)}
				>
					{description}
				</p>
			)}

			{actions && <div className="wwc:mt-auto wwc:flex wwc:items-center wwc:gap-2">{actions}</div>}
		</div>
	),
);
AppCard.displayName = "AppCard";

export {AppCard};
