import type {ColumnDef} from "@tanstack/react-table";

import {cn} from "@corensystem/core-utils";
import {Ban, Bolt, CircleCheck, CircleX, Link2, Network, RotateCw, TriangleAlert} from "lucide-react";
import {useEffect, useMemo, useState} from "react";

import {Badge} from "../badge";
import {Banner} from "../banner";
import {Button} from "../button";
import {Card, CardContent, CardHeader, CardTitle} from "../card";
import {DataTable, DataTableColumnHeader} from "../data-table";
import {Empty} from "../empty";
import {Filter, FilterCategory, FilterContent, FilterOption, FilterTrigger, type FilterValue} from "../filter";
import {Toaster, toast} from "../sonner";
import {HoverTooltip} from "../tooltip";
import {
	WC3_ACTION_TYPES,
	WC3_INTERFACES,
	WC3_LINK_TYPES,
	WC3_OBJECT_TYPES,
	WC3_SHARED_PROPERTIES,
	type Wc3Interface,
	type Wc3Property,
	getInterface,
	getObjectType,
} from "./wc3-ontology-data";
import {OntologyGlyph} from "./wc3-ontology-glyphs";

// The Health (ontology lint) surface of the Ontology Manager, ported from the unified-workspace
// prototype's LintView. The engine below reproduces the prototype's eleven anti-pattern rules — same
// thresholds, same message strings, same emission order — so the findings match what the prototype was
// reviewed against. Data comes from wc3-ontology-data.ts, the prototype's own store, extracted verbatim.
//
// The prototype's only per-finding affordance is "Open →", which routes to ANOTHER primitive's detail
// page (object type / link type / action type / interface). A finding is not a record and has no route
// of its own, so this tab is a single list surface: the drill-in it needs is the ability to hand a
// target to the tab that already owns that primitive's detail page. Hence `onOpenElement`, and no
// detail-page export from this file.

// ─── Local copies of two module-private helpers from wc3-ontology-views.tsx ───

/**
 * Content pane for one tab — identical to the `Pane` in wc3-ontology-views.tsx.
 *
 * It is duplicated rather than imported because wc3-ontology-views.tsx imports HealthView for its
 * ONTOLOGY_VIEWS record; importing `Pane` back out of it would close an import cycle. Twelve lines of
 * layout is the cheaper of the two costs.
 */
function Pane({flush, children}: {flush?: boolean; children: React.ReactNode}) {
	return (
		<div
			className={cn(
				"wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:gap-4 wwc:overflow-auto wwc:px-6 wwc:pb-6",
				flush ? "wwc:pt-0" : "wwc:pt-4",
			)}
		>
			{children}
		</div>
	);
}

// ─── The lint engine ─────────────────────────────────────────────────────────

/** Which primitive a finding points at. `ontology` is the whole store — it has no single record. */
export type LintTargetKind = "objectType" | "linkType" | "actionType" | "interface" | "ontology";

/** What "Open →" hands upward: enough for the workspace to pick a tab and reveal a record in it. */
export type LintTarget = {kind: LintTargetKind; id: string | null};

export type LintFinding = {
	/** Stable and unique — DataTable's `getRowId` needs it and repeats are counter-disambiguated. */
	id: string;
	severity: "error" | "warn";
	rule: string;
	/** Human-readable name of the offending element, as the prototype prints it. */
	target: string;
	targetKind: LintTargetKind;
	targetId: string | null;
	message: string;
};

/** The eleven anti-pattern rules the prototype checks, in the order its panel lists them. */
const LINT_RULES = [
	"Kitchen Sink",
	"Direct Schema Translation",
	"System Silos",
	"Excessive Many-to-Many",
	"Wide Sparse Type",
	"Deep Inheritance Chain",
	"Action Doing Pipeline Work",
	"Unclear Edit-vs-Index Boundary",
	"Unstable Primary Key",
	"Non-Verb Action Name",
	"Missing Description",
];

