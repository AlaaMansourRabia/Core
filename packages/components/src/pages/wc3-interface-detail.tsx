import type {ColumnDef} from "@tanstack/react-table";

import {cn} from "@core/core-utils";
import {ArrowLeft, Bolt, Circle, CircleCheck, Link2, Plus, Share2, Trash2, TriangleAlert} from "lucide-react";
import {useEffect, useMemo, useState} from "react";

import {Badge} from "../badge";
import {Button} from "../button";
import {Card, CardContent, CardHeader, CardTitle} from "../card";
import {ConfirmDialog} from "../confirm-dialog";
import {DataTable, DataTableColumnHeader} from "../data-table";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "../dialog";
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
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../select";
import {Switch} from "../switch";
import {Textarea} from "../textarea";
import {ToggleGroup, ToggleGroupItem} from "../toggle-group";
import {HoverTooltip} from "../tooltip";
import type {NewInterfaceDraft} from "./wc3-interface-wizard";
import {
	WC3_ACTION_TYPES,
	WC3_INTERFACES,
	WC3_LINK_TYPES,
	WC3_SHARED_PROPERTIES,
	WC3_STATUSES,
	type Wc3ActionType,
	type Wc3Interface,
	type Wc3LinkType,
	type Wc3ObjectType,
	type Wc3SharedProperty,
	type Wc3Status,
} from "./wc3-ontology-data";
import {OntologyGlyph} from "./wc3-ontology-glyphs";

// The interface drill-in, ported from the prototype's InterfaceDetail: metadata, properties,
// constraints, implementors and a danger zone. Five short sections, so they stack — the same call
// LinkTypeDetailPage makes; only the object type has enough rows to earn a left SideMenu.
//
// Every read walks the `interfaces` / `objectTypes` arrays the host passes, never the frozen fixture
// helpers (getInterface, interfaceAllProperties, interfaceImplementors), because an interface created
// in this session or an object type that just gained an `implements` entry exists only in host state.

type IfProperty = Wc3Interface["properties"][number];
type IfConstraint = Wc3Interface["linkConstraints"][number];

const SEGMENT_ON =
	"wwc:data-[state=on]:border-primary wwc:data-[state=on]:bg-primary/10 wwc:data-[state=on]:text-primary";

// Re-declared rather than imported: wc3-ontology-views.tsx imports this file, so exporting these from
// there would be an import cycle. Same precedent as wc3-object-type-detail.tsx.
const STATUS_VARIANT: Record<Wc3Status, "successSoft" | "warningSoft" | "dangerSoft" | "infoSoft"> = {
	Active: "successSoft",
	Endorsed: "infoSoft",
	Experimental: "warningSoft",
	Deprecated: "dangerSoft",
};

function StatusPill({status}: {status: Wc3Status}) {
	return <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>;
}

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

/**
 * wc3-ontology-data.ts declares `actionConstraints: unknown[]`, although every fixture row carries the
 * same shape as a link constraint. Narrow at the edge instead of casting at the call site; when that
 * declaration is tightened this keeps working unchanged.
 */
function isConstraint(v: unknown): v is IfConstraint {
	if (typeof v !== "object" || v === null) return false;
	const c = v as Partial<IfConstraint>;
	return typeof c.id === "string" && typeof c.targetId === "string" && typeof c.description === "string";
}

const readConstraints = (list: readonly unknown[]): IfConstraint[] => list.filter(isConstraint);

const findInterface = (interfaces: Wc3Interface[], id: string) => interfaces.find((i) => i.id === id);

/**
 * True when `fromId` already reaches `targetId` through its extends chain — the cycle guard behind the
 * Extends toggle. Adding X to Y is refused when X already extends Y, directly or transitively.
 */
export function interfaceExtendsReaches(fromId: string, targetId: string, interfaces: Wc3Interface[]): boolean {
	const seen = new Set<string>();
	const walk = (id: string): boolean => {
		if (seen.has(id)) return false;
		seen.add(id);
		const it = findInterface(interfaces, id);
		if (!it) return false;
		return it.extends.some((parent) => parent === targetId || walk(parent));
	};
	return walk(fromId);
}

type PropertyRow = {property: IfProperty; ownerId: string; inherited: boolean};

/** Every property the interface promises: inherited ones first, then its own, deduped by API name. */
function collectProperties(iface: Wc3Interface, interfaces: Wc3Interface[]): PropertyRow[] {
	const seen = new Set<string>();
	const out: PropertyRow[] = [];
	const walk = (it: Wc3Interface | undefined, guard: Set<string>) => {
		if (!it || guard.has(it.id)) return;
		guard.add(it.id);
		it.extends.forEach((id) => walk(findInterface(interfaces, id), guard));
		it.properties.forEach((p) => {
			if (seen.has(p.apiName)) return;
			seen.add(p.apiName);
			out.push({property: p, ownerId: it.id, inherited: it.id !== iface.id});
		});
	};
	walk(iface, new Set());
	return out;
}

