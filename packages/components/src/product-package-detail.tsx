import {cn} from "@corensystem/coren-utils";
import {
	Ban,
	CircleCheck,
	CircleDashed,
	Download,
	FileText,
	KeyRound,
	Layers,
	Link2,
	Loader2,
	OctagonAlert,
	Package,
	TriangleAlert,
} from "lucide-react";
import * as React from "react";

import {Badge} from "./badge";
import {Banner} from "./banner";
import {Button} from "./button";
import {Card, CardContent, CardHeader, CardTitle} from "./card";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "./dialog";
import type {PageContentHeaderAction} from "./page-content-header";
import {PageContentHeader} from "./page-content-header";
import {PropertyList, PropertyRow} from "./property-list";
import {Separator} from "./separator";

// ProductPackageDetail — the package surface a Connect product centre mounts inside a route it
// already owns. It owns the package: identity, version, dependencies, outputs, permission gates,
// evidence, install state, the governed install plan, its confirmation, and the receipt. It owns
// NO shell and NO router — no sidebar, no top bar, no back navigation, no URL — so it drops into a
// CoreWC3Workspace slot or a paired CoreAppSidebar/CoreAppTopBar page without fighting either.
//
// Every product-neutral field is a prop: the widget never reaches for a fixture, and a host with its
// own catalogue shape maps into these types rather than adopting a demo's.

// ─── Vocabulary ──────────────────────────────────────────────────────────────

export type ProductPackageInstallStatus = "not-installed" | "installed" | "outdated" | "installing" | "failed";

/** A dependency's standing against the install target, decided by the host's planner. */
export type ProductPackageDependencyStatus = "satisfied" | "will-install" | "missing" | "conflict";

/** What the install does to an output: create it, replace an existing one, or link to it. */
export type ProductPackageOutputAction = "add" | "replace" | "link";

export type ProductPackageEvidenceStatus = "verified" | "pending" | "missing";

export interface ProductPackage {
	id: string;
	/** Display name. */
	name: string;
	/** Machine name shown beside the display name, e.g. `core.attendance`. */
	apiName?: string;
	/** The version this page is about — the one an install would apply. */
	version: string;
	description?: string;
	/** Who publishes it. */
	publisher?: string;
	/** What kind of package — "Data product", "Application", "Model". */
	kind?: string;
	/** A glyph or tile for the identity row. */
	icon?: React.ReactNode;
	/** Released, Deprecated, Preview… rendered beside the identity. */
	channel?: string;
	/** When this version was published. */
	publishedAt?: string;
	/** Anything else worth a label/value row in the overview. */
	details?: {label: string; value: React.ReactNode}[];
}

export interface ProductPackageDependency {
	id: string;
	name: string;
	version?: string;
	status: ProductPackageDependencyStatus;
	/** Why it is in this state, when the status alone does not say. */
	note?: string;
}

export interface ProductPackageOutput {
	id: string;
	name: string;
	/** "Object type", "Dataset", "App route", "Projection". */
	kind: string;
	action?: ProductPackageOutputAction;
	note?: string;
}

export interface ProductPackagePermission {
	id: string;
	/** The gate's name — "Install · Prod", "Bind resource". */
	label: string;
	/** Whether the acting user satisfies the gate. */
	granted: boolean;
	/** The roles that satisfy it. */
	roles?: string[];
	/** What the gate allows, in the host's words. */
	description?: string;
}

export interface ProductPackageEvidence {
	id: string;
	label: string;
	/** How many refs sit behind the label. */
	count?: number;
	status?: ProductPackageEvidenceStatus;
	/** A link the host opens; without it the row is not actionable. */
	href?: string;
}

/** Where an install lands. The widget never chooses this — the host route does. */
export interface ProductPackageInstallTarget {
	projectId?: string;
	projectName: string;
	/** Dev / Test / Prod, when the host separates them. */
	environment?: string;
}

export interface ProductPackageActor {
	id?: string;
	name: string;
	/** The role the action is taken under, for the receipt. */
	role?: string;
}

/** A refusal the host's planner produced. Blockers are shown, and they stop the confirm. */
export interface ProductPackageInstallBlocker {
	code: string;
	message: string;
}

export interface ProductPackageInstallState {
	status: ProductPackageInstallStatus;
	/** The version currently installed, when one is. */
	version?: string;
	installedAt?: string;
	installedBy?: string;
	/** Why the last attempt failed, for `status: "failed"`. */
	message?: string;
}