// The linter's verb list, verbatim. The prototype's create wizard accepts a WIDER list (it also allows
// add/remove/set/submit/open/start/stop/complete/mark), so an action named "Submit permit" passes
// creation and is then flagged here. That inconsistency is the prototype's, and it is reproduced
// rather than smoothed over — ten of the twelve findings depend on it.
const VERB_START =
	/^(assign|record|report|grant|retire|reassess|reassign|create|update|log|attach|schedule|approve|close|escalate|renew|onboard|link|baseline|delay|pour|inspect|issue|request)/i;

/** Shared-property values win, so lint must compare the effective API name, not the local one. */
function effectiveApiName(p: Wc3Property) {
	if (!p.sharedPropertyId) return p.apiName;
	return WC3_SHARED_PROPERTIES.find((s) => s.id === p.sharedPropertyId)?.apiName ?? p.apiName;
}

function interfaceDepth(iface: Wc3Interface, seen = new Set<string>()): number {
	if (seen.has(iface.id)) return 0;
	seen.add(iface.id);
	if (!iface.extends.length) return 0;
	return (
		1 +
		Math.max(
			...iface.extends.map((id) => {
				const parent = getInterface(id);
				return parent ? interfaceDepth(parent, seen) : 0;
			}),
		)
	);
}

export function runOntologyLint(): LintFinding[] {
	const findings: LintFinding[] = [];
	// One action can trip BOTH "Action Doing Pipeline Work" branches (a pipeline verb AND >5 rules), so
	// rule+target is not a unique key. Suffix each repeat with its occurrence number.
	const seen = new Map<string, number>();
	const add = (
		severity: LintFinding["severity"],
		rule: string,
		target: string,
		{kind, id}: LintTarget,
		message: string,
	) => {
		const base = `${rule}|${kind}|${id ?? "all"}`;
		const n = (seen.get(base) ?? 0) + 1;
		seen.set(base, n);
		findings.push({
			id: n === 1 ? base : `${base}|${n}`,
			severity,
			rule,
			target,
			targetKind: kind,
			targetId: id,
			message,
		});
	};

	WC3_OBJECT_TYPES.forEach((ot) => {
		const decoyNote = ot.isLintDecoy ? " (Seeded demo decoy — expected finding.)" : "";
		const at: LintTarget = {kind: "objectType", id: ot.id};

		if (ot.properties.length > 25)
			add(
				"error",
				"Kitchen Sink",
				ot.displayName,
				at,
				`${ot.properties.length} properties on one type — split into focused entities.`,
			);

		const rawProps = ot.properties.filter((p) => /^(fld_|col_|raw_|tbl_)/.test(p.apiName));
		if (rawProps.length >= 2 || /raw[ _]?table|_raw$/i.test(ot.displayName) || /RawTable$/i.test(ot.apiName))
			add(
				"error",
				"Direct Schema Translation",
				ot.displayName,
				at,
				`Property names copied 1:1 from a source table (${rawProps
					.slice(0, 3)
					.map((p) => p.apiName)
					.join(", ")}…). Model the real-world entity instead.${decoyNote}`,
			);

		if (ot.properties.length > 20 && ot.properties.filter((p) => p.required).length / ot.properties.length < 0.3)
			add(
				"warn",
				"Wide Sparse Type",
				ot.displayName,
				at,
				"Over 20 properties, under 30 % required — consider interfaces + composition.",
			);

		ot.datasources.forEach((d) => {
			if (d.pkDuplicates)
				add(
					"warn",
					"Unstable Primary Key",
					ot.displayName,
					at,
					`Datasource “${d.name}” contains duplicate primary-key values — keys must be stable and deterministic.${decoyNote}`,
				);
		});

		if (ot.datasources.length && ot.datasources.every((d) => d.kind === "stream")) {
			const editedBy = WC3_ACTION_TYPES.filter(
				(a) => Array.isArray(a.rules) && a.rules.some((r) => r.kind === "modifyObject" && r.objectTypeId === ot.id),
			);
			if (editedBy.length)
				add(
					"warn",
					"Unclear Edit-vs-Index Boundary",
					ot.displayName,
					at,
					`Stream-only type is edited by ${editedBy
						.map((a) => `“${a.displayName}”`)
						.join(", ")} — user edits will be clobbered on the next sync.`,
				);
		}

		if (!ot.description)
			add("warn", "Missing Description", ot.displayName, at, "Every element needs a description (best practice #8).");
	});

	// System silos: two types sharing a name stem and ≥4 property names are probably one entity split per source.
	for (let i = 0; i < WC3_OBJECT_TYPES.length; i++) {
		for (let j = i + 1; j < WC3_OBJECT_TYPES.length; j++) {
			const a = WC3_OBJECT_TYPES[i];
			const b = WC3_OBJECT_TYPES[j];
			const aApis = new Set(a.properties.map(effectiveApiName));
			const shared = b.properties.map(effectiveApiName).filter((x) => aApis.has(x));
			const aWord = a.displayName.split(/[\s:]+/)[0].toLowerCase();
			const bWord = b.displayName.split(/[\s:]+/)[0].toLowerCase();
			if (shared.length >= 4 && aWord === bWord)
				add(
					"error",
					"System Silos",
					`${a.displayName} / ${b.displayName}`,
					// The prototype opens the first of the pair; the message names both.
					{kind: "objectType", id: a.id},
					`Two types share ${shared.length} properties and a name stem — likely one real-world entity split per source system. Merge them.`,
				);
		}
	}

	const m2m = WC3_LINK_TYPES.filter((l) => l.cardinality === "many-to-many");
	m2m.forEach((l) => {
		if (l.backing.kind !== "joinTable" && l.backing.kind !== "intermediary")
			add(
				"error",
				"Excessive Many-to-Many",
				`${l.sideA.displayName} ↔ ${l.sideB.displayName}`,
				{kind: "linkType", id: l.id},
				"Many-to-many link without a join table or intermediary object backing.",
			);
	});
	if (WC3_LINK_TYPES.length && m2m.length / WC3_LINK_TYPES.length > 0.4)
		add(
			"warn",
			"Excessive Many-to-Many",
			"Ontology-wide",
			// The one finding with no single record behind it — the prototype routes it to the link-types list.
			{kind: "ontology", id: null},
			`${Math.round((100 * m2m.length) / WC3_LINK_TYPES.length)} % of links are many-to-many — verify each is a real relationship that drives a workflow.`,
		);

	WC3_INTERFACES.forEach((it) => {
		const depth = interfaceDepth(it);
		if (depth >= 3)
			add(
				"warn",
				"Deep Inheritance Chain",
				it.displayName,
				{kind: "interface", id: it.id},
				`Extends chain is ${depth} levels deep — prefer composition over deep inheritance.`,
			);
	});

	WC3_ACTION_TYPES.forEach((at) => {
		const target: LintTarget = {kind: "actionType", id: at.id};
		if (/\b(sync|import|etl|ingest|migrate|reload|backfill)\b/i.test(`${at.displayName} ${at.apiName}`))
			add(
				"error",
				"Action Doing Pipeline Work",
				at.displayName,
				target,
				"Bulk data movement belongs in pipelines, not user actions.",
			);
		if (Array.isArray(at.rules) && at.rules.length > 5)
			add(
				"warn",
				"Action Doing Pipeline Work",
				at.displayName,
				target,
				`${at.rules.length} rules in one action — likely doing pipeline-scale work.`,
			);
		if (!VERB_START.test(at.displayName))
			add(
				"warn",
				"Non-Verb Action Name",
				at.displayName,
				target,
				"Action names should start with a verb (“Assign crew to activity”).",
			);
	});

	return findings;
}

