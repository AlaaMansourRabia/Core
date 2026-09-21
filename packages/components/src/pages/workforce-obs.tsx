import type {ColumnDef, Row} from "@tanstack/react-table";

import {ArrowDownWideNarrow, Plus, Trash2, UserRoundCog} from "lucide-react";
import {useEffect, useMemo, useState} from "react";

import {Badge} from "../badge";
import {Button} from "../button";
import {ConfirmDialog} from "../confirm-dialog";
import {DataTable, DataTableColumnHeader, DataTableExpandButton} from "../data-table";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "../dialog";
import {Filter, FilterCategory, FilterContent, FilterOption, FilterTrigger, type FilterValue} from "../filter";
import {Input} from "../input";
import {MultiSelect, SearchableSelect} from "../select";
import {toast, Toaster} from "../sonner";
import {HoverTooltip} from "../tooltip";

// OBS — the Organization Breakdown Structure tab of the Workforce template. A nested, collapsible
// tree table (Core DataTable with getSubRows) with per-row actions: change supervisor, add
// subordinate, delete. Keeps the standard search / filter / column-toggle toolbar.

interface ObsNode {
	id: string;
	name: string;
	code: string;
	company: string;
	title: string | null;
	department: string | null;
	trade: string;
	children: ObsNode[];
}

// ─── Tree helpers (immutable, keyed by id) ────────────────────────────────────

function descendantCount(node: ObsNode): number {
	return node.children.reduce((sum, child) => sum + 1 + descendantCount(child), 0);
}

function collectIds(node: ObsNode, into: Set<string> = new Set()): Set<string> {
	into.add(node.id);
	node.children.forEach((child) => collectIds(child, into));
	return into;
}

function findNode(nodes: ObsNode[], id: string): ObsNode | null {
	for (const node of nodes) {
		if (node.id === id) return node;
		const found = findNode(node.children, id);
		if (found) return found;
	}
	return null;
}

function removeNode(nodes: ObsNode[], id: string): ObsNode[] {
	return nodes.filter((node) => node.id !== id).map((node) => ({...node, children: removeNode(node.children, id)}));
}

function addChild(nodes: ObsNode[], parentId: string, child: ObsNode): ObsNode[] {
	return nodes.map((node) =>
		node.id === parentId
			? {...node, children: [...node.children, child]}
			: {...node, children: addChild(node.children, parentId, child)},
	);
}

function flatten(nodes: ObsNode[], into: ObsNode[] = []): ObsNode[] {
	for (const node of nodes) {
		into.push(node);
		flatten(node.children, into);
	}
	return into;
}

/** Keep a node if it matches, or if any descendant is kept — preserves the ancestry chain. */
function pruneTree(nodes: ObsNode[], keep: (node: ObsNode) => boolean): ObsNode[] {
	return nodes.reduce<ObsNode[]>((acc, node) => {
		const children = pruneTree(node.children, keep);
		if (keep(node) || children.length > 0) acc.push({...node, children});
		return acc;
	}, []);
}

// ─── Seed data ───────────────────────────────────────────────────────────────

function person(
	id: string,
	name: string,
	code: string,
	company: string,
	trade: string,
	extra?: {title?: string; department?: string; children?: ObsNode[]},
): ObsNode {
	return {
		id,
		name,
		code,
		company,
		trade,
		title: extra?.title ?? null,
		department: extra?.department ?? null,
		children: extra?.children ?? [],
	};
}

