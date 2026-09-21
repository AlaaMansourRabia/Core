import type * as React from "react";

import {Check} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {Progress} from "@/components/ui/progress";
import {cn} from "@/lib/utils";

// --- Types ---

type StepStatus = "completed" | "in-progress" | "not-started";
type ChecklistVariant = "default" | "cards";

interface ChecklistStep {
	label: string;
	status: StepStatus;
	description?: string;
	action?: React.ReactNode;
}

interface ChecklistCardProps {
	title: string;
	description?: string;
	badge?: string;
	badgeVariant?: "default" | "success" | "warning" | "muted";
	steps: ChecklistStep[];
	variant?: ChecklistVariant;
}

// --- Status indicator ---

function StatusIndicator({status}: {status: StepStatus}) {
	if (status === "completed") {
		return (
			<span className="wwc:flex wwc:h-5 wwc:w-5 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-emerald-500">
				<Check className="wwc:h-3 wwc:w-3 wwc:text-white" strokeWidth={3} />
			</span>
		);
	}
	if (status === "in-progress") {
		return (
			<span className="wwc:relative wwc:flex wwc:h-5 wwc:w-5 wwc:shrink-0 wwc:items-center wwc:justify-center">
				<span className="wwc:h-5 wwc:w-5 wwc:rounded-full wwc:border-2 wwc:border-amber-500" />
				<span className="wwc:absolute wwc:h-2 wwc:w-2 wwc:rounded-full wwc:bg-amber-500" />
			</span>
		);
	}
	return <span className="wwc:h-5 wwc:w-5 wwc:shrink-0 wwc:rounded-full wwc:border-2 wwc:border-muted-foreground/30" />;
}

// --- Badge variant styles ---

const badgeStyles = {
	default: "wwc:bg-primary/10 wwc:text-primary wwc:hover:bg-primary/10",
	success: "wwc:bg-emerald-50 wwc:text-emerald-700 wwc:hover:bg-emerald-50",
	warning: "wwc:bg-amber-50 wwc:text-amber-700 wwc:hover:bg-amber-50",
	muted: "wwc:bg-muted wwc:text-muted-foreground wwc:hover:bg-muted",
};

// --- Checklist Card ---