/** What the host is asked to install. Handed to `onInstall` before anything is written. */
export interface ProductPackageInstallRequest {
	packageId: string;
	packageName: string;
	version: string;
	project: ProductPackageInstallTarget;
	actor: ProductPackageActor;
}

/** The request, stamped with the moment it succeeded. Handed to `onInstalled`. */
export interface ProductPackageInstallReceipt extends ProductPackageInstallRequest {
	installedAt: string;
}

export interface ProductPackageDetailProps {
	/** The package this surface is about. */
	package: ProductPackage;
	dependencies?: ProductPackageDependency[];
	outputs?: ProductPackageOutput[];
	permissions?: ProductPackagePermission[];
	evidence?: ProductPackageEvidence[];
	/** What the target project already has. Omit it and the package reads as not installed. */
	installState?: ProductPackageInstallState;
	/** Where an install would land. Without it the install action has nothing to act on and is hidden. */
	target?: ProductPackageInstallTarget;
	/** Who is acting. Named on the confirmation and carried on the receipt. */
	actor: ProductPackageActor;

	/**
	 * Whether this persona may install. False disables the install action **and nothing else** — the
	 * package's details stay readable, because a viewer still has to be able to read them.
	 */
	canInstall?: boolean;
	/** Why the action is refused. Required in spirit whenever `canInstall` is false: state the reason. */
	denialReason?: string;
	/** Refusals from the host's planner. They are listed on the plan and they stop the confirm. */
	blockers?: ProductPackageInstallBlocker[];
	/** Overrides the derived action label ("Install", "Upgrade to 2.1.0", "Installed"). */
	installLabel?: string;
	/**
	 * Runs on confirm, before anything is shown as installed. Return a promise and the action stays in
	 * its pending state until it settles; reject and the failure is stated on the page.
	 */
	onInstall?: (request: ProductPackageInstallRequest) => void | Promise<void>;
	/** The success receipt — package, version, project, actor and the moment it landed. */
	onInstalled?: (receipt: ProductPackageInstallReceipt) => void;
	/** Called when an evidence row is opened. Rows without an `href` and without this are inert. */
	onOpenEvidence?: (evidence: ProductPackageEvidence) => void;

	/** Extra actions for the identity header — "View in catalogue", "Copy manifest". */
	headerActions?: PageContentHeaderAction[];
	/** Rendered under the sections, inside the same column. */
	footer?: React.ReactNode;
	className?: string;
}

// ─── Section vocabulary ──────────────────────────────────────────────────────

const DEPENDENCY_TONE: Record<
	ProductPackageDependencyStatus,
	{label: string; variant: "neutralSoft" | "successSoft" | "infoSoft" | "warningSoft" | "dangerSoft"}
> = {
	satisfied: {label: "Satisfied", variant: "successSoft"},
	"will-install": {label: "Will install", variant: "infoSoft"},
	missing: {label: "Missing", variant: "warningSoft"},
	conflict: {label: "Conflict", variant: "dangerSoft"},
};

const OUTPUT_ACTION_LABEL: Record<ProductPackageOutputAction, string> = {
	add: "Adds",
	replace: "Replaces",
	link: "Links",
};

const EVIDENCE_TONE: Record<
	ProductPackageEvidenceStatus,
	{label: string; variant: "successSoft" | "warningSoft" | "dangerSoft"}
> = {
	verified: {label: "Verified", variant: "successSoft"},
	pending: {label: "Pending", variant: "warningSoft"},
	missing: {label: "Missing", variant: "dangerSoft"},
};

const INSTALL_STATE_LABEL: Record<ProductPackageInstallStatus, string> = {
	"not-installed": "Not installed",
	installed: "Installed",
	outdated: "Update available",
	installing: "Installing…",
	failed: "Last install failed",
};

/** A titled block. Sections are plain cards, so the host can put this in any column width. */
function Section({
	title,
	icon,
	count,
	children,
}: {
	title: string;
	icon: React.ReactNode;
	count?: number;
	children: React.ReactNode;
}) {
	return (
		<Card>
			<CardHeader className="wwc:pb-3">
				<CardTitle className="wwc:flex wwc:items-center wwc:gap-2 wwc:text-sm wwc:font-semibold">
					<span className="wwc:text-muted-foreground wwc:[&_svg]:size-4">{icon}</span>
					{title}
					{count !== undefined ? (
						<Badge variant="neutralSoft" className="wwc:h-5 wwc:px-1.5 wwc:text-[11px]">
							{count}
						</Badge>
					) : null}
				</CardTitle>
			</CardHeader>
			<CardContent className="wwc:pt-0">{children}</CardContent>
		</Card>
	);
}