const OBS_TREE: ObsNode[] = [
	person("o-moayad", "Moayad Test", "12345666", "Core", "INDIRECT-LEAD SUPERVISOR", {
		children: [person("o-riyas", "Riyas Test", "321321", "DSCO", "INDIRECT-SOLUTION MANAGER")],
	}),
	person("o-barak", "Barak Al Azmi", "SA-PKG5-002", "Aramco PMT PKG5", "Indirect-ARAMCO PMT", {
		children: [
			person("o-zakiah", "Zakiah Al Tehaini", "SA-PKG5-001", "Aramco PMT PKG5", "Indirect-PROJECT ENGINEER", {
				title: "Engineer",
				department: "ENGINEERING",
				children: [
					person("o-wijdan", "Wijdan Hadadi", "1110843503", "Sinohydro", "Indirect-SCC Supervisor", {
						department: "HSE",
						children: [
							person("o-abomijna", "MOAYAD ABOMIJNA", "2158931325", "Core", "Indirect-Project manager", {
								children: [
									person("o-azhar", "Azhar Al Madih", "1089990046", "Sinohydro", "Indirect-Safety Supervisor", {
										children: [
											person("o-hazem", "hazem sabri", "1119209359", "Sinohydro", "INDIRECT-QHSE OFFICER", {
												children: [
													person("o-ameer", "AMEER Ali", "2588281937", "Sinohydro", "SCC OPERATOR", {
														children: [
															person(
																"o-usama",
																"Muhammad Usama Malik",
																"2476020207",
																"Sinohydro",
																"Default resource pool trade",
															),
														],
													}),
												],
											}),
										],
									}),
								],
							}),
						],
					}),
				],
			}),
		],
	}),
	person("o-alfredo", "Alfredo Crespo Botia", "TR-SUB-001", "TR", "Indirect-Sub Contract Administrator", {
		children: [
			person("o-asad", "Asad Ullah Awan", "TR963", "TR", "IT Engineer", {
				children: [
					person("o-miguelc", "MIGUEL BLASCO CASTANO", "PAX092964", "TR", "Indirect-Digital Twin Engineer"),
					person("o-pedroj", "PEDRO JOSE", "25741111270", "TR", "INDIRECT-PROJECT CONTROL"),
				],
			}),
			person("o-jonny", "JONNY ERCOLANI", "YB7820177", "TR", "Indirect-QC Manager", {
				children: [
					person("o-miguelb", "MIGUEL BLASCOO", "TR6458", "TR", "INDIRECT-FIELD ENGINEER"),
					person("o-pedro2", "Pedro Jose", "TR456", "TR", "INDIRECT-E&I ENGINEER"),
				],
			}),
			person("o-dileep", "DILEEP PRABHAKARAN", "2506893649", "TR", "Indirect-HSE Manager", {
				children: [
					person("o-ali", "Ali Jaradeh", "Aramco236", "Saudi Aramco", "INDIRECT-Senior Project Manager"),
					person("o-lina", "Lina Montoiro Cordoba", "TR589", "TR", "INDIRECT-Senior Project Manager"),
					person("o-karim", "Karim Sabbah", "TR3541", "TR", "INDIRECT-Senior Project Manager"),
					person("o-akhilesh", "Akhilesh Mau", "Aramco 0119", "Saudi Aramco", "INDIRECT-SENIOR PROJECT MANAGER"),
					person("o-ozgur", "Ozgur Uy", "TR1271", "TR", "INDIRECT-PROJECT CONTROL"),
				],
			}),
		],
	}),
];

const dash = (value: React.ReactNode) =>
	value === null || value === undefined || value === "" ? <span className="wwc:text-muted-foreground">—</span> : value;

// ─── Name tree cell ──────────────────────────────────────────────────────────

function ObsNameCell({row}: {row: Row<ObsNode>}) {
	const count = descendantCount(row.original);
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-1.5" style={{paddingLeft: `${row.depth * 1.5}rem`}}>
			<DataTableExpandButton row={row} />
			<span className="wwc:font-medium">{row.original.name}</span>
			{count > 0 ? (
				<Badge variant="secondary" className="wwc:h-5 wwc:gap-1 wwc:px-1.5 wwc:text-[10px] wwc:tabular-nums">
					<ArrowDownWideNarrow className="wwc:h-3 wwc:w-3" />
					{count}
				</Badge>
			) : null}
		</div>
	);
}

// ─── Action modals ───────────────────────────────────────────────────────────

interface ObsDraft {
	name: string;
	code: string;
	company: string;
	title: string;
	department: string;
	trade: string;
}

const EMPTY_OBS_DRAFT: ObsDraft = {name: "", code: "", company: "", title: "", department: "", trade: ""};

