import type {ColumnDef} from "@tanstack/react-table";

import {cn} from "@wakecap/core-utils";
import {Bolt, Folder, Play, Plus} from "lucide-react";
import {useCallback, useEffect, useMemo, useState} from "react";

import {Badge} from "../badge";
import {Button} from "../button";
import {DataTable, DataTableColumnHeader} from "../data-table";
import {Filter, FilterCategory, FilterContent, FilterOption, FilterTrigger, type FilterValue} from "../filter";
import {LinkTypeDetailPage, type LinkTypeModel, type LinkTypeSide} from "../link-type-detail";
import {NewLinkTypeDialog, type NewLinkTypeDraft} from "../link-type-wizard";
import {NewObjectTypeDialog, type DatasourceDef, type NewObjectTypeDraft} from "../object-type-wizard";
import {HoverTooltip} from "../tooltip";
import {ActionTypeDetail} from "./wc3-action-type-detail";
import {RunActionDialog} from "./wc3-action-type-run-dialog";
import {NewActionTypeDialog, type NewActionTypeDraft} from "./wc3-action-type-wizard";
import {Wc3FsPathLabel} from "./wc3-fs-path-label";
import {wc3FsLocationOf} from "./wc3-fs-store";
import {GraphExplorerFlowView} from "./wc3-graph-explorer-flow";
import {TypeGroupDetailPage} from "./wc3-group-detail";
import {NewTypeGroupDialog} from "./wc3-group-wizard";
import {HealthView, runOntologyLint} from "./wc3-health-view";
import {InterfaceDetail, interfaceFromDraft} from "./wc3-interface-detail";
import {NewInterfaceDialog} from "./wc3-interface-wizard";
import {useOpenRecord, type Wc3FsLinkProps} from "./wc3-lineage-shared";
import {ObjectTypeDetail} from "./wc3-object-type-detail";
import {
	BACKING_LABEL,
	WC3_ACTION_TYPES,
	WC3_INTERFACES,
	WC3_LINK_TYPES,
	WC3_OBJECT_TYPES,
	WC3_SHARED_PROPERTIES,
	WC3_BASE_TYPES,
	WC3_DATASOURCE_CATALOG,
	WC3_DATASOURCE_KIND_LABEL,
	WC3_ICON_COLORS,
	WC3_INSTANCE_LINK_SAMPLES,
	WC3_ICON_GLYPHS,
	WC3_TYPE_GROUPS,
	type Wc3ActionRule,
	type Wc3ActionType,
	type Wc3Interface,
	type Wc3LinkType,
	type Wc3ObjectType,
	type Wc3Property,
	type Wc3Status,
	type Wc3TypeGroup,
	getInterface,
	getObjectType,
	getTypeGroup,
	instanceCount,
	instanceLinkCount,
	interfaceAllProperties,
	linkTypeLabel,
} from "./wc3-ontology-data";
import {OntologyGlyph} from "./wc3-ontology-glyphs";
import {
	scopeActionTypes,
	scopeInterfaces,
	scopeLinkTypes,
	scopeObjectTypes,
	scopeSharedProperties,
	scopeTypeGroups,
	scopedInterfaceImplementors,
	type OntologyScope,
} from "./wc3-ontology-scope";
import {SharedPropertiesView} from "./wc3-shared-property-view";

// The eight Ontology Manager surfaces, ported from the unified-workspace prototype's Ontology
// perspective. Each is one tab. Data comes from wc3-ontology-data.ts — the prototype's own store,
// extracted verbatim — so counts and copy match what the prototype was reviewed against.

// ─── Shared bits ─────────────────────────────────────────────────────────────

// The prototype paints Endorsed violet; core-ui has no violet Badge variant, so Endorsed takes the
// info tone. Ranking is unchanged: Endorsed > Active > Experimental > Deprecated.
const STATUS_VARIANT: Record<Wc3Status, "successSoft" | "warningSoft" | "dangerSoft" | "infoSoft"> = {
	Active: "successSoft",
	Endorsed: "infoSoft",
	Experimental: "warningSoft",
	Deprecated: "dangerSoft",
};

function StatusPill({status}: {status: Wc3Status}) {
	return <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>;
}

// Facet options come from the data, so a filter never offers a value no row can have.
const STATUSES = [...new Set(WC3_OBJECT_TYPES.map((o) => o.status))].sort();
const VISIBILITIES = [...new Set(WC3_OBJECT_TYPES.map((o) => o.visibility))].sort();

function Mono({children}: {children: React.ReactNode}) {
	return <span className="wwc:font-mono wwc:text-xs wwc:text-muted-foreground">{children}</span>;
}

/** The prototype's RID chip — a truncated resource identifier with the full value on hover. */
function RidChip({rid}: {rid: string}) {
	const short = rid.split(".").slice(-1)[0];
	return (
		<HoverTooltip content={rid}>
			<span className="wwc:cursor-default wwc:font-mono wwc:text-[11px] wwc:text-muted-foreground">{short}</span>
		</HoverTooltip>
	);
}

/** An object type rendered inline: its glyph plus its display name. */
function TypeChip({type}: {type: Wc3ObjectType | undefined}) {
	if (!type) return <span className="wwc:text-muted-foreground wwc:italic">deleted</span>;
	return (
		<span className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:whitespace-nowrap">
			<OntologyGlyph name={type.icon} color={type.color} />
			{type.displayName}
		</span>
	);
}

/**
 * Values repeat — an action can carry two `createLink` rules — so a bare value is not a unique key.
 * Suffix each repeat with its occurrence number: `createLink`, `createLink~2`, …
 */
function keyed(items: string[]) {
	const seen = new Map<string, number>();
	return items.map((label) => {
		const n = (seen.get(label) ?? 0) + 1;
		seen.set(label, n);
		return {label, key: n === 1 ? label : `${label}~${n}`};
	});
}

function ChipList({items, max = 6}: {items: string[]; max?: number}) {
	if (items.length === 0) return <span className="wwc:text-muted-foreground">—</span>;
	return (
		<span className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1">
			{keyed(items.slice(0, max)).map(({label, key}) => (
				<Badge key={key} variant="neutralSoft" className="wwc:font-normal">
					{label}
				</Badge>
			))}
			{items.length > max && <span className="wwc:text-xs wwc:text-muted-foreground">+{items.length - max}</span>}
		</span>
	);
}

/** Numeric cells are right-aligned in the prototype's tables. */
const num = (v: number) => <span className="wwc:block wwc:text-right wwc:tabular-nums">{v}</span>;