function EmptyRow({children}: {children: React.ReactNode}) {
	return <p className="wwc:text-sm wwc:text-muted-foreground">{children}</p>;
}

/** One row of a section list: a name on the left, its standing on the right. */
function ListRow({
	title,
	subtitle,
	trailing,
	onOpen,
	href,
}: {
	title: React.ReactNode;
	subtitle?: React.ReactNode;
	trailing?: React.ReactNode;
	onOpen?: () => void;
	href?: string;
}) {
	const body = (
		<>
			<div className="wwc:min-w-0 wwc:flex-1">
				<p className="wwc:truncate wwc:text-sm wwc:font-medium">{title}</p>
				{subtitle ? <p className="wwc:truncate wwc:text-xs wwc:text-muted-foreground">{subtitle}</p> : null}
			</div>
			{trailing ? <div className="wwc:shrink-0">{trailing}</div> : null}
		</>
	);
	const className =
		"wwc:flex wwc:w-full wwc:items-center wwc:gap-3 wwc:py-2 wwc:text-left wwc:border-b wwc:last:border-0";

	if (href) {
		return (
			<a href={href} target="_blank" rel="noreferrer" className={cn(className, "wwc:hover:bg-muted/40")}>
				{body}
			</a>
		);
	}
	if (onOpen) {
		return (
			<button type="button" onClick={onOpen} className={cn(className, "wwc:hover:bg-muted/40")}>
				{body}
			</button>
		);
	}
	return <div className={className}>{body}</div>;
}

// ─── The widget ──────────────────────────────────────────────────────────────

/**
 * A product package as a route-injectable surface: identity, version, dependencies, outputs,
 * permission gates, evidence and install state, over a governed install — a plan, a confirmation,
 * and a receipt.
 *
 * It owns no shell and no router, so it mounts inside a workspace slot or a page whose sidebar and
 * top bar already exist. Authorisation is the host's answer, not the widget's: pass `canInstall` and
 * a `denialReason`, and the only thing that changes is the install action. Everything else stays
 * readable, because a viewer still has to be able to read it.
 *
 * ```tsx
 * <ProductPackageDetail
 *   package={pkg}
 *   target={{projectName: "Riyadh Metro", environment: "Prod"}}
 *   actor={{name: "A. Ibrahim", role: "Platform admin"}}
 *   canInstall={can}
 *   denialReason={can ? undefined : "Install · Prod requires the Platform admin role."}
 *   onInstall={applyInstall}
 *   onInstalled={recordReceipt}
 * />
 * ```
 */
