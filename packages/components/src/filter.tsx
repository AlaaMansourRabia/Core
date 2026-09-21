import {cn} from "@wakecap/core-utils";
import {Filter as FilterIcon} from "lucide-react";
import * as React from "react";

import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "./accordion";
import {Badge} from "./badge";
import {Button} from "./button";
import {Checkbox} from "./checkbox";
import {Chip} from "./chip";
import {Popover, PopoverContent, PopoverTrigger} from "./popover";
import {HoverTooltip} from "./tooltip";

/* -----------------------------------------------------------------------------
 * Filter — composite popover for staging-then-applying multi-category filters.
 *
 * Contract:
 *   - Selections are staged in a `draft` state inside the popover.
 *   - Apply commits draft → applied (and emits `onChange`).
 *   - Closing without Apply (or pressing Clear then Apply) discards the draft.
 *   - Each category renders as a single-open Accordion item: opening one
 *     auto-collapses the others.
 *   - The trigger is an icon-only button with a primary-colored corner badge
 *     showing the total applied count.
 *   - The popover body is capped at `max-h-[70vh]` and scrolls natively
 *     (NOT Radix ScrollArea — its `h-full` viewport doesn't compute under
 *     a `flex-1` parent inside a max-height popover, silently clipping
 *     content with no scrollbar).
 *
 * Usage (composite, like PushPanel / DropdownMenu):
 *
 *   <Filter value={applied} onChange={setApplied}>
 *     <FilterTrigger />
 *     <FilterContent>
 *       <FilterCategory value="crew" label="Crew">
 *         <FilterOption value="snyder">Snyder Concrete</FilterOption>
 *         <FilterOption value="nsg">NSG Electric</FilterOption>
 *       </FilterCategory>
 *       <FilterCategory value="trade" label="Trade">
 *         <FilterOption value="concrete">Concrete</FilterOption>
 *         <FilterOption value="electrical">Electrical</FilterOption>
 *       </FilterCategory>
 *     </FilterContent>
 *   </Filter>
 * -------------------------------------------------------------------------- */

/** Applied filter state — keyed by category id. */
export type FilterValue = Record<string, readonly string[]>;

interface FilterContextValue {
	open: boolean;
	setOpen: (o: boolean) => void;
	applied: FilterValue;
	draft: FilterValue;
	toggleDraft: (categoryId: string, optionValue: string) => void;
	clearDraft: () => void;
	/** Clear both draft and applied selections and commit immediately (no Apply needed). */
	clearAll: () => void;
	applyDraft: () => void;
	/** Drop one applied (category, option) selection and commit immediately — what a chip's × does. */
	removeApplied: (categoryId: string, optionValue: string) => void;
	appliedCount: number;
}

const FilterContext = React.createContext<FilterContextValue | null>(null);

function useFilter() {
	const ctx = React.useContext(FilterContext);
	if (!ctx) throw new Error("Filter components must be used within a <Filter>");
	return ctx;
}

/**
 * Filter context if there is one, otherwise null — for surfaces that render an applied-filter
 * strip when wrapped in a <Filter> but must still work standalone (e.g. DataTable).
 */
function useOptionalFilter() {
	return React.useContext(FilterContext);
}

const FilterCategoryContext = React.createContext<{categoryId: string} | null>(null);

function useFilterCategory() {
	const ctx = React.useContext(FilterCategoryContext);
	if (!ctx) throw new Error("<FilterOption> must be used within a <FilterCategory>");
	return ctx;
}

/* -----------------------------------------------------------------------------
 * Filter (root)
 * -------------------------------------------------------------------------- */

interface FilterProps {
	/** Controlled applied value. */
	value?: FilterValue;
	/** Uncontrolled initial value. */
	defaultValue?: FilterValue;
	/** Fires when Apply commits the draft. */
	onChange?: (next: FilterValue) => void;
	children: React.ReactNode;
}