/**
 * Content pane for one tab. No title or description — PageContentHeader above already names the
 * perspective and the tab, and its badge carries the count, so a second heading here just repeats it.
 *
 * Top spacing is 16px on every tab. `flush` says the first child brings its own: DataTable's toolbar
 * is `py-4`, so a pane that adds its own top padding on top of that reads as a 40px gap against 24px
 * sides. Table tabs pass `flush`; the rest get the same 16px from the pane itself.
 *
 * `action` is for surfaces that own a control but have no table toolbar to put it in.
 */
function Pane({action, flush, children}: {action?: React.ReactNode; flush?: boolean; children: React.ReactNode}) {
	return (
		<div
			className={cn(
				"wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:gap-4 wwc:overflow-auto wwc:px-6 wwc:pb-6",
				flush ? "wwc:pt-0" : "wwc:pt-4",
			)}
		>
			{action && <div className="wwc:flex wwc:justify-end">{action}</div>}
			{children}
		</div>
	);
}

// ─── 1. Object types ─────────────────────────────────────────────────────────

/** WC3's catalog in the shape the shared NewObjectTypeDialog expects. */
const WIZARD_DATASOURCES: DatasourceDef[] = WC3_DATASOURCE_CATALOG.map((c) => ({
	id: c.id,
	kind: WC3_DATASOURCE_KIND_LABEL[c.kind] as DatasourceDef["kind"],
	name: c.name,
	columns: c.columns,
	duplicateKeys: c.pkDuplicates,
}));

/** Icon palette for the wizard — WC3 glyphs, so `iconIndex` maps straight back to a glyph name. */
const WIZARD_ICON_NAMES = WC3_ICON_GLYPHS;
const WIZARD_ICONS = WIZARD_ICON_NAMES.map((name) => {
	const Glyph = (props: {className?: string}) => <OntologyGlyph name={name} className={props.className} />;
	Glyph.displayName = `Glyph(${name})`;
	return Glyph;
});

let created = 0;

/** Turn the shared wizard's draft into a WC3 object type. */
function toObjectType(draft: NewObjectTypeDraft): Wc3ObjectType {
	const id = `ot_new_${++created}`;
	const source = WC3_DATASOURCE_CATALOG.find((c) => draft.datasourceIds.includes(c.id));
	const properties: Wc3Property[] = draft.properties.map((p, i) => ({
		id: `${id}_p${i}`,
		apiName: p.apiName,
		displayName: p.displayName,
		baseType: p.baseType,
		description: "",
		required: p.required,
		searchable: true,
		sortable: true,
		aggregatable: false,
		formatting: null,
		conditionalFormat: null,
		typeClasses: [],
		sharedPropertyId: null,
		derived: null,
	}));
	return {
		id,
		// A real RID is minted server-side; this is the prototype's client-side stand-in.
		rid: `ri.ontology.main.object-type.${id}`,
		apiName: draft.apiName,
		displayName: draft.displayName,
		pluralName: draft.pluralName || `${draft.displayName}s`,
		description: draft.description,
		// iconIndex indexes into the palette we handed the dialog, so it maps back to a glyph name.
		icon: WIZARD_ICON_NAMES[draft.iconIndex] ?? "layers",
		color: WC3_ICON_COLORS[draft.colorIndex % WC3_ICON_COLORS.length],
		status: draft.status,
		visibility: draft.visibility,
		module: "wc3-core-demo",
		layer: null,
		primaryKey: properties[0] ? [properties[0].id] : [],
		titleKey: properties[0]?.id ?? "",
		groups: draft.groups
			.map((name) => WC3_TYPE_GROUPS.find((g) => g.name === name)?.id)
			.filter((x): x is string => Boolean(x)),
		properties,
		datasources: source
			? [
					{
						id: `dsi_${id}`,
						catalogId: source.id,
						kind: source.kind,
						name: source.name,
						pkDuplicates: !!source.pkDuplicates,
					},
				]
			: [],
		implements: [],
		indexStatus: {state: "Indexed", lastSync: "just now", rows: 0},
		permissions: {owners: ["Ontology Admins"], editors: ["Site Engineers"], viewers: ["Viewers"]},
		installedBy: null,
	};
}

