import {LayoutGrid, Plus, Table, Workflow} from "lucide-react";
import {useState} from "react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {ViewTabBar, type ViewTabItem} from "@/components/ui/view-tab-bar";
import type {WeekSelectorWeek} from "@/components/ui/week-selector";

type BasicTab = "assign" | "table";
const BASIC_TABS: readonly ViewTabItem<BasicTab>[] = [
	{id: "assign", label: "Assign", icon: Workflow, description: "Link items to locations."},
	{id: "table", label: "Table", icon: Table},
];

type CountTab = "all" | "open" | "done";
const COUNT_TABS: readonly ViewTabItem<CountTab>[] = [
	{id: "all", label: "All", badge: 24},
	{id: "open", label: "Open", badge: 18, description: "Items still in progress."},
	{id: "done", label: "Done", badge: 6},
];

type ViewTab = "board" | "table" | "flow";
const VIEW_TABS: readonly ViewTabItem<ViewTab>[] = [
	{id: "board", label: "Board", icon: LayoutGrid, description: "Kanban-style grouped cards."},
	{id: "table", label: "Table", icon: Table, description: "Dense rows with sortable columns."},
	{id: "flow", label: "Flow", icon: Workflow, description: "Dependency graph view."},
];

type ModeTab = "collection" | "comparison";
const MODE_TABS: readonly ViewTabItem<ModeTab>[] = [
	{id: "collection", label: "Collection"},
	{id: "comparison", label: "Comparison"},
];

const MODE_WEEKS: WeekSelectorWeek[] = [
	{value: "W111", label: "111", start: new Date(2026, 5, 26), end: new Date(2026, 6, 2)},
	{value: "W112", label: "112", start: new Date(2026, 6, 3), end: new Date(2026, 6, 9)},
	{value: "W113", label: "113", start: new Date(2026, 6, 10), end: new Date(2026, 6, 16)},
	{value: "W114", label: "114", start: new Date(2026, 6, 17), end: new Date(2026, 6, 23)},
	{value: "W115", label: "115", start: new Date(2026, 6, 24), end: new Date(2026, 6, 30)},
];

export function ViewTabBarPage() {
	const [basic, setBasic] = useState<BasicTab>("assign");
	const [count, setCount] = useState<CountTab>("all");
	const [view, setView] = useState<ViewTab>("board");
	const [mode, setMode] = useState<ModeTab>("collection");
	const [period, setPeriod] = useState("W113");

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">View Tab Bar</h1>
					<CopyButton
						value="View Tab Bar"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:text-muted-foreground">
					Generic underline-style tab bar. Type-parameterized over the tab id union so{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">activeTab</code> and{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">onTabChange</code> stay type-safe. Each tab
					can carry an icon, a trailing badge, and a hover tooltip. Tabs sit bottom-flush on the parent row's{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">border-b</code>.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="View Tab Bar - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Icon + label tabs. The <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">Assign</code> tab has
						a hover tooltip from its <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">description</code>.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:min-h-12 wwc:items-end wwc:justify-between wwc:border-b wwc:px-3">
						<ViewTabBar tabs={BASIC_TABS} activeTab={basic} onTabChange={setBasic} />
						<Button size="sm" variant="outline" className="wwc:mb-1.5">
							<Plus /> New
						</Button>
					</div>
					<p className="wwc:mt-3 wwc:text-xs wwc:text-muted-foreground">
						Active: <code className="wwc:rounded wwc:bg-muted wwc:px-1">{basic}</code>
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With badges</CardTitle>
						<CopyButton
							value="View Tab Bar - With badges"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Pass <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">badge</code> to render a muted count
						after the label — useful for filter counts.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:min-h-12 wwc:items-end wwc:border-b wwc:px-3">
						<ViewTabBar tabs={COUNT_TABS} activeTab={count} onTabChange={setCount} />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>View switcher</CardTitle>
						<CopyButton
							value="View Tab Bar - View switcher"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Every tab has a tooltip describing the view it switches to.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:min-h-12 wwc:items-end wwc:border-b wwc:px-3">
						<ViewTabBar tabs={VIEW_TABS} activeTab={view} onTabChange={setView} />
					</div>
					<div className="wwc:mt-4 wwc:rounded-lg wwc:border wwc:border-dashed wwc:p-6 wwc:text-center wwc:text-sm wwc:text-muted-foreground">
						{view === "board" && "Board view content"}
						{view === "table" && "Table view content"}
						{view === "flow" && "Flow view content"}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Segmented toolbar</CardTitle>
						<CopyButton
							value="View Tab Bar - Segmented toolbar"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">variant="segmented"</code> is a full-width
						toolbar that heads the content below it: a pill view-switcher on the left and a built-in{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">weekSelector</code> (period navigation) on
						the right — the two are paired frequently.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-hidden wwc:rounded-lg wwc:border">
						<div className="wwc:border-b wwc:bg-background wwc:px-4 wwc:py-2">
							<ViewTabBar
								variant="segmented"
								tabs={MODE_TABS}
								activeTab={mode}
								onTabChange={setMode}
								weekSelector={{
									weeks: MODE_WEEKS,
									value: period,
									onValueChange: setPeriod,
									visibleCount: 5,
								}}
							/>
						</div>
						<div className="wwc:flex wwc:h-40 wwc:items-center wwc:justify-center wwc:bg-muted/30 wwc:text-sm wwc:text-muted-foreground">
							{mode === "collection" ? "Collection" : "Comparison"} content for {period}
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="View Tab Bar - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:overflow-x-auto wwc:rounded-lg wwc:bg-muted wwc:p-4 wwc:text-sm">
						{`import { Table, Workflow } from "lucide-react";
import { ViewTabBar, type ViewTabItem } from "@/components/ui/view-tab-bar";

type Tab = "assign" | "table";
const TABS: readonly ViewTabItem<Tab>[] = [
  { id: "assign", label: "Assign", icon: Workflow, description: "Link items to locations." },
  { id: "table", label: "Table", icon: Table },
];

function Panel() {
  const [tab, setTab] = useState<Tab>("assign");
  return (
    <div className="flex items-end justify-between min-h-12 border-b px-3">
      <ViewTabBar tabs={TABS} activeTab={tab} onTabChange={setTab} />
      {/* right-aligned action button goes here */}
    </div>
  );
}`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
