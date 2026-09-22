import {cn} from "@core/core-utils";
import {MoreVertical} from "lucide-react";
import * as React from "react";

import {BrowserTabs, type BrowserTabItem} from "./browser-tabs";
import {Button} from "./button";
import {Card} from "./card";
import {type CommentItem, CommentThread} from "./comment-thread";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "./dropdown-menu";
import {EmptySelection} from "./empty";
import {InlineCommentComposer, type InlineCommentComposerSubmit} from "./inline-comment-composer";
import {
	PushPanel,
	PushPanelContainer,
	PushPanelContent,
	PushPanelDescription,
	PushPanelFooter,
	PushPanelHeader,
	PushPanelHeaderTitle,
	PushPanelMain,
	PushPanelProvider,
	PushPanelTitle,
} from "./push-panel";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "./resizable";
import {ScrollArea} from "./scroll-area";
import {SearchFilterBar, type SearchFilterBarFilter} from "./search-filter-bar";

export type TaskMonitorItem = {
	id: string;
	title: string;
	subtitle?: string;
	meta?: React.ReactNode;
	/** Optional leading icon, carried onto the item's open browser tab. */
	icon?: React.ReactNode;
};

export type TaskMonitorAction = {
	id: string;
	label: string;
	icon?: React.ReactNode;
	onSelect: () => void;
	tone?: "default" | "destructive";
};

export interface TaskMonitorProps extends React.HTMLAttributes<HTMLDivElement> {
	items: TaskMonitorItem[];
	listTitle?: string;
	search: string;
	onSearchChange: (s: string) => void;
	searchPlaceholder?: string;
	filters?: SearchFilterBarFilter[];
	activeFilterId?: string;
	onActiveFilterChange?: (id: string | undefined) => void;
	listActions?: TaskMonitorAction[];
	/** Extra controls rendered beside the list search input (e.g. a `<Filter>` trigger). */
	listTrailing?: React.ReactNode;
	/** Applied-filter strip rendered under the list search input (e.g. `<FilterChips>`). */
	listFilterStrip?: React.ReactNode;
	renderListRow?: (item: TaskMonitorItem, isSelected: boolean) => React.ReactNode;

	openItemIds: string[];
	activeItemId?: string;
	onActiveItemChange?: (id: string | undefined) => void;
	onItemOpen?: (id: string) => void;
	onItemClose?: (id: string) => void;
	/** Reorder the open-item tabs by drag (browser-style). Fires with the full tab-id list in its new order. */
	onReorder?: (orderedIds: string[]) => void;
	renderItemBody: (item: TaskMonitorItem) => React.ReactNode;
	/** Singular noun used in default empty-state copy and shortcut labels (e.g. "task", "alert", "issue"). Defaults to "item". */
	itemNoun?: string;
	/** Disable the built-in N / P / ←/→ / Esc keyboard shortcuts. */
	disableKeyboardShortcuts?: boolean;

	/** Comments for the active item. Newest-first ordering is the consumer's responsibility. */
	comments?: CommentItem[];
	commentValue?: string;
	onCommentValueChange?: (s: string) => void;
	onCommentSubmit?: (item: TaskMonitorItem, submission: InlineCommentComposerSubmit) => void;
	commentPlaceholder?: string;
	commentFlagged?: boolean;
	onCommentFlaggedChange?: (flagged: boolean) => void;
	commentDate?: Date;
	onCommentDateChange?: (date: Date | undefined) => void;
	onCommentAddImage?: (files: FileList) => void;
	onCommentAddMention?: () => void;

	actionPanelTitle?: string;
	actionPanelDescription?: string;
	actionPanelWidth?: number;
	renderActionDetails?: (item: TaskMonitorItem) => React.ReactNode;
	primaryAction?: TaskMonitorAction;
	secondaryActions?: TaskMonitorAction[];
}

