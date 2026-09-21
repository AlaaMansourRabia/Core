import {cn} from "@wakecap/core-utils";
import * as React from "react";

import {Badge} from "./badge";
import {Button} from "./button";
import {CommentComposer} from "./comment-composer";
import {type CommentItem, CommentThread} from "./comment-thread";
import {DetailPanelShell} from "./detail-panel-shell";
import {Separator} from "./separator";

/** Observation lifecycle, matching the Safety Manager list view. */
export type ObservationStatus = "pending" | "open" | "closed";

/** Severity ladder from the observation manager. "Not Determined" is the unset state. */
export type ObservationSeverity = "Not Determined" | "Low" | "Medium" | "High" | "Emergency";

const STATUS_LABEL: Record<ObservationStatus, string> = {
	pending: "Pending",
	open: "Open",
	closed: "Closed",
};

function statusVariant(status: ObservationStatus) {
	if (status === "closed") return "successSoft" as const;
	if (status === "pending") return "dangerSoft" as const;
	return "warningSoft" as const;
}

function severityVariant(severity: ObservationSeverity) {
	if (severity === "Emergency" || severity === "High") return "dangerSoft" as const;
	if (severity === "Medium") return "warningSoft" as const;
	if (severity === "Low") return "successSoft" as const;
	return "neutralSoft" as const;
}

/**
 * One observation ticket. Field-for-field the Safety Manager list view's record, so a violation opened
 * from the map reads the same as the same violation opened from the list.
 */
export interface ObservationDetail {
	id: string;
	/** Event type — the panel heading, e.g. "Speed Violation". */
	title: string;
	/** Full sentence describing what was detected. */
	description?: string;
	status: ObservationStatus;
	severity: ObservationSeverity;
	/** System that raised it (AVL, ConnectedWorker, CCTV, ClinicViolation…). */
	source?: string;
	/** Observation category/type. */
	category?: string;
	/** Contractor the event is attributed to; omitted renders as "Not Determined". */
	company?: string;
	/** Zone the event was located in. */
	zone?: string;
	/** Identical events rolled up into this one, when > 0. */
	groupCount?: number;
	/** Responder working an open observation. */
	assignedTo?: string;
	/** Responder who closed it; omitted on a desk dismissal. */
	closedBy?: string;
	/** Closed as a false positive — drives the header badge. */
	falsePositive?: boolean;
	updatedAt?: string;
}

export interface ObservationDetailAction {
	id: string;
	label: string;
	icon?: React.ReactNode;
	/** `destructive` renders the danger treatment. Default `default`. */
	tone?: "default" | "destructive";
	disabled?: boolean;
}

export interface ObservationDetailPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
	observation: ObservationDetail;
	/** Closes the panel. Omit to hide the close button. */
	onClose?: () => void;
	/** Shows a back arrow — set when this ticket was drilled into from something else, e.g. a camera. */
	onBack?: () => void;
	/** Accessible label for the back control, e.g. "Back to camera". Default "Back". */
	backLabel?: string;
	/** The lead action, rendered filled — e.g. "Mark as Opened" or "Close Issue". */
	primaryAction?: ObservationDetailAction;
	/** Everything else, rendered as outline buttons under the primary. */
	secondaryActions?: ObservationDetailAction[];
	onAction?: (actionId: string) => void;
	/**
	 * Comment + activity log; the thread doubles as the ticket's audit trail. Rendered in the order
	 * given and read oldest-first, so append new entries — they land directly above the composer,
	 * which is pinned to the foot of the panel.
	 */
	comments?: CommentItem[];
	commentValue?: string;
	onCommentValueChange?: (html: string) => void;
	onCommentSubmit?: (html: string) => void;
	/** Hide the composer, e.g. on a closed ticket the viewer cannot annotate. */
	hideComposer?: boolean;
	/**
	 * Panel width in px. Fixed on purpose — it floats over a map, so it must not grow with its content.
	 * Default `340`.
	 */
	width?: number;
}

function DetailRow({label, value}: {label: string; value: React.ReactNode}) {
	return (
		<div className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-3 wwc:text-xs">
			<span className="wwc:shrink-0 wwc:text-muted-foreground">{label}</span>
			<span className="wwc:min-w-0 wwc:text-right wwc:font-medium">{value}</span>
		</div>
	);
}

