import type {ColumnDef} from "@tanstack/react-table";

import {
	ArrowLeft,
	Beaker,
	Database,
	Image,
	Info,
	List,
	Lock,
	Plus,
	RotateCw,
	ShieldCheck,
	SlidersHorizontal,
	TriangleAlert,
	Waves,
	X,
} from "lucide-react";
import {useMemo, useState} from "react";

import {Badge} from "../badge";
import {Button} from "../button";
import {Card, CardContent, CardHeader, CardTitle} from "../card";
import {DataTable, DataTableColumnHeader} from "../data-table";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "../dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../dropdown-menu";
import {Empty} from "../empty";
import {Input} from "../input";
import {Label} from "../label";
import {PropertyList, PropertyRow} from "../property-list";
import {RecordDetailShell} from "../record-detail-shell";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../select";
import {type SideMenuGroup} from "../side-menu";
import {Textarea} from "../textarea";
import {HoverTooltip} from "../tooltip";
import {
	WC3_BASE_TYPES,
	WC3_DATASOURCE_CATALOG,
	WC3_DATASOURCE_KIND_LABEL,
	WC3_LINK_TYPES,
	WC3_SHARED_PROPERTIES,
	WC3_STATUSES,
	WC3_TYPE_GROUPS,
	WC3_USER_GROUPS,
	WC3_VISIBILITIES,
	type Wc3ObjectType,
	type Wc3Property,
	type Wc3Status,
	type Wc3Visibility,
	getInterface,
	getObjectType,
	getTypeGroup,
	instanceCount,
	interfaceAllProperties,
} from "./wc3-ontology-data";
import {OntologyGlyph} from "./wc3-ontology-glyphs";

// The object-type detail surface, ported from the prototype's ObjectTypeDetail: a back link, an
// identity header, and five tabs — Overview / Properties / Datasources / Metadata / Permissions.
// Edits are held in local state and handed back through `onChange`; there is no changeset drawer here,
// so a change applies immediately rather than staging.

const DS_ICON: Record<string, React.ComponentType<{className?: string}>> = {
	dataset: Database,
	restrictedView: Lock,
	stream: Waves,
	mediaSet: Image,
};

const STATUS_VARIANT: Record<Wc3Status, "successSoft" | "warningSoft" | "dangerSoft" | "infoSoft"> = {
	Active: "successSoft",
	Endorsed: "infoSoft",
	Experimental: "warningSoft",
	Deprecated: "dangerSoft",
};

/** Shared-property values win, so the effective name/type can differ from the local one. */
function effective(p: Wc3Property, sharedById: Map<string, {apiName: string; displayName: string; baseType: string}>) {
	if (!p.sharedPropertyId) return p;
	const sp = sharedById.get(p.sharedPropertyId);
	return sp ? {...p, apiName: sp.apiName, displayName: sp.displayName, baseType: sp.baseType} : p;
}

const hasDuplicatePk = (ot: Wc3ObjectType) => ot.datasources.some((d) => d.pkDuplicates);

// ─── Tabs ────────────────────────────────────────────────────────────────────

