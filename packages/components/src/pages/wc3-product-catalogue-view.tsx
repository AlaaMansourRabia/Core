import type {ColumnDef, Row} from "@tanstack/react-table";
import type {ReactNode} from "react";

import {cn} from "@corensystem/core-utils";
import {
	CircleCheck,
	ClipboardList,
	Component,
	Download,
	KeyRound,
	Layers,
	Link2,
	Lock,
	Package,
	Shield,
	ShieldCheck,
	TriangleAlert,
} from "lucide-react";
import {useCallback, useMemo, useState} from "react";

import {Badge} from "../badge";
import {Button} from "../button";
import {Card} from "../card";
import {CatalogueCardGrid, CatalogueViewToggle, useCatalogueViewMode} from "../catalogue-view-toggle";
import {DataTable, DataTableColumnHeader} from "../data-table";
import {Filter, FilterCategory, FilterContent, FilterOption, FilterTrigger, type FilterValue} from "../filter";
import {MetricCard} from "../metric-card";
import {HoverTooltip} from "../tooltip";
import {WC3_INSTALLS, type Wc3Install} from "./wc3-lineage-data";
import {useOpenRecord} from "./wc3-lineage-shared";
import {
	WC3_PRODUCTS,
	type Wc3Product,
	type Wc3ProductDependency,
	type Wc3ProductLink,
	evidenceTotal,
	productOutputSummary,
} from "./wc3-product-data";
import {ProductDetail} from "./wc3-product-detail";
import {InstallProductDialog} from "./wc3-product-install-dialog";
import {
	InstallStateBadge,
	Mono,
	Pane,
	ProductGlyphTile,
	ProductTypeBadge,
	ProductsEmptyState,
	WC3_DEFAULT_PERSONA,
	type Wc3InstallMode,
	type Wc3Persona,
	type Wc3ProductSection,
	type Wc3ProductViewProps,
	activeInstallIn,
	installsOfIn,
	isInstalledIn,
	productKpis,
	productSearchText,
	productTypeMeta,
	roleGate,
	useDetailLabel,
} from "./wc3-product-shared";

// The Products perspective's only surface: the 17-product first-party catalogue, plus the drill-in
// and the install dialog it owns. The six names the shell used to carry as top-level tabs
// (outputs / permissions / evidence / dependencies / readiness / installs) are the SECTIONS of one
// product's detail page, not perspective tabs.
//
// This view owns every piece of state the three Products surfaces share — the live install array,
// the acting persona, the applied filter, the search query, the view mode, the drill-in and the
// dialog trigger — so nothing resets when you drill in, install, or flip the table⇄card toggle.

// ─── Filter facets ───────────────────────────────────────────────────────────

// Derived from the fixture, so a facet never offers a value no product can have. Alphabetical by the
// RAW key, which is the order the prototype's facet row used: composite / ontology / runtime / source.
const PRODUCT_TYPES = [...new Set(WC3_PRODUCTS.map((p) => p.productType))].sort();

const INSTALL_STATE_LABEL: Record<string, string> = {installed: "Installed", available: "Available"};
const READINESS_LABEL: Record<string, string> = {declared: "Declared", "not-declared": "Not declared"};

// ─── Card chips ──────────────────────────────────────────────────────────────

/** The dependency chip's text, verbatim from the prototype's ProductCard. */
function depChipText(dep: Wc3ProductDependency, installed: boolean): string {
	return `dep ${dep.productKey}${dep.required ? "" : " (optional)"}${installed ? "" : " — not installed"}`;
}

/** The linked-product chip's text, verbatim from the prototype's ProductCard. */
function linkChipText(link: Wc3ProductLink): string {
	return `${link.productKey} · ${link.role}`;
}

/** A required dependency or non-optional linked product that is not installed — the table's warning dot. */
function hasUnmetLink(p: Wc3Product, installs: Wc3Install[]): boolean {
	return (
		p.dependencies.some((d) => d.required && !isInstalledIn(installs, d.productKey)) ||
		p.linkedProducts.some((l) => !l.optional && !isInstalledIn(installs, l.productKey))
	);
}

