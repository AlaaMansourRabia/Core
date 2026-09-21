import * as SelectPrimitive from "@radix-ui/react-select";
import {cn} from "@core/core-utils";
import {Check, ChevronDown, ChevronUp, Loader2} from "lucide-react";
import * as React from "react";

import {useDialogContainer} from "./dialog";
import {useDebouncedValue} from "./use-debounced-value";

/** A dropdown list of options triggered by a button. */
const Select: React.FC<SelectPrimitive.SelectProps> = (props) => <SelectPrimitive.Root {...props} />;
Select.displayName = "Select";
const SelectGroup: typeof SelectPrimitive.Group = SelectPrimitive.Group;
const SelectValue: typeof SelectPrimitive.Value = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({className, children, ...props}, ref) => (
	<SelectPrimitive.Trigger
		ref={ref}
		className={cn(
			"wwc:flex wwc:h-9 wwc:w-full wwc:items-center wwc:justify-between wwc:whitespace-nowrap wwc:rounded-md wwc:border wwc:border-input wwc:bg-transparent wwc:px-3 wwc:py-2 wwc:text-sm wwc:shadow-sm wwc:ring-offset-background wwc:placeholder:text-muted-foreground wwc:focus:outline-none wwc:focus:ring-1 wwc:focus:ring-ring wwc:disabled:cursor-not-allowed wwc:disabled:opacity-50 wwc:[&>span]:line-clamp-1",
			className,
		)}
		{...props}
	>
		{children}
		<SelectPrimitive.Icon asChild>
			<ChevronDown className="wwc:h-4 wwc:w-4 wwc:opacity-50" />
		</SelectPrimitive.Icon>
	</SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({className, ...props}, ref) => (
	<SelectPrimitive.ScrollUpButton
		ref={ref}
		className={cn("wwc:flex wwc:cursor-default wwc:items-center wwc:justify-center wwc:py-1", className)}
		{...props}
	>
		<ChevronUp className="wwc:h-4 wwc:w-4" />
	</SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({className, ...props}, ref) => (
	<SelectPrimitive.ScrollDownButton
		ref={ref}
		className={cn("wwc:flex wwc:cursor-default wwc:items-center wwc:justify-center wwc:py-1", className)}
		{...props}
	>
		<ChevronDown className="wwc:h-4 wwc:w-4" />
	</SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

export interface SelectContentProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
	/**
	 * Where the list is portalled. Defaults to the enclosing `DialogContent` when there is one and
	 * `document.body` otherwise — see `useDialogContainer` for why a dialog needs the difference
	 * (issue #294). Pass an element to override it, or `null` to force `document.body`.
	 */
	container?: HTMLElement | null;
}

const SelectContent = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Content>, SelectContentProps>(
	({className, children, position = "popper", align = "start", container, ...props}, ref) => {
		const dialogContainer = useDialogContainer();
		// `undefined` means "not specified" and falls back to the dialog; `null` is an explicit opt-out.
		const target = container === undefined ? dialogContainer : container;
		return (
			<SelectPrimitive.Portal container={target ?? undefined}>
				<SelectPrimitive.Content
					ref={ref}
					className={cn(
						"wwc:relative wwc:z-50 wwc:max-h-96 wwc:min-w-[8rem] wwc:overflow-hidden wwc:rounded-md wwc:border wwc:bg-popover wwc:text-popover-foreground wwc:shadow-md wwc:data-[state=open]:animate-in wwc:data-[state=closed]:animate-out wwc:data-[state=closed]:fade-out-0 wwc:data-[state=open]:fade-in-0 wwc:data-[state=closed]:zoom-out-95 wwc:data-[state=open]:zoom-in-95 wwc:data-[side=bottom]:slide-in-from-top-2 wwc:data-[side=left]:slide-in-from-right-2 wwc:data-[side=right]:slide-in-from-left-2 wwc:data-[side=top]:slide-in-from-bottom-2",
						position === "popper" &&
							"wwc:data-[side=bottom]:translate-y-1 wwc:data-[side=left]:-translate-x-1 wwc:data-[side=right]:translate-x-1 wwc:data-[side=top]:-translate-y-1",
						className,
					)}
					position={position}
					align={align}
					{...props}
				>
					<SelectScrollUpButton />
					<SelectPrimitive.Viewport
						className={cn(
							"wwc:p-1",
							position === "popper" &&
								"wwc:h-[var(--radix-select-trigger-height)] wwc:w-full wwc:min-w-[var(--radix-select-trigger-width)]",
						)}
					>
						{children}
					</SelectPrimitive.Viewport>
					<SelectScrollDownButton />
				</SelectPrimitive.Content>
			</SelectPrimitive.Portal>
		);
	},
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({className, ...props}, ref) => (
	<SelectPrimitive.Label
		ref={ref}
		className={cn("wwc:px-2 wwc:py-1.5 wwc:text-sm wwc:font-semibold", className)}
		{...props}
	/>
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({className, children, ...props}, ref) => (
	<SelectPrimitive.Item
		ref={ref}
		className={cn(
			"wwc:relative wwc:flex wwc:w-full wwc:cursor-pointer wwc:select-none wwc:items-center wwc:rounded-sm wwc:py-1.5 wwc:pl-2 wwc:pr-8 wwc:text-sm wwc:outline-none wwc:focus:bg-menu-highlight wwc:focus:text-menu-highlight-foreground wwc:data-[disabled]:pointer-events-none wwc:data-[disabled]:opacity-50",
			className,
		)}
		{...props}
	>
		<span className="wwc:absolute wwc:right-2 wwc:flex wwc:h-3.5 wwc:w-3.5 wwc:items-center wwc:justify-center">
			<SelectPrimitive.ItemIndicator>
				<Check className="wwc:h-4 wwc:w-4" />
			</SelectPrimitive.ItemIndicator>
		</span>
		<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
	</SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({className, ...props}, ref) => (
	<SelectPrimitive.Separator
		ref={ref}
		className={cn("wwc:-mx-1 wwc:my-1 wwc:h-px wwc:bg-muted", className)}
		{...props}
	/>
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

// ── SearchableSelect ──────────────────────────────────────────────────────────

export interface SearchableSelectOption<TData = unknown> {
	value: string;
	label: string;
	disabled?: boolean;
	/**
	 * The record this option was derived from. Handed back as the second argument to `onValueChange`,
	 * so a caller binding a whole object (`{id, name}`) into a form gets it without re-deriving it.
	 */
	data?: TData;
}

export interface SearchableSelectProps<TData = unknown> {
	options: SearchableSelectOption<TData>[];
	value?: string;
	/** Receives the new value, and the option it came from when one is in `options`. */
	onValueChange?: (value: string, option?: SearchableSelectOption<TData>) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyMessage?: string;
	className?: string;
	disabled?: boolean;
	size?: "default" | "sm";

	// ── Async data source ───────────────────────────────────────────────────────
	// Pass `onSearch` and the select stops filtering: `options` is displayed exactly as given, so the
	// server's result set is what the user sees.

	/** Called with the debounced search term. Supplying it switches the select to async mode. */
	onSearch?: (term: string) => void;
	/** Debounce applied before `onSearch` fires. Default 300 ms; `0` fires on every keystroke. */
	searchDebounce?: number;
	/** Client-side filtering. Defaults to off in async mode, on otherwise — set it to override. */
	shouldFilter?: boolean;
	/** Renders a spinner in the list. Also gates `onLoadMore`, so paging cannot stack requests. */
	loading?: boolean;
	/** Shown in place of `emptyMessage` while `loading` and the list is empty. */
	loadingMessage?: string;
	/** Called when the list is scrolled near its end and `hasMore` is not false — fetch the next page. */
	onLoadMore?: () => void;
	/** Set false once the server has no further pages; stops `onLoadMore` firing. Default true. */
	hasMore?: boolean;
	/**
	 * The selected option, for when it is not in the current page of `options` — an async list that has
	 * been searched or paged past the selection would otherwise show nothing on the trigger.
	 */
	selectedOption?: SearchableSelectOption<TData>;
}

/** Distance in px from the bottom of the list at which the next page is requested. */
const LOAD_MORE_THRESHOLD = 48;

function SearchableSelect<TData = unknown>({
	options,
	value,
	onValueChange,
	placeholder = "Select...",
	searchPlaceholder = "Search...",
	emptyMessage = "No results found.",
	className,
	disabled = false,
	size = "default",
	onSearch,
	searchDebounce = 300,
	shouldFilter,
	loading = false,
	loadingMessage = "Loading…",
	onLoadMore,
	hasMore = true,
	selectedOption,
}: SearchableSelectProps<TData>) {
	const [open, setOpen] = React.useState(false);
	const [search, setSearch] = React.useState("");
	const isSmall = size === "sm";

	const isAsync = onSearch != null;
	const filterList = shouldFilter ?? !isAsync;

	const debouncedSearch = useDebouncedValue(search, isAsync ? searchDebounce : 0);
	const lastSearched = React.useRef<string | null>(null);
	React.useEffect(() => {
		if (!onSearch) return;
		// Skip the initial "" — the caller's first page is already loaded by whatever mounted it.
		if (lastSearched.current === null && debouncedSearch === "") {
			lastSearched.current = "";
			return;
		}
		if (lastSearched.current === debouncedSearch) return;
		lastSearched.current = debouncedSearch;
		onSearch(debouncedSearch);
	}, [debouncedSearch, onSearch]);

	// One page request per scroll to the end. Released when the caller's answer arrives — either more
	// options or a flip of `loading` — so a stalled fetch cannot be re-fired by further scrolling.
	const loadMorePending = React.useRef(false);
	React.useEffect(() => {
		loadMorePending.current = false;
	}, [options.length, loading]);

	const handleListScroll = (event: React.UIEvent<HTMLDivElement>) => {
		if (!onLoadMore || !hasMore || loading || loadMorePending.current) return;
		const el = event.currentTarget;
		if (el.scrollHeight - el.scrollTop - el.clientHeight > LOAD_MORE_THRESHOLD) return;
		loadMorePending.current = true;
		onLoadMore();
	};

	// In async mode the term is what produced the list on screen — clearing it on close would throw
	// away a page the caller paid for and refetch on reopen.
	const clearSearch = () => {
		if (!isAsync) setSearch("");
	};

	const filtered = filterList ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase())) : options;
	const selected = options.find((o) => o.value === value) ?? selectedOption;

	return (
		<div className={cn("wwc:relative", className)}>
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className={cn(
					"wwc:flex wwc:w-full wwc:items-center wwc:justify-between wwc:whitespace-nowrap wwc:rounded-md wwc:border wwc:border-input wwc:bg-transparent wwc:shadow-sm wwc:ring-offset-background wwc:focus:outline-none wwc:focus:ring-1 wwc:focus:ring-ring wwc:disabled:cursor-not-allowed wwc:disabled:opacity-50",
					isSmall ? "wwc:h-7 wwc:px-2 wwc:py-1 wwc:text-xs" : "wwc:h-9 wwc:px-3 wwc:py-2 wwc:text-sm",
					!selected && "wwc:text-muted-foreground",
				)}
				disabled={disabled}
			>
				<span className="wwc:line-clamp-1">{selected ? selected.label : placeholder}</span>
				<ChevronDown className={cn("wwc:opacity-50", isSmall ? "wwc:h-3 wwc:w-3" : "wwc:h-4 wwc:w-4")} />
			</button>
			{open && (
				<>
					<div
						className="wwc:fixed wwc:inset-0 wwc:z-40"
						onClick={() => {
							setOpen(false);
							clearSearch();
						}}
					/>
					<div className="wwc:absolute wwc:top-full wwc:left-0 wwc:z-50 wwc:mt-1 wwc:min-w-full wwc:w-max wwc:max-w-[280px] wwc:rounded-md wwc:border wwc:bg-popover wwc:text-popover-foreground wwc:shadow-md">
						<div className="wwc:p-2 wwc:border-b wwc:border-border">
							<input
								autoFocus
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder={searchPlaceholder}
								className="wwc:w-full wwc:text-sm wwc:outline-none wwc:bg-transparent wwc:placeholder:text-muted-foreground"
							/>
						</div>
						<div className="wwc:max-h-60 wwc:overflow-y-auto wwc:p-1" onScroll={handleListScroll}>
							{filtered.length === 0 ? (
								<div className="wwc:flex wwc:items-center wwc:justify-center wwc:gap-2 wwc:py-4 wwc:text-center wwc:text-sm wwc:text-muted-foreground">
									{loading && <Loader2 className="wwc:h-4 wwc:w-4 wwc:animate-spin" />}
									{loading ? loadingMessage : emptyMessage}
								</div>
							) : (
								filtered.map((option) => (
									<button
										key={option.value}
										type="button"
										disabled={option.disabled}
										onClick={() => {
											onValueChange?.(option.value, option);
											setOpen(false);
											clearSearch();
										}}
										className={cn(
											"wwc:relative wwc:flex wwc:w-full wwc:cursor-pointer wwc:select-none wwc:items-center wwc:rounded-sm wwc:py-1.5 wwc:pl-2 wwc:pr-8 wwc:text-sm wwc:outline-none wwc:transition-colors wwc:hover:bg-menu-highlight wwc:hover:text-menu-highlight-foreground",
											option.disabled && "wwc:pointer-events-none wwc:opacity-50",
										)}
									>
										{option.label}
										{value === option.value && (
											<span className="wwc:absolute wwc:right-2 wwc:flex wwc:h-3.5 wwc:w-3.5 wwc:items-center wwc:justify-center">
												<Check className="wwc:h-4 wwc:w-4" />
											</span>
										)}
									</button>
								))
							)}
							{loading && filtered.length > 0 && (
								<div className="wwc:flex wwc:items-center wwc:justify-center wwc:gap-2 wwc:py-2 wwc:text-sm wwc:text-muted-foreground">
									<Loader2 className="wwc:h-4 wwc:w-4 wwc:animate-spin" />
									{loadingMessage}
								</div>
							)}
						</div>
					</div>
				</>
			)}
		</div>
	);
}

// ── MultiSelect ──────────────────────────────────────────────────────────────

export interface MultiSelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}

export interface MultiSelectProps {
	options: MultiSelectOption[];
	value?: string[];
	onValueChange?: (value: string[]) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyMessage?: string;
	className?: string;
	disabled?: boolean;
	maxDisplay?: number;
	showTags?: boolean;
	keepPlaceholder?: boolean;
	size?: "default" | "sm";
}

function MultiSelect({
	options,
	value = [],
	onValueChange,
	placeholder = "Select...",
	searchPlaceholder = "Search...",
	emptyMessage = "No results found.",
	className,
	disabled = false,
	maxDisplay = 3,
	showTags = false,
	keepPlaceholder = false,
	size = "default",
}: MultiSelectProps) {
	const isSmall = size === "sm";
	const [open, setOpen] = React.useState(false);
	const [search, setSearch] = React.useState("");

	const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));

	const selectedOptions = options.filter((o) => value.includes(o.value));

	const toggle = (val: string) => {
		const next = value.includes(val) ? value.filter((v) => v !== val) : [...value, val];
		onValueChange?.(next);
	};

	const removeTag = (val: string) => {
		onValueChange?.(value.filter((v) => v !== val));
	};

	const displayText =
		selectedOptions.length === 0
			? placeholder
			: selectedOptions.length <= maxDisplay
				? selectedOptions.map((o) => o.label).join(", ")
				: `${selectedOptions
						.slice(0, maxDisplay)
						.map((o) => o.label)
						.join(", ")} +${selectedOptions.length - maxDisplay}`;

	return (
		<div className={cn("wwc:relative", className)}>
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className={cn(
					"wwc:flex wwc:w-full wwc:items-center wwc:rounded-md wwc:border wwc:border-input wwc:bg-transparent wwc:shadow-sm wwc:ring-offset-background wwc:focus:outline-none wwc:focus:ring-1 wwc:focus:ring-ring wwc:disabled:cursor-not-allowed wwc:disabled:opacity-50",
					isSmall ? "wwc:text-xs" : "wwc:text-sm",
					showTags && !keepPlaceholder
						? isSmall
							? "wwc:min-h-7 wwc:gap-1 wwc:flex-wrap wwc:px-2 wwc:py-1"
							: "wwc:min-h-9 wwc:gap-1 wwc:flex-wrap wwc:px-3 wwc:py-1.5"
						: isSmall
							? "wwc:h-7 wwc:justify-between wwc:whitespace-nowrap wwc:px-2 wwc:py-1"
							: "wwc:h-9 wwc:justify-between wwc:whitespace-nowrap wwc:px-3 wwc:py-2",
					(selectedOptions.length === 0 || keepPlaceholder) && "wwc:text-muted-foreground",
				)}
				disabled={disabled}
			>
				{showTags && !keepPlaceholder && selectedOptions.length > 0 ? (
					<>
						{selectedOptions.slice(0, maxDisplay).map((o) => (
							<span
								key={o.value}
								className="wwc:inline-flex wwc:items-center wwc:gap-1 wwc:rounded-md wwc:bg-secondary wwc:text-secondary-foreground wwc:px-2 wwc:py-0.5 wwc:text-xs wwc:font-medium"
							>
								{o.label}
								<span
									role="button"
									tabIndex={0}
									onClick={(e) => {
										e.stopPropagation();
										removeTag(o.value);
									}}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.stopPropagation();
											removeTag(o.value);
										}
									}}
									className="wwc:ml-0.5 wwc:hover:text-foreground wwc:cursor-pointer"
								>
									×
								</span>
							</span>
						))}
						{selectedOptions.length > maxDisplay && (
							<span className="wwc:text-xs wwc:text-muted-foreground wwc:py-0.5">
								+{selectedOptions.length - maxDisplay}
							</span>
						)}
					</>
				) : keepPlaceholder ? (
					<span className="wwc:line-clamp-1 wwc:text-left wwc:flex wwc:items-center wwc:gap-1.5">
						{placeholder}
						{selectedOptions.length > 0 && (
							<span className="wwc:inline-flex wwc:items-center wwc:justify-center wwc:h-5 wwc:min-w-5 wwc:px-1.5 wwc:rounded-full wwc:bg-primary wwc:text-primary-foreground wwc:text-[10px] wwc:font-medium">
								{selectedOptions.length}
							</span>
						)}
					</span>
				) : (
					<span className="wwc:line-clamp-1 wwc:text-left">{displayText}</span>
				)}
				<ChevronDown
					className={cn("wwc:opacity-50 wwc:shrink-0 wwc:ml-auto", isSmall ? "wwc:h-3 wwc:w-3" : "wwc:h-4 wwc:w-4")}
				/>
			</button>
			{open && (
				<>
					<div
						className="wwc:fixed wwc:inset-0 wwc:z-40"
						onClick={() => {
							setOpen(false);
							setSearch("");
						}}
					/>
					<div className="wwc:absolute wwc:top-full wwc:left-0 wwc:z-50 wwc:mt-1 wwc:min-w-full wwc:w-max wwc:max-w-[280px] wwc:rounded-md wwc:border wwc:bg-popover wwc:text-popover-foreground wwc:shadow-md">
						<div className="wwc:p-2 wwc:border-b wwc:border-border">
							<input
								autoFocus
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder={searchPlaceholder}
								className="wwc:w-full wwc:text-sm wwc:outline-none wwc:bg-transparent wwc:placeholder:text-muted-foreground"
							/>
						</div>
						<div className="wwc:max-h-60 wwc:overflow-y-auto wwc:p-1">
							{filtered.length === 0 ? (
								<div className="wwc:py-4 wwc:text-center wwc:text-sm wwc:text-muted-foreground">{emptyMessage}</div>
							) : (
								filtered.map((option) => {
									const isSelected = value.includes(option.value);
									return (
										<button
											key={option.value}
											type="button"
											disabled={option.disabled}
											onClick={() => toggle(option.value)}
											className={cn(
												"wwc:relative wwc:flex wwc:w-full wwc:cursor-pointer wwc:select-none wwc:items-center wwc:rounded-sm wwc:py-1.5 wwc:pl-2 wwc:pr-8 wwc:text-sm wwc:outline-none wwc:transition-colors wwc:hover:bg-menu-highlight wwc:hover:text-menu-highlight-foreground",
												option.disabled && "wwc:pointer-events-none wwc:opacity-50",
											)}
										>
											<div
												className={cn(
													"wwc:mr-2 wwc:flex wwc:h-4 wwc:w-4 wwc:items-center wwc:justify-center wwc:rounded-[var(--radius-control)] wwc:border wwc:border-primary",
													isSelected ? "wwc:bg-primary wwc:text-primary-foreground" : "wwc:opacity-50",
												)}
											>
												{isSelected && <Check className="wwc:h-3 wwc:w-3" />}
											</div>
											{option.label}
										</button>
									);
								})
							)}
						</div>
						{value.length > 0 && (
							<div className="wwc:border-t wwc:border-border wwc:p-1">
								<button
									type="button"
									onClick={() => onValueChange?.([])}
									className="wwc:w-full wwc:cursor-pointer wwc:rounded-sm wwc:py-1.5 wwc:text-sm wwc:text-center wwc:text-muted-foreground wwc:hover:bg-menu-highlight wwc:hover:text-menu-highlight-foreground wwc:transition-colors"
								>
									Clear all
								</button>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
}

export {
	Select,
	SelectGroup,
	SelectValue,
	SelectTrigger,
	SelectContent,
	SelectLabel,
	SelectItem,
	SelectSeparator,
	SelectScrollUpButton,
	SelectScrollDownButton,
	SearchableSelect,
	MultiSelect,
};
