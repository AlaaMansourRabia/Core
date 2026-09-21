import {cn} from "@wakecap/core-utils";
import {ChevronRight} from "lucide-react";
import * as React from "react";

import {Badge} from "./badge";
import type {ObservationSeverity, ObservationStatus} from "./observation-detail-panel";

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

/** Enough of a violation to choose from a list — not the whole ticket. */
export interface ViolationSummary {
	id: string;
	title: string;
	status: ObservationStatus;
	severity?: ObservationSeverity;
	/** Right-aligned meta, typically the time it was reported. */
	timestamp?: string;
	/** Secondary line, e.g. a distance or a zone. */
	detail?: string;
}

export interface ViolationListProps extends Omit<React.HTMLAttributes<HTMLUListElement>, "onSelect"> {
	violations: ViolationSummary[];
	onSelect?: (violation: ViolationSummary) => void;
}

/**
 * A selectable list of violations, shared by every panel that offers a way into a ticket — a camera's
 * catch, a responder's queue. One component so the rows cannot drift apart between panels.
 */
const ViolationList = React.forwardRef<HTMLUListElement, ViolationListProps>(
	({className, violations, onSelect, ...props}, ref) => (
		<ul ref={ref} className={cn("wwc:-mx-1 wwc:space-y-0.5", className)} {...props}>
			{violations.map((violation) => (
				<li key={violation.id}>
					<button
						type="button"
						onClick={() => onSelect?.(violation)}
						className={cn(
							"wwc:flex wwc:w-full wwc:items-center wwc:gap-2 wwc:rounded-md wwc:px-1 wwc:py-1.5 wwc:text-left",
							"wwc:transition-colors wwc:hover:bg-accent wwc:hover:text-accent-foreground",
						)}
					>
						<span className="wwc:min-w-0 wwc:flex-1">
							<span className="wwc:block wwc:truncate wwc:text-xs wwc:font-medium">{violation.title}</span>
							{(violation.timestamp || violation.detail) && (
								<span className="wwc:block wwc:truncate wwc:text-[11px] wwc:text-muted-foreground">
									{[violation.timestamp, violation.detail].filter(Boolean).join(" · ")}
								</span>
							)}
						</span>
						<Badge variant={statusVariant(violation.status)} className="wwc:shrink-0 wwc:px-1.5 wwc:py-0">
							{STATUS_LABEL[violation.status]}
						</Badge>
						<ChevronRight className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:text-muted-foreground" />
					</button>
				</li>
			))}
		</ul>
	),
);
ViolationList.displayName = "ViolationList";

export {ViolationList};
