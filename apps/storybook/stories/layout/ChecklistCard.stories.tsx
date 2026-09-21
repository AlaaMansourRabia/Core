import type * as React from "react";
import type {Meta, StoryObj} from "storybook/internal/types";

import {Badge} from "@core/core-ui/badge";
import {Button} from "@core/core-ui/button";
import {Progress} from "@core/core-ui/progress";
import {cn} from "@core/core-utils";
import {Check} from "lucide-react";

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

const badgeStyles = {
	default: "wwc:bg-primary/10 wwc:text-primary wwc:hover:bg-primary/10",
	success: "wwc:bg-emerald-50 wwc:text-emerald-700 wwc:hover:bg-emerald-50",
	warning: "wwc:bg-amber-50 wwc:text-amber-700 wwc:hover:bg-amber-50",
	muted: "wwc:bg-muted wwc:text-muted-foreground wwc:hover:bg-muted",
};

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

const meta = {
	title: "Components/Layout/Checklist Card",
	component: ChecklistCard,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Card pattern that shows progress through a series of steps. Each step renders with one of three status indicators (not started, in progress, completed). The header shows either a percentage or a status badge.",
			},
		},
	},
} satisfies Meta<typeof ChecklistCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:max-w-md">
			<ChecklistCard
				title="Project Setup"
				description="Complete all steps to finish project initialization"
				steps={projectSetupSteps}
			/>
		</div>
	),
};

export const WithBadge: Story = {
	render: () => (
		<div className="wwc:grid wwc:gap-6 wwc:sm:grid-cols-2 wwc:lg:grid-cols-3">
			<ChecklistCard
				title="Onboarding"
				description="Welcome! Complete these steps to get started."
				badge="In Progress"
				badgeVariant="warning"
				steps={onboardingSteps}
			/>
			<ChecklistCard title="Deployment" badge="Completed" badgeVariant="success" steps={deploymentSteps} />
		</div>
	),
};

export const VariantCards: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Each step rendered as its own bordered card with a status indicator on the left, title + description in the middle, and action buttons on the right. Set `variant="cards"` and pass `action` per step.',
			},
		},
	},
	render: () => (
		<div className="wwc:max-w-3xl">
			<ChecklistCard title="Project Assets" variant="cards" steps={projectAssetsSteps} />
		</div>
	),
};

export const States: Story = {
	render: () => (
		<div className="wwc:grid wwc:gap-6 wwc:sm:grid-cols-3">
			<div className="wwc:rounded-lg wwc:border wwc:p-4 wwc:space-y-3">
				<Badge variant="secondary">Not Started</Badge>
				<div className="wwc:flex wwc:items-center wwc:gap-3">
					<StatusIndicator status="not-started" />
					<span className="wwc:text-sm">Step label</span>
				</div>
			</div>
			<div className="wwc:rounded-lg wwc:border wwc:p-4 wwc:space-y-3">
				<Badge className="wwc:bg-amber-50 wwc:text-amber-700 wwc:hover:bg-amber-50">In Progress</Badge>
				<div className="wwc:flex wwc:items-center wwc:gap-3">
					<StatusIndicator status="in-progress" />
					<span className="wwc:text-sm">Step label</span>
				</div>
			</div>
			<div className="wwc:rounded-lg wwc:border wwc:p-4 wwc:space-y-3">
				<Badge className="wwc:bg-emerald-50 wwc:text-emerald-700 wwc:hover:bg-emerald-50">Completed</Badge>
				<div className="wwc:flex wwc:items-center wwc:gap-3">
					<StatusIndicator status="completed" />
					<span className="wwc:text-sm">Step label</span>
				</div>
			</div>
		</div>
	),
};
