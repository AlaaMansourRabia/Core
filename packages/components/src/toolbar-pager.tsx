import {cn} from "@wakecap/core-utils";
import {ChevronLeft, ChevronRight} from "lucide-react";
import * as React from "react";

import {ToolbarButton} from "./toolbar";

export interface ToolbarPagerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
	/** 1-based current index. */
	index: number;
	/** Total number of items. */
	count: number;
	/** Called with the next 1-based index when prev/next is pressed. */
	onIndexChange?: (next: number) => void;
	/** Accessible labels (default "Previous page" / "Next page"). */
	prevLabel?: string;
	nextLabel?: string;
}

const ToolbarPager = React.forwardRef<HTMLDivElement, ToolbarPagerProps>(
	({className, index, count, onIndexChange, prevLabel = "Previous page", nextLabel = "Next page", ...rest}, ref) => (
		<div ref={ref} className={cn("wwc:flex wwc:items-center wwc:gap-1 wwc:pl-1", className)} {...rest}>
			<ToolbarButton
				icon
				label={prevLabel}
				onClick={() => onIndexChange?.(Math.max(1, index - 1))}
				disabled={index <= 1}
			>
				<ChevronLeft className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
			<span className="wwc:min-w-12 wwc:text-center wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
				{index} / {count}
			</span>
			<ToolbarButton
				icon
				label={nextLabel}
				onClick={() => onIndexChange?.(Math.min(count, index + 1))}
				disabled={index >= count}
			>
				<ChevronRight className="wwc:h-4 wwc:w-4" />
			</ToolbarButton>
		</div>
	),
);
ToolbarPager.displayName = "ToolbarPager";

export {ToolbarPager};
