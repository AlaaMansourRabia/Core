import {useState} from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {SetupStepsChecklist, type SetupStep} from "@/components/ui/setup-steps-checklist";

const fullSteps: SetupStep[] = [
	{
		id: "upload",
		label: "Step 1",
		title: "Upload files",
		completed: 4,
		total: 6,
		countText: "4 of 6 completed",
		items: [
			{
				id: "activities",
				status: "done",
				title: "Activities",
				subtitle: "MR-SF-PH1-Z1-RBL-OO1-v2.xer · 10,726 tasks",
				actions: [
					{id: "update", label: "Update", variant: "ghost"},
					{id: "view", label: "View", variant: "outline"},
				],
			},
			{
				id: "lbs",
				status: "done",
				title: "LBS Objects",
				subtitle: "3,136 objects",
				actions: [{id: "view", label: "View", variant: "outline"}],
			},
			{
				id: "blueprints",
				status: "done",
				title: "Blueprints",
				subtitle: "51 blueprints uploaded",
				actions: [{id: "view", label: "View", variant: "outline"}],
			},
			{
				id: "boq",
				status: "done",
				title: "BOQ",
				subtitle: "449 items",
				actions: [{id: "view", label: "View", variant: "outline"}],
			},
			{
				id: "operations",
				status: "pending",
				title: "Operations",
				subtitle: "Optional operation templates",
				actions: [{id: "upload", label: "Upload", variant: "outline"}],
			},
			{
				id: "mapping",
				status: "pending",
				title: "Activity to LBS Mapping",
				subtitle: "Upload activity-to-LBS mapping file",
				actions: [{id: "upload", label: "Upload", variant: "outline"}],
			},
		],
	},
	{
		id: "blueprints-lbs",
		label: "Step 2",
		title: "Blueprints to LBS",
		description: "Each LBS area needs a blueprint attached",
		completed: 15,
		total: 3136,
		countText: "15 of 3,136 LBS areas",
		action: {label: "Assign Blueprints", variant: "outline"},
	},
	{
		id: "draw",
		label: "Step 3",
		title: "Draw objects",
		description: "Draw shapes on blueprints for zones and rooms",
		completed: 3,
		total: 51,
		countText: "3 of 51 blueprints with shapes",
		action: {label: "Draw objects", variant: "outline"},
	},
	{
		id: "assign",
		label: "Step 4",
		title: "Assign to objects",
		description: "Link activities, operations & BOQ to drawn objects",
		completed: 0,
		total: 8,
		countText: "0 of 8 assigned",
		action: {label: "Assign to objects", variant: "outline"},
	},
];

export function SetupStepsChecklistPage() {
	const [openIds, setOpenIds] = useState<string[]>(["upload"]);

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Setup Steps Checklist</h1>
					<CopyButton
						value="Setup Steps Checklist"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:text-muted-foreground">
					Multi-step project setup tracker. Each step is a collapsible{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">Card</code> with chevron, status indicator,
					title, progress ring, count, and an optional header action. Expanded steps show a list of sub-items with done
					/ pending status.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Setup Steps Checklist - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Step 1 expanded with sub-items, the rest collapsed with a description and CTA.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SetupStepsChecklist steps={fullSteps} defaultOpenIds={["upload"]} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>All collapsed</CardTitle>
						<CopyButton
							value="Setup Steps Checklist - All collapsed"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Click any chevron to open. Sub-items appear underneath; descriptions disappear when open.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SetupStepsChecklist steps={fullSteps} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>All expanded</CardTitle>
						<CopyButton
							value="Setup Steps Checklist - All expanded"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Multiple steps can be open at once — the component is multi-select, not an accordion.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SetupStepsChecklist steps={fullSteps} defaultOpenIds={fullSteps.map((s) => s.id)} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Completed step</CardTitle>
						<CopyButton
							value="Setup Steps Checklist - Completed step"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						When <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">completed === total</code>, the
						indicator becomes a green CircleCheck and the progress ring fills fully.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SetupStepsChecklist
						steps={[
							{
								id: "step-1",
								label: "Step 1",
								title: "Upload files",
								completed: 6,
								total: 6,
								countText: "6 of 6 completed",
								items: [
									{id: "activities", status: "done", title: "Activities", subtitle: "10,726 tasks"},
									{id: "lbs", status: "done", title: "LBS Objects", subtitle: "3,136 objects"},
									{id: "blueprints", status: "done", title: "Blueprints", subtitle: "51 blueprints"},
									{id: "boq", status: "done", title: "BOQ", subtitle: "449 items"},
									{id: "operations", status: "done", title: "Operations", subtitle: "12 templates"},
									{id: "mapping", status: "done", title: "Activity to LBS Mapping", subtitle: "Mapped"},
								],
							},
						]}
						defaultOpenIds={["step-1"]}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Controlled</CardTitle>
						<CopyButton
							value="Setup Steps Checklist - Controlled"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Pass <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">openIds</code> +{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">onOpenIdsChange</code> to drive expand state
						from outside.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-col wwc:gap-3">
						<div className="wwc:rounded-md wwc:border wwc:bg-muted/30 wwc:p-3 wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
							openIds: {JSON.stringify(openIds)}
						</div>
						<SetupStepsChecklist steps={fullSteps} openIds={openIds} onOpenIdsChange={setOpenIds} />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Setup Steps Checklist - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Prop</th>
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Default</th>
									<th className="wwc:py-3 wwc:text-left wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{prop: "steps", type: "SetupStep[]", def: "—", desc: "List of steps to render."},
									{prop: "openIds", type: "string[]", def: "—", desc: "Controlled open ids."},
									{prop: "defaultOpenIds", type: "string[]", def: "[]", desc: "Initial open ids when uncontrolled."},
									{
										prop: "onOpenIdsChange",
										type: "(next: string[]) => void",
										def: "—",
										desc: "Open-state change callback.",
									},
								].map((row) => (
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
					<div className="wwc:mt-4">
						<h4 className="wwc:mb-2 wwc:text-sm wwc:font-semibold">SetupStep</h4>
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Field</th>
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:py-3 wwc:text-left wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{field: "id", type: "string", desc: "Stable identifier; used for openIds."},
									{field: "label", type: "ReactNode", desc: 'Short uppercase label, e.g. "Step 1".'},
									{field: "title", type: "ReactNode", desc: 'Step title, e.g. "Upload files".'},
									{field: "description", type: "ReactNode", desc: "Body content shown when collapsed."},
									{field: "completed", type: "number", desc: "Drives ring fill, count, and completed state."},
									{field: "total", type: "number", desc: "Denominator for ring + count."},
									{field: "countText", type: "ReactNode", desc: "Override the default 'X of Y completed' line."},
									{field: "items", type: "SetupStepSubItem[]", desc: "Sub-items shown in the expanded body."},
									{field: "action", type: "SetupStepHeaderAction", desc: "Optional CTA at the right edge of the row."},
								].map((row) => (
									<tr key={row.field} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:font-medium wwc:text-primary wwc:whitespace-nowrap">
											{row.field}
										</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.type}</td>
										<td className="wwc:py-3 wwc:text-muted-foreground">{row.desc}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