function Chip({icon, children, title}: {icon: ReactNode; children: ReactNode; title?: string}) {
	return (
		<span
			title={title}
			className="wwc:inline-flex wwc:items-center wwc:gap-1 wwc:rounded-md wwc:border wwc:border-border wwc:bg-muted/40 wwc:px-1.5 wwc:py-0.5 wwc:text-[10.5px] wwc:text-muted-foreground"
		>
			{icon}
			{children}
		</span>
	);
}

// ─── Row / card actions ──────────────────────────────────────────────────────

type ActionProps = {
	product: Wc3Product;
	install: Wc3Install | undefined;
	installCount: number;
	persona: Wc3Persona;
	onOpenInstalls: (key: string) => void;
	onOpenInstall: (key: string, mode: Wc3InstallMode) => void;
};

/**
 * The two mutually exclusive affordances the prototype's card footer carries, shared by the card and
 * the table's trailing cell so they cannot drift.
 *
 * The Install… button is NEVER disabled by the role gate — failing it only swaps the icon
 * (download -> lock) and the tooltip. The refusal happens inside the dialog, at Apply.
 */
/**
 * `compact` is for the TABLE cell only. The shared Table is `table-fixed` inside an overflow-hidden
 * wrapper, so a labelled button in the last column gets sliced at the pane edge instead of pushing
 * the table wider. Icon-only + tooltip keeps the same two actions reachable in the same width. The
 * card footer keeps the labels, as the prototype has them, because it has the room.
 */
function ProductActions({
	product,
	install,
	installCount,
	persona,
	onOpenInstalls,
	onOpenInstall,
	compact = false,
}: ActionProps & {compact?: boolean}) {
	if (install) {
		const label = `Installs (${installCount})`;
		return (
			<Button
				variant="ghost"
				size="sm"
				icon={compact}
				aria-label={compact ? label : undefined}
				tooltip={compact ? label : undefined}
				onClick={(e) => {
					e.stopPropagation();
					onOpenInstalls(product.productKey);
				}}
			>
				<ClipboardList />
				{compact ? null : label}
			</Button>
		);
	}
	const gate = roleGate(product, "installProdRoles", persona);
	const hint = gate.ok ? "Open the governed install flow" : gate.reason;
	return (
		<Button
			size="sm"
			icon={compact}
			aria-label={compact ? `Install ${product.displayName}` : undefined}
			title={compact ? undefined : hint}
			tooltip={compact ? hint : undefined}
			onClick={(e) => {
				e.stopPropagation();
				onOpenInstall(product.productKey, "install");
			}}
		>
			{gate.ok ? <Download /> : <Lock />}
			{compact ? null : "Install…"}
		</Button>
	);
}

// ─── Card ────────────────────────────────────────────────────────────────────

type ProductCardProps = ActionProps & {installs: Wc3Install[]; onOpenProduct: (key: string) => void};