function Filter({value, defaultValue, onChange, children}: FilterProps) {
	const [appliedUncontrolled, setAppliedUncontrolled] = React.useState<FilterValue>(defaultValue ?? {});
	const isControlled = value !== undefined;
	const applied = isControlled ? value : appliedUncontrolled;

	const [open, setOpenState] = React.useState(false);
	const [draft, setDraft] = React.useState<FilterValue>(applied);

	// Sync draft → applied when popover opens (so cancel works).
	const setOpen = React.useCallback(
		(next: boolean) => {
			if (next) setDraft(applied);
			setOpenState(next);
		},
		[applied],
	);

	const toggleDraft = React.useCallback((categoryId: string, optionValue: string) => {
		setDraft((prev) => {
			const set = new Set(prev[categoryId] ?? []);
			if (set.has(optionValue)) set.delete(optionValue);
			else set.add(optionValue);
			const next = {...prev, [categoryId]: Array.from(set)};
			// Clean empty arrays so appliedCount stays accurate.
			if (next[categoryId].length === 0) delete next[categoryId];
			return next;
		});
	}, []);

	const clearDraft = React.useCallback(() => setDraft({}), []);

	const applyDraft = React.useCallback(() => {
		if (!isControlled) setAppliedUncontrolled(draft);
		onChange?.(draft);
		setOpenState(false);
	}, [draft, isControlled, onChange]);

	// Clears draft + applied and commits immediately — no Apply click needed.
	const clearAll = React.useCallback(() => {
		setDraft({});
		if (!isControlled) setAppliedUncontrolled({});
		onChange?.({});
	}, [isControlled, onChange]);

	// Removing one applied selection commits straight away — chips have no Apply step.
	const removeApplied = React.useCallback(
		(categoryId: string, optionValue: string) => {
			const next: FilterValue = {...applied};
			const remaining = (next[categoryId] ?? []).filter((value) => value !== optionValue);
			if (remaining.length === 0) delete next[categoryId];
			else next[categoryId] = remaining;
			setDraft(next);
			if (!isControlled) setAppliedUncontrolled(next);
			onChange?.(next);
		},
		[applied, isControlled, onChange],
	);

	const appliedCount = React.useMemo(() => Object.values(applied).reduce((sum, arr) => sum + arr.length, 0), [applied]);

	const ctx = React.useMemo<FilterContextValue>(
		() => ({
			open,
			setOpen,
			applied,
			draft,
			toggleDraft,
			clearDraft,
			clearAll,
			applyDraft,
			removeApplied,
			appliedCount,
		}),
		[open, setOpen, applied, draft, toggleDraft, clearDraft, clearAll, applyDraft, removeApplied, appliedCount],
	);

	return (
		<FilterContext.Provider value={ctx}>
			<Popover open={open} onOpenChange={setOpen}>
				{children}
			</Popover>
		</FilterContext.Provider>
	);
}

/* -----------------------------------------------------------------------------
 * FilterTrigger — icon-only button with applied-count badge in the corner.
 * -------------------------------------------------------------------------- */

interface FilterTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	/** Override the default Filter icon. */
	icon?: React.ReactNode;
	/** Override the aria-label (defaults to "Filter" / "Filter (N active)"). */
	"aria-label"?: string;
	/** Hover/focus hint. Defaults to the aria-label; pass `null` to suppress it. */
	tooltip?: React.ReactNode;
}

const FilterTrigger = React.forwardRef<HTMLButtonElement, FilterTriggerProps>(
	({className, icon, "aria-label": ariaLabel, tooltip, ...props}, ref) => {
		const {appliedCount} = useFilter();
		const label = ariaLabel ?? (appliedCount > 0 ? `Filter (${appliedCount} active)` : "Filter");
		const hint = tooltip === undefined ? label : tooltip;
		const trigger = (
			<PopoverTrigger asChild>
				<Button
					ref={ref}
					variant="outline"
					icon
					aria-label={label}
					className={cn("wwc:relative", className)}
					{...props}
				>
					{icon ?? <FilterIcon className="wwc:h-4 wwc:w-4" />}
					{appliedCount > 0 && (
						<span
							aria-hidden
							className="wwc:absolute wwc:-top-1 wwc:-right-1 wwc:min-w-4 wwc:h-4 wwc:px-1 wwc:rounded-full wwc:bg-primary wwc:text-primary-foreground wwc:text-[10px] wwc:font-medium wwc:flex wwc:items-center wwc:justify-center"
						>
							{appliedCount}
						</span>
					)}
				</Button>
			</PopoverTrigger>
		);

		if (hint === null) return trigger;

		// The Tooltip wraps the PopoverTrigger (not the Button) so the popover keeps its props.
		return <HoverTooltip content={hint}>{trigger}</HoverTooltip>;
	},
);
FilterTrigger.displayName = "FilterTrigger";

