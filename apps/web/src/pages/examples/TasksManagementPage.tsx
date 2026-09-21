import {format} from "date-fns";
import {CalendarDays, LayoutGrid, Minimize2, Plus} from "lucide-react";
import {useMemo, useState} from "react";

import {Button} from "@/components/ui/button";
import {CalendarView, type CalendarEvent, type CalendarEventTone} from "@/components/ui/calendar-view";
import {CopyButton} from "@/components/ui/copy-button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {
	WorkItemCard,
	type WorkItemAssignee,
	type WorkItemLabel,
	type WorkItemPriority,
	type WorkItemStatus,
} from "@/components/ui/work-item-card";

// ---- Unified Task model ----

type Task = {
	id: string;
	identifier: string;
	title: string;
	status: WorkItemStatus;
	priority?: WorkItemPriority;
	startDate?: Date;
	dueDate?: Date;
	assignees?: WorkItemAssignee[];
	labels?: WorkItemLabel[];
	subIssueCount?: number;
};

const A: Record<string, WorkItemAssignee> = {
	A: {id: "A", name: "Ahmed R.", tone: "success"},
	J: {id: "J", name: "John D.", tone: "success"},
	T: {id: "T", name: "Tarek M.", tone: "success"},
	M: {id: "M", name: "Maya K.", tone: "primary"},
	L: {id: "L", name: "Layla N.", tone: "warning"},
};

const today = new Date(2025, 7, 26); // Aug 26, 2025 — matches the CalendarView screenshot
const D = (m: number, d: number) => new Date(2025, m, d);

const initialTasks: Task[] = [
	{
		id: "AS123-4",
		identifier: "AS123-4",
		title: "3. Create and assign Work Items ✏️",
		status: "backlog",
		startDate: D(5, 26),
		dueDate: D(5, 27),
		labels: [{id: "l1", name: "concepts", tone: "primary"}],
	},
	{
		id: "AS123-5",
		identifier: "AS123-5",
		title: "4. Visualize your work 🌐",
		status: "backlog",
		subIssueCount: 2,
	},
	{
		id: "AS123-7",
		identifier: "AS123-7",
		title: "6. Customize your settings ⚙️",
		status: "backlog",
		startDate: D(7, 24),
		dueDate: D(7, 25),
	},
	{
		id: "AS123-14",
		identifier: "AS123-14",
		title: "Work Item 1",
		status: "backlog",
		startDate: D(6, 29),
		dueDate: D(6, 29),
	},
	{
		id: "AS123-15",
		identifier: "AS123-15",
		title: "ee",
		status: "backlog",
		startDate: D(7, 12),
		dueDate: D(7, 13),
	},
	{
		id: "AS123-17",
		identifier: "AS123-17",
		title: "Bug V.2",
		status: "todo",
		priority: "low",
		dueDate: D(7, 8),
		assignees: [A.A],
	},
	{
		id: "AS123-18",
		identifier: "AS123-18",
		title: "Bug V.3",
		status: "todo",
		priority: "low",
		dueDate: D(7, 14),
		assignees: [A.J],
	},
	{
		id: "AS123-19",
		identifier: "AS123-19",
		title: "Upload Feature",
		status: "todo",
		priority: "medium",
		dueDate: D(7, 20),
		assignees: [A.T],
	},
	{
		id: "AS123-20",
		identifier: "AS123-20",
		title: "Bug Fixing",
		status: "todo",
		priority: "medium",
		dueDate: D(7, 22),
		assignees: [A.M],
		labels: [{id: "l1", name: "concepts", tone: "primary"}],
	},
	{
		id: "ASMOB-11",
		identifier: "ASMOB-11",
		title: "ASMobbin Official (copy)",
		status: "in-progress",
		priority: "high",
		startDate: D(7, 14),
		dueDate: D(7, 28),
		assignees: [A.L],
		labels: [{id: "l1", name: "admin", tone: "info"}],
	},
	{
		id: "AS123-1",
		identifier: "AS123-1",
		title: "Welcome to Plane 👋",
		status: "in-progress",
		startDate: D(7, 3),
		dueDate: D(7, 4),
	},
	{
		id: "ASMOB-8",
		identifier: "ASMOB-8",
		title: "ASMobbin Official",
		status: "done",
		dueDate: D(7, 28),
		labels: [
			{id: "l1", name: "Bugs list", tone: "danger"},
			{id: "l2", name: "1", tone: "primary"},
		],
	},
	{
		id: "AS123-8",
		identifier: "AS123-8",
		title: "Develop a Mobile App",
		status: "done",
		dueDate: D(7, 10),
		labels: [
			{id: "l1", name: "Bugs list", tone: "danger"},
			{id: "l2", name: "admin", tone: "info"},
		],
	},
	{
		id: "AS123-12",
		identifier: "AS123-12",
		title: "Work Item 1",
		status: "done",
		dueDate: D(7, 1),
	},
];