// ─── Facets ──────────────────────────────────────────────────────────────────

// The engine is pure over a static fixture, so one module-level run feeds both the table and its facets.
const FINDINGS = runOntologyLint();

/** Every element the linter scans — the number the prototype's re-run toast reports. */
const SCANNED_COUNT = WC3_OBJECT_TYPES.length + WC3_LINK_TYPES.length + WC3_ACTION_TYPES.length + WC3_INTERFACES.length;

const SEVERITY_LABEL: Record<LintFinding["severity"], string> = {error: "Error", warn: "Warning"};

const KIND_LABEL: Record<LintTargetKind, string> = {
	objectType: "Object type",
	linkType: "Link type",
	actionType: "Action type",
	interface: "Interface",
	ontology: "Ontology-wide",
};

// Facets derive from the FINDINGS, never from LINT_RULES: only a few of the eleven rules fire on this
// fixture, and offering the clean ones would be a filter that can never match a row. The full eleven
// stay in the "Rules checked" card, which is where a clean rule belongs.
const SEVERITIES = [...new Set(FINDINGS.map((f) => f.severity))].sort();
const RULES_HIT = [...new Set(FINDINGS.map((f) => f.rule))].sort();
const KINDS_HIT = [...new Set(FINDINGS.map((f) => f.targetKind))].sort();

