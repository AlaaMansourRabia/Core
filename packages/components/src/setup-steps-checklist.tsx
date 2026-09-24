import {cn} from "@corensystem/coren-utils";
import {Check, ChevronDown, ChevronRight} from "lucide-react";
import * as React from "react";

import {Button} from "./button";
import {Card} from "./card";

type ChecklistStatus = "completed" | "in-progress" | "not-started";

// Matches the StatusIndicator pattern from the Checklist Card so the two components
// read as the same visual family.
function StatusDot({status}: {status: ChecklistStatus}) {
	if (status === "completed") {
		return (
			<span
				aria-hidden
				className="wwc:flex wwc:h-5 wwc:w-5 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-emerald-500"
			>
				<Check className="wwc:h-3 wwc:w-3 wwc:text-white" strokeWidth={3} />
			</span>
		);
	}
	if (status === "in-progress") {
		return (
			<span
				aria-hidden
				className="wwc:relative wwc:flex wwc:h-5 wwc:w-5 wwc:shrink-0 wwc:items-center wwc:justify-center"
			>
				<span className="wwc:h-5 wwc:w-5 wwc:rounded-full wwc:border-2 wwc:border-foreground/50" />
				<span className="wwc:absolute wwc:h-2 wwc:w-2 wwc:rounded-full wwc:bg-foreground" />
			</span>
		);
	}
	return (
		<span
			aria-hidden
			className="wwc:h-5 wwc:w-5 wwc:shrink-0 wwc:rounded-full wwc:border-2 wwc:border-muted-foreground/30"
		/>
	);
}

export type SetupStepSubItemStatus = "done" | "pending";

export type SetupStepSubItemAction = {
	id: string;
	label: string;
	variant?: "outline" | "ghost" | "default";
	onSelect?: () => void;
};

export type SetupStepSubItem = {
	id: string;
	status: SetupStepSubItemStatus;
	title: React.ReactNode;
	subtitle?: React.ReactNode;
	actions?: SetupStepSubItemAction[];
};

export type SetupStepHeaderAction = {
	label: React.ReactNode;
	variant?: "outline" | "ghost" | "default";
	onSelect?: () => void;
};

export type SetupStep = {
	id: string;
	/** Short uppercase label, e.g. "STEP 1". */
	label: React.ReactNode;
	/** Step title, e.g. "Upload files". */
	title: React.ReactNode;
	/** Optional description shown in the collapsed body. */
	description?: React.ReactNode;
	completed: number;
	total: number;
	/** Override the default "{completed} of {total} completed" line. */
	countText?: React.ReactNode;
	/** Sub-items shown in the expanded body. */
	items?: SetupStepSubItem[];
	/** Optional header CTA, sits at the right edge of the row. */
	action?: SetupStepHeaderAction;
};

export interface SetupStepsChecklistProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
	steps: SetupStep[];
	/** Controlled open ids. */
	openIds?: string[];
	/** Initial open ids when uncontrolled. */
	defaultOpenIds?: string[];
	onOpenIdsChange?: (next: string[]) => void;
}

const SetupStepsChecklist = React.forwardRef<HTMLDivElement, SetupStepsChecklistProps>(
	({className, steps, openIds: controlledOpen, defaultOpenIds, onOpenIdsChange, ...rest}, ref) => {
		const [internalOpen, setInternalOpen] = React.useState<string[]>(defaultOpenIds ?? []);
		const isControlled = controlledOpen !== undefined;
		const openIds = isControlled ? controlledOpen : internalOpen;

		const toggle = (id: string) => {
			const next = openIds.includes(id) ? openIds.filter((x) => x !== id) : [...openIds, id];
			if (!isControlled) setInternalOpen(next);
			onOpenIdsChange?.(next);
		};

		return (
			<div ref={ref} className={cn("wwc:flex wwc:flex-col wwc:gap-2", className)} {...rest}>
				{steps.map((step) => (
					<StepCard key={step.id} step={step} open={openIds.includes(step.id)} onToggle={() => toggle(step.id)} />
				))}
			</div>
		);
	},
);
SetupStepsChecklist.displayName = "SetupStepsChecklist";

function stepStatus(completed: number, total: number): ChecklistStatus {
	if (total > 0 && completed >= total) return "completed";
	if (completed > 0) return "in-progress";
	return "not-started";
}

