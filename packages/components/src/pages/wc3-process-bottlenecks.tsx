import type {ReactElement, ReactNode} from "react";

import {cn} from "@corensystem/core-utils";
import {ArrowRight, Timer, X} from "lucide-react";
import {useMemo} from "react";

import {Badge} from "../badge";
import {Button} from "../button";
import {Card, CardContent, CardHeader, CardTitle} from "../card";
import {Empty} from "../empty";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../table";
import {HoverTooltip} from "../tooltip";
import {
	OverSlaBadge,
	ProposedTag,
	SlaModelBadge,
	StateChip,
	WC3_PROCESS_FIXTURE_NOW,
	WC3_PROCESS_TINT,
	type Wc3ProcessBottleneck,
	type Wc3ProcessInstanceRow,
	type Wc3ProcessRecord,
	formatHours,
	processAgingBuckets,
	processBottlenecks,
	processFacts,
	processStateOf,
} from "./wc3-process-shared";

// The bottleneck / SLA analysis SECTION of the single-process page. It is imported BY
// wc3-process-detail.tsx, is never registered as a tab and is never mounted by the list — the user
// asked for "bottleneck analysis inside each process single page", so this is a panel of that page.
//
// FULLY STATELESS. The scope selection lives in the detail's `edit.stateSel`, so the canvas ring, the
// instances queue and this panel physically cannot disagree about which state is being looked at.
//
// EVERY NUMBER HERE IS DERIVED, NONE IS AUTHORED. Token counts, over-SLA counts, shares and ages all
// come out of processBottlenecks / processAgingBuckets, which read the frozen instance rows against
// WC3_PROCESS_FIXTURE_NOW ("2026-07-22 08:00"). There is exactly ONE snapshot and no history, so this
// panel never renders a trend, a target, a forecast or a sparkline — there is nothing behind them.
//
// The one distinction the UI has to keep making, because the fixture makes it: OBSERVED numbers
// (tokens, breaches, ages — measured off live rows) versus a DECLARED SLA (a proposed governance
// layer that no engine enforces yet). They are labelled as such in the table header and the footnote.

/** Stable identity, so an omitted `instances` does not re-run every memo below on each render. */
const EMPTY_ROWS: readonly Wc3ProcessInstanceRow[] = [];

export type ProcessBottlenecksProps = {
	process: Wc3ProcessRecord;
	/**
	 * The rows this process's tokens are. Empty means no live work — every ranking, histogram and
	 * count below reads THESE, never a fixture, so a real process shows real numbers.
	 */
	instances?: readonly Wc3ProcessInstanceRow[];
	/** The detail page's `edit.stateSel`. Scopes the histogram and highlights the ranked row. */
	selectedStateId: string | null;
	/** Toggling the scope. Passing null clears it back to "all non-terminal". */
	onSelectState: (stateId: string | null) => void;
	/** Jump to the instances queue scoped to a state. Absent = the "Open queue" affordance is dropped. */
	onOpenInstances?: (stateId: string) => void;
	className?: string;
};

/**
 * The prototype's `stateBox()` tint thresholds, ported exactly: more than half the tokens over SLA is
 * danger, any at all is warn, none is neutral. WC3_PROCESS_TINT.danger owns the 0.5 so the canvas and
 * this panel cannot drift.
 */
type Tint = "danger" | "warn" | "ok";

function tintOf(overShare: number): Tint {
	if (overShare > WC3_PROCESS_TINT.danger) return "danger";
	if (overShare > 0) return "warn";
	return "ok";
}

const TINT_BAR: Record<Tint, string> = {
	danger: "wwc:bg-red-500",
	warn: "wwc:bg-amber-500",
	ok: "wwc:bg-muted-foreground/30",
};

const TINT_BADGE: Record<Tint, "dangerSoft" | "warningSoft" | "neutralSoft"> = {
	danger: "dangerSoft",
	warn: "warningSoft",
	ok: "neutralSoft",
};

const pct = (share: number) => `${Math.round(share * 100)}%`;

function SectionNote({children}: {children: ReactNode}): ReactElement {
	return <p className="wwc:text-xs wwc:text-muted-foreground">{children}</p>;
}

/**
 * One aging bar: the whole bucket sized against the busiest bucket, split into the part still inside
 * its SLA and the part past it. A bucket with no tokens draws no bar at all rather than a zero-width
 * sliver, so "nothing is this old" reads as empty instead of as a rendering artefact.
 */