export function ObjectTypesView({
	onDetailChange,
	scope,
	openRecordId,
	onOpenRecordConsumed,
	onShowInFiles,
	objectTypes,
	onObjectTypesChange,
	createLocationField,
	onRecordCreated,
}: OntologyViewProps = {}) {
	// Groups, status and visibility are all facets, so they go through the shared Filter — same
	// dropdown-plus-removable-chips behaviour as every other table in the library.
	const [filters, setFilters] = useState<FilterValue>({});
	// The fixture is the starting point; created and edited types live here so the list, the detail
	// surface and the tab count all read the same state. The scope narrows the SEED, not the live
	// list, so a type created inside a product does not vanish the instant it is created.
	const seed = useMemo(() => scopeObjectTypes(WC3_OBJECT_TYPES, scope), [scope]);
	const [ownTypes, setOwnTypes] = useState<Wc3ObjectType[]>(seed);
	// Controlled when the shell supplies the pair, uncontrolled otherwise. `setTypes` keeps the updater
	// signature every call site below already uses, so lifting ownership changed no logic.
	const controlled = objectTypes !== undefined && onObjectTypesChange !== undefined;
	const types = controlled ? objectTypes : ownTypes;
	const setTypes = useCallback(
		(update: (prev: Wc3ObjectType[]) => Wc3ObjectType[]) => {
			if (controlled) onObjectTypesChange(update(objectTypes));
			else setOwnTypes(update);
		},
		[controlled, objectTypes, onObjectTypesChange],
	);
	// The Group facet and the wizard's group picker must not name a group the product cannot see.
	const groupOptions = useMemo(() => scopeTypeGroups(WC3_TYPE_GROUPS, scope), [scope]);
	const [openId, setOpenId] = useState<string | null>(null);
	const [wizardOpen, setWizardOpen] = useState(false);

	const sharedById = useMemo(() => new Map(WC3_SHARED_PROPERTIES.map((sp) => [sp.id, sp])), []);
	const open = types.find((o) => o.id === openId) ?? null;

	// Arriving from the file system: the file's ref named this object type, so open its detail page.
	useOpenRecord(openRecordId, (id) => types.some((o) => o.id === id), setOpenId, onOpenRecordConsumed);

	// The top bar owns the breadcrumb, so the drill-in has to be reported upward.
	useEffect(() => {
		onDetailChange?.(open?.displayName ?? null);
		return () => onDetailChange?.(null);
	}, [open?.displayName, onDetailChange]);

	const data = useMemo(
		() =>
			types.filter((o) =>
				Object.entries(filters).every(([key, selected]) => {
					if (!selected || selected.length === 0) return true;
					// A type can sit in several groups — match when any selected group is one of them.
					if (key === "groups") return o.groups.some((g) => selected.includes(g));
					return selected.includes(String(o[key as "status" | "visibility"]));
				}),
			),
		[filters, types],
	);

	const columns: ColumnDef<Wc3ObjectType, unknown>[] = useMemo(
		() => [
			{
				accessorKey: "displayName",
				header: ({column}) => <DataTableColumnHeader column={column} title="Display name" />,
				cell: ({row}) => (
					<span className="wwc:flex wwc:items-center wwc:gap-2 wwc:whitespace-nowrap wwc:font-medium">
						<OntologyGlyph name={row.original.icon} color={row.original.color} />
						<button
							type="button"
							onClick={() => setOpenId(row.original.id)}
							className="wwc:text-left wwc:underline wwc:underline-offset-2 wwc:transition-colors wwc:hover:text-primary"
						>
							{row.original.displayName}
						</button>
						{row.original.isLintDecoy && (
							// Badge is not a forwardRef component, so the tooltip anchors on a wrapping span.
							<HoverTooltip content="Seeded decoy for the lint panel — never ship this row">
								<span>
									<Badge variant="warningSoft">lint demo</Badge>
								</span>
							</HoverTooltip>
						)}
					</span>
				),
			},
			{
				id: "location",
				accessorFn: (r: {id: string}) => wc3FsLocationOf("ontology", r.id)?.path ?? "",
				header: ({column}) => <DataTableColumnHeader column={column} title="Location" />,
				cell: ({row}) => (
					<Wc3FsPathLabel perspectiveId="ontology" recordId={row.original.id} onOpenFolder={onShowInFiles} />
				),
			},
			{
				accessorKey: "apiName",
				header: ({column}) => <DataTableColumnHeader column={column} title="API name" />,
				cell: ({row}) => <Mono>{row.original.apiName}</Mono>,
			},
			{
				accessorKey: "status",
				header: ({column}) => <DataTableColumnHeader column={column} title="Status" />,
				cell: ({row}) => <StatusPill status={row.original.status} />,
			},
			{
				accessorKey: "visibility",
				header: ({column}) => <DataTableColumnHeader column={column} title="Visibility" />,
			},
			{
				id: "groups",
				header: "Groups",
				cell: ({row}) => <ChipList items={row.original.groups.map((g) => getTypeGroup(g)?.name ?? g)} max={3} />,
			},
			{
				id: "props",
				accessorFn: (o) => o.properties.length,
				header: ({column}) => <DataTableColumnHeader column={column} title="Props" />,
				cell: ({row}) => num(row.original.properties.length),
			},
			{
				id: "instances",
				accessorFn: (o) => instanceCount(o.id),
				header: ({column}) => <DataTableColumnHeader column={column} title="Instances" />,
				cell: ({row}) => num(instanceCount(row.original.id)),
			},
			{
				id: "rid",
				header: "RID",
				cell: ({row}) => <RidChip rid={row.original.rid} />,
			},
		],
		[onShowInFiles],
	);

	// The detail surface replaces the list in place, the way the prototype routes to /object-types/:id.
	if (open) {
		return (
			<ObjectTypeDetail
				objectType={open}
				sharedById={sharedById}
				takenApiNames={types.filter((o) => o.id !== open.id).map((o) => o.apiName)}
				onBack={() => setOpenId(null)}
				onChange={(next) => setTypes((prev) => prev.map((o) => (o.id === next.id ? next : o)))}
			/>
		);
	}

	return (
		<Pane flush>
			<NewObjectTypeDialog
				open={wizardOpen}
				onOpenChange={setWizardOpen}
				groups={groupOptions.map((g) => g.name)}
				datasources={WIZARD_DATASOURCES}
				icons={WIZARD_ICONS}
				baseTypes={WC3_BASE_TYPES}
				showLayer={false}
				leadingFields={createLocationField}
				onCreate={(draft) => {
					const created = toObjectType(draft);
					setTypes((prev) => [...prev, created]);
					// The shell files it at whatever the Location field chose.
					onRecordCreated?.(created.id, created.displayName);
					setOpenId(created.id);
				}}
			/>
			<Filter value={filters} onChange={setFilters}>
				<DataTable
					columns={columns}
					data={data}
					searchKey="displayName"
					searchPlaceholder="Search object types…"
					showColumnToggle
					recordLabel="object type"
					pageSize={20}
					emptyMessage="No object types match your filters."
					getRowId={(o) => o.id}
					// Group values are ids, so chips would read "g_field_ops" without this.
					filterChipLabel={(category, value) => (category === "groups" ? (getTypeGroup(value)?.name ?? value) : value)}
					toolbarExtra={
						<>
							<Button size="sm" onClick={() => setWizardOpen(true)}>
								<Plus className="wwc:h-3.5 wwc:w-3.5" />
								New object type
							</Button>
							<FilterTrigger />
							<FilterContent>
								<FilterCategory value="groups" label="Group">
									{groupOptions.map((g) => (
										<FilterOption key={g.id} value={g.id}>
											{g.name} ({g.members.length})
										</FilterOption>
									))}
								</FilterCategory>
								<FilterCategory value="status" label="Status">
									{STATUSES.map((s) => (
										<FilterOption key={s} value={s}>
											{s}
										</FilterOption>
									))}
								</FilterCategory>
								<FilterCategory value="visibility" label="Visibility">
									{VISIBILITIES.map((v) => (
										<FilterOption key={v} value={v}>
											{v}
										</FilterOption>
									))}
								</FilterCategory>
							</FilterContent>
						</>
					}
				/>
			</Filter>
		</Pane>
	);
}

// ─── 2. Link types ───────────────────────────────────────────────────────────

// Facets derive from the data, so a filter never offers a value no row can have.
const CARDINALITIES = [...new Set(WC3_LINK_TYPES.map((l) => l.cardinality))].sort();
const BACKINGS = [...new Set(WC3_LINK_TYPES.map((l) => l.backing.kind))].sort();
const LINK_STATUS_OPTIONS = [...new Set(WC3_LINK_TYPES.map((l) => l.status))].sort();

let createdLinks = 0;

