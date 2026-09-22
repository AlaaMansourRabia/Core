import {cn} from "@core/core-utils";
import * as React from "react";

export interface OutlineItem {
	id: string;
	label: string;
	level: number;
	children?: OutlineItem[];
}

export interface OutlineProps extends React.HTMLAttributes<HTMLElement> {
	/** Outline items (headings) */
	items: OutlineItem[];
	/** Currently active item ID */
	activeId?: string;
	/** Callback when an item is clicked */
	onItemClick?: (id: string) => void;
	/** Maximum nesting level to display */
	maxLevel?: number;
	/** Indent per level in pixels */
	indentSize?: number;
	/** Show connecting lines */
	showLines?: boolean;
}

/** Document outline navigation component for table of contents. */
const Outline = React.forwardRef<HTMLElement, OutlineProps>(
	({className, items, activeId, onItemClick, maxLevel = 6, indentSize = 16, showLines = false, ...props}, ref) => {
		const renderItem = (item: OutlineItem) => {
			if (item.level > maxLevel) return null;

			const isActive = item.id === activeId;
			const indent = (item.level - 1) * indentSize;

			return (
				<li key={item.id} className="wwc:relative">
					{showLines && item.level > 1 && (
						<div
							className="wwc:absolute wwc:left-0 wwc:top-0 wwc:bottom-0 wwc:border-l wwc:border-border"
							style={{left: `${indent - indentSize / 2}px`}}
						/>
					)}
					<button
						type="button"
						onClick={() => onItemClick?.(item.id)}
						className={cn(
							"wwc:w-full wwc:text-left wwc:py-1.5 wwc:px-2 wwc:rounded-md wwc:text-sm wwc:transition-colors",
							"hover:wwc:bg-accent hover:wwc:text-accent-foreground",
							isActive ? "wwc:bg-accent wwc:text-accent-foreground wwc:font-medium" : "wwc:text-muted-foreground",
						)}
						style={{paddingLeft: `${indent + 8}px`}}
					>
						{item.label}
					</button>
					{item.children && item.children.length > 0 && (
						<ul className="wwc:list-none wwc:m-0 wwc:p-0">{item.children.map(renderItem)}</ul>
					)}
				</li>
			);
		};

		return (
			<nav ref={ref} className={cn("wwc:relative", className)} aria-label="Document outline" {...props}>
				<ul className="wwc:list-none wwc:m-0 wwc:p-0 wwc:space-y-0.5">{items.map(renderItem)}</ul>
			</nav>
		);
	},
);
Outline.displayName = "Outline";

export {Outline};