function OverviewTab({ot, onChange}: {ot: Wc3ObjectType; onChange: (next: Wc3ObjectType) => void}) {
	const links = useMemo(
		() => WC3_LINK_TYPES.filter((l) => l.sideA.objectTypeId === ot.id || l.sideB.objectTypeId === ot.id),
		[ot.id],
	);
	// filter(Boolean) does not narrow the type, so the predicate does it explicitly.
	const implemented = ot.implements
		.map((im) => getInterface(im.interfaceId))
		.filter((i): i is NonNullable<typeof i> => Boolean(i));
	const addableGroups = WC3_TYPE_GROUPS.filter((g) => !ot.groups.includes(g.id));
	const pkNames = ot.primaryKey.map((pid) => ot.properties.find((p) => p.id === pid)?.apiName ?? "?").join(", ");
	const titleName = ot.properties.find((p) => p.id === ot.titleKey)?.apiName ?? "—";

	return (
		<div className="wwc:space-y-4">
			{ot.isLintDecoy && (
				<div className="wwc:flex wwc:items-start wwc:gap-2 wwc:rounded-lg wwc:border wwc:border-amber-600/30 wwc:bg-amber-500/5 wwc:p-3 wwc:text-sm">
					<Beaker className="wwc:mt-0.5 wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-amber-600" />
					<span>
						<b>Seeded lint decoy.</b> This Experimental type intentionally violates best practices so the Health tab has
						real findings.
					</span>
				</div>
			)}

			<Card>
				<CardHeader>
					<CardTitle className="wwc:text-sm">About</CardTitle>
				</CardHeader>
				<CardContent className="wwc:space-y-3">
					<p className="wwc:text-sm wwc:text-muted-foreground">{ot.description}</p>
					<PropertyList>
						<PropertyRow label="RID">
							<span className="wwc:font-mono wwc:text-xs">{ot.rid}</span>
						</PropertyRow>
						<PropertyRow label="Primary key">
							<span className="wwc:font-mono wwc:text-xs">{pkNames}</span>
						</PropertyRow>
						<PropertyRow label="Title key">
							<span className="wwc:font-mono wwc:text-xs">{titleName}</span>
						</PropertyRow>
						<PropertyRow label="Module">{ot.module}</PropertyRow>
						<PropertyRow label="Provenance">
							{ot.installedBy ? (
								<span className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
									<Badge variant="infoSoft">product · {ot.installedBy.productKey}</Badge>
									<span className="wwc:text-xs wwc:text-muted-foreground">
										install <span className="wwc:font-mono">{ot.installedBy.installId}</span> — roll that install back
										and this type leaves the store with it.
									</span>
								</span>
							) : (
								<Badge variant="neutralSoft">authored locally</Badge>
							)}
						</PropertyRow>
						<PropertyRow label="Index status">
							{ot.indexStatus.state} · last sync {ot.indexStatus.lastSync}
						</PropertyRow>
						<PropertyRow label="Instances">{instanceCount(ot.id)}</PropertyRow>
					</PropertyList>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="wwc:flex-row wwc:items-center wwc:justify-between wwc:space-y-0">
					<CardTitle className="wwc:text-sm">Groups</CardTitle>
					{addableGroups.length > 0 && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm">
									<Plus className="wwc:h-3.5 wwc:w-3.5" />
									Add to group
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								{addableGroups.map((g) => (
									<DropdownMenuItem key={g.id} onSelect={() => onChange({...ot, groups: [...ot.groups, g.id]})}>
										{g.name}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</CardHeader>
				<CardContent>
					{ot.groups.length === 0 ? (
						<p className="wwc:text-sm wwc:text-muted-foreground">
							Not a member of any group. Groups drive filter facets and search.
						</p>
					) : (
						<div className="wwc:flex wwc:flex-wrap wwc:gap-1.5">
							{ot.groups.map((gid) => (
								<Badge key={gid} variant="neutralSoft" className="wwc:gap-1 wwc:font-normal">
									{getTypeGroup(gid)?.name ?? gid}
									<button
										type="button"
										aria-label={`Remove from ${getTypeGroup(gid)?.name ?? gid}`}
										onClick={() => onChange({...ot, groups: ot.groups.filter((x) => x !== gid)})}
										className="wwc:ml-0.5 wwc:rounded wwc:hover:text-foreground"
									>
										<X className="wwc:h-3 wwc:w-3" />
									</button>
								</Badge>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<div className="wwc:grid wwc:gap-4 wwc:lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="wwc:text-sm">Implements ({implemented.length})</CardTitle>
					</CardHeader>
					<CardContent>
						{implemented.length === 0 ? (
							<p className="wwc:text-sm wwc:text-muted-foreground">Implements no interfaces.</p>
						) : (
							<ul className="wwc:space-y-2">
								{implemented.map((i) => (
									<li key={i.id} className="wwc:flex wwc:items-center wwc:gap-2 wwc:text-sm">
										<OntologyGlyph name={i.icon} />
										<span className="wwc:font-medium">{i.displayName}</span>
										<span className="wwc:text-xs wwc:text-muted-foreground">
											{interfaceAllProperties(i).length} properties
										</span>
									</li>
								))}
							</ul>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="wwc:text-sm">Link types ({links.length})</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="wwc:space-y-2">
							{links.map((l) => {
								const other = getObjectType(
									l.sideA.objectTypeId === ot.id ? l.sideB.objectTypeId : l.sideA.objectTypeId,
								);
								return (
									<li key={l.id} className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2 wwc:text-sm">
										<span className="wwc:font-medium">
											{l.sideA.displayName} / {l.sideB.displayName}
										</span>
										<Badge variant="neutralSoft" className="wwc:font-normal">
											{l.cardinality}
										</Badge>
										<span className="wwc:text-xs wwc:text-muted-foreground">→ {other?.displayName ?? "deleted"}</span>
									</li>
								);
							})}
						</ul>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

/**
 * Adding a property, ported from the prototype's `OntologyStore.addProperty` + its "Add property"
 * menu. The prototype offers two paths and so does this: a blank local property, or applying one of
 * the centrally-governed shared properties that is not on this type yet.
 *
 * NOTE ON FIDELITY: the prototype's blank path pushes a "New property" row straight into the store
 * and opens a drawer to name it. This detail page has no such drawer, so a blank add would leave an
 * unnamed row the viewer cannot edit. The blank path therefore collects the same fields in a small
 * dialog first; the shared path stays a single click, exactly as in the prototype.
 */
function blankProperty(id: string, displayName: string, apiName: string, baseType: string, required: boolean) {
	return {
		id,
		apiName,
		displayName,
		baseType,
		description: "",
		required,
		searchable: true,
		sortable: true,
		aggregatable: false,
		formatting: null,
		conditionalFormat: [],
		typeClasses: [],
		sharedPropertyId: null,
		derived: null,
	} satisfies Wc3Property;
}

function AddPropertyDialog({
	open,
	onOpenChange,
	takenApiNames,
	onAdd,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	takenApiNames: Set<string>;
	onAdd: (property: Wc3Property) => void;
}) {
	const [displayName, setDisplayName] = useState("");
	const [apiName, setApiName] = useState("");
	const [baseType, setBaseType] = useState("string");
	const [required, setRequired] = useState(false);
	const [attempted, setAttempted] = useState(false);

	const reset = () => {
		setDisplayName("");
		setApiName("");
		setBaseType("string");
		setRequired(false);
		setAttempted(false);
	};

	// snake_case, matching every other apiName in the store.
	const suggested = displayName
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "");
	const effectiveApiName = apiName.trim() || suggested;
	const duplicate = effectiveApiName.length > 0 && takenApiNames.has(effectiveApiName);
	const missingName = displayName.trim().length === 0;
	const invalid = missingName || effectiveApiName.length === 0 || duplicate;

	const submit = () => {
		setAttempted(true);
		if (invalid) return;
		onAdd(blankProperty(`p_new_${Date.now()}`, displayName.trim(), effectiveApiName, baseType, required));
		reset();
		onOpenChange(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) reset();
				onOpenChange(next);
			}}
		>
			<DialogContent className="wwc:sm:max-w-[520px]">
				<DialogHeader>
					<DialogTitle>New property</DialogTitle>
					<DialogDescription className="wwc:sr-only">Define a local property on this object type.</DialogDescription>
				</DialogHeader>

				<div className="wwc:grid wwc:gap-4 wwc:p-4">
					<div className="wwc:grid wwc:grid-cols-2 wwc:gap-4">
						<div className="wwc:space-y-1.5">
							<Label htmlFor="new-prop-display">Display name *</Label>
							<Input
								id="new-prop-display"
								value={displayName}
								onChange={(event) => setDisplayName(event.target.value)}
								placeholder="e.g. Inspection due date"
							/>
							{attempted && missingName && <p className="wwc:text-xs wwc:text-destructive">Give it a name.</p>}
						</div>
						<div className="wwc:space-y-1.5">
							<Label htmlFor="new-prop-api">API name</Label>
							{/* Left blank it follows the display name, the way the rest of the store is written. */}
							<Input
								id="new-prop-api"
								value={apiName}
								onChange={(event) => setApiName(event.target.value)}
								placeholder={suggested || "snake_case"}
							/>
							{duplicate && (
								<p className="wwc:text-xs wwc:text-destructive">“{effectiveApiName}” already exists on this type.</p>
							)}
						</div>
					</div>

					<div className="wwc:grid wwc:grid-cols-2 wwc:gap-4">
						<div className="wwc:space-y-1.5">
							<Label>Base type</Label>
							<Select value={baseType} onValueChange={setBaseType}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{WC3_BASE_TYPES.map((type) => (
										<SelectItem key={type} value={type}>
											{type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="wwc:space-y-1.5">
							<Label>Required</Label>
							<Select value={required ? "yes" : "no"} onValueChange={(value) => setRequired(value === "yes")}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="no">Optional</SelectItem>
									<SelectItem value="yes">Required</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={submit}>Add property</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function PropertiesTab({
	ot,
	sharedById,
	onChange,
}: {
	ot: Wc3ObjectType;
	sharedById: Parameters<typeof effective>[1];
	onChange: (next: Wc3ObjectType) => void;
}) {
	const [dialogOpen, setDialogOpen] = useState(false);

	// Uniqueness is enforced on the EFFECTIVE apiName: a property governed by a shared property
	// answers to the shared one's name, so comparing raw apiNames would miss a real collision.
	const takenApiNames = useMemo(
		() => new Set(ot.properties.map((property) => effective(property, sharedById).apiName)),
		[ot.properties, sharedById],
	);

	const addProperty = (property: Wc3Property) => onChange({...ot, properties: [...ot.properties, property]});

	// Only shared properties not already applied to this type, as in the prototype's menu.
	const availableShared = useMemo(
		() =>
			WC3_SHARED_PROPERTIES.filter(
				(shared) =>
					!ot.properties.some((property) => property.sharedPropertyId === shared.id) &&
					!takenApiNames.has(shared.apiName),
			),
		[ot.properties, takenApiNames],
	);

	const applyShared = (sharedId: string) => {
		const shared = WC3_SHARED_PROPERTIES.find((sp) => sp.id === sharedId);
		if (!shared) return;
		addProperty({
			...blankProperty(
				`p_shared_${shared.id}_${Date.now()}`,
				shared.displayName,
				shared.apiName,
				shared.baseType,
				false,
			),
			description: shared.description,
			sharedPropertyId: shared.id,
		});
	};

	const addMenu = (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button size="sm">
					<Plus className="wwc:h-4 wwc:w-4" />
					Add property
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="wwc:w-64">
				<DropdownMenuItem onSelect={() => setDialogOpen(true)}>Blank property</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuLabel>From shared property</DropdownMenuLabel>
				{availableShared.length === 0 ? (
					<DropdownMenuItem disabled>(all shared properties already applied)</DropdownMenuItem>
				) : (
					availableShared.map((shared) => (
						<DropdownMenuItem key={shared.id} onSelect={() => applyShared(shared.id)}>
							{shared.displayName}
							<span className="wwc:ml-auto wwc:text-xs wwc:text-muted-foreground">{shared.baseType}</span>
						</DropdownMenuItem>
					))
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);

	const columns: ColumnDef<Wc3Property, unknown>[] = useMemo(
		() => [
			{
				id: "displayName",
				accessorFn: (p) => effective(p, sharedById).displayName,
				header: ({column}) => <DataTableColumnHeader column={column} title="Property" />,
				cell: ({row}) => (
					<span className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:font-medium">
						{effective(row.original, sharedById).displayName}
						{row.original.derived && (
							<Badge variant="infoSoft" className="wwc:font-normal">
								ƒ derived
							</Badge>
						)}
					</span>
				),
			},
			{
				id: "apiName",
				accessorFn: (p) => effective(p, sharedById).apiName,
				header: ({column}) => <DataTableColumnHeader column={column} title="API name" />,
				cell: ({row}) => (
					<span className="wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
						{effective(row.original, sharedById).apiName}
					</span>
				),
			},
			{
				id: "baseType",
				accessorFn: (p) => effective(p, sharedById).baseType,
				header: ({column}) => <DataTableColumnHeader column={column} title="Base type" />,
				cell: ({row}) => (
					<span className="wwc:font-mono wwc:text-xs">{effective(row.original, sharedById).baseType}</span>
				),
			},
			{
				id: "flags",
				header: "Flags",
				cell: ({row}) => {
					const p = row.original;
					const isPk = ot.primaryKey.includes(p.id);
					const isTitle = ot.titleKey === p.id;
					if (!isPk && !isTitle && !p.required) return <span className="wwc:text-muted-foreground">—</span>;
					return (
						<span className="wwc:flex wwc:flex-wrap wwc:gap-1">
							{isPk && <Badge variant="infoSoft">PK</Badge>}
							{isTitle && <Badge variant="successSoft">title</Badge>}
							{p.required && <Badge variant="neutralSoft">required</Badge>}
						</span>
					);
				},
			},
			{
				id: "hints",
				header: "Render hints",
				cell: ({row}) => {
					// The prototype abbreviates searchable/sortable/aggregatable to their initials.
					const hints = (["searchable", "sortable", "aggregatable"] as const)
						.filter((k) => row.original[k])
						.map((k) => k[0].toUpperCase())
						.join(" · ");
					return <span className="wwc:text-muted-foreground">{hints || "—"}</span>;
				},
			},
			{
				id: "formatting",
				header: "Formatting",
				cell: ({row}) => {
					const f = effective(row.original, sharedById).formatting;
					return (
						<span className="wwc:text-muted-foreground">
							{f ? `${f.kind}${f.pattern ? ` ${f.pattern}` : ""}` : "—"}
						</span>
					);
				},
			},
			{
				id: "shared",
				header: "Shared",
				cell: ({row}) =>
					row.original.sharedPropertyId ? (
						<Badge variant="neutralSoft" className="wwc:font-normal">
							shared
						</Badge>
					) : (
						<span className="wwc:text-muted-foreground">local</span>
					),
			},
		],
		[ot.primaryKey, ot.titleKey, sharedById],
	);

	return (
		<>
			<DataTable
				columns={columns}
				data={ot.properties}
				searchKey="displayName"
				searchPlaceholder="Filter properties…"
				recordLabel="property"
				recordLabelPlural="properties"
				pageSize={25}
				getRowId={(p) => p.id}
				toolbarExtra={addMenu}
				/* The page wrapper already supplies the top gutter; without this the toolbar's own py-4
				   stacks on it and this tab starts 16px lower than Overview and Metadata. */
				flushToolbar
			/>
			<AddPropertyDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				takenApiNames={takenApiNames}
				onAdd={addProperty}
			/>
		</>
	);
}

function DatasourcesTab({ot, onChange}: {ot: Wc3ObjectType; onChange: (next: Wc3ObjectType) => void}) {
	const attachable = WC3_DATASOURCE_CATALOG.filter((c) => !ot.datasources.some((d) => d.catalogId === c.id));
	const pkNames = ot.primaryKey.map((pid) => ot.properties.find((p) => p.id === pid)?.apiName ?? "?").join(", ");

	return (
		<Card>
			<CardHeader className="wwc:flex-row wwc:items-center wwc:justify-between wwc:space-y-0">
				<CardTitle className="wwc:text-sm">Datasources ({ot.datasources.length})</CardTitle>
				{attachable.length > 0 && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button size="sm">
								<Plus className="wwc:h-3.5 wwc:w-3.5" />
								Attach datasource
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="wwc:max-h-80 wwc:overflow-auto">
							{attachable.map((c) => (
								<DropdownMenuItem
									key={c.id}
									onSelect={() =>
										onChange({
											...ot,
											datasources: [
												...ot.datasources,
												{
													id: `dsi_${c.id}_${ot.datasources.length}`,
													catalogId: c.id,
													kind: c.kind,
													name: c.name,
													pkDuplicates: !!c.pkDuplicates,
												},
											],
										})
									}
								>
									{c.name} ({WC3_DATASOURCE_KIND_LABEL[c.kind]}){c.pkDuplicates ? " · dup keys" : ""}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</CardHeader>
			<CardContent className="wwc:space-y-3">
				{hasDuplicatePk(ot) && (
					<div className="wwc:flex wwc:items-start wwc:gap-2 wwc:rounded-lg wwc:border wwc:border-amber-600/30 wwc:bg-amber-500/5 wwc:p-3 wwc:text-sm">
						<TriangleAlert className="wwc:mt-0.5 wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-amber-600" />
						<span>
							<b>Duplicate primary keys.</b> At least one backing datasource repeats the primary key (
							<span className="wwc:font-mono">{pkNames}</span>). Objects will nondeterministically overwrite each other
							on sync.
						</span>
					</div>
				)}

				{ot.datasources.length === 0 ? (
					<Empty
						icon={<Database className="wwc:h-6 wwc:w-6" />}
						title="No datasources attached"
						description="This type has no backing store, so its rows can never sync."
					/>
				) : (
					ot.datasources.map((d) => {
						const Icon = DS_ICON[d.kind] ?? Database;
						const catalog = WC3_DATASOURCE_CATALOG.find((c) => c.id === d.catalogId);
						return (
							<div key={d.id} className="wwc:rounded-md wwc:border wwc:border-border wwc:p-3">
								<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
									<Icon className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
									<span className="wwc:font-mono wwc:text-sm wwc:font-medium">{d.name}</span>
									<Badge variant="neutralSoft" className="wwc:font-normal">
										{WC3_DATASOURCE_KIND_LABEL[d.kind]}
									</Badge>
									{d.pkDuplicates && <Badge variant="warningSoft">duplicate keys</Badge>}
									<Button
										variant="outline"
										size="sm"
										className="wwc:ml-auto"
										onClick={() => onChange({...ot, datasources: ot.datasources.filter((x) => x.id !== d.id)})}
									>
										Detach
									</Button>
								</div>
								{catalog && (
									<p className="wwc:mt-1.5 wwc:font-mono wwc:text-[10.5px] wwc:text-muted-foreground">
										{catalog.columns.join(" · ")}
									</p>
								)}
							</div>
						);
					})
				)}
			</CardContent>
		</Card>
	);
}

function MetadataTab({
	ot,
	takenApiNames,
	onChange,
}: {
	ot: Wc3ObjectType;
	/** API names already used by OTHER object types — the prototype refuses a collision here. */
	takenApiNames: string[];
	onChange: (next: Wc3ObjectType) => void;
}) {
	const [apiError, setApiError] = useState<string | null>(null);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="wwc:text-sm">Edit metadata</CardTitle>
			</CardHeader>
			<CardContent className="wwc:space-y-4">
				<div className="wwc:grid wwc:gap-4 wwc:sm:grid-cols-2">
					<div className="wwc:space-y-1.5">
						<Label htmlFor="md-dn">Display name</Label>
						<Input id="md-dn" value={ot.displayName} onChange={(e) => onChange({...ot, displayName: e.target.value})} />
					</div>
					<div className="wwc:space-y-1.5">
						<Label htmlFor="md-api">API name</Label>
						<Input
							id="md-api"
							className="wwc:font-mono"
							value={ot.apiName}
							onChange={(e) => {
								const v = e.target.value.trim();
								// Same two guards as the prototype: non-empty, and unique across object types.
								if (!v) setApiError("API name cannot be empty.");
								else if (takenApiNames.includes(v))
									setApiError(`API name “${v}” is already used by another object type.`);
								else setApiError(null);
								onChange({...ot, apiName: e.target.value});
							}}
						/>
						{apiError && <p className="wwc:text-xs wwc:text-destructive">{apiError}</p>}
					</div>
					<div className="wwc:space-y-1.5">
						<Label htmlFor="md-pl">Plural display name</Label>
						<Input id="md-pl" value={ot.pluralName} onChange={(e) => onChange({...ot, pluralName: e.target.value})} />
					</div>
					<div className="wwc:space-y-1.5">
						<Label>Status</Label>
						<Select value={ot.status} onValueChange={(v) => onChange({...ot, status: v as Wc3Status})}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{WC3_STATUSES.map((s) => (
									<SelectItem key={s} value={s}>
										{s}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="wwc:space-y-1.5">
						<Label>Visibility</Label>
						<Select value={ot.visibility} onValueChange={(v) => onChange({...ot, visibility: v as Wc3Visibility})}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{WC3_VISIBILITIES.map((v) => (
									<SelectItem key={v} value={v}>
										{v}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
				<div className="wwc:space-y-1.5">
					<Label htmlFor="md-desc">Description</Label>
					<Textarea
						id="md-desc"
						value={ot.description}
						onChange={(e) => onChange({...ot, description: e.target.value})}
					/>
				</div>
			</CardContent>
		</Card>
	);
}

function PermissionsTab({ot, onChange}: {ot: Wc3ObjectType; onChange: (next: Wc3ObjectType) => void}) {
	const roles = ["owners", "editors", "viewers"] as const;
	return (
		<Card>
			<CardHeader>
				<CardTitle className="wwc:text-sm">Permissions</CardTitle>
			</CardHeader>
			<CardContent className="wwc:space-y-4">
				{roles.map((role) => {
					const granted = ot.permissions[role];
					const addable = WC3_USER_GROUPS.filter((g) => !granted.includes(g));
					return (
						<div key={role} className="wwc:space-y-1.5">
							<Label className="wwc:capitalize">{role}</Label>
							<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5">
								{granted.map((g) => (
									<Badge key={g} variant="neutralSoft" className="wwc:gap-1 wwc:font-normal">
										{g}
										<button
											type="button"
											aria-label={`Remove ${g} from ${role}`}
											onClick={() =>
												onChange({
													...ot,
													permissions: {...ot.permissions, [role]: granted.filter((x) => x !== g)},
												})
											}
											className="wwc:ml-0.5 wwc:rounded wwc:hover:text-foreground"
										>
											<X className="wwc:h-3 wwc:w-3" />
										</button>
									</Badge>
								))}
								{addable.length > 0 && (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="outline" size="sm" icon aria-label={`Grant ${role}`}>
												<Plus className="wwc:h-3.5 wwc:w-3.5" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="start">
											{addable.map((g) => (
												<DropdownMenuItem
													key={g}
													onSelect={() => onChange({...ot, permissions: {...ot.permissions, [role]: [...granted, g]}})}
												>
													{g}
												</DropdownMenuItem>
											))}
										</DropdownMenuContent>
									</DropdownMenu>
								)}
							</div>
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}

// ─── Surface ─────────────────────────────────────────────────────────────────

export function ObjectTypeDetail({
	objectType,
	sharedById,
	takenApiNames,
	onBack,
	onChange,
}: {
	objectType: Wc3ObjectType;
	sharedById: Parameters<typeof effective>[1];
	/** API names held by every OTHER object type, for the uniqueness guard on the Metadata tab. */
	takenApiNames: string[];
	onBack: () => void;
	onChange: (next: Wc3ObjectType) => void;
}) {
	const [tab, setTab] = useState("overview");
	const ot = objectType;

	// Vertical sections, the same SideMenu the Settings sub-surface uses — not a second tab idiom.
	const sections: SideMenuGroup[] = [
		{
			items: [
				{id: "overview", label: "Overview", icon: Info},
				{id: "properties", label: "Properties", icon: List, count: ot.properties.length},
				{id: "datasources", label: "Datasources", icon: Database, count: ot.datasources.length},
				{id: "metadata", label: "Metadata", icon: SlidersHorizontal},
				{id: "permissions", label: "Permissions", icon: ShieldCheck},
			],
		},
	];

	return (
		<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col">
			{/*
			 * Fixed bar, sized to match PageContentHeader above it (compact density -> min-h-12, px-3)
			 * so the two stacked headers read as one band. Everything sits on one line at that height.
			 */}
			<div className="wwc:flex wwc:min-h-12 wwc:shrink-0 wwc:items-center wwc:justify-between wwc:gap-3 wwc:border-b wwc:border-border wwc:bg-card wwc:px-3">
				<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-2.5">
					<Button variant="ghost" size="sm" className="wwc:gap-1.5" onClick={onBack}>
						<ArrowLeft className="wwc:h-4 wwc:w-4" />
						Back
					</Button>
					<div className="wwc:h-5 wwc:w-px wwc:shrink-0 wwc:bg-border" />
					<OntologyGlyph name={ot.icon} color={ot.color} className="wwc:h-4 wwc:w-4 wwc:shrink-0" />
					<h1 className="wwc:truncate wwc:text-sm wwc:font-semibold">{ot.displayName}</h1>
					<Badge variant={STATUS_VARIANT[ot.status]}>{ot.status}</Badge>
					<Badge variant="neutralSoft" className="wwc:font-normal">
						{ot.visibility}
					</Badge>
					{hasDuplicatePk(ot) && (
						<HoverTooltip content="A backing datasource contains duplicate primary keys">
							<span>
								<Badge variant="warningSoft">dup PK</Badge>
							</span>
						</HoverTooltip>
					)}
					<span className="wwc:hidden wwc:truncate wwc:text-[11px] wwc:text-muted-foreground wwc:lg:inline">
						<span className="wwc:font-mono">{ot.apiName}</span> · {ot.pluralName}
					</span>
				</div>
				<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2">
					<Badge variant={ot.indexStatus.state === "Indexed" ? "successSoft" : "warningSoft"}>
						{ot.indexStatus.state}
					</Badge>
					<Button
						variant="outline"
						size="sm"
						className="wwc:gap-1.5"
						onClick={() => onChange({...ot, indexStatus: {...ot.indexStatus, state: "Indexing"}})}
					>
						<RotateCw className="wwc:h-4 wwc:w-4" />
						Re-index
					</Button>
				</div>
			</div>

			<RecordDetailShell title="Object type" sections={sections} activeSectionId={tab} onSectionChange={setTab}>
				{tab === "overview" && <OverviewTab ot={ot} onChange={onChange} />}
				{tab === "properties" && <PropertiesTab ot={ot} sharedById={sharedById} onChange={onChange} />}
				{tab === "datasources" && <DatasourcesTab ot={ot} onChange={onChange} />}
				{tab === "metadata" && <MetadataTab ot={ot} takenApiNames={takenApiNames} onChange={onChange} />}
				{tab === "permissions" && <PermissionsTab ot={ot} onChange={onChange} />}
			</RecordDetailShell>
		</div>
	);
}