function AgingBar({label, count, over, max}: {label: string; count: number; over: number; max: number}): ReactElement {
	const width = max > 0 ? (count / max) * 100 : 0;
	const overShare = count > 0 ? (over / count) * 100 : 0;
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:text-xs">
			<span className="wwc:w-14 wwc:shrink-0 wwc:text-muted-foreground">{label}</span>
			<HoverTooltip
				content={
					count === 0
						? `No open tokens aged ${label}.`
						: `${count} token${count === 1 ? "" : "s"} aged ${label} — ${over} past SLA.`
				}
			>
				<div className="wwc:h-2.5 wwc:min-w-0 wwc:flex-1 wwc:overflow-hidden wwc:rounded-full wwc:bg-muted">
					<div className="wwc:flex wwc:h-full" style={{width: `${width}%`}}>
						<div className="wwc:h-full wwc:flex-1 wwc:bg-muted-foreground/40" />
						{over > 0 ? <div className="wwc:h-full wwc:bg-red-500" style={{width: `${overShare}%`}} /> : null}
					</div>
				</div>
			</HoverTooltip>
			<span className="wwc:w-16 wwc:shrink-0 wwc:text-right wwc:tabular-nums">
				{count}
				{over > 0 ? <span className="wwc:text-red-600 wwc:dark:text-red-400">{` / ${over}`}</span> : null}
			</span>
		</div>
	);
}

/** The declared SLA cell. An em dash is a real answer here, and it means two different things. */
function AppliedSlaCell({row, severityDriven}: {row: Wc3ProcessBottleneck; severityDriven: boolean}): ReactElement {
	if (severityDriven) {
		// processRowSlaHours consults slaBySeverity FIRST, so processBottlenecks reports slaHours: null
		// for every state of a severity-driven process — the per-state value, if any, is dead weight.
		return (
			<span className="wwc:flex wwc:items-center wwc:gap-1.5">
				<span className="wwc:text-muted-foreground">—</span>
				<span className="wwc:text-[11px] wwc:text-muted-foreground">severity-driven</span>
			</span>
		);
	}
	if (row.slaHours === null) {
		return (
			<HoverTooltip content={`“${row.state.name}” declares no SLA, so its tokens can never be counted as breached.`}>
				<span className="wwc:text-muted-foreground">—</span>
			</HoverTooltip>
		);
	}
	return <span className="wwc:tabular-nums">{`${row.slaHours} h`}</span>;
}