/** WC3's link type -> the shared neutral model. */
function toLinkModel(l: Wc3LinkType): LinkTypeModel {
	const side = (s: Wc3LinkType["sideA"]): LinkTypeSide => ({
		objectTypeId: s.objectTypeId,
		objectTypeLabel: getObjectType(s.objectTypeId)?.displayName ?? s.objectTypeId,
		apiName: s.apiName,
		displayName: s.displayName,
		visibility: s.visibility,
	});
	const b = l.backing;
	const backing =
		b.kind === "foreignKey"
			? `Foreign key (${b.fkProperty} → ${b.targetPk})`
			: b.kind === "joinTable"
				? `Join table “${b.datasetName ?? "join dataset"}”`
				: `Intermediary: ${getObjectType(b.objectTypeId ?? "")?.displayName ?? "object"}`;
	return {
		id: l.id,
		rid: l.rid,
		sideA: side(l.sideA),
		sideB: side(l.sideB),
		cardinality: l.cardinality,
		backing,
		status: l.status,
		description: l.description,
		instanceLinks: instanceLinkCount(l.id),
	};
}

export function LinkTypesView({onDetailChange, scope}: OntologyViewProps = {}) {
	// Scoping the seed keeps a link created in-product on the list; both endpoints of every seeded
	// row are in scope, so no column can resolve a type the product does not own.
	const seed = useMemo(() => scopeLinkTypes(WC3_LINK_TYPES, scope), [scope]);
	const [links, setLinks] = useState<Wc3LinkType[]>(seed);
	const objectTypeOptions = useMemo(() => scopeObjectTypes(WC3_OBJECT_TYPES, scope), [scope]);
	const [filters, setFilters] = useState<FilterValue>({});
	const [openId, setOpenId] = useState<string | null>(null);
	const [wizardOpen, setWizardOpen] = useState(false);
	const open = links.find((l) => l.id === openId) ?? null;

	useEffect(() => {
		onDetailChange?.(open ? linkTypeLabel(open) : null);
		return () => onDetailChange?.(null);
	}, [open, onDetailChange]);

	const data = useMemo(
		() =>
			links.filter((l) =>
				Object.entries(filters).every(([key, selected]) => {
					if (!selected || selected.length === 0) return true;
					if (key === "backing") return selected.includes(l.backing.kind);
					// Either end may be the type the user filtered on.
					if (key === "objectType")
						return selected.includes(l.sideA.objectTypeId) || selected.includes(l.sideB.objectTypeId);
					return selected.includes(String(l[key as "status" | "cardinality"]));
				}),
			),
		[filters, links],
	);

	const columns: ColumnDef<Wc3LinkType, unknown>[] = useMemo(
		() => [
			{
				id: "a",
				accessorFn: (l) => getObjectType(l.sideA.objectTypeId)?.displayName ?? "",
				header: ({column}) => <DataTableColumnHeader column={column} title="Object type A" />,
				cell: ({row}) => <TypeChip type={getObjectType(row.original.sideA.objectTypeId)} />,
			},
			{
				id: "label",
				accessorFn: linkTypeLabel,
				header: ({column}) => <DataTableColumnHeader column={column} title="Link" />,
				cell: ({row}) => (
					<button
						type="button"
						onClick={() => setOpenId(row.original.id)}
						className="wwc:whitespace-nowrap wwc:text-left wwc:font-medium wwc:underline wwc:underline-offset-2 wwc:transition-colors wwc:hover:text-primary"
					>
						{row.original.sideA.displayName} <span className="wwc:text-muted-foreground">/</span>{" "}
						{row.original.sideB.displayName}
					</button>
				),
			},
			{
				id: "b",
				accessorFn: (l) => getObjectType(l.sideB.objectTypeId)?.displayName ?? "",
				header: ({column}) => <DataTableColumnHeader column={column} title="Object type B" />,
				cell: ({row}) => <TypeChip type={getObjectType(row.original.sideB.objectTypeId)} />,
			},
			{
				accessorKey: "cardinality",
				header: ({column}) => <DataTableColumnHeader column={column} title="Cardinality" />,
				cell: ({row}) => <Badge variant="neutralSoft">{row.original.cardinality}</Badge>,
			},
			{
				id: "backing",
				accessorFn: (l) => l.backing.kind,
				header: ({column}) => <DataTableColumnHeader column={column} title="Backing" />,
				cell: ({row}) => <span className="wwc:text-muted-foreground">{BACKING_LABEL[row.original.backing.kind]}</span>,
			},
			{
				accessorKey: "status",
				header: ({column}) => <DataTableColumnHeader column={column} title="Status" />,
				cell: ({row}) => <StatusPill status={row.original.status} />,
			},
			{
				id: "links",
				accessorFn: (l) => instanceLinkCount(l.id),
				header: ({column}) => <DataTableColumnHeader column={column} title="Instance links" />,
				cell: ({row}) => num(instanceLinkCount(row.original.id)),
			},
			{id: "rid", header: "RID", cell: ({row}) => <RidChip rid={row.original.rid} />},
		],
		[],
	);

	// The detail page replaces the list in place, exactly like the object-type drill-in.
	if (open) {
		return (
			<LinkTypeDetailPage
				linkType={toLinkModel(open)}
				instanceRows={WC3_INSTANCE_LINK_SAMPLES[open.id] ?? []}
				onBack={() => setOpenId(null)}
				iconFor={(label) => {
					const ot = objectTypeOptions.find((o) => o.displayName === label);
					return ot
						? (props) => <OntologyGlyph name={ot.icon} color={ot.color} className={props.className} />
						: undefined;
				}}
				statuses={STATUSES}
				visibilities={VISIBILITIES}
				onSave={(next) =>
					setLinks((prev) =>
						prev.map((l) =>
							l.id === next.id
								? {
										...l,
										status: next.status as Wc3Status,
										cardinality: next.cardinality as Wc3LinkType["cardinality"],
										description: next.description ?? l.description,
										sideA: {
											...l.sideA,
											apiName: next.sideA.apiName,
											displayName: next.sideA.displayName,
											visibility: next.sideA.visibility as Wc3LinkType["sideA"]["visibility"],
										},
										sideB: {
											...l.sideB,
											apiName: next.sideB.apiName,
											displayName: next.sideB.displayName,
											visibility: next.sideB.visibility as Wc3LinkType["sideB"]["visibility"],
										},
									}
								: l,
						),
					)
				}
			/>
		);
	}

	return (
		<Pane flush>
			<Filter value={filters} onChange={setFilters}>
				<DataTable
					columns={columns}
					data={data}
					searchKey="label"
					searchPlaceholder="Search link types…"
					showColumnToggle
					recordLabel="link type"
					pageSize={20}
					emptyMessage="No link types match your filters."
					getRowId={(l) => l.id}
					filterChipLabel={(category, value) =>
						category === "objectType"
							? (getObjectType(value)?.displayName ?? value)
							: category === "backing"
								? BACKING_LABEL[value as keyof typeof BACKING_LABEL]
								: value
					}
					toolbarExtra={
						<>
							<Button size="sm" onClick={() => setWizardOpen(true)}>
								<Plus className="wwc:h-3.5 wwc:w-3.5" />
								New link type
							</Button>
							<FilterTrigger />
							<FilterContent>
								<FilterCategory value="objectType" label="Object type">
									{objectTypeOptions.map((o) => (
										<FilterOption key={o.id} value={o.id}>
											{o.displayName}
										</FilterOption>
									))}
								</FilterCategory>
								<FilterCategory value="cardinality" label="Cardinality">
									{CARDINALITIES.map((c) => (
										<FilterOption key={c} value={c}>
											{c}
										</FilterOption>
									))}
								</FilterCategory>
								<FilterCategory value="backing" label="Backing">
									{BACKINGS.map((k) => (
										<FilterOption key={k} value={k}>
											{BACKING_LABEL[k]}
										</FilterOption>
									))}
								</FilterCategory>
								<FilterCategory value="status" label="Status">
									{LINK_STATUS_OPTIONS.map((st) => (
										<FilterOption key={st} value={st}>
											{st}
										</FilterOption>
									))}
								</FilterCategory>
							</FilterContent>
						</>
					}
				/>
			</Filter>

			<NewLinkTypeDialog
				open={wizardOpen}
				onOpenChange={setWizardOpen}
				objectTypes={objectTypeOptions.map((o) => ({id: o.id, label: o.displayName}))}
				// Foreign keys live on side A, so offer that type's own property API names.
				fkPropertiesFor={(id) => getObjectType(id)?.properties.map((p) => p.apiName) ?? []}
				targetPrimaryKeyFor={(id) => {
					const ot = getObjectType(id);
					const pk = ot?.properties.find((p) => ot.primaryKey.includes(p.id));
					return pk?.apiName ?? "id";
				}}
				onCreate={(draft) => {
					const created = toLinkType(draft);
					setLinks((prev) => [created, ...prev]);
					setOpenId(created.id);
				}}
			/>
		</Pane>
	);
}