/**
 * Floating detail for one observation ticket: the record's fields, its lifecycle actions, and the
 * comment thread that doubles as its audit trail. Sized rather than fluid, and internally scrolling,
 * so it can float over a map without ever outgrowing it — pair with `ObservationsMap`'s `detail` slot,
 * which pins it to the top-right corner.
 *
 * The record shape mirrors the Safety Manager list view, so the same violation reads identically
 * whether it was opened from the map or the list. Lifecycle rules stay with the caller: pass whichever
 * actions apply to this ticket's status and source.
 */
const ObservationDetailPanel = React.forwardRef<HTMLDivElement, ObservationDetailPanelProps>(
	(
		{
			className,
			observation,
			onClose,
			onBack,
			backLabel,
			primaryAction,
			secondaryActions = [],
			onAction,
			comments = [],
			commentValue,
			onCommentValueChange,
			onCommentSubmit,
			hideComposer = false,
			width = 340,
			style,
			...props
		},
		ref,
	) => {
		const endRef = React.useRef<HTMLDivElement>(null);
		// New entries are appended, so bring the foot of the thread into view rather than leaving it
		// below the fold under the pinned composer.
		React.useEffect(() => {
			endRef.current?.scrollIntoView({block: "end"});
		}, [comments.length]);

		const o = observation;
		return (
			<DetailPanelShell
				ref={ref}
				className={className}
				style={style}
				width={width}
				title={o.title}
				onBack={onBack}
				backLabel={backLabel}
				onClose={onClose}
				footer={
					hideComposer ? undefined : (
						<CommentComposer
							value={commentValue}
							onChange={onCommentValueChange}
							onSubmit={onCommentSubmit}
							placeholder="Add a comment..."
							submitLabel="Comment"
							minHeight="3"
							toolbarActions={["bold", "italic", "list-bulleted"]}
						/>
					)
				}
				meta={
					<>
						<Badge variant={statusVariant(o.status)}>{STATUS_LABEL[o.status]}</Badge>
						<Badge variant={severityVariant(o.severity)}>{o.severity}</Badge>
						{o.falsePositive && <Badge variant="dangerSoft">False Positive</Badge>}
						{o.groupCount !== undefined && o.groupCount > 0 && <Badge variant="outline">+{o.groupCount}</Badge>}
					</>
				}
				{...props}
			>
				{o.description && <p className="wwc:text-xs wwc:text-muted-foreground">{o.description}</p>}

				<div className="wwc:space-y-1.5">
					{o.source && <DetailRow label="Source" value={o.source} />}
					{o.category && <DetailRow label="Category" value={o.category} />}
					{o.zone && <DetailRow label="Zone" value={o.zone} />}
					{/* An unattributed event is "Not Determined", not blank — the list view says the same. */}
					<DetailRow label="Company" value={o.company ?? "Not Determined"} />
					{o.status === "open" && <DetailRow label="Assigned to" value={o.assignedTo ?? "Not assigned yet"} />}
					{o.status === "closed" && <DetailRow label="Closed by" value={o.closedBy ?? "Dismissed — no responder"} />}
					{o.updatedAt && <DetailRow label="Updated" value={o.updatedAt} />}
				</div>

				{(primaryAction || secondaryActions.length > 0) && (
					<div className="wwc:flex wwc:flex-wrap wwc:gap-1.5 wwc:pt-0.5">
						{primaryAction && (
							<Button
								size="sm"
								variant={primaryAction.tone === "destructive" ? "destructive" : "default"}
								disabled={primaryAction.disabled}
								className="wwc:h-7 wwc:text-xs"
								onClick={() => onAction?.(primaryAction.id)}
							>
								{primaryAction.icon}
								{primaryAction.label}
							</Button>
						)}
						{secondaryActions.map((action) => (
							<Button
								key={action.id}
								size="sm"
								variant="outline"
								disabled={action.disabled}
								className={cn("wwc:h-7 wwc:text-xs", action.tone === "destructive" && "wwc:text-destructive")}
								onClick={() => onAction?.(action.id)}
							>
								{action.icon}
								{action.label}
							</Button>
						))}
					</div>
				)}

				<Separator />

				<CommentThread
					comments={comments}
					emptyState={
						<p className="wwc:py-3 wwc:text-center wwc:text-xs wwc:text-muted-foreground">No activity yet.</p>
					}
				/>
				{/* Scroll anchor: a new entry lands here, directly above the pinned composer. */}
				<div ref={endRef} />
			</DetailPanelShell>
		);
	},
);
ObservationDetailPanel.displayName = "ObservationDetailPanel";

export {ObservationDetailPanel};
