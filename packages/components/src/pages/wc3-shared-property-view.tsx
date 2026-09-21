import type {ColumnDef} from "@tanstack/react-table";

import {cn} from "@wakecap/core-utils";
import {Plus} from "lucide-react";
import {useEffect, useMemo, useState} from "react";

import {Badge} from "../badge";
import {Button} from "../button";
import {DataTable, DataTableColumnHeader} from "../data-table";
import {Filter, FilterCategory, FilterContent, FilterOption, FilterTrigger, type FilterValue} from "../filter";
import {toast} from "../sonner";
import {HoverTooltip} from "../tooltip";
import {
	WC3_BASE_TYPES,
	WC3_INTERFACES,
	WC3_OBJECT_TYPES,
	WC3_SHARED_PROPERTIES,
	type Wc3Interface,
	type Wc3ObjectType,
	type Wc3Property,
	type Wc3SharedProperty,
	getObjectType,
} from "./wc3-ontology-data";
import {OntologyGlyph} from "./wc3-ontology-glyphs";
import {scopeInterfaces, scopeObjectTypes, scopeSharedProperties, type OntologyScope} from "./wc3-ontology-scope";
import {
	SharedPropertyDetailPage,
	type SharedPropertyConsumer,
	type SharedPropertyInterfaceRef,
	type SharedPropertyModel,
} from "./wc3-shared-property-detail";
import {NewSharedPropertyDialog, type NewSharedPropertyDraft} from "./wc3-shared-property-wizard";

// The Shared properties tab of the Ontology Manager, ported from the prototype's SharedPropsList +
// SharedPropDetail (06-unified-workspace.html:4087-4230). A shared property is one definition many
// object types consume, so the list carries the join (used by / in interfaces) and the drill-in is
// where the propagation is visible.

// ─── Local copies of the shared-view helpers ─────────────────────────────────
// Mono / RidChip / ChipList / keyed / Pane are module-private in wc3-ontology-views.tsx. That file
// registers this view in ONTOLOGY_VIEWS, so importing them back from it would be a cycle — they are
// re-declared here instead of exported from there.

function Mono({children}: {children: React.ReactNode}) {
	return <span className="wwc:font-mono wwc:text-xs wwc:text-muted-foreground">{children}</span>;
}

/** The prototype's RID chip — a truncated resource identifier with the full value on hover. */
function RidChip({rid}: {rid: string}) {
	return (
		<HoverTooltip content={rid}>
			<span className="wwc:cursor-default wwc:font-mono wwc:text-[11px] wwc:text-muted-foreground">
				{rid.split(".").slice(-1)[0]}
			</span>
		</HoverTooltip>
	);
}

/**
 * Values repeat across a chip list, so a bare value is not a unique key. Suffix each repeat with its
 * occurrence number: `classification`, `classification~2`, …
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

/** Content pane for one tab; `flush` says the first child (a DataTable toolbar) brings its own top padding. */
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

// ─── Facets ──────────────────────────────────────────────────────────────────
// All derived from the fixture, so a filter never offers a value no row can have. There is
// deliberately no used/unused facet: every seeded shared property has at least one consumer, so
// "unused" would be an option nothing can match.

