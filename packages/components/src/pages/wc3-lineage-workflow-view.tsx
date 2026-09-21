import {cn} from "@wakecap/core-utils";
import {Bell, CircleX, Globe, Zap} from "lucide-react";
import {useMemo, useState} from "react";

import {Badge} from "../badge";
import {DateRangeTimePicker} from "../date-picker";
import {
	Filter,
	FilterCategory,
	FilterChips,
	FilterContent,
	FilterOption,
	FilterTrigger,
	type FilterValue,
} from "../filter";
import {TaskMonitor, type TaskMonitorItem} from "../task-monitor";
import {WC3_ACTION_RUNS, type Wc3ActionRun} from "./wc3-lineage-data";
import {Mono} from "./wc3-lineage-shared";
import {WC3_ACTION_TYPES, getObjectType, type Wc3ActionType} from "./wc3-ontology-data";

/*
 * ORDERING: a plain array reversal, exactly like the prototype's `S.actionRuns.slice().reverse()`.
 *
 * Do NOT swap this for the fixture's `actionRunsNewestFirst()` — that helper sorts by `ts`
 * descending and yields the OPPOSITE order. The seeded runs are [Record safety observation
 * (07:02:11), Issue permit (06:04:40)], so reversing puts "Issue permit — 06:04:40" first even
 * though its clock time is earlier. That inversion is the prototype's behaviour; do not "fix" it.
 */
const RUNS = WC3_ACTION_RUNS.slice().reverse();

/** There is no getActionType export in the fixture, so the lookup is built once here. */
const ACTION_TYPE_BY_ID = new Map(WC3_ACTION_TYPES.map((at) => [at.id, at]));

/**
 * Deselection sentinel. A bare `null` cannot mean "nothing selected", because a selection whose id
 * no longer matches a run has to fall back to the first row instead of clearing — see `run` below.
 */

/** Effect lines carry their own marker instead of a bullet; the marker itself is dropped. */
const EFFECT_MARKERS = [
	{prefix: "[bell] ", icon: Bell},
	{prefix: "[globe] ", icon: Globe},
];

/**
 * Values repeat — an action carries two `createLink` rules, and two effect lines can read alike — so
 * a bare value is not a unique key. Suffix each repeat with its occurrence number: `createLink`,
 * `createLink~2`, … The same helper the ontology views and the shared-property view each keep local.
 */
function keyed<T>(items: readonly T[], label: (item: T) => string) {
	const seen = new Map<string, number>();
	return items.map((item) => {
		const base = label(item);
		const n = (seen.get(base) ?? 0) + 1;
		seen.set(base, n);
		return {item, key: n === 1 ? base : `${base}~${n}`};
	});
}

/** The action's display name, falling back to the raw id when the action type has been deleted. */
function runLabel(run: Wc3ActionRun) {
	return ACTION_TYPE_BY_ID.get(run.atId)?.displayName ?? run.atId;
}

/** One bordered block in the downstream tree. */
function TreeBlock({title, children}: {title: string; children: React.ReactNode}) {
	return (
		<div className="wwc:rounded-md wwc:border wwc:border-border wwc:p-2.5">
			<div className="wwc:text-xs wwc:font-semibold">{title}</div>
			<div className="wwc:mt-1.5 wwc:flex wwc:flex-col wwc:gap-1 wwc:text-xs">{children}</div>
		</div>
	);
}

/**
 * `rules` is a union: an array of composable CRUD/link rules, OR one exclusive function rule —
 * hence the Array.isArray narrowing. A rule with no `objectTypeId` (the two `createLink` rules on
 * "Record safety observation") renders its kind alone, exactly as the prototype does.
 */
function RulesFired({actionType}: {actionType: Wc3ActionType}) {
	if (!Array.isArray(actionType.rules)) {
		const fn = actionType.rules;
		return (
			<TreeBlock title="Rules fired">
				<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5">
					<Badge variant="infoSoft" className="wwc:font-mono wwc:font-normal">
						ƒ function
					</Badge>
					<span>{fn.functionName}</span>
				</div>
			</TreeBlock>
		);
	}

	return (
		<TreeBlock title="Rules fired">
			{keyed(actionType.rules, (rule) => rule.kind).map(({item: rule, key}) => {
				const target = rule.objectTypeId ? (getObjectType(rule.objectTypeId)?.displayName ?? "deleted type") : null;
				return (
					<div key={key} className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5">
						<Badge variant="neutralSoft">{rule.kind}</Badge>
						{target && <span>{target}</span>}
					</div>
				);
			})}
		</TreeBlock>
	);
}