/** One catalogue card — the prototype's .prod-card, element for element. */
function ProductCard({installs, onOpenProduct, ...actions}: ProductCardProps) {
	const {product: p, install} = actions;
	const chips = p.dependencies.length > 0 || p.linkedProducts.length > 0;
	const open = () => onOpenProduct(p.productKey);
	return (
		// role="button" rather than a real <button> so the footer's Install… / Installs (N) button can
		// nest legally — the same trade-off canvas-navigator.tsx makes. Enter/Space are wired by hand.
		<Card
			role="button"
			tabIndex={0}
			data-product-card={p.productKey}
			title={`Open ${p.displayName} ${p.version}`}
			onClick={open}
			onKeyDown={(e) => {
				// role="button" is not a real button, so Enter and Space have to be wired by hand.
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					open();
				}
			}}
			className={cn(
				"wwc:flex wwc:cursor-pointer wwc:flex-col wwc:gap-2 wwc:rounded-lg wwc:p-3 wwc:text-left wwc:transition-colors wwc:hover:bg-accent/40 wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring",
				// The prototype's `.on` modifier: a green left border marks an applied install.
				install && "wwc:border-l-2 wwc:border-l-green-600",
			)}
		>
			<div className="wwc:flex wwc:items-start wwc:gap-2">
				<ProductGlyphTile productType={p.productType} />
				<div className="wwc:min-w-0 wwc:flex-1">
					<div className="wwc:truncate wwc:text-sm wwc:font-semibold">{p.displayName}</div>
					<Mono>{`${p.productKey} · ${p.version}`}</Mono>
				</div>
				<ProductTypeBadge productType={p.productType} />
			</div>

			<p className="wwc:text-xs wwc:text-foreground">{productOutputSummary(p)}</p>

			<p className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1 wwc:text-xs wwc:text-muted-foreground">
				<Shield className="wwc:h-3 wwc:w-3 wwc:shrink-0" />
				enclave <Mono>{p.ownerEnclaveId}</Mono>
				{` · ${evidenceTotal(p)} evidence ref(s)`}
				{p.readiness ? ` · readiness ${p.readiness.classification || "declared"}` : ""}
			</p>

			{chips && (
				<div className="wwc:flex wwc:flex-wrap wwc:gap-1">
					{p.dependencies.map((d) => (
						<Chip
							key={`dep-${d.productKey}`}
							icon={<Link2 className="wwc:h-3 wwc:w-3 wwc:shrink-0" />}
							title={`Required dependency ${d.versionRange}`}
						>
							{depChipText(d, isInstalledIn(installs, d.productKey))}
						</Chip>
					))}
					{p.linkedProducts.map((l) => (
						<Chip
							key={`link-${l.productKey}`}
							icon={<Component className="wwc:h-3 wwc:w-3 wwc:shrink-0" />}
							title={`Linked product · role ${l.role}`}
						>
							{linkChipText(l)}
						</Chip>
					))}
				</div>
			)}

			<div className="wwc:mt-auto wwc:flex wwc:items-center wwc:gap-1.5 wwc:pt-1">
				<InstallStateBadge install={install} />
				<span className="wwc:flex-1" />
				<ProductActions {...actions} />
			</div>
		</Card>
	);
}

// ─── View ────────────────────────────────────────────────────────────────────

