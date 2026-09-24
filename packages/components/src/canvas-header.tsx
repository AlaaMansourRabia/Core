import {cn} from "@corensystem/coren-utils";
import * as React from "react";

import {WeekSelector, type WeekSelectorProps} from "./week-selector";

export interface CanvasHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Left cluster — typically a `Breadcrumb`. Takes the free width and stays on a single line. */
	left?: React.ReactNode;
	/** Optional centered cluster (e.g. a title or a segmented control). */
	center?: React.ReactNode;
	/** Right cluster actions (e.g. a full-screen `Button`), placed after the built-in `weekSelector`. */
	right?: React.ReactNode;
	/**
	 * A built-in period selector at the start of the right cluster. Pass the WeekSelector's props; it
	 * renders `bare` so it sits flush in the bar. The canvas header and a period selector are paired
	 * frequently, so this composes them for you (override the layout with the `right` slot instead).
	 */
	weekSelector?: WeekSelectorProps;
}

/**
 * The canvas-level header: a bordered `min-h-12` bar that heads a workspace canvas. It lays out a `left`
 * cluster (breadcrumb — takes the free width, stays on one line, and truncates its trailing crumb when
 * tight), an optional centered cluster, and a `right` cluster made of an optional built-in `weekSelector`
 * plus your `right` actions. Not the platform top bar (`CoreAppTopBar`) — this heads a single canvas;
 * pair it with `ViewTabBar` (view switching) and `CanvasToolbar` (on-canvas tools).
 */
const CanvasHeader = React.forwardRef<HTMLDivElement, CanvasHeaderProps>(
	({className, left, center, right, weekSelector, ...props}, ref) => {
		const hasRight = weekSelector != null || right != null;
		return (
			<div
				ref={ref}
				className={cn(
					"wwc:flex wwc:min-h-12 wwc:shrink-0 wwc:items-center wwc:gap-4 wwc:border-b wwc:border-border wwc:bg-background wwc:px-3",
					className,
				)}
				{...props}
			>
				{/* Left: takes the free space and stays on one line. `whitespace-nowrap` (inherited) stops every
				    crumb from wrapping; the chain (child → ol) may shrink; each crumb keeps its natural width
				    except the trailing one, which shrinks and truncates with an ellipsis when space runs out. */}
				<div className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-center wwc:overflow-hidden wwc:whitespace-nowrap wwc:[&>*]:min-w-0 wwc:[&_ol]:min-w-0 wwc:[&_ol]:flex-nowrap wwc:[&_li]:shrink-0 wwc:[&_li:last-child]:min-w-0 wwc:[&_li:last-child]:shrink wwc:[&_li:last-child>*]:truncate">
					{left}
				</div>
				{center != null && <div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:justify-center">{center}</div>}
				{hasRight && (
					<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2">
						{weekSelector != null && <WeekSelector bare {...weekSelector} />}
						{right}
					</div>
				)}
			</div>
		);
	},
);
CanvasHeader.displayName = "CanvasHeader";

export {CanvasHeader};
