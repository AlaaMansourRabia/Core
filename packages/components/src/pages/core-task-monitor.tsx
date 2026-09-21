import {cn} from "@wakecap/core-utils";
import {
	Archive,
	CheckCircle2,
	Flag,
	MoreVertical,
	PanelLeftClose,
	PanelLeftOpen,
	PanelRightClose,
	PanelRightOpen,
	ThumbsUp,
	Trash2,
} from "lucide-react";
import {useEffect, useMemo, useState} from "react";

import {Badge} from "../badge";
import {BrowserTabs, type BrowserTabItem} from "../browser-tabs";
import {Button} from "../button";
import {Card} from "../card";
import {type CommentItem, CommentThread} from "../comment-thread";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "../dropdown-menu";
import {InlineCommentComposer} from "../inline-comment-composer";
import {Kbd} from "../kbd";
import {ScrollArea} from "../scroll-area";
import {SearchFilterBar, type SearchFilterBarFilter} from "../search-filter-bar";

type Task = {
	id: string;
	title: string;
	subtitle: string;
	status: "open" | "done";
	assignee: string;
	priority: "Low" | "Medium" | "High";
	updatedAt: string;
};

const initialTasks: Task[] = [
	{
		id: "t-1",
		title: "Wire up tower 3 power",
		subtitle: "Site B • Electrical",
		status: "open",
		assignee: "Layla N.",
		priority: "High",
		updatedAt: "2h ago",
	},
	{
		id: "t-2",
		title: "Inspect crane #2 cabling",
		subtitle: "Site A • Inspection",
		status: "open",
		assignee: "Ahmed R.",
		priority: "Medium",
		updatedAt: "Yesterday",
	},
	{
		id: "t-3",
		title: "Submit weekly headcount",
		subtitle: "Admin • Reporting",
		status: "done",
		assignee: "Maya K.",
		priority: "Low",
		updatedAt: "3d ago",
	},
	{
		id: "t-4",
		title: "Calibrate sensors on lift 4",
		subtitle: "Site C • IoT",
		status: "open",
		assignee: "John D.",
		priority: "High",
		updatedAt: "5h ago",
	},
];

function priorityVariant(priority: Task["priority"]): "default" | "secondary" | "destructive" {
	if (priority === "High") return "destructive";
	if (priority === "Medium") return "default";
	return "secondary";
}

function DetailRow({label, value}: {label: string; value: React.ReactNode}) {
	return (
		<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-3 wwc:py-2">
			<span className="wwc:text-xs wwc:text-muted-foreground">{label}</span>
			<span className="wwc:text-sm wwc:font-medium wwc:text-right">{value}</span>
		</div>
	);
}

function ShortcutRow({keyLabel, label}: {keyLabel: React.ReactNode; label: string}) {
	return (
		<li className="wwc:flex wwc:items-center wwc:gap-3">
			<span className="wwc:flex wwc:w-12 wwc:justify-end">
				<Kbd>{keyLabel}</Kbd>
			</span>
			<span>{label}</span>
		</li>
	);
}

function EmptyTaskViewer() {
	return (
		<div className="wwc:flex wwc:h-full wwc:flex-col wwc:items-center wwc:justify-center wwc:gap-8 wwc:p-6">
			<div className="wwc:flex wwc:flex-col wwc:gap-2.5">
				<h4 className="wwc:text-center wwc:text-sm wwc:font-semibold wwc:text-foreground">Keyboard shortcuts</h4>
				<ul className="wwc:flex wwc:flex-col wwc:gap-1.5 wwc:text-sm wwc:text-muted-foreground">
					<ShortcutRow keyLabel="N" label="Next task" />
					<ShortcutRow keyLabel="P" label="Previous task" />
					<ShortcutRow keyLabel="←" label="Previous tab" />
					<ShortcutRow keyLabel="→" label="Next tab" />
					<ShortcutRow keyLabel="Esc" label="Close tab" />
				</ul>
			</div>
			<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-1 wwc:text-center">
				<h3 className="wwc:text-base wwc:font-semibold wwc:text-foreground">No task selected</h3>
				<p className="wwc:text-sm wwc:text-muted-foreground">Select a task from the list to view details</p>
			</div>
		</div>
	);
}

