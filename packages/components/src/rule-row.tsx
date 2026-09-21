import {cn} from "@wakecap/core-utils";
import {ChevronDown, ChevronUp, GripVertical, Plus, Trash2} from "lucide-react";
import * as React from "react";

import {Button} from "./button";

export interface RuleRowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onDrop"> {
	/**
	 * The rule's condition controls — selects, inputs, and connective words like "→ every". Laid out
	 * in a wrapping flex row, so pass them as plain siblings.
	 */
	children: React.ReactNode;
	/** Trailing slot, right-aligned before the delete button — e.g. an "N affected" Badge. */
	meta?: React.ReactNode;
	/** Show the drag affordance. Reordering itself is driven by `onMoveUp`/`onMoveDown`. */
	showDragHandle?: boolean;
	onMoveUp?: () => void;
	onMoveDown?: () => void;
	/** Disables the up arrow — pass `true` for the first row. */
	disableMoveUp?: boolean;
	/** Disables the down arrow — pass `true` for the last row. */
	disableMoveDown?: boolean;
	onDelete?: () => void;
	deleteLabel?: string;
}

/**
 * One row of an ordered rule list: reorder controls, the caller's condition controls, an optional
 * trailing meta slot, and a delete button.
 *
 * Row order carries meaning in every rule builder we ship — first match wins — so reordering is
 * first-class rather than an afterthought. The component owns the chrome and the affordances; the
 * caller owns the rule shape and supplies whatever controls express it.
 *
 * ```tsx
 * <RuleList onAdd={addRule}>
 *   {rules.map((rule, index) => (
 *     <RuleRow
 *       key={rule.id}
 *       meta={<Badge variant="infoSoft">{rule.affected} affected</Badge>}
 *       disableMoveUp={index === 0}
 *       disableMoveDown={index === rules.length - 1}
 *       onMoveUp={() => move(index, -1)}
 *       onMoveDown={() => move(index, 1)}
 *       onDelete={() => remove(rule.id)}
 *     >
 *       <Select …/>
 *       <Input …/>
 *       <span className="text-sm text-muted-foreground">→ every</span>
 *     </RuleRow>
 *   ))}
 * </RuleList>
 * ```
 */
const RuleRow = React.forwardRef<HTMLDivElement, RuleRowProps>(
	(
		{
			children,
			meta,
			showDragHandle = true,
			onMoveUp,
			onMoveDown,
			disableMoveUp,
			disableMoveDown,
			onDelete,
			deleteLabel = "Delete rule",
			className,
			...props
		},
		ref,
	) => (
		<div
			ref={ref}
			data-wakecore-artifact="rule-row"
			className={cn("wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-3 wwc:rounded-lg wwc:border wwc:p-3", className)}
			{...props}
		>
			{showDragHandle && (
				<GripVertical className="wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:cursor-grab wwc:text-muted-foreground" />
			)}

			{(onMoveUp || onMoveDown) && (
				<div className="wwc:flex wwc:shrink-0 wwc:flex-col">
					<button
						type="button"
						aria-label="Move up"
						disabled={disableMoveUp}
						onClick={onMoveUp}
						className="wwc:text-muted-foreground wwc:transition-colors wwc:hover:text-foreground wwc:disabled:opacity-30"
					>
						<ChevronUp className="wwc:h-3.5 wwc:w-3.5" />
					</button>
					<button
						type="button"
						aria-label="Move down"
						disabled={disableMoveDown}
						onClick={onMoveDown}
						className="wwc:text-muted-foreground wwc:transition-colors wwc:hover:text-foreground wwc:disabled:opacity-30"
					>
						<ChevronDown className="wwc:h-3.5 wwc:w-3.5" />
					</button>
				</div>
			)}

			{children}

			{(meta || onDelete) && (
				<div className="wwc:ml-auto wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2">
					{meta}
					{onDelete && (
						<Button
							variant="ghost"
							icon
							aria-label={deleteLabel}
							onClick={onDelete}
							className="wwc:h-7 wwc:w-7 wwc:text-destructive"
						>
							<Trash2 className="wwc:h-4 wwc:w-4" />
						</Button>
					)}
				</div>
			)}
		</div>
	),
);
RuleRow.displayName = "RuleRow";

export interface RuleListProps extends React.HTMLAttributes<HTMLDivElement> {
	/** The `RuleRow` children. */
	children: React.ReactNode;
	onAdd?: () => void;
	addLabel?: string;
	/** Shown in place of the rows when the list is empty. */
	emptyMessage?: React.ReactNode;
}

/** Vertical stack of `RuleRow`s with a trailing "Add Rule" button. */
const RuleList = React.forwardRef<HTMLDivElement, RuleListProps>(
	({children, onAdd, addLabel = "Add Rule", emptyMessage, className, ...props}, ref) => {
		const isEmpty = React.Children.count(children) === 0;
		return (
			<div ref={ref} className={cn("wwc:flex wwc:flex-col wwc:gap-3", className)} {...props}>
				{isEmpty && emptyMessage ? (
					<p className="wwc:py-6 wwc:text-center wwc:text-sm wwc:text-muted-foreground">{emptyMessage}</p>
				) : (
					children
				)}
				{onAdd && (
					<Button variant="outline" className="wwc:self-start" onClick={onAdd}>
						<Plus className="wwc:h-4 wwc:w-4" />
						{addLabel}
					</Button>
				)}
			</div>
		);
	},
);
RuleList.displayName = "RuleList";

export {RuleRow, RuleList};