function defaultRenderListRow(item: TaskMonitorItem, isSelected: boolean): React.ReactNode {
	return (
		<Card
			className={cn(
				"wwc:p-3 wwc:cursor-pointer wwc:transition-colors wwc:shadow-none",
				isSelected ? "wwc:border-primary wwc:bg-accent" : "wwc:border-border wwc:hover:bg-accent/50",
			)}
		>
			<div className="wwc:font-semibold wwc:text-sm wwc:text-foreground wwc:truncate">{item.title}</div>
			{item.subtitle && (
				<div className="wwc:text-xs wwc:text-muted-foreground wwc:mt-0.5 wwc:truncate">{item.subtitle}</div>
			)}
			{item.meta && <div className="wwc:mt-2 wwc:text-xs wwc:text-muted-foreground">{item.meta}</div>}
		</Card>
	);
}

const TaskMonitor = React.forwardRef<HTMLDivElement, TaskMonitorProps>(
	(
		{
			className,
			items,
			listTitle,
			search,
			onSearchChange,
			searchPlaceholder = "Search...",
			filters,
			activeFilterId,
			onActiveFilterChange,
			listActions,
			listTrailing,
			listFilterStrip,
			renderListRow,
			openItemIds,
			activeItemId,
			onActiveItemChange,
			onItemOpen,
			onItemClose,
			onReorder,
			renderItemBody,
			comments,
			commentValue: commentValueProp,
			onCommentValueChange,
			onCommentSubmit,
			commentPlaceholder = "Write a comment…",
			commentFlagged,
			onCommentFlaggedChange,
			commentDate,
			onCommentDateChange,
			onCommentAddImage,
			onCommentAddMention,
			actionPanelTitle,
			actionPanelDescription,
			actionPanelWidth = 360,
			renderActionDetails,
			primaryAction,
			secondaryActions,
			itemNoun = "item",
			disableKeyboardShortcuts = false,
			...rest
		},
		ref,
	) => {
		const [internalComment, setInternalComment] = React.useState("");
		const isCommentControlled = commentValueProp !== undefined;
		const commentValue = isCommentControlled ? commentValueProp : internalComment;

		const setCommentValue = React.useCallback(
			(next: string) => {
				if (!isCommentControlled) setInternalComment(next);
				onCommentValueChange?.(next);
			},
			[isCommentControlled, onCommentValueChange],
		);

		const itemsById = React.useMemo(() => {
			const map = new Map<string, TaskMonitorItem>();
			for (const it of items) map.set(it.id, it);
			return map;
		}, [items]);

		const activeItem = activeItemId !== undefined ? itemsById.get(activeItemId) : undefined;
		const actionPanelOpen = activeItem !== undefined;

		const handleRowClick = React.useCallback(
			(item: TaskMonitorItem) => {
				if (!openItemIds.includes(item.id)) {
					onItemOpen?.(item.id);
				}
				onActiveItemChange?.(item.id);
			},
			[openItemIds, onItemOpen, onActiveItemChange],
		);

		const handleTabClose = React.useCallback(
			(id: string) => {
				onItemClose?.(id);
			},
			[onItemClose],
		);

		const handleCommentSubmit = React.useCallback(
			(submission: InlineCommentComposerSubmit) => {
				if (!activeItem) return;
				onCommentSubmit?.(activeItem, submission);
				setCommentValue("");
			},
			[activeItem, onCommentSubmit, setCommentValue],
		);

		const tabs: BrowserTabItem[] = React.useMemo(
			() =>
				openItemIds
					.map((id) => itemsById.get(id))
					.filter((it): it is TaskMonitorItem => it !== undefined)
					.map((it) => ({id: it.id, label: it.title, icon: it.icon})),
			[openItemIds, itemsById],
		);

		React.useEffect(() => {
			if (disableKeyboardShortcuts) return;
			const handleKey = (e: KeyboardEvent) => {
				if (e.metaKey || e.ctrlKey || e.altKey) return;
				const target = e.target as HTMLElement | null;
				if (
					target &&
					(target.tagName === "INPUT" ||
						target.tagName === "TEXTAREA" ||
						target.tagName === "SELECT" ||
						target.isContentEditable)
				) {
					return;
				}

				switch (e.key) {
					case "n":
					case "N": {
						if (items.length === 0) return;
						e.preventDefault();
						const idx = activeItemId !== undefined ? items.findIndex((i) => i.id === activeItemId) : -1;
						const next = items[Math.min(items.length - 1, idx + 1)];
						if (next) handleRowClick(next);
						return;
					}
					case "p":
					case "P": {
						if (items.length === 0) return;
						e.preventDefault();
						const idx = activeItemId !== undefined ? items.findIndex((i) => i.id === activeItemId) : items.length;
						const prev = items[Math.max(0, idx - 1)];
						if (prev) handleRowClick(prev);
						return;
					}
					case "ArrowLeft": {
						if (activeItemId === undefined) return;
						const idx = openItemIds.indexOf(activeItemId);
						const prevId = idx > 0 ? openItemIds[idx - 1] : undefined;
						if (prevId !== undefined) {
							e.preventDefault();
							onActiveItemChange?.(prevId);
						}
						return;
					}
					case "ArrowRight": {
						if (activeItemId === undefined) return;
						const idx = openItemIds.indexOf(activeItemId);
						const nextId = idx >= 0 && idx < openItemIds.length - 1 ? openItemIds[idx + 1] : undefined;
						if (nextId !== undefined) {
							e.preventDefault();
							onActiveItemChange?.(nextId);
						}
						return;
					}
					case "Escape": {
						if (activeItemId === undefined) return;
						e.preventDefault();
						onItemClose?.(activeItemId);
						return;
					}
				}
			};
			document.addEventListener("keydown", handleKey);
			return () => document.removeEventListener("keydown", handleKey);
		}, [disableKeyboardShortcuts, items, openItemIds, activeItemId, handleRowClick, onActiveItemChange, onItemClose]);

		const showCommentArea = activeItem !== undefined && onCommentSubmit !== undefined;
		const renderRow = renderListRow ?? defaultRenderListRow;

		const listActionsMenu =
			listActions && listActions.length > 0 ? (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" icon aria-label="List actions">
							<MoreVertical className="wwc:h-4 wwc:w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{listActions.map((action) => (
							<DropdownMenuItem
								key={action.id}
								onSelect={() => action.onSelect()}
								className={cn(action.tone === "destructive" && "wwc:text-destructive wwc:focus:text-destructive")}
							>
								{action.icon && <span className="wwc:mr-2 wwc:flex wwc:items-center">{action.icon}</span>}
								{action.label}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			) : undefined;

		const trailing =
			listTrailing || listActionsMenu ? (
				<>
					{listTrailing}
					{listActionsMenu}
				</>
			) : undefined;

		return (
			<div ref={ref} className={cn("wwc:flex wwc:h-full wwc:w-full", className)} {...rest}>
				<PushPanelProvider open={actionPanelOpen} side="right">
					<PushPanelContainer className="wwc:h-full">
						<PushPanelMain className="wwc:h-full wwc:min-w-0">
							<ResizablePanelGroup orientation="horizontal" className="wwc:h-full">
								<ResizablePanel defaultSize={30} minSize={20}>
									<div className="wwc:flex wwc:h-full wwc:flex-col wwc:bg-card">
										{listTitle && (
											<div className="wwc:px-3 wwc:py-3 wwc:text-sm wwc:font-semibold wwc:text-foreground wwc:border-b">
												{listTitle}
											</div>
										)}
										<SearchFilterBar
											search={search}
											onSearchChange={onSearchChange}
											searchPlaceholder={searchPlaceholder}
											filters={filters}
											activeFilterId={activeFilterId}
											onActiveFilterChange={onActiveFilterChange}
											trailing={trailing}
											filterStrip={listFilterStrip}
										/>
										<ScrollArea className="wwc:flex-1">
											<div className="wwc:flex wwc:flex-col wwc:gap-2 wwc:p-3">
												{items.length === 0 ? (
													<div className="wwc:py-8 wwc:text-center wwc:text-sm wwc:text-muted-foreground">No items</div>
												) : (
													items.map((item) => {
														const isSelected = item.id === activeItemId;
														return (
															<div
																key={item.id}
																role="button"
																tabIndex={0}
																aria-pressed={isSelected}
																onClick={() => handleRowClick(item)}
																onKeyDown={(e) => {
																	if (e.key === "Enter" || e.key === " ") {
																		e.preventDefault();
																		handleRowClick(item);
																	}
																}}
																className="wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring wwc:rounded-xl"
															>
																{renderRow(item, isSelected)}
															</div>
														);
													})
												)}
											</div>
										</ScrollArea>
									</div>
								</ResizablePanel>

								<ResizableHandle />

								<ResizablePanel defaultSize={70} minSize={40}>
									<div className="wwc:flex wwc:h-full wwc:flex-col wwc:bg-background">
										{tabs.length > 0 ? (
											<BrowserTabs
												tabs={tabs}
												activeId={activeItemId}
												onActiveChange={(id) => onActiveItemChange?.(id)}
												onTabClose={handleTabClose}
												onReorder={onReorder}
												closeable
												className="wwc:bg-background"
											/>
										) : (
											<div className="wwc:h-9 wwc:shrink-0" aria-hidden />
										)}
										<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col">
											{activeItem ? (
												<>
													<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto">
														<div className="wwc:bg-card">{renderItemBody(activeItem)}</div>
														{showCommentArea && (
															<div className="wwc:px-4 wwc:py-4">
																<CommentThread
																	comments={comments ?? []}
																	emptyState={
																		<p className="wwc:py-8 wwc:text-center wwc:text-sm wwc:text-muted-foreground">
																			No comments yet.
																		</p>
																	}
																/>
															</div>
														)}
													</div>
													{showCommentArea && (
														<div className="wwc:shrink-0 wwc:border-t wwc:px-4 wwc:py-3">
															<InlineCommentComposer
																value={commentValue}
																onChange={setCommentValue}
																onSubmit={handleCommentSubmit}
																placeholder={commentPlaceholder}
																flagged={commentFlagged}
																onFlaggedChange={onCommentFlaggedChange}
																date={commentDate}
																onDateChange={onCommentDateChange}
																onAddImage={onCommentAddImage}
																onAddMention={onCommentAddMention}
															/>
														</div>
													)}
												</>
											) : (
												<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto wwc:bg-background">
													<EmptySelection itemNoun={itemNoun} />
												</div>
											)}
										</div>
									</div>
								</ResizablePanel>
							</ResizablePanelGroup>
						</PushPanelMain>

						<PushPanel width={actionPanelWidth}>
							<PushPanelHeader>
								<PushPanelHeaderTitle>
									<div className="wwc:flex wwc:flex-col wwc:min-w-0">
										<PushPanelTitle>{actionPanelTitle ?? activeItem?.title ?? "Details"}</PushPanelTitle>
										{(actionPanelDescription || activeItem?.subtitle) && (
											<PushPanelDescription>{actionPanelDescription ?? activeItem?.subtitle}</PushPanelDescription>
										)}
									</div>
								</PushPanelHeaderTitle>
							</PushPanelHeader>
							<PushPanelContent>
								{activeItem && renderActionDetails ? (
									renderActionDetails(activeItem)
								) : (
									<div className="wwc:text-sm wwc:text-muted-foreground">No details to display.</div>
								)}
							</PushPanelContent>
							{(primaryAction || (secondaryActions && secondaryActions.length > 0)) && (
								<PushPanelFooter className="wwc:justify-end wwc:flex-wrap">
									{secondaryActions?.map((action) => (
										<Button
											key={action.id}
											type="button"
											size="sm"
											variant={action.tone === "destructive" ? "destructive" : "outline"}
											onClick={action.onSelect}
										>
											{action.icon}
											{action.label}
										</Button>
									))}
									{primaryAction && (
										<Button
											type="button"
											size="sm"
											variant={primaryAction.tone === "destructive" ? "destructive" : "default"}
											onClick={primaryAction.onSelect}
										>
											{primaryAction.icon}
											{primaryAction.label}
										</Button>
									)}
								</PushPanelFooter>
							)}
						</PushPanel>
					</PushPanelContainer>
				</PushPanelProvider>
			</div>
		);
	},
);
TaskMonitor.displayName = "TaskMonitor";

export {TaskMonitor};