export function TaskMonitorWorkspace() {
	const [leftOpen, setLeftOpen] = useState(true);
	const [rightOpen, setRightOpen] = useState(true);

	const [tasks, setTasks] = useState<Task[]>(initialTasks);
	const [search, setSearch] = useState("");
	const [filterId, setFilterId] = useState<string | undefined>("all");
	const [openIds, setOpenIds] = useState<string[]>(["t-1"]);
	const [activeId, setActiveId] = useState<string | undefined>("t-1");
	const [comment, setComment] = useState("");
	const [commentFlagged, setCommentFlagged] = useState(false);
	const [commentDate, setCommentDate] = useState<Date | undefined>();
	const [commentsByTask, setCommentsByTask] = useState<Record<string, CommentItem[]>>({
		"t-1": [
			{
				id: "c-seed-1",
				author: {name: "Layla N."},
				timestamp: "2 hours ago",
				body: "We need to confirm the panel ratings before scheduling the lift. Will the foreman sign off today?",
				badges: [{id: "flag", icon: <Flag className="wwc:h-3 wwc:w-3" />, label: "Flagged", tone: "warning"}],
				reactions: [
					{id: "thumbs-up", icon: <ThumbsUp className="wwc:h-3 wwc:w-3" />, label: "thumbs up", count: 2, active: true},
				],
			},
		],
	});

	const filters: SearchFilterBarFilter[] = useMemo(
		() => [
			{id: "all", label: "All", count: tasks.length},
			{id: "open", label: "Open", count: tasks.filter((t) => t.status === "open").length},
			{id: "done", label: "Done", count: tasks.filter((t) => t.status === "done").length},
		],
		[tasks],
	);

	const filteredTasks = useMemo(
		() =>
			tasks.filter((t) => {
				if (filterId === "open" && t.status !== "open") return false;
				if (filterId === "done" && t.status !== "done") return false;
				return t.title.toLowerCase().includes(search.toLowerCase());
			}),
		[tasks, search, filterId],
	);

	const tasksById = useMemo(() => {
		const map = new Map<string, Task>();
		for (const t of tasks) map.set(t.id, t);
		return map;
	}, [tasks]);

	const tabs: BrowserTabItem[] = useMemo(
		() =>
			openIds
				.map((id) => tasksById.get(id))
				.filter((t): t is Task => t !== undefined)
				.map((t) => ({id: t.id, label: t.title})),
		[openIds, tasksById],
	);

	const active = activeId !== undefined ? tasksById.get(activeId) : undefined;

	const handleTaskClick = (task: Task) => {
		if (!openIds.includes(task.id)) setOpenIds((prev) => [...prev, task.id]);
		setActiveId(task.id);
		if (!rightOpen) setRightOpen(true);
	};

	const handleTabClose = (id: string) => {
		const idx = openIds.indexOf(id);
		const next = openIds.filter((x) => x !== id);
		setOpenIds(next);
		if (activeId === id) setActiveId(next[Math.max(0, idx - 1)]);
	};

	const handleCommentSubmit = ({text, flagged, date}: {text: string; flagged: boolean; date?: Date}) => {
		if (!active) return;
		const next: CommentItem = {
			id: `c-${Date.now()}`,
			author: {name: "You", initials: "Y"},
			timestamp: "just now",
			body: text,
			badges: [
				...(flagged
					? [{id: "flag", icon: <Flag className="wwc:h-3 wwc:w-3" />, label: "Flagged", tone: "warning" as const}]
					: []),
				...(date ? [{id: "due", label: `Due ${date.toLocaleDateString()}`, tone: "muted" as const}] : []),
			],
		};
		setCommentsByTask((prev) => ({...prev, [active.id]: [next, ...(prev[active.id] ?? [])]}));
		setComment("");
		setCommentFlagged(false);
		setCommentDate(undefined);
	};

	const togglePriority = (taskId: string, status: Task["status"]) => {
		setTasks((prev) => prev.map((t) => (t.id === taskId ? {...t, status} : t)));
	};

	const deleteTask = (taskId: string) => {
		setTasks((prev) => prev.filter((t) => t.id !== taskId));
		setOpenIds((prev) => prev.filter((id) => id !== taskId));
		if (activeId === taskId) setActiveId(undefined);
	};

	useEffect(() => {
		if (activeId === undefined) setRightOpen(false);
	}, [activeId]);

	useEffect(() => {
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
					if (filteredTasks.length === 0) return;
					e.preventDefault();
					const idx = activeId !== undefined ? filteredTasks.findIndex((t) => t.id === activeId) : -1;
					const next = filteredTasks[Math.min(filteredTasks.length - 1, idx + 1)];
					if (next) handleTaskClick(next);
					return;
				}
				case "p":
				case "P": {
					if (filteredTasks.length === 0) return;
					e.preventDefault();
					const idx = activeId !== undefined ? filteredTasks.findIndex((t) => t.id === activeId) : filteredTasks.length;
					const prev = filteredTasks[Math.max(0, idx - 1)];
					if (prev) handleTaskClick(prev);
					return;
				}
				case "ArrowLeft": {
					if (activeId === undefined) return;
					const idx = openIds.indexOf(activeId);
					if (idx > 0) {
						e.preventDefault();
						setActiveId(openIds[idx - 1]);
					}
					return;
				}
				case "ArrowRight": {
					if (activeId === undefined) return;
					const idx = openIds.indexOf(activeId);
					if (idx >= 0 && idx < openIds.length - 1) {
						e.preventDefault();
						setActiveId(openIds[idx + 1]);
					}
					return;
				}
				case "Escape": {
					if (activeId === undefined) return;
					e.preventDefault();
					handleTabClose(activeId);
					return;
				}
			}
		};
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	});

	return (
		<div className="wwc:space-y-8">
			<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-4">
				<div>
					<h1 className="wwc:text-3xl wwc:font-bold">Task Monitor</h1>
					<p className="wwc:text-muted-foreground wwc:mt-2">
						Triage and resolve tasks. The left panel is a searchable, filterable task list; the middle hosts
						browser-style tabs, a task viewer and a comment composer; the right shows task details and grouped actions.
						Both side panels are collapsible.
					</p>
				</div>
			</div>

			<div className="wwc:overflow-hidden wwc:flex wwc:h-[640px] wwc:rounded-xl wwc:border">
				{/* Left Panel — Task List */}
				<div
					className={cn(
						"wwc:border-r wwc:bg-background wwc:flex-shrink-0 wwc:transition-[width] wwc:duration-200 wwc:ease-in-out wwc:overflow-hidden",
						leftOpen ? "wwc:w-[320px]" : "wwc:w-0 wwc:border-r-0",
					)}
				>
					<div className="wwc:flex wwc:h-full wwc:min-w-[280px] wwc:flex-col">
						<div className="wwc:flex wwc:items-center wwc:justify-between wwc:px-3 wwc:py-3 wwc:border-b">
							<h3 className="wwc:text-sm wwc:font-semibold">Tasks ({tasks.length})</h3>
							<Button
								variant="ghost"
								icon
								className="wwc:h-7 wwc:w-7"
								onClick={() => setLeftOpen(false)}
								aria-label="Collapse list"
							>
								<PanelLeftClose className="wwc:h-4 wwc:w-4" />
							</Button>
						</div>

						<SearchFilterBar
							search={search}
							onSearchChange={setSearch}
							searchPlaceholder="Search tasks..."
							filters={filters}
							activeFilterId={filterId}
							onActiveFilterChange={setFilterId}
							trailing={
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" icon aria-label="List actions">
											<MoreVertical className="wwc:h-4 wwc:w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onSelect={() => setTasks((prev) => prev.filter((t) => t.status !== "done"))}>
											<Archive className="wwc:h-4 wwc:w-4" />
											Archive completed
										</DropdownMenuItem>
										<DropdownMenuItem
											className="wwc:text-destructive wwc:focus:text-destructive"
											onSelect={() => {
												setTasks([]);
												setOpenIds([]);
												setActiveId(undefined);
											}}
										>
											<Trash2 className="wwc:mr-2 wwc:h-4 wwc:w-4" />
											Delete all
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							}
						/>

						<ScrollArea className="wwc:flex-1">
							<div className="wwc:flex wwc:flex-col wwc:gap-2 wwc:p-3">
								{filteredTasks.length === 0 ? (
									<div className="wwc:py-8 wwc:text-center wwc:text-sm wwc:text-muted-foreground">No tasks</div>
								) : (
									filteredTasks.map((task) => {
										const isSelected = task.id === activeId;
										return (
											<button
												key={task.id}
												type="button"
												onClick={() => handleTaskClick(task)}
												className="wwc:text-left wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring wwc:rounded-xl"
											>
												<Card
													className={cn(
														"wwc:p-3 wwc:cursor-pointer wwc:transition-colors wwc:shadow-none",
														isSelected
															? "wwc:border-primary wwc:bg-accent"
															: "wwc:border-border wwc:hover:bg-accent/50",
													)}
												>
													<div className="wwc:flex wwc:items-start wwc:gap-2">
														<div className="wwc:min-w-0 wwc:flex-1">
															<div className="wwc:font-semibold wwc:text-sm wwc:truncate">{task.title}</div>
															<div className="wwc:text-xs wwc:text-muted-foreground wwc:truncate">{task.subtitle}</div>
															<div className="wwc:text-xs wwc:text-muted-foreground wwc:mt-1">
																Updated {task.updatedAt}
															</div>
														</div>
														{task.status === "done" && (
															<Badge variant="secondary" className="wwc:flex-shrink-0">
																Done
															</Badge>
														)}
													</div>
												</Card>
											</button>
										);
									})
								)}
							</div>
						</ScrollArea>
					</div>
				</div>

				{/* Middle Panel — Task Viewer */}
				<div className="wwc:flex wwc:flex-1 wwc:flex-col wwc:bg-muted/30 wwc:min-w-0">
					{(!leftOpen || !rightOpen) && (
						<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:bg-background wwc:px-3 wwc:py-1">
							{!leftOpen && (
								<Button
									variant="ghost"
									icon
									className="wwc:h-7 wwc:w-7 wwc:flex-shrink-0"
									onClick={() => setLeftOpen(true)}
									aria-label="Open list"
								>
									<PanelLeftOpen className="wwc:h-4 wwc:w-4" />
								</Button>
							)}
							<div className="wwc:flex-1" />
							{!rightOpen && (
								<Button
									variant="ghost"
									icon
									className="wwc:h-7 wwc:w-7 wwc:flex-shrink-0"
									onClick={() => setRightOpen(true)}
									aria-label="Open actions"
								>
									<PanelRightOpen className="wwc:h-4 wwc:w-4" />
								</Button>
							)}
						</div>
					)}

					{tabs.length > 0 ? (
						<BrowserTabs
							tabs={tabs}
							activeId={activeId}
							onActiveChange={setActiveId}
							onTabClose={handleTabClose}
							closeable
						/>
					) : (
						<div className="wwc:h-9 wwc:shrink-0" aria-hidden />
					)}

					<div className="wwc:flex wwc:flex-1 wwc:min-h-0 wwc:flex-col wwc:bg-background">
						<div className="wwc:flex-1 wwc:min-h-0 wwc:overflow-auto">
							{active ? (
								<>
									<div className="wwc:p-6 wwc:space-y-3">
										<div className="wwc:flex wwc:items-center wwc:gap-2">
											<h2 className="wwc:text-base wwc:font-semibold">{active.title}</h2>
											<Badge variant={active.status === "done" ? "secondary" : "default"}>
												{active.status === "done" ? "Done" : "Open"}
											</Badge>
										</div>
										<p className="wwc:text-sm wwc:text-muted-foreground">{active.subtitle}</p>
										<p className="wwc:text-sm">
											Detailed task description, attachments, timeline, and any other content the consumer wants to
											embed renders here. The middle panel body is fully owned by the consumer.
										</p>
									</div>
									<div className="wwc:border-t wwc:bg-muted/20 wwc:px-4 wwc:py-4">
										<CommentThread
											comments={commentsByTask[active.id] ?? []}
											composerPosition="top"
											composer={
												<InlineCommentComposer
													value={comment}
													onChange={setComment}
													onSubmit={handleCommentSubmit}
													placeholder="Add a comment..."
													flagged={commentFlagged}
													onFlaggedChange={setCommentFlagged}
													date={commentDate}
													onDateChange={setCommentDate}
													onAddImage={() => undefined}
													onAddMention={() => undefined}
												/>
											}
											emptyState={null}
										/>
									</div>
								</>
							) : (
								<EmptyTaskViewer />
							)}
						</div>
					</div>
				</div>

				{/* Right Panel — Actions */}
				<div
					className={cn(
						"wwc:border-l wwc:bg-background wwc:flex-shrink-0 wwc:transition-[width] wwc:duration-200 wwc:ease-in-out wwc:overflow-hidden",
						rightOpen ? "wwc:w-[320px]" : "wwc:w-0 wwc:border-l-0",
					)}
				>
					<div className="wwc:flex wwc:h-full wwc:min-w-[280px] wwc:flex-col">
						<div className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-2 wwc:px-3 wwc:py-3 wwc:border-b">
							<div className="wwc:flex wwc:flex-col wwc:min-w-0">
								<h3 className="wwc:text-sm wwc:font-semibold wwc:truncate">{active?.title ?? "Actions"}</h3>
								{active && <p className="wwc:text-xs wwc:text-muted-foreground wwc:truncate">{active.subtitle}</p>}
							</div>
							<Button
								variant="ghost"
								icon
								className="wwc:h-7 wwc:w-7 wwc:flex-shrink-0"
								onClick={() => setRightOpen(false)}
								aria-label="Collapse actions"
							>
								<PanelRightClose className="wwc:h-4 wwc:w-4" />
							</Button>
						</div>

						<div className="wwc:flex-1 wwc:overflow-auto wwc:px-3 wwc:py-2">
							{active ? (
								<div className="wwc:divide-y">
									<DetailRow label="Assignee" value={active.assignee} />
									<DetailRow
										label="Status"
										value={
											<Badge variant={active.status === "done" ? "secondary" : "default"}>
												{active.status === "done" ? "Done" : "Open"}
											</Badge>
										}
									/>
									<DetailRow
										label="Priority"
										value={<Badge variant={priorityVariant(active.priority)}>{active.priority}</Badge>}
									/>
									<DetailRow label="Updated" value={active.updatedAt} />
								</div>
							) : (
								<p className="wwc:text-sm wwc:text-muted-foreground">Select a task to view actions.</p>
							)}
						</div>

						{active && (
							<div className="wwc:flex wwc:flex-wrap wwc:justify-end wwc:gap-2 wwc:border-t wwc:p-3">
								<Button variant="outline" size="sm" onClick={() => console.log("snooze", active.id)}>
									Snooze
								</Button>
								<Button variant="destructive" size="sm" onClick={() => deleteTask(active.id)}>
									<Trash2 className="wwc:h-4 wwc:w-4" />
									Delete
								</Button>
								<Button size="sm" onClick={() => togglePriority(active.id, active.status === "done" ? "open" : "done")}>
									<CheckCircle2 className="wwc:h-4 wwc:w-4" />
									{active.status === "done" ? "Reopen" : "Mark complete"}
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