/* -----------------------------------------------------------------------------
 * FilterContent — sticky header + scrollable accordion body + sticky footer.
 *
 * Default footer = Clear / Apply. Pass `footer={...}` to override.
 * -------------------------------------------------------------------------- */

interface FilterContentProps extends Omit<React.ComponentPropsWithoutRef<typeof PopoverContent>, "title"> {
	/** Header heading (sticky). Default: "Filter". */
	heading?: React.ReactNode;
	/** Override footer. Default = Clear + Apply buttons wired to context. */
	footer?: React.ReactNode;
	/** Which category is open by default. If omitted, the first FilterCategory
	 *  child's `value` is used. Pass `null` to start with all collapsed. */
	defaultOpenCategory?: string | null;
	children: React.ReactNode;
}

const FilterContent = React.forwardRef<HTMLDivElement, FilterContentProps>(
	({className, heading = "Filter", footer, defaultOpenCategory, align = "end", children, ...props}, ref) => {
		const {clearAll, applyDraft} = useFilter();

		// Default-open the first FilterCategory child unless explicitly overridden.
		const resolvedDefaultOpen = React.useMemo<string | undefined>(() => {
			if (defaultOpenCategory === null) return undefined;
			if (typeof defaultOpenCategory === "string") return defaultOpenCategory;
			const first = React.Children.toArray(children).find(
				(c): c is React.ReactElement<{value: string}> =>
					React.isValidElement(c) && typeof (c.props as {value?: unknown}).value === "string",
			);
			return first?.props.value;
		}, [children, defaultOpenCategory]);

		return (
			<PopoverContent
				ref={ref}
				align={align}
				className={cn("wwc:w-72 wwc:p-0 wwc:flex wwc:flex-col wwc:max-h-[70vh]", className)}
				{...props}
			>
				{/* Sticky header */}
				<div className="wwc:px-3 wwc:py-2.5 wwc:border-b wwc:shrink-0">
					<p className="wwc:text-[13px] wwc:font-semibold">{heading}</p>
				</div>
				{/* Scrollable body — native overflow-y-auto, NOT Radix ScrollArea
				    (Viewport `h-full` doesn't compute under flex-1 + max-h). */}
				<div className="wwc:flex-1 wwc:min-h-0 wwc:overflow-y-auto">
					<Accordion type="single" collapsible defaultValue={resolvedDefaultOpen} className="wwc:px-3">
						{children}
					</Accordion>
				</div>
				{/* Sticky footer */}
				<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2 wwc:px-3 wwc:py-2.5 wwc:border-t wwc:shrink-0">
					{footer ?? (
						<>
							<Button variant="ghost" size="sm" className="wwc:h-8" onClick={clearAll}>
								Clear
							</Button>
							<Button size="sm" className="wwc:h-8" onClick={applyDraft}>
								Apply
							</Button>
						</>
					)}
				</div>
			</PopoverContent>
		);
	},
);
FilterContent.displayName = "FilterContent";

/* -----------------------------------------------------------------------------
 * FilterCategory — Accordion item; trigger shows label + draft selection count.
 * -------------------------------------------------------------------------- */

interface FilterCategoryProps {
	/** Category id — also used as the AccordionItem value and as the key into
	 *  `FilterValue` for selections in this category. */
	value: string;
	label: React.ReactNode;
	children: React.ReactNode;
	/** Hide the count badge in the trigger. */
	hideCount?: boolean;
	/**
	 * Options to show before the list starts scrolling in place. Long lists (trades, companies)
	 * would otherwise push Apply/Clear out of reach. Pass `false` to let the category grow.
	 */
	maxVisibleOptions?: number | false;
}

