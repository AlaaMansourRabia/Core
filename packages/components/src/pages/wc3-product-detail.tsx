import {
	ArrowLeft,
	Ban,
	Check,
	CircleCheck,
	ClipboardList,
	Compass,
	Component,
	Download,
	FileText,
	Glasses,
	KeyRound,
	Layers,
	Link2,
	Lock,
	Network,
	Package,
	Radar,
	RotateCw,
	ShieldCheck,
	Target,
	Trash2,
	TriangleAlert,
	Undo2,
	Users,
	Zap,
} from "lucide-react";
import {useMemo, useState} from "react";

import {Badge} from "../badge";
import {Banner} from "../banner";
import {Button} from "../button";
import {Card, CardContent, CardHeader, CardTitle} from "../card";
import {ConfirmDialog} from "../confirm-dialog";
import {Empty} from "../empty";
import {PropertyList, PropertyRow} from "../property-list";
import {RecordDetailShell} from "../record-detail-shell";
import {type SideMenuGroup} from "../side-menu";
import {toast} from "../sonner";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../table";
import type {Wc3Install} from "./wc3-lineage-data";
import {lineageNav} from "./wc3-lineage-shared";
import {getObjectType} from "./wc3-ontology-data";
import {OntologyGlyph} from "./wc3-ontology-glyphs";
import {
	WC3_GROUP_TO_PLATFORM_ROLES,
	WC3_PRODUCTS,
	type Wc3Product,
	type Wc3ProductPermissionKey,
	type Wc3ProductRuntimeWorkload,
	evidenceTotal,
	productOutputSummary,
} from "./wc3-product-data";
import {
	InstallStateBadge,
	Mono,
	ProductGlyphTile,
	ProductTypeBadge,
	ProductTypeGlyph,
	WC3_PERSONAS,
	activeInstallIn,
	baselineBlockReason,
	camelApiName,
	installsOfIn,
	liveObjectType,
	personaRoles,
	roleGate,
	type Wc3InstallMode,
	type Wc3LineageNavTarget,
	type Wc3Persona,
	type Wc3ProductSection,
} from "./wc3-product-shared";

// The single-product drill-in, ported from the prototype's ProductDetail (06-unified-workspace.html
// :11245) and its six PRODUCT_TABS. Six sections is the "lots of detail" case, so it takes the left
// SideMenu — the same shape as wc3-object-type-detail.tsx, not a second tab idiom.
//
// Stateless except for the active section: the install array, the acting persona and the install
// dialog all belong to ProductCatalogueView, so switching persona here moves the catalogue's
// "Prod-blocked for you" KPI and survives Back.

// ─── Section-local vocabulary ────────────────────────────────────────────────

// One consumer each, so they live here rather than in the frozen shared module.

/** The nine role gates the manifest schema requires, in the prototype's PERM_GATES order. */
const PERM_GATES: {key: Wc3ProductPermissionKey; label: string; what: string}[] = [
	{key: "publishRoles", label: "Publish", what: "publish a new version into the catalogue"},
	{key: "installDevRoles", label: "Install · Dev", what: "install into a Dev space"},
	{key: "installTestRoles", label: "Install · Test", what: "install into a Test space"},
	{key: "installProdRoles", label: "Install · Prod", what: "install into a Prod space"},
	{key: "upgradeRoles", label: "Upgrade", what: "move an existing install to a newer version"},
	{key: "rollbackRoles", label: "Roll back", what: "revert an applied install"},
	{key: "uninstallRoles", label: "Uninstall", what: "remove the install and everything it added"},
	{key: "bindResourceRoles", label: "Bind resource", what: "bind project resources / integration bindings"},
	{key: "scopeViewerRoles", label: "View OSDK scopes", what: "read the product's OSDK scope grants"},
];

/** The ten evidence ref categories the schema requires, in the prototype's EVIDENCE_CATS order. */
const EVIDENCE_CATS: {key: string; label: string}[] = [
	{key: "sourceEnvelopeRefs", label: "Source envelope"},
	{key: "readModelRefs", label: "Read model"},
	{key: "permissionRefs", label: "Permissions"},
	{key: "osdkRefs", label: "OSDK"},
	{key: "appRouteRefs", label: "App routes"},
	{key: "rollbackRefs", label: "Rollback"},
	{key: "realDataRefs", label: "Real data"},
	{key: "metadataRefs", label: "Metadata"},
	{key: "lineageRefs", label: "Lineage"},
	{key: "lakehouseRefs", label: "Lakehouse"},
];

/** Labels for evidence keys outside the ten. `simulatorBackedRefs` is the only one in the fixture. */
const EVIDENCE_EXTRA_LABEL: Record<string, string> = {simulatorBackedRefs: "Simulator-backed"};

/** Fallback label for an unknown extra evidence bucket — `fooBarRefs` reads as "Foo bar". */
function humanizeEvidenceKey(key: string): string {
	const words = key
		.replace(/Refs$/, "")
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.toLowerCase();
	return words.charAt(0).toUpperCase() + words.slice(1);
}

const STATUS_VARIANT: Record<string, "successSoft" | "neutralSoft" | "dangerSoft"> = {
	applied: "successSoft",
	"rolled-back": "neutralSoft",
};

// ─── Small presentational helpers ────────────────────────────────────────────

function SectionLabel({children}: {children: React.ReactNode}) {
	return (
		<div className="wwc:mb-1.5 wwc:text-[11px] wwc:font-semibold wwc:tracking-wide wwc:text-muted-foreground wwc:uppercase">
			{children}
		</div>
	);
}