/** One side-effect (or, on a blocked run, one blocking error) line. */
function EffectLine({text, ok}: {text: string; ok: boolean}) {
	const marker = EFFECT_MARKERS.find((m) => text.startsWith(m.prefix));
	if (marker) {
		const Icon = marker.icon;
		return (
			<div className="wwc:flex wwc:items-start wwc:gap-1.5">
				<Icon className="wwc:mt-0.5 wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:text-muted-foreground" />
				<span className="wwc:min-w-0">{text.slice(marker.prefix.length)}</span>
			</div>
		);
	}
	// Unexercised by the fixture: both seeded runs are ok:true, so nothing renders this branch today.
	if (!ok) {
		return (
			<div className="wwc:flex wwc:items-start wwc:gap-1.5">
				<CircleX className="wwc:mt-0.5 wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:text-destructive" />
				<span className="wwc:min-w-0">{text}</span>
			</div>
		);
	}
	return <div>· {text}</div>;
}

/** The right pane: the selected run, the rules it fired and the objects it touched. */
function DownstreamTree({run}: {run: Wc3ActionRun}) {
	const actionType = ACTION_TYPE_BY_ID.get(run.atId);
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-3">
			<div className="wwc:rounded-md wwc:border wwc:border-border wwc:p-2.5">
				<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5">
					<Zap className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0" />
					<span className="wwc:text-xs wwc:font-semibold">{runLabel(run)}</span>
					<span className="wwc:text-xs wwc:text-muted-foreground">
						run by {run.user}
						{run.ok ? "" : " — BLOCKED"}
					</span>
				</div>
				<div className="wwc:mt-1.5 wwc:break-words">
					<Mono>args: {JSON.stringify(run.args)}</Mono>
				</div>
			</div>

			<div className="wwc:ml-4 wwc:space-y-3 wwc:border-l-2 wwc:border-border wwc:pl-3.5">
				{/* Only rendered when the action type still resolves — a deleted type has no rules to show. */}
				{actionType && <RulesFired actionType={actionType} />}
				<TreeBlock title={run.ok ? "Objects touched & side effects" : "Blocking errors"}>
					{keyed(run.effects, (effect) => effect).map(({item: effect, key}) => (
						<EffectLine key={key} text={effect} ok={run.ok} />
					))}
				</TreeBlock>
			</div>
		</div>
	);
}

/**
 * Workflow lineage — one action run, the rules it fired and its side effects.
 *
 * Ported from the unified-workspace prototype's "m7-lineage.js" module (LineageWorkflow). Nothing
 * in the right pane is clickable in the prototype, and there is no per-row expand: the whole detail
 * IS the right pane, driven by the selected row, so there is no drill-in and `onDetailChange` is
 * never called from this tab.
 */