function FilterCategory({value, label, children, hideCount, maxVisibleOptions = 8}: FilterCategoryProps) {
	const {draft} = useFilter();
	const count = draft[value]?.length ?? 0;
	const categoryCtx = React.useMemo(() => ({categoryId: value}), [value]);

	// One option row is ~28px + 4px gap; cap the list once it outgrows the budget so the
	// popover's Apply/Clear footer stays put and the overflow scrolls in place.
	const scrolls = maxVisibleOptions !== false && React.Children.count(children) > maxVisibleOptions;
	const maxHeight = scrolls ? maxVisibleOptions * 32 : undefined;

	return (
		<AccordionItem value={value} className="wwc:last:border-b-0">
			<AccordionTrigger className="wwc:py-2.5 wwc:text-[12px] wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground wwc:hover:no-underline">
				<span className="wwc:flex wwc:items-center wwc:gap-2">
					{label}
					{!hideCount && count > 0 && (
						<Badge variant="secondary" className="wwc:text-[10px] wwc:px-1.5 wwc:py-0 wwc:h-4 wwc:normal-case">
							{count}
						</Badge>
					)}
				</span>
			</AccordionTrigger>
			<AccordionContent className="wwc:pb-3 wwc:pt-0">
				<FilterCategoryContext.Provider value={categoryCtx}>
					<div
						className={cn("wwc:space-y-1", scrolls && "wwc:overflow-y-auto wwc:pr-1")}
						style={maxHeight === undefined ? undefined : {maxHeight}}
					>
						{children}
					</div>
				</FilterCategoryContext.Provider>
			</AccordionContent>
		</AccordionItem>
	);
}

/* -----------------------------------------------------------------------------
 * FilterOption — checkbox row; reads/writes draft for the parent FilterCategory.
 * -------------------------------------------------------------------------- */

interface FilterOptionProps {
	value: string;
	children: React.ReactNode;
	disabled?: boolean;
}

function FilterOption({value, children, disabled}: FilterOptionProps) {
	const {draft, toggleDraft} = useFilter();
	const {categoryId} = useFilterCategory();
	const id = `filter-${categoryId}-${value}`;
	const checked = draft[categoryId]?.includes(value) ?? false;

	return (
		<label
			htmlFor={id}
			className={cn(
				"wwc:flex wwc:items-center wwc:gap-2 wwc:py-1 wwc:cursor-pointer",
				disabled && "wwc:cursor-not-allowed wwc:opacity-50",
			)}
		>
			<Checkbox
				id={id}
				checked={checked}
				disabled={disabled}
				onCheckedChange={() => !disabled && toggleDraft(categoryId, value)}
			/>
			<span className="wwc:text-[13px]">{children}</span>
		</label>
	);
}

/* -----------------------------------------------------------------------------
 * FilterChips — the applied-filters strip
 *
 * Renders each applied (category, value) as a removable attachment Chip. Drop it below a filter toolbar
 * (e.g. a DataTable's `filterStrip`) so the user can see and clear active filters one by one.
 * -------------------------------------------------------------------------- */

interface FilterChipsProps {
	/** The applied filter value (same shape emitted by <Filter> onChange). */
	value: FilterValue;
	/** Remove a single (category, option) selection. */
	onRemove: (categoryId: string, optionValue: string) => void;
	/** When provided and more than one chip is shown, renders a "Clear all" affordance. */
	onClear?: () => void;
	/** Resolve a friendly label for a (categoryId, optionValue). Defaults to the raw option value. */
	renderLabel?: (categoryId: string, optionValue: string) => React.ReactNode;
	className?: string;
}

/** A wrap of removable chips for the currently-applied filter selections. Renders nothing when empty. */
function FilterChips({value, onRemove, onClear, renderLabel, className}: FilterChipsProps) {
	const entries = Object.entries(value).flatMap(([categoryId, values]) =>
		(values ?? []).map((optionValue) => [categoryId, optionValue] as const),
	);
	if (entries.length === 0) return null;
	return (
		<div className={cn("wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2", className)}>
			{entries.map(([categoryId, optionValue]) => (
				<Chip
					key={`${categoryId}:${optionValue}`}
					variant="attachment"
					size="sm"
					onRemove={() => onRemove(categoryId, optionValue)}
					removeLabel={`Remove ${optionValue}`}
				>
					{renderLabel ? renderLabel(categoryId, optionValue) : optionValue}
				</Chip>
			))}
			{onClear && (
				<Button variant="ghost" size="sm" className="wwc:h-6 wwc:px-2 wwc:text-xs" onClick={onClear}>
					Clear all
				</Button>
			)}
		</div>
	);
}

export {Filter, FilterTrigger, FilterContent, FilterCategory, FilterOption, FilterChips, useFilter, useOptionalFilter};
