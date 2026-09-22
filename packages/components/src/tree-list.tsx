import {cn} from "@core/core-utils";
import {ChevronRight, ChevronDown} from "lucide-react";
import * as React from "react";

export interface TreeListItem {
	id: string;
	label: React.ReactNode;
	icon?: React.ReactNode;
	children?: TreeListItem[];
	disabled?: boolean;
	/** Additional data attached to the item */
	data?: unknown;
}

export interface TreeListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
	/** Tree items */
	items: TreeListItem[];
	/** Currently selected item ID */
	selectedId?: string;
	/** Currently expanded item IDs */
	expandedIds?: string[];
	/** Callback when selection changes */
	onSelect?: (id: string, item: TreeListItem) => void;
	/** Callback when expansion changes */
	onExpand?: (expandedIds: string[]) => void;
	/** Default expanded state */
	defaultExpandedIds?: string[];
	/** Allow multiple selection */
	multiSelect?: boolean;
	/** Selected item IDs (for multiSelect) */
	selectedIds?: string[];
	/** Indent per level in pixels */
	indentSize?: number;
	/** Show connecting lines */
	showLines?: boolean;
}

/** Hierarchical tree list component for nested data. */
const TreeList = React.forwardRef<HTMLDivElement, TreeListProps>(
	(
		{
			className,
			items,
			selectedId,
			expandedIds: controlledExpandedIds,
			onSelect,
			onExpand,
			defaultExpandedIds = [],
			multiSelect = false,
			selectedIds = [],
			indentSize = 20,
			showLines = false,
			...props
		},
		ref,
	) => {
		const [internalExpandedIds, setInternalExpandedIds] = React.useState<string[]>(defaultExpandedIds);
		const expandedIds = controlledExpandedIds ?? internalExpandedIds;

		const toggleExpand = (id: string) => {
			const newExpandedIds = expandedIds.includes(id) ? expandedIds.filter((eid) => eid !== id) : [...expandedIds, id];

			if (controlledExpandedIds === undefined) {
				setInternalExpandedIds(newExpandedIds);
			}
			onExpand?.(newExpandedIds);
		};

		const renderItem = (item: TreeListItem, level: number = 0) => {
			const hasChildren = item.children && item.children.length > 0;
			const isExpanded = expandedIds.includes(item.id);
			const isSelected = multiSelect ? selectedIds.includes(item.id) : selectedId === item.id;
			const indent = level * indentSize;

			return (
				<div key={item.id} className="wwc:relative">
					{showLines && level > 0 && (
						<div
							className="wwc:absolute wwc:top-0 wwc:bottom-0 wwc:border-l wwc:border-border"
							style={{left: `${indent - indentSize / 2}px`}}
						/>
					)}
					<div
						role="treeitem"
						aria-selected={isSelected}
						aria-expanded={hasChildren ? isExpanded : undefined}
						aria-disabled={item.disabled}
						tabIndex={item.disabled ? -1 : 0}
						className={cn(
							"wwc:flex wwc:items-center wwc:gap-1 wwc:py-1 wwc:pr-2 wwc:rounded-md wwc:cursor-pointer wwc:transition-colors",
							"wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring",
							isSelected ? "wwc:bg-accent wwc:text-accent-foreground" : "hover:wwc:bg-accent/50",
							item.disabled && "wwc:opacity-50 wwc:cursor-not-allowed",
						)}
						style={{paddingLeft: `${indent + 4}px`}}
						onClick={() => {
							if (item.disabled) return;
							if (hasChildren) {
								toggleExpand(item.id);
							}
							onSelect?.(item.id, item);
						}}
						onKeyDown={(e) => {
							if (item.disabled) return;
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								if (hasChildren) {
									toggleExpand(item.id);
								}
								onSelect?.(item.id, item);
							}
							if (e.key === "ArrowRight" && hasChildren && !isExpanded) {
								e.preventDefault();
								toggleExpand(item.id);
							}
							if (e.key === "ArrowLeft" && hasChildren && isExpanded) {
								e.preventDefault();
								toggleExpand(item.id);
							}
						}}
					>
						{hasChildren ? (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									toggleExpand(item.id);
								}}
								className="wwc:p-0.5 wwc:rounded hover:wwc:bg-accent"
							>
								{isExpanded ? (
									<ChevronDown className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
								) : (
									<ChevronRight className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
								)}
							</button>
						) : (
							<span className="wwc:w-5" />
						)}
						{item.icon && <span className="wwc:flex-shrink-0">{item.icon}</span>}
						<span className="wwc:flex-1 wwc:truncate wwc:text-sm">{item.label}</span>
					</div>
					{hasChildren && isExpanded && (
						<div role="group">{item.children!.map((child) => renderItem(child, level + 1))}</div>
					)}
				</div>
			);
		};

		return (
			<div ref={ref} role="tree" className={cn("wwc:space-y-0.5", className)} {...props}>
				{items.map((item) => renderItem(item))}
			</div>
		);
	},
);
TreeList.displayName = "TreeList";

export {TreeList};