/** The seeded decoy the lint panel exists to catch — the banner only appears while it is in the store. */
const DECOY = WC3_OBJECT_TYPES.find((o) => o.isLintDecoy);

// ─── View ────────────────────────────────────────────────────────────────────

/**
 * Mirrors `OntologyViewProps` in wc3-ontology-views.tsx so HealthView drops straight into the
 * ONTOLOGY_VIEWS record. `revealId` is unused here — Health has no record to reveal — but it is part of
 * the shared shape.
 */
export type HealthViewProps = {
	onDetailChange?: (label: string | null) => void;
	revealId?: string | null;
	/** Hand a finding's target to the tab that owns that primitive's detail page. */
	onOpenElement?: (target: LintTarget) => void;
};

/** The glyph the target's own tab shows, so a finding reads as the element it points at. */
function TargetGlyph({finding}: {finding: LintFinding}) {
	if (finding.targetKind === "objectType") {
		const ot = finding.targetId ? getObjectType(finding.targetId) : undefined;
		return ot ? <OntologyGlyph name={ot.icon} color={ot.color} /> : null;
	}
	if (finding.targetKind === "interface") {
		const it = finding.targetId ? getInterface(finding.targetId) : undefined;
		return it ? <OntologyGlyph name={it.icon} /> : null;
	}
	if (finding.targetKind === "actionType")
		return <Bolt className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:text-amber-600" />;
	if (finding.targetKind === "linkType")
		return <Link2 className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:text-muted-foreground" />;
	return <Network className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:text-muted-foreground" />;
}