/** Interface ids an object type satisfies through one `implements` entry, following extends. */
function satisfiedBy(entryInterfaceId: string, interfaces: Wc3Interface[]): string[] {
	const chain = (id: string, guard: Set<string>): string[] => {
		if (guard.has(id)) return [];
		guard.add(id);
		const it = findInterface(interfaces, id);
		return it ? [id, ...it.extends.flatMap((p) => chain(p, guard))] : [id];
	};
	return chain(entryInterfaceId, new Set());
}

/** Object types implementing this interface, directly or through one that extends it. */
function implementorsOf(ifaceId: string, objectTypes: Wc3ObjectType[], interfaces: Wc3Interface[]) {
	return objectTypes.filter((o) =>
		o.implements.some((im) => satisfiedBy(im.interfaceId, interfaces).includes(ifaceId)),
	);
}

/** The `implements` entry an object type satisfies this interface through. */
function implementEntry(o: Wc3ObjectType, ifaceId: string, interfaces: Wc3Interface[]) {
	return o.implements.find((im) => satisfiedBy(im.interfaceId, interfaces).includes(ifaceId));
}

/**
 * The prototype's auto-mapping pass: a shared property is the strongest signal, so it matches first;
 * failing that an identical API name AND base type is taken as the same field.
 */
export function autoMapInterfaceProperties(
	iface: Wc3Interface,
	objectType: Wc3ObjectType,
	interfaces: Wc3Interface[] = WC3_INTERFACES,
): Record<string, string> {
	const map: Record<string, string> = {};
	collectProperties(iface, interfaces).forEach(({property}) => {
		const bySharedProperty = property.sharedPropertyId
			? objectType.properties.find((p) => p.sharedPropertyId === property.sharedPropertyId)
			: undefined;
		const byName = objectType.properties.find(
			(p) => p.apiName === property.apiName && p.baseType === property.baseType,
		);
		const hit = bySharedProperty ?? byName;
		if (hit) map[property.id] = hit.id;
	});
	return map;
}

// ─── Implement dialog ────────────────────────────────────────────────────────

/** Sentinel: Radix Select rejects an empty option value, and "no mapping" needs to be selectable. */
const UNMAPPED = "__unmapped__";

export interface ImplementInterfaceDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	iface: Wc3Interface;
	objectType: Wc3ObjectType;
	/** Needed to resolve inherited interface properties. */
	interfaces?: Wc3Interface[];
	linkTypes?: Wc3LinkType[];
	actionTypes?: Wc3ActionType[];
	/** Interface property id -> object type property id. */
	onImplement: (propertyMap: Record<string, string>) => void;
}

/**
 * Map an object type onto an interface's contract. Exported because the object-type detail carries the
 * same “Implement interface” menu and must open this exact dialog rather than a second copy of it.
 */
