import {Box, Check, Maximize2} from "lucide-react";
import {useMemo, useState} from "react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {FullscreenExitButton} from "@/components/ui/fullscreen-exit-button";
import {Progress} from "@/components/ui/progress";
import {Separator} from "@/components/ui/separator";
import {SetupStepsChecklist, type SetupStep} from "@/components/ui/setup-steps-checklist";
import {cn} from "@/lib/utils";

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

export function ProjectSetupExamplePage() {
	const completedSidebarSteps = sidebarSteps.filter((s) => s.status === "completed").length;
	const percentage = Math.round((completedSidebarSteps / sidebarSteps.length) * 100);

	const nextIncomplete = useMemo(() => setupSteps.find((s) => s.completed < s.total), []);
	const [openIds, setOpenIds] = useState<string[]>(nextIncomplete ? [nextIncomplete.id] : []);
	const [fullscreen, setFullscreen] = useState(false);

	const handleAdd = () => {
		if (!nextIncomplete) return;
		setOpenIds((prev) => (prev.includes(nextIncomplete.id) ? prev : [...prev, nextIncomplete.id]));
		nextIncomplete.action?.onSelect?.();
	};

	return (
		<div
			className={fullscreen ? "wwc:fixed wwc:inset-0 wwc:z-50 wwc:bg-background wwc:overflow-y-auto" : "wwc:space-y-8"}
		>
			{!fullscreen && (
				<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-4">
					<div>
						<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
							<h1 className="wwc:text-3xl wwc:font-bold">Project Setup — Fixed Content #1</h1>
							<CopyButton
								value="Project Setup — Fixed Content #1"
								className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
							/>
						</div>
						<p className="wwc:mt-2 wwc:text-muted-foreground">
							Two fixed panels in a 300px / fill split (a re-balanced Fixed Content #1). Left holds project context and
							a progress card; right hosts the recommended next action plus the full{" "}
							<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">SetupStepsChecklist</code>.
						</p>
					</div>
					<Button variant="outline" size="sm" onClick={() => setFullscreen(true)}>
						<Maximize2 /> Fullscreen
					</Button>
				</div>
			)}

			<div
				className={cn(
					"wwc:flex wwc:overflow-hidden",
					fullscreen ? "wwc:h-screen" : "wwc:h-[760px] wwc:rounded-xl wwc:border",
				)}
			>
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
			{fullscreen && <FullscreenExitButton onExit={() => setFullscreen(false)} />}
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