/** The shared wizard's draft -> a WC3 link type. */
function toLinkType(draft: NewLinkTypeDraft): Wc3LinkType {
	const id = `lt_new_${++createdLinks}`;
	const kind = draft.backing.startsWith("Foreign key")
		? "foreignKey"
		: draft.backing.startsWith("Join table")
			? "joinTable"
			: "intermediary";
	return {
		id,
		rid: `ri.ontology.main.link-type.${id}`,
		status: "Experimental",
		cardinality: draft.cardinality as Wc3LinkType["cardinality"],
		description: draft.description,
		backing: {kind, fkObjectTypeId: draft.sideA.objectTypeId, fkProperty: draft.fkProperty},
		sideA: {
			objectTypeId: draft.sideA.objectTypeId ?? "",
			apiName: draft.sideA.apiName,
			displayName: draft.sideA.displayName,
			visibility: draft.sideA.visibility as Wc3LinkType["sideA"]["visibility"],
		},
		sideB: {
			objectTypeId: draft.sideB.objectTypeId ?? "",
			apiName: draft.sideB.apiName,
			displayName: draft.sideB.displayName,
			visibility: draft.sideB.visibility as Wc3LinkType["sideB"]["visibility"],
		},
	};
}

// ─── 3. Action types ─────────────────────────────────────────────────────────

const ruleCount = (a: Wc3ActionType) => (Array.isArray(a.rules) ? a.rules.length : 1);

const AT_STATUSES = [...new Set(WC3_ACTION_TYPES.map((a) => a.status))].sort();
const AT_RULE_KINDS = [
	...new Set(WC3_ACTION_TYPES.flatMap((a) => (Array.isArray(a.rules) ? a.rules.map((r) => r.kind) : ["function"]))),
].sort();

let createdActions = 0;

/** The wizard's draft -> a WC3 action type, mirroring what the prototype's create step assembles. */
function actionFromDraft(draft: NewActionTypeDraft, seq: number): Wc3ActionType {
	const id = `at_new_${seq}`;
	const parameters = draft.parameters.map((p, i) => ({...p, id: `${id}_p${i}`}));
	return {
		id,
		// A real RID is minted server-side; this is the prototype's client-side stand-in.
		rid: `ri.ontology.main.action-type.${id}`,
		apiName: draft.apiName,
		displayName: draft.displayName,
		description: draft.description,
		status: draft.status as Wc3Status,
		parameters,
		rules: draft.isFunction
			? {kind: "function" as const, functionName: draft.functionName, description: "Function-backed action"}
			: // Draft rules carry a client-side `id` the store shape doesn't; map to the store's rule shape.
				draft.rules.map(({id: _ruleId, ...rule}) => rule as Wc3ActionRule),
		submissionCriteria: null,
		sideEffects: {notifications: [], webhooks: []},
		// One section holding every parameter, exactly as the prototype seeds it.
		formLayout: {
			sections: [
				{id: `${id}_sec`, title: "Parameters", description: "", columns: 2, parameterIds: parameters.map((p) => p.id)},
			],
			tableEntry: false,
			inlineEdits: false,
		},
		permissions: {view: ["Ontology Admins"], run: ["Ontology Admins"]},
		installedBy: null,
	};
}

