import {cn} from "@corensystem/coren-utils";
import {Check, ChevronsUpDown, Loader2, Plus} from "lucide-react";
import * as React from "react";

import {Button} from "./button";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "./command";
import {Popover, PopoverContent, PopoverTrigger} from "./popover";
import {useDebouncedValue} from "./use-debounced-value";

export interface ComboboxOption<TData = unknown> {
	value: string;
	label: string;
	disabled?: boolean;
	/**
	 * Optional leading visual, rendered in the list and on the trigger once selected. Lets a caller
	 * whose options carry an identity (an object type's glyph) stay searchable without forking this
	 * component. Omitted, the option renders exactly as it always has.
	 */
	icon?: React.ReactNode;
	/**
	 * The record this option was derived from. Handed back as the second argument to `onValueChange`,
	 * so a caller binding a whole object (`{id, name}`) into a form gets it without re-deriving it from
	 * the value.
	 */
	data?: TData;
}

export interface ComboboxProps<TData = unknown> {
	options: ComboboxOption<TData>[];
	value?: string;
	/** Receives the new value, and the option it came from when one is in `options`. */
	onValueChange?: (value: string, option?: ComboboxOption<TData>) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyMessage?: string;
	className?: string;
	/** Class applied to the popover content. Overrides the default 200px width. */
	popoverClassName?: string;
	disabled?: boolean;
	/** When true, typing a value not in the list offers a "Create …" action. */
	creatable?: boolean;
	/** Called with the trimmed search text when the create action is chosen. */
	onCreateOption?: (input: string) => void;
	/** Label for the create action; defaults to `Create "<input>"`. */
	createLabel?: (input: string) => string;

	// ── Async data source ───────────────────────────────────────────────────────
	// Pass `onSearch` and the combobox stops filtering: `options` is displayed exactly as given,
	// so the server's result set is what the user sees.

	/** Called with the debounced search term. Supplying it switches the combobox to async mode. */
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
	 * been searched or paged past the selection would otherwise show the raw value on the trigger.
	 */
	selectedOption?: ComboboxOption<TData>;

	// ── Labelling ───────────────────────────────────────────────────────────────
	// Forwarded to the trigger, which is the element assistive tech actually lands on. Without these
	// a combobox inside a labelled field still announces as a bare "combobox".

	/** Id of the trigger, so a `<label htmlFor>` can point at it. */
	id?: string;
	/** Accessible name, when no visible label points at the trigger. */
	"aria-label"?: string;
	/** Id of the visible label naming this combobox. */
	"aria-labelledby"?: string;
	/** Id of the hint or error line describing this combobox. */
	"aria-describedby"?: string;
	/** Marks the trigger invalid to assistive tech. Pair it with the field's error text. */
	"aria-invalid"?: boolean;

	// ── Popover ─────────────────────────────────────────────────────────────────

	/**
	 * Controls the popover. Omit it and the combobox opens and closes itself, as before; pass it with
	 * `onOpenChange` and the caller owns the state — for a form that must keep the list open across a
	 * re-render, or a test that wants it open on mount.
	 */
	open?: boolean;
	/** Called with the popover's next open state. Pair it with `open` to control the combobox. */
	onOpenChange?: (open: boolean) => void;
	/**
	 * Makes the popover its own modal layer: it takes `pointer-events` from everything beneath and
	 * traps focus. Off by default. Inside a `Dialog` you should not need it — the popover already
	 * renders inside the dialog (see `container`) — so reach for it only for a popover that must sit
	 * above a non-Radix overlay of the host's own.
	 */
	modal?: boolean;
	/**
	 * Where the popover is portalled. Defaults to the enclosing `DialogContent` when there is one and
	 * `document.body` otherwise, which is what keeps the list clickable inside a dialog (issue #294).
	 * Pass an element to override that, or `null` to force `document.body`.
	 */
	container?: HTMLElement | null;
}

/** Distance in px from the bottom of the list at which the next page is requested. */
const LOAD_MORE_THRESHOLD = 48;

/**
 * A searchable dropdown combining a Popover, Command palette, and Button. Optionally creatable.
 *
 * Static list — filtered as you type:
 *
 * ```tsx
 * <Combobox options={trades} value={trade} onValueChange={setTrade} />
 * ```
 *
 * Server-backed list — searched and paged by the caller. `onSearch` turns client-side filtering off,
 * so whatever the server returns is shown in order:
 *
 * ```tsx
 * <Combobox
 *   options={page.items}
 *   loading={isFetching}
 *   hasMore={page.hasNextPage}
 *   onSearch={setTerm}
 *   onLoadMore={fetchNextPage}
 *   selectedOption={selected}
 *   onValueChange={(_, option) => field.onChange(option?.data)}
 * />
 * ```
 */
