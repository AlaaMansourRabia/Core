import {cn} from "@corensystem/core-utils";
import * as React from "react";

import {Badge} from "./badge";
import {DetailPanelShell} from "./detail-panel-shell";
import {Separator} from "./separator";
import {ViolationList, type ViolationSummary} from "./violation-list";

/** Platforms a responder can acknowledge from, as the Safety Manager records them. */
export type ResponderPlatform = "Web" | "Android" | "iOS" | "Huawei" | "Unknown";

/**
 * One safety responder. Field-for-field the Safety Manager responder list's record, so a responder
 * opened from the map reads the same as the same responder opened from the list.
 */
export interface ResponderDetail {
	id: string | number;
	name: string;
	/** Avatar initials. Derived from the name when omitted. */
	initials?: string;
	/** Assigned role, e.g. "Safety Officer". */
	role?: string;
	/** Job trade/title, e.g. "INDIRECT-HSE SUPERVISOR". */
	trade?: string;
	online?: boolean;
	enrolledSince?: string;
	alertsSent?: number;
	alertsAcked?: number;
	alertsClosed?: number;
	acknowledgmentRate?: string;
	avgResponse?: string;
	timeOnSite?: string;
	timeInAssignedZone?: string;
	/** Acknowledgements broken down by platform. */
	platformAcks?: Partial<Record<ResponderPlatform, number>>;
	/** Notification channel, e.g. "Mobile". */
	channel?: string;
	mobileNumber?: string;
	/** Companies the responder covers. */
	companies?: string[];
	/** Companies beyond those listed, shown as "+N more". */
	companyOverflow?: number;
	/** Assigned zones, e.g. "All". */
	zones?: string;
	packages?: string;
	/** Observation sources that route to this responder. */
	observationSources?: string[];
}

export interface ResponderDetailPanelProps extends React.HTMLAttributes<HTMLDivElement> {
	responder: ResponderDetail;
	onClose?: () => void;
	/** Shows a back arrow — set when the responder was drilled into from something else. */
	onBack?: () => void;
	backLabel?: string;
	/** Violations assigned to this responder. */
	assigned?: ViolationSummary[];
	/**
	 * Violations inside their coverage radius that are not theirs — the ones they are close enough to
	 * pick up.
	 */
	nearby?: ViolationSummary[];
	/** Radius the `nearby` list was gathered from, for the section heading. */
	coverageMeters?: number;
	/** Drill into a violation from either list. */
	onViolationSelect?: (violation: ViolationSummary) => void;
	/** Panel width in px. Default `340`, matching the other floating panels. */
	width?: number;
}

function initialsOf(name: string) {
	return name
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0] ?? "")
		.join("")
		.toUpperCase();
}

function Row({label, value}: {label: string; value: React.ReactNode}) {
	return (
		<div className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-3 wwc:text-xs">
			<span className="wwc:shrink-0 wwc:text-muted-foreground">{label}</span>
			<span className="wwc:min-w-0 wwc:text-right wwc:font-medium">{value}</span>
		</div>
	);
}

/** A labelled figure in the alert-tally strip. */
function Stat({label, value}: {label: string; value: React.ReactNode}) {
	return (
		<div className="wwc:flex wwc:flex-col wwc:items-center wwc:gap-0.5 wwc:rounded-md wwc:bg-muted/50 wwc:px-2 wwc:py-1.5">
			<span className="wwc:text-sm wwc:font-semibold wwc:tabular-nums">{value}</span>
			<span className="wwc:text-[10px] wwc:text-muted-foreground">{label}</span>
		</div>
	);
}

/**
 * Floating profile for one safety responder: who they are, their alert tally, how they acknowledge,
 * and what they cover. The record mirrors the Safety Manager responder list, so the same responder
 * reads identically whether opened from the map or the list — pair with `ObservationsMap`'s `detail`
 * slot, which pins it to the top-right corner.
 */