const SP_BASE_TYPES = [...new Set(WC3_SHARED_PROPERTIES.map((s) => s.baseType))].sort();
const SP_TYPE_CLASSES = [...new Set(WC3_SHARED_PROPERTIES.flatMap((s) => s.typeClasses))].sort();
const SP_FORMATTINGS = [...new Set(WC3_SHARED_PROPERTIES.map((s) => s.formatting?.kind ?? "none"))].sort();
// The Consumer facet names object types, so it is scope-dependent and lives per instance (see the
// `consumerIds` memo below) rather than at module scope.

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Shared-property values win, so the effective row can differ from the local one (the prototype's effProp). */
function effective(p: Wc3Property, sp: Wc3SharedProperty | undefined) {
	return sp ? {...p, apiName: sp.apiName, displayName: sp.displayName, baseType: sp.baseType} : p;
}

// One component instance per glyph, so a re-render does not remount every icon in the table.
const GLYPH_CACHE = new Map<string, React.ComponentType<{className?: string}>>();

function glyphFor(name: string, color?: string) {
	const key = `${name}|${color ?? ""}`;
	let Glyph = GLYPH_CACHE.get(key);
	if (!Glyph) {
		const Next = (props: {className?: string}) => (
			<OntologyGlyph name={name} color={color} className={props.className} />
		);
		Next.displayName = `Glyph(${name})`;
		Glyph = Next;
		GLYPH_CACHE.set(key, Glyph);
	}
	return Glyph;
}

const consumersOf = (spId: string, types: Wc3ObjectType[]) =>
	types.filter((o) => o.properties.some((p) => p.sharedPropertyId === spId));

const interfacesOf = (spId: string, ifaces: Wc3Interface[]) =>
	ifaces.filter((i) => i.properties.some((p) => p.sharedPropertyId === spId));

let createdProps = 0;
let createdShared = 0;

/** Turn the wizard's draft into a WC3 shared property. */
function toSharedProperty(draft: NewSharedPropertyDraft): Wc3SharedProperty {
	const id = `sp_new_${++createdShared}`;
	return {
		id,
		// A real RID is minted server-side; this is the prototype's client-side stand-in.
		rid: `ri.ontology.main.shared-property.${id}`,
		apiName: draft.apiName.trim(),
		displayName: draft.displayName.trim(),
		baseType: draft.baseType,
		description: draft.description.trim(),
		formatting: draft.formatting,
		typeClasses: draft.typeClasses,
	};
}

// A structural clone of OntologyViewProps rather than an import of it: importing wc3-ontology-views.tsx
// back would close the cycle described above. OntologyScope comes from the scope module, which is
// cycle-free.
export type SharedPropertiesViewProps = {
	onDetailChange?: (label: string | null) => void;
	/** Narrows the tab to one product's slice of the ontology. Omit for the full ontology. */
	scope?: OntologyScope;
};

export function SharedPropertiesView({onDetailChange, scope}: SharedPropertiesViewProps = {}) {
	const [filters, setFilters] = useState<FilterValue>({});
	// The fixture is the starting point; everything a mutation touches lives here so the list, the
	// drill-in and the consumer rows all read the same state. The scope narrows the SEED, so a record
	// created inside a product stays on the list.
	const sharedSeed = useMemo(() => scopeSharedProperties(WC3_SHARED_PROPERTIES, scope), [scope]);
	const typesSeed = useMemo(() => scopeObjectTypes(WC3_OBJECT_TYPES, scope), [scope]);
	const ifacesSeed = useMemo(() => scopeInterfaces(WC3_INTERFACES, scope), [scope]);
	const [shared, setShared] = useState<Wc3SharedProperty[]>(sharedSeed);
	const [types, setTypes] = useState<Wc3ObjectType[]>(typesSeed);
	const [ifaces, setIfaces] = useState<Wc3Interface[]>(ifacesSeed);
	const [openId, setOpenId] = useState<string | null>(null);
	const [wizardOpen, setWizardOpen] = useState(false);

	// Consumers come from the join, not from the object-type list, so no dead option is ever offered.
	// Derived from the SEEDS, not from live state: reading `shared`/`types` would make the dropdown
	// grow as the user creates or applies properties — something this facet never did.
	const consumerIds = useMemo(
		() => [...new Set(sharedSeed.flatMap((s) => consumersOf(s.id, typesSeed).map((o) => o.id)))].sort(),
		[sharedSeed, typesSeed],
	);

	const open = shared.find((s) => s.id === openId) ?? null;

	// The top bar owns the breadcrumb, so the drill-in has to be reported upward.
	useEffect(() => {
		onDetailChange?.(open?.displayName ?? null);
		return () => onDetailChange?.(null);
	}, [open?.displayName, onDetailChange]);

	/** Every mutation is one undo-able commit plus a toast, matching the prototype's commit(). */
	const commit = (summary: string, undo: () => void) => toast(summary, {action: {label: "Undo", onClick: undo}});

	const data = useMemo(
		() =>
			shared.filter((s) =>
				Object.entries(filters).every(([key, selected]) => {
					if (!selected || selected.length === 0) return true;
					// A shared property can carry several classes — match when any selected one is among them.
					if (key === "typeClass") return s.typeClasses.some((t) => selected.includes(t));
					if (key === "formatting") return selected.includes(s.formatting?.kind ?? "none");
					if (key === "consumer") return consumersOf(s.id, types).some((o) => selected.includes(o.id));
					return selected.includes(s.baseType);
				}),
			),
		[filters, shared, types],
	);

	const columns: ColumnDef<Wc3SharedProperty, unknown>[] = useMemo(
		() => [
			{
				accessorKey: "displayName",
				header: ({column}) => <DataTableColumnHeader column={column} title="Shared property" />,
				// The prototype's list search spans name, api name and description, so the search column does too.
				filterFn: (row, _columnId, value) => {
					const q = String(value).toLowerCase();
					const s = row.original;
					return `${s.displayName} ${s.apiName} ${s.description}`.toLowerCase().includes(q);
				},
				cell: ({row}) => (
					<span className="wwc:flex wwc:items-center wwc:gap-2 wwc:whitespace-nowrap wwc:font-medium">
						<OntologyGlyph name="pipeline" />
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
				accessorKey: "baseType",
				header: ({column}) => <DataTableColumnHeader column={column} title="Base type" />,
				cell: ({row}) => <Mono>{row.original.baseType}</Mono>,
			},
			{
				id: "formatting",
				accessorFn: (s) => s.formatting?.kind ?? "none",
				header: ({column}) => <DataTableColumnHeader column={column} title="Formatting" />,
				cell: ({row}) =>
					row.original.formatting ? (
						<Badge variant="neutralSoft" className="wwc:font-normal">
							{row.original.formatting.kind}
						</Badge>
					) : (
						<span className="wwc:text-muted-foreground">—</span>
					),
			},
			{
				id: "typeClasses",
				enableSorting: false,
				header: "Type classes",
				cell: ({row}) => <ChipList items={row.original.typeClasses} />,
			},
			{
				id: "consumers",
				accessorFn: (s) => consumersOf(s.id, types).length,
				header: ({column}) => <DataTableColumnHeader column={column} title="Used by" />,
				cell: ({row}) => {
					const list = consumersOf(row.original.id, types);
					if (list.length === 0) return <span className="wwc:text-muted-foreground wwc:italic">unused</span>;
					return <ChipList items={list.map((o) => o.displayName)} max={4} />;
				},
			},
			{
				id: "interfaces",
				accessorFn: (s) => interfacesOf(s.id, ifaces).length,
				header: ({column}) => <DataTableColumnHeader column={column} title="In interfaces" />,
				cell: ({row}) => <ChipList items={interfacesOf(row.original.id, ifaces).map((i) => i.displayName)} max={3} />,
			},
			{id: "rid", enableSorting: false, header: "RID", cell: ({row}) => <RidChip rid={row.original.rid} />},
		],
		[types, ifaces],
	);

	// ─── Mutations ─────────────────────────────────────────────────────────────

	const saveShared = (next: SharedPropertyModel) => {
		const before = shared;
		setShared((prev) => prev.map((s) => (s.id === next.id ? {...s, ...next} : s)));
		const n = consumersOf(next.id, types).length;
		commit(`Updated shared property “${next.displayName}” — propagated to ${n} object type(s)`, () =>
			setShared(before),
		);
	};

	const applyTo = (sp: Wc3SharedProperty, targetId: string) => {
		const target = types.find((o) => o.id === targetId);
		if (!target) return;
		// The shared apiName is canonical, so an application that would collide is blocked, not renamed.
		const spById = new Map(shared.map((s) => [s.id, s]));
		const taken = new Set(
			target.properties.map(
				(p) => effective(p, p.sharedPropertyId ? spById.get(p.sharedPropertyId) : undefined).apiName,
			),
		);
		if (taken.has(sp.apiName)) {
			toast.warning(`Can't apply shared property — “${sp.apiName}” already exists on ${target.displayName}.`);
			return;
		}
		const property: Wc3Property = {
			id: `p_shared_${++createdProps}`,
			apiName: sp.apiName,
			displayName: sp.displayName,
			baseType: sp.baseType,
			description: sp.description,
			required: false,
			searchable: true,
			sortable: true,
			aggregatable: false,
			formatting: null,
			conditionalFormat: [],
			typeClasses: [],
			sharedPropertyId: sp.id,
			derived: null,
		};
		const before = types;
		setTypes((prev) => prev.map((o) => (o.id === targetId ? {...o, properties: [...o.properties, property]} : o)));
		commit(`Added property “${sp.displayName}” to ${target.displayName}`, () => setTypes(before));
	};

	const removeConsumer = (sp: Wc3SharedProperty, consumer: SharedPropertyConsumer) => {
		const before = types;
		setTypes((prev) =>
			prev.map((o) =>
				o.id === consumer.id ? {...o, properties: o.properties.filter((p) => p.id !== consumer.propertyId)} : o,
			),
		);
		commit(`Removed “${sp.displayName}” from ${consumer.label}`, () => setTypes(before));
	};

	const deleteShared = (sp: Wc3SharedProperty) => {
		const beforeShared = shared;
		const beforeTypes = types;
		const beforeIfaces = ifaces;
		const consumerCount = consumersOf(sp.id, types).length;
		const refs = ifaces.flatMap((i) =>
			i.properties.filter((p) => p.sharedPropertyId === sp.id).map(() => i.displayName),
		);

		// Consumers and interface references are detached to local copies rather than deleted, so the
		// rows keep rendering — they just stop being governed centrally.
		setShared((prev) => prev.filter((s) => s.id !== sp.id));
		setTypes((prev) =>
			prev.map((o) => ({
				...o,
				properties: o.properties.map((p) => (p.sharedPropertyId === sp.id ? {...p, sharedPropertyId: null} : p)),
			})),
		);
		setIfaces((prev) =>
			prev.map((i) => ({
				...i,
				properties: i.properties.map((p) => (p.sharedPropertyId === sp.id ? {...p, sharedPropertyId: null} : p)),
			})),
		);
		setOpenId(null);

		if (refs.length > 0) {
			toast(`Converted ${refs.length} interface property reference(s) to local: ${[...new Set(refs)].join(", ")}`);
		}
		commit(`Deleted shared property “${sp.displayName}” (${consumerCount} consumer(s) keep local copies)`, () => {
			setShared(beforeShared);
			setTypes(beforeTypes);
			setIfaces(beforeIfaces);
		});
	};

	// ─── Drill-in ──────────────────────────────────────────────────────────────
	// The detail surface replaces the list in place, the way the prototype routes to
	// /ontology/shared-properties/:id.
	if (open) {
		const consumers: SharedPropertyConsumer[] = consumersOf(open.id, types).map((o) => {
			const local = o.properties.find((p) => p.sharedPropertyId === open.id) as Wc3Property;
			const eff = effective(local, open);
			return {
				id: o.id,
				label: o.displayName,
				icon: glyphFor(o.icon, o.color),
				propertyId: local.id,
				effectiveDisplayName: eff.displayName,
				effectiveApiName: eff.apiName,
				effectiveBaseType: eff.baseType,
				// Formatting and type classes are the shared property's — that is what propagates.
				effectiveFormatting: open.formatting?.kind,
				effectiveTypeClasses: open.typeClasses,
			};
		});
		const interfaceRefs: SharedPropertyInterfaceRef[] = interfacesOf(open.id, ifaces).map((i) => ({
			id: i.id,
			label: i.displayName,
			icon: glyphFor(i.icon),
		}));
		const applicable = types
			.filter((o) => !o.properties.some((p) => p.sharedPropertyId === open.id))
			.map((o) => ({id: o.id, label: o.displayName, icon: glyphFor(o.icon, o.color)}));

		return (
			<SharedPropertyDetailPage
				property={open}
				consumers={consumers}
				interfaces={interfaceRefs}
				applicable={applicable}
				baseTypes={WC3_BASE_TYPES}
				onBack={() => setOpenId(null)}
				onSave={saveShared}
				onApply={(t) => applyTo(open, t.id)}
				onRemoveConsumer={(c) => removeConsumer(open, c)}
				// Cross-tab routing belongs to the workspace shell, not to this tab — hint instead of navigating.
				onOpenConsumer={(c) => toast(`Open ${c.label} in the Object types tab.`)}
				onOpenInterface={(i) => toast(`Open ${i.label} in the Interfaces tab.`)}
				onDelete={() => deleteShared(open)}
				validateApiName={(value) =>
					shared.some((s) => s.id !== open.id && s.apiName === value)
						? `API name “${value}” is already used by another shared property.`
						: null
				}
			/>
		);
	}

	return (
		<Pane flush>
			<NewSharedPropertyDialog
				open={wizardOpen}
				onOpenChange={setWizardOpen}
				baseTypes={WC3_BASE_TYPES}
				validate={(d) => {
					// The prototype reports these in order and stops at the first failure.
					if (!d.displayName.trim()) return "Display name required.";
					if (!d.apiName.trim()) return "API name required.";
					if (shared.some((s) => s.apiName === d.apiName.trim()))
						return "API name already used by another shared property.";
					if (!d.description.trim()) return "Description required.";
					return null;
				}}
				onCreate={(draft) => {
					const created = toSharedProperty(draft);
					const before = shared;
					setShared((prev) => [...prev, created]);
					commit(`Created shared property “${created.displayName}”`, () => setShared(before));
					// Creation lands on the new record's detail page, as in the prototype.
					setOpenId(created.id);
				}}
			/>
			<Filter value={filters} onChange={setFilters}>
				<DataTable
					columns={columns}
					data={data}
					searchKey="displayName"
					searchPlaceholder="Search shared properties…"
					showColumnToggle
					recordLabel="shared property"
					recordLabelPlural="shared properties"
					pageSize={20}
					emptyMessage="No shared properties match your filters."
					getRowId={(s) => s.id}
					// Consumer values are object-type ids, and "none" needs spelling out as a formatting.
					filterChipLabel={(category, value) => {
						if (category === "consumer") return getObjectType(value)?.displayName ?? value;
						if (category === "formatting" && value === "none") return "No formatting";
						return value;
					}}
					toolbarExtra={
						<>
							<Button size="sm" onClick={() => setWizardOpen(true)}>
								<Plus className="wwc:h-3.5 wwc:w-3.5" />
								New shared property
							</Button>
							<FilterTrigger />
							<FilterContent>
								<FilterCategory value="baseType" label="Base type">
									{SP_BASE_TYPES.map((t) => (
										<FilterOption key={t} value={t}>
											{t}
										</FilterOption>
									))}
								</FilterCategory>
								<FilterCategory value="typeClass" label="Type class">
									{SP_TYPE_CLASSES.map((t) => (
										<FilterOption key={t} value={t}>
											{t}
										</FilterOption>
									))}
								</FilterCategory>
								<FilterCategory value="formatting" label="Formatting">
									{SP_FORMATTINGS.map((f) => (
										<FilterOption key={f} value={f}>
											{f === "none" ? "No formatting" : f}
										</FilterOption>
									))}
								</FilterCategory>
								<FilterCategory value="consumer" label="Consumer">
									{consumerIds.map((id) => (
										<FilterOption key={id} value={id}>
											{getObjectType(id)?.displayName ?? id}
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