function ObsFormModal({
	open,
	onOpenChange,
	title,
	onSubmit,
}: {
	open: boolean;
	onOpenChange: (o: boolean) => void;
	title: string;
	onSubmit: (draft: ObsDraft) => void;
}) {
	const [draft, setDraft] = useState<ObsDraft>(EMPTY_OBS_DRAFT);
	const [attempted, setAttempted] = useState(false);

	// Reset each time the modal opens.
	useEffect(() => {
		if (open) {
			setDraft(EMPTY_OBS_DRAFT);
			setAttempted(false);
		}
	}, [open]);

	const set = <K extends keyof ObsDraft>(key: K, value: ObsDraft[K]) => setDraft((d) => ({...d, [key]: value}));
	const nameError = attempted && !draft.name.trim();

	const submit = () => {
		if (!draft.name.trim()) {
			setAttempted(true);
			return;
		}
		onSubmit(draft);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="wwc:flex wwc:max-h-[92vh] wwc:w-[calc(100vw-2rem)] wwc:max-w-md wwc:flex-col wwc:gap-0 wwc:overflow-hidden wwc:p-0">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<div className="wwc:min-h-0 wwc:flex-1 wwc:space-y-4 wwc:overflow-y-auto wwc:px-6 wwc:py-5">
					<ObsField label="Name" required error={nameError}>
						<Input
							placeholder="Enter name"
							value={draft.name}
							aria-invalid={nameError}
							onChange={(e) => set("name", e.target.value)}
						/>
					</ObsField>
					<div className="wwc:grid wwc:grid-cols-2 wwc:gap-4">
						<ObsField label="Code">
							<Input placeholder="Enter code" value={draft.code} onChange={(e) => set("code", e.target.value)} />
						</ObsField>
						<ObsField label="Company">
							<Input
								placeholder="Enter company"
								value={draft.company}
								onChange={(e) => set("company", e.target.value)}
							/>
						</ObsField>
						<ObsField label="Title">
							<Input placeholder="Enter title" value={draft.title} onChange={(e) => set("title", e.target.value)} />
						</ObsField>
						<ObsField label="Department">
							<Input
								placeholder="Enter department"
								value={draft.department}
								onChange={(e) => set("department", e.target.value)}
							/>
						</ObsField>
					</div>
					<ObsField label="Trade">
						<Input placeholder="Enter trade" value={draft.trade} onChange={(e) => set("trade", e.target.value)} />
					</ObsField>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={submit}>Save</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function ObsField({
	label,
	required,
	error,
	children,
}: {
	label: string;
	required?: boolean;
	error?: boolean;
	children: React.ReactNode;
}) {
	return (
		<div className="wwc:space-y-1.5">
			<label className="wwc:flex wwc:items-center wwc:gap-0.5 wwc:text-sm wwc:font-semibold">
				{label}
				{required ? <span className="wwc:text-destructive">*</span> : null}
			</label>
			{children}
			{error ? <p className="wwc:text-xs wwc:text-destructive">{label} is required.</p> : null}
		</div>
	);
}

function ChangeSupervisorModal({
	open,
	onOpenChange,
	node,
	candidates,
	onConfirm,
}: {
	open: boolean;
	onOpenChange: (o: boolean) => void;
	node: ObsNode | null;
	candidates: {id: string; name: string}[];
	onConfirm: (newParentId: string) => void;
}) {
	const [target, setTarget] = useState("");

	useEffect(() => {
		if (open) setTarget("");
	}, [open]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="wwc:w-[calc(100vw-2rem)] wwc:max-w-md">
				<DialogTitle className="wwc:text-lg wwc:font-semibold">Change supervisor</DialogTitle>
				<p className="wwc:text-sm wwc:text-muted-foreground">
					Move <span className="wwc:font-medium wwc:text-foreground">{node?.name}</span> (and their subordinates) under
					a new supervisor.
				</p>
				<div className="wwc:space-y-1.5">
					<span className="wwc:text-sm wwc:font-semibold">New supervisor</span>
					{/* Searchable, single-selection dropdown. */}
					<SearchableSelect
						options={candidates.map((c) => ({value: c.id, label: c.name}))}
						value={target}
						onValueChange={setTarget}
						placeholder="Select supervisor"
						searchPlaceholder="Search people…"
						className="wwc:w-full"
					/>
				</div>
				<div className="wwc:flex wwc:items-center wwc:justify-end wwc:gap-2">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						disabled={!target}
						onClick={() => {
							onConfirm(target);
							onOpenChange(false);
						}}
					>
						Move
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function AddSubordinatesModal({
	open,
	onOpenChange,
	node,
	candidates,
	onConfirm,
}: {
	open: boolean;
	onOpenChange: (o: boolean) => void;
	node: ObsNode | null;
	candidates: {id: string; name: string}[];
	onConfirm: (ids: string[]) => void;
}) {
	const [selected, setSelected] = useState<string[]>([]);

	useEffect(() => {
		if (open) setSelected([]);
	}, [open]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="wwc:w-[calc(100vw-2rem)] wwc:max-w-md">
				<DialogTitle className="wwc:text-lg wwc:font-semibold">Add subordinates</DialogTitle>
				<p className="wwc:text-sm wwc:text-muted-foreground">
					Move the selected people (and their subordinates) under{" "}
					<span className="wwc:font-medium wwc:text-foreground">{node?.name}</span>.
				</p>
				<div className="wwc:space-y-1.5">
					<span className="wwc:text-sm wwc:font-semibold">Subordinates</span>
					{/* Searchable, multi-selection dropdown. */}
					<MultiSelect
						options={candidates.map((c) => ({value: c.id, label: c.name}))}
						value={selected}
						onValueChange={setSelected}
						placeholder="Select people"
						searchPlaceholder="Search people…"
						showTags
						className="wwc:w-full"
					/>
				</div>
				<div className="wwc:flex wwc:items-center wwc:justify-end wwc:gap-2">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						disabled={selected.length === 0}
						onClick={() => {
							onConfirm(selected);
							onOpenChange(false);
						}}
					>
						Add {selected.length > 0 ? `(${selected.length})` : ""}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// ─── Columns ─────────────────────────────────────────────────────────────────

function makeObsColumns(
	onChangeSupervisor: (node: ObsNode) => void,
	onAddSubordinate: (node: ObsNode) => void,
	onDelete: (node: ObsNode) => void,
): ColumnDef<ObsNode>[] {
	return [
		{
			accessorKey: "name",
			header: ({column}) => <DataTableColumnHeader column={column} title="Name" />,
			meta: {headerClassName: "wwc:w-[24rem]", cellClassName: "wwc:whitespace-nowrap"},
			cell: ({row}) => <ObsNameCell row={row} />,
		},
		{
			accessorKey: "code",
			header: ({column}) => <DataTableColumnHeader column={column} title="Code" />,
			cell: ({row}) => dash(row.original.code),
		},
		{
			accessorKey: "company",
			header: ({column}) => <DataTableColumnHeader column={column} title="Company" />,
			cell: ({row}) => dash(row.original.company),
		},
		{
			accessorKey: "title",
			header: ({column}) => <DataTableColumnHeader column={column} title="Title" />,
			cell: ({row}) => dash(row.original.title),
		},
		{
			accessorKey: "department",
			header: ({column}) => <DataTableColumnHeader column={column} title="Department" />,
			cell: ({row}) => dash(row.original.department),
		},
		{
			accessorKey: "trade",
			header: ({column}) => <DataTableColumnHeader column={column} title="Trade" />,
			cell: ({row}) => dash(row.original.trade),
		},
		{
			id: "actions",
			enableSorting: false,
			enableHiding: false,
			meta: {cellClassName: "wwc:w-px wwc:max-w-none wwc:overflow-visible wwc:whitespace-nowrap wwc:text-right"},
			cell: ({row}) => (
				<div className="wwc:flex wwc:items-center wwc:justify-end wwc:gap-0.5">
					<HoverTooltip content="Change supervisor">
						<Button
							variant="ghost"
							icon
							aria-label="Change supervisor"
							className="wwc:h-7 wwc:w-7 wwc:text-muted-foreground"
							onClick={() => onChangeSupervisor(row.original)}
						>
							<UserRoundCog className="wwc:h-4 wwc:w-4" />
						</Button>
					</HoverTooltip>
					<HoverTooltip content="Add subordinate">
						<Button
							variant="ghost"
							icon
							aria-label="Add subordinate"
							className="wwc:h-7 wwc:w-7 wwc:text-muted-foreground"
							onClick={() => onAddSubordinate(row.original)}
						>
							<Plus className="wwc:h-4 wwc:w-4" />
						</Button>
					</HoverTooltip>
					<HoverTooltip content="Delete">
						<Button
							variant="ghost"
							icon
							aria-label="Delete"
							className="wwc:h-7 wwc:w-7 wwc:text-muted-foreground wwc:hover:text-destructive"
							onClick={() => onDelete(row.original)}
						>
							<Trash2 className="wwc:h-4 wwc:w-4" />
						</Button>
					</HoverTooltip>
				</div>
			),
		},
	];
}

// ─── View ────────────────────────────────────────────────────────────────────

/** The OBS tab — a nested, collapsible org tree table with per-row supervisor/subordinate/delete actions. */
export function ObsView() {
	const [tree, setTree] = useState<ObsNode[]>(OBS_TREE);
	const [filters, setFilters] = useState<FilterValue>({});
	// Which modal is open, and against which node.
	const [addRoot, setAddRoot] = useState(false);
	const [addSubFor, setAddSubFor] = useState<ObsNode | null>(null);
	const [moveNode, setMoveNode] = useState<ObsNode | null>(null);
	// Delete is staged here until the confirm dialog is accepted.
	const [pendingDelete, setPendingDelete] = useState<ObsNode | null>(null);

	const [ownToaster, setOwnToaster] = useState(false);
	useEffect(() => {
		const has = document.querySelector('[data-sonner-toaster], section[aria-live][aria-label*="Notification"]');
		setOwnToaster(!has);
	}, []);

	const columns = useMemo(
		() =>
			makeObsColumns(
				(node) => setMoveNode(node),
				(node) => setAddSubFor(node),
				(node) => setPendingDelete(node),
			),
		[],
	);

	const all = useMemo(() => flatten(tree), [tree]);
	const companies = useMemo(() => Array.from(new Set(all.map((n) => n.company))).sort(), [all]);
	const trades = useMemo(() => Array.from(new Set(all.map((n) => n.trade))).sort(), [all]);

	const data = useMemo(() => {
		const active = Object.entries(filters)
			.map(([key, sel]) => [key, sel ?? []] as const)
			.filter(([, sel]) => sel.length > 0);
		if (active.length === 0) return tree;
		return pruneTree(tree, (node) => active.every(([key, sel]) => sel.includes(String(node[key as keyof ObsNode]))));
	}, [tree, filters]);

	// New nodes need a stable, non-random id (Math.random is unavailable in this environment).
	const [seq, setSeq] = useState(0);
	const nextId = () => {
		const id = `o-new-${seq}`;
		setSeq((s) => s + 1);
		return id;
	};

	const makeNode = (draft: ObsDraft): ObsNode => ({
		id: nextId(),
		name: draft.name.trim(),
		code: draft.code.trim(),
		company: draft.company.trim(),
		title: draft.title.trim() || null,
		department: draft.department.trim() || null,
		trade: draft.trade.trim() || "—",
		children: [],
	});

	// Supervisor candidates exclude the node and its own subtree (can't report to a descendant).
	const moveCandidates = useMemo(() => {
		if (!moveNode) return [];
		const banned = collectIds(moveNode);
		return all.filter((n) => !banned.has(n.id)).map((n) => ({id: n.id, name: n.name}));
	}, [moveNode, all]);

	// Subordinate candidates exclude the node itself and its own subtree (they'd already be under it,
	// and moving an ancestor beneath it would create a cycle).
	const addSubCandidates = useMemo(() => {
		if (!addSubFor) return [];
		const banned = collectIds(addSubFor);
		return all.filter((n) => !banned.has(n.id)).map((n) => ({id: n.id, name: n.name}));
	}, [addSubFor, all]);

	return (
		// pt-2 (not p-6) up top: the DataTable toolbar already contributes py-4, so a full pt-6 would
		// double the gap above the search row versus the sides and the other tabs.
		<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:overflow-auto wwc:px-6 wwc:pb-6 wwc:pt-2">
			<Filter value={filters} onChange={setFilters}>
				<DataTable
					columns={columns}
					data={data}
					searchKey="name"
					searchPlaceholder="Search OBS…"
					showColumnToggle
					showPagination={false}
					recordLabel="person"
					getSubRows={(row) => (row.children.length > 0 ? row.children : undefined)}
					getRowCanExpand={(row) => row.original.children.length > 0}
					expandAllByDefault
					toolbarExtra={
						<>
							<FilterTrigger />
							<FilterContent>
								<FilterCategory value="company" label="Company">
									{companies.map((company) => (
										<FilterOption key={company} value={company}>
											{company}
										</FilterOption>
									))}
								</FilterCategory>
								<FilterCategory value="trade" label="Trade">
									{trades.map((trade) => (
										<FilterOption key={trade} value={trade}>
											{trade}
										</FilterOption>
									))}
								</FilterCategory>
							</FilterContent>
							<Button onClick={() => setAddRoot(true)}>
								<Plus className="wwc:h-4 wwc:w-4" />
								Add OBS
							</Button>
						</>
					}
				/>
			</Filter>

			<ObsFormModal
				open={addRoot}
				onOpenChange={setAddRoot}
				title="Add OBS"
				onSubmit={(draft) => {
					const node = makeNode(draft);
					setTree((prev) => [...prev, node]);
					toast.success(`${node.name} added to the OBS`);
				}}
			/>
			<AddSubordinatesModal
				open={addSubFor !== null}
				onOpenChange={(o) => !o && setAddSubFor(null)}
				node={addSubFor}
				candidates={addSubCandidates}
				onConfirm={(ids) => {
					if (!addSubFor) return;
					const parent = addSubFor;
					setTree((prev) => {
						let next = prev;
						for (const id of ids) {
							const moving = findNode(next, id);
							if (moving) next = addChild(removeNode(next, id), parent.id, moving);
						}
						return next;
					});
					toast.success(
						ids.length > 1 ? `${ids.length} people now report to ${parent.name}` : `Now reports to ${parent.name}`,
					);
				}}
			/>
			<ChangeSupervisorModal
				open={moveNode !== null}
				onOpenChange={(o) => !o && setMoveNode(null)}
				node={moveNode}
				candidates={moveCandidates}
				onConfirm={(newParentId) => {
					if (!moveNode) return;
					const moving = findNode(tree, moveNode.id);
					const parent = findNode(tree, newParentId);
					if (!moving || !parent) return;
					setTree((prev) => addChild(removeNode(prev, moving.id), newParentId, moving));
					toast.success(`${moving.name} now reports to ${parent.name}`);
				}}
			/>
			<ConfirmDialog
				open={pendingDelete !== null}
				onOpenChange={(o) => !o && setPendingDelete(null)}
				destructive
				title="Delete from OBS?"
				description={
					pendingDelete ? (
						descendantCount(pendingDelete) > 0 ? (
							<>
								<span className="wwc:font-medium wwc:text-foreground">{pendingDelete.name}</span> and their{" "}
								{descendantCount(pendingDelete)} subordinate{descendantCount(pendingDelete) === 1 ? "" : "s"} will be
								removed from the OBS. This can't be undone.
							</>
						) : (
							<>
								<span className="wwc:font-medium wwc:text-foreground">{pendingDelete.name}</span> will be removed from
								the OBS. This can't be undone.
							</>
						)
					) : null
				}
				confirmLabel="Delete"
				onConfirm={() => {
					if (!pendingDelete) return;
					setTree((prev) => removeNode(prev, pendingDelete.id));
					toast.success(`${pendingDelete.name} removed from the OBS`);
					setPendingDelete(null);
				}}
			/>
			{ownToaster ? <Toaster position="top-right" /> : null}
		</div>
	);
}
