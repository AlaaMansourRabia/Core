import {cn} from "@wakecap/core-utils";
import {Ban, Box, Calendar, Layers, Signal, Tag, Users, X} from "lucide-react";
import * as React from "react";

import {Avatar, AvatarFallback, AvatarImage} from "./avatar";
import {Card} from "./card";

export type WorkItemStatus = "backlog" | "todo" | "in-progress" | "done" | "cancelled";
export type WorkItemPriority = "none" | "low" | "medium" | "high" | "urgent";
export type WorkItemTone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

export interface WorkItemAssignee {
	id: string;
	name: string;
	avatarUrl?: string;
	tone?: WorkItemTone;
}

export interface WorkItemLabel {
	id: string;
	name: string;
	tone?: WorkItemTone;
}

export interface WorkItemCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> {
	identifier: string;
	title: string;
	status?: WorkItemStatus;
	priority?: WorkItemPriority;
	isBlocked?: boolean;
	dateRange?: {start: string; end: string};
	isOverdue?: boolean;
	assignees?: WorkItemAssignee[];
	subIssueCount?: number;
	modules?: string[];
	labels?: WorkItemLabel[];
	onClick?: () => void;
	onClearDate?: () => void;
}

const toneDot: Record<WorkItemTone, string> = {
	neutral: "wwc:bg-muted-foreground",
	primary: "wwc:bg-primary",
	success: "wwc:bg-emerald-500",
	warning: "wwc:bg-amber-500",
	danger: "wwc:bg-destructive",
	info: "wwc:bg-sky-500",
};

const toneAvatar: Record<WorkItemTone, string> = {
	neutral: "wwc:bg-muted wwc:text-muted-foreground",
	primary: "wwc:bg-primary wwc:text-primary-foreground",
	success: "wwc:bg-emerald-500 wwc:text-white",
	warning: "wwc:bg-amber-500 wwc:text-white",
	danger: "wwc:bg-destructive wwc:text-destructive-foreground",
	info: "wwc:bg-sky-500 wwc:text-white",
};

const statusLabel: Record<WorkItemStatus, string> = {
	backlog: "Backlog",
	todo: "Todo",
	"in-progress": "In Progress",
	done: "Done",
	cancelled: "Cancelled",
};

function StatusIcon({status}: {status: WorkItemStatus}) {
	if (status === "in-progress") {
		return (
			<span className="wwc:relative wwc:flex wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-full wwc:border-2 wwc:border-amber-500">
				<span className="wwc:h-1.5 wwc:w-1.5 wwc:rounded-full wwc:bg-amber-500" />
			</span>
		);
	}
	if (status === "done") {
		return (
			<span className="wwc:flex wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-emerald-500">
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
		);
	}
	if (status === "cancelled") {
		return (
			<span className="wwc:flex wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-full wwc:border-2 wwc:border-destructive" />
		);
	}
	const isBacklog = status === "backlog";
	return (
		<span
			className={cn(
				"wwc:flex wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-full wwc:border-2",
				isBacklog ? "wwc:border-muted-foreground/40 wwc:border-dashed" : "wwc:border-muted-foreground/60",
			)}
		/>
	);
}

const priorityToneClass: Record<WorkItemPriority, string> = {
	none: "wwc:text-muted-foreground/50",
	low: "wwc:text-muted-foreground",
	medium: "wwc:text-amber-500",
	high: "wwc:text-amber-600",
	urgent: "wwc:text-destructive",
};

const priorityBars: Record<WorkItemPriority, number> = {
	none: 0,
	low: 1,
	medium: 2,
	high: 3,
	urgent: 3,
};

function PriorityIcon({priority}: {priority: WorkItemPriority}) {
	const tone = priorityToneClass[priority];
	const bars = priorityBars[priority];
	return (
		<span
			className={cn("wwc:inline-flex wwc:items-end wwc:gap-[2px] wwc:h-3.5 wwc:w-3.5", tone)}
			aria-label={`Priority: ${priority}`}
		>
			<span
				className={cn(
					"wwc:w-[3px] wwc:rounded-sm wwc:h-[30%]",
					bars >= 1 ? "wwc:bg-current" : "wwc:bg-muted-foreground/30",
				)}
			/>
			<span
				className={cn(
					"wwc:w-[3px] wwc:rounded-sm wwc:h-[60%]",
					bars >= 2 ? "wwc:bg-current" : "wwc:bg-muted-foreground/30",
				)}
			/>
			<span
				className={cn(
					"wwc:w-[3px] wwc:rounded-sm wwc:h-[90%]",
					bars >= 3 ? "wwc:bg-current" : "wwc:bg-muted-foreground/30",
				)}
			/>
		</span>
	);
}

function MetaPill({
	icon,
	children,
	tone = "default",
	onClear,
}: {
	icon?: React.ReactNode;
	children?: React.ReactNode;
	tone?: "default" | "danger";
	onClear?: () => void;
}) {
	return (
		<span
			className={cn(
				"wwc:inline-flex wwc:items-center wwc:gap-1 wwc:rounded-md wwc:border wwc:px-1.5 wwc:py-0.5 wwc:text-xs wwc:leading-none wwc:h-6",
				tone === "danger"
					? "wwc:border-destructive/20 wwc:bg-destructive/10 wwc:text-destructive"
					: "wwc:border-border wwc:bg-card wwc:text-foreground",
			)}
		>
			{icon}
			{children !== undefined && children !== null && <span className="wwc:whitespace-nowrap">{children}</span>}
			{onClear && (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onClear();
					}}
					className="wwc:ml-0.5 wwc:rounded-sm wwc:opacity-60 wwc:hover:opacity-100"
					aria-label="Clear"
				>
					<X className="wwc:h-3 wwc:w-3" />
				</button>
			)}
		</span>
	);
}