export function ProductCatalogueView({
	onDetailChange,
	onNavigate,
	openRecordId,
	onOpenRecordConsumed,
}: Wc3ProductViewProps = {}) {
	// The LIVE install array. WC3_INSTALLS seeds it and is never read again — every render path goes
	// through installsOfIn / activeInstallIn / isInstalledIn so an in-session install is visible
	// everywhere at once (the fixture-bound installsOf / activeInstall / isProductInstalled close over
	// the frozen module const and would keep reporting "Available").
	const [installs, setInstalls] = useState<Wc3Install[]>(() => [...WC3_INSTALLS]);
	// Lifted here, not into the detail page: KPI 5 ("Prod-blocked for you") lives on the catalogue
	// while the switcher lives in the detail's Permissions section, and Back must not reset the lens.
	const [persona, setPersona] = useState<Wc3Persona>(WC3_DEFAULT_PERSONA);
	const [filters, setFilters] = useState<FilterValue>({});
	// Controlled so the empty state's "Clear the filter" can clear the query as well as the facets.
	const [query, setQuery] = useState("");
	const [mode, setMode] = useCatalogueViewMode("wc3.products.view");
	const [openKey, setOpenKey] = useState<string | null>(null);
	const [detailSection, setDetailSection] = useState<Wc3ProductSection | undefined>(undefined);
	const [install, setInstall] = useState<{productKey: string; mode: Wc3InstallMode} | null>(null);

	const open = openKey ? (WC3_PRODUCTS.find((p) => p.productKey === openKey) ?? null) : null;

	// Arriving from the file system: a product file's ref names its productKey.
	useOpenRecord(
		openRecordId,
		(key) => WC3_PRODUCTS.some((p) => p.productKey === key),
		setOpenKey,
		onOpenRecordConsumed,
	);
	useDetailLabel(open?.displayName ?? null, onDetailChange);

	const kpis = useMemo(() => productKpis(installs, persona), [installs, persona]);

	const openProduct = useCallback((key: string) => {
		setDetailSection(undefined);
		setOpenKey(key);
	}, []);
	// The card footer's "Installs (N)" lands on the detail page with that section pre-selected —
	// the prototype's UI.detailTab["prod_" + key] = "installs".
	const openInstalls = useCallback((key: string) => {
		setDetailSection("installs");
		setOpenKey(key);
	}, []);
	const openInstall = useCallback((key: string, installMode: Wc3InstallMode) => {
		setInstall({productKey: key, mode: installMode});
	}, []);

	const clearAll = useCallback(() => {
		setFilters({});
		setQuery("");
	}, []);

	// Facet counts read the live array, so applying an install re-labels "Installed"/"Available".
	const typeCounts = useMemo(() => {
		const counts = new Map<string, number>();
		for (const p of WC3_PRODUCTS) counts.set(p.productType, (counts.get(p.productType) ?? 0) + 1);
		return counts;
	}, []);
	const installedCount = useMemo(
		() => WC3_PRODUCTS.filter((p) => isInstalledIn(installs, p.productKey)).length,
		[installs],
	);
	const readinessCount = useMemo(() => WC3_PRODUCTS.filter((p) => p.readiness).length, []);

	// One predicate for both view modes — the toggle changes what DataTable's body renders, never what
	// it filters. `productSearchText` is the prototype's textOf() plus the product-type label.
	const data = useMemo(() => {
		const needle = query.trim().toLowerCase();
		return WC3_PRODUCTS.filter((p) => {
			if (needle && !productSearchText(p).toLowerCase().includes(needle)) return false;
			const type = filters.productType;
			if (type && type.length > 0 && !type.includes(p.productType)) return false;
			const state = filters.installState;
			if (
				state &&
				state.length > 0 &&
				!state.includes(isInstalledIn(installs, p.productKey) ? "installed" : "available")
			)
				return false;
			const readiness = filters.readiness;
			if (readiness && readiness.length > 0 && !readiness.includes(p.readiness ? "declared" : "not-declared"))
				return false;
			return true;
		});
	}, [filters, installs, query]);

	const columns: ColumnDef<Wc3Product, unknown>[] = useMemo(
		() => [
			{
				// Ids are space-separated lowercase on purpose: the column-toggle popover capitalises
				// `column.id`, so "objectTypes" would read "ObjectTypes" in the list.
				id: "product",
				accessorFn: (p) => p.displayName,
				header: ({column}) => <DataTableColumnHeader column={column} title="Product" />,
				enableHiding: false,
				cell: ({row}) => (
					<span className="wwc:flex wwc:items-center wwc:gap-2 wwc:whitespace-nowrap">
						<ProductGlyphTile productType={row.original.productType} />
						<span className="wwc:min-w-0">
							<button
								type="button"
								onClick={() => openProduct(row.original.productKey)}
								className="wwc:block wwc:truncate wwc:text-left wwc:font-medium wwc:underline wwc:underline-offset-2 wwc:transition-colors wwc:hover:text-primary"
							>
								{row.original.displayName}
							</button>
							<Mono>{row.original.productKey}</Mono>
						</span>
					</span>
				),
			},
			{
				id: "type",
				accessorFn: (p) => productTypeMeta(p.productType).label,
				header: ({column}) => <DataTableColumnHeader column={column} title="Type" />,
				cell: ({row}) => <ProductTypeBadge productType={row.original.productType} />,
			},
			{
				id: "version",
				accessorFn: (p) => p.version,
				header: ({column}) => <DataTableColumnHeader column={column} title="Version" />,
				cell: ({row}) => <Mono>{row.original.version}</Mono>,
			},
			{
				id: "object types",
				accessorFn: (p) => p.outputs.ontologyObjectTypes.length,
				header: ({column}) => <DataTableColumnHeader column={column} title="Object types" />,
				meta: {headerClassName: "wwc:text-right", cellClassName: "wwc:text-right wwc:tabular-nums"},
				cell: ({row}) => row.original.outputs.ontologyObjectTypes.length,
			},
			{
				id: "link types",
				accessorFn: (p) => p.outputs.ontologyLinkTypes.length,
				header: ({column}) => <DataTableColumnHeader column={column} title="Link types" />,
				meta: {headerClassName: "wwc:text-right", cellClassName: "wwc:text-right wwc:tabular-nums"},
				cell: ({row}) => row.original.outputs.ontologyLinkTypes.length,
			},
			{
				id: "action types",
				accessorFn: (p) => p.outputs.ontology.actionTypes.length,
				header: ({column}) => <DataTableColumnHeader column={column} title="Action types" />,
				meta: {headerClassName: "wwc:text-right", cellClassName: "wwc:text-right wwc:tabular-nums"},
				cell: ({row}) => row.original.outputs.ontology.actionTypes.length,
			},
			{
				// Hidden by default: 16 of the 17 rows read "1 · 0".
				id: "osdk / routes",
				accessorFn: (p) => p.outputs.osdkScopes.length,
				header: "OSDK / routes",
				cell: ({row}) => (
					<Mono>{`${row.original.outputs.osdkScopes.length} · ${row.original.outputs.appRoutes.length}`}</Mono>
				),
			},
			{
				id: "evidence",
				accessorFn: (p) => evidenceTotal(p),
				header: ({column}) => <DataTableColumnHeader column={column} title="Evidence" />,
				meta: {headerClassName: "wwc:text-right", cellClassName: "wwc:text-right wwc:tabular-nums"},
				cell: ({row}) => {
					const total = evidenceTotal(row.original);
					const categories = Object.keys(row.original.evidence).length;
					return (
						<HoverTooltip content={`${total} refs across ${categories} categories`}>
							<span>{total}</span>
						</HoverTooltip>
					);
				},
			},
			{
				// Hidden by default: the value is "core" on all 17 rows.
				id: "enclave",
				accessorFn: (p) => p.ownerEnclaveId,
				header: "Enclave",
				cell: ({row}) => <Mono>{row.original.ownerEnclaveId}</Mono>,
			},
			{
				id: "readiness",
				accessorFn: (p) => p.readiness?.classification ?? "",
				header: ({column}) => <DataTableColumnHeader column={column} title="Readiness" />,
				cell: ({row}) =>
					row.original.readiness ? (
						<Badge variant="warningSoft">{row.original.readiness.classification}</Badge>
					) : (
						<span className="wwc:text-muted-foreground">—</span>
					),
			},
			{
				id: "links",
				accessorFn: (p) => p.dependencies.length + p.linkedProducts.length,
				header: ({column}) => <DataTableColumnHeader column={column} title="Links" />,
				meta: {headerClassName: "wwc:text-right", cellClassName: "wwc:text-right"},
				cell: ({row}) => {
					const p = row.original;
					const total = p.dependencies.length + p.linkedProducts.length;
					if (total === 0) return <span className="wwc:text-muted-foreground">—</span>;
					const lines = [
						...p.dependencies.map((d) => depChipText(d, isInstalledIn(installs, d.productKey))),
						...p.linkedProducts.map(linkChipText),
					];
					return (
						<HoverTooltip
							content={
								<span className="wwc:flex wwc:flex-col wwc:gap-0.5">
									{lines.map((line) => (
										<span key={line}>{line}</span>
									))}
								</span>
							}
						>
							<span className="wwc:inline-flex wwc:items-center wwc:justify-end wwc:gap-1 wwc:tabular-nums">
								{total}
								{/* The only place an unmet dependency shows at catalogue level. */}
								{hasUnmetLink(p, installs) && <TriangleAlert className="wwc:h-3 wwc:w-3 wwc:text-amber-600" />}
							</span>
						</HoverTooltip>
					);
				},
			},
			{
				id: "state",
				accessorFn: (p) => (isInstalledIn(installs, p.productKey) ? "installed" : "available"),
				header: ({column}) => <DataTableColumnHeader column={column} title="State" />,
				cell: ({row}) => (
					<span className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:whitespace-nowrap">
						<InstallStateBadge install={activeInstallIn(installs, row.original.productKey)} />
					</span>
				),
			},
			{
				id: "actions",
				header: "",
				enableSorting: false,
				enableHiding: false,
				// Per DataTable's own doc comment — body cells truncate at max-w-0 by default, which
				// would ellipsise the buttons.
				meta: {cellClassName: "wwc:w-px wwc:max-w-none wwc:whitespace-nowrap"},
				cell: ({row}) => (
					<ProductActions
						compact
						product={row.original}
						install={activeInstallIn(installs, row.original.productKey)}
						installCount={installsOfIn(installs, row.original.productKey).length}
						persona={persona}
						onOpenInstalls={openInstalls}
						onOpenInstall={openInstall}
					/>
				),
			},
		],
		[installs, persona, openProduct, openInstalls, openInstall],
	);

	const renderGrid = useCallback(
		(rows: Row<Wc3Product>[]) => {
			// The SAME rows the <Table> would have painted — already filtered, sorted and paginated by
			// the one DataTable this view mounts.
			if (rows.length === 0) return <ProductsEmptyState onClear={clearAll} />;
			return (
				<CatalogueCardGrid data-products-catalogue={rows.length}>
					{rows.map((row) => (
						<ProductCard
							key={row.id}
							product={row.original}
							install={activeInstallIn(installs, row.original.productKey)}
							installCount={installsOfIn(installs, row.original.productKey).length}
							installs={installs}
							persona={persona}
							onOpenProduct={openProduct}
							onOpenInstalls={openInstalls}
							onOpenInstall={openInstall}
						/>
					))}
				</CatalogueCardGrid>
			);
		},
		[clearAll, installs, persona, openProduct, openInstalls, openInstall],
	);

	const installProduct = install ? (WC3_PRODUCTS.find((p) => p.productKey === install.productKey) ?? null) : null;

	return (
		<>
			{/*
			 * Unconditional SIBLING of the drill-in, not a child of the catalogue branch: an early
			 * `if (open) return <ProductDetail/>` (the ontology precedent) would unmount the dialog the
			 * moment a product is open, and the detail page's Install… / Upgrade… buttons would open
			 * nothing. This is the one place the Products view must diverge from that precedent.
			 */}
			<InstallProductDialog
				open={install !== null}
				onOpenChange={(next) => {
					if (!next) setInstall(null);
				}}
				product={installProduct}
				mode={install?.mode ?? "install"}
				installs={installs}
				persona={persona}
				onApply={(record) => {
					setInstalls((prev) => [...prev, record]);
					setInstall(null);
					setDetailSection("installs");
					setOpenKey(record.productKey);
				}}
			/>

			{/*
			 * ProductDetail is NOT wrapped in Pane. It owns its own layout — a SideMenu beside a p-6
			 * content column, exactly like wc3-object-type-detail.tsx — so Pane's px-6 would apply the
			 * gutter twice and inset the whole page (measured: 48px right gutter against the object
			 * type page's 24px). The ontology precedent renders its detail unwrapped for the same reason.
			 */}
			{open ? (
				<ProductDetail
					// Keyed on the product so `initialSection` is re-read when the user crosses from one
					// product to another via a dependency's "Open" — without it the previous product's
					// active section would carry over and "Installs (N)" would land on the wrong one.
					key={open.productKey}
					product={open}
					installs={installs}
					persona={persona}
					onPersonaChange={setPersona}
					initialSection={detailSection}
					onBack={() => setOpenKey(null)}
					onOpenProduct={openProduct}
					onOpenInstall={openInstall}
					onNavigate={onNavigate}
				/>
			) : (
				<Pane flush>
					{/* No in-content <h1> — the perspective tab bar is the header. */}
					<p className="wwc:pt-4 wwc:text-xs wwc:text-muted-foreground">
						The governed unit that puts ontology into this store — manifests read verbatim from{" "}
						<Mono>products/*/manifests/*.product.manifest.json</Mono>
					</p>

					<div className="wwc:grid wwc:gap-3 wwc:sm:grid-cols-2 wwc:xl:grid-cols-5">
						<MetricCard
							title="Catalogue"
							icon={Package}
							value={kpis.catalogueCount}
							subtitle={`products across ${kpis.productTypeCount} product types`}
						/>
						<MetricCard
							title="Installed here"
							icon={CircleCheck}
							value={kpis.installedCount}
							subtitle={`${kpis.baselineCount} baseline · ${kpis.sessionCount} added in session`}
						/>
						<MetricCard
							title="Ontology from products"
							icon={Layers}
							value={kpis.provenancedObjectTypes}
							unit={`/ ${kpis.liveObjectTypes}`}
							subtitle="object types with product provenance"
						/>
						<MetricCard
							title="OSDK scopes declared"
							icon={KeyRound}
							value={kpis.osdkScopeCount}
							subtitle="across the whole catalogue"
						/>
						<MetricCard
							title="Prod-blocked for you"
							icon={Lock}
							value={kpis.prodBlockedCount}
							subtitle={`${persona.lens} · roles ${kpis.personaRoleList.join(", ") || "none"}`}
						/>
					</div>

					<Filter value={filters} onChange={setFilters}>
						{/*
						 * ONE DataTable is mounted for the life of this view. `mode` appears in exactly two
						 * props — `renderGrid` and `showColumnToggle` — and nowhere else: no `key`, no
						 * conditional render, no second table. The sorting, the column filters, the page
						 * index and the rows-per-page all live in useState INSIDE DataTable, so any
						 * structure that unmounts it would reset them; this one structurally cannot.
						 * The query and the applied filter are held here, above it, for the same reason.
						 */}
						<DataTable
							columns={columns}
							data={data}
							search={query}
							onSearchChange={setQuery}
							searchPlaceholder="Filter products…"
							recordLabel="product"
							recordLabelPlural="products"
							pageSize={25}
							flushToolbar
							getRowId={(p) => p.productKey}
							showColumnToggle={mode === "table"}
							/*
							 * The shared Table is `table-fixed` inside an `overflow-hidden` wrapper, so columns
							 * squeeze rather than scroll: at 13 columns the product name and key truncated to
							 * "Wirepas Devi…" and the trailing Install button was clipped in half at the pane edge.
							 * Five secondary counts are hidden by default — all still reachable from the Columns
							 * menu, and card mode shows the full picture — which leaves the identity column and the
							 * actions readable at 1600px.
							 */
							initialColumnVisibility={{
								enclave: false,
								"osdk / routes": false,
								"action types": false,
								"link types": false,
								links: false,
							}}
							renderGrid={mode === "cards" ? renderGrid : undefined}
							emptyMessage={<ProductsEmptyState onClear={clearAll} />}
							filterChipLabel={(category, value) => {
								if (category === "productType") return productTypeMeta(value).label;
								if (category === "installState") return INSTALL_STATE_LABEL[value] ?? value;
								if (category === "readiness") return READINESS_LABEL[value] ?? value;
								return value;
							}}
							toolbarExtra={
								<>
									<Badge
										variant="neutralSoft"
										title="Every product below is first-party Core. There is no third-party listing in WC3."
									>
										<ShieldCheck />
										First-party only
									</Badge>
									<CatalogueViewToggle value={mode} onValueChange={setMode} />
									<FilterTrigger />
									<FilterContent>
										<FilterCategory value="productType" label="Product type">
											{PRODUCT_TYPES.map((t) => (
												<FilterOption key={t} value={t}>
													{`${productTypeMeta(t).label} (${typeCounts.get(t) ?? 0})`}
												</FilterOption>
											))}
										</FilterCategory>
										<FilterCategory value="installState" label="Install state">
											<FilterOption value="installed">{`Installed (${installedCount})`}</FilterOption>
											<FilterOption value="available">
												{`Available (${WC3_PRODUCTS.length - installedCount})`}
											</FilterOption>
										</FilterCategory>
										<FilterCategory value="readiness" label="Readiness">
											<FilterOption value="declared">{`Declared (${readinessCount})`}</FilterOption>
											<FilterOption value="not-declared">
												{`Not declared (${WC3_PRODUCTS.length - readinessCount})`}
											</FilterOption>
										</FilterCategory>
									</FilterContent>
								</>
							}
						/>
					</Filter>
				</Pane>
			)}
		</>
	);
}