export function ActionTypesView({
	onDetailChange,
	scope,
	openRecordId,
	onOpenRecordConsumed,
	onShowInFiles,
	actionTypes,
	onActionTypesChange,
	createLocationField,
	onRecordCreated,
}: OntologyViewProps = {}) {
	// An action is seeded only when every object type it touches is in scope, so no rule or parameter
	// on a listed row can name a type the product does not own.
	const seed = useMemo(() => scopeActionTypes(WC3_ACTION_TYPES, scope), [scope]);
	const [ownActions, setOwnActions] = useState<Wc3ActionType[]>(seed);
	// Same controlled/uncontrolled bargain as ObjectTypesView above.
	const controlled = actionTypes !== undefined && onActionTypesChange !== undefined;
	const actions = controlled ? actionTypes : ownActions;
	const setActions = useCallback(
		(update: (prev: Wc3ActionType[]) => Wc3ActionType[]) => {
			if (controlled) onActionTypesChange(update(actionTypes));
			else setOwnActions(update);
		},
		[controlled, actionTypes, onActionTypesChange],
	);
	const objectTypeOptions = useMemo(() => scopeObjectTypes(WC3_OBJECT_TYPES, scope), [scope]);
	const linkTypeOptions = useMemo(() => scopeLinkTypes(WC3_LINK_TYPES, scope), [scope]);
	const [filters, setFilters] = useState<FilterValue>({});
	const [openId, setOpenId] = useState<string | null>(null);
	const [wizardOpen, setWizardOpen] = useState(false);
	// The run dialog is owned here so the list's Run button and the detail's Run action drive one dialog.
	const [runId, setRunId] = useState<string | null>(null);
	const open = actions.find((a) => a.id === openId) ?? null;
	const running = actions.find((a) => a.id === runId) ?? null;

	// Arriving from the file system: the file's ref named this action type.
	useOpenRecord(openRecordId, (id) => actions.some((a) => a.id === id), setOpenId, onOpenRecordConsumed);

	useEffect(() => {
		onDetailChange?.(open?.displayName ?? null);
		return () => onDetailChange?.(null);
	}, [open?.displayName, onDetailChange]);

	const data = useMemo(
		() =>
			actions.filter((a) =>
				Object.entries(filters).every(([key, selected]) => {
					if (!selected || selected.length === 0) return true;
					if (key === "ruleKind")
						return Array.isArray(a.rules)
							? a.rules.some((r) => selected.includes(r.kind))
							: selected.includes("function");
					if (key === "sideEffects") {
						const has = a.sideEffects.notifications.length > 0 || a.sideEffects.webhooks.length > 0;
						return selected.includes(has ? "yes" : "no");
					}
					return selected.includes(String(a[key as "status"]));
				}),
			),
		[actions, filters],
	);

	const columns: ColumnDef<Wc3ActionType, unknown>[] = useMemo(
		() => [
			{
				accessorKey: "displayName",
				header: ({column}) => <DataTableColumnHeader column={column} title="Action" />,
				cell: ({row}) => (
					<div className="wwc:min-w-0">
						<button
							type="button"
							onClick={() => setOpenId(row.original.id)}
							className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:text-left wwc:font-medium wwc:underline wwc:underline-offset-2 wwc:transition-colors wwc:hover:text-primary"
						>
							<Bolt className="wwc:h-3.5 wwc:w-3.5 wwc:text-amber-600" />
							{row.original.displayName}
						</button>
						<p className="wwc:mt-0.5 wwc:max-w-[46ch] wwc:truncate wwc:text-[11px] wwc:text-muted-foreground">
							{row.original.description}
						</p>
					</div>
				),
			},
			{
				id: "location",
				accessorFn: (r: {id: string}) => wc3FsLocationOf("ontology", r.id)?.path ?? "",
				header: ({column}) => <DataTableColumnHeader column={column} title="Location" />,
				cell: ({row}) => (
					<Wc3FsPathLabel perspectiveId="ontology" recordId={row.original.id} onOpenFolder={onShowInFiles} />
				),
			},
			{
				accessorKey: "apiName",
				header: ({column}) => <DataTableColumnHeader column={column} title="API name" />,
				cell: ({row}) => <Mono>{row.original.apiName}</Mono>,
			},
			{
				accessorKey: "status",
				header: ({column}) => <DataTableColumnHeader column={column} title="Status" />,
				cell: ({row}) => <StatusPill status={row.original.status} />,
			},
			{
				id: "params",
				accessorFn: (a) => a.parameters.length,
				header: ({column}) => <DataTableColumnHeader column={column} title="Params" />,
				cell: ({row}) => num(row.original.parameters.length),
			},
			{
				id: "rules",
				accessorFn: ruleCount,
				header: ({column}) => <DataTableColumnHeader column={column} title="Rules" />,
				cell: ({row}) =>
					Array.isArray(row.original.rules) ? (
						<ChipList items={row.original.rules.map((r) => r.kind)} max={3} />
					) : (
						// A function rule is exclusive — an action is either composable rules or one function.
						<Badge variant="infoSoft" className="wwc:font-mono wwc:font-normal">
							ƒ {row.original.rules.functionName}
						</Badge>
					),
			},
			{
				id: "effects",
				header: "Side effects",
				cell: ({row}) => {
					const {notifications, webhooks} = row.original.sideEffects;
					if (!notifications.length && !webhooks.length) return <span className="wwc:text-muted-foreground">—</span>;
					return (
						<span className="wwc:whitespace-nowrap wwc:text-xs wwc:text-muted-foreground">
							{notifications.length > 0 && `${notifications.length} notification${notifications.length > 1 ? "s" : ""}`}
							{notifications.length > 0 && webhooks.length > 0 && " · "}
							{webhooks.length > 0 && `${webhooks.length} webhook${webhooks.length > 1 ? "s" : ""}`}
						</span>
					);
				},
			},
			{
				id: "run",
				header: "",
				cell: ({row}) => (
					<Button
						size="sm"
						variant="outline"
						onClick={(e) => {
							// Without this the row's drill-in would fire too.
							e.stopPropagation();
							setRunId(row.original.id);
						}}
					>
						<Play className="wwc:h-3.5 wwc:w-3.5" />
						Run
					</Button>
				),
			},
		],
		[onShowInFiles],
	);

	if (open) {
		return (
			<>
				<ActionTypeDetail
					actionType={open}
					takenApiNames={actions.filter((a) => a.id !== open.id).map((a) => a.apiName)}
					onBack={() => setOpenId(null)}
					onChange={(next) => setActions((prev) => prev.map((a) => (a.id === next.id ? next : a)))}
					onDelete={(id) => {
						setActions((prev) => prev.filter((a) => a.id !== id));
						setOpenId(null);
					}}
					onRun={() => setRunId(open.id)}
				/>
				<RunActionDialog open={running !== null} onOpenChange={(o) => !o && setRunId(null)} actionType={running} />
			</>
		);
	}

	return (
		<Pane flush>
			<Filter value={filters} onChange={setFilters}>
				<DataTable
					columns={columns}
					data={data}
					searchKey="displayName"
					searchPlaceholder="Search action types…"
					showColumnToggle
					recordLabel="action type"
					pageSize={20}
					emptyMessage="No action types match your filters."
					getRowId={(a) => a.id}
					toolbarExtra={
						<>
							<Button size="sm" onClick={() => setWizardOpen(true)}>
								<Plus className="wwc:h-3.5 wwc:w-3.5" />
								New action type
							</Button>
							<FilterTrigger />
							<FilterContent>
								<FilterCategory value="status" label="Status">
									{AT_STATUSES.map((st) => (
										<FilterOption key={st} value={st}>
											{st}
										</FilterOption>
									))}
								</FilterCategory>
								<FilterCategory value="ruleKind" label="Rule kind">
									{AT_RULE_KINDS.map((k) => (
										<FilterOption key={k} value={k}>
											{k}
										</FilterOption>
									))}
								</FilterCategory>
								<FilterCategory value="sideEffects" label="Side effects">
									<FilterOption value="yes">Has side effects</FilterOption>
									<FilterOption value="no">None</FilterOption>
								</FilterCategory>
							</FilterContent>
						</>
					}
				/>
			</Filter>

			<NewActionTypeDialog
				open={wizardOpen}
				onOpenChange={setWizardOpen}
				objectTypes={objectTypeOptions.map((o) => ({id: o.id, label: o.displayName}))}
				linkTypes={linkTypeOptions.map((l) => ({id: l.id, label: linkTypeLabel(l)}))}
				onCreate={(draft) => {
					const created = actionFromDraft(draft, ++createdActions);
					setActions((prev) => [created, ...prev]);
					onRecordCreated?.(created.id, created.displayName);
					setOpenId(created.id);
				}}
			/>

			<RunActionDialog open={running !== null} onOpenChange={(o) => !o && setRunId(null)} actionType={running} />
		</Pane>
	);
}