function Combobox<TData = unknown>({
	options,
	value,
	onValueChange,
	placeholder = "Select option...",
	searchPlaceholder = "Search...",
	emptyMessage = "No option found.",
	className,
	popoverClassName,
	disabled = false,
	creatable = false,
	onCreateOption,
	createLabel = (input) => `Create "${input}"`,
	onSearch,
	searchDebounce = 300,
	shouldFilter,
	loading = false,
	loadingMessage = "Loading…",
	onLoadMore,
	hasMore = true,
	selectedOption: selectedOptionProp,
	id,
	"aria-label": ariaLabel,
	"aria-labelledby": ariaLabelledBy,
	"aria-describedby": ariaDescribedBy,
	"aria-invalid": ariaInvalid,
	open: openProp,
	onOpenChange,
	modal,
	container,
}: ComboboxProps<TData>) {
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
	const open = openProp ?? uncontrolledOpen;
	const [query, setQuery] = React.useState("");

	const isAsync = onSearch != null;
	const filterList = shouldFilter ?? !isAsync;

	const debouncedQuery = useDebouncedValue(query, isAsync ? searchDebounce : 0);
	const lastSearched = React.useRef<string | null>(null);
	React.useEffect(() => {
		if (!onSearch) return;
		// Skip the initial "" — the caller's first page is already loaded by whatever mounted it.
		if (lastSearched.current === null && debouncedQuery === "") {
			lastSearched.current = "";
			return;
		}
		if (lastSearched.current === debouncedQuery) return;
		lastSearched.current = debouncedQuery;
		onSearch(debouncedQuery);
	}, [debouncedQuery, onSearch]);

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

	const selectedOption = options.find((option) => option.value === value) ?? selectedOptionProp;
	const trimmed = query.trim();
	const hasExactMatch = options.some((o) => o.label.toLowerCase() === trimmed.toLowerCase());
	const showCreate = creatable && trimmed.length > 0 && !hasExactMatch;

	const handleOpenChange = (next: boolean) => {
		// The internal state is kept up to date even while controlled, so a caller that drops `open`
		// later resumes from where the combobox actually was rather than snapping shut.
		setUncontrolledOpen(next);
		onOpenChange?.(next);
		// In async mode the term is what produced the list on screen — clearing it on close would
		// throw away a page the caller paid for and refetch on reopen.
		if (!next && !isAsync) setQuery("");
	};

	return (
		<Popover open={open} onOpenChange={handleOpenChange} modal={modal}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					id={id}
					aria-expanded={open}
					aria-label={ariaLabel}
					aria-labelledby={ariaLabelledBy}
					aria-describedby={ariaDescribedBy}
					aria-invalid={ariaInvalid}
					className={cn("wwc:w-[200px] wwc:justify-between", className)}
					disabled={disabled}
				>
					{selectedOption ? (
						<span className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-1.5">
							{selectedOption.icon}
							<span className="wwc:truncate">{selectedOption.label}</span>
						</span>
					) : (
						placeholder
					)}
					<ChevronsUpDown className="wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent container={container} className={cn("wwc:w-[200px] wwc:p-0", popoverClassName)}>
				<Command shouldFilter={filterList}>
					<CommandInput placeholder={searchPlaceholder} value={query} onValueChange={setQuery} />
					<CommandList onScroll={handleListScroll}>
						{!showCreate && (
							<CommandEmpty>
								{loading ? (
									<span className="wwc:flex wwc:items-center wwc:justify-center wwc:gap-2 wwc:text-muted-foreground">
										<Loader2 className="wwc:h-4 wwc:w-4 wwc:animate-spin" />
										{loadingMessage}
									</span>
								) : (
									emptyMessage
								)}
							</CommandEmpty>
						)}
						<CommandGroup>
							{options.map((option) => (
								<CommandItem
									// With filtering off the label carries no meaning to cmdk, and duplicate labels
									// from a server page would collide — key the item by its own value instead.
									key={option.value}
									value={filterList ? option.label : option.value}
									onSelect={() => {
										const next = option.value === value ? "" : option.value;
										onValueChange?.(next, next === "" ? undefined : option);
										handleOpenChange(false);
									}}
									disabled={option.disabled}
								>
									<Check
										className={cn(
											"wwc:mr-2 wwc:h-4 wwc:w-4",
											value === option.value ? "wwc:opacity-100" : "wwc:opacity-0",
										)}
									/>
									{option.icon}
									{option.label}
								</CommandItem>
							))}
							{showCreate && (
								// value carries the query so cmdk always keeps this item visible while typing.
								<CommandItem
									value={trimmed}
									onSelect={() => {
										onCreateOption?.(trimmed);
										handleOpenChange(false);
									}}
								>
									<Plus className="wwc:mr-2 wwc:h-4 wwc:w-4" />
									{createLabel(trimmed)}
								</CommandItem>
							)}
						</CommandGroup>
						{loading && options.length > 0 && (
							<div className="wwc:flex wwc:items-center wwc:justify-center wwc:gap-2 wwc:py-2 wwc:text-sm wwc:text-muted-foreground">
								<Loader2 className="wwc:h-4 wwc:w-4 wwc:animate-spin" />
								{loadingMessage}
							</div>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

export {Combobox};
