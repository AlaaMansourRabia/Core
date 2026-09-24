import {cn} from "@corensystem/coren-utils";
import {Box, Check} from "lucide-react";
import {useMemo, useState} from "react";

import {Badge} from "../badge";
import {Button} from "../button";
import {Card} from "../card";
import {Progress} from "../progress";
import {Separator} from "../separator";
import {SetupStepsChecklist, type SetupStep} from "../setup-steps-checklist";

type SidebarStepStatus = "completed" | "in-progress" | "not-started";

const sidebarSteps: {id: string; label: string; status: SidebarStepStatus}[] = [
	{id: "step-1", label: "Step 1", status: "completed"},
	{id: "step-2", label: "Step 2", status: "not-started"},
	{id: "step-3", label: "Step 3", status: "not-started"},
	{id: "step-4", label: "Step 4", status: "not-started"},
	{id: "step-5", label: "Step 5", status: "not-started"},
];

const setupSteps: SetupStep[] = [
	{
		id: "step-1",
		label: "Step 1",
		title: "Step one",
		completed: 4,
		total: 6,
		countText: "4 of 6 completed",
		items: [
			{
				id: "item-1",
				status: "done",
				title: "Item one",
				subtitle: "Sub-item description · meta",
				actions: [
					{id: "update", label: "Update", variant: "ghost"},
					{id: "view", label: "View", variant: "outline"},
				],
			},
			{
				id: "item-2",
				status: "done",
				title: "Item two",
				subtitle: "Sub-item description",
				actions: [{id: "view", label: "View", variant: "outline"}],
			},
			{
				id: "item-3",
				status: "done",
				title: "Item three",
				subtitle: "Sub-item description",
				actions: [{id: "view", label: "View", variant: "outline"}],
			},
			{
				id: "item-4",
				status: "done",
				title: "Item four",
				subtitle: "Sub-item description",
				actions: [{id: "view", label: "View", variant: "outline"}],
			},
			{
				id: "item-5",
				status: "pending",
				title: "Item five",
				subtitle: "Optional",
				actions: [{id: "upload", label: "Upload", variant: "outline"}],
			},
			{
				id: "item-6",
				status: "pending",
				title: "Item six",
				subtitle: "Optional",
				actions: [{id: "upload", label: "Upload", variant: "outline"}],
			},
		],
	},
	{
		id: "step-2",
		label: "Step 2",
		title: "Step two",
		description: "Short description of this step",
		completed: 0,
		total: 100,
		countText: "0 of 100",
		action: {label: "Action", variant: "outline"},
	},
	{
		id: "step-3",
		label: "Step 3",
		title: "Step three",
		description: "Short description of this step",
		completed: 0,
		total: 100,
		countText: "0 of 100",
		action: {label: "Action", variant: "outline"},
	},
];

/**
 * @deprecated Preview/demo prototype — renders built-in sample data and mock handlers. Not a
 * supported production import: compose your page from the widgets this template uses, wired to your
 * own data (see the CoreProjectSetup template docs in Storybook). Slated for removal from the public API in a
 * future major.
 */
