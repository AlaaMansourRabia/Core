import {cn} from "@corensystem/core-utils";
import {
	type ColumnDef,
	type ColumnFiltersState,
	type ColumnOrderState,
	type ExpandedState,
	type PaginationState,
	type Row,
	type SortingState,
	type VisibilityState,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {ArrowUpDown, ChevronDown, ChevronRight, ChevronsUpDown, GripVertical, MoreHorizontal, X} from "lucide-react";
import * as React from "react";

import {Button} from "./button";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "./collapsible";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./dropdown-menu";
import {FilterChips, useOptionalFilter} from "./filter";
import {Input} from "./input";
import {Popover, PopoverContent, PopoverTrigger} from "./popover";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./select";
import {Skeleton} from "./skeleton";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "./table";

// ============================================================================
// Types
// ============================================================================

export interface BulkAction {
	label: string;
	icon?: React.ReactNode;
	onClick: (selectedIds: string[]) => void;
	variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
}

/**
 * Per-column style overrides, set via a column's `meta`. Body cells truncate at `max-w-0` by default so
 * long text ellipsizes.
 *
 * A column whose `id` is `"actions"` needs NOTHING here — the table already gives it
 * `w-px max-w-none overflow-visible text-clip whitespace-nowrap`, which sizes it to its content and
 * makes a stray ellipsis impossible. Reach for `cellClassName` for any OTHER column that holds a
 * control rather than text, or to override part of what the actions column gets.
 */
export interface DataTableColumnMeta {
	cellClassName?: string;
	headerClassName?: string;
}

export interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	searchKey?: string;
	searchPlaceholder?: string;
	showColumnToggle?: boolean;
	showPagination?: boolean;
	showSelectedCount?: boolean;
	pageSize?: number;
	/** Options for the "rows per page" selector shown next to the pager. Set to `false` to hide it. */
	pageSizeOptions?: number[] | false;
	/** Label for a single record in the total-records count (default "record"). Pluralized with an "s". */
	recordLabel?: string;
	/**
	 * Plural form, when adding "s" is wrong ("property" -> "properties", not "propertys").
	 * Defaults to `recordLabel + "s"`.
	 */
	recordLabelPlural?: string;
	/**
	 * Makes the whole row the link to its primary record. Return the href for a row and it becomes
	 * navigable by pointer, by Enter, and by every native link affordance a real anchor has —
	 * middle-click, ⌘-click, "copy link address". Prefer this over `onRowActivate` whenever the
	 * destination is addressable; a row that is really a link should be one.
	 */
	getRowHref?: (row: Row<TData>) => string | undefined;
	/**
	 * Application-owned row activation, for destinations that are not addressable (opening a drawer,
	 * selecting into a split view). Fires on click and on Enter/Space. Ignored for a row that already
	 * has an href.
	 */
	onRowActivate?: (row: Row<TData>) => void;
	/**
	 * Accessible name for an activatable row. Without it the row announces its full text content,
	 * which for a wide table is a mouthful; return something like `` `Open ${row.original.name}` ``.
	 */
	getRowAriaLabel?: (row: Row<TData>) => string;
	/**
	 * Extra classes for one row, by row. For a table whose selection is the APPLICATION's, not the
	 * checkbox model's — a row the surface is showing in a side panel, say — so it can mark that row
	 * without adopting `enableRowSelection` and the bulk-action bar that comes with it.
	 */
	getRowClassName?: (row: Row<TData>) => string | undefined;
	// Expandable row support
	getRowCanExpand?: (row: Row<TData>) => boolean;
	renderSubComponent?: (props: {row: Row<TData>}) => React.ReactNode;
	// Nested/tree data support
	getSubRows?: (row: TData) => TData[] | undefined;
	expandAllByDefault?: boolean;
	// Toolbar extensions
	toolbarExtra?: React.ReactNode;
	/**
	 * Drop the toolbar's top padding. For a table that sits directly inside a surface which already
	 * provides its own top gutter, the default `py-4` stacks on top of it and the table starts lower
	 * than its sibling panels. Off by default, so every existing table keeps its spacing.
	 */
	flushToolbar?: boolean;
	filterStrip?: React.ReactNode;
	/**
	 * Friendly label for an applied-filter chip. Chips appear under the toolbar automatically
	 * when the table is wrapped in a `<Filter>`; without this they show the raw option value.
	 */
	filterChipLabel?: (categoryId: string, optionValue: string) => React.ReactNode;
	// Bulk actions
	bulkActions?: BulkAction[];
	/**
	 * Stable row id. Without this TanStack falls back to the row index, so selection keys collide
	 * across server-fetched pages — set it whenever `manualPagination` is on.
	 */
	getRowId?: (row: TData, index: number) => string;

	// ── Server-driven (manual) mode ─────────────────────────────────────────
	// All optional. Omitting them keeps the default client-side behavior.
	/** Data is already paged by the server; page count comes from `rowCount`, not `data.length`. */
	manualPagination?: boolean;
	/** Total rows across all pages. Drives the count label and the page count in manual mode. */
	rowCount?: number;
	/** Controlled pagination state. */
	pagination?: PaginationState;
	onPaginationChange?: (next: PaginationState) => void;
	/** Data is already sorted by the server; sort toggles are routed out via `onSortingChange`. */
	manualSorting?: boolean;
	/** Controlled sorting state. */
	sorting?: SortingState;
	onSortingChange?: (next: SortingState) => void;
	/** Controlled server search. Replaces the in-memory `searchKey` column filter when provided. */
	search?: string;
	onSearchChange?: (next: string) => void;
	/** Render skeleton rows instead of data while a page is in flight. */
	isLoading?: boolean;
	/** Message shown when there are no rows. Defaults to "No results.". */
	emptyMessage?: React.ReactNode;

	// ── Alternate body rendering ────────────────────────────────────────────
	/**
	 * Replaces the bordered table block with a caller-supplied rendering of the SAME rows. The toolbar
	 * (search + toolbarExtra + column toggle), the applied-filter chips, the record count and the pager
	 * are all still rendered and still driven by this table's state — so a table⇄card toggle keeps its
	 * query, filters, sort and page index. Rows are already filtered, sorted and paginated.
	 *
	 * In grid mode the table skips its own `isLoading` skeleton and its own `emptyMessage`; the callback
	 * owns both. Off by default; every existing table is untouched.
	 */
	renderGrid?: (rows: Row<TData>[]) => React.ReactNode;
	/**
	 * Seeds column visibility so a column can ship hidden until asked for. UNCONTROLLED after mount —
	 * changing the prop later does nothing, because the toggle owns the state from then on.
	 */
	initialColumnVisibility?: VisibilityState;
}