function PlaceholderPill({icon, label}: {icon: React.ReactNode; label: string}) {
	return (
		<span
			className="wwc:inline-flex wwc:h-6 wwc:w-6 wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:border-border wwc:bg-card wwc:text-muted-foreground"
			aria-label={label}
			title={label}
		>
			{icon}
		</span>
	);
}

function AssigneeStack({assignees}: {assignees: WorkItemAssignee[]}) {
	const visible = assignees.slice(0, 3);
	const extra = assignees.length - visible.length;
	return (
		<span className="wwc:inline-flex wwc:h-6 wwc:items-center">
			<span className="wwc:flex wwc:-space-x-1.5">
				{visible.map((a) => (
					<Avatar key={a.id} className="wwc:h-5 wwc:w-5 wwc:border wwc:border-background">
						{a.avatarUrl && <AvatarImage src={a.avatarUrl} alt={a.name} />}
						<AvatarFallback className={cn("wwc:text-[10px] wwc:font-medium", toneAvatar[a.tone ?? "success"])}>
							{a.name.charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>
				))}
			</span>
			{extra > 0 && <span className="wwc:ml-1 wwc:text-[10px] wwc:text-muted-foreground">+{extra}</span>}
		</span>
	);
}

function formatDateRange(range: {start: string; end: string}) {
	if (range.start === range.end) return range.start;
	return `${range.start} - ${range.end}`;
}

const WorkItemCard = React.forwardRef<HTMLDivElement, WorkItemCardProps>(
	(
		{
			identifier,
			title,
			status,
			priority,
			isBlocked,
			dateRange,
			isOverdue,
			assignees,
			subIssueCount,
			modules,
			labels,
			className,
			onClick,
			onClearDate,
			...rest
		},
		ref,
	) => {
		const interactive = !!onClick;
		return (
			<Card
				ref={ref}
				onClick={onClick}
				role={interactive ? "button" : undefined}
				tabIndex={interactive ? 0 : undefined}
				onKeyDown={(e) => {
					if (interactive && (e.key === "Enter" || e.key === " ")) {
						e.preventDefault();
						onClick?.();
					}
				}}
				className={cn(
					"wwc:p-3 wwc:space-y-2 wwc:shadow-sm wwc:transition-colors",
					interactive && "wwc:cursor-pointer wwc:hover:bg-accent/40",
					className,
				)}
				{...rest}
			>
				<div className="wwc:flex wwc:items-center wwc:gap-1.5">
					<span className="wwc:flex wwc:h-5 wwc:w-5 wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-primary/10">
						<Box className="wwc:h-3.5 wwc:w-3.5 wwc:text-primary" />
					</span>
					<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">{identifier}</span>
				</div>

				<div className="wwc:text-sm wwc:font-medium wwc:leading-snug wwc:text-foreground">{title}</div>

				<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5">
					{status && (
						<MetaPill icon={<StatusIcon status={status} />}>
							<span className="wwc:text-muted-foreground">{statusLabel[status]}</span>
						</MetaPill>
					)}
					{isBlocked && <PlaceholderPill icon={<Ban className="wwc:h-3.5 wwc:w-3.5" />} label="Blocked" />}
					{dateRange ? (
						<MetaPill
							tone={isOverdue ? "danger" : "default"}
							icon={<Calendar className={cn("wwc:h-3 wwc:w-3", isOverdue && "wwc:text-destructive")} />}
							onClear={onClearDate}
						>
							{formatDateRange(dateRange)}
						</MetaPill>
					) : (
						<PlaceholderPill icon={<Calendar className="wwc:h-3.5 wwc:w-3.5" />} label="Set date" />
					)}
					{assignees && assignees.length > 0 ? (
						<AssigneeStack assignees={assignees} />
					) : (
						<PlaceholderPill icon={<Users className="wwc:h-3.5 wwc:w-3.5" />} label="Assign" />
					)}
					{subIssueCount && subIssueCount > 0 ? (
						<MetaPill icon={<Layers className="wwc:h-3 wwc:w-3" />}>{subIssueCount}</MetaPill>
					) : (
						<PlaceholderPill icon={<Layers className="wwc:h-3.5 wwc:w-3.5" />} label="Sub-issues" />
					)}
					{priority && priority !== "none" ? (
						<MetaPill tone={priority === "urgent" ? "danger" : "default"} icon={<PriorityIcon priority={priority} />} />
					) : (
						<PlaceholderPill icon={<Signal className="wwc:h-3.5 wwc:w-3.5" />} label="Priority" />
					)}
				</div>

				{modules?.length || labels?.length ? (
					<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5">
						{modules?.map((m) => (
							<MetaPill key={m} icon={<Tag className="wwc:h-3 wwc:w-3" />}>
								{m}
							</MetaPill>
						))}
						{labels?.map((l) => (
							<span
								key={l.id}
								className="wwc:inline-flex wwc:h-6 wwc:items-center wwc:gap-1.5 wwc:rounded-md wwc:border wwc:border-border wwc:bg-card wwc:px-1.5 wwc:py-0.5 wwc:text-xs wwc:leading-none"
							>
								<span className={cn("wwc:h-2 wwc:w-2 wwc:rounded-full", toneDot[l.tone ?? "primary"])} />
								<span className="wwc:text-muted-foreground">{l.name}</span>
							</span>
						))}
					</div>
				) : null}
			</Card>
		);
	},
);
WorkItemCard.displayName = "WorkItemCard";

export {WorkItemCard};
