import {cn} from "@corensystem/coren-utils";
import {X} from "lucide-react";
import * as React from "react";

export type BrowserTabItem = {
	id: string;
	label: string;
	icon?: React.ReactNode;
	disabled?: boolean;
};

export interface BrowserTabsProps extends React.HTMLAttributes<HTMLDivElement> {
	tabs: BrowserTabItem[];
	activeId?: string;
	onActiveChange?: (id: string) => void;
	onTabClose?: (id: string) => void;
	closeable?: boolean;
	trailing?: React.ReactNode;
	/**
	 * Enable horizontal drag-to-reorder (browser-style). Fires with the full tab-id list in its new
	 * order every time the dragged tab crosses another. Omit to keep tabs fixed.
	 */
	onReorder?: (orderedIds: string[]) => void;
}

// Mask carves a quarter-circle out of a 12x12 square so only an L-shaped sliver of
// `bg-background` remains, merging the active tab's bottom corner into the panel
// below — without the inline `boxShadow` + `var(--background)` trick that fails in
// Firefox/Safari.
const cornerMaskLeft: React.CSSProperties = {
	WebkitMaskImage: "radial-gradient(circle 12px at top left, transparent 12px, black 12px)",
	maskImage: "radial-gradient(circle 12px at top left, transparent 12px, black 12px)",
};

const cornerMaskRight: React.CSSProperties = {
	WebkitMaskImage: "radial-gradient(circle 12px at top right, transparent 12px, black 12px)",
	maskImage: "radial-gradient(circle 12px at top right, transparent 12px, black 12px)",
};

interface BrowserTabProps {
	tab: BrowserTabItem;
	active: boolean;
	closeable: boolean;
	onSelect: () => void;
	onClose?: () => void;
	draggable?: boolean;
	dragging?: boolean;
	onDragStart?: React.DragEventHandler<HTMLDivElement>;
	onDragEnter?: React.DragEventHandler<HTMLDivElement>;
	onDragOver?: React.DragEventHandler<HTMLDivElement>;
	onDrop?: React.DragEventHandler<HTMLDivElement>;
	onDragEnd?: React.DragEventHandler<HTMLDivElement>;
}

const BrowserTab = React.forwardRef<HTMLDivElement, BrowserTabProps>(
	({tab, active, closeable, onSelect, onClose, draggable, dragging, ...dragHandlers}, ref) => {
		return (
			<div
				ref={ref}
				role="tab"
				aria-selected={active}
				aria-disabled={tab.disabled || undefined}
				tabIndex={tab.disabled ? -1 : 0}
				draggable={draggable}
				{...dragHandlers}
				className={cn(
					"wwc:relative wwc:flex wwc:h-9 wwc:min-w-0 wwc:max-w-[240px] wwc:items-center wwc:gap-2 wwc:rounded-t-lg wwc:px-3 wwc:text-sm wwc:transition-colors wwc:select-none wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring",
					active
						? "wwc:z-10 wwc:bg-card wwc:text-foreground wwc:font-medium"
						: "wwc:bg-background/60 wwc:text-muted-foreground wwc:hover:bg-muted wwc:hover:text-foreground wwc:cursor-pointer",
					draggable && "wwc:cursor-grab wwc:active:cursor-grabbing",
					dragging && "wwc:opacity-40",
					tab.disabled && "wwc:opacity-50 wwc:pointer-events-none",
				)}
				onClick={() => {
					if (tab.disabled || active) return;
					onSelect();
				}}
				onKeyDown={(e) => {
					if (tab.disabled || active) return;
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						onSelect();
					}
				}}
			>
				{tab.icon && (
					<span className="wwc:flex wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:items-center wwc:justify-center">
						{tab.icon}
					</span>
				)}
				<span className="wwc:truncate">{tab.label}</span>
				{closeable && onClose && !tab.disabled && (
					<button
						type="button"
						aria-label={`Close ${tab.label}`}
						onClick={(e) => {
							e.stopPropagation();
							onClose();
						}}
						className="wwc:ml-1 wwc:grid wwc:shrink-0 wwc:place-items-center wwc:rounded wwc:p-0.5 wwc:text-muted-foreground wwc:hover:bg-destructive/10 wwc:hover:text-destructive wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring"
					>
						<X className="wwc:h-3 wwc:w-3" />
					</button>
				)}
				{active && (
					<>
						<span
							aria-hidden
							className="wwc:pointer-events-none wwc:absolute wwc:-left-3 wwc:bottom-0 wwc:h-3 wwc:w-3 wwc:bg-card"
							style={cornerMaskLeft}
						/>
						<span
							aria-hidden
							className="wwc:pointer-events-none wwc:absolute wwc:-right-3 wwc:bottom-0 wwc:h-3 wwc:w-3 wwc:bg-card"
							style={cornerMaskRight}
						/>
					</>
				)}
			</div>
		);
	},
);
BrowserTab.displayName = "BrowserTab";