// ---- Adapters ----

function formatDateRange(start?: Date, end?: Date): {start: string; end: string} | undefined {
	if (!end) return undefined;
	if (!start || start.getTime() === end.getTime()) {
		return {start: format(end, "MMM d"), end: format(end, "MMM d, yyyy")};
	}
	return {start: format(start, "MMM d"), end: format(end, "d, yyyy")};
}

function priorityToEventTone(p?: WorkItemPriority): CalendarEventTone {
	if (p === "urgent") return "danger";
	if (p === "high") return "warning";
	if (p === "medium") return "info";
	if (p === "low") return "neutral";
	return "neutral";
}

function statusToEventTone(status: WorkItemStatus): CalendarEventTone {
	if (status === "done") return "success";
	if (status === "in-progress") return "warning";
	if (status === "cancelled") return "danger";
	return "neutral";
}

function tasksToCalendarEvents(tasks: Task[]): CalendarEvent[] {
	return tasks
		.filter((t) => !!t.dueDate)
		.map((t) => ({
			id: t.id,
			date: t.dueDate!,
			identifier: t.identifier,
			title: t.title,
			tone: t.priority ? priorityToEventTone(t.priority) : statusToEventTone(t.status),
		}));
}

// ---- Kanban view ----

type ColumnDef = {id: WorkItemStatus; label: string; indicator: React.ReactNode};

const kanbanColumns: ColumnDef[] = [
	{
		id: "backlog",
		label: "Backlog",
		indicator: (
			<span className="wwc:flex wwc:h-4 wwc:w-4 wwc:items-center wwc:justify-center wwc:rounded-full wwc:border-2 wwc:border-dashed wwc:border-muted-foreground/50" />
		),
	},
	{
		id: "todo",
		label: "Todo",
		indicator: (
			<span className="wwc:flex wwc:h-4 wwc:w-4 wwc:items-center wwc:justify-center wwc:rounded-full wwc:border-2 wwc:border-muted-foreground/70" />
		),
	},
	{
		id: "in-progress",
		label: "In Progress",
		indicator: (
			<span className="wwc:relative wwc:flex wwc:h-4 wwc:w-4 wwc:items-center wwc:justify-center wwc:rounded-full wwc:border-2 wwc:border-amber-500">
				<span className="wwc:h-1.5 wwc:w-1.5 wwc:rounded-full wwc:bg-amber-500" />
			</span>
		),
	},
	{
		id: "done",
		label: "Done",
		indicator: (
			<span className="wwc:flex wwc:h-4 wwc:w-4 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-emerald-500">
				<svg
					viewBox="0 0 12 12"
					className="wwc:h-2.5 wwc:w-2.5 wwc:text-white"
					fill="none"
					stroke="currentColor"
					strokeWidth={3}
				>
					<path d="M2.5 6.5L5 9L9.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</span>
		),
	},
];

function KanbanColumn({
	column,
	tasks,
	collapsed,
	onCollapse,
	onSelectTask,
}: {
	column: ColumnDef;
	tasks: Task[];
	collapsed: boolean;
	onCollapse: () => void;
	onSelectTask: (id: string) => void;
}) {
	return (
		<div
			style={{width: collapsed ? "3rem" : "21.25rem"}}
			className="wwc:flex wwc:flex-col wwc:flex-shrink-0 wwc:rounded-lg wwc:bg-muted/40 wwc:transition-[width] wwc:duration-200"
		>
			<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:px-3 wwc:py-2.5">
				{column.indicator}
				{!collapsed ? (
					<>
						<span className="wwc:text-sm wwc:font-semibold wwc:text-foreground">{column.label}</span>
						<span className="wwc:text-xs wwc:text-muted-foreground">{tasks.length}</span>
						<div className="wwc:flex-1" />
						<Button variant="ghost" icon className="wwc:h-7 wwc:w-7" onClick={onCollapse} aria-label="Collapse column">
							<Minimize2 className="wwc:h-3.5 wwc:w-3.5" />
						</Button>
						<Button variant="ghost" icon className="wwc:h-7 wwc:w-7" aria-label="Add work item">
							<Plus className="wwc:h-4 wwc:w-4" />
						</Button>
					</>
				) : (
					<Button variant="ghost" icon className="wwc:h-7 wwc:w-7" onClick={onCollapse} aria-label="Expand column">
						<Plus className="wwc:h-4 wwc:w-4" />
					</Button>
				)}
			</div>
			{!collapsed && (
				<>
					<ScrollArea className="wwc:flex-1 wwc:px-2">
						<div className="wwc:flex wwc:flex-col wwc:gap-2 wwc:py-1 wwc:pb-2">
							{tasks.map((t) => (
								<WorkItemCard
									key={t.id}
									identifier={t.identifier}
									title={t.title}
									status={t.status}
									priority={t.priority}
									dateRange={formatDateRange(t.startDate, t.dueDate)}
									isOverdue={!!t.dueDate && t.status !== "done" && t.dueDate.getTime() < today.getTime()}
									assignees={t.assignees}
									labels={t.labels}
									subIssueCount={t.subIssueCount}
									onClick={() => onSelectTask(t.id)}
								/>
							))}
						</div>
					</ScrollArea>
					<button
						type="button"
						className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:px-3 wwc:py-2.5 wwc:text-sm wwc:text-muted-foreground wwc:transition-colors wwc:hover:bg-accent/40 wwc:hover:text-foreground"
					>
						<Plus className="wwc:h-4 wwc:w-4" />
						New Work item
					</button>
				</>
			)}
		</div>
	);
}