// ============================================================================
// Main DataTable Component
// ============================================================================

/** Feature-rich data table built on TanStack Table with sorting, filtering, and pagination. */
function DataTable<TData, TValue>({
	columns,
	data,
	searchKey,
	searchPlaceholder = "Filter...",
	showColumnToggle = true,
	showPagination = true,
	showSelectedCount = true,
	pageSize = 10,
	pageSizeOptions = [10, 20, 30, 50, 100],
	recordLabel = "record",
	recordLabelPlural,
	getRowHref,
	onRowActivate,
	getRowAriaLabel,
	getRowClassName,
	getRowCanExpand,
	renderSubComponent,
	getSubRows,
	expandAllByDefault = false,
	toolbarExtra,
	flushToolbar = false,
	filterStrip,
	filterChipLabel,
	bulkActions,
	getRowId,
	manualPagination = false,
	rowCount,
	pagination: paginationProp,
	onPaginationChange,
	manualSorting = false,
	sorting: sortingProp,
	onSortingChange,
	search,
	onSearchChange,
	isLoading = false,
	emptyMessage = "No results.",
	renderGrid,
	initialColumnVisibility,
}: DataTableProps<TData, TValue>) {
	// Present only when a <Filter> wraps this table; drives the applied-filter chip strip.
	const filterCtx = useOptionalFilter();
	/** The hidden anchor per row, so a click anywhere on an href row delegates to a real link. */
	const rowLinkRef = React.useRef<Record<string, HTMLAnchorElement | null>>({});
	const [internalSorting, setInternalSorting] = React.useState<SortingState>([]);
	const [internalPagination, setInternalPagination] = React.useState<PaginationState>({pageIndex: 0, pageSize});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialColumnVisibility ?? {});
	const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>([]);
	const [rowSelection, setRowSelection] = React.useState({});
	const [expanded, setExpanded] = React.useState<ExpandedState>(expandAllByDefault ? true : {});
	const [draggedCol, setDraggedCol] = React.useState<string | null>(null);

	// Controlled when the caller passes state, internal otherwise — so client-side tables keep working untouched.
	const sorting = sortingProp ?? internalSorting;
	const pagination = paginationProp ?? internalPagination;
	// A controlled `search` value drives the server; it bypasses the in-memory column filter entirely.
	const manualFiltering = search !== undefined;

	const table = useReactTable({
		data,
		columns,
		onSortingChange: (updater) => {
			const next = typeof updater === "function" ? updater(sorting) : updater;
			setInternalSorting(next);
			onSortingChange?.(next);
		},
		onPaginationChange: (updater) => {
			const next = typeof updater === "function" ? updater(pagination) : updater;
			setInternalPagination(next);
			onPaginationChange?.(next);
		},
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		// The row models stay installed in manual mode — TanStack short-circuits each one when its
		// `manual*` flag is set, so the server's already-paged/sorted page is passed through as-is.
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onColumnOrderChange: setColumnOrder,
		onRowSelectionChange: setRowSelection,
		onExpandedChange: setExpanded,
		getRowCanExpand,
		getSubRows,
		getRowId,
		manualPagination,
		manualSorting,
		manualFiltering,
		...(manualPagination && rowCount !== undefined
			? {rowCount, pageCount: Math.max(Math.ceil(rowCount / Math.max(pagination.pageSize, 1)), 1)}
			: {}),
		state: {
			sorting,
			pagination,
			columnFilters,
			columnVisibility,
			columnOrder,
			rowSelection,
			expanded,
		},
	});

	return (
		<div className="wwc:w-full">
			{/* Toolbar */}
			{(searchKey || onSearchChange || showColumnToggle) && (
				<div className={cn("wwc:flex wwc:items-center wwc:py-4", flushToolbar && "wwc:pt-0")}>
					{(searchKey || onSearchChange) &&
						(onSearchChange ? (
							<Input
								placeholder={searchPlaceholder}
								value={search ?? ""}
								onChange={(event) => onSearchChange(event.target.value)}
								className="wwc:max-w-sm"
							/>
						) : (
							<Input
								placeholder={searchPlaceholder}
								value={(table.getColumn(searchKey as string)?.getFilterValue() as string) ?? ""}
								onChange={(event) => table.getColumn(searchKey as string)?.setFilterValue(event.target.value)}
								className="wwc:max-w-sm"
							/>
						))}
					<div className="wwc:ml-auto wwc:flex wwc:items-center wwc:gap-2">
						{toolbarExtra}
						{showColumnToggle && (
							<Popover>
								<PopoverTrigger asChild>
									<Button variant="outline">
										Columns <ChevronDown className="wwc:h-4 wwc:w-4" />
									</Button>
								</PopoverTrigger>
								<PopoverContent align="end" className="wwc:w-56 wwc:p-0">
									<div className="wwc:px-3 wwc:py-2 wwc:border-b wwc:border-border">
										<p className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">
											Drag to reorder, toggle to show/hide
										</p>
									</div>
									<div className="wwc:p-1">
										{table
											.getAllLeafColumns()
											.filter((column) => column.getCanHide())
											.map((column) => (
												<div
													key={column.id}
													draggable
													onDragStart={() => setDraggedCol(column.id)}
													onDragOver={(e) => e.preventDefault()}
													onDrop={() => {
														if (draggedCol && draggedCol !== column.id) {
															const currentOrder = table.getAllLeafColumns().map((c) => c.id);
															const fromIdx = currentOrder.indexOf(draggedCol);
															const toIdx = currentOrder.indexOf(column.id);
															const newOrder = [...currentOrder];
															newOrder.splice(fromIdx, 1);
															newOrder.splice(toIdx, 0, draggedCol);
															setColumnOrder(newOrder);
														}
														setDraggedCol(null);
													}}
													onDragEnd={() => setDraggedCol(null)}
													className={cn(
														"wwc:flex wwc:items-center wwc:gap-2 wwc:rounded-md wwc:px-2 wwc:py-1.5 wwc:text-sm wwc:cursor-grab wwc:active:cursor-grabbing wwc:transition-colors",
														draggedCol === column.id ? "wwc:bg-accent" : "wwc:hover:bg-accent/50",
													)}
												>
													<GripVertical className="wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground wwc:shrink-0" />
													<span className="wwc:flex-1 wwc:capitalize wwc:truncate">{column.id}</span>
													<button
														type="button"
														onClick={() => column.toggleVisibility(!column.getIsVisible())}
														className={cn(
															"wwc:h-4 wwc:w-4 wwc:rounded wwc:border wwc:shrink-0 wwc:flex wwc:items-center wwc:justify-center wwc:transition-colors",
															column.getIsVisible()
																? "wwc:bg-primary wwc:border-primary wwc:text-primary-foreground"
																: "wwc:border-input",
														)}
													>
														{column.getIsVisible() && (
															<svg className="wwc:h-3 wwc:w-3" viewBox="0 0 12 12" fill="none">
																<path
																	d="M2.5 6L5 8.5L9.5 3.5"
																	stroke="currentColor"
																	strokeWidth="1.5"
																	strokeLinecap="round"
																	strokeLinejoin="round"
																/>
															</svg>
														)}
													</button>
												</div>
											))}
									</div>
								</PopoverContent>
							</Popover>
						)}
					</div>
				</div>
			)}

			{/* Applied-filter chips — automatic whenever the table is wrapped in a <Filter>. */}
			{filterCtx && filterCtx.appliedCount > 0 && (
				<FilterChips
					className="wwc:pb-4"
					value={filterCtx.applied}
					onRemove={filterCtx.removeApplied}
					onClear={filterCtx.appliedCount > 1 ? filterCtx.clearAll : undefined}
					renderLabel={filterChipLabel}
				/>
			)}

			{/* Filter strip */}
			{filterStrip && <div className="wwc:pb-4">{filterStrip}</div>}

			{/* Table — or, when `renderGrid` is supplied, the caller's rendering of the same rows. */}
			{renderGrid ? (
				renderGrid(table.getRowModel().rows)
			) : (
				<div className="wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:text-card-foreground wwc:shadow-(--shadow-surface)">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header, headerIdx) => {
										const isFixed = header.id === "select" || header.id === "actions";
										const isLast = headerIdx === headerGroup.headers.length - 1;
										return (
											<TableHead
												key={header.id}
												className={cn(
													"wwc:relative",
													!isFixed && "wwc:group",
													(header.column.columnDef.meta as DataTableColumnMeta | undefined)?.headerClassName,
												)}
												style={isFixed ? {width: header.id === "select" ? 40 : 50} : undefined}
											>
												{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
												{!isFixed && !isLast && (
													<div
														onMouseDown={(e) => {
															e.preventDefault();
															const th = (e.target as HTMLElement).parentElement;
															if (!th) return;
															const nextTh = th.nextElementSibling as HTMLElement | null;
															const startX = e.clientX;
															const startW = th.offsetWidth;
															const nextStartW = nextTh?.offsetWidth ?? 0;
															const onMove = (ev: MouseEvent) => {
																const delta = ev.clientX - startX;
																const newW = Math.max(50, startW + delta);
																const actualDelta = newW - startW;
																th.style.width = `${newW}px`;
																if (nextTh && nextStartW - actualDelta >= 50) {
																	nextTh.style.width = `${nextStartW - actualDelta}px`;
																}
															};
															const onUp = () => {
																document.removeEventListener("mousemove", onMove);
																document.removeEventListener("mouseup", onUp);
																document.body.style.cursor = "";
																document.body.style.userSelect = "";
															};
															document.body.style.cursor = "col-resize";
															document.body.style.userSelect = "none";
															document.addEventListener("mousemove", onMove);
															document.addEventListener("mouseup", onUp);
														}}
														className="wwc:absolute wwc:right-0 wwc:top-0 wwc:h-full wwc:w-1.5 wwc:cursor-col-resize wwc:select-none wwc:touch-none wwc:opacity-0 wwc:group-hover:opacity-100 wwc:bg-border wwc:hover:bg-primary wwc:transition-opacity"
													/>
												)}
											</TableHead>
										);
									})}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{isLoading ? (
								Array.from({length: Math.max(pagination.pageSize, 1)}, (_, i) => (
									<TableRow key={`skeleton-${i}`}>
										{table.getVisibleLeafColumns().map((column) => (
											<TableCell key={column.id}>
												<Skeleton className="wwc:h-5 wwc:w-full" />
											</TableCell>
										))}
									</TableRow>
								))
							) : table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => {
									const href = getRowHref?.(row);
									const activatable = Boolean(href || onRowActivate);
									/**
									 * A row is a container of controls, so "activate the row" must not fire when the
									 * click was really meant for something inside it — a checkbox, an action menu, the
									 * expand toggle, a link in a cell. Anything interactive claims its own click.
									 */
									const isNestedControl = (target: EventTarget | null) =>
										target instanceof Element &&
										Boolean(
											target.closest(
												'a,button,input,select,textarea,label,[role="checkbox"],[role="menuitem"],[role="button"]',
											),
										);
									const activate = (event: React.MouseEvent | React.KeyboardEvent) => {
										if (isNestedControl(event.target)) return;
										if (href) {
											// Let the browser own real link behaviour — modifier-clicks, middle-click,
											// "open in new tab" — instead of reimplementing it with a router push.
											if ("button" in event && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey))
												return;
											rowLinkRef.current[row.id]?.click();
											return;
										}
										onRowActivate?.(row);
									};
									return (
										<React.Fragment key={row.id}>
											<TableRow
												data-state={row.getIsSelected() && "selected"}
												{...(activatable
													? {
															role: "link" as const,
															tabIndex: 0,
															"aria-label": getRowAriaLabel?.(row),
															onClick: activate,
															onKeyDown: (event: React.KeyboardEvent) => {
																if (event.key !== "Enter" && event.key !== " ") return;
																if (isNestedControl(event.target)) return;
																event.preventDefault(); // Space would scroll the page
																activate(event);
															},
														}
													: {})}
												className={cn(
													row.depth > 0 && "wwc:bg-muted/30",
													row.getIsExpanded() && "wwc:border-b-0",
													activatable &&
														"wwc:cursor-pointer wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring wwc:focus-visible:ring-inset",
													getRowClassName?.(row),
												)}
											>
												{row.getVisibleCells().map((cell, cellIdx) => (
													<TableCell
														key={cell.id}
														className={cn(
															// The ACTIONS column never truncates, and it does not wait to be told.
															//
															// Body cells default to `truncate` at `max-w-0` so long text ellipsizes, which is
															// right for text and wrong for a column of buttons: the "…" there does not mean
															// "this label is longer than the column", it means the column got squeezed and a
															// control is now half-drawn behind an ellipsis. Twenty-two tables in this repo
															// name that column `actions`, and every one of them wants the same four rules, so
															// they are applied here instead of copied into twenty-two `cellClassName` strings
															// and forgotten in the twenty-third.
															//
															// text-clip is the one that answers "no dots, ever" — w-px + max-w-none let the
															// column take its content width before any other column is squeezed, and
															// overflow-visible keeps a control that still does not fit drawn rather than
															// sliced. cellClassName comes after, so a table can still override any of it.
															cell.column.id === "actions" &&
																"wwc:w-px wwc:max-w-none wwc:overflow-visible wwc:text-clip wwc:whitespace-nowrap",
															(cell.column.columnDef.meta as DataTableColumnMeta | undefined)?.cellClassName,
														)}
													>
														{/* The real anchor lives in the first cell, visually hidden. It is what the row
													    click delegates to, so href rows keep native link semantics and the browser's
													    own context menu rather than a synthetic navigation. */}
														{href && cellIdx === 0 && (
															<a
																ref={(node) => {
																	rowLinkRef.current[row.id] = node;
																}}
																href={href}
																tabIndex={-1}
																aria-hidden
																className="wwc:sr-only"
															>
																{getRowAriaLabel?.(row) ?? "Open"}
															</a>
														)}
														{flexRender(cell.column.columnDef.cell, cell.getContext())}
													</TableCell>
												))}
											</TableRow>
											{/* Render sub-component for expanded rows */}
											{renderSubComponent && row.getIsExpanded() && (
												<TableRow>
													<TableCell colSpan={row.getVisibleCells().length} className="wwc:p-0">
														<div className="wwc:bg-muted/20 wwc:border-t">{renderSubComponent({row})}</div>
													</TableCell>
												</TableRow>
											)}
										</React.Fragment>
									);
								})
							) : (
								<TableRow>
									{/* Visible leaf columns, not the raw `columns` prop — the toggle can hide some. */}
									<TableCell colSpan={table.getVisibleLeafColumns().length} className="wwc:h-24 wwc:text-center">
										{emptyMessage}
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			)}

			{/* Footer */}
			{(showSelectedCount || showPagination) && (
				<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:justify-between wwc:gap-x-6 wwc:gap-y-3 wwc:py-4">
					{/* Total records (+ selected count) */}
					<div className="wwc:text-sm wwc:text-muted-foreground">
						{(() => {
							const total = rowCount ?? table.getFilteredRowModel().rows.length;
							const selected = table.getFilteredSelectedRowModel().rows.length;
							const totalText = `${total.toLocaleString()} ${
								total === 1 ? recordLabel : (recordLabelPlural ?? `${recordLabel}s`)
							}`;
							return showSelectedCount && selected > 0
								? `${selected.toLocaleString()} of ${totalText} selected`
								: totalText;
						})()}
					</div>

					{showPagination && (
						<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-x-6 wwc:gap-y-3">
							{/* Rows per page */}
							{pageSizeOptions && pageSizeOptions.length > 0 && (
								<div className="wwc:flex wwc:items-center wwc:gap-2">
									<span className="wwc:whitespace-nowrap wwc:text-sm wwc:text-muted-foreground">Rows per page</span>
									<Select
										value={String(table.getState().pagination.pageSize)}
										onValueChange={(v) => table.setPageSize(Number(v))}
									>
										<SelectTrigger aria-label="Rows per page" className="wwc:h-8 wwc:w-[72px]">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{pageSizeOptions.map((n) => (
												<SelectItem key={n} value={String(n)}>
													{n}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}
							{/* Page indicator */}
							<span className="wwc:whitespace-nowrap wwc:text-sm wwc:text-muted-foreground">
								Page {table.getState().pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
							</span>
							{/* Pager */}
							<div className="wwc:space-x-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => table.previousPage()}
									disabled={!table.getCanPreviousPage()}
								>
									Previous
								</Button>
								<Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
									Next
								</Button>
							</div>
						</div>
					)}
				</div>
			)}
			{/* Bulk Actions Floating Bar — sticky at the bottom of the scroll area, horizontally centered on the
			    TABLE (not the whole viewport) via a full-width wrapper that centers the pill. */}
			{bulkActions && bulkActions.length > 0 && table.getFilteredSelectedRowModel().rows.length > 0 && (
				<div className="wwc:pointer-events-none wwc:sticky wwc:bottom-6 wwc:z-50 wwc:mt-4 wwc:flex wwc:justify-center">
					<div className="wwc:pointer-events-auto wwc:flex wwc:items-center wwc:gap-2 wwc:rounded-md wwc:border wwc:border-border wwc:bg-card wwc:px-3 wwc:py-1.5 wwc:shadow-lg wwc:animate-in wwc:slide-in-from-bottom-4 wwc:fade-in wwc:duration-200">
						<span className="wwc:text-xs wwc:font-medium wwc:text-foreground">
							{table.getFilteredSelectedRowModel().rows.length} selected
						</span>
						<div className="wwc:h-4 wwc:w-px wwc:bg-border" />
						<div className="wwc:flex wwc:items-center wwc:gap-1.5">
							{bulkActions.map((action) => (
								<Button
									key={action.label}
									variant={action.variant ?? "outline"}
									size="sm"
									className="wwc:gap-1 wwc:h-7 wwc:text-xs wwc:px-2.5"
									onClick={() => {
										const selectedIds = table.getFilteredSelectedRowModel().rows.map((row) => row.id);
										action.onClick(selectedIds);
									}}
								>
									{action.icon}
									{action.label}
								</Button>
							))}
						</div>
						<div className="wwc:h-4 wwc:w-px wwc:bg-border" />
						<Button
							variant="ghost"
							size="sm"
							className="wwc:h-6 wwc:w-6 wwc:p-0 wwc:text-muted-foreground"
							onClick={() => table.toggleAllRowsSelected(false)}
						>
							<X className="wwc:h-3.5 wwc:w-3.5" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

// ============================================================================
// Helper Components
// ============================================================================

// Sortable column header
interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
	column: import("@tanstack/react-table").Column<TData, TValue>;
	title: string;
}

function DataTableColumnHeader<TData, TValue>({column, title, className}: DataTableColumnHeaderProps<TData, TValue>) {
	if (!column.getCanSort()) {
		return <div className={className}>{title}</div>;
	}

	return (
		<Button
			variant="ghost"
			size="sm"
			className="wwc:-ml-3 wwc:h-8 wwc:px-3"
			onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
		>
			{title}
			<ArrowUpDown className="wwc:h-3.5 wwc:w-3.5" />
		</Button>
	);
}

// Expand/collapse button for rows
interface DataTableExpandButtonProps<TData> {
	row: Row<TData>;
	className?: string;
}

function DataTableExpandButton<TData>({row, className}: DataTableExpandButtonProps<TData>) {
	if (!row.getCanExpand()) {
		return <span className={cn("wwc:w-4 wwc:h-4 wwc:inline-block", className)} />;
	}

	return (
		<Button
			variant="ghost"
			icon
			className={cn("wwc:h-6 wwc:w-6", className)}
			onClick={(e) => {
				e.stopPropagation();
				row.toggleExpanded();
			}}
		>
			{row.getIsExpanded() ? <ChevronDown className="wwc:h-4 wwc:w-4" /> : <ChevronRight className="wwc:h-4 wwc:w-4" />}
		</Button>
	);
}

// Expand all button for header
interface DataTableExpandAllButtonProps<TData> {
	table: import("@tanstack/react-table").Table<TData>;
	className?: string;
}

function DataTableExpandAllButton<TData>({table, className}: DataTableExpandAllButtonProps<TData>) {
	const isAllExpanded = table.getIsAllRowsExpanded();
	const canExpand = table.getCanSomeRowsExpand();

	if (!canExpand) {
		return null;
	}

	return (
		<Button
			variant="ghost"
			icon
			className={cn("wwc:h-6 wwc:w-6", className)}
			onClick={() => table.toggleAllRowsExpanded()}
		>
			{isAllExpanded ? <ChevronDown className="wwc:h-4 wwc:w-4" /> : <ChevronsUpDown className="wwc:h-4 wwc:w-4" />}
		</Button>
	);
}

// ============================================================================
// Collapsible Row Group Component
// ============================================================================

interface DataTableRowGroupProps {
	title: React.ReactNode;
	children: React.ReactNode;
	defaultOpen?: boolean;
	className?: string;
	headerClassName?: string;
	contentClassName?: string;
	colSpan: number;
}

function DataTableRowGroup({
	title,
	children,
	defaultOpen = true,
	className,
	headerClassName,
	contentClassName,
	colSpan,
}: DataTableRowGroupProps) {
	const [isOpen, setIsOpen] = React.useState(defaultOpen);

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
			<TableRow className={cn("wwc:bg-muted/50 wwc:hover:bg-muted/70", headerClassName)}>
				<TableCell colSpan={colSpan} className="wwc:py-2">
					<CollapsibleTrigger asChild>
						<Button variant="ghost" size="sm" className="wwc:h-7 wwc:gap-2 wwc:px-2">
							{isOpen ? <ChevronDown className="wwc:h-4 wwc:w-4" /> : <ChevronRight className="wwc:h-4 wwc:w-4" />}
							<span className="wwc:font-medium">{title}</span>
						</Button>
					</CollapsibleTrigger>
				</TableCell>
			</TableRow>
			<CollapsibleContent asChild>
				<tbody className={contentClassName}>{children}</tbody>
			</CollapsibleContent>
		</Collapsible>
	);
}

// ============================================================================
// Nested/Tree Row Component
// ============================================================================

interface DataTableTreeCellProps<TData> {
	row: Row<TData>;
	children: React.ReactNode;
	className?: string;
}

function DataTableTreeCell<TData>({row, children, className}: DataTableTreeCellProps<TData>) {
	return (
		<div
			className={cn("wwc:flex wwc:items-center wwc:gap-2", className)}
			style={{paddingLeft: `${row.depth * 1.5}rem`}}
		>
			<DataTableExpandButton row={row} />
			{children}
		</div>
	);
}

// ============================================================================
// Sub-Row Detail Panel
// ============================================================================

interface DataTableDetailPanelProps {
	children: React.ReactNode;
	className?: string;
}

function DataTableDetailPanel({children, className}: DataTableDetailPanelProps) {
	return <div className={cn("wwc:p-4 wwc:bg-muted/20", className)}>{children}</div>;
}

export interface DataTableRowAction {
	/** Menu item text, and the icon button's accessible name in the single-action case. */
	label: string;
	icon?: React.ReactNode;
	onSelect?: () => void;
	/** Renders the item in the destructive tone. */
	destructive?: boolean;
	disabled?: boolean;
}

export interface DataTableRowActionsProps {
	actions: DataTableRowAction[];
	className?: string;
}

/**
 * Canonical row-actions cell. **Two or more actions always collapse into a `⋯` dropdown**; a lone
 * action renders as a bare icon button instead, since a menu holding one item is pure friction.
 * Use this rather than hand-rolling per-row buttons so every table behaves the same way.
 *
 * ```tsx
 * {
 *   id: "actions",
 *   enableSorting: false,
 *   enableHiding: false,
 *   // `id: "actions"` already gets w-px / max-w-none / overflow-visible / text-clip / nowrap.
 *   meta: {cellClassName: "text-right"},
 *   cell: ({row}) => (
 *     <DataTableRowActions
 *       actions={[
 *         {label: "Edit", icon: <Pencil className="h-4 w-4" />, onSelect: () => edit(row.original)},
 *         {label: "Delete", icon: <Trash2 className="h-4 w-4" />, destructive: true, onSelect: …},
 *       ]}
 *     />
 *   ),
 * }
 * ```
 */
function DataTableRowActions({actions, className}: DataTableRowActionsProps) {
	if (actions.length === 0) return null;

	if (actions.length === 1) {
		const [action] = actions;
		return (
			<div className={cn("wwc:flex wwc:items-center wwc:justify-end", className)}>
				<Button
					variant="ghost"
					icon
					aria-label={action.label}
					title={action.label}
					disabled={action.disabled}
					onClick={action.onSelect}
					className={cn("wwc:h-7 wwc:w-7", action.destructive ? "wwc:text-destructive" : "wwc:text-muted-foreground")}
				>
					{action.icon ?? <MoreHorizontal className="wwc:h-4 wwc:w-4" />}
				</Button>
			</div>
		);
	}

	return (
		<div className={cn("wwc:flex wwc:items-center wwc:justify-end", className)}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" icon aria-label="Row actions" className="wwc:h-7 wwc:w-7 wwc:text-muted-foreground">
						<MoreHorizontal className="wwc:h-4 wwc:w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="wwc:w-44">
					{actions.map((action) => (
						<DropdownMenuItem
							key={action.label}
							disabled={action.disabled}
							onClick={action.onSelect}
							className={action.destructive ? "wwc:text-destructive wwc:focus:text-destructive" : undefined}
						>
							{action.icon}
							{action.label}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

// ============================================================================
// Exports
// ============================================================================

export {
	DataTable,
	DataTableColumnHeader,
	DataTableRowActions,
	DataTableExpandButton,
	DataTableExpandAllButton,
	DataTableRowGroup,
	DataTableTreeCell,
	DataTableDetailPanel,
};
