import {AlertTriangle, Archive, Bell, CheckCircle2, Trash2, X} from "lucide-react";
import {useState} from "react";

import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import type {SearchFilterBarFilter} from "@/components/ui/search-filter-bar";
import {TaskMonitor, type TaskMonitorItem} from "@/components/ui/task-monitor";

function Frame({children}: {children: React.ReactNode}) {
	return <div className="wwc:h-[640px] wwc:w-full wwc:border wwc:rounded-lg wwc:overflow-hidden">{children}</div>;
}

function DetailRow({label, value}: {label: string; value: React.ReactNode}) {
	return (
		<div className="wwc:flex wwc:justify-between wwc:gap-3 wwc:text-sm wwc:py-1.5">
			<span className="wwc:text-muted-foreground">{label}</span>
			<span className="wwc:font-medium wwc:text-right">{value}</span>
		</div>
	);
}

const defaultItems: TaskMonitorItem[] = [
	{id: "1", title: "Finalize Q3 schedule", subtitle: "Updated 2h ago"},
	{id: "2", title: "Review safety report", subtitle: "Updated yesterday"},
	{id: "3", title: "Prepare budget overview", subtitle: "Updated 3d ago"},
];

function DefaultExample() {
	const [search, setSearch] = useState("");
	const [openIds, setOpenIds] = useState<string[]>([]);
	const [activeId, setActiveId] = useState<string | undefined>();

	const filtered = defaultItems.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()));

	return (
		<Frame>
			<TaskMonitor
				items={filtered}
				search={search}
				onSearchChange={setSearch}
				searchPlaceholder="Search items..."
				openItemIds={openIds}
				activeItemId={activeId}
				onActiveItemChange={setActiveId}
				onItemOpen={(id) => setOpenIds((prev) => (prev.includes(id) ? prev : [...prev, id]))}
				onItemClose={(id) => {
					setOpenIds((prev) => prev.filter((x) => x !== id));
					setActiveId((curr) => {
						if (curr !== id) return curr;
						const remaining = openIds.filter((x) => x !== id);
						return remaining[remaining.length - 1];
					});
				}}
				renderItemBody={(item) => (
					<div className="wwc:p-6">
						<h3 className="wwc:text-base wwc:font-semibold">{item.title}</h3>
						<p className="wwc:text-sm wwc:text-muted-foreground wwc:mt-1">{item.subtitle}</p>
						<p className="wwc:text-sm wwc:mt-4">
							Body content for this item. Consumers control everything inside the panel.
						</p>
					</div>
				)}
			/>
		</Frame>
	);
}

type Task = TaskMonitorItem & {
	status: "open" | "done";
	assignee: string;
	priority: "Low" | "Medium" | "High";
};

const tasks: Task[] = [
	{
		id: "t-1",
		title: "Wire up tower 3 power",
		subtitle: "Site B • Electrical",
		status: "open",
		assignee: "Layla N.",
		priority: "High",
	},
	{
		id: "t-2",
		title: "Inspect crane #2 cabling",
		subtitle: "Site A • Inspection",
		status: "open",
		assignee: "Ahmed R.",
		priority: "Medium",
	},
	{
		id: "t-3",
		title: "Submit weekly headcount",
		subtitle: "Admin • Reporting",
		status: "done",
		assignee: "Maya K.",
		priority: "Low",
	},
];

const taskFilters: SearchFilterBarFilter[] = [
	{id: "all", label: "All", count: tasks.length},
	{id: "open", label: "Open", count: tasks.filter((t) => t.status === "open").length},
	{id: "done", label: "Done", count: tasks.filter((t) => t.status === "done").length},
];

