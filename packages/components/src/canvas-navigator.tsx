import {cn} from "@wakecap/core-utils";
import {
	ArrowLeft,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	Loader2,
	Maximize2,
	Minimize2,
	Search,
	X,
} from "lucide-react";
import * as React from "react";

import {Button} from "./button";
import {TreeRow} from "./tree-row";

/**
 * A node in the navigator hierarchy. A node with a `children` array is a branch (a level you can
 * drill into / expand) — even an empty array, which renders an empty state. A node without a
 * `children` property is a selectable leaf. Nest to any depth.
 */
export interface CanvasNavigatorNode {
	id: string;
	label: string;
	/** Leading icon for the row. */
	icon?: React.ReactNode;
	disabled?: boolean;
	children?: CanvasNavigatorNode[];
}

/**
 * Panel size:
 * - `collapsed` — header only, body hidden.
 * - `default` — normal panel (drills one level at a time).
 * - `expanded` — enlarged ("big") panel showing the full tree.
 */
export type CanvasNavigatorSize = "collapsed" | "default" | "expanded";

export interface CanvasNavigatorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
	/** Hierarchical nodes (branches + leaves) shown in the navigator. */
	nodes: CanvasNavigatorNode[];
	/** Selected node id (controlled). */
	value?: string;
	/** Initial selected node id (uncontrolled). Defaults to the first (top-level) node. */
	defaultValue?: string;
	onSelect?: (id: string) => void;
	/** Expanded branch ids in the full-tree (expanded) view. Defaults to every branch expanded. */
	expandedIds?: string[];
	defaultExpandedIds?: string[];
	onExpandedChange?: (ids: string[]) => void;
	/** Panel size (controlled): collapse to a header, or expand to go big. */
	size?: CanvasNavigatorSize;
	defaultSize?: CanvasNavigatorSize;
	onSizeChange?: (size: CanvasNavigatorSize) => void;
	/** Show the expand ("go big") control in the header. Default true. The collapse control always shows. */
	expandable?: boolean;
	/**
	 * Icon for the header's collapse control. Defaults to a chevron-up. Override it (e.g. with a panel
	 * icon) when the navigator is docked as a sidebar and "collapse" reads as "hide the panel".
	 */
	collapseIcon?: React.ReactNode;
	/** Header title shown at the top level. */
	title?: string;
	/** Render the header (with collapse + expand controls). Default true. */
	header?: boolean;
	/**
	 * Show a search bar in the header. While searching, the tree is replaced by a flat list of
	 * matching locations, each shown as its full breadcrumb path (start-truncated to one line).
	 */
	searchable?: boolean;
	/** Placeholder for the search input. Default "Search…". */
	searchPlaceholder?: string;
	/** Message shown when a branch has no children (e.g. a level with nothing under it). */
	emptyLabel?: string;
	/**
	 * Long-name handling for rows. Omit for plain end truncation. `"end"` adds a hover tooltip
	 * with the full name when it's clipped; `"middle"` keeps the start + tail visible (good for
	 * filenames like `Plan_Rev3.svg`); `"clamp"` wraps the name onto up to `maxLines` lines before
	 * truncating. All add a tooltip with the full name.
	 */
	truncate?: "end" | "middle" | "clamp";
	/** For `truncate="middle"`, how many trailing characters to always keep visible. Default 7. */
	tailChars?: number;
	/** For `truncate="clamp"`, the maximum number of wrapped lines before truncating. Default 3. */
	maxLines?: number;
	/** Compact density — 12px text on rows, header, search, and results, with tighter spacing. Default false. */
	compact?: boolean;
	/** Show a loading bar docked to the bottom of the panel while locations are still loading. Default false. */
	loading?: boolean;
	/** Text shown next to the spinner in the loading bar. Default "Loading…". */
	loadingLabel?: string;
	/**
	 * Deep-tree horizontal shift. When set, expanding branches past this (1-based) level slides the
	 * default tree left by one indent step — the gap between level 1 and level 2 — for each level
	 * revealed beyond it, so the active deep path stays in view. Collapsing a level shifts it back.
	 * Omit to disable (the tree never shifts).
	 */
	shiftAfterLevel?: number;
}