export function ProcessBottlenecksSection({
	process,
	instances = EMPTY_ROWS,
	selectedStateId,
	onSelectState,
	onOpenInstances,
	className,
}: ProcessBottlenecksProps): ReactElement {
	const rows = useMemo(() => [...instances], [instances]);
	const facts = useMemo(() => processFacts(process, rows), [process, rows]);
	const ranked = useMemo(() => processBottlenecks(process, rows), [process, rows]);

	// The scope is whatever the page has selected, resolved against THIS process — a stale id (the page
	// keys on process.id, but a state can also be deleted under the selection) scopes to nothing rather
	// than to a phantom state.
	const scopeState = selectedStateId ? (process.states.find((s) => s.id === selectedStateId) ?? null) : null;
	const buckets = useMemo(
		() => processAgingBuckets(process, rows, scopeState ? scopeState.id : undefined),
		[process, rows, scopeState],
	);

	// Rows whose status value matches no declared state sit in NO state: they are counted by neither
	// processOpenRows nor processBottlenecks. That is not a rounding error — it is the whole story for a
	// process created this session on an object type another process already claims, whose freshly
	// named states match none of the live status values.
	const unmatched = useMemo(() => rows.filter((r) => processStateOf(process, r) === undefined).length, [process, rows]);

	const scopedTokens = buckets.reduce((sum, b) => sum + b.count, 0);
	const scopedOver = buckets.reduce((sum, b) => sum + b.over, 0);
	const maxBucket = buckets.reduce((max, b) => Math.max(max, b.count), 0);

	const severityDriven = process.slaBySeverity !== null;
	const noSlaStates = severityDriven ? [] : ranked.filter((r) => r.slaHours === null);

	// ── The three honest empty readings ───────────────────────────────────────
	// Each is a different fact about the data, so each says a different thing. None of them invents a
	// count to make the panel look populated.

	if (ranked.length === 0) {
		return (
			<div className={className}>
				<Empty
					icon={<Timer className="wwc:h-6 wwc:w-6" />}
					title="Nothing can bottleneck here"
					description={`Every state in “${process.name}” is terminal, so no token can be waiting in one. Bottleneck analysis ranks non-terminal states only — a terminal state holds finished work, and processRowOverSla returns false for it unconditionally.`}
				/>
			</div>
		);
	}

	if (rows.length === 0) {
		return (
			<div className={className}>
				<Empty
					icon={<Timer className="wwc:h-6 wwc:w-6" />}
					title="No token rows to analyse"
					description={`Tokens are the live rows of ${facts.objectTypeName ?? process.objectTypeId}, and this workspace holds none for it. The ${ranked.length} non-terminal state${ranked.length === 1 ? "" : "s"} of this graph ${ranked.length === 1 ? "is" : "are"} declared but empty, so there is no age to bucket and no SLA to breach.`}
				/>
			</div>
		);
	}

	if (facts.openCount === 0) {
		return (
			<div className={className}>
				<Empty
					icon={<Timer className="wwc:h-6 wwc:w-6" />}
					title="No open tokens"
					description={
						unmatched > 0
							? `All ${rows.length} ${facts.objectTypeName ?? process.objectTypeId} row${rows.length === 1 ? "" : "s"} carry a “${process.statusProp}” value that matches no state in this graph, so none of them sits anywhere it could be held up. A row belongs to whichever state's value string matches its status field.`
							: `All ${rows.length} ${facts.objectTypeName ?? process.objectTypeId} row${rows.length === 1 ? "" : "s"} have reached a terminal state. Finished work is never over SLA, so there is nothing to rank.`
					}
				/>
			</div>
		);
	}

	return (
		<div className={cn("wwc:space-y-4", className)}>
			{/* ── (a) scope header + (b) the aging histogram ───────────────────── */}
			<Card>
				<CardHeader className="wwc:gap-2 wwc:p-3">
					<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
						<CardTitle className="wwc:text-sm">
							{scopeState ? `Aging in “${scopeState.name}”` : "Aging (all non-terminal)"}
						</CardTitle>
						{scopeState ? (
							<Button
								variant="ghost"
								size="sm"
								className="wwc:h-6 wwc:gap-1 wwc:px-1.5 wwc:text-[11px]"
								onClick={() => onSelectState(null)}
							>
								<X className="wwc:h-3 wwc:w-3" />
								Clear scope
							</Button>
						) : null}
						<span className="wwc:ml-auto wwc:flex wwc:items-center wwc:gap-2">
							<SlaModelBadge process={process} />
							<OverSlaBadge over={scopedOver} total={scopedTokens} />
						</span>
					</div>
					<SectionNote>
						{`Observed: ${scopedTokens} token${scopedTokens === 1 ? "" : "s"} bucketed by age against the frozen fixture clock, ${WC3_PROCESS_FIXTURE_NOW}. One snapshot — no history, so no trend.`}
					</SectionNote>
					{/* The page's selection can land on a terminal state, which the ranking below excludes. The
					    histogram still scopes to it — the ages are real — but its breach count is structurally
					    zero, and saying so beats letting "0 over SLA" read as a clean queue. */}
					{scopeState?.type === "terminal" ? (
						<SectionNote>
							{`“${scopeState.name}” is a terminal state: its tokens are finished work, so processRowOverSla returns false for every one of them and this scope can never report a breach. It is excluded from the ranking below.`}
						</SectionNote>
					) : null}
				</CardHeader>
				<CardContent className="wwc:space-y-1.5 wwc:p-3 wwc:pt-0">
					{buckets.map((bucket) => (
						<AgingBar key={bucket.label} label={bucket.label} count={bucket.count} over={bucket.over} max={maxBucket} />
					))}
					<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-x-3 wwc:gap-y-1 wwc:pt-1 wwc:text-[11px] wwc:text-muted-foreground">
						<span className="wwc:flex wwc:items-center wwc:gap-1.5">
							<span className="wwc:inline-block wwc:h-1.5 wwc:w-4 wwc:rounded-full wwc:bg-muted-foreground/40" />
							within SLA
						</span>
						<span className="wwc:flex wwc:items-center wwc:gap-1.5">
							<span className="wwc:inline-block wwc:h-1.5 wwc:w-4 wwc:rounded-full wwc:bg-red-500" />
							past SLA
						</span>
						<span>bars are counts, scaled to the busiest bucket</span>
					</div>
				</CardContent>
			</Card>

			{/* ── (c) the ranked bottleneck table ──────────────────────────────── */}
			<Card>
				<CardHeader className="wwc:gap-2 wwc:p-3">
					<CardTitle className="wwc:text-sm">
						Bottlenecks
						<span className="wwc:font-normal wwc:text-muted-foreground">{` (${ranked.length} non-terminal state${ranked.length === 1 ? "" : "s"})`}</span>
					</CardTitle>
					<SectionNote>
						Ranked worst-first by share of tokens past SLA, then by raw breach count, then by oldest token. Tokens,
						breaches and ages are <b>observed</b> from live rows; the SLA column is <b>declared</b> — a proposed
						governance layer, not an as-built engine setting.
					</SectionNote>
				</CardHeader>
				<CardContent className="wwc:p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>State</TableHead>
								<TableHead className="wwc:w-20 wwc:text-right">Tokens</TableHead>
								<TableHead className="wwc:w-20 wwc:text-right">Over</TableHead>
								<TableHead className="wwc:w-40">Share past SLA</TableHead>
								<TableHead className="wwc:w-24 wwc:text-right">Avg age</TableHead>
								<TableHead className="wwc:w-24 wwc:text-right">Max age</TableHead>
								<TableHead className="wwc:w-32">Declared SLA</TableHead>
								<TableHead className="wwc:w-px" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{ranked.map((row) => {
								const tint = tintOf(row.overShare);
								const picked = row.state.id === selectedStateId;
								return (
									<TableRow
										key={row.state.id}
										data-state={picked ? "selected" : undefined}
										className="wwc:cursor-pointer"
										// Selecting a state is a cheap, reversible scope change, not navigation — so the whole
										// row takes it. The state name is still a real button, so it is reachable by keyboard.
										onClick={() => onSelectState(picked ? null : row.state.id)}
									>
										<TableCell>
											<button
												type="button"
												className="wwc:cursor-pointer wwc:rounded-sm wwc:text-left wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring"
												onClick={(e) => {
													e.stopPropagation();
													onSelectState(picked ? null : row.state.id);
												}}
											>
												<StateChip state={row.state} />
											</button>
										</TableCell>
										<TableCell className="wwc:text-right wwc:tabular-nums">{row.tokens}</TableCell>
										<TableCell className="wwc:text-right wwc:tabular-nums">
											{row.over > 0 ? (
												<Badge variant={TINT_BADGE[tint]}>{row.over}</Badge>
											) : (
												<span className="wwc:text-muted-foreground">0</span>
											)}
										</TableCell>
										<TableCell>
											<span className="wwc:flex wwc:items-center wwc:gap-2">
												<span className="wwc:h-1.5 wwc:min-w-0 wwc:flex-1 wwc:overflow-hidden wwc:rounded-full wwc:bg-muted">
													<span
														className={cn("wwc:block wwc:h-full wwc:rounded-full", TINT_BAR[tint])}
														style={{width: `${Math.round(row.overShare * 100)}%`}}
													/>
												</span>
												<span className="wwc:w-9 wwc:shrink-0 wwc:text-right wwc:tabular-nums">
													{row.tokens === 0 ? "—" : pct(row.overShare)}
												</span>
											</span>
										</TableCell>
										<TableCell className="wwc:text-right wwc:tabular-nums">
											{row.tokens === 0 ? "—" : formatHours(row.avgAgeHours)}
										</TableCell>
										<TableCell className="wwc:text-right wwc:tabular-nums">
											{row.tokens === 0 ? "—" : formatHours(row.maxAgeHours)}
										</TableCell>
										<TableCell>
											<AppliedSlaCell row={row} severityDriven={severityDriven} />
										</TableCell>
										<TableCell className="wwc:w-px wwc:max-w-none wwc:whitespace-nowrap">
											{onOpenInstances && row.tokens > 0 ? (
												<Button
													variant="ghost"
													size="sm"
													className="wwc:h-6 wwc:gap-1 wwc:px-1.5 wwc:text-[11px]"
													onClick={(e) => {
														e.stopPropagation();
														onOpenInstances(row.state.id);
													}}
												>
													Open queue
													<ArrowRight className="wwc:h-3 wwc:w-3" />
												</Button>
											) : null}
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* ── (d) what these numbers are, and are not ──────────────────────── */}
			<div className="wwc:flex wwc:flex-col wwc:gap-2 wwc:rounded-md wwc:border wwc:border-border wwc:bg-muted/40 wwc:p-3 wwc:text-xs">
				<span className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
					<ProposedTag />
					<span className="wwc:font-semibold wwc:tracking-wide wwc:text-muted-foreground wwc:uppercase">SLA layer</span>
				</span>
				{/* Verbatim. Paraphrasing this note is how a port starts claiming shipped behaviour. */}
				<span className="wwc:text-foreground">{process.slaNote}</span>

				{severityDriven && process.slaBySeverity ? (
					<span className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5">
						<span className="wwc:text-muted-foreground">Severity table:</span>
						{Object.entries(process.slaBySeverity).map(([severity, hours]) => (
							<Badge key={severity} variant="neutralSoft">{`${severity} ${hours} h`}</Badge>
						))}
					</span>
				) : null}

				{noSlaStates.length > 0 ? (
					<span className="wwc:text-muted-foreground">
						{`${noSlaStates.length} of ${ranked.length} non-terminal state${ranked.length === 1 ? "" : "s"} declare no SLA (${noSlaStates
							.map((r) => r.state.name)
							.join(", ")}), so their tokens are never counted as breached however old they get.`}
					</span>
				) : null}

				{unmatched > 0 ? (
					<span className="wwc:text-muted-foreground">
						{`${unmatched} of ${rows.length} ${facts.objectTypeName ?? process.objectTypeId} row${unmatched === 1 ? "" : "s"} carry a “${process.statusProp}” value matching no state in this graph. They sit in no state and are excluded from every number above.`}
					</span>
				) : null}
			</div>
		</div>
	);
}