export function LineageWorkflowView() {
	const [search, setSearch] = useState("");
	const [applied, setApplied] = useState<FilterValue>({});
	const [dateRange, setDateRange] = useState<{from: Date | undefined; to: Date | undefined}>({
		from: undefined,
		to: undefined,
	});
	// Nothing is selected on arrival: the right pane opens on TaskMonitor's shared empty state, so the
	// first thing the viewer does is choose a run rather than read one they did not ask for.
	const [openIds, setOpenIds] = useState<string[]>([]);
	const [activeId, setActiveId] = useState<string | undefined>(undefined);

	// Facet options come from the runs themselves, so a filter can never offer a value that matches
	// nothing, and never miss one that exists.
	const facets = useMemo(() => {
		const actions = new Set<string>();
		const users = new Set<string>();
		for (const run of RUNS) {
			actions.add(runLabel(run));
			users.add(run.user);
		}
		return {actions: [...actions].sort(), users: [...users].sort()};
	}, []);

	const runs = useMemo(() => {
		const needle = search.trim().toLowerCase();
		// Inclusive of the whole "to" day: a range picked as 22nd–22nd must not exclude that day's runs.
		const from = dateRange.from ? new Date(dateRange.from).setHours(0, 0, 0, 0) : undefined;
		const to = dateRange.to ? new Date(dateRange.to).setHours(23, 59, 59, 999) : undefined;
		const wanted = (categoryId: string) => applied[categoryId] ?? [];

		return RUNS.filter((run) => {
			if (needle) {
				// Searches the args and effects too — "PT-704" or "webhook" are how someone actually looks
				// for a run, and neither appears in the title.
				const haystack = [runLabel(run), run.user, run.when, JSON.stringify(run.args), run.effects.join(" ")]
					.join(" ")
					.toLowerCase();
				if (!haystack.includes(needle)) return false;
			}
			const actionFilter = wanted("action");
			if (actionFilter.length > 0 && !actionFilter.includes(runLabel(run))) return false;
			const userFilter = wanted("user");
			if (userFilter.length > 0 && !userFilter.includes(run.user)) return false;
			const outcomeFilter = wanted("outcome");
			if (outcomeFilter.length > 0 && !outcomeFilter.includes(run.ok ? "Applied" : "Blocked")) return false;
			if (from !== undefined && run.ts < from) return false;
			if (to !== undefined && run.ts > to) return false;
			return true;
		});
	}, [search, applied, dateRange]);

	const items: TaskMonitorItem[] = useMemo(
		() =>
			runs.map((run) => ({
				id: run.id,
				title: runLabel(run),
				subtitle: `${run.when} · ${run.user}`,
				meta: (
					<span className={cn("wwc:text-xs", run.ok ? "wwc:text-muted-foreground" : "wwc:text-destructive")}>
						{run.ok ? `${run.effects.length} effect(s)` : "blocked"}
					</span>
				),
				icon: run.ok ? <Zap className="wwc:h-3.5 wwc:w-3.5" /> : <CircleX className="wwc:h-3.5 wwc:w-3.5" />,
			})),
		[runs],
	);

	const clearDates = () => setDateRange({from: undefined, to: undefined});

	// The chips strip mirrors `applied` plus the date range, so every active narrowing is removable from
	// one place — otherwise a date filter set once stays invisible and the list looks wrongly empty.
	const chipValue: FilterValue = useMemo(() => {
		const value: Record<string, readonly string[]> = {...applied};
		if (dateRange.from) {
			const label = dateRange.to
				? `${dateRange.from.toLocaleDateString()} – ${dateRange.to.toLocaleDateString()}`
				: `From ${dateRange.from.toLocaleDateString()}`;
			value.date = [label];
		}
		return value;
	}, [applied, dateRange]);

	const removeApplied = (categoryId: string, optionValue: string) =>
		setApplied((prev) => {
			const next = (prev[categoryId] ?? []).filter((v) => v !== optionValue);
			const copy = {...prev};
			if (next.length === 0) delete copy[categoryId];
			else copy[categoryId] = next;
			return copy;
		});

	const selectRun = (id: string | undefined) => {
		setActiveId(id);
		if (id) setOpenIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
	};

	return (
		// Deliberately not the shared Pane helper: Pane is the page-level scroller with px-6/pt-4 gutters,
		// and this tab is a full-height two-pane surface whose list and detail scroll independently.
		// It also carries NO padding of its own: TaskMonitor draws its own panel edges and divider, so an
		// outer gutter only floats the whole surface inside the content area. It runs edge to edge.
		<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:overflow-hidden">
			<TaskMonitor
				className="wwc:min-h-0 wwc:flex-1"
				itemNoun="run"
				listTitle="Action runs"
				items={items}
				search={search}
				onSearchChange={setSearch}
				searchPlaceholder="Search runs, people, arguments…"
				listFilterStrip={
					Object.keys(chipValue).length > 0 ? (
						<FilterChips
							value={chipValue}
							onRemove={(categoryId, optionValue) => {
								if (categoryId === "date") clearDates();
								else removeApplied(categoryId, optionValue);
							}}
							onClear={() => {
								setApplied({});
								clearDates();
							}}
						/>
					) : undefined
				}
				listTrailing={
					<>
						<DateRangeTimePicker
							iconOnly
							aria-label="Filter runs by date & time range"
							tooltip="Date & time"
							dateRange={dateRange}
							onDateRangeChange={setDateRange}
						/>
						<Filter value={applied} onChange={setApplied}>
							<FilterTrigger />
							<FilterContent>
								<FilterCategory value="action" label="Action">
									{facets.actions.map((action) => (
										<FilterOption key={action} value={action}>
											{action}
										</FilterOption>
									))}
								</FilterCategory>
								<FilterCategory value="user" label="Run by">
									{facets.users.map((user) => (
										<FilterOption key={user} value={user}>
											{user}
										</FilterOption>
									))}
								</FilterCategory>
								<FilterCategory value="outcome" label="Outcome">
									<FilterOption value="Applied">Applied</FilterOption>
									<FilterOption value="Blocked">Blocked</FilterOption>
								</FilterCategory>
							</FilterContent>
						</Filter>
					</>
				}
				openItemIds={openIds}
				activeItemId={activeId}
				onActiveItemChange={selectRun}
				onItemOpen={(id) => setOpenIds((prev) => (prev.includes(id) ? prev : [...prev, id]))}
				onItemClose={(id) =>
					setOpenIds((prev) => {
						const next = prev.filter((openId) => openId !== id);
						if (activeId === id) setActiveId(next[next.length - 1]);
						return next;
					})
				}
				renderItemBody={(item) => {
					const run = RUNS.find((r) => r.id === item.id);
					return run ? <DownstreamTree run={run} /> : null;
				}}
			/>
		</div>
	);
}