/** Indent added per tree level. The shift step equals this — the gap between level 1 and level 2. */
const INDENT_PX = 8;

function useControllable<T>(controlled: T | undefined, fallback: T, onChange?: (value: T) => void) {
	const [internal, setInternal] = React.useState<T>(fallback);
	const value = controlled !== undefined ? controlled : internal;
	const set = React.useCallback(
		(next: T) => {
			if (controlled === undefined) setInternal(next);
			onChange?.(next);
		},
		[controlled, onChange],
	);
	return [value, set] as const;
}

interface NodeIndex {
	byId: Map<string, CanvasNavigatorNode>;
	parentById: Map<string, CanvasNavigatorNode | null>;
	branchIds: string[];
}

function indexNodes(nodes: CanvasNavigatorNode[]): NodeIndex {
	const byId = new Map<string, CanvasNavigatorNode>();
	const parentById = new Map<string, CanvasNavigatorNode | null>();
	const branchIds: string[] = [];
	const walk = (list: CanvasNavigatorNode[], parent: CanvasNavigatorNode | null) => {
		for (const node of list) {
			byId.set(node.id, node);
			parentById.set(node.id, parent);
			if (Array.isArray(node.children)) {
				branchIds.push(node.id);
				walk(node.children, node);
			}
		}
	};
	walk(nodes, null);
	return {byId, parentById, branchIds};
}

/** A search hit: the matching node plus its full label path (ancestors first, self last). */
interface SearchResult {
	node: CanvasNavigatorNode;
	path: string[];
}

/**
 * Flatten every node whose label matches the lowercased query into a list of hits, each carrying its
 * full label path from the root — rendered as a single-line, start-truncated breadcrumb instead of
 * the hierarchy.
 */
function searchResults(nodes: CanvasNavigatorNode[], q: string): SearchResult[] {
	const out: SearchResult[] = [];
	const walk = (list: CanvasNavigatorNode[], trail: string[]) => {
		for (const node of list) {
			const path = [...trail, node.label];
			if (node.label.toLowerCase().includes(q)) out.push({node, path});
			if (Array.isArray(node.children)) walk(node.children, path);
		}
	};
	walk(nodes, []);
	return out;
}

