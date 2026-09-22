import {cn} from "@core/core-utils";
import * as React from "react";

import {Popover, PopoverContent, PopoverTrigger} from "./popover";

export interface OverflowListProps<T> {
	/** Array of items to display */
	items: T[];
	/** Maximum number of items to show before overflow */
	maxVisible?: number;
	/** Render function for each item */
	renderItem: (item: T, index: number) => React.ReactNode;
	/** Render function for the overflow trigger */
	renderOverflow?: (count: number) => React.ReactNode;
	/** Render function for items in the overflow popover */
	renderOverflowItem?: (item: T, index: number) => React.ReactNode;
	/** className for the container */
	className?: string;
	/** className for the list */
	listClassName?: string;
}

/** A list component that shows a subset of items and hides the rest in an overflow menu. */
function OverflowList<T>({
	items,
	maxVisible = 3,
	renderItem,
	renderOverflow,
	renderOverflowItem,
	className,
	listClassName,
}: OverflowListProps<T>) {
	const visibleItems = items.slice(0, maxVisible);
	const overflowItems = items.slice(maxVisible);
	const hasOverflow = overflowItems.length > 0;

	return (
		<div className={cn("wwc:flex wwc:items-center wwc:gap-2", className)}>
			<div className={cn("wwc:flex wwc:items-center wwc:gap-2", listClassName)}>
				{visibleItems.map((item, index) => (
					<React.Fragment key={index}>{renderItem(item, index)}</React.Fragment>
				))}
			</div>

			{hasOverflow && (
				<Popover>
					<PopoverTrigger asChild>
						<button className="wwc:text-sm wwc:text-muted-foreground wwc:hover:text-foreground wwc:transition-colors">
							{renderOverflow ? (
								renderOverflow(overflowItems.length)
							) : (
								<span>+{overflowItems.length} more</span>
							)}
						</button>
					</PopoverTrigger>
					<PopoverContent className="wwc:w-auto wwc:p-2">
						<div className="wwc:space-y-1">
							{overflowItems.map((item, index) => (
								<div key={index}>
									{renderOverflowItem ? renderOverflowItem(item, index + maxVisible) : renderItem(item, index + maxVisible)}
								</div>
							))}
						</div>
					</PopoverContent>
				</Popover>
			)}
		</div>
	);
}

export {OverflowList};