const ResponderDetailPanel = React.forwardRef<HTMLDivElement, ResponderDetailPanelProps>(
	(
		{
			className,
			responder,
			onClose,
			onBack,
			backLabel,
			assigned = [],
			nearby = [],
			coverageMeters,
			onViolationSelect,
			width = 340,
			...props
		},
		ref,
	) => {
		const r = responder;
		const acks = Object.entries(r.platformAcks ?? {}).filter(([, n]) => (n ?? 0) > 0);
		return (
			<DetailPanelShell
				ref={ref}
				className={className}
				width={width}
				title={r.name}
				onBack={onBack}
				backLabel={backLabel}
				onClose={onClose}
				meta={
					<>
						<Badge variant={r.online ? "successSoft" : "neutralSoft"}>{r.online ? "Online" : "Offline"}</Badge>
						{r.role && <Badge variant="outline">{r.role}</Badge>}
					</>
				}
				{...props}
			>
				<div className="wwc:flex wwc:items-center wwc:gap-2.5">
					<span className="wwc:flex wwc:size-10 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-muted wwc:text-sm wwc:font-semibold wwc:text-muted-foreground">
						{r.initials ?? initialsOf(r.name)}
					</span>
					<div className="wwc:min-w-0">
						{r.trade && <p className="wwc:truncate wwc:text-xs wwc:font-medium">{r.trade}</p>}
						{r.enrolledSince && <p className="wwc:text-[11px] wwc:text-muted-foreground">Enrolled {r.enrolledSince}</p>}
					</div>
				</div>

				{/* Alert tally — the numbers the responder list ranks on. */}
				<div className="wwc:grid wwc:grid-cols-3 wwc:gap-1.5">
					<Stat label="Sent" value={r.alertsSent ?? 0} />
					<Stat label="Acked" value={r.alertsAcked ?? 0} />
					<Stat label="Closed" value={r.alertsClosed ?? 0} />
				</div>

				<div className="wwc:space-y-1.5">
					{r.acknowledgmentRate && <Row label="Acknowledgment rate" value={r.acknowledgmentRate} />}
					{r.avgResponse && <Row label="Avg. response" value={r.avgResponse} />}
					{r.timeOnSite && <Row label="Time on site" value={r.timeOnSite} />}
					{r.timeInAssignedZone && <Row label="Time in assigned zone" value={r.timeInAssignedZone} />}
				</div>

				<Separator />

				<div className="wwc:space-y-1">
					<p className="wwc:text-[11px] wwc:font-medium wwc:text-muted-foreground">
						Assigned to them ({assigned.length})
					</p>
					{assigned.length === 0 ? (
						<p className="wwc:py-2 wwc:text-center wwc:text-xs wwc:text-muted-foreground">Nothing assigned.</p>
					) : (
						<ViolationList violations={assigned} onSelect={onViolationSelect} />
					)}
				</div>

				<div className="wwc:space-y-1">
					<p className="wwc:text-[11px] wwc:font-medium wwc:text-muted-foreground">
						{/* Not theirs, but within reach — the queue they could pick from. */}
						In range ({nearby.length}){coverageMeters ? ` · ${coverageMeters}m` : ""}
					</p>
					{nearby.length === 0 ? (
						<p className="wwc:py-2 wwc:text-center wwc:text-xs wwc:text-muted-foreground">Nothing else in range.</p>
					) : (
						<ViolationList violations={nearby} onSelect={onViolationSelect} />
					)}
				</div>

				{acks.length > 0 && (
					<>
						<Separator />
						<div className="wwc:space-y-1">
							<p className="wwc:text-[11px] wwc:font-medium wwc:text-muted-foreground">Acknowledged from</p>
							<div className="wwc:flex wwc:flex-wrap wwc:gap-1">
								{acks.map(([platform, count]) => (
									<Badge key={platform} variant="neutralSoft">
										{platform} · {count}
									</Badge>
								))}
							</div>
						</div>
					</>
				)}

				<Separator />

				<div className="wwc:space-y-1.5">
					{r.channel && <Row label="Channel" value={r.channel} />}
					{r.mobileNumber && <Row label="Mobile" value={r.mobileNumber} />}
					{r.zones && <Row label="Zones" value={r.zones} />}
					{r.packages && <Row label="Packages" value={r.packages} />}
				</div>

				{r.companies && r.companies.length > 0 && (
					<div className="wwc:space-y-1">
						<p className="wwc:text-[11px] wwc:font-medium wwc:text-muted-foreground">Companies</p>
						<div className="wwc:flex wwc:flex-wrap wwc:gap-1">
							{r.companies.map((company) => (
								<Badge key={company} variant="neutralSoft">
									{company}
								</Badge>
							))}
							{/* The list view shows the same overflow rather than growing the row. */}
							{r.companyOverflow ? <Badge variant="outline">+{r.companyOverflow} more</Badge> : null}
						</div>
					</div>
				)}

				{r.observationSources && r.observationSources.length > 0 && (
					<div className="wwc:space-y-1">
						<p className="wwc:text-[11px] wwc:font-medium wwc:text-muted-foreground">Observation sources</p>
						<div className={cn("wwc:flex wwc:flex-wrap wwc:gap-1")}>
							{r.observationSources.map((source) => (
								<Badge key={source} variant="neutralSoft">
									{source}
								</Badge>
							))}
						</div>
					</div>
				)}
			</DetailPanelShell>
		);
	},
);
ResponderDetailPanel.displayName = "ResponderDetailPanel";

export {ResponderDetailPanel};
