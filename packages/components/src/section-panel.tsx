import {cn} from "@core/core-utils";
import {ChevronRight} from "lucide-react";
import * as React from "react";

import {Badge} from "./badge";
import {Card, CardContent, CardHeader, CardTitle} from "./card";
import {Item, ItemTitle} from "./item";
import {ScrollArea} from "./scroll-area";

export interface SectionPanelProps {
	/** Leading header icon (lucide or any component type). */
	icon?: React.ElementType;
	/** Section title shown in the header. */
	title: string;
	/** Optional count badge next to the title (e.g. number of items). */
	count?: React.ReactNode;
	/** Optional element rendered at the far right of the header (e.g. a button). */
	action?: React.ReactNode;
	/**
	 * Fixed body height in pixels. When set, the body scrolls internally so the panel's footprint
	 * stays constant regardless of how many rows it holds — the list grows inward, not down the page.
	 */
	height?: number;
	/** Rendered when there are no children (falsy). */
	empty?: React.ReactNode;
	children?: React.ReactNode;
	className?: string;
	/** Extra classes for the scrollable/content body. */
	bodyClassName?: string;
}

/**
 * A titled section container ("panel") for dashboards: an icon + title + count header with an optional
 * right-aligned action, over a body that can be capped to a fixed height and scroll internally. Compose
 * it with `Item` rows for a compact, count-stable list (the "assigned to you" pattern) or with cards.
 */
const SectionPanel = React.forwardRef<HTMLDivElement, SectionPanelProps>(
	({icon: Icon, title, count, action, height, empty, children, className, bodyClassName}, ref) => {
		const hasChildren = React.Children.toArray(children).some(Boolean);
		const body = (
			<div className={cn(!height && "wwc:px-4 wwc:pb-4", height && "wwc:px-4 wwc:py-2", bodyClassName)}>
				{hasChildren ? children : empty}
			</div>
		);
		return (
			<Card ref={ref} className={cn("wwc:shadow-none", className)}>
				<CardHeader className="wwc:flex wwc:flex-row wwc:items-center wwc:justify-between wwc:gap-2 wwc:space-y-0 wwc:px-4 wwc:py-3">
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						{Icon && <Icon className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />}
						<CardTitle className="wwc:text-base">{title}</CardTitle>
						{count !== undefined && <Badge variant="secondary">{count}</Badge>}
					</div>
					{action}
				</CardHeader>
				<CardContent className="wwc:p-0">
					{height ? <ScrollArea style={{height}}>{body}</ScrollArea> : body}
				</CardContent>
			</Card>
		);
	},
);
SectionPanel.displayName = "SectionPanel";

export interface SectionPanelRowProps {
	/** Primary single-line label on the left. */
	title: React.ReactNode;
	/** Right-aligned content (counts, badges, status). */
	trailing?: React.ReactNode;
	/** When set, the whole row is a button and a trailing chevron is shown. */
	onClick?: () => void;
	className?: string;
}

/**
 * A compact single-line row for a `SectionPanel` list: a title on the left and trailing content on the
 * right, optionally clickable (renders as a button with a chevron). No icon or description — kept short so
 * many rows fit a fixed-height panel. Composes the `Item` primitive.
 */
const SectionPanelRow = React.forwardRef<HTMLDivElement, SectionPanelRowProps>(
	({title, trailing, onClick, className}, ref) => {
		const row = (
			<Item
				ref={ref}
				className={cn(
					"wwc:gap-3 wwc:px-2 wwc:py-2.5",
					onClick && "wwc:cursor-pointer wwc:transition-colors wwc:hover:bg-muted/50",
					className,
				)}
			>
				<ItemTitle className="wwc:truncate">{title}</ItemTitle>
				<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-3">
					{trailing}
					{onClick && <ChevronRight className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />}
				</div>
			</Item>
		);
		return onClick ? (
			<button type="button" onClick={onClick} className="wwc:block wwc:w-full wwc:text-left">
				{row}
			</button>
		) : (
			row
		);
	},
);
SectionPanelRow.displayName = "SectionPanelRow";

export {SectionPanel, SectionPanelRow};