// ─── 4. Interfaces ───────────────────────────────────────────────────────────

const IF_STATUSES = [...new Set(WC3_INTERFACES.map((i) => i.status))].sort();

let createdInterfaces = 0;

export function InterfacesView({onDetailChange, scope}: OntologyViewProps = {}) {
	// An interface is seeded while at least one in-scope object type implements it.
	const ifaceSeed = useMemo(() => scopeInterfaces(WC3_INTERFACES, scope), [scope]);
	const otSeed = useMemo(() => scopeObjectTypes(WC3_OBJECT_TYPES, scope), [scope]);
	const [interfaces, setInterfaces] = useState<Wc3Interface[]>(ifaceSeed);
	// Implementing an interface writes onto the object type, so this view holds them too.
	const [objectTypes, setObjectTypes] = useState<Wc3ObjectType[]>(otSeed);
	// The detail surface's optional data props: unscoped these are the same fixture references the
	// props already default to, so the administrator is untouched.
	const spScoped = useMemo(() => scopeSharedProperties(WC3_SHARED_PROPERTIES, scope), [scope]);
	const atScoped = useMemo(() => scopeActionTypes(WC3_ACTION_TYPES, scope), [scope]);
	const ltScoped = useMemo(() => scopeLinkTypes(WC3_LINK_TYPES, scope), [scope]);
	const [filters, setFilters] = useState<FilterValue>({});
	const [openId, setOpenId] = useState<string | null>(null);
	const [wizardOpen, setWizardOpen] = useState(false);
	const open = interfaces.find((i) => i.id === openId) ?? null;

	useEffect(() => {
		onDetailChange?.(open?.displayName ?? null);
		return () => onDetailChange?.(null);
	}, [open?.displayName, onDetailChange]);

	const data = useMemo(
		() =>
			interfaces.filter((i) =>
				Object.entries(filters).every(([key, selected]) => {
					if (!selected || selected.length === 0) return true;
					if (key === "extends") return i.extends.some((e) => selected.includes(e));
					return selected.includes(String(i[key as "status"]));
				}),
			),
		[filters, interfaces],
	);

	const columns: ColumnDef<Wc3Interface, unknown>[] = useMemo(
		() => [
			{
				accessorKey: "displayName",
				header: ({column}) => <DataTableColumnHeader column={column} title="Interface" />,
				cell: ({row}) => (
					<span className="wwc:flex wwc:items-center wwc:gap-2 wwc:font-medium">
						<OntologyGlyph name={row.original.icon} />
						<button
							type="button"
							onClick={() => setOpenId(row.original.id)}
							className="wwc:text-left wwc:underline wwc:underline-offset-2 wwc:transition-colors wwc:hover:text-primary"
						>
							{row.original.displayName}
						</button>
					</span>
				),
			},
			{
				accessorKey: "apiName",
				header: ({column}) => <DataTableColumnHeader column={column} title="API name" />,
				cell: ({row}) => <Mono>{row.original.apiName}</Mono>,
			},
			{
				accessorKey: "status",
				header: ({column}) => <DataTableColumnHeader column={column} title="Status" />,
				cell: ({row}) => <StatusPill status={row.original.status} />,
			},
			{
				id: "extends",
				header: "Extends",
				cell: ({row}) => <ChipList items={row.original.extends.map((e) => getInterface(e)?.displayName ?? e)} />,
			},
			{
				id: "props",
				accessorFn: (i) => interfaceAllProperties(i).length,
				header: ({column}) => <DataTableColumnHeader column={column} title="Properties" />,
				cell: ({row}) => num(interfaceAllProperties(row.original).length),
			},
			{
				id: "impls",
				accessorFn: (i) => scopedInterfaceImplementors(i.id, scope).length,
				header: ({column}) => <DataTableColumnHeader column={column} title="Implementors" />,
				cell: ({row}) => num(scopedInterfaceImplementors(row.original.id, scope).length),
			},
			{id: "rid", header: "RID", cell: ({row}) => <RidChip rid={row.original.rid} />},
		],
		[scope],
	);

	if (open) {
		return (
			<InterfaceDetail
				iface={open}
				interfaces={interfaces}
				objectTypes={objectTypes}
				sharedProperties={spScoped}
				actionTypes={atScoped}
				linkTypes={ltScoped}
				onImplement={(objectTypeId, propertyMap) =>
					setObjectTypes((prev) =>
						prev.map((o) =>
							o.id === objectTypeId
								? {...o, implements: [...o.implements, {interfaceId: open.id, propertyMap, linkMap: []}]}
								: o,
						),
					)
				}
				// Cross-tab navigation isn't wired yet; the object-type drill-in lives in its own tab.
				onOpenObjectType={() => {}}
				onBack={() => setOpenId(null)}
				onChange={(next) => setInterfaces((prev) => prev.map((i) => (i.id === next.id ? next : i)))}
				onDelete={() => {
					setInterfaces((prev) => prev.filter((i) => i.id !== open.id));
					setOpenId(null);
				}}
			/>
		);
	}

	return (
		<Pane flush>
			<Filter value={filters} onChange={setFilters}>
				<DataTable
					columns={columns}
					data={data}
					searchKey="displayName"
					searchPlaceholder="Search interfaces…"
					showColumnToggle
					recordLabel="interface"
					emptyMessage="No interfaces match your filters."
					getRowId={(i) => i.id}
					filterChipLabel={(category, value) =>
						category === "extends" ? (getInterface(value)?.displayName ?? value) : value
					}
					toolbarExtra={
						<>
							<Button size="sm" onClick={() => setWizardOpen(true)}>
								<Plus className="wwc:h-3.5 wwc:w-3.5" />
								New interface
							</Button>
							<FilterTrigger />
							<FilterContent>
								<FilterCategory value="status" label="Status">
									{IF_STATUSES.map((st) => (
										<FilterOption key={st} value={st}>
											{st}
										</FilterOption>
									))}
								</FilterCategory>
								<FilterCategory value="extends" label="Extends">
									{ifaceSeed.map((i) => (
										<FilterOption key={i.id} value={i.id}>
											{i.displayName}
										</FilterOption>
									))}
								</FilterCategory>
							</FilterContent>
						</>
					}
				/>
			</Filter>

			<NewInterfaceDialog
				open={wizardOpen}
				onOpenChange={setWizardOpen}
				extendsOptions={interfaces.map((i) => ({id: i.id, label: i.displayName}))}
				requireDescription
				onCreate={(draft) => {
					const created = interfaceFromDraft(draft, ++createdInterfaces);
					setInterfaces((prev) => [...prev, created]);
					setOpenId(created.id);
				}}
			/>
		</Pane>
	);
}