export function ImplementInterfaceDialog({
	open,
	onOpenChange,
	iface,
	objectType,
	interfaces = WC3_INTERFACES,
	linkTypes = WC3_LINK_TYPES,
	actionTypes = WC3_ACTION_TYPES,
	onImplement,
}: ImplementInterfaceDialogProps) {
	const rows = useMemo(() => collectProperties(iface, interfaces), [iface, interfaces]);
	const auto = useMemo(
		() => autoMapInterfaceProperties(iface, objectType, interfaces),
		[iface, objectType, interfaces],
	);
	const [map, setMap] = useState<Record<string, string>>(auto);
	const [error, setError] = useState<string | null>(null);

	// Re-open on a different pair (or after the auto-pass changes) starts from the auto-mapping again.
	useEffect(() => {
		if (open) {
			setMap(auto);
			setError(null);
		}
	}, [open, auto]);

	const linkConstraints = iface.linkConstraints;
	const actionConstraints = readConstraints(iface.actionConstraints);

	const linkSatisfied = (c: IfConstraint) =>
		linkTypes.some(
			(l) =>
				(l.sideA.objectTypeId === objectType.id && l.sideB.objectTypeId === c.targetId) ||
				(l.sideB.objectTypeId === objectType.id && l.sideA.objectTypeId === c.targetId),
		);

	const actionSatisfied = (c: IfConstraint) => {
		const at = actionTypes.find((a) => a.id === c.targetId);
		return Boolean(at && Array.isArray(at.rules) && at.rules.some((r) => r.objectTypeId === objectType.id));
	};

	const autoCount = Object.keys(auto).length;

	const submit = () => {
		const unmappedRequired = rows
			.filter((r) => r.property.required && !map[r.property.id])
			.map((r) => r.property.apiName);
		const unmetLinks = linkConstraints.filter((c) => c.required && !linkSatisfied(c)).map((c) => c.description);
		if (unmappedRequired.length > 0 || unmetLinks.length > 0) {
			setError(
				[
					unmappedRequired.length > 0 ? `Unmapped required properties: ${unmappedRequired.join(", ")}.` : null,
					unmetLinks.length > 0 ? `Unsatisfied required link constraints: ${unmetLinks.join("; ")}.` : null,
				]
					.filter(Boolean)
					.join(" "),
			);
			return;
		}
		onImplement(map);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="wwc:flex wwc:max-h-[92vh] wwc:w-[calc(100vw-2rem)] wwc:max-w-3xl wwc:flex-col wwc:gap-0 wwc:overflow-hidden wwc:p-0">
				<DialogHeader>
					<DialogTitle>
						<OntologyGlyph name={objectType.icon} color={objectType.color} className="wwc:h-4 wwc:w-4" />
						{objectType.displayName} implements {iface.displayName}
					</DialogTitle>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						Shared-property matches were auto-mapped ({autoCount}/{rows.length}).
					</p>
				</DialogHeader>

				<div className="wwc:min-h-0 wwc:flex-1 wwc:space-y-4 wwc:overflow-y-auto wwc:px-6 wwc:py-5">
					{rows.length === 0 && (
						<p className="wwc:text-sm wwc:text-muted-foreground">
							This interface promises no properties — implementing it is a pure contract statement.
						</p>
					)}

					{rows.map(({property}) => {
						const value = map[property.id] ?? UNMAPPED;
						return (
							<div key={property.id} className="wwc:grid wwc:gap-2 wwc:sm:grid-cols-2 wwc:sm:items-center">
								<div className="wwc:min-w-0 wwc:space-y-1">
									<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5">
										<span className="wwc:text-sm wwc:font-medium">{property.name}</span>
										<Badge variant={property.required ? "neutralSoft" : "secondary"} className="wwc:font-normal">
											{property.required ? "required" : "optional"}
										</Badge>
										{property.sharedPropertyId && (
											<Badge variant="infoSoft" className="wwc:gap-1 wwc:font-normal">
												<Share2 className="wwc:h-3 wwc:w-3" />
												shared
											</Badge>
										)}
									</div>
									<Mono>
										{property.apiName} · {property.baseType}
									</Mono>
								</div>
								<Select
									value={value}
									onValueChange={(v) =>
										setMap((prev) => {
											const next = {...prev};
											if (v === UNMAPPED) delete next[property.id];
											else next[property.id] = v;
											return next;
										})
									}
								>
									<SelectTrigger aria-label={`Map ${property.apiName}`}>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={UNMAPPED}>
											{property.required ? "— unmapped —" : "— skip (optional) —"}
										</SelectItem>
										{objectType.properties.map((p) => (
											<SelectItem key={p.id} value={p.id}>
												{p.apiName} ({p.baseType}){p.baseType === property.baseType ? "" : " · type mismatch"}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						);
					})}

					{(linkConstraints.length > 0 || actionConstraints.length > 0) && (
						<div className="wwc:space-y-2 wwc:border-t wwc:border-border wwc:pt-4">
							{linkConstraints.map((c) => (
								<ConstraintBanner key={c.id} constraint={c} satisfied={linkSatisfied(c)} />
							))}
							{actionConstraints.map((c) => (
								<ConstraintBanner key={c.id} constraint={c} satisfied={actionSatisfied(c)} />
							))}
						</div>
					)}
				</div>

				<DialogFooter>
					<span className="wwc:text-sm">
						{error ? (
							<span className="wwc:text-destructive">{error}</span>
						) : (
							<span className="wwc:text-muted-foreground">Required properties must be mapped.</span>
						)}
					</span>
					<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2">
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button onClick={submit}>Implement</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function ConstraintBanner({constraint, satisfied}: {constraint: IfConstraint; satisfied: boolean}) {
	return (
		<div
			className={cn(
				"wwc:flex wwc:items-start wwc:gap-2 wwc:rounded-lg wwc:border wwc:p-2.5 wwc:text-sm",
				satisfied
					? "wwc:border-emerald-600/30 wwc:bg-emerald-500/5"
					: constraint.required
						? "wwc:border-red-600/30 wwc:bg-red-500/5"
						: "wwc:border-amber-600/30 wwc:bg-amber-500/5",
			)}
		>
			{satisfied ? (
				<CircleCheck className="wwc:mt-0.5 wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-emerald-600" />
			) : constraint.required ? (
				<TriangleAlert className="wwc:mt-0.5 wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-red-600" />
			) : (
				<Circle className="wwc:mt-0.5 wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-amber-600" />
			)}
			<span>
				{constraint.description} —{" "}
				<b>{satisfied ? "satisfied" : constraint.required ? "unsatisfied (required)" : "unsatisfied (recommended)"}</b>
			</span>
		</div>
	);
}

// ─── Sections ────────────────────────────────────────────────────────────────

function MetadataCard({
	iface,
	interfaces,
	onChange,
}: {
	iface: Wc3Interface;
	interfaces: Wc3Interface[];
	onChange: (next: Wc3Interface) => void;
}) {
	// An invalid API name is shown but never committed, so the field needs its own draft value.
	const [apiDraft, setApiDraft] = useState<string | null>(null);
	const [apiError, setApiError] = useState<string | null>(null);
	const [extendsError, setExtendsError] = useState<string | null>(null);

	const taken = interfaces.filter((i) => i.id !== iface.id).map((i) => i.apiName);
	const others = interfaces.filter((i) => i.id !== iface.id);

	const toggleExtends = (next: string[]) => {
		const added = next.find((id) => !iface.extends.includes(id));
		if (added) {
			const other = findInterface(interfaces, added);
			// Adding an interface that already reaches this one would close the inheritance loop.
			if (other && interfaceExtendsReaches(added, iface.id, interfaces)) {
				setExtendsError(`“${other.displayName}” already extends “${iface.displayName}” — that would be a cycle.`);
				return;
			}
		}
		setExtendsError(null);
		onChange({...iface, extends: next});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="wwc:text-sm">Metadata</CardTitle>
			</CardHeader>
			<CardContent className="wwc:space-y-4">
				<div className="wwc:grid wwc:gap-4 wwc:sm:grid-cols-2">
					<div className="wwc:space-y-1.5">
						<Label htmlFor="if-dn">Display name</Label>
						<Input
							id="if-dn"
							value={iface.displayName}
							onChange={(e) => onChange({...iface, displayName: e.target.value})}
						/>
					</div>
					<div className="wwc:space-y-1.5">
						<Label htmlFor="if-api">API name</Label>
						<Input
							id="if-api"
							className="wwc:font-mono"
							value={apiDraft ?? iface.apiName}
							onChange={(e) => {
								const raw = e.target.value;
								const v = raw.trim();
								// Same two guards as the prototype — and an invalid value is not saved.
								if (!v) {
									setApiDraft(raw);
									setApiError("API name cannot be empty.");
									return;
								}
								if (taken.includes(v)) {
									setApiDraft(raw);
									setApiError(`API name “${v}” is already used by another interface.`);
									return;
								}
								setApiDraft(null);
								setApiError(null);
								onChange({...iface, apiName: raw});
							}}
						/>
						{apiError && <p className="wwc:text-xs wwc:text-destructive">{apiError}</p>}
					</div>
					<div className="wwc:space-y-1.5">
						<Label>Status</Label>
						<Select value={iface.status} onValueChange={(v) => onChange({...iface, status: v as Wc3Status})}>
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
						<Label>RID</Label>
						<p className="wwc:pt-1.5 wwc:font-mono wwc:text-xs wwc:text-muted-foreground">{iface.rid}</p>
					</div>
				</div>

				<div className="wwc:space-y-2">
					<Label>Extends</Label>
					{others.length === 0 ? (
						<p className="wwc:text-sm wwc:text-muted-foreground">No other interface to extend yet.</p>
					) : (
						<ToggleGroup
							type="multiple"
							value={iface.extends}
							onValueChange={toggleExtends}
							variant="outline"
							size="sm"
							className="wwc:flex-wrap wwc:justify-start wwc:gap-2"
						>
							{others.map((i) => (
								<ToggleGroupItem key={i.id} value={i.id} className={SEGMENT_ON}>
									<OntologyGlyph name={i.icon} className="wwc:h-3.5 wwc:w-3.5" />
									{i.displayName}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
					)}
					{extendsError ? (
						<p className="wwc:text-xs wwc:text-destructive">{extendsError}</p>
					) : (
						<p className="wwc:text-xs wwc:text-muted-foreground">
							Transitive properties are inherited automatically. Cycles are rejected.
						</p>
					)}
				</div>

				<div className="wwc:space-y-1.5">
					<Label htmlFor="if-desc">Description</Label>
					<Textarea
						id="if-desc"
						value={iface.description}
						onChange={(e) => onChange({...iface, description: e.target.value})}
					/>
				</div>
			</CardContent>
		</Card>
	);
}

let createdProperties = 0;

function PropertiesCard({
	iface,
	interfaces,
	sharedProperties,
	onChange,
}: {
	iface: Wc3Interface;
	interfaces: Wc3Interface[];
	sharedProperties: Wc3SharedProperty[];
	onChange: (next: Wc3Interface) => void;
}) {
	const rows = useMemo(() => collectProperties(iface, interfaces), [iface, interfaces]);
	const inherited = rows.filter((r) => r.inherited).length;
	const pulledIn = new Set(rows.map((r) => r.property.sharedPropertyId).filter(Boolean));
	const addableShared = sharedProperties.filter((sp) => !pulledIn.has(sp.id));

	const columns: ColumnDef<PropertyRow, unknown>[] = useMemo(
		() => [
			{
				id: "name",
				accessorFn: (r) => r.property.name,
				header: ({column}) => <DataTableColumnHeader column={column} title="Property" />,
				cell: ({row}) => <span className="wwc:font-medium">{row.original.property.name}</span>,
			},
			{
				id: "apiName",
				accessorFn: (r) => r.property.apiName,
				header: ({column}) => <DataTableColumnHeader column={column} title="API name" />,
				cell: ({row}) => <Mono>{row.original.property.apiName}</Mono>,
			},
			{
				id: "baseType",
				accessorFn: (r) => r.property.baseType,
				header: ({column}) => <DataTableColumnHeader column={column} title="Base type" />,
				cell: ({row}) => <span className="wwc:font-mono wwc:text-xs">{row.original.property.baseType}</span>,
			},
			{
				id: "required",
				header: "Required",
				cell: ({row}) => {
					const {property, inherited: isInherited} = row.original;
					// Only the interface's OWN contract is editable here; inherited rows are read-only.
					if (isInherited)
						return <span className="wwc:text-muted-foreground">{property.required ? "required" : "optional"}</span>;
					return (
						<Switch
							checked={property.required}
							aria-label={`${property.apiName} required`}
							onCheckedChange={(checked) =>
								onChange({
									...iface,
									properties: iface.properties.map((p) => (p.id === property.id ? {...p, required: checked} : p)),
								})
							}
						/>
					);
				},
			},
			{
				id: "source",
				header: "Source",
				cell: ({row}) => {
					const {property, ownerId, inherited: isInherited} = row.original;
					const owner = findInterface(interfaces, ownerId);
					return (
						<span className="wwc:flex wwc:items-center wwc:gap-1.5">
							{property.sharedPropertyId ? (
								<Badge variant="infoSoft" className="wwc:gap-1 wwc:font-normal">
									<Share2 className="wwc:h-3 wwc:w-3" />
									shared
								</Badge>
							) : (
								<span className="wwc:text-muted-foreground">local</span>
							)}
							{isInherited && (
								<span className="wwc:text-xs wwc:text-muted-foreground">
									(inherited{owner ? ` from ${owner.displayName}` : ""})
								</span>
							)}
						</span>
					);
				},
			},
			{
				id: "actions",
				header: "",
				cell: ({row}) =>
					row.original.inherited ? null : (
						<Button
							variant="ghost"
							size="sm"
							icon
							tooltip="Remove property"
							aria-label={`Remove ${row.original.property.apiName}`}
							onClick={() =>
								onChange({
									...iface,
									properties: iface.properties.filter((p) => p.id !== row.original.property.id),
								})
							}
						>
							<Trash2 className="wwc:h-3.5 wwc:w-3.5" />
						</Button>
					),
			},
		],
		[iface, interfaces, onChange],
	);

	return (
		<Card>
			<CardHeader className="wwc:flex-row wwc:items-center wwc:justify-between wwc:space-y-0">
				<CardTitle className="wwc:text-sm">
					Properties ({rows.length} incl. {inherited} inherited)
				</CardTitle>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button size="sm">
							<Plus className="wwc:h-3.5 wwc:w-3.5" />
							Add property
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="wwc:max-h-80 wwc:overflow-auto">
						<DropdownMenuItem
							onSelect={() =>
								onChange({
									...iface,
									properties: [
										...iface.properties,
										{
											id: `ifp_${iface.id}_${++createdProperties}`,
											apiName: "new_property",
											name: "New property",
											baseType: "string",
											required: false,
											sharedPropertyId: null,
										},
									],
								})
							}
						>
							Local interface property
						</DropdownMenuItem>
						{addableShared.length > 0 && (
							<>
								<DropdownMenuSeparator />
								<DropdownMenuLabel>From shared property</DropdownMenuLabel>
								{addableShared.map((sp) => (
									<DropdownMenuItem
										key={sp.id}
										onSelect={() =>
											onChange({
												...iface,
												properties: [
													...iface.properties,
													{
														id: `ifp_${iface.id}_${++createdProperties}`,
														apiName: sp.apiName,
														name: sp.displayName,
														baseType: sp.baseType,
														required: false,
														sharedPropertyId: sp.id,
													},
												],
											})
										}
									>
										{sp.displayName} <span className="wwc:font-mono wwc:text-xs">({sp.baseType})</span>
									</DropdownMenuItem>
								))}
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</CardHeader>
			<CardContent>
				<DataTable
					columns={columns}
					data={rows}
					searchKey="name"
					searchPlaceholder="Filter properties…"
					recordLabel="property"
					recordLabelPlural="properties"
					pageSize={25}
					emptyMessage="No properties — add local ones or pull in shared properties."
					getRowId={(r) => `${r.ownerId}:${r.property.id}`}
				/>
			</CardContent>
		</Card>
	);
}

let createdConstraints = 0;

function ConstraintsCard({
	iface,
	objectTypes,
	actionTypes,
	onChange,
}: {
	iface: Wc3Interface;
	objectTypes: Wc3ObjectType[];
	actionTypes: Wc3ActionType[];
	onChange: (next: Wc3Interface) => void;
}) {
	const actionConstraints = readConstraints(iface.actionConstraints);
	const total = iface.linkConstraints.length + actionConstraints.length;

	const addLink = (ot: Wc3ObjectType) =>
		onChange({
			...iface,
			linkConstraints: [
				...iface.linkConstraints,
				{
					id: `ifc_${iface.id}_${++createdConstraints}`,
					targetKind: "objectType",
					targetId: ot.id,
					description: `Should link to a ${ot.displayName}`,
					required: false,
				},
			],
		});

	const addAction = (at: Wc3ActionType) =>
		onChange({
			...iface,
			actionConstraints: [
				...actionConstraints,
				{
					id: `ifa_${iface.id}_${++createdConstraints}`,
					targetKind: "actionType",
					targetId: at.id,
					description: `Implementors should be covered by “${at.displayName}”`,
					required: false,
				},
			],
		});

	const remove = (kind: "link" | "action", id: string) =>
		onChange(
			kind === "link"
				? {...iface, linkConstraints: iface.linkConstraints.filter((c) => c.id !== id)}
				: {...iface, actionConstraints: actionConstraints.filter((c) => c.id !== id)},
		);

	const rules: {kind: "link" | "action"; constraint: IfConstraint}[] = [
		...iface.linkConstraints.map((c) => ({kind: "link" as const, constraint: c})),
		...actionConstraints.map((c) => ({kind: "action" as const, constraint: c})),
	];

	return (
		<Card>
			<CardHeader className="wwc:flex-row wwc:items-center wwc:justify-between wwc:space-y-0">
				<CardTitle className="wwc:text-sm">Constraints ({total})</CardTitle>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button size="sm">
							<Plus className="wwc:h-3.5 wwc:w-3.5" />
							Add constraint
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="wwc:max-h-80 wwc:overflow-auto">
						<DropdownMenuLabel>Link constraint — implementors must/should link to…</DropdownMenuLabel>
						{/* The prototype offers the first ten types; the menu is a shortcut, not a picker. */}
						{objectTypes.slice(0, 10).map((ot) => (
							<DropdownMenuItem key={ot.id} onSelect={() => addLink(ot)}>
								<OntologyGlyph name={ot.icon} color={ot.color} />
								{ot.displayName}
							</DropdownMenuItem>
						))}
						<DropdownMenuSeparator />
						<DropdownMenuLabel>Action constraint — implementors covered by…</DropdownMenuLabel>
						{actionTypes.map((at) => (
							<DropdownMenuItem key={at.id} onSelect={() => addAction(at)}>
								<Bolt className="wwc:h-3.5 wwc:w-3.5 wwc:text-amber-600" />
								{at.displayName}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</CardHeader>
			<CardContent className="wwc:space-y-2">
				{rules.length === 0 ? (
					<p className="wwc:text-sm wwc:text-muted-foreground">
						No constraints. Link constraints demand relationships; action constraints demand coverage by actions.
					</p>
				) : (
					rules.map(({kind, constraint}) => (
						<div
							key={constraint.id}
							className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2 wwc:rounded-md wwc:border wwc:border-border wwc:p-3"
						>
							<Badge variant="neutralSoft" className="wwc:gap-1 wwc:font-normal">
								{kind === "link" ? <Link2 className="wwc:h-3 wwc:w-3" /> : <Bolt className="wwc:h-3 wwc:w-3" />}
								{kind}
							</Badge>
							<span className="wwc:text-sm">{constraint.description}</span>
							<Badge variant={constraint.required ? "warningSoft" : "secondary"} className="wwc:font-normal">
								{constraint.required ? "required" : "recommended"}
							</Badge>
							<Button
								variant="ghost"
								size="sm"
								icon
								className="wwc:ml-auto"
								tooltip="Remove constraint"
								aria-label={`Remove ${constraint.description}`}
								onClick={() => remove(kind, constraint.id)}
							>
								<Trash2 className="wwc:h-3.5 wwc:w-3.5" />
							</Button>
						</div>
					))
				)}
			</CardContent>
		</Card>
	);
}

function ImplementorsCard({
	iface,
	interfaces,
	objectTypes,
	onOpenObjectType,
	onPickImplementor,
}: {
	iface: Wc3Interface;
	interfaces: Wc3Interface[];
	objectTypes: Wc3ObjectType[];
	onOpenObjectType: (objectTypeId: string) => void;
	onPickImplementor: (objectTypeId: string) => void;
}) {
	const rows = useMemo(() => implementorsOf(iface.id, objectTypes, interfaces), [iface.id, objectTypes, interfaces]);
	const candidates = objectTypes.filter((o) => !o.implements.some((im) => im.interfaceId === iface.id));

	const columns: ColumnDef<Wc3ObjectType, unknown>[] = useMemo(
		() => [
			{
				accessorKey: "displayName",
				header: ({column}) => <DataTableColumnHeader column={column} title="Object type" />,
				cell: ({row}) => (
					<span className="wwc:flex wwc:items-center wwc:gap-2 wwc:whitespace-nowrap wwc:font-medium">
						<OntologyGlyph name={row.original.icon} color={row.original.color} />
						<button
							type="button"
							onClick={() => onOpenObjectType(row.original.id)}
							className="wwc:text-left wwc:underline wwc:underline-offset-2 wwc:transition-colors wwc:hover:text-primary"
						>
							{row.original.displayName}
						</button>
					</span>
				),
			},
			{
				accessorKey: "status",
				header: ({column}) => <DataTableColumnHeader column={column} title="Status" />,
				cell: ({row}) => <StatusPill status={row.original.status} />,
			},
			{
				id: "mapped",
				header: "Mapped properties",
				cell: ({row}) => {
					const entry = implementEntry(row.original, iface.id, interfaces);
					const pairs = Object.entries(entry?.propertyMap ?? {});
					if (pairs.length === 0) return <span className="wwc:text-muted-foreground">—</span>;
					return (
						<span className="wwc:flex wwc:flex-wrap wwc:gap-1">
							{pairs.map(([ifacePropId, objectPropId]) => {
								const ifaceProp = interfaces.flatMap((i) => i.properties).find((p) => p.id === ifacePropId);
								const objectProp = row.original.properties.find((p) => p.id === objectPropId);
								return (
									<Badge key={ifacePropId} variant="neutralSoft" className="wwc:font-mono wwc:font-normal">
										{ifaceProp?.apiName ?? ifacePropId} → {objectProp?.apiName ?? objectPropId}
									</Badge>
								);
							})}
						</span>
					);
				},
			},
			{
				id: "open",
				header: "",
				cell: ({row}) => (
					<Button variant="outline" size="sm" onClick={() => onOpenObjectType(row.original.id)}>
						Open →
					</Button>
				),
			},
		],
		[iface.id, interfaces, onOpenObjectType],
	);

	const implementMenu = (label: string) => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button size="sm">
					<Plus className="wwc:h-3.5 wwc:w-3.5" />
					{label}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="wwc:max-h-80 wwc:overflow-auto">
				{candidates.map((o) => (
					<DropdownMenuItem key={o.id} onSelect={() => onPickImplementor(o.id)}>
						<OntologyGlyph name={o.icon} color={o.color} />
						{o.displayName}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);

	return (
		<Card>
			<CardHeader className="wwc:flex-row wwc:items-center wwc:justify-between wwc:space-y-0">
				<CardTitle className="wwc:text-sm">Implementors ({rows.length})</CardTitle>
				{candidates.length > 0 && implementMenu("Implement on object type…")}
			</CardHeader>
			<CardContent>
				{rows.length === 0 ? (
					<Empty
						// Empty's 400px floor is sized for a whole pane; this one sits in a stacked card
						// between four others, so it takes the smaller floor instead of punching a hole.
						className="wwc:min-h-[220px] wwc:p-4"
						icon={<OntologyGlyph name="puzzle" className="wwc:h-6 wwc:w-6" />}
						title="No implementors yet"
						description="Nothing implements this contract, so workflows written against it have no targets."
						action={candidates.length > 0 ? implementMenu("Implement on an object type") : undefined}
					/>
				) : (
					<DataTable
						columns={columns}
						data={rows}
						searchKey="displayName"
						searchPlaceholder="Filter implementors…"
						recordLabel="implementor"
						pageSize={10}
						getRowId={(o) => o.id}
					/>
				)}
			</CardContent>
		</Card>
	);
}

// ─── Surface ─────────────────────────────────────────────────────────────────

export interface InterfaceDetailProps {
	iface: Wc3Interface;
	/** Every interface in host state — the Extends toggle, the uniqueness guard and the cycle check. */
	interfaces: Wc3Interface[];
	/** Every object type in host state — implementors and “Implement on…” candidates. */
	objectTypes: Wc3ObjectType[];
	sharedProperties?: Wc3SharedProperty[];
	actionTypes?: Wc3ActionType[];
	linkTypes?: Wc3LinkType[];
	onBack: () => void;
	onChange: (next: Wc3Interface) => void;
	onDelete: () => void;
	/** Writes the `implements` entry onto the object type. */
	onImplement: (objectTypeId: string, propertyMap: Record<string, string>) => void;
	onOpenObjectType: (objectTypeId: string) => void;
}

export function InterfaceDetail({
	iface,
	interfaces,
	objectTypes,
	sharedProperties = WC3_SHARED_PROPERTIES,
	actionTypes = WC3_ACTION_TYPES,
	linkTypes = WC3_LINK_TYPES,
	onBack,
	onChange,
	onDelete,
	onImplement,
	onOpenObjectType,
}: InterfaceDetailProps) {
	const [implementTargetId, setImplementTargetId] = useState<string | null>(null);
	const [confirmDelete, setConfirmDelete] = useState(false);

	const implementTarget = objectTypes.find((o) => o.id === implementTargetId) ?? null;
	const implementorCount = implementorsOf(iface.id, objectTypes, interfaces).length;

	return (
		<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col">
			{/* Fixed bar sized to PageContentHeader (compact -> min-h-12, px-3), as on both other drill-ins. */}
			<div className="wwc:flex wwc:min-h-12 wwc:shrink-0 wwc:items-center wwc:justify-between wwc:gap-3 wwc:border-b wwc:border-border wwc:bg-card wwc:px-3">
				<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-2.5">
					<Button variant="ghost" size="sm" className="wwc:gap-1.5" onClick={onBack}>
						<ArrowLeft className="wwc:h-4 wwc:w-4" />
						Back
					</Button>
					<div className="wwc:h-5 wwc:w-px wwc:shrink-0 wwc:bg-border" />
					<OntologyGlyph name={iface.icon} className="wwc:h-4 wwc:w-4 wwc:shrink-0" />
					<h1 className="wwc:truncate wwc:text-sm wwc:font-semibold">{iface.displayName}</h1>
					<StatusPill status={iface.status} />
					<RidChip rid={iface.rid} />
					<span className="wwc:hidden wwc:truncate wwc:text-[11px] wwc:text-muted-foreground wwc:lg:inline">
						<span className="wwc:font-mono">{iface.apiName}</span> · {implementorCount} implementor
						{implementorCount === 1 ? "" : "s"}
					</span>
				</div>
			</div>

			{/*
			 * No section nav: five short sections — metadata is one card of five fields and the longest
			 * table is three rows — so they stack, as on the link type. The object type's SideMenu earns
			 * its keep with 20+ property rows; here it would hide four near-empty panes behind clicks.
			 */}
			<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto">
				<div className="wwc:w-full wwc:space-y-4 wwc:p-6">
					<MetadataCard iface={iface} interfaces={interfaces} onChange={onChange} />
					<PropertiesCard
						iface={iface}
						interfaces={interfaces}
						sharedProperties={sharedProperties}
						onChange={onChange}
					/>
					<ConstraintsCard iface={iface} objectTypes={objectTypes} actionTypes={actionTypes} onChange={onChange} />
					<ImplementorsCard
						iface={iface}
						interfaces={interfaces}
						objectTypes={objectTypes}
						onOpenObjectType={onOpenObjectType}
						onPickImplementor={setImplementTargetId}
					/>

					<Card>
						<CardHeader>
							<CardTitle className="wwc:text-sm wwc:text-destructive">Danger zone</CardTitle>
						</CardHeader>
						<CardContent className="wwc:flex wwc:flex-wrap wwc:items-center wwc:justify-between wwc:gap-3">
							<p className="wwc:text-sm wwc:text-muted-foreground">
								<b className="wwc:text-foreground">Delete this interface</b> — Implementors keep their properties; the
								abstraction disappears.
							</p>
							<Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
								<Trash2 className="wwc:h-3.5 wwc:w-3.5" />
								Delete interface
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>

			{implementTarget && (
				<ImplementInterfaceDialog
					open
					onOpenChange={(o) => !o && setImplementTargetId(null)}
					iface={iface}
					objectType={implementTarget}
					interfaces={interfaces}
					linkTypes={linkTypes}
					actionTypes={actionTypes}
					onImplement={(propertyMap) => {
						onImplement(implementTarget.id, propertyMap);
						setImplementTargetId(null);
					}}
				/>
			)}

			<ConfirmDialog
				open={confirmDelete}
				onOpenChange={setConfirmDelete}
				destructive
				title={`Delete “${iface.displayName}”?`}
				description={`${implementorCount} implementor${implementorCount === 1 ? "" : "s"} will lose the abstraction.`}
				confirmLabel="Delete"
				onConfirm={() => {
					setConfirmDelete(false);
					onDelete();
				}}
			/>
		</div>
	);
}

// ─── Create-dialog glue ──────────────────────────────────────────────────────

/**
 * The eight icon tiles the prototype's IfCreateModal offers. Its `drone` and `webhook` have no entry in
 * wc3-ontology-glyphs, where an unmapped name silently renders as a generic box — so the nearest names
 * that DO exist stand in: target for drone, pipeline for webhook.
 */
export const WC3_INTERFACE_GLYPHS: string[] = [
	"puzzle",
	"compass",
	"signal",
	"calendar",
	"box",
	"target",
	"shield",
	"pipeline",
];

/** The same palette as components, for `NewInterfaceDialog`'s `icons` prop. */
export const WC3_INTERFACE_ICONS: React.ComponentType<{className?: string}>[] = WC3_INTERFACE_GLYPHS.map((name) => {
	const Glyph = (props: {className?: string}) => <OntologyGlyph name={name} className={props.className} />;
	Glyph.displayName = `Glyph(${name})`;
	return Glyph;
});

/**
 * The wizard's draft -> a WC3 interface. `seq` makes the client-side id and RID unique; a real RID is
 * minted server-side. Mirrors toObjectType/toLinkType in wc3-ontology-views.tsx.
 */
export function interfaceFromDraft(draft: NewInterfaceDraft, seq: number): Wc3Interface {
	return {
		id: `if_new_${seq}`,
		rid: `ri.ontology.main.interface.new-${seq}`,
		apiName: draft.apiName,
		displayName: draft.displayName,
		icon: WC3_INTERFACE_GLYPHS[draft.iconIndex] ?? "puzzle",
		status: draft.status as Wc3Status,
		description: draft.description,
		extends: draft.extends,
		properties: [],
		linkConstraints: [],
		actionConstraints: [],
	};
}

/** Add an `implements` entry to an object type — what the host does with `onImplement`. */
export function withImplements(
	objectType: Wc3ObjectType,
	interfaceId: string,
	propertyMap: Record<string, string>,
): Wc3ObjectType {
	return {
		...objectType,
		implements: [
			...objectType.implements.filter((im) => im.interfaceId !== interfaceId),
			{interfaceId, propertyMap, linkMap: []},
		],
	};
}