function MutedText({children}: {children: React.ReactNode}) {
	return <span className="wwc:text-xs wwc:text-muted-foreground">{children}</span>;
}

function ChipRow({children}: {children: React.ReactNode}) {
	return <div className="wwc:flex wwc:flex-wrap wwc:gap-1.5">{children}</div>;
}

function Chip({title, children}: {title?: string; children: React.ReactNode}) {
	return (
		<Badge variant="neutralSoft" title={title} className="wwc:font-normal">
			{children}
		</Badge>
	);
}

/** A wrapping chip row, or the manifest-specific muted sentence when the list is empty. */
function ChipList({items, empty}: {items: string[]; empty: string}) {
	if (items.length === 0) return <MutedText>{empty}</MutedText>;
	return (
		<ChipRow>
			{items.map((item, index) => (
				<Chip key={`${item}-${index}`}>{item}</Chip>
			))}
		</ChipRow>
	);
}

/** A block of repo refs, one per line — the prototype's `.reflist`. */
function RefBlock({refs, empty = "none declared"}: {refs: string[]; empty?: string}) {
	if (refs.length === 0) return <MutedText>{empty}</MutedText>;
	return (
		<div className="wwc:space-y-0.5 wwc:font-mono wwc:text-[11px] wwc:break-all wwc:text-muted-foreground">
			{refs.map((ref, index) => (
				<div key={`${ref}-${index}`}>{ref}</div>
			))}
		</div>
	);
}

/** The prototype's `.ev-row`: [label (+ key / sub) | total | ref list]. */
function EvRow({
	label,
	sub,
	monoKey,
	count,
	refs,
	empty,
}: {
	label: string;
	sub?: string;
	monoKey?: string;
	count: number;
	refs: string[];
	empty?: string;
}) {
	return (
		<div className="wwc:grid wwc:gap-2 wwc:border-b wwc:border-border wwc:py-2.5 wwc:last:border-b-0 wwc:sm:grid-cols-[minmax(0,15rem)_2.5rem_minmax(0,1fr)] wwc:sm:items-start">
			<div className="wwc:min-w-0">
				<span className="wwc:text-sm wwc:font-semibold">{label}</span>
				{sub && <span className="wwc:ml-1.5 wwc:text-xs wwc:text-muted-foreground">· {sub}</span>}
				{monoKey && <div className="wwc:font-mono wwc:text-[10px] wwc:text-muted-foreground">{monoKey}</div>}
			</div>
			<div className="wwc:text-sm wwc:font-bold wwc:tabular-nums">{count}</div>
			<RefBlock refs={refs} empty={empty} />
		</div>
	);
}

/** Card header with a leading icon and an optional muted trailing sentence. */
function SectionCardTitle({
	icon: Icon,
	title,
	sub,
	extra,
}: {
	icon: React.ComponentType<{className?: string}>;
	title: string;
	sub?: string;
	extra?: React.ReactNode;
}) {
	return (
		<CardTitle className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2 wwc:text-sm">
			<Icon className="wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-muted-foreground" />
			{title}
			{extra}
			{sub && <span className="wwc:text-xs wwc:font-normal wwc:text-muted-foreground">{sub}</span>}
		</CardTitle>
	);
}

const bucketTotal = (bucket: Record<string, string[]>) =>
	Object.values(bucket).reduce((total, refs) => total + refs.length, 0);

/** Every ref in a bucket group, prefixed with the bucket it came from ("provenanceRefs: …"). */
const bucketRefs = (bucket: Record<string, string[]>) =>
	Object.entries(bucket).flatMap(([key, refs]) => refs.map((ref) => `${key}: ${ref}`));

// ─── Section 1 · Outputs ─────────────────────────────────────────────────────

/**
 * A declared object-type name. Green and clickable when its camel-cased API name already exists in
 * this store (3 of the 141 declared names do); otherwise an inert chip, exactly as in the prototype.
 */
function ObjectTypeChip({name, onNavigate}: {name: string; onNavigate?: (target: Wc3LineageNavTarget) => void}) {
	const live = liveObjectType(name);
	if (!live) {
		return (
			<Chip
				title={`Declared by the manifest; not present in this store yet. API name it would take: ${camelApiName(name)}`}
			>
				{name}
			</Chip>
		);
	}
	const provenance = live.installedBy
		? ` (installed by ${live.installedBy.productKey})`
		: " (authored in this workspace)";
	return (
		<button
			type="button"
			title={`Live in this store as “${live.displayName}”${provenance}`}
			onClick={() => onNavigate?.(lineageNav.objectType(live.id))}
			className="wwc:rounded-md wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring wwc:focus-visible:outline-none"
		>
			<Badge variant="successSoft" className="wwc:cursor-pointer wwc:font-normal">
				<Check />
				{name}
			</Badge>
		</button>
	);
}

function WorkloadCard({workload}: {workload: Wc3ProductRuntimeWorkload}) {
	return (
		<div className="wwc:rounded-md wwc:border wwc:border-border wwc:p-2.5">
			<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
				<span className="wwc:text-sm wwc:font-semibold">{workload.workloadId}</span>
				<Badge variant="neutralSoft" className="wwc:font-normal">
					{workload.kind}
				</Badge>
			</div>
			<div className="wwc:mt-1 wwc:font-mono wwc:text-[10.5px] wwc:break-all wwc:text-muted-foreground">
				{workload.imageRef}
			</div>
			<div className="wwc:mt-1 wwc:text-xs">
				timeout {workload.timeoutSeconds}s · cpu {workload.resources.cpu} · memory {workload.resources.memory} ·
				evidence {workload.evidenceClassification}
			</div>
			{workload.linkedOntologyObjectTypes.length > 0 && (
				<div className="wwc:mt-2">
					<ChipList items={workload.linkedOntologyObjectTypes} empty="none" />
				</div>
			)}
		</div>
	);
}

