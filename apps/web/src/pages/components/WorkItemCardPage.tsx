import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {WorkItemCard, type WorkItemAssignee} from "@/components/ui/work-item-card";

const sampleAssignees: WorkItemAssignee[] = [
	{id: "u1", name: "Ahmed R.", tone: "success"},
	{id: "u2", name: "Maya K.", tone: "primary"},
	{id: "u3", name: "John D.", tone: "warning"},
];

const propsTable: {prop: string; type: string; def: string; desc: string}[] = [
	{prop: "identifier", type: "string", def: "—", desc: "Short ID label shown above the title (e.g. AS123-4)."},
	{prop: "title", type: "string", def: "—", desc: "Primary work item title. Renders below the identifier."},
	{
		prop: "status",
		type: '"backlog" | "todo" | "in-progress" | "done" | "cancelled"',
		def: "undefined",
		desc: "Pill in the meta row. Defaults to a placeholder pill if omitted.",
	},
	{
		prop: "priority",
		type: '"none" | "low" | "medium" | "high" | "urgent"',
		def: "undefined",
		desc: "Bars-style icon. Urgent uses the destructive token.",
	},
	{prop: "isBlocked", type: "boolean", def: "false", desc: "Renders the Ban placeholder pill before the date pill."},
	{
		prop: "dateRange",
		type: "{ start: string; end: string }",
		def: "undefined",
		desc: "Calendar pill. Use isOverdue to apply the danger tone.",
	},
	{prop: "isOverdue", type: "boolean", def: "false", desc: "Switches the date pill to the destructive token."},
	{
		prop: "assignees",
		type: "WorkItemAssignee[]",
		def: "[]",
		desc: "Stacked avatars. Up to 3 visible, then a +N counter. Tones map to design tokens.",
	},
	{prop: "subIssueCount", type: "number", def: "0", desc: "Layers pill with a count. Hidden when 0."},
	{prop: "modules", type: "string[]", def: "[]", desc: "Tag-style pills rendered on the second meta row."},
	{
		prop: "labels",
		type: "WorkItemLabel[]",
		def: "[]",
		desc: "Dot + name chips. Tones use design tokens (primary / success / warning / danger / info).",
	},
	{prop: "onClick", type: "() => void", def: "undefined", desc: "When set, the card becomes a focusable button."},
	{prop: "onClearDate", type: "() => void", def: "undefined", desc: "Shows the X clear button on the date pill."},
];

export function WorkItemCardPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Work Item Card</h1>
					<CopyButton
						value="Work Item Card"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:text-muted-foreground">
					Plane-style work item card for kanban / backlog views. Wraps the <code>Card</code> primitive with a typed meta
					row (status, priority, date, assignees, sub-issues, modules, labels). Empty attributes render as icon-only
					placeholder pills so the affordance row is always present.
				</p>
			</div>

			{/* Default */}
			<div>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-4">Default</h2>
				<p className="wwc:text-muted-foreground wwc:mb-4">
					A typical card with an identifier, title, status, an overdue date pill, and a label.
				</p>
				<div className="wwc:max-w-sm">
					<WorkItemCard
						identifier="AS123-4"
						title="3. Create and assign Work Items ✏️"
						status="backlog"
						dateRange={{start: "Jun 26", end: "27, 2025"}}
						isOverdue
						labels={[{id: "l1", name: "concepts", tone: "primary"}]}
					/>
				</div>
			</div>

			{/* Statuses */}
			<div>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-4">Statuses</h2>
				<p className="wwc:text-muted-foreground wwc:mb-4">
					Each status renders a distinct indicator: dashed for backlog, solid outline for todo, amber half-filled for in
					progress, green checkmark for done.
				</p>
				<div className="wwc:grid wwc:grid-cols-1 wwc:sm:grid-cols-2 wwc:gap-3 wwc:max-w-3xl">
					<WorkItemCard identifier="AS123-1" title="Backlog item" status="backlog" />
					<WorkItemCard identifier="AS123-2" title="Todo item" status="todo" />
					<WorkItemCard
						identifier="AS123-3"
						title="In progress item"
						status="in-progress"
						priority="high"
						assignees={[sampleAssignees[0]]}
					/>
					<WorkItemCard
						identifier="AS123-4"
						title="Done item"
						status="done"
						dateRange={{start: "Aug 03", end: "04, 2025"}}
						assignees={sampleAssignees}
					/>
				</div>
			</div>

			{/* Priorities */}
			<div>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-4">Priorities</h2>
				<p className="wwc:text-muted-foreground wwc:mb-4">
					Priority uses ascending bars. Urgent shifts to the destructive token tint.
				</p>
				<div className="wwc:grid wwc:grid-cols-1 wwc:sm:grid-cols-2 wwc:gap-3 wwc:max-w-3xl">
					<WorkItemCard identifier="AS-101" title="Low priority task" status="todo" priority="low" />
					<WorkItemCard identifier="AS-102" title="Medium priority task" status="todo" priority="medium" />
					<WorkItemCard identifier="AS-103" title="High priority task" status="in-progress" priority="high" />
					<WorkItemCard identifier="AS-104" title="Urgent priority task" status="in-progress" priority="urgent" />
				</div>
			</div>

			{/* Fully Populated */}
			<div>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-4">Fully Populated</h2>
				<p className="wwc:text-muted-foreground wwc:mb-4">
					All optional fields supplied, including a stacked assignee group.
				</p>
				<div className="wwc:max-w-sm">
					<WorkItemCard
						identifier="AS123-11"
						title="ASMobbin Official (copy)"
						status="in-progress"
						priority="high"
						dateRange={{start: "Aug 14", end: "28, 2025"}}
						assignees={sampleAssignees}
						subIssueCount={3}
						labels={[{id: "l1", name: "admin", tone: "info"}]}
					/>
				</div>
			</div>

			{/* Blocked */}
			<div>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-4">Blocked</h2>
				<p className="wwc:text-muted-foreground wwc:mb-4">
					When <code>isBlocked</code> is set, the Ban indicator appears in the meta row.
				</p>
				<div className="wwc:max-w-sm">
					<WorkItemCard
						identifier="AS123-9"
						title="Blocked: waiting on vendor approval"
						status="todo"
						isBlocked
						priority="urgent"
						dateRange={{start: "Aug 24", end: "25, 2025"}}
						isOverdue
					/>
				</div>
			</div>

			{/* Props table */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Props</CardTitle>
						<CopyButton
							value="Work Item Card - Props"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-sm">
							<thead>
								<tr className="wwc:border-b wwc:border-border wwc:text-left">
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Prop</th>
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Type</th>
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Default</th>
									<th className="wwc:py-2 wwc:font-semibold">Description</th>
								</tr>
							</thead>
							<tbody>
								{propsTable.map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:font-medium wwc:text-primary wwc:whitespace-nowrap">
											{row.prop}
										</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.type}</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.def}</td>
										<td className="wwc:py-3 wwc:text-muted-foreground">{row.desc}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			{/* Usage */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Work Item Card - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { WorkItemCard } from "@/components/ui/work-item-card";

<WorkItemCard
  identifier="AS123-11"
  title="ASMobbin Official (copy)"
  status="in-progress"
  priority="high"
  dateRange={{ start: "Aug 14", end: "28, 2025" }}
  assignees={[
    { id: "u1", name: "Layla N.", tone: "warning" },
  ]}
  subIssueCount={3}
  labels={[{ id: "l1", name: "admin", tone: "info" }]}
  onClick={() => openItem("AS123-11")}
/>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