function ChecklistCard({
	title,
	description,
	badge,
	badgeVariant = "success",
	steps,
	variant = "default",
}: ChecklistCardProps) {
	if (variant === "cards") {
		return (
			<div className="wwc:space-y-3">
				{steps.map((step) => (
					<div
						key={step.label}
						className="wwc:flex wwc:items-center wwc:gap-4 wwc:rounded-2xl wwc:border wwc:bg-background wwc:px-5 wwc:py-4"
					>
						<StatusIndicator status={step.status} />
						<div className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col wwc:gap-1">
							<span className="wwc:text-sm wwc:font-semibold wwc:text-foreground">{step.label}</span>
							{step.description && <span className="wwc:text-sm wwc:text-muted-foreground">{step.description}</span>}
						</div>
						{step.action && <div className="wwc:flex wwc:items-center wwc:gap-3">{step.action}</div>}
					</div>
				))}
			</div>
		);
	}

	const completed = steps.filter((s) => s.status === "completed").length;
	const percentage = Math.round((completed / steps.length) * 100);

	return (
		<div className="wwc:rounded-2xl wwc:border wwc:bg-background wwc:p-6 wwc:space-y-4">
			<div className="wwc:flex wwc:items-center wwc:justify-between">
				<h3 className="wwc:text-base wwc:font-bold">{title}</h3>
				{badge && <Badge className={cn("wwc:rounded-full", badgeStyles[badgeVariant])}>{badge}</Badge>}
				{!badge && <span className="wwc:text-base wwc:font-bold wwc:text-amber-500">{percentage}%</span>}
			</div>
			{description && <p className="wwc:text-sm wwc:text-muted-foreground">{description}</p>}
			<Progress value={percentage} className="wwc:h-2" />
			<div className="wwc:space-y-4">
				{steps.map((step) => (
					<div key={step.label} className="wwc:flex wwc:items-center wwc:gap-3">
						<StatusIndicator status={step.status} />
						<span
							className={cn("wwc:text-sm", step.status === "completed" && "wwc:text-muted-foreground wwc:line-through")}
						>
							{step.label}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

// --- Sample data ---

const projectSetupSteps: ChecklistStep[] = [
	{label: "Create project repository", status: "completed"},
	{label: "Set up CI/CD pipeline", status: "completed"},
	{label: "Configure linting and formatting", status: "in-progress"},
	{label: "Write initial documentation", status: "not-started"},
	{label: "Set up monitoring and alerts", status: "not-started"},
];

const onboardingSteps: ChecklistStep[] = [
	{label: "Complete profile setup", status: "completed"},
	{label: "Verify email address", status: "completed"},
	{label: "Connect team workspace", status: "completed"},
	{label: "Import existing data", status: "in-progress"},
	{label: "Invite team members", status: "not-started"},
	{label: "Schedule onboarding call", status: "not-started"},
];

const deploymentSteps: ChecklistStep[] = [
	{label: "Run test suite", status: "completed"},
	{label: "Review pull request", status: "completed"},
	{label: "Merge to staging", status: "completed"},
	{label: "QA sign-off", status: "completed"},
	{label: "Deploy to production", status: "completed"},
];

const complianceSteps: ChecklistStep[] = [
	{label: "Data encryption audit", status: "not-started"},
	{label: "Access control review", status: "not-started"},
	{label: "Incident response plan", status: "not-started"},
	{label: "Employee training", status: "not-started"},
];

const projectAssetsSteps: ChecklistStep[] = [
	{
		label: "Activities",
		description: "MR-SF-PH1-Z1-RBL-OO1-v2.xer · 10,726 tasks",
		status: "completed",
		action: (
			<>
				<Button variant="ghost" size="sm">
					Update
				</Button>
				<Button variant="outline" size="sm">
					View
				</Button>
			</>
		),
	},
	{
		label: "LBS Objects",
		description: "3,136 objects",
		status: "completed",
		action: (
			<Button variant="outline" size="sm">
				View
			</Button>
		),
	},
	{
		label: "Blueprints",
		description: "51 blueprints uploaded",
		status: "completed",
		action: (
			<Button variant="outline" size="sm">
				View
			</Button>
		),
	},
	{
		label: "BOQ",
		description: "449 items",
		status: "completed",
		action: (
			<Button variant="outline" size="sm">
				View
			</Button>
		),
	},
	{
		label: "Operations",
		description: "Optional operation templates",
		status: "not-started",
		action: (
			<Button variant="outline" size="sm">
				Upload
			</Button>
		),
	},
	{
		label: "Activity to LBS Mapping",
		description: "Upload activity-to-LBS mapping file",
		status: "not-started",
		action: (
			<Button variant="outline" size="sm">
				Upload
			</Button>
		),
	},
];

// --- Page ---

export function ChecklistCardPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Checklist Card</h1>
					<CopyButton
						value="Checklist Card"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					A card component that displays progress through a series of steps. Each step shows its current state with
					visual indicators. Supports not started, in progress, and completed states.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Checklist Card - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						A checklist card with a title, percentage indicator, progress bar, and step list.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:max-w-md">
						<ChecklistCard
							title="Project Setup"
							description="Complete all steps to finish project initialization"
							steps={projectSetupSteps}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With Status Badge</CardTitle>
						<CopyButton
							value="Checklist Card - With Status Badge"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						The percentage can be replaced with a status badge for categorical progress indication.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:grid wwc:gap-6 wwc:sm:grid-cols-2 wwc:lg:grid-cols-3">
						<ChecklistCard
							title="Onboarding"
							description="Welcome! Complete these steps to get started."
							badge="In Progress"
							badgeVariant="warning"
							steps={onboardingSteps}
						/>
						<ChecklistCard title="Deployment" badge="Completed" badgeVariant="success" steps={deploymentSteps} />
						<ChecklistCard title="Compliance Review" badge="Not Started" badgeVariant="muted" steps={complianceSteps} />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>States</CardTitle>
						<CopyButton
							value="Checklist Card - States"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Each step can be in one of three visual states.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:grid wwc:gap-6 wwc:sm:grid-cols-3">
						<div className="wwc:rounded-lg wwc:border wwc:p-4 wwc:space-y-3">
							<Badge variant="secondary">Not Started</Badge>
							<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
								<StatusIndicator status="not-started" />
								<span className="wwc:text-sm">Step label</span>
							</div>
							<p className="wwc:text-xs wwc:text-muted-foreground">
								Empty circle with border. Step has not been started yet.
							</p>
						</div>
						<div className="wwc:rounded-lg wwc:border wwc:p-4 wwc:space-y-3">
							<Badge className="wwc:bg-amber-50 wwc:text-amber-700 wwc:hover:bg-amber-50">In Progress</Badge>
							<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
								<StatusIndicator status="in-progress" />
								<span className="wwc:text-sm">Step label</span>
							</div>
							<p className="wwc:text-xs wwc:text-muted-foreground">
								Accent circle with filled dot inside. Step is currently active or partially complete.
							</p>
						</div>
						<div className="wwc:rounded-lg wwc:border wwc:p-4 wwc:space-y-3">
							<Badge className="wwc:bg-emerald-50 wwc:text-emerald-700 wwc:hover:bg-emerald-50">Completed</Badge>
							<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
								<StatusIndicator status="completed" />
								<span className="wwc:text-sm">Step label</span>
							</div>
							<p className="wwc:text-xs wwc:text-muted-foreground">
								Filled circle with checkmark. Step has been successfully completed.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Variant: Cards</CardTitle>
						<CopyButton
							value="Checklist Card - Variant Cards"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Each step rendered as its own bordered card with a status indicator on the left, title + description in the
						middle, and action buttons on the right. Set{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">variant="cards"</code> and
						pass an <code>action</code> per step.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ChecklistCard title="Project Assets" variant="cards" steps={projectAssetsSteps} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Checklist Card - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Props for the ChecklistCard component.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Prop</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Default</th>
									<th className="wwc:text-left wwc:py-3 wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{prop: "title", type: "string", def: "—", desc: "Bold heading displayed at the top of the card."},
									{prop: "description", type: "string", def: "—", desc: "Optional muted body text below the title."},
									{
										prop: "badge",
										type: "string",
										def: "—",
										desc: "Optional status badge text. When set, replaces the percentage display.",
									},
									{
										prop: "badgeVariant",
										type: '"default" | "success" | "warning" | "muted"',
										def: '"success"',
										desc: "Color variant for the status badge.",
									},
									{
										prop: "variant",
										type: '"default" | "cards"',
										def: '"default"',
										desc: 'Layout: single card with header + step list ("default") or each step as its own row card with indicator + action ("cards").',
									},
									{prop: "steps", type: "ChecklistStep[]", def: "—", desc: "Array of steps with label and status."},
									{prop: "steps[].label", type: "string", def: "—", desc: "Display text for the step."},
									{
										prop: "steps[].status",
										type: '"completed" | "in-progress" | "not-started"',
										def: "—",
										desc: "Current state of the step.",
									},
									{
										prop: "steps[].description",
										type: "string",
										def: "—",
										desc: 'Muted secondary text shown below the label in the "cards" / "cards-minimal" variants.',
									},
									{
										prop: "steps[].action",
										type: "React.ReactNode",
										def: "—",
										desc: 'Trailing action(s) rendered on the right edge in the "cards" variant (e.g. <Button>View</Button>).',
									},
								].map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-primary wwc:font-medium wwc:whitespace-nowrap">
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

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Checklist Card - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`<ChecklistCard
  title="Project Setup"
  description="Complete all steps to finish project initialization"
  steps={[
    { label: "Create repository", status: "completed" },
    { label: "Set up CI/CD", status: "in-progress" },
    { label: "Write documentation", status: "not-started" },
  ]}
/>

{/* With status badge instead of percentage */}
<ChecklistCard
  title="Deployment"
  badge="Completed"
  badgeVariant="success"
  steps={[...]}
/>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