function StepCard({step, open, onToggle}: {step: SetupStep; open: boolean; onToggle: () => void}) {
	const Chevron = open ? ChevronDown : ChevronRight;
	const status = stepStatus(step.completed, step.total);
	const hasItems = step.items !== undefined && step.items.length > 0;
	const expandable = hasItems;
	// When the step is expandable, the description acts as a collapsed-state preview (hides when open).
	// When the step is not expandable, the description is always visible — there's no chevron to gate it.
	const showDescription = step.description !== undefined && (!expandable || !open);

	const countTone =
		status === "completed"
			? "wwc:text-emerald-700"
			: status === "in-progress"
				? "wwc:text-foreground"
				: "wwc:text-muted-foreground";

	const bodyId = `${step.id}-body`;

	const headerInner = (
		<>
			{expandable && <Chevron className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:text-muted-foreground" />}
			<StatusDot status={status} />
			<span className="wwc:text-[10px] wwc:font-bold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
				{step.label}
			</span>
			<span className="wwc:text-sm wwc:font-bold wwc:text-foreground">{step.title}</span>
			<span className="wwc:flex-1" />
			<ProgressRing completed={step.completed} total={step.total} />
			<span className={cn("wwc:whitespace-nowrap wwc:text-xs wwc:font-semibold", countTone)}>
				{step.countText ?? `${step.completed} of ${step.total} completed`}
			</span>
		</>
	);

	return (
		<Card className="wwc:overflow-hidden wwc:p-0">
			<header className="wwc:flex wwc:items-center">
				{expandable ? (
					<button
						type="button"
						onClick={onToggle}
						aria-expanded={open}
						aria-controls={bodyId}
						className="wwc:flex wwc:flex-1 wwc:items-center wwc:gap-2.5 wwc:px-4 wwc:py-3.5 wwc:text-left wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring"
					>
						{headerInner}
					</button>
				) : (
					<div className="wwc:flex wwc:flex-1 wwc:items-center wwc:gap-2.5 wwc:px-4 wwc:py-3.5">{headerInner}</div>
				)}
				{step.action && (
					<div className="wwc:pr-4">
						<Button variant={step.action.variant ?? "outline"} size="sm" onClick={step.action.onSelect}>
							{step.action.label}
						</Button>
					</div>
				)}
			</header>

			{expandable && open && (
				<div id={bodyId} className="wwc:flex wwc:flex-col wwc:gap-1.5 wwc:px-4 wwc:pb-4 wwc:pl-10">
					{step.items?.map((item) => (
						<SubItemRow key={item.id} item={item} />
					))}
				</div>
			)}

			{showDescription && (
				<div className="wwc:px-4 wwc:pb-3.5 wwc:pl-10 wwc:text-xs wwc:text-muted-foreground">{step.description}</div>
			)}
		</Card>
	);
}

function ProgressRing({completed, total, size = 14}: {completed: number; total: number; size?: number}) {
	const ratio = total > 0 ? Math.min(1, Math.max(0, completed / total)) : 0;
	const isComplete = ratio >= 1;
	const isStarted = completed > 0;
	const radius = (size - 2) / 2;
	const c = 2 * Math.PI * radius;

	const tone = isComplete ? "wwc:text-green-600" : isStarted ? "wwc:text-foreground" : "wwc:text-muted-foreground";

	return (
		<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={cn("wwc:shrink-0", tone)} aria-hidden>
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.25}
				strokeWidth={2}
			/>
			{ratio > 0 && (
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={2}
					strokeLinecap="round"
					strokeDasharray={c}
					strokeDashoffset={c * (1 - ratio)}
					transform={`rotate(-90 ${size / 2} ${size / 2})`}
				/>
			)}
		</svg>
	);
}

function SubItemRow({item}: {item: SetupStepSubItem}) {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2.5 wwc:rounded-md wwc:border wwc:bg-card wwc:px-3 wwc:py-2.5">
			<StatusDot status={item.status === "done" ? "completed" : "not-started"} />
			<div className="wwc:flex wwc:flex-1 wwc:min-w-0 wwc:flex-col wwc:gap-0.5">
				<div className="wwc:text-[13px] wwc:font-semibold wwc:text-foreground">{item.title}</div>
				{item.subtitle !== undefined && (
					<div className="wwc:truncate wwc:text-xs wwc:text-muted-foreground">{item.subtitle}</div>
				)}
			</div>
			{item.actions && item.actions.length > 0 && (
				<div className="wwc:flex wwc:items-center wwc:gap-1.5">
					{item.actions.map((action) => (
						<Button key={action.id} size="sm" variant={action.variant ?? "outline"} onClick={action.onSelect}>
							{action.label}
						</Button>
					))}
				</div>
			)}
		</div>
	);
}

export {SetupStepsChecklist};