export function HealthView({onOpenElement}: HealthViewProps = {}) {
	// Re-running is a real interaction in the prototype (the store is live); here the fixture is static,
	// so the button re-computes and stamps the run rather than pretending the result changed.
	const [ranAt, setRanAt] = useState<string | null>(null);
	const [filters, setFilters] = useState<FilterValue>({});
	const [dismissedDecoy, setDismissedDecoy] = useState(false);

	// The demo app mounts a Toaster of its own; standalone renders of this tab do not. Detect one rather
	// than always mounting a second, which would double every toast.
	const [ownToaster, setOwnToaster] = useState(false);
	useEffect(() => {
		const has = document.querySelector('[data-sonner-toaster], section[aria-live][aria-label*="Notification"]');
		setOwnToaster(!has);
	}, []);

	const findings = FINDINGS;
	const errors = findings.filter((f) => f.severity === "error");
	const warnings = findings.filter((f) => f.severity === "warn");
	const hitRules = useMemo(() => new Set(findings.map((f) => f.rule)), [findings]);

	const data = useMemo(
		() =>
			findings.filter((f) =>
				Object.entries(filters).every(([key, selected]) => {
					if (!selected || selected.length === 0) return true;
					if (key === "element") return selected.includes(f.targetKind);
					return selected.includes(String(f[key as "severity" | "rule"]));
				}),
			),
		[filters, findings],
	);

	const columns: ColumnDef<LintFinding, unknown>[] = useMemo(
		() => [
			{
				accessorKey: "severity",
				header: ({column}) => <DataTableColumnHeader column={column} title="Severity" />,
				cell: ({row}) => (
					<span className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:whitespace-nowrap">
						{row.original.severity === "error" ? (
							<Ban className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:text-red-600" />
						) : (
							<TriangleAlert className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:text-amber-600" />
						)}
						<Badge variant={row.original.severity === "error" ? "dangerSoft" : "warningSoft"}>
							{SEVERITY_LABEL[row.original.severity]}
						</Badge>
					</span>
				),
				meta: {cellClassName: "wwc:w-px wwc:max-w-none wwc:whitespace-nowrap"},
			},
			{
				accessorKey: "rule",
				header: ({column}) => <DataTableColumnHeader column={column} title="Rule" />,
				cell: ({row}) => <span className="wwc:whitespace-nowrap wwc:font-medium">{row.original.rule}</span>,
				meta: {cellClassName: "wwc:w-px wwc:max-w-none wwc:whitespace-nowrap"},
			},
			{
				id: "target",
				accessorFn: (f) => f.target,
				header: ({column}) => <DataTableColumnHeader column={column} title="Element" />,
				cell: ({row}) => {
					const f = row.original;
					// The ontology-wide finding has no record behind it, and without a handler there is
					// nowhere to go — either way, render plain text rather than a dead link.
					const openable = Boolean(onOpenElement) && f.targetKind !== "ontology";
					const decoy = f.targetKind === "objectType" && f.targetId === DECOY?.id;
					return (
						<span className="wwc:flex wwc:items-center wwc:gap-2 wwc:whitespace-nowrap">
							<TargetGlyph finding={f} />
							{openable ? (
								<button
									type="button"
									onClick={() => onOpenElement?.({kind: f.targetKind, id: f.targetId})}
									className="wwc:text-left wwc:underline wwc:underline-offset-2 wwc:transition-colors wwc:hover:text-primary"
								>
									{f.target}
								</button>
							) : (
								<span>{f.target}</span>
							)}
							{decoy && (
								// Badge is not a forwardRef component, so the tooltip anchors on a wrapping span.
								<HoverTooltip content="Seeded decoy for the lint panel — never ship this row">
									<span>
										<Badge variant="warningSoft">lint demo</Badge>
									</span>
								</HoverTooltip>
							)}
						</span>
					);
				},
				meta: {cellClassName: "wwc:w-px wwc:max-w-none wwc:whitespace-nowrap"},
			},
			{
				id: "element",
				accessorFn: (f) => f.targetKind,
				header: ({column}) => <DataTableColumnHeader column={column} title="Type" />,
				cell: ({row}) => <Badge variant="neutralSoft">{KIND_LABEL[row.original.targetKind]}</Badge>,
				meta: {cellClassName: "wwc:w-px wwc:max-w-none wwc:whitespace-nowrap"},
			},
			{
				accessorKey: "message",
				header: "Finding",
				cell: ({row}) => <p className="wwc:text-muted-foreground">{row.original.message}</p>,
				// The message carries the property and action names that make a finding actionable, so it
				// wraps instead of taking TableCell's default truncation.
				meta: {cellClassName: "wwc:max-w-none wwc:overflow-visible wwc:whitespace-normal wwc:text-clip wwc:align-top"},
			},
		],
		[onOpenElement],
	);

	return (
		<Pane flush>
			{DECOY && !dismissedDecoy && (
				<div className="wwc:pt-4">
					<Banner
						variant="info"
						title="Seeded lint decoy"
						description={`“${DECOY.displayName}” is a deliberate anti-pattern seeded into the ontology so this panel has something real to catch. It is not part of the recommended model — expect its findings.`}
						action={
							onOpenElement
								? {label: "Open the decoy", onClick: () => onOpenElement({kind: "objectType", id: DECOY.id})}
								: undefined
						}
						onDismiss={() => setDismissedDecoy(true)}
					/>
				</div>
			)}

			{findings.length === 0 ? (
				<Empty
					icon={<CircleCheck className="wwc:h-6 wwc:w-6" />}
					title="No anti-patterns detected"
					description="The ontology models real-world entities with curated properties, stable keys, verb-named actions and justified relationships."
				/>
			) : (
				<Filter value={filters} onChange={setFilters}>
					<DataTable
						columns={columns}
						data={data}
						searchKey="target"
						searchPlaceholder="Search findings…"
						showColumnToggle
						recordLabel="finding"
						pageSize={20}
						emptyMessage="No findings match your filters."
						getRowId={(f) => f.id}
						// Severity and element values are ids, so chips would read "warn" / "actionType" without this.
						filterChipLabel={(category, value) =>
							category === "severity"
								? (SEVERITY_LABEL[value as LintFinding["severity"]] ?? value)
								: category === "element"
									? (KIND_LABEL[value as LintTargetKind] ?? value)
									: value
						}
						toolbarExtra={
							<>
								{/* The severity split is the one number the tab badge can't carry, so it rides with the control. */}
								<span className="wwc:text-xs wwc:text-muted-foreground">
									{findings.length} finding(s) · {errors.length} error(s), {warnings.length} warning(s)
									<span className="wwc:hidden wwc:xl:inline"> — anti-pattern detection over the live store</span>
								</span>
								<Button
									size="sm"
									onClick={() => {
										setRanAt(new Date().toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"}));
										toast(`Lint re-ran across ${SCANNED_COUNT} elements — ${findings.length} finding(s)`);
									}}
								>
									<RotateCw className="wwc:h-3.5 wwc:w-3.5" />
									Re-run lint{ranAt && <span className="wwc:font-normal wwc:opacity-70"> (last: {ranAt})</span>}
								</Button>
								<FilterTrigger />
								<FilterContent>
									<FilterCategory value="severity" label="Severity">
										{SEVERITIES.map((s) => (
											<FilterOption key={s} value={s}>
												{SEVERITY_LABEL[s]}
											</FilterOption>
										))}
									</FilterCategory>
									<FilterCategory value="rule" label="Rule">
										{RULES_HIT.map((r) => (
											<FilterOption key={r} value={r}>
												{r}
											</FilterOption>
										))}
									</FilterCategory>
									<FilterCategory value="element" label="Element">
										{KINDS_HIT.map((k) => (
											<FilterOption key={k} value={k}>
												{KIND_LABEL[k]}
											</FilterOption>
										))}
									</FilterCategory>
								</FilterContent>
							</>
						}
					/>
				</Filter>
			)}

			<Card>
				<CardHeader>
					<CardTitle className="wwc:text-sm">Rules checked ({LINT_RULES.length})</CardTitle>
				</CardHeader>
				<CardContent className="wwc:space-y-3">
					<div className="wwc:flex wwc:flex-wrap wwc:gap-1.5">
						{LINT_RULES.map((r) => {
							const hit = hitRules.has(r);
							// Not clickable — the prototype's chips are a legend, not a filter. The Rule facet in
							// the toolbar is where filtering lives, and it only offers rules that can match.
							return (
								<Badge key={r} variant={hit ? "dangerSoft" : "successSoft"} className="wwc:font-normal">
									{hit ? <CircleX /> : <CircleCheck />}
									{r}
								</Badge>
							);
						})}
					</div>
					<p className="wwc:text-xs wwc:text-muted-foreground">
						Anti-patterns per the Foundry ontology guidance: Kitchen Sink · Direct Schema Translation · System Silos ·
						Excessive Many-to-Many · Wide Sparse Types · Deep Inheritance Chains · Actions doing pipeline work · unclear
						edit-vs-index boundaries.
					</p>
				</CardContent>
			</Card>

			{ownToaster ? <Toaster position="top-right" /> : null}
		</Pane>
	);
}