// ─── 5. Shared properties ────────────────────────────────────────────────────

export {SharedPropertiesView};

// ─── 6. Groups ───────────────────────────────────────────────────────────────

let createdGroups = 0;

export function GroupsView({onDetailChange, scope}: OntologyViewProps = {}) {
	// Scoping happens in the seed — members are narrowed and emptied groups dropped — so this table
	// needs no filtering layer and `data={groups}` stays as it is.
	const seed = useMemo(() => scopeTypeGroups(WC3_TYPE_GROUPS, scope), [scope]);
	const [groups, setGroups] = useState<Wc3TypeGroup[]>(seed);
	const objectTypeOptions = useMemo(() => scopeObjectTypes(WC3_OBJECT_TYPES, scope), [scope]);
	const [openId, setOpenId] = useState<string | null>(null);
	const [wizardOpen, setWizardOpen] = useState(false);
	const open = groups.find((g) => g.id === openId) ?? null;

	useEffect(() => {
		onDetailChange?.(open?.name ?? null);
		return () => onDetailChange?.(null);
	}, [open?.name, onDetailChange]);

	const columns: ColumnDef<Wc3TypeGroup, unknown>[] = useMemo(
		() => [
			{
				accessorKey: "name",
				header: ({column}) => <DataTableColumnHeader column={column} title="Group" />,
				cell: ({row}) => (
					<span className="wwc:flex wwc:items-center wwc:gap-2 wwc:font-medium">
						<Folder className="wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground" />
						<button
							type="button"
							onClick={() => setOpenId(row.original.id)}
							className="wwc:text-left wwc:underline wwc:underline-offset-2 wwc:transition-colors wwc:hover:text-primary"
						>
							{row.original.name}
						</button>
					</span>
				),
			},
			{
				accessorKey: "description",
				header: "Description",
				cell: ({row}) => <span className="wwc:text-muted-foreground">{row.original.description}</span>,
			},
			{
				id: "members",
				accessorFn: (g) => g.members.length,
				header: ({column}) => <DataTableColumnHeader column={column} title="Members" />,
				cell: ({row}) => (
					<ChipList items={row.original.members.map((m) => getObjectType(m)?.displayName ?? m)} max={6} />
				),
			},
		],
		[],
	);

	if (open) {
		return (
			<TypeGroupDetailPage
				group={open}
				groups={groups}
				// Unscoped this is the fixture the prop already defaults to; scoped it narrows the
				// "add member" candidates.
				objectTypes={objectTypeOptions}
				onBack={() => setOpenId(null)}
				onChange={(next) => setGroups((prev) => prev.map((g) => (g.id === next.id ? next : g)))}
				onDelete={() => {
					setGroups((prev) => prev.filter((g) => g.id !== open.id));
					setOpenId(null);
				}}
			/>
		);
	}

	return (
		<Pane flush>
			<DataTable
				columns={columns}
				data={groups}
				searchKey="name"
				searchPlaceholder="Search groups…"
				showColumnToggle
				recordLabel="group"
				emptyMessage="No groups match."
				getRowId={(g) => g.id}
				toolbarExtra={
					<Button size="sm" onClick={() => setWizardOpen(true)}>
						<Plus className="wwc:h-3.5 wwc:w-3.5" />
						New group
					</Button>
				}
			/>

			<NewTypeGroupDialog
				open={wizardOpen}
				onOpenChange={setWizardOpen}
				title="New object type group"
				namePlaceholder="e.g. Commercial & Cost"
				objectTypes={objectTypeOptions.map((o) => ({value: o.id, label: o.displayName}))}
				onCreate={(draft) => {
					const id = `g_new_${++createdGroups}`;
					const created: Wc3TypeGroup = {
						id,
						rid: `ri.ontology.main.type-group.${id}`,
						name: draft.name,
						description: draft.description,
						members: draft.members ?? [],
					};
					setGroups((prev) => [...prev, created]);
					setOpenId(created.id);
				}}
			/>
		</Pane>
	);
}

// ─── 7. Graph explorer ───────────────────────────────────────────────────────

// The graph is a React Flow canvas (see wc3-graph-explorer-flow.tsx). The earlier hand-rolled SVG
// version was removed once the two were compared side by side.
export {GraphExplorerFlowView};

// ─── Tab wiring ──────────────────────────────────────────────────────────────

// The lint engine and its panel live in wc3-health-view.tsx; re-exported so importers are unaffected.
export {runOntologyLint};

export type OntologyViewProps = {
	onDetailChange?: (label: string | null) => void;
	/**
	 * Narrows the tab to one product's slice of the ontology. Omit for the full ontology — that is
	 * the administrator workspace, whose behaviour is unchanged by this prop's existence.
	 */
	scope?: OntologyScope;
	/**
	 * The LIVE object types, owned by the shell. Supply both to hand ownership up — which the merged
	 * workspace does, so the file system can create a type that this tab then lists. Omit both and the
	 * view keeps its own state, seeded from the fixture, exactly as before.
	 */
	objectTypes?: Wc3ObjectType[];
	onObjectTypesChange?: (next: Wc3ObjectType[]) => void;
	/** The LIVE action types. Same bargain as `objectTypes`. */
	actionTypes?: Wc3ActionType[];
	onActionTypesChange?: (next: Wc3ActionType[]) => void;
} & Wc3FsLinkProps;

export const ONTOLOGY_VIEWS: Record<string, (props: OntologyViewProps) => React.ReactElement> = {
	"object-types": ObjectTypesView,
	"link-types": LinkTypesView,
	"action-types": ActionTypesView,
	interfaces: InterfacesView,
	"shared-properties": SharedPropertiesView,
	groups: GroupsView,
	graph: GraphExplorerFlowView,
	health: HealthView,
};