export function ProductPackageDetail({
	package: pkg,
	dependencies = [],
	outputs = [],
	permissions = [],
	evidence = [],
	installState,
	target,
	actor,
	canInstall = true,
	denialReason,
	blockers = [],
	installLabel,
	onInstall,
	onInstalled,
	onOpenEvidence,
	headerActions = [],
	footer,
	className,
}: ProductPackageDetailProps) {
	const [confirming, setConfirming] = React.useState(false);
	const [pending, setPending] = React.useState(false);
	const [receipt, setReceipt] = React.useState<ProductPackageInstallReceipt | null>(null);
	const [failure, setFailure] = React.useState<string | null>(null);

	const status: ProductPackageInstallStatus = receipt ? "installed" : (installState?.status ?? "not-installed");
	const installedVersion = receipt ? receipt.version : installState?.version;
	const upToDate = status === "installed" && installedVersion === pkg.version;
	const installing = pending || status === "installing";

	const actionLabel =
		installLabel ??
		(upToDate
			? "Installed"
			: status === "installed" || status === "outdated"
				? `Upgrade to ${pkg.version}`
				: "Install");

	// The action is the ONLY thing authorisation touches. Everything below it renders the same for a
	// viewer as for an installer — a refusal is not a reason to hide what the package is.
	const actionDisabled = !canInstall || !target || installing || upToDate;

	const request: ProductPackageInstallRequest | null = target
		? {packageId: pkg.id, packageName: pkg.name, version: pkg.version, project: target, actor}
		: null;

	const confirm = async () => {
		if (!request) return;
		setConfirming(false);
		setFailure(null);
		setPending(true);
		try {
			await onInstall?.(request);
			const settled: ProductPackageInstallReceipt = {...request, installedAt: new Date().toISOString()};
			setReceipt(settled);
			onInstalled?.(settled);
		} catch (error) {
			setFailure(error instanceof Error ? error.message : "The install did not complete.");
		} finally {
			setPending(false);
		}
	};

	const grantedGates = permissions.filter((permission) => permission.granted).length;
	const unmetDependencies = dependencies.filter(
		(dependency) => dependency.status === "missing" || dependency.status === "conflict",
	);

	return (
		<div className={cn("wwc:@container wwc:flex wwc:w-full wwc:min-w-0 wwc:flex-col", className)}>
			<PageContentHeader
				variant="entity-actions"
				density="compact"
				headingLevel={2}
				instrumentationId="product-package-detail"
				title={pkg.name}
				description={pkg.description}
				avatar={
					pkg.icon ?? (
						<div className="wwc:flex wwc:h-9 wwc:w-9 wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:bg-muted wwc:text-muted-foreground">
							<Package className="wwc:h-4 wwc:w-4" />
						</div>
					)
				}
				meta={
					<span className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5 wwc:text-xs wwc:text-muted-foreground">
						{pkg.apiName ? <code className="wwc:font-mono wwc:text-[11px]">{pkg.apiName}</code> : null}
						{pkg.publisher ? <span>· {pkg.publisher}</span> : null}
					</span>
				}
				status={
					<span className="wwc:flex wwc:items-center wwc:gap-1.5">
						{pkg.kind ? <Badge variant="neutralSoft">{pkg.kind}</Badge> : null}
						<Badge variant="outline">v{pkg.version}</Badge>
						{pkg.channel ? <Badge variant="neutralSoft">{pkg.channel}</Badge> : null}
					</span>
				}
				actions={headerActions}
			/>

			{/* One column below ~1024px — at 820px the install panel sits under the package, not beside it. */}
			<div className="wwc:grid wwc:min-w-0 wwc:gap-4 wwc:p-4 wwc:lg:grid-cols-3">
				<div className="wwc:flex wwc:min-w-0 wwc:flex-col wwc:gap-4 wwc:lg:col-span-2">
					<Section title="Overview" icon={<FileText />}>
						<PropertyList labelWidth="10rem">
							<PropertyRow label="Version">
								<span className="wwc:text-sm wwc:font-medium">{pkg.version}</span>
							</PropertyRow>
							{pkg.publishedAt ? (
								<PropertyRow label="Published">
									<span className="wwc:text-sm">{pkg.publishedAt}</span>
								</PropertyRow>
							) : null}
							{pkg.publisher ? (
								<PropertyRow label="Publisher">
									<span className="wwc:text-sm">{pkg.publisher}</span>
								</PropertyRow>
							) : null}
							{installedVersion ? (
								<PropertyRow label="Installed version">
									<span className="wwc:text-sm">{installedVersion}</span>
								</PropertyRow>
							) : null}
							{pkg.details?.map((detail) => (
								<PropertyRow key={detail.label} label={detail.label} align="start">
									<span className="wwc:text-sm">{detail.value}</span>
								</PropertyRow>
							))}
						</PropertyList>
					</Section>

					<Section title="Dependencies" icon={<Link2 />} count={dependencies.length}>
						{dependencies.length === 0 ? (
							<EmptyRow>This package depends on nothing else.</EmptyRow>
						) : (
							<div>
								{dependencies.map((dependency) => (
									<ListRow
										key={dependency.id}
										title={dependency.name}
										subtitle={[dependency.version, dependency.note].filter(Boolean).join(" · ") || undefined}
										trailing={
											<Badge variant={DEPENDENCY_TONE[dependency.status].variant}>
												{DEPENDENCY_TONE[dependency.status].label}
											</Badge>
										}
									/>
								))}
							</div>
						)}
					</Section>

					<Section title="Outputs" icon={<Layers />} count={outputs.length}>
						{outputs.length === 0 ? (
							<EmptyRow>This package writes nothing into the project.</EmptyRow>
						) : (
							<div>
								{outputs.map((output) => (
									<ListRow
										key={output.id}
										title={output.name}
										subtitle={[output.kind, output.note].filter(Boolean).join(" · ")}
										trailing={
											output.action ? (
												<Badge variant={output.action === "replace" ? "warningSoft" : "neutralSoft"}>
													{OUTPUT_ACTION_LABEL[output.action]}
												</Badge>
											) : null
										}
									/>
								))}
							</div>
						)}
					</Section>

					<Section title="Evidence" icon={<FileText />} count={evidence.length}>
						{evidence.length === 0 ? (
							<EmptyRow>No evidence has been attached to this version.</EmptyRow>
						) : (
							<div>
								{evidence.map((item) => (
									<ListRow
										key={item.id}
										title={item.label}
										subtitle={item.count !== undefined ? `${item.count} refs` : undefined}
										href={item.href}
										onOpen={item.href || !onOpenEvidence ? undefined : () => onOpenEvidence(item)}
										trailing={
											item.status ? (
												<Badge variant={EVIDENCE_TONE[item.status].variant}>{EVIDENCE_TONE[item.status].label}</Badge>
											) : null
										}
									/>
								))}
							</div>
						)}
					</Section>

					{footer}
				</div>

				<div className="wwc:flex wwc:min-w-0 wwc:flex-col wwc:gap-4">
					<Card data-testid="product-package-install">
						<CardHeader className="wwc:pb-3">
							<CardTitle className="wwc:flex wwc:items-center wwc:gap-2 wwc:text-sm wwc:font-semibold">
								<span className="wwc:text-muted-foreground wwc:[&_svg]:size-4">
									<Download />
								</span>
								Install
							</CardTitle>
						</CardHeader>
						<CardContent className="wwc:flex wwc:flex-col wwc:gap-3 wwc:pt-0">
							<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-3">
								<span className="wwc:text-sm wwc:text-muted-foreground">State</span>
								<Badge
									variant={
										status === "installed"
											? "successSoft"
											: status === "failed"
												? "dangerSoft"
												: status === "outdated"
													? "warningSoft"
													: "neutralSoft"
									}
								>
									{INSTALL_STATE_LABEL[status]}
								</Badge>
							</div>

							{target ? (
								<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-3">
									<span className="wwc:text-sm wwc:text-muted-foreground">Target</span>
									<span className="wwc:truncate wwc:text-sm wwc:font-medium">
										{target.projectName}
										{target.environment ? ` · ${target.environment}` : ""}
									</span>
								</div>
							) : null}

							<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-3">
								<span className="wwc:text-sm wwc:text-muted-foreground">Acting as</span>
								<span className="wwc:truncate wwc:text-sm wwc:font-medium">
									{actor.name}
									{actor.role ? ` · ${actor.role}` : ""}
								</span>
							</div>

							<Separator />

							<Button
								className="wwc:w-full wwc:gap-1.5"
								disabled={actionDisabled}
								onClick={() => setConfirming(true)}
								data-testid="product-package-install-action"
							>
								{installing ? <Loader2 className="wwc:animate-spin" /> : <Download />}
								{installing ? "Installing…" : actionLabel}
							</Button>

							{/* The refusal is stated, not implied by a greyed button. */}
							{!canInstall && denialReason ? (
								<p
									className="wwc:flex wwc:items-start wwc:gap-1.5 wwc:text-xs wwc:text-muted-foreground"
									data-testid="product-package-denial"
								>
									<Ban className="wwc:mt-0.5 wwc:h-3.5 wwc:w-3.5 wwc:shrink-0" aria-hidden />
									{denialReason}
								</p>
							) : null}

							{canInstall && !target ? (
								<p className="wwc:text-xs wwc:text-muted-foreground">
									Choose a project before installing this package.
								</p>
							) : null}

							{blockers.length > 0 ? (
								<div className="wwc:flex wwc:flex-col wwc:gap-1.5" data-testid="product-package-blockers">
									{blockers.map((blocker) => (
										<p
											key={blocker.code}
											className="wwc:flex wwc:items-start wwc:gap-1.5 wwc:text-xs wwc:text-destructive"
										>
											<OctagonAlert className="wwc:mt-0.5 wwc:h-3.5 wwc:w-3.5 wwc:shrink-0" aria-hidden />
											{blocker.message}
										</p>
									))}
								</div>
							) : null}

							{receipt ? (
								<Banner
									variant="success"
									title="Installed"
									description={`${receipt.packageName} ${receipt.version} → ${receipt.project.projectName}${
										receipt.project.environment ? ` · ${receipt.project.environment}` : ""
									}`}
									items={[`By ${receipt.actor.name}${receipt.actor.role ? ` · ${receipt.actor.role}` : ""}`]}
									className="wwc:mt-1"
								/>
							) : null}

							{(failure ?? (status === "failed" ? installState?.message : null)) ? (
								<Banner
									variant="danger"
									title="Install failed"
									description={failure ?? installState?.message ?? ""}
									className="wwc:mt-1"
								/>
							) : null}
						</CardContent>
					</Card>

					<Section title="Permissions" icon={<KeyRound />} count={permissions.length}>
						{permissions.length === 0 ? (
							<EmptyRow>This package requires no additional role.</EmptyRow>
						) : (
							<>
								<p className="wwc:mb-2 wwc:text-xs wwc:text-muted-foreground">
									{grantedGates} of {permissions.length} gates met as {actor.name}.
								</p>
								<div>
									{permissions.map((permission) => (
										<ListRow
											key={permission.id}
											title={permission.label}
											subtitle={permission.description ?? (permission.roles ? permission.roles.join(", ") : undefined)}
											trailing={
												permission.granted ? (
													<CircleCheck
														className="wwc:h-4 wwc:w-4 wwc:text-green-600 wwc:dark:text-green-500"
														aria-label="Granted"
													/>
												) : (
													<CircleDashed
														className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground"
														aria-label="Not granted"
													/>
												)
											}
										/>
									))}
								</div>
							</>
						)}
					</Section>
				</div>
			</div>

			{/* The governed step: what is about to happen, to which project, as whom — and every refusal
			    the host's planner produced, with the confirm closed while any of them stands. */}
			<Dialog open={confirming} onOpenChange={setConfirming}>
				<DialogContent variant="stacked" data-testid="product-package-confirm">
					<DialogHeader>
						<DialogTitle>
							{actionLabel} {pkg.name}
						</DialogTitle>
						<DialogDescription>
							{target
								? `Into ${target.projectName}${target.environment ? ` · ${target.environment}` : ""}, as ${actor.name}${
										actor.role ? ` (${actor.role})` : ""
									}.`
								: "No target project has been chosen."}
						</DialogDescription>
					</DialogHeader>

					<div className="wwc:flex wwc:max-h-72 wwc:flex-col wwc:gap-3 wwc:overflow-auto">
						<div>
							<p className="wwc:mb-1 wwc:text-xs wwc:font-semibold wwc:tracking-wide wwc:uppercase wwc:text-muted-foreground">
								Version
							</p>
							<p className="wwc:text-sm">{installedVersion ? `${installedVersion} → ${pkg.version}` : pkg.version}</p>
						</div>

						{outputs.length > 0 ? (
							<div>
								<p className="wwc:mb-1 wwc:text-xs wwc:font-semibold wwc:tracking-wide wwc:uppercase wwc:text-muted-foreground">
									This install writes
								</p>
								<ul className="wwc:list-inside wwc:list-disc wwc:space-y-0.5 wwc:text-sm">
									{outputs.map((output) => (
										<li key={output.id}>
											{output.action ? `${OUTPUT_ACTION_LABEL[output.action]} ` : ""}
											{output.name} <span className="wwc:text-muted-foreground">({output.kind})</span>
										</li>
									))}
								</ul>
							</div>
						) : null}

						{unmetDependencies.length > 0 ? (
							<div>
								<p className="wwc:mb-1 wwc:text-xs wwc:font-semibold wwc:tracking-wide wwc:uppercase wwc:text-muted-foreground">
									Unmet dependencies
								</p>
								<ul className="wwc:list-inside wwc:list-disc wwc:space-y-0.5 wwc:text-sm">
									{unmetDependencies.map((dependency) => (
										<li key={dependency.id}>
											{dependency.name}
											{dependency.version ? ` ${dependency.version}` : ""} —{" "}
											{DEPENDENCY_TONE[dependency.status].label.toLowerCase()}
										</li>
									))}
								</ul>
							</div>
						) : null}

						{blockers.length > 0 ? (
							<div className="wwc:flex wwc:flex-col wwc:gap-1.5">
								{blockers.map((blocker) => (
									<p
										key={blocker.code}
										className="wwc:flex wwc:items-start wwc:gap-1.5 wwc:text-sm wwc:text-destructive"
									>
										<TriangleAlert className="wwc:mt-0.5 wwc:h-4 wwc:w-4 wwc:shrink-0" aria-hidden />
										{blocker.message}
									</p>
								))}
							</div>
						) : null}
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setConfirming(false)}>
							Cancel
						</Button>
						<Button
							onClick={confirm}
							disabled={blockers.length > 0 || !request}
							data-testid="product-package-confirm-action"
						>
							{actionLabel}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