export function ProjectSetup() {
	const completedSidebarSteps = sidebarSteps.filter((s) => s.status === "completed").length;
	const percentage = Math.round((completedSidebarSteps / sidebarSteps.length) * 100);

	const nextIncomplete = useMemo(() => setupSteps.find((s) => s.completed < s.total), []);
	const [openIds, setOpenIds] = useState<string[]>(nextIncomplete ? [nextIncomplete.id] : []);

	const handleAdd = () => {
		if (!nextIncomplete) return;
		setOpenIds((prev) => (prev.includes(nextIncomplete.id) ? prev : [...prev, nextIncomplete.id]));
		nextIncomplete.action?.onSelect?.();
	};

	return (
		<div className="wwc:space-y-8">
			<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-4">
				<div>
					<h1 className="wwc:text-3xl wwc:font-bold">Project Setup</h1>
					<p className="wwc:mt-2 wwc:text-muted-foreground">
						Guide a new project through setup. The left panel holds project context and a progress card; the right hosts
						the recommended next action and a step-by-step setup checklist.
					</p>
				</div>
			</div>

			<div className="wwc:flex wwc:h-[760px] wwc:overflow-hidden wwc:rounded-xl wwc:border">
				{/* Left panel — project sidebar */}
				<aside className="wwc:flex wwc:w-[300px] wwc:flex-shrink-0 wwc:flex-col wwc:gap-5 wwc:border-r wwc:bg-card wwc:p-6">
					<div className="wwc:flex wwc:flex-col wwc:gap-3">
						<div className="wwc:flex wwc:h-12 wwc:w-12 wwc:items-center wwc:justify-center wwc:rounded-xl wwc:bg-muted">
							<Box className="wwc:h-6 wwc:w-6 wwc:text-muted-foreground" />
						</div>
						<div className="wwc:flex wwc:flex-col">
							<h2 className="wwc:text-lg wwc:font-bold wwc:text-foreground">Project name</h2>
							<span className="wwc:text-sm wwc:text-muted-foreground">Organization</span>
						</div>
						<Badge variant="outline" className="wwc:self-start">
							Tier
						</Badge>
					</div>

					<Separator />

					<Card className="wwc:flex wwc:flex-col wwc:gap-4 wwc:p-5 wwc:shadow-none">
						<div className="wwc:flex wwc:items-center wwc:justify-between">
							<h3 className="wwc:text-sm wwc:font-bold">Project setup</h3>
							<span className="wwc:text-sm wwc:font-bold wwc:text-amber-600">{percentage}%</span>
						</div>
						<Progress value={percentage} className="wwc:h-2" />
						<div className="wwc:flex wwc:flex-col wwc:gap-3">
							{sidebarSteps.map((s) => (
								<div key={s.id} className="wwc:flex wwc:items-center wwc:gap-2.5">
									<StatusDot status={s.status} />
									<span
										className={cn(
											"wwc:text-sm",
											s.status === "completed" ? "wwc:text-muted-foreground wwc:line-through" : "wwc:text-foreground",
										)}
									>
										{s.label}
									</span>
								</div>
							))}
						</div>
					</Card>
				</aside>

				{/* Right panel — main */}
				<main className="wwc:flex wwc:flex-1 wwc:flex-col wwc:gap-6 wwc:overflow-y-auto wwc:bg-background wwc:p-8">
					<Card className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-4 wwc:p-4 wwc:shadow-none">
						<div className="wwc:flex wwc:flex-col wwc:gap-0.5">
							<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Recommended next action</span>
							<span className="wwc:text-base wwc:font-semibold wwc:text-foreground">
								{nextIncomplete ? nextIncomplete.title : "All steps completed"}
							</span>
						</div>
						<Button onClick={handleAdd} disabled={!nextIncomplete}>
							Add
						</Button>
					</Card>

					<SetupStepsChecklist steps={setupSteps} openIds={openIds} onOpenIdsChange={setOpenIds} />
				</main>
			</div>
		</div>
	);
}

function StatusDot({status}: {status: SidebarStepStatus}) {
	if (status === "completed") {
		return (
			<span
				aria-hidden
				className="wwc:flex wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-emerald-500"
			>
				<Check className="wwc:h-2.5 wwc:w-2.5 wwc:text-white" strokeWidth={3} />
			</span>
		);
	}
	if (status === "in-progress") {
		return (
			<span
				aria-hidden
				className="wwc:relative wwc:flex wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:items-center wwc:justify-center"
			>
				<span className="wwc:h-4 wwc:w-4 wwc:rounded-full wwc:border-2 wwc:border-amber-500" />
				<span className="wwc:absolute wwc:h-1.5 wwc:w-1.5 wwc:rounded-full wwc:bg-amber-500" />
			</span>
		);
	}
	return (
		<span
			aria-hidden
			className="wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:rounded-full wwc:border-2 wwc:border-muted-foreground/30"
		/>
	);
}