function TasksExample() {
	const [search, setSearch] = useState("");
	const [filterId, setFilterId] = useState<string | undefined>("all");
	const [openIds, setOpenIds] = useState<string[]>(["t-1"]);
	const [activeId, setActiveId] = useState<string | undefined>("t-1");
	const [items, setItems] = useState<Task[]>(tasks);

	const filtered = items.filter((t) => {
		if (filterId === "open" && t.status !== "open") return false;
		if (filterId === "done" && t.status !== "done") return false;
		return t.title.toLowerCase().includes(search.toLowerCase());
	});

	const active = items.find((t) => t.id === activeId);

	return (
		<Frame>
			<TaskMonitor
				items={filtered}
				listTitle="Tasks"
				search={search}
				onSearchChange={setSearch}
				searchPlaceholder="Search tasks..."
				filters={taskFilters}
				activeFilterId={filterId}
				onActiveFilterChange={setFilterId}
				listActions={[
					{
						id: "archive-done",
						label: "Archive completed",
						icon: <Archive className="wwc:h-4 wwc:w-4" />,
						onSelect: () => setItems((prev) => prev.filter((t) => t.status !== "done")),
					},
					{
						id: "clear",
						label: "Delete all",
						icon: <Trash2 className="wwc:h-4 wwc:w-4" />,
						tone: "destructive",
						onSelect: () => setItems([]),
					},
				]}
				openItemIds={openIds}
				activeItemId={activeId}
				onActiveItemChange={setActiveId}
				onItemOpen={(id) => setOpenIds((prev) => (prev.includes(id) ? prev : [...prev, id]))}
				onItemClose={(id) => {
					setOpenIds((prev) => prev.filter((x) => x !== id));
					setActiveId((curr) => {
						if (curr !== id) return curr;
						const remaining = openIds.filter((x) => x !== id);
						return remaining[remaining.length - 1];
					});
				}}
				renderItemBody={(item) => {
					const t = items.find((x) => x.id === item.id);
					return (
						<div className="wwc:p-6 wwc:space-y-3">
							<div className="wwc:flex wwc:items-center wwc:gap-2">
								<h3 className="wwc:text-base wwc:font-semibold">{item.title}</h3>
								{t && (
									<Badge variant={t.status === "done" ? "secondary" : "default"}>
										{t.status === "done" ? "Done" : "Open"}
									</Badge>
								)}
							</div>
							<p className="wwc:text-sm wwc:text-muted-foreground">{item.subtitle}</p>
						</div>
					);
				}}
				commentPlaceholder="Comment on this task…"
				onCommentSubmit={(item, submission) => console.log("comment", item.id, submission)}
				actionPanelTitle={active?.title}
				actionPanelDescription={active?.subtitle}
				renderActionDetails={(item) => {
					const t = items.find((x) => x.id === item.id);
					if (!t) return null;
					return (
						<div className="wwc:divide-y">
							<DetailRow label="Assignee" value={t.assignee} />
							<DetailRow
								label="Status"
								value={
									<Badge variant={t.status === "done" ? "secondary" : "default"}>
										{t.status === "done" ? "Done" : "Open"}
									</Badge>
								}
							/>
							<DetailRow label="Priority" value={<Badge variant="secondary">{t.priority}</Badge>} />
						</div>
					);
				}}
				primaryAction={
					active
						? {
								id: "complete",
								label: active.status === "done" ? "Reopen" : "Mark complete",
								icon: <CheckCircle2 className="wwc:h-4 wwc:w-4" />,
								onSelect: () => {
									setItems((prev) =>
										prev.map((t) => (t.id === active.id ? {...t, status: t.status === "done" ? "open" : "done"} : t)),
									);
								},
							}
						: undefined
				}
				secondaryActions={
					active
						? [
								{
									id: "delete",
									label: "Delete",
									tone: "destructive",
									icon: <Trash2 className="wwc:h-4 wwc:w-4" />,
									onSelect: () => {
										setItems((prev) => prev.filter((t) => t.id !== active.id));
										setOpenIds((prev) => prev.filter((id) => id !== active.id));
										setActiveId(undefined);
									},
								},
							]
						: undefined
				}
			/>
		</Frame>
	);
}

type Alert = TaskMonitorItem & {severity: "low" | "medium" | "high" | "critical"};

const alerts: Alert[] = [
	{id: "a-1", title: "Battery critical: Device 0042", subtitle: "Tower 3 • 8% remaining", severity: "critical"},
	{id: "a-2", title: "Geofence breach detected", subtitle: "Crew 7 • 12 minutes ago", severity: "high"},
	{id: "a-3", title: "Sensor offline > 30 min", subtitle: "Sensor S-19", severity: "medium"},
];

const severityVariant: Record<Alert["severity"], "default" | "secondary" | "destructive"> = {
	low: "secondary",
	medium: "secondary",
	high: "default",
	critical: "destructive",
};