// ---- Page ----

type ViewMode = "kanban" | "calendar";

export function TasksManagementPage() {
	const [tasks] = useState<Task[]>(initialTasks);
	const [view, setView] = useState<ViewMode>("kanban");
	const [collapsed, setCollapsed] = useState<Record<WorkItemStatus, boolean>>({
		backlog: false,
		todo: false,
		"in-progress": false,
		done: false,
		cancelled: false,
	});
	const [, setSelectedId] = useState<string | undefined>();

	const tasksByStatus = useMemo(() => {
		const map = new Map<WorkItemStatus, Task[]>();
		for (const col of kanbanColumns) map.set(col.id, []);
		for (const t of tasks) map.get(t.status)?.push(t);
		return map;
	}, [tasks]);

	const calendarEvents = useMemo(() => tasksToCalendarEvents(tasks), [tasks]);

	return (
		<div className="wwc:space-y-6">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Tasks Management</h1>
					<CopyButton
						value="Tasks Management"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:text-muted-foreground">
					Unified task management example with two views over the same task list. Switch between the Kanban board
					(grouped by status) and the Calendar (anchored on due date) using the toggle in the toolbar.
				</p>
			</div>

			{/* Toolbar with view switcher */}
			<div className="wwc:flex wwc:items-center wwc:gap-3 wwc:rounded-lg wwc:border wwc:border-border wwc:bg-background wwc:px-3 wwc:py-2">
				<span className="wwc:text-sm wwc:font-semibold wwc:text-foreground">{tasks.length} tasks</span>
				<div className="wwc:flex-1" />
				<span className="wwc:text-xs wwc:text-muted-foreground">View</span>
				<ToggleGroup
					type="single"
					value={view}
					onValueChange={(v) => v && setView(v as ViewMode)}
					variant="outline"
					size="sm"
				>
					<ToggleGroupItem value="kanban" aria-label="Kanban view" title="Kanban view">
						<LayoutGrid className="wwc:h-4 wwc:w-4" />
					</ToggleGroupItem>
					<ToggleGroupItem value="calendar" aria-label="Calendar view" title="Calendar view">
						<CalendarDays className="wwc:h-4 wwc:w-4" />
					</ToggleGroupItem>
				</ToggleGroup>
			</div>

			{/* Active view */}
			{view === "kanban" ? (
				<div
					style={{height: "720px", overflow: "auto"}}
					className="wwc:rounded-xl wwc:border wwc:border-border wwc:bg-background"
				>
					<div style={{width: "max-content", minWidth: "100%"}} className="wwc:flex wwc:h-full wwc:gap-3 wwc:p-3">
						{kanbanColumns.map((col) => (
							<KanbanColumn
								key={col.id}
								column={col}
								tasks={tasksByStatus.get(col.id) ?? []}
								collapsed={collapsed[col.id]}
								onCollapse={() => setCollapsed((prev) => ({...prev, [col.id]: !prev[col.id]}))}
								onSelectTask={setSelectedId}
							/>
						))}
					</div>
				</div>
			) : (
				<CalendarView
					defaultMonth={today}
					today={today}
					events={calendarEvents}
					onEventClick={(ev) => setSelectedId(ev.id)}
					onAddItem={() => {}}
				/>
			)}
		</div>
	);
}