const BrowserTabs = React.forwardRef<HTMLDivElement, BrowserTabsProps>(
	({tabs, activeId, onActiveChange, onTabClose, closeable = false, trailing, onReorder, className, ...rest}, ref) => {
		const isControlled = activeId !== undefined;
		const [internalActive, setInternalActive] = React.useState<string | undefined>(() => tabs[0]?.id);
		const resolvedActive = isControlled ? activeId : internalActive;
		const [dragId, setDragId] = React.useState<string | null>(null);
		const reorderable = typeof onReorder === "function";

		const handleSelect = (id: string) => {
			if (!isControlled) setInternalActive(id);
			onActiveChange?.(id);
		};

		const handleDragStart = (event: React.DragEvent, id: string) => {
			setDragId(id);
			if (event.dataTransfer) {
				event.dataTransfer.effectAllowed = "move";
				// Some browsers require data to be set for the drag to begin.
				try {
					event.dataTransfer.setData("text/plain", id);
				} catch {
					/* no-op */
				}
			}
		};

		const handleDragOverTab = (event: React.DragEvent, overId: string) => {
			if (!reorderable || dragId === null) return;
			event.preventDefault();
			if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
			if (overId === dragId) return;
			const ids = tabs.map((tab) => tab.id);
			const from = ids.indexOf(dragId);
			const to = ids.indexOf(overId);
			if (from === -1 || to === -1) return;
			ids.splice(from, 1);
			ids.splice(to, 0, dragId);
			onReorder?.(ids);
		};

		return (
			<div
				ref={ref}
				role="tablist"
				className={cn("wwc:relative wwc:flex wwc:items-end wwc:gap-1 wwc:bg-muted wwc:px-2 wwc:pt-2", className)}
				{...rest}
			>
				{tabs.map((tab) => (
					<BrowserTab
						key={tab.id}
						tab={tab}
						active={tab.id === resolvedActive}
						closeable={closeable}
						onSelect={() => handleSelect(tab.id)}
						onClose={onTabClose ? () => onTabClose(tab.id) : undefined}
						draggable={reorderable && !tab.disabled}
						dragging={dragId === tab.id}
						onDragStart={reorderable ? (event) => handleDragStart(event, tab.id) : undefined}
						onDragEnter={reorderable ? (event) => event.preventDefault() : undefined}
						onDragOver={reorderable ? (event) => handleDragOverTab(event, tab.id) : undefined}
						onDrop={reorderable ? (event) => event.preventDefault() : undefined}
						onDragEnd={reorderable ? () => setDragId(null) : undefined}
					/>
				))}
				{trailing && <div className="wwc:ml-auto wwc:flex wwc:shrink-0 wwc:items-center">{trailing}</div>}
			</div>
		);
	},
);
BrowserTabs.displayName = "BrowserTabs";

export {BrowserTab, BrowserTabs};