function OutputsSection({
	product,
	onNavigate,
}: {
	product: Wc3Product;
	onNavigate?: (target: Wc3LineageNavTarget) => void;
}) {
	const o = product.outputs;
	const ont = o.ontology;

	return (
		<>
			<Card>
				<CardHeader>
					<SectionCardTitle
						icon={Layers}
						title="Ontology this product brings"
						sub="green = already live in this store"
					/>
				</CardHeader>
				<CardContent className="wwc:space-y-3">
					<div>
						<SectionLabel>Object types ({o.ontologyObjectTypes.length})</SectionLabel>
						{o.ontologyObjectTypes.length === 0 ? (
							<MutedText>This product declares no object types.</MutedText>
						) : (
							<ChipRow>
								{o.ontologyObjectTypes.map((name) => (
									<ObjectTypeChip key={name} name={name} onNavigate={onNavigate} />
								))}
							</ChipRow>
						)}
					</div>
					<div>
						<SectionLabel>Link types ({o.ontologyLinkTypes.length})</SectionLabel>
						<ChipList items={o.ontologyLinkTypes} empty="none" />
					</div>
					<div>
						<SectionLabel>Action types ({ont.actionTypes.length})</SectionLabel>
						<ChipList items={ont.actionTypes} empty="none" />
					</div>
					<div className="wwc:flex wwc:flex-wrap wwc:gap-x-6 wwc:gap-y-1.5 wwc:text-xs">
						<span>
							<b>{ont.interfaces.length}</b> interfaces
						</span>
						<span>
							<b>{ont.functionTypes.length}</b> function types
						</span>
						<span>
							<b>{ont.valueTypes.length}</b> value types
						</span>
						<span>
							<b>{ont.structTypes.length}</b> struct types
						</span>
						<span>
							<b>{ont.sharedProperties.length}</b> shared properties
						</span>
					</div>
					{ont.interfaces.length > 0 && <ChipList items={ont.interfaces} empty="none" />}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<SectionCardTitle icon={KeyRound} title="OSDK scopes, app routes & project roles" />
				</CardHeader>
				<CardContent>
					<PropertyList labelWidth="11rem">
						<PropertyRow label="OSDK scopes" align="start">
							<ChipList items={o.osdkScopes} empty="no scopes granted" />
						</PropertyRow>
						<PropertyRow label="App routes" align="start">
							<ChipList items={o.appRoutes} empty="this product mounts no app routes" />
						</PropertyRow>
						<PropertyRow label="Required project roles" align="start">
							<ChipList items={o.requiredProjectRoles} empty="none" />
						</PropertyRow>
						<PropertyRow label="Source bindings" align="start">
							<ChipList items={o.sourceBindings} empty="none" />
						</PropertyRow>
						<PropertyRow label="Source packages" align="start">
							<ChipList items={o.sourcePackages} empty="none" />
						</PropertyRow>
						<PropertyRow label="Filesystem resources" align="start">
							<ChipList items={o.filesystemResources} empty="none" />
						</PropertyRow>
						<PropertyRow label="Integration bindings" align="start">
							<ChipList items={o.integrationBindings.map((b) => b.bindingId)} empty="none" />
						</PropertyRow>
					</PropertyList>
				</CardContent>
			</Card>

			{o.runtimeWorkloads && o.runtimeWorkloads.length > 0 && (
				<Card>
					<CardHeader>
						<SectionCardTitle icon={Zap} title={`Runtime workloads (${o.runtimeWorkloads.length})`} />
					</CardHeader>
					<CardContent className="wwc:space-y-2">
						{o.runtimeWorkloads.map((w) => (
							<WorkloadCard key={w.workloadId} workload={w} />
						))}
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<SectionCardTitle icon={Compass} title="Metadata, lineage & lakehouse projection" />
				</CardHeader>
				<CardContent>
					<EvRow
						label="Metadata"
						sub="searchable / provenance / impact / readiness"
						count={bucketTotal(o.metadata)}
						refs={bucketRefs(o.metadata)}
					/>
					<EvRow
						label="Lineage"
						sub="operational events / readback"
						count={bucketTotal(o.lineage)}
						refs={bucketRefs(o.lineage)}
					/>
					<EvRow
						label="Lakehouse"
						sub="tables / projection receipts / readback"
						count={bucketTotal(o.lakehouse)}
						refs={bucketRefs(o.lakehouse)}
					/>
				</CardContent>
			</Card>
		</>
	);
}

// ─── Section 2 · Permissions ─────────────────────────────────────────────────

function PermissionsSection({
	product,
	persona,
	onPersonaChange,
}: {
	product: Wc3Product;
	persona: Wc3Persona;
	onPersonaChange: (p: Wc3Persona) => void;
}) {
	const roles = personaRoles(persona);
	// Rendered from the fixture rather than retyped, so the sentence cannot drift from the mapping the
	// gates actually use.
	const mappingSentence = Object.entries(WC3_GROUP_TO_PLATFORM_ROLES)
		.map(([group, granted]) => `${group} → ${granted.join("/")}`)
		.join(" · ");

	const switchPersona = (next: Wc3Persona) => {
		onPersonaChange(next);
		toast(`${next.lens}: acting as ${next.name} — every product gate just re-evaluated`, {
			icon: <Glasses className="wwc:h-4 wwc:w-4" />,
		});
	};

	return (
		<Card>
			<CardHeader>
				<SectionCardTitle
					icon={Lock}
					title="Permission gates"
					sub="nine role gates, declared by the manifest, evaluated against the acting persona"
				/>
			</CardHeader>
			<CardContent className="wwc:space-y-3">
				<ChipRow>
					<Chip>
						<Glasses />
						{persona.name} · {persona.lens}
					</Chip>
					<Chip>
						<Users />
						groups: {persona.groups.join(", ")}
					</Chip>
					<Chip>
						<KeyRound />
						platform roles: {roles.join(", ") || "none"}
					</Chip>
				</ChipRow>

				<div className="wwc:overflow-x-auto">
					<Table data-permission-matrix={product.productKey}>
						<TableHeader>
							<TableRow>
								<TableHead className="wwc:w-[150px]">Gate</TableHead>
								<TableHead>Roles the manifest requires</TableHead>
								<TableHead className="wwc:w-[150px]">Matched for you</TableHead>
								<TableHead className="wwc:w-[110px]">Verdict</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{PERM_GATES.map((gate) => {
								const g = roleGate(product, gate.key, persona);
								return (
									<TableRow key={gate.key} title={`${persona.name} ${g.ok ? "can" : "cannot"} ${gate.what}.`}>
										<TableCell>
											<div className="wwc:text-sm wwc:font-semibold">{gate.label}</div>
											<div className="wwc:font-mono wwc:text-[10px] wwc:text-muted-foreground">{gate.key}</div>
										</TableCell>
										<TableCell>
											{g.need.length === 0 ? (
												<MutedText>empty list — no role qualifies</MutedText>
											) : (
												<ChipRow>
													{g.need.map((role) => (
														<Badge
															key={role}
															variant={roles.includes(role) ? "successSoft" : "neutralSoft"}
															className="wwc:font-normal"
														>
															{role}
														</Badge>
													))}
												</ChipRow>
											)}
										</TableCell>
										<TableCell className="wwc:font-mono wwc:text-xs">{g.matched.join(", ") || "—"}</TableCell>
										<TableCell>
											<span
												className={
													g.ok
														? "wwc:flex wwc:items-center wwc:gap-1.5 wwc:text-xs wwc:font-medium wwc:text-green-700 wwc:dark:text-green-400"
														: "wwc:flex wwc:items-center wwc:gap-1.5 wwc:text-xs wwc:font-medium wwc:text-red-700 wwc:dark:text-red-400"
												}
											>
												{g.ok ? (
													<CircleCheck className="wwc:h-3.5 wwc:w-3.5" />
												) : (
													<Ban className="wwc:h-3.5 wwc:w-3.5" />
												)}
												{g.ok ? "Allowed" : "Blocked"}
											</span>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</div>

				<p className="wwc:text-xs wwc:text-muted-foreground">
					Switch persona to re-evaluate every gate — the same AT-07 semantics that gate action runs, projected onto the
					platform roles the manifests declare ({mappingSentence}).
				</p>

				<ChipRow>
					{WC3_PERSONAS.map((candidate) =>
						candidate.id === persona.id ? (
							<Badge key={candidate.id} variant="infoSoft" className="wwc:font-normal">
								<Glasses />
								{candidate.name} · acting
							</Badge>
						) : (
							<Button key={candidate.id} variant="outline" size="sm" onClick={() => switchPersona(candidate)}>
								{candidate.name} · {candidate.lens}
							</Button>
						),
					)}
				</ChipRow>
			</CardContent>
		</Card>
	);
}

// ─── Section 3 · Evidence ────────────────────────────────────────────────────

function EvidenceSection({product}: {product: Wc3Product}) {
	const evidence = product.evidence as unknown as Record<string, string[] | undefined>;
	const categories = Object.keys(product.evidence);
	const extras = categories.filter((key) => !EVIDENCE_CATS.some((cat) => cat.key === key));

	return (
		<Card>
			<CardHeader>
				<SectionCardTitle
					icon={FileText}
					title="Evidence"
					sub={`${evidenceTotal(product)} refs across ${categories.length} categories — every claim this product makes has to point at a file in the repo`}
				/>
			</CardHeader>
			<CardContent className="wwc:space-y-3">
				<div>
					{EVIDENCE_CATS.map((cat) => (
						<EvRow
							key={cat.key}
							label={cat.label}
							monoKey={cat.key}
							count={(evidence[cat.key] ?? []).length}
							refs={evidence[cat.key] ?? []}
							empty="no refs declared in this category"
						/>
					))}
					{extras.map((key) => (
						<EvRow
							key={key}
							label={EVIDENCE_EXTRA_LABEL[key] ?? humanizeEvidenceKey(key)}
							monoKey={key}
							count={(evidence[key] ?? []).length}
							refs={evidence[key] ?? []}
							empty="no refs declared in this category"
						/>
					))}
				</div>
				<p className="wwc:text-xs wwc:text-muted-foreground">
					Manifest: <span className="wwc:font-mono">{product._manifestRef}</span>
				</p>
			</CardContent>
		</Card>
	);
}

// ─── Section 4 · Dependencies ────────────────────────────────────────────────

/** One dependency / linked-product row: identity, requiredness, install state and an Open button. */
function RelationRow({
	kind,
	displayName,
	productKey,
	versionText,
	role,
	required,
	installed,
	resolves,
	onOpen,
}: {
	kind: "dependency" | "linked";
	displayName: string;
	productKey: string;
	versionText: string;
	role?: string;
	required: boolean;
	installed: boolean;
	resolves: boolean;
	onOpen: () => void;
}) {
	const Icon = kind === "linked" ? Component : Link2;
	return (
		<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2 wwc:rounded-md wwc:border wwc:border-border wwc:p-2.5">
			<Icon className="wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-muted-foreground" />
			<span className="wwc:text-sm wwc:font-semibold">{displayName}</span>
			<Mono>
				{productKey} {versionText}
			</Mono>
			{role && (
				<Badge variant="neutralSoft" className="wwc:font-normal">
					role: {role}
				</Badge>
			)}
			<Badge variant={required ? "dangerSoft" : "warningSoft"}>{required ? "required" : "optional"}</Badge>
			<span className="wwc:flex-1" />
			<Badge variant={installed ? "successSoft" : "warningSoft"}>
				{installed ? <Check /> : <TriangleAlert />}
				{installed ? "installed" : "not installed"}
			</Badge>
			{resolves && (
				<Button variant="ghost" size="sm" onClick={onOpen}>
					Open
				</Button>
			)}
		</div>
	);
}

/**
 * Compact in-card empty state. The shared `Empty` so the copy and the tone stay house, but with its
 * 400px floor released: 12 of the 17 products render three of these back to back.
 */
function InlineEmpty({children}: {children: string}) {
	return <Empty className="wwc:min-h-0 wwc:p-4" description={children} />;
}

function DependenciesSection({
	product,
	installs,
	onOpenProduct,
}: {
	product: Wc3Product;
	installs: Wc3Install[];
	onOpenProduct: (key: string) => void;
}) {
	const productByKey = useMemo(() => new Map(WC3_PRODUCTS.map((p) => [p.productKey, p])), []);
	const installedKeys = useMemo(
		() => new Set(installs.filter((i) => i.status === "applied").map((i) => i.productKey)),
		[installs],
	);
	// Reverse index over BOTH relation kinds, across the whole catalogue.
	const dependants = useMemo(
		() =>
			WC3_PRODUCTS.filter(
				(candidate) =>
					candidate.dependencies.some((d) => d.productKey === product.productKey) ||
					candidate.linkedProducts.some((l) => l.productKey === product.productKey),
			),
		[product.productKey],
	);

	return (
		<>
			<Card>
				<CardHeader>
					<SectionCardTitle icon={Link2} title={`Dependencies (${product.dependencies.length})`} />
				</CardHeader>
				<CardContent className="wwc:space-y-2">
					{product.dependencies.length === 0 ? (
						<InlineEmpty>This product declares no dependencies — it installs standalone.</InlineEmpty>
					) : (
						product.dependencies.map((d) => (
							<RelationRow
								key={d.productKey}
								kind="dependency"
								displayName={productByKey.get(d.productKey)?.displayName ?? d.productKey}
								productKey={d.productKey}
								versionText={d.versionRange}
								required={d.required}
								installed={installedKeys.has(d.productKey)}
								resolves={productByKey.has(d.productKey)}
								onOpen={() => onOpenProduct(d.productKey)}
							/>
						))
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<SectionCardTitle
						icon={Component}
						title={`Linked products (${product.linkedProducts.length})`}
						sub={
							product.productType === "composite-product"
								? "a composite product is exactly this list"
								: "products this one binds to at runtime"
						}
					/>
				</CardHeader>
				<CardContent className="wwc:space-y-2">
					{product.linkedProducts.length === 0 ? (
						<InlineEmpty>No linked products.</InlineEmpty>
					) : (
						product.linkedProducts.map((l) => (
							<RelationRow
								key={l.productKey}
								kind="linked"
								displayName={productByKey.get(l.productKey)?.displayName ?? l.productKey}
								productKey={l.productKey}
								versionText={l.version}
								role={l.role}
								required={!l.optional}
								installed={installedKeys.has(l.productKey)}
								resolves={productByKey.has(l.productKey)}
								onOpen={() => onOpenProduct(l.productKey)}
							/>
						))
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<SectionCardTitle icon={Radar} title={`Depended on by (${dependants.length})`} />
				</CardHeader>
				<CardContent>
					{dependants.length === 0 ? (
						<InlineEmpty>Nothing in the catalogue depends on this product.</InlineEmpty>
					) : (
						<ChipRow>
							{dependants.map((d) => (
								<Button key={d.productKey} variant="outline" size="sm" onClick={() => onOpenProduct(d.productKey)}>
									<ProductTypeGlyph productType={d.productType} />
									{d.displayName}
								</Button>
							))}
						</ChipRow>
					)}
				</CardContent>
			</Card>
		</>
	);
}

// ─── Section 5 · Readiness ───────────────────────────────────────────────────

function ReadinessSection({product, onSeePermissions}: {product: Wc3Product; onSeePermissions: () => void}) {
	const readiness = product.readiness;
	if (!readiness) {
		return (
			<Empty
				icon={<CircleCheck className="wwc:h-6 wwc:w-6" />}
				title="No readiness block declared"
				description="This manifest carries no optional readiness object, so nothing blocks it beyond its permission gates and dependencies."
				action={
					<Button variant="outline" onClick={onSeePermissions}>
						See its permission gates
					</Button>
				}
			/>
		);
	}

	const blocked = readiness.blockedReasons.length > 0;
	return (
		<Card>
			<CardHeader>
				<SectionCardTitle
					icon={Target}
					title="Readiness"
					extra={
						<Badge variant={blocked ? "dangerSoft" : "successSoft"}>{readiness.classification || "declared"}</Badge>
					}
				/>
			</CardHeader>
			<CardContent className="wwc:space-y-3">
				<div className="wwc:space-y-2">
					{blocked ? (
						readiness.blockedReasons.map((reason) => <Banner key={reason} variant="danger" title={reason} />)
					) : (
						<Banner variant="success" title="No blocked reasons declared." />
					)}
				</div>
				<PropertyList labelWidth="8rem">
					<PropertyRow label="Required" align="start">
						<RefBlock refs={readiness.required} />
					</PropertyRow>
					<PropertyRow label="Source refs" align="start">
						<RefBlock refs={readiness.sourceRefs} />
					</PropertyRow>
					<PropertyRow label="Test refs" align="start">
						<RefBlock refs={readiness.testRefs} />
					</PropertyRow>
				</PropertyList>
				<p className="wwc:text-xs wwc:text-muted-foreground">
					A declared blocked reason stops a <b>Prod</b> install in the plan step; Dev and Test installs still evaluate
					their own role gate.
				</p>
			</CardContent>
		</Card>
	);
}

// ─── Reverse actions (roll back / uninstall) ─────────────────────────────────

type ReverseMode = "rollback" | "uninstall";
type PendingReverse = {install: Wc3Install; mode: ReverseMode};

const REVERSE_LABEL: Record<ReverseMode, string> = {rollback: "Roll back", uninstall: "Uninstall"};

/**
 * The prototype's `prodReverseBtn`. Blocked by the role gate OR by the install being baseline — and
 * every fixture install is baseline, so this renders as a Lock on all four installed products.
 */
function ReverseButton({
	product,
	install,
	mode,
	persona,
	onRequest,
}: {
	product: Wc3Product;
	install: Wc3Install;
	mode: ReverseMode;
	persona: Wc3Persona;
	onRequest: (pending: PendingReverse) => void;
}) {
	const gate = roleGate(product, mode === "rollback" ? "rollbackRoles" : "uninstallRoles", persona);
	const label = REVERSE_LABEL[mode];
	const blocked = !gate.ok || install.baseline;
	const reason = !gate.ok ? gate.reason : baselineBlockReason(product);
	const Icon = blocked ? Lock : mode === "rollback" ? Undo2 : Trash2;

	return (
		<Button
			variant={mode === "uninstall" ? "destructive" : "outline"}
			size="sm"
			data-reverse={mode}
			title={
				blocked ? reason : `${label} ${product.displayName} ${install.version} — removes everything the install added`
			}
			onClick={() => {
				if (blocked) {
					toast(reason, {icon: <Lock className="wwc:h-4 wwc:w-4" />});
					return;
				}
				onRequest({install, mode});
			}}
		>
			<Icon />
			{label}…
		</Button>
	);
}

// ─── Section 6 · Installs ────────────────────────────────────────────────────

function InstallCard({
	product,
	install,
	persona,
	onRequestReverse,
	onNavigate,
}: {
	product: Wc3Product;
	install: Wc3Install;
	persona: Wc3Persona;
	onRequestReverse: (pending: PendingReverse) => void;
	onNavigate?: (target: Wc3LineageNavTarget) => void;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2 wwc:text-sm">
					<Badge variant={STATUS_VARIANT[install.status] ?? "dangerSoft"}>{install.status}</Badge>
					<span className="wwc:font-mono wwc:text-xs">{install.id}</span>
					<span className="wwc:text-xs wwc:font-normal wwc:text-muted-foreground">
						{install.environment} · {install.when}
						{install.baseline ? " · baseline" : ""}
					</span>
					<span className="wwc:flex-1" />
					{install.status === "applied" && (
						<span className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
							<ReverseButton
								product={product}
								install={install}
								mode="rollback"
								persona={persona}
								onRequest={onRequestReverse}
							/>
							<ReverseButton
								product={product}
								install={install}
								mode="uninstall"
								persona={persona}
								onRequest={onRequestReverse}
							/>
						</span>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent className="wwc:space-y-3">
				<PropertyList labelWidth="11rem">
					<PropertyRow label="Installed by">
						{install.installedBy} <span className="wwc:text-muted-foreground">({install.installedByLens})</span>
					</PropertyRow>
					<PropertyRow label="Approved by">
						{install.approvedBy || (
							<span className="wwc:text-muted-foreground">not required for {install.environment}</span>
						)}
					</PropertyRow>
					<PropertyRow label="Release channel">
						{install.releaseChannel ? (
							<span className="wwc:font-mono wwc:text-xs">{install.releaseChannel}</span>
						) : (
							<span className="wwc:text-muted-foreground">—</span>
						)}
					</PropertyRow>
					<PropertyRow label="Promotion runbook">
						<span className="wwc:font-mono wwc:text-xs">{install.promotionRunbookRef || "—"}</span>
					</PropertyRow>
					<PropertyRow label="Rollback runbook">
						<span className="wwc:font-mono wwc:text-xs">{install.rollbackRunbookRef || "—"}</span>
					</PropertyRow>
					<PropertyRow label="Added">
						{install.addedObjectTypes.length} object type(s) · {install.addedLinkTypes.length} link type(s) ·{" "}
						{install.addedActionTypes.length} action type(s)
					</PropertyRow>
					<PropertyRow label="Skipped (collisions)">
						{install.skipped.objectTypes.length > 0 ? (
							install.skipped.objectTypes.join(", ")
						) : (
							<span className="wwc:text-muted-foreground">none</span>
						)}
					</PropertyRow>
				</PropertyList>

				{install.status === "applied" && install.addedObjectTypes.length > 0 && (
					<div>
						<SectionLabel>Object types this install put in the store</SectionLabel>
						<ChipRow>
							{install.addedObjectTypes.map((id) => {
								const ot = getObjectType(id);
								if (!ot) {
									return (
										<Badge key={id} variant="dangerSoft" className="wwc:font-normal">
											{id} — missing
										</Badge>
									);
								}
								return (
									<button
										key={id}
										type="button"
										onClick={() => onNavigate?.(lineageNav.objectType(ot.id))}
										className="wwc:rounded-md wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring wwc:focus-visible:outline-none"
									>
										<Badge variant="neutralSoft" className="wwc:cursor-pointer wwc:font-normal">
											<OntologyGlyph name={ot.icon} color={ot.color} />
											{ot.displayName}
										</Badge>
									</button>
								);
							})}
						</ChipRow>
					</div>
				)}

				<div>
					<SectionLabel>Lifecycle</SectionLabel>
					<div className="wwc:space-y-1">
						{install.lifecycle.map((step, index) => (
							<div key={`${step.step}-${index}`} className="wwc:text-xs">
								<b>{step.step}</b> — {step.detail}{" "}
								<span className="wwc:text-muted-foreground">
									· {step.by} · {step.when}
								</span>
							</div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function InstallsSection({
	product,
	installs,
	persona,
	onOpenInstall,
	onRequestReverse,
	onNavigate,
}: {
	product: Wc3Product;
	installs: Wc3Install[];
	persona: Wc3Persona;
	onOpenInstall: (key: string, mode: Wc3InstallMode) => void;
	onRequestReverse: (pending: PendingReverse) => void;
	onNavigate?: (target: Wc3LineageNavTarget) => void;
}) {
	// Newest first, the way the prototype reverses its record list.
	const records = installsOfIn(installs, product.productKey).slice().reverse();

	if (records.length === 0) {
		return (
			<Empty
				icon={<ClipboardList className="wwc:h-6 wwc:w-6" />}
				title="Never installed here"
				description={`“${product.displayName}” has no install record in this workspace. The governed flow is: create install draft → plan (preview against the live store) → apply.`}
				action={
					<Button onClick={() => onOpenInstall(product.productKey, "install")}>
						<Download />
						Open the install flow
					</Button>
				}
			/>
		);
	}

	return (
		<>
			{records.map((install) => (
				<InstallCard
					key={install.id}
					product={product}
					install={install}
					persona={persona}
					onRequestReverse={onRequestReverse}
					onNavigate={onNavigate}
				/>
			))}
		</>
	);
}

// ─── Surface ─────────────────────────────────────────────────────────────────

export type ProductDetailProps = {
	product: Wc3Product;
	/** The whole-workspace live install array, owned by ProductCatalogueView. */
	installs: Wc3Install[];
	persona: Wc3Persona;
	onPersonaChange: (p: Wc3Persona) => void;
	/** "installs" when arriving via a catalogue card's Installs (N) button. */
	initialSection?: Wc3ProductSection;
	onBack: () => void;
	/** Dependency / linked / depended-on-by "Open". */
	onOpenProduct: (key: string) => void;
	onOpenInstall: (key: string, mode: Wc3InstallMode) => void;
	/** Cross-perspective navigation — the green object-type chips. */
	onNavigate?: (target: Wc3LineageNavTarget) => void;
	/**
	 * Applies a confirmed roll back / uninstall. Optional because the install array lives in the
	 * catalogue view: without it the confirm dialog still runs and says, honestly, that nothing
	 * changed. Unreachable in the fixture anyway — all four installs are baseline, so the guard fires
	 * first on every one of them.
	 */
	onReverseInstall?: (installId: string, mode: ReverseMode) => void;
};

export function ProductDetail({
	product,
	installs,
	persona,
	onPersonaChange,
	initialSection,
	onBack,
	onOpenProduct,
	onOpenInstall,
	onNavigate,
	onReverseInstall,
}: ProductDetailProps) {
	const [section, setSection] = useState<Wc3ProductSection>(initialSection ?? "outputs");
	const [pending, setPending] = useState<PendingReverse | null>(null);

	const install = activeInstallIn(installs, product.productKey);
	const upgradeGate = roleGate(product, "upgradeRoles", persona);
	const evidenceCategories = Object.keys(product.evidence).length;

	const sections: SideMenuGroup[] = [
		{
			items: [
				{id: "outputs", label: "Outputs", icon: Package},
				{id: "permissions", label: "Permissions", icon: ShieldCheck, count: PERM_GATES.length},
				{id: "evidence", label: "Evidence", icon: FileText, count: evidenceTotal(product)},
				{
					id: "dependencies",
					label: "Dependencies",
					icon: Network,
					count: product.dependencies.length + product.linkedProducts.length,
				},
				{id: "readiness", label: "Readiness", icon: CircleCheck},
				{id: "installs", label: "Installs", icon: Download, count: installsOfIn(installs, product.productKey).length},
			],
		},
	];

	const pendingLabel = pending ? REVERSE_LABEL[pending.mode] : "";

	return (
		<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col">
			{/* Same 48px band as the object-type detail, so the two stacked headers read as one. */}
			<div className="wwc:flex wwc:min-h-12 wwc:shrink-0 wwc:items-center wwc:justify-between wwc:gap-3 wwc:border-b wwc:border-border wwc:bg-card wwc:px-3">
				<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-2.5">
					<Button variant="ghost" size="sm" className="wwc:gap-1.5" onClick={onBack}>
						<ArrowLeft className="wwc:h-4 wwc:w-4" />
						Back
					</Button>
					<div className="wwc:h-5 wwc:w-px wwc:shrink-0 wwc:bg-border" />
					<ProductGlyphTile productType={product.productType} />
					<h1 className="wwc:truncate wwc:text-sm wwc:font-semibold">{product.displayName}</h1>
					<ProductTypeBadge productType={product.productType} />
					<Badge variant="neutralSoft" title="Manifest version" className="wwc:font-mono wwc:font-normal">
						{product.version}
					</Badge>
					<Badge variant="neutralSoft" title="Owner enclave" className="wwc:font-normal">
						<ShieldCheck />
						{product.ownerEnclaveId}
					</Badge>
					<InstallStateBadge install={install} />
				</div>
				<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2">
					{install ? (
						<>
							<Button
								variant="outline"
								size="sm"
								title={upgradeGate.ok ? "Re-plan this product against the live store" : upgradeGate.reason}
								onClick={() => {
									// The upgrade gate hard-blocks BEFORE the dialog opens — unlike Install…, which always
									// opens and surfaces its refusal at the Plan step.
									if (!upgradeGate.ok) {
										toast(upgradeGate.reason, {icon: <Lock className="wwc:h-4 wwc:w-4" />});
										return;
									}
									onOpenInstall(product.productKey, "upgrade");
								}}
							>
								{upgradeGate.ok ? <RotateCw /> : <Lock />}
								Upgrade…
							</Button>
							<ReverseButton
								product={product}
								install={install}
								mode="rollback"
								persona={persona}
								onRequest={setPending}
							/>
							<ReverseButton
								product={product}
								install={install}
								mode="uninstall"
								persona={persona}
								onRequest={setPending}
							/>
						</>
					) : (
						<Button
							size="sm"
							data-install-open={product.productKey}
							onClick={() => onOpenInstall(product.productKey, "install")}
						>
							<Download />
							Install…
						</Button>
					)}
				</div>
			</div>

			<RecordDetailShell
				title="Product"
				sections={sections}
				activeSectionId={section}
				onSectionChange={(id) => setSection(id as Wc3ProductSection)}
			>
				{/* Identity strip — the same four facts on every section. */}
				<Card>
					<CardContent className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-x-4 wwc:gap-y-1.5 wwc:px-3.5 wwc:py-2.5 wwc:text-xs">
						<Mono>{product.productKey}</Mono>
						<span className="wwc:flex wwc:items-center wwc:gap-1.5">
							<Layers className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:text-muted-foreground" />
							{productOutputSummary(product)}
						</span>
						<span className="wwc:flex wwc:items-center wwc:gap-1.5">
							<FileText className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:text-muted-foreground" />
							{evidenceTotal(product)} evidence refs across {evidenceCategories} categories
						</span>
						<span className="wwc:flex-1" />
						<span className="wwc:font-mono wwc:text-[10.5px] wwc:break-all wwc:text-muted-foreground">
							{product._manifestRef}
						</span>
					</CardContent>
				</Card>

				{section === "outputs" && <OutputsSection product={product} onNavigate={onNavigate} />}
				{section === "permissions" && (
					<PermissionsSection product={product} persona={persona} onPersonaChange={onPersonaChange} />
				)}
				{section === "evidence" && <EvidenceSection product={product} />}
				{section === "dependencies" && (
					<DependenciesSection product={product} installs={installs} onOpenProduct={onOpenProduct} />
				)}
				{section === "readiness" && (
					<ReadinessSection product={product} onSeePermissions={() => setSection("permissions")} />
				)}
				{section === "installs" && (
					<InstallsSection
						product={product}
						installs={installs}
						persona={persona}
						onOpenInstall={onOpenInstall}
						onRequestReverse={setPending}
						onNavigate={onNavigate}
					/>
				)}
			</RecordDetailShell>

			<ConfirmDialog
				open={pending !== null}
				onOpenChange={(next) => {
					if (!next) setPending(null);
				}}
				title={`${pendingLabel} product`}
				description={
					pending
						? `${pendingLabel} “${product.displayName}” ${pending.install.version}? This removes the ${pending.install.addedObjectTypes.length} object type(s), ${pending.install.addedLinkTypes.length} link type(s) and ${pending.install.addedActionTypes.length} action type(s) it installed, together with their rows and instance links. It is undoable from the changeset drawer.`
						: ""
				}
				confirmLabel={pendingLabel || "Confirm"}
				destructive={pending?.mode === "uninstall"}
				onConfirm={() => {
					if (!pending) return;
					if (onReverseInstall) onReverseInstall(pending.install.id, pending.mode);
					else
						toast(
							`${pendingLabel} is not wired on this surface — the workspace's install records are owned by the catalogue view, so nothing changed.`,
						);
					setPending(null);
				}}
			/>
		</div>
	);
}