const CanvasNavigator = React.forwardRef<HTMLDivElement, CanvasNavigatorProps>(
	(
		{
			className,
			nodes,
			value,
			defaultValue,
			onSelect,
			expandedIds,
			defaultExpandedIds,
			onExpandedChange,
			size: sizeProp,
			defaultSize = "default",
			onSizeChange,
			expandable = true,
			collapseIcon,
			title = "Navigator",
			header = true,
			searchable = false,
			searchPlaceholder = "Search…",
			emptyLabel = "No items",
			truncate,
			tailChars,
			maxLines,
			compact = false,
			loading = false,
			loadingLabel = "Loading…",
			shiftAfterLevel,
			...rest
		},
		ref,
	) => {
		// Shared row props: long-name handling + a tighter 8px indent per level. Compact shrinks the
		// label to 12px (overriding TreeRow's default 14px).
		const rowProps = {
			truncate,
			tailChars,
			maxLines,
			indentPx: INDENT_PX,
			textClassName: compact ? "wwc:text-xs" : undefined,
			iconClassName: "wwc:text-muted-foreground wwc:[&_svg]:stroke-[1.5]",
			chevronClassName: "wwc:text-muted-foreground wwc:stroke-[1.5]",
		};
		// 12px vs 14px for the navigator's own chrome (header, search, breadcrumbs, empty states).
		const textCls = compact ? "wwc:text-xs" : "wwc:text-sm";
		const index = React.useMemo(() => indexNodes(nodes), [nodes]);

		const [expanded, setExpanded] = useControllable<string[]>(
			expandedIds,
			defaultExpandedIds ?? index.branchIds,
			onExpandedChange,
		);
		const [size, setSize] = useControllable<CanvasNavigatorSize>(sizeProp, defaultSize, onSizeChange);

		// Selection. Uncontrolled by default so the first (top-level) node starts selected.
		const [selected, setSelected] = useControllable(value, defaultValue ?? nodes[0]?.id, onSelect);

		// Search: filter the tree by label. While searching, the filtered tree is shown fully expanded
		// (overriding the drill / default view) so every match is visible.
		const [query, setQuery] = React.useState("");
		const q = query.trim().toLowerCase();
		const searching = searchable && q.length > 0;
		const results = React.useMemo(() => (searching ? searchResults(nodes, q) : []), [nodes, searching, q]);

		// Which leaf-parent the default view is drilled into (showing only its leaves). `null` shows the
		// tree. Starts on the tree so you see the structure; drilling a last level reveals the back button.
		const [focusedId, setFocusedId] = React.useState<string | null>(null);

		// Which last levels are expanded in place in the default tree (chevron toggles this). Starts
		// empty so last levels read as collapsed rows until their chevron is clicked.
		const [openLastLevels, setOpenLastLevels] = React.useState<Set<string>>(() => new Set());
		const toggleLastLevel = (id: string) => {
			setOpenLastLevels((prev) => {
				const next = new Set(prev);
				if (next.has(id)) next.delete(id);
				else next.add(id);
				return next;
			});
		};

		const expandedSet = new Set(searching ? index.branchIds : expanded);
		const toggleExpand = (id: string) => {
			setExpanded(expandedSet.has(id) ? expanded.filter((b) => b !== id) : [...expanded, id]);
		};

		const isExpanded = size === "expanded";
		const isCollapsed = size === "collapsed";

		// Collapsed view pages between the selected leaf's siblings (children of its parent).
		const valueParent = selected !== undefined ? index.parentById.get(selected) : undefined;
		const siblings = valueParent ? (valueParent.children ?? []) : nodes;
		const activeIndex = siblings.findIndex((n) => n.id === selected);
		const activeNode = activeIndex >= 0 ? siblings[activeIndex] : undefined;
		const findEnabled = (from: number, dir: 1 | -1) => {
			for (let i = from; i >= 0 && i < siblings.length; i += dir) {
				if (!siblings[i].disabled) return i;
			}
			return -1;
		};
		const prevIndex = activeIndex >= 0 ? findEnabled(activeIndex - 1, -1) : -1;
		const nextIndex = activeIndex >= 0 ? findEnabled(activeIndex + 1, 1) : -1;
		const stepTo = (i: number) => {
			if (i >= 0 && i < siblings.length) setSelected(siblings[i].id);
		};

		// A node with a children array (even empty) is a branch; without one it's a selectable leaf.
		const isBranchNode = (node: CanvasNavigatorNode) => Array.isArray(node.children);
		// A branch whose children are all leaves (or none) — the deepest navigable level.
		const isLeafParent = (node: CanvasNavigatorNode) =>
			isBranchNode(node) && node.children!.every((c) => !isBranchNode(c));
		// Empty state shown only when drilling into a last level that has no items.
		const emptyState = () => (
			<div className={cn("wwc:px-3 wwc:py-6 wwc:text-center wwc:text-muted-foreground", textCls)}>{emptyLabel}</div>
		);
		// The default view shows the tree (expanding in place) down to the leaf-parent rows; drilling a
		// leaf-parent focuses on just its leaves and reveals the back button.
		const focusedNode = focusedId ? index.byId.get(focusedId) : undefined;
		const showFocused = !isExpanded && !isCollapsed && !searching && !!focusedNode && isLeafParent(focusedNode);
		const goBack = () => setFocusedId(null);

		// Deep-tree horizontal shift: the deepest currently-revealed row depth in the default tree. Once
		// branches open past `shiftAfterLevel`, the tree slides left one indent step per level beyond it,
		// keeping the active deep path in view; collapsing a level reduces the depth and shifts it back.
		const deepestOpenDepth = (list: CanvasNavigatorNode[], depth: number): number => {
			let max = depth;
			for (const node of list) {
				if (!isBranchNode(node) || node.children!.length === 0) continue;
				const open = isLeafParent(node) ? openLastLevels.has(node.id) : expandedSet.has(node.id);
				if (open) max = Math.max(max, deepestOpenDepth(node.children!, depth + 1));
			}
			return max;
		};
		const shiftSteps = shiftAfterLevel ? Math.max(0, deepestOpenDepth(nodes, 0) - (shiftAfterLevel - 1)) : 0;
		const shiftPx = shiftSteps * INDENT_PX;

		const sizeControls = (
			<div className="wwc:flex wwc:items-center wwc:gap-0.5">
				{expandable && (
					<Button
						type="button"
						variant="ghost"
						icon
						size="sm"
						aria-pressed={isExpanded}
						aria-label={isExpanded ? "Restore navigator size" : "Expand navigator"}
						onClick={() => setSize(isExpanded ? "default" : "expanded")}
					>
						{isExpanded ? <Minimize2 className="wwc:h-4 wwc:w-4" /> : <Maximize2 className="wwc:h-4 wwc:w-4" />}
					</Button>
				)}
				<Button
					type="button"
					variant="ghost"
					icon
					size="sm"
					aria-pressed={false}
					aria-label="Collapse navigator"
					onClick={() => setSize("collapsed")}
				>
					{collapseIcon ?? <ChevronUp className="wwc:h-4 wwc:w-4" />}
				</Button>
			</div>
		);

		// Selecting any node — clicking the row body (outside the label/chevron, which toggle/drill).
		const selectNode = (node: CanvasNavigatorNode) => {
			if (!node.disabled) setSelected(node.id);
		};

		// Open "level mode": clicking a lowest-level item focuses its parent level (the drilled view
		// with a back button) and selects that item. The second-last level itself no longer drills —
		// it only expands in place — so entering level mode now happens from the lowest level.
		const openLevel = (leaf: CanvasNavigatorNode) => {
			if (leaf.disabled) return;
			const parent = index.parentById.get(leaf.id);
			if (parent) setFocusedId(parent.id);
			setSelected(leaf.id);
		};

		// Picking a search result: select the location and jump to it (a leaf lands in its level view),
		// then clear the query so the navigator returns to showing that location in context.
		const pickResult = (node: CanvasNavigatorNode) => {
			if (node.disabled) return;
			setSelected(node.id);
			setFocusedId(isBranchNode(node) ? null : (index.parentById.get(node.id)?.id ?? null));
			setQuery("");
		};

		// Flat search results: one row per matching location, its full path shown as a breadcrumb that
		// truncates from the start (ellipsis + the leaf kept visible) so it always stays on one line.
		const renderSearchResults = () =>
			results.map(({node, path}) => (
				// role="button" (not <button>) so the "view" hint button can nest legally. The hint reveals
				// on any row hover — matching the tree's lowest-level rows.
				<div
					key={node.id}
					role="button"
					tabIndex={node.disabled ? -1 : 0}
					aria-disabled={node.disabled || undefined}
					onClick={() => pickResult(node)}
					onKeyDown={(e) => {
						if (!node.disabled && (e.key === "Enter" || e.key === " ")) {
							e.preventDefault();
							pickResult(node);
						}
					}}
					className={cn(
						"wwc:group wwc:relative wwc:flex wwc:w-full wwc:cursor-pointer wwc:items-center wwc:gap-2 wwc:rounded-md wwc:px-2 wwc:text-left wwc:transition-colors wwc:hover:bg-accent wwc:focus-visible:bg-accent wwc:focus-visible:outline-none",
						compact ? "wwc:py-1" : "wwc:py-1.5",
						node.disabled && "wwc:pointer-events-none wwc:opacity-50",
						node.id === selected && "wwc:bg-muted wwc:text-foreground",
					)}
				>
					{node.icon && (
						<span className="wwc:flex wwc:size-4 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:text-muted-foreground">
							{node.icon}
						</span>
					)}
					{/* dir=rtl puts the ellipsis at the start; the bdi keeps the path reading left-to-right. */}
					<span dir="rtl" className={cn("wwc:min-w-0 wwc:flex-1 wwc:truncate wwc:text-left", textCls)}>
						<bdi>
							{path.length > 1 && (
								<span className="wwc:text-muted-foreground">{`${path.slice(0, -1).join("/")}/`}</span>
							)}
							<span className="wwc:font-normal wwc:text-foreground">{path[path.length - 1]}</span>
						</bdi>
					</span>
					{!node.disabled && openHint}
				</div>
			));

		// Hover hint shown on branch rows: a real secondary button overlaid on the row's right edge —
		// absolutely positioned so it reserves no layout space and just floats over whatever is there.
		// It's fully interactive (its own hover state), and because it's nested inside the row
		// (role="button"), a click bubbles to the row's onClick — the same "open" action as clicking
		// outside the label / chevron.
		//
		// Visibility: revealed on row hover, but hidden while the cursor is over the row's text or
		// chevron (marked `data-treerow-toggle`) — those expand rather than open, so the "view" hint
		// only shows over the open zone. The `group-has-…:hover` rule outranks `group-hover` on
		// specificity, so it wins when both match.
		const openHint = (
			<Button
				type="button"
				variant="secondary"
				size="sm"
				tabIndex={-1}
				className="wwc:absolute wwc:right-2 wwc:top-1/2 wwc:h-auto wwc:-translate-y-1/2 wwc:px-1.5 wwc:py-0.5 wwc:text-[10px] wwc:font-bold wwc:leading-none wwc:opacity-0 wwc:transition-opacity wwc:group-hover:opacity-100 wwc:group-has-[[data-treerow-toggle]:hover]:opacity-0"
			>
				view
			</Button>
		);

		// A selectable leaf row. `onClick` / `trailing` can be overridden — e.g. lowest-level rows in
		// the default tree open level mode and show the "view" hint; focused / expanded leaves select.
		// The "view" hint shows on every enabled row by default (revealed on hover over the open zone).
		const leafRow = (
			node: CanvasNavigatorNode,
			level = 0,
			onClick?: () => void,
			trailing: React.ReactNode = node.disabled ? undefined : openHint,
		) => (
			<TreeRow
				key={node.id}
				id={node.id}
				level={level}
				icon={node.icon}
				label={node.label}
				fontWeight="wwc:font-normal"
				variant={node.id === selected ? "neutral-selected" : "default"}
				onClick={onClick ?? (() => selectNode(node))}
				trailing={trailing}
				{...rowProps}
			/>
		);

		// Default tree: expands in place through the branch levels. Branch rows — including the
		// second-last level — only expand / collapse; entering the focused "level mode" happens by
		// clicking a lowest-level item, which shows the "view" hint.
		const renderDefaultTree = (list: CanvasNavigatorNode[], depth: number): React.ReactNode =>
			list.map((node) => {
				if (!isBranchNode(node)) return leafRow(node);
				if (isLeafParent(node)) {
					// Second-last level: behaves like the upper branch levels — clicking the row body (or
					// the "view" hint) selects it, while the chevron / label expand it in place. Empty
					// levels expand to show their empty state inline.
					const hasChildren = node.children!.length > 0;
					const open = openLastLevels.has(node.id);
					return (
						<div key={node.id}>
							<TreeRow
								id={node.id}
								level={depth}
								expandable
								expanded={open}
								icon={node.icon}
								label={node.label}
								fontWeight="wwc:font-medium"
								variant={node.id === selected ? "neutral-selected" : "default"}
								onClick={() => selectNode(node)}
								onToggle={() => toggleLastLevel(node.id)}
								trailing={node.disabled ? undefined : openHint}
								{...rowProps}
							/>
							{open &&
								(hasChildren ? (
									node.children!.map((leaf) => leafRow(leaf, depth + 1, () => openLevel(leaf)))
								) : (
									<div
										className={cn("wwc:py-1.5 wwc:pr-2 wwc:text-muted-foreground", textCls)}
										style={{paddingLeft: `${(depth + 1) * 8 + 22}px`}}
									>
										{emptyLabel}
									</div>
								))}
						</div>
					);
				}
				const open = expandedSet.has(node.id);
				return (
					<div key={node.id}>
						<TreeRow
							id={node.id}
							level={depth}
							expandable
							expanded={open}
							icon={node.icon}
							label={node.label}
							fontWeight="wwc:font-medium"
							variant={node.id === selected ? "neutral-selected" : "default"}
							onClick={() => selectNode(node)}
							onToggle={() => toggleExpand(node.id)}
							trailing={node.disabled ? undefined : openHint}
							{...rowProps}
						/>
						{open && renderDefaultTree(node.children!, depth + 1)}
					</div>
				);
			});

		// Recursive full tree for the expanded view.
		const renderTree = (list: CanvasNavigatorNode[], depth: number): React.ReactNode =>
			list.map((node) => {
				// Empty branches show no chevron in the tree; their empty state appears only on drill-in.
				const hasChildren = isBranchNode(node) && node.children!.length > 0;
				const open = expandedSet.has(node.id);
				return (
					<div key={node.id}>
						<TreeRow
							id={node.id}
							level={depth}
							expandable={hasChildren}
							expanded={open}
							icon={node.icon}
							label={node.label}
							fontWeight={isBranchNode(node) ? "wwc:font-medium" : "wwc:font-normal"}
							variant={node.id === selected ? "neutral-selected" : "default"}
							onClick={() => selectNode(node)}
							onToggle={hasChildren ? () => toggleExpand(node.id) : undefined}
							trailing={node.disabled ? undefined : openHint}
							{...rowProps}
						/>
						{hasChildren && open && renderTree(node.children!, depth + 1)}
					</div>
				);
			});

		return (
			<div
				ref={ref}
				className={cn(
					"wwc:flex wwc:flex-col wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:bg-white wwc:text-card-foreground wwc:shadow-lg",
					isExpanded ? "wwc:h-[32rem] wwc:w-80 wwc:max-w-[90vw]" : "wwc:w-72 wwc:max-w-[80vw]",
					className,
				)}
				{...rest}
			>
				{header &&
					isCollapsed && (
						// Collapsed: a segmented bar — back to the parent level, a sibling pager, and expand — with
						// dividers between each segment.
						<div className="wwc:flex wwc:h-9 wwc:shrink-0 wwc:items-stretch wwc:divide-x wwc:divide-border">
							<div className="wwc:flex wwc:items-center wwc:px-0.5">
								<Button
									type="button"
									variant="ghost"
									icon
									size="sm"
									aria-label="Back to parent level"
									disabled={!valueParent}
									onClick={() => valueParent && setSelected(valueParent.id)}
								>
									<ArrowLeft className="wwc:h-4 wwc:w-4" />
								</Button>
							</div>
							{/* Sibling pager: prev + label + next as one segment (no inner dividers). */}
							<div className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-center wwc:gap-1 wwc:px-0.5">
								<Button
									type="button"
									variant="ghost"
									icon
									size="sm"
									aria-label="Previous item"
									disabled={prevIndex < 0}
									onClick={() => stepTo(prevIndex)}
								>
									<ChevronLeft className="wwc:h-4 wwc:w-4" />
								</Button>
								<span className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-baseline wwc:justify-start wwc:gap-1.5 wwc:px-1">
									<span className={cn("wwc:truncate wwc:font-medium", textCls)}>{activeNode?.label ?? title}</span>
									{activeIndex >= 0 && siblings.length > 0 && (
										<span className="wwc:shrink-0 wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
											{activeIndex + 1}/{siblings.length}
										</span>
									)}
								</span>
								<Button
									type="button"
									variant="ghost"
									icon
									size="sm"
									aria-label="Next item"
									disabled={nextIndex < 0}
									onClick={() => stepTo(nextIndex)}
								>
									<ChevronRight className="wwc:h-4 wwc:w-4" />
								</Button>
							</div>
							<div className="wwc:flex wwc:items-center wwc:px-0.5">
								<Button
									type="button"
									variant="ghost"
									icon
									size="sm"
									aria-pressed={true}
									aria-label="Expand navigator"
									onClick={() => setSize("default")}
								>
									<ChevronDown className="wwc:h-4 wwc:w-4" />
								</Button>
							</div>
						</div>
					)}

				{header &&
					showFocused &&
					focusedNode && (
						// Drilled into the last level: back button + the level's label.
						<div className="wwc:flex wwc:h-9 wwc:shrink-0 wwc:items-center wwc:justify-between wwc:gap-2 wwc:border-b wwc:px-2">
							<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-1">
								<Button type="button" variant="ghost" icon size="sm" aria-label="Back" onClick={goBack}>
									<ChevronLeft className="wwc:h-4 wwc:w-4" />
								</Button>
								<span className={cn("wwc:truncate wwc:font-medium", textCls)}>{focusedNode.label}</span>
							</div>
							{sizeControls}
						</div>
					)}

				{/* Standard header: title + size controls (non-searchable variant). */}
				{header && !searchable && !isCollapsed && !showFocused && (
					<div className="wwc:flex wwc:h-9 wwc:shrink-0 wwc:items-center wwc:justify-between wwc:gap-2 wwc:border-b wwc:px-2">
						<span className={cn("wwc:truncate wwc:font-medium", textCls)}>{title}</span>
						{sizeControls}
					</div>
				)}

				{/* Search header (searchable variant): the search field is the header, controls on the right. */}
				{searchable && !isCollapsed && !showFocused && (
					<div
						className={cn(
							"wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2 wwc:border-b wwc:pl-3 wwc:pr-1.5",
							compact ? "wwc:h-9" : "wwc:h-11",
						)}
					>
						<Search
							className={cn("wwc:shrink-0 wwc:text-muted-foreground", compact ? "wwc:size-4" : "wwc:size-[18px]")}
						/>
						<input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder={searchPlaceholder}
							aria-label="Search"
							className={cn(
								"wwc:min-w-0 wwc:flex-1 wwc:bg-transparent wwc:text-foreground wwc:outline-none wwc:placeholder:text-muted-foreground",
								textCls,
							)}
						/>
						{query && (
							<Button
								type="button"
								variant="ghost"
								icon
								size="sm"
								aria-label="Clear search"
								className="wwc:h-6 wwc:w-6"
								onClick={() => setQuery("")}
							>
								<X className="wwc:h-3.5 wwc:w-3.5" />
							</Button>
						)}
						{header && sizeControls}
					</div>
				)}

				{!isCollapsed && (
					<div className={cn("wwc:overflow-auto wwc:p-1.5", isExpanded ? "wwc:min-h-0 wwc:flex-1" : "wwc:max-h-72")}>
						{searching ? (
							results.length > 0 ? (
								renderSearchResults()
							) : (
								<div className={cn("wwc:px-3 wwc:py-6 wwc:text-center wwc:text-muted-foreground", textCls)}>
									No matches for “{query.trim()}”
								</div>
							)
						) : isExpanded ? (
							renderTree(nodes, 0)
						) : showFocused ? (
							focusedNode?.children && focusedNode.children.length > 0 ? (
								focusedNode.children.map((leaf) => leafRow(leaf))
							) : (
								emptyState()
							)
						) : (
							// Deep-tree shift: slide the whole tree left as levels open past `shiftAfterLevel`.
							<div
								className="wwc:transition-transform wwc:duration-200 wwc:ease-out"
								style={shiftPx ? {transform: `translateX(-${shiftPx}px)`} : undefined}
							>
								{renderDefaultTree(nodes, 0)}
							</div>
						)}
					</div>
				)}

				{/* Loading bar docked to the bottom while locations stream in. */}
				{loading && !isCollapsed && (
					<div
						className={cn(
							"wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2 wwc:border-t wwc:border-border wwc:bg-muted wwc:text-muted-foreground",
							compact ? "wwc:px-3 wwc:py-2" : "wwc:px-4 wwc:py-2.5",
						)}
					>
						<Loader2 className={cn("wwc:shrink-0 wwc:animate-spin", compact ? "wwc:size-3" : "wwc:size-3.5")} />
						<span className={cn("wwc:truncate", textCls)}>{loadingLabel}</span>
					</div>
				)}
			</div>
		);
	},
);
CanvasNavigator.displayName = "CanvasNavigator";

export {CanvasNavigator};