function AlertsExample() {
	const [search, setSearch] = useState("");
	const [openIds, setOpenIds] = useState<string[]>(["a-1"]);
	const [activeId, setActiveId] = useState<string | undefined>("a-1");
	const [items, setItems] = useState<Alert[]>(alerts);

	const filtered = items.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()));
	const active = items.find((a) => a.id === activeId);

	return (
		<Frame>
			<TaskMonitor
				items={filtered}
				listTitle="Alerts"
				search={search}
				onSearchChange={setSearch}
				searchPlaceholder="Search alerts..."
				openItemIds={openIds}
				activeItemId={activeId}
				onActiveItemChange={setActiveId}
				onItemOpen={(id) => setOpenIds((prev) => (prev.includes(id) ? prev : [...prev, id]))}
				onItemClose={(id) => {
					setOpenIds((prev) => prev.filter((x) => x !== id));
					setActiveId((curr) => {
						if (curr !== id) return curr;
						const remaining = openIds.filter((x) => x !== id);
						return remaining[remaining.length - 1];
					});
				}}
				renderListRow={(item, isSelected) => {
					const a = items.find((x) => x.id === item.id);
					return (
						<div
							className={`wwc:rounded-xl wwc:border wwc:p-3 wwc:cursor-pointer wwc:transition-colors ${
								isSelected ? "wwc:border-primary wwc:bg-accent" : "wwc:border-border wwc:hover:bg-accent/50"
							}`}
						>
							<div className="wwc:flex wwc:items-start wwc:gap-2">
								<AlertTriangle
									className={`wwc:h-4 wwc:w-4 wwc:mt-0.5 ${
										a?.severity === "critical" ? "wwc:text-destructive" : "wwc:text-muted-foreground"
									}`}
								/>
								<div className="wwc:min-w-0 wwc:flex-1">
									<div className="wwc:font-semibold wwc:text-sm wwc:truncate">{item.title}</div>
									<div className="wwc:text-xs wwc:text-muted-foreground wwc:truncate">{item.subtitle}</div>
								</div>
								{a && (
									<Badge variant={severityVariant[a.severity]} className="wwc:capitalize">
										{a.severity}
									</Badge>
								)}
							</div>
						</div>
					);
				}}
				renderItemBody={(item) => (
					<div className="wwc:p-6 wwc:space-y-3">
						<div className="wwc:flex wwc:items-center wwc:gap-2">
							<Bell className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
							<h3 className="wwc:text-base wwc:font-semibold">{item.title}</h3>
						</div>
						<p className="wwc:text-sm wwc:text-muted-foreground">{item.subtitle}</p>
					</div>
				)}
				actionPanelTitle={active?.title}
				actionPanelDescription={active?.subtitle}
				renderActionDetails={(item) => {
					const a = items.find((x) => x.id === item.id);
					if (!a) return null;
					return (
						<div className="wwc:divide-y">
							<DetailRow
								label="Severity"
								value={
									<Badge variant={severityVariant[a.severity]} className="wwc:capitalize">
										{a.severity}
									</Badge>
								}
							/>
							<DetailRow label="Source" value={a.subtitle} />
						</div>
					);
				}}
				primaryAction={
					active
						? {
								id: "ack",
								label: "Acknowledge",
								icon: <CheckCircle2 className="wwc:h-4 wwc:w-4" />,
								onSelect: () => console.log("ack", active.id),
							}
						: undefined
				}
				secondaryActions={
					active
						? [
								{
									id: "dismiss",
									label: "Dismiss",
									tone: "destructive",
									icon: <X className="wwc:h-4 wwc:w-4" />,
									onSelect: () => {
										setItems((prev) => prev.filter((a) => a.id !== active.id));
										setOpenIds((prev) => prev.filter((id) => id !== active.id));
										setActiveId(undefined);
									},
								},
							]
						: undefined
				}
			/>
		</Frame>
	);
}

export function TaskMonitorPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Task Monitor</h1>
					<CopyButton
						value="Task Monitor"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					A generic 3-panel monitoring shell: a left list (with search + filters + optional kebab actions), a middle
					tabbed work surface with a comment composer, and a right action panel that opens when an item is selected.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Task Monitor - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Minimum API: items, search, open/active state, and an item body renderer.</CardDescription>
				</CardHeader>
				<CardContent>
					<DefaultExample />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Tasks</CardTitle>
						<CopyButton
							value="Task Monitor - Tasks"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Tasks with filters, list actions, comment composer, action panel details, primary + secondary actions.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<TasksExample />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Alerts</CardTitle>
						<CopyButton
							value="Task Monitor - Alerts"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Custom list row rendering via renderListRow for severity-aware cards.</CardDescription>
				</CardHeader>
				<CardContent>
					<AlertsExample />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Composition</CardTitle>
						<CopyButton
							value="Task Monitor - Composition"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						TaskMonitor is a controlled shell. All state lives in your component — items, search, filter, open tabs,
						active id, etc. Hook into{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">renderItemBody</code>,{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">renderActionDetails</code>,{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">renderListRow</code> to inject your own
						visuals.
					</CardDescription>
				</CardHeader>
				<CardContent />
			</Card>
		</div>
	);
}
