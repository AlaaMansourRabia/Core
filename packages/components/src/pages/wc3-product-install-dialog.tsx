import type {ReactElement} from "react";

import {cn} from "@corensystem/coren-utils";
import {Check, Link2, Play, Zap} from "lucide-react";
import * as React from "react";

import {Badge} from "../badge";
import {Banner} from "../banner";
import {Button} from "../button";
import {Card, CardContent, CardHeader, CardTitle} from "../card";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "../dialog";
import {Input} from "../input";
import {Label} from "../label";
import {MetricCard} from "../metric-card";
import {PropertyList, PropertyRow} from "../property-list";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../select";
import {toast} from "../sonner";
import {Stepper, StepperIndicator, StepperItem, StepperLabel, StepperList, StepperSeparator} from "../stepper";
import type {Wc3Install} from "./wc3-lineage-data";
import {WC3_ACTION_TYPES, WC3_LINK_TYPES, WC3_OBJECT_TYPES} from "./wc3-ontology-data";
import {
	WC3_PRODUCT_ENVS,
	type Wc3Product,
	type Wc3ProductDependency,
	type Wc3ProductLink,
	type Wc3ProductPermissionKey,
	productOutputSummary,
} from "./wc3-product-data";
import {
	DEFAULT_RELEASE_EVIDENCE,
	LIVE_ACTION_API_NAMES,
	LIVE_LINK_API_NAMES,
	LIVE_OBJECT_TYPE_BY_API,
	Mono,
	type Wc3InstallMode,
	type Wc3Persona,
	type Wc3RoleGate,
	camelApiName,
	gateOkSentence,
	isInstalledIn,
	personaRoles,
	roleGate,
} from "./wc3-product-shared";

// The governed install flow — the prototype's four-step InstallModal (06-unified-workspace.html:11524)
// ported onto the house wizard machinery: the same Dialog/DialogHeader/DialogFooter shell, the same
// local WizardSteps wrapper over Stepper, the same FieldLabel, the same "Next is never disabled —
// pressing it reveals the step's error" contract as object-type-wizard.tsx and
// wc3-action-type-wizard.tsx. Nothing about the chrome is new.
//
// Only three things here have no analogue in the library: `computeInstallPlan` (a pure function),
// the six blocker codes and their exact strings, and the aggregated Prod release-evidence error.
//
// This dialog mutates nothing. It reports the install record it would have written through
// `onApply`; the catalogue view owns the live install array.

// ─── Plan types ──────────────────────────────────────────────────────────────

/** Why a plan cannot apply. The six codes are the prototype's, in the order it pushes them. */
export type Wc3InstallBlockerCode = "permission" | "dependency" | "linked" | "installed" | "readiness" | "noop";

/** One refusal row. `text` is rendered verbatim; it is also what the Apply toast quotes. */
export type Wc3InstallBlocker = {code: Wc3InstallBlockerCode; text: string};

/** A manifest-declared primitive whose API name is free, so the apply would create it. */
export type Wc3InstallPlanAdd = {name: string; apiName: string};

/**
 * A declared object type whose API name is already taken. Object collisions carry their owner so the
 * warning can say who holds the name; link and action collisions render bare (the prototype's shape).
 */
export type Wc3InstallPlanObjectCollision = {
	name: string;
	apiName: string;
	ownerId: string | null;
	owner: string;
	ownerProduct: string | null;
};

/** A declared link/action type whose API name is already taken. */
export type Wc3InstallPlanCollision = {name: string; apiName: string};

/** The preview an install draft is planned into — computed against the live store, never canned. */
export type Wc3InstallPlan = {
	productKey: string;
	version: string;
	env: string;
	gateKey: Wc3ProductPermissionKey;
	perm: Wc3RoleGate;
	objAdd: Wc3InstallPlanAdd[];
	objCollide: Wc3InstallPlanObjectCollision[];
	ltAdd: Wc3InstallPlanAdd[];
	ltCollide: Wc3InstallPlanCollision[];
	actAdd: Wc3InstallPlanAdd[];
	actCollide: Wc3InstallPlanCollision[];
	deps: (Wc3ProductDependency & {satisfied: boolean})[];
	linked: (Wc3ProductLink & {satisfied: boolean})[];
	osdkScopes: string[];
	appRoutes: string[];
	requiredProjectRoles: string[];
	interfaces: string[];
	applySteps: string[];
	rollbackSteps: string[];
	blockers: Wc3InstallBlocker[];
	canApply: boolean;
	computedAt: string;
};

// ─── Plan ────────────────────────────────────────────────────────────────────

/** The prototype's nowStr() — a wall-clock label, not an ISO stamp. */
const nowStr = () => new Date().toLocaleTimeString();

/** Which of the manifest's three install gates a target environment reads. */
function envGateKey(env: string): Wc3ProductPermissionKey {
	return WC3_PRODUCT_ENVS.find((e) => e.env === env)?.gateKey ?? "installProdRoles";
}

/**
 * Previews what installing `p` into `env` would do, against the LIVE ontology fixture and the LIVE
 * install array.
 *
 * A name that is free at check time is RESERVED, so a manifest that declares the same name twice
 * collides with itself on the second occurrence — the prototype's behaviour, and the reason the
 * reserved sets are seeded from the shared module's live indexes rather than queried per name.
 *
 * A collision is never fatal and never overwrites: it is skipped at apply time and recorded on the
 * install record's `skipped` bucket.
 */
export function computeInstallPlan(
	p: Wc3Product,
	env: string,
	persona: Wc3Persona,
	installs: Wc3Install[],
): Wc3InstallPlan {
	const gateKey = envGateKey(env);
	const perm = roleGate(p, gateKey, persona);
	const o = p.outputs;
	const ont = o.ontology;

	const otApis = new Set(LIVE_OBJECT_TYPE_BY_API.keys());
	const objAdd: Wc3InstallPlanAdd[] = [];
	const objCollide: Wc3InstallPlanObjectCollision[] = [];
	for (const name of o.ontologyObjectTypes) {
		const apiName = camelApiName(name);
		if (otApis.has(apiName)) {
			const owner = LIVE_OBJECT_TYPE_BY_API.get(apiName);
			objCollide.push({
				name,
				apiName,
				ownerId: owner?.id ?? null,
				owner: owner?.displayName ?? apiName,
				ownerProduct: owner?.installedBy?.productKey ?? null,
			});
		} else {
			objAdd.push({name, apiName});
			otApis.add(apiName);
		}
	}

	const ltApis = new Set(LIVE_LINK_API_NAMES);
	const ltAdd: Wc3InstallPlanAdd[] = [];
	const ltCollide: Wc3InstallPlanCollision[] = [];
	for (const name of o.ontologyLinkTypes) {
		const apiName = camelApiName(name);
		if (ltApis.has(apiName)) ltCollide.push({name, apiName});
		else {
			ltAdd.push({name, apiName});
			ltApis.add(apiName);
		}
	}

	const atApis = new Set(LIVE_ACTION_API_NAMES);
	const actAdd: Wc3InstallPlanAdd[] = [];
	const actCollide: Wc3InstallPlanCollision[] = [];
	for (const name of ont.actionTypes) {
		const apiName = camelApiName(name);
		if (atApis.has(apiName)) actCollide.push({name, apiName});
		else {
			actAdd.push({name, apiName});
			atApis.add(apiName);
		}
	}

	const deps = p.dependencies.map((d) => ({...d, satisfied: isInstalledIn(installs, d.productKey)}));
	const linked = p.linkedProducts.map((l) => ({...l, satisfied: isInstalledIn(installs, l.productKey)}));

	const blockers: Wc3InstallBlocker[] = [];
	if (!perm.ok) blockers.push({code: "permission", text: perm.reason});
	for (const d of deps) {
		if (d.required && !d.satisfied) {
			blockers.push({
				code: "dependency",
				text: `Blocked: required dependency ${d.productKey} ${d.versionRange} is not installed in this workspace.`,
			});
		}
	}
	for (const l of linked) {
		if (!l.optional && !l.satisfied) {
			blockers.push({
				code: "linked",
				text: `Blocked: non-optional linked product ${l.productKey} ${l.version} (role: ${l.role}) is not installed.`,
			});
		}
	}
	// Keeps a re-plan of an already-installed product from looking additive: the 13 baseline object
	// types carry ontology-style ids that do not map one-to-one onto the manifests' declared names, so
	// without this guard capture would appear to add all 39 of its types a second time.
	if (isInstalledIn(installs, p.productKey)) {
		blockers.push({
			code: "installed",
			text: `Blocked: ${p.productKey} already has an applied install in this workspace. Roll it back or uninstall it first.`,
		});
	}
	const rd = p.readiness;
	if (rd && rd.blockedReasons.length > 0 && env === "Prod") {
		for (const reason of rd.blockedReasons) {
			blockers.push({
				code: "readiness",
				text: `Blocked by declared readiness (${rd.classification || "readiness"}): ${reason}`,
			});
		}
	}
	if (objAdd.length === 0 && ltAdd.length === 0 && actAdd.length === 0 && blockers.length === 0) {
		blockers.push({
			code: "noop",
			text: "Blocked: this plan adds nothing — every ontology primitive the manifest declares already exists under the same API name.",
		});
	}

	const applySteps: string[] = [];
	applySteps.push(`Resolve product graph — ${1 + linked.length} node(s), ${deps.length} declared dependenc(ies)`);
	applySteps.push(`Verify ${gateKey} against the acting principal`);
	if (objAdd.length) applySteps.push(`Create ${objAdd.length} ontology object type(s) with primary + title keys`);
	if (ltAdd.length) {
		applySteps.push(`Create ${ltAdd.length} ontology link type(s), endpoints resolved from the manifest names`);
	}
	if (actAdd.length) applySteps.push(`Register ${actAdd.length} ontology action type(s)`);
	applySteps.push(`Grant ${o.osdkScopes.length} OSDK scope(s) and mount ${o.appRoutes.length} app route(s)`);
	applySteps.push("Record metadata / lineage / lakehouse provenance against install id");
	applySteps.push("Write the changeset entry (undoable) and push a time-machine snapshot");
	// A string transform, not a second list — including the "Revoke N OSDK scope(s) and mount 0 app
	// route(s)" line it produces, which reads oddly and is reproduced deliberately.
	const rollbackSteps = applySteps
		.slice()
		.reverse()
		.map((s) =>
			s
				.replace(/^Create /, "Drop ")
				.replace(/^Register /, "Deregister ")
				.replace(/^Grant /, "Revoke "),
		);

	return {
		productKey: p.productKey,
		version: p.version,
		env,
		gateKey,
		perm,
		objAdd,
		objCollide,
		ltAdd,
		ltCollide,
		actAdd,
		actCollide,
		deps,
		linked,
		osdkScopes: o.osdkScopes.slice(),
		appRoutes: o.appRoutes.slice(),
		requiredProjectRoles: o.requiredProjectRoles.slice(),
		interfaces: ont.interfaces.slice(),
		applySteps,
		rollbackSteps,
		blockers,
		canApply: blockers.length === 0,
		computedAt: nowStr(),
	};
}

// ─── Wizard chrome (copied from object-type-wizard.tsx / wc3-action-type-wizard.tsx) ──

const STEPS = ["Draft", "Plan", "Release evidence", "Apply"] as const;

/** Uppercase field label, matching object-type-wizard.tsx. */
function FieldLabel({children}: {children: React.ReactNode}) {
	return (
		<Label className="wwc:text-xs wwc:font-semibold wwc:tracking-wide wwc:text-muted-foreground wwc:uppercase">
			{children}
		</Label>
	);
}

function WizardSteps({step}: {step: number}) {
	return (
		<Stepper value={step + 1} orientation="horizontal" className="wwc:w-full">
			<StepperList className="wwc:w-full">
				{STEPS.map((label, index) => (
					<React.Fragment key={label}>
						<StepperItem step={index + 1}>
							<StepperIndicator />
							<StepperLabel>{label}</StepperLabel>
						</StepperItem>
						{index < STEPS.length - 1 ? <StepperSeparator /> : null}
					</React.Fragment>
				))}
			</StepperList>
		</Stepper>
	);
}

// ─── Release evidence ────────────────────────────────────────────────────────

type EvidenceKey = "approvedBy" | "releaseChannel" | "promotionRunbookRef" | "rollbackRunbookRef";

/**
 * The four release-evidence fields, in the order the Prod validation lists them. `errorLabel` is the
 * lowercase phrase the aggregated error joins; `label` is what the field shows.
 */
const EVIDENCE_FIELDS: {
	key: EvidenceKey;
	label: string;
	errorLabel: string;
	placeholder: string;
	hint: string;
	mono?: boolean;
}[] = [
	{
		key: "approvedBy",
		label: "Approved by",
		errorLabel: "approver name",
		placeholder: "Name of the approver",
		hint: "Recorded verbatim on the install record and in the changeset entry.",
	},
	{
		key: "releaseChannel",
		label: "Release channel",
		errorLabel: "release channel",
		placeholder: "STABLE",
		hint: "STABLE is the default channel used by the platform marketplace.",
	},
	{
		key: "promotionRunbookRef",
		label: "Promotion runbook ref",
		errorLabel: "promotion runbook ref",
		placeholder: "runbooks/product-release-promotion.md",
		hint: "Path to the runbook followed to promote this version.",
		mono: true,
	},
	{
		key: "rollbackRunbookRef",
		label: "Rollback runbook ref",
		errorLabel: "rollback runbook ref",
		placeholder: "runbooks/product-rollback.md",
		hint: "Path to the runbook that reverses it — the same reversal this UI performs.",
		mono: true,
	},
];

type EvidenceState = Record<EvidenceKey, string>;

const EMPTY_EVIDENCE: EvidenceState = {approvedBy: "", ...DEFAULT_RELEASE_EVIDENCE};

// ─── Small presentational bits ───────────────────────────────────────────────

/** A manifest name chip. `title` carries the API name the primitive would take. */
function NameChip({children, title}: {children: React.ReactNode; title?: string}) {
	return (
		<Badge variant="neutralSoft" className="wwc:font-mono wwc:font-normal" title={title}>
			{children}
		</Badge>
	);
}

function MutedNote({children}: {children: React.ReactNode}) {
	return <span className="wwc:text-xs wwc:text-muted-foreground">{children}</span>;
}

/** One of the plan step's four sub-cards, tightened for the dialog's scroll pane. */
function PlanCard({title, children}: {title: string; children: React.ReactNode}) {
	return (
		<Card>
			<CardHeader className="wwc:p-3 wwc:pb-1.5">
				<CardTitle className="wwc:text-xs wwc:font-semibold">{title}</CardTitle>
			</CardHeader>
			<CardContent className="wwc:p-3 wwc:pt-0">{children}</CardContent>
		</Card>
	);
}

/** The numbered apply / rollback order. Every generated step sentence is distinct, so it is its own key. */
function StepList({steps}: {steps: string[]}) {
	return (
		<ol className="wwc:list-decimal wwc:space-y-1 wwc:pl-4">
			{steps.map((s) => (
				<li key={s} className="wwc:text-xs wwc:text-muted-foreground">
					{s}
				</li>
			))}
		</ol>
	);
}

/** The stacked refusal rows — one danger Banner per blocker, in the plan's order. */
function BlockerList({blockers}: {blockers: Wc3InstallBlocker[]}) {
	return (
		<div className="wwc:space-y-2">
			{/* Two blockers can share a code (two readiness reasons) but never a text. */}
			{blockers.map((b) => (
				<Banner key={b.text} variant="danger" title={b.text} />
			))}
		</div>
	);
}

// ─── Dialog ──────────────────────────────────────────────────────────────────

export type InstallProductDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** `null` keeps the dialog mounted but inert — the catalogue renders it as an unconditional sibling. */
	product: Wc3Product | null;
	/** Only the title and the recorded lifecycle differ between the two. */
	mode: Wc3InstallMode;
	/** The whole-workspace live install array; dependency / linked / already-installed checks read it. */
	installs: Wc3Install[];
	/** The acting persona — every gate in the flow is evaluated against it, live. */
	persona: Wc3Persona;
	/** Fired with the install record an apply would have written. This dialog mutates nothing. */
	onApply: (record: Wc3Install) => void;
};

/**
 * Four-step governed install: Draft → Plan → Release evidence → Apply.
 *
 * Blockers never stop navigation — you can plan, fill evidence and reach Apply with four refusals
 * visible. The block is enforced exactly once, when Apply is pressed, and the dialog then stays open
 * on the last step and toasts only the FIRST blocker. That is the prototype's behaviour and it is
 * deliberate: the flow is a review surface, not a gate.
 */
export function InstallProductDialog({
	open,
	onOpenChange,
	product,
	mode,
	installs,
	persona,
	onApply,
}: InstallProductDialogProps): ReactElement {
	const [step, setStep] = React.useState(0);
	// Flips true when Next is pressed on an incomplete step, so the evidence fields validate inline.
	const [attemptedNext, setAttemptedNext] = React.useState(false);
	// Prod is the strictest target, so the draft opens on it — the prototype's seed.
	const [env, setEnv] = React.useState("Prod");
	const [evidence, setEvidence] = React.useState<EvidenceState>(EMPTY_EVIDENCE);
	const [plan, setPlan] = React.useState<Wc3InstallPlan | null>(null);

	const reset = React.useCallback(() => {
		setStep(0);
		setAttemptedNext(false);
		setEnv("Prod");
		setEvidence(EMPTY_EVIDENCE);
		setPlan(null);
	}, []);

	const productKey = product?.productKey;
	// Re-seed on every open, not only on close: the catalogue reuses one mounted dialog for 17 products.
	React.useEffect(() => {
		if (open) reset();
	}, [open, productKey, mode, reset]);

	const handleOpenChange = (next: boolean) => {
		if (!next) reset();
		onOpenChange(next);
	};

	const gate = product ? roleGate(product, envGateKey(env), persona) : null;

	// The plan the Plan and Apply steps read. Stored on advance; derived when a step is reached with a
	// discarded plan (changing the environment throws it away).
	const activePlan = React.useMemo(
		() => plan ?? (product ? computeInstallPlan(product, env, persona, installs) : null),
		[plan, product, env, persona, installs],
	);

	const missingEvidence = EVIDENCE_FIELDS.filter((f) => evidence[f.key].trim().length === 0);
	const evidenceError = env === "Prod" && missingEvidence.length > 0;
	const showEvidenceError = attemptedNext && step === 2 && evidenceError;

	const changeEnv = (next: string) => {
		// Discards the plan and the error — the gate key, the gate verdict and the readiness blockers
		// all depend on the environment, so a stale plan would lie.
		setEnv(next);
		setPlan(null);
		setAttemptedNext(false);
	};

	const setField = (key: EvidenceKey, value: string) => setEvidence((prev) => ({...prev, [key]: value}));

	const goNext = () => {
		if (!product) return;
		if (step === 2 && evidenceError) {
			setAttemptedNext(true);
			return;
		}
		// Step 0 plans; step 2 RE-plans on the way out ("the store may have moved"), so the Apply step
		// can show blockers the Plan step did not.
		if (step === 0 || step === 2) setPlan(computeInstallPlan(product, env, persona, installs));
		setAttemptedNext(false);
		setStep((value) => value + 1);
	};

	const goBack = () => {
		setAttemptedNext(false);
		setStep((value) => value - 1);
	};

	const apply = () => {
		if (!product) return;
		const fresh = computeInstallPlan(product, env, persona, installs);
		setPlan(fresh);
		if (!fresh.canApply) {
			// Only the first blocker, and the dialog stays open on step 4 with nothing cleared.
			toast.error(fresh.blockers[0].text);
			return;
		}
		if (env === "Prod" && missingEvidence.length > 0) {
			toast.warning(`Prod installs need release evidence — missing: ${missingEvidence.map((f) => f.key).join(", ")}.`);
			return;
		}
		const record = buildInstallRecord(product, env, fresh, persona, evidence);
		onApply(record);
		toast.success(
			`Installed product “${product.displayName}” ${product.version} into ${env} — added ${fresh.objAdd.length} object type(s), ${fresh.ltAdd.length} link type(s), ${fresh.actAdd.length} action type(s)`,
		);
		if (fresh.objCollide.length > 0) {
			toast.warning(
				`${fresh.objCollide.length} object type(s) skipped — API name already taken: ${fresh.objCollide.map((c) => c.apiName).join(", ")}`,
			);
		}
		handleOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="wwc:flex wwc:max-h-[92vh] wwc:w-[calc(100vw-2rem)] wwc:max-w-4xl wwc:flex-col wwc:gap-0 wwc:overflow-hidden wwc:p-0">
				{!product || !gate || !activePlan ? (
					<>
						<DialogHeader>
							<DialogTitle>{mode === "upgrade" ? "Upgrade product" : "Install product"}</DialogTitle>
						</DialogHeader>
						<div className="wwc:px-6 wwc:py-5 wwc:text-sm wwc:text-muted-foreground">
							This product no longer exists.
						</div>
					</>
				) : (
					<>
						<DialogHeader>
							<DialogTitle>{`${mode === "upgrade" ? "Upgrade" : "Install"} ${product.displayName} ${product.version}`}</DialogTitle>
							<span className="wwc:truncate wwc:text-xs wwc:text-muted-foreground">
								{`step ${step + 1} of ${STEPS.length} · acting as ${persona.name} (${persona.lens})`}
							</span>
						</DialogHeader>

						<div className="wwc:border-b wwc:border-border wwc:px-6 wwc:py-4">
							<WizardSteps step={step} />
						</div>

						<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-y-auto wwc:px-6 wwc:py-5">
							{/* ── Step 1 · Draft ── */}
							{step === 0 ? (
								<div className="wwc:space-y-4">
									<p className="wwc:text-sm wwc:text-muted-foreground">
										A WC3 install is a governed three-call lifecycle —{" "}
										<b className="wwc:font-semibold wwc:text-foreground">create install draft</b> →{" "}
										<b className="wwc:font-semibold wwc:text-foreground">plan</b> (preview against the live store) →{" "}
										<b className="wwc:font-semibold wwc:text-foreground">apply</b>. Nothing touches the ontology until
										Apply, and Apply is undoable from the changeset drawer.
									</p>

									<div className="wwc:space-y-1.5">
										<FieldLabel>Target environment</FieldLabel>
										<Select value={env} onValueChange={changeEnv}>
											<SelectTrigger className="wwc:w-56" aria-label="Target environment">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{WC3_PRODUCT_ENVS.map((e) => (
													<SelectItem key={e.env} value={e.env}>
														{e.env} space
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<p className="wwc:text-xs wwc:text-muted-foreground">
											The environment picks which of the manifest&rsquo;s three install gates applies:{" "}
											<span className="wwc:font-mono">{gate.gateKey}</span>. A{" "}
											<b className="wwc:font-semibold wwc:text-foreground">Prod</b> target additionally demands release
											evidence (approver, channel, promotion and rollback runbook refs).
										</p>
									</div>

									<Banner
										variant={gate.ok ? "success" : "danger"}
										title={gate.ok ? gateOkSentence(gate, persona) : gate.reason}
									/>

									<Card>
										<CardHeader className="wwc:p-3 wwc:pb-1.5">
											<CardTitle className="wwc:text-xs wwc:font-semibold">What this draft targets</CardTitle>
										</CardHeader>
										<CardContent className="wwc:p-3 wwc:pt-0">
											<PropertyList labelWidth="9rem">
												<PropertyRow label="Product" align="start">
													<span>{product.displayName}</span>
													<Mono>{product.productKey}</Mono>
													<span>{`${product.version} · ${product.productType}`}</span>
												</PropertyRow>
												<PropertyRow label="Owner enclave">
													<Mono>{product.ownerEnclaveId}</Mono>
												</PropertyRow>
												<PropertyRow label="Declares" align="start">
													{productOutputSummary(product)}
												</PropertyRow>
												<PropertyRow label="Dependencies" align="start">
													{product.dependencies.length > 0 ? (
														product.dependencies
															.map(
																(d) =>
																	`${d.productKey} ${d.versionRange} ${isInstalledIn(installs, d.productKey) ? "(installed)" : "(MISSING)"}`,
															)
															.join(", ")
													) : (
														<MutedNote>none</MutedNote>
													)}
												</PropertyRow>
												<PropertyRow label="Linked products" align="start">
													{product.linkedProducts.length > 0 ? (
														product.linkedProducts.map((l) => `${l.productKey} ${l.version} as ${l.role}`).join(", ")
													) : (
														<MutedNote>none</MutedNote>
													)}
												</PropertyRow>
											</PropertyList>
										</CardContent>
									</Card>
								</div>
							) : null}

							{/* ── Step 2 · Plan ── */}
							{step === 1 ? (
								<div className="wwc:space-y-3" data-install-plan={product.productKey}>
									<div className="wwc:grid wwc:grid-cols-2 wwc:gap-2 wwc:sm:grid-cols-3 wwc:lg:grid-cols-6">
										<MetricCard title="object types ADD" value={activePlan.objAdd.length} />
										<MetricCard
											title="object types COLLIDE"
											value={activePlan.objCollide.length}
											status={activePlan.objCollide.length > 0 ? "warning" : undefined}
										/>
										<MetricCard title="link types ADD" value={activePlan.ltAdd.length} />
										<MetricCard title="action types ADD" value={activePlan.actAdd.length} />
										<MetricCard title="OSDK scopes" value={activePlan.osdkScopes.length} />
										<MetricCard title="app routes" value={activePlan.appRoutes.length} />
									</div>

									<p className="wwc:text-xs wwc:text-muted-foreground">
										{`Computed at ${activePlan.computedAt} against the live store — ${WC3_OBJECT_TYPES.length} object types, ${WC3_LINK_TYPES.length} link types, ${WC3_ACTION_TYPES.length} action types right now.`}
									</p>

									{activePlan.blockers.length > 0 ? (
										<BlockerList blockers={activePlan.blockers} />
									) : (
										<Banner
											variant="success"
											title={`Plan can apply — every gate, dependency and readiness check passes for ${persona.name} against ${env}.`}
										/>
									)}

									{activePlan.objCollide.length > 0 && (
										<Banner
											variant="warning"
											title={`${activePlan.objCollide.length} object type collision(s)`}
											description="These API names already exist in this store and will be SKIPPED, not overwritten:"
											items={activePlan.objCollide.map(
												(c) =>
													`${c.apiName} (held by “${c.owner}”${c.ownerProduct ? `, installed by ${c.ownerProduct}` : ""})`,
											)}
										/>
									)}
									{activePlan.ltCollide.length > 0 && (
										<Banner
											variant="warning"
											title={`${activePlan.ltCollide.length} link type collision(s)`}
											description="These API names already exist in this store and will be SKIPPED, not overwritten:"
											items={activePlan.ltCollide.map((c) => c.apiName)}
										/>
									)}
									{activePlan.actCollide.length > 0 && (
										<Banner
											variant="warning"
											title={`${activePlan.actCollide.length} action type collision(s)`}
											description="These API names already exist in this store and will be SKIPPED, not overwritten:"
											items={activePlan.actCollide.map((c) => c.apiName)}
										/>
									)}

									<div className="wwc:grid wwc:grid-cols-1 wwc:items-start wwc:gap-3 wwc:md:grid-cols-2">
										<PlanCard title={`Object types this apply would create (${activePlan.objAdd.length})`}>
											{activePlan.objAdd.length > 0 ? (
												<div className="wwc:flex wwc:flex-wrap wwc:gap-1.5">
													{activePlan.objAdd.map((s) => (
														<NameChip key={s.apiName} title={`API name it will take: ${s.apiName}`}>
															{s.name}
														</NameChip>
													))}
												</div>
											) : (
												<MutedNote>Nothing new — every declared object type already exists.</MutedNote>
											)}
										</PlanCard>

										<PlanCard title={`Link & action types (${activePlan.ltAdd.length} + ${activePlan.actAdd.length})`}>
											<div className="wwc:flex wwc:flex-wrap wwc:gap-1.5">
												{activePlan.ltAdd.length > 0 ? (
													activePlan.ltAdd.map((s) => (
														<NameChip key={s.apiName} title={`API name it will take: ${s.apiName}`}>
															<Link2 />
															{s.name}
														</NameChip>
													))
												) : (
													<MutedNote>no link types</MutedNote>
												)}
											</div>
											<div className="wwc:mt-1.5 wwc:flex wwc:flex-wrap wwc:gap-1.5">
												{activePlan.actAdd.length > 0 ? (
													activePlan.actAdd.map((s) => (
														<NameChip key={s.apiName} title={`API name it will take: ${s.apiName}`}>
															<Zap />
															{s.name}
														</NameChip>
													))
												) : (
													<MutedNote>no action types</MutedNote>
												)}
											</div>
										</PlanCard>

										<PlanCard title={`Apply order (${activePlan.applySteps.length})`}>
											<StepList steps={activePlan.applySteps} />
										</PlanCard>
										<PlanCard title={`Rollback order (${activePlan.rollbackSteps.length})`}>
											<StepList steps={activePlan.rollbackSteps} />
										</PlanCard>
									</div>
								</div>
							) : null}

							{/* ── Step 3 · Release evidence ── */}
							{step === 2 ? (
								<div className="wwc:space-y-4">
									{env === "Prod" ? (
										<Banner
											variant="warning"
											title="A Prod install cannot apply without release evidence — the approver and the two runbook refs are recorded on the install and shown in its lifecycle."
										/>
									) : (
										<p className="wwc:text-sm wwc:text-muted-foreground">
											{`Release evidence is not required for a `}
											<b className="wwc:font-semibold wwc:text-foreground">{env}</b>
											{` install, but anything you enter is still recorded against the install record.`}
										</p>
									)}

									<div className="wwc:grid wwc:grid-cols-1 wwc:gap-x-8 wwc:gap-y-5 wwc:md:grid-cols-2">
										{EVIDENCE_FIELDS.map((field) => {
											const invalid = showEvidenceError && evidence[field.key].trim().length === 0;
											return (
												<div key={field.key} className="wwc:space-y-1.5">
													<FieldLabel>
														{field.label}
														{env === "Prod" ? " *" : ""}
													</FieldLabel>
													<Input
														value={evidence[field.key]}
														placeholder={field.placeholder}
														onChange={(event) => setField(field.key, event.target.value)}
														aria-invalid={invalid}
														className={cn(
															field.mono && "wwc:font-mono",
															invalid && "wwc:border-destructive wwc:focus-visible:ring-destructive",
														)}
													/>
													<p className="wwc:text-xs wwc:text-muted-foreground">{field.hint}</p>
												</div>
											);
										})}
									</div>

									{/* One aggregated line, not four — the prototype has no per-field message. */}
									{showEvidenceError && (
										<p className="wwc:text-xs wwc:text-destructive">
											{`A Prod install needs its release evidence — missing: ${missingEvidence.map((f) => f.errorLabel).join(", ")}.`}
										</p>
									)}
								</div>
							) : null}

							{/* ── Step 4 · Apply ── */}
							{step === 3 ? (
								<div className="wwc:space-y-3">
									{activePlan.canApply ? (
										<Banner
											variant="success"
											title={`Ready to apply. This records a governed install of ${activePlan.objAdd.length} object type(s), ${activePlan.ltAdd.length} link type(s) and ${activePlan.actAdd.length} action type(s) under the provenance of ${product.displayName} ${product.version}.`}
											description={`The shared ontology fixture is a module constant, so this port writes the install record rather than mutating the store — the Ontology perspective still lists ${WC3_OBJECT_TYPES.length} object types.`}
										/>
									) : (
										<BlockerList blockers={activePlan.blockers} />
									)}

									<Card>
										<CardHeader className="wwc:p-3 wwc:pb-1.5">
											<CardTitle className="wwc:text-xs wwc:font-semibold">Install summary</CardTitle>
										</CardHeader>
										<CardContent className="wwc:p-3 wwc:pt-0">
											<PropertyList labelWidth="10rem">
												<PropertyRow label="Product" align="start">
													<span>{product.displayName}</span>
													<Mono>{`${product.productKey} ${product.version}`}</Mono>
												</PropertyRow>
												<PropertyRow label="Environment" align="start">
													<span>
														{`${env} — gate `}
														<span className="wwc:font-mono">{activePlan.gateKey}</span>
														{activePlan.perm.ok
															? ` satisfied by ${activePlan.perm.matched.join(", ")}`
															: " NOT satisfied"}
													</span>
												</PropertyRow>
												<PropertyRow label="Acting principal" align="start">
													{`${persona.name} · ${persona.lens} · roles ${personaRoles(persona).join(", ") || "none"}`}
												</PropertyRow>
												<PropertyRow label="Approved by">
													{evidence.approvedBy.trim() ? evidence.approvedBy : <MutedNote>not supplied</MutedNote>}
												</PropertyRow>
												<PropertyRow label="Release channel">
													<Mono>{evidence.releaseChannel.trim() || "—"}</Mono>
												</PropertyRow>
												<PropertyRow label="Promotion runbook" align="start">
													<Mono>{evidence.promotionRunbookRef.trim() || "—"}</Mono>
												</PropertyRow>
												<PropertyRow label="Rollback runbook" align="start">
													<Mono>{evidence.rollbackRunbookRef.trim() || "—"}</Mono>
												</PropertyRow>
												<PropertyRow label="Skipped on collision">
													{`${activePlan.objCollide.length + activePlan.ltCollide.length + activePlan.actCollide.length} primitive(s)`}
												</PropertyRow>
											</PropertyList>
										</CardContent>
									</Card>
								</div>
							) : null}
						</div>

						<DialogFooter>
							<span className="wwc:text-sm wwc:text-muted-foreground">
								Step {step + 1} of {STEPS.length}
							</span>
							<div className="wwc:flex wwc:items-center wwc:gap-2">
								{step > 0 ? (
									<Button variant="outline" onClick={goBack}>
										← Back
									</Button>
								) : null}
								{step === 0 ? (
									<Button onClick={goNext} data-install-next={step}>
										<Play />
										Plan
									</Button>
								) : step < STEPS.length - 1 ? (
									<Button onClick={goNext} data-install-next={step}>
										Next →
									</Button>
								) : (
									<Button onClick={apply} data-install-apply={product.productKey}>
										<Check />
										Apply install
									</Button>
								)}
							</div>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}

// ─── Record ──────────────────────────────────────────────────────────────────

/**
 * The install record an apply would have written, shaped exactly like the four seeded WC3_INSTALLS so
 * the detail page's Installs section renders it without a special case.
 *
 * `addedObjectTypes` / `addedLinkTypes` / `addedActionTypes` carry the API names the plan reserved,
 * not live ontology ids — nothing was created, because WC3_OBJECT_TYPES is a module constant shared
 * with the Ontology perspective. Reporting the reserved names keeps the record's counts honest to the
 * plan; a consumer that resolves them against the live ontology will (correctly) find them absent.
 */
function buildInstallRecord(
	p: Wc3Product,
	env: string,
	plan: Wc3InstallPlan,
	persona: Wc3Persona,
	evidence: EvidenceState,
): Wc3Install {
	const when = nowStr();
	const collisions = plan.objCollide.length + plan.ltCollide.length + plan.actCollide.length;
	return {
		id: `inst_${Math.floor(1000 + Math.random() * 9000)}`,
		productKey: p.productKey,
		version: p.version,
		productType: p.productType,
		environment: env,
		status: "applied",
		baseline: false,
		approvedBy: evidence.approvedBy.trim(),
		releaseChannel: evidence.releaseChannel.trim(),
		promotionRunbookRef: evidence.promotionRunbookRef.trim(),
		rollbackRunbookRef: evidence.rollbackRunbookRef.trim(),
		installedBy: persona.name,
		installedByLens: persona.lens,
		when,
		ts: Date.now(),
		addedObjectTypes: plan.objAdd.map((s) => s.apiName),
		addedLinkTypes: plan.ltAdd.map((s) => s.apiName),
		addedActionTypes: plan.actAdd.map((s) => s.apiName),
		skipped: {
			objectTypes: plan.objCollide.map((c) => c.apiName),
			linkTypes: plan.ltCollide.map((c) => c.apiName),
			actionTypes: plan.actCollide.map((c) => c.apiName),
		},
		plan,
		lifecycle: [
			{
				step: "create install draft",
				by: persona.name,
				when: plan.computedAt,
				detail: `${p.productKey} ${p.version} → ${env}`,
			},
			{
				step: "plan (preview)",
				by: persona.name,
				when: plan.computedAt,
				detail: `${plan.objAdd.length} object type(s), ${plan.ltAdd.length} link type(s), ${plan.actAdd.length} action type(s) to add · ${collisions} collision(s) skipped`,
			},
			{
				step: "apply",
				by: persona.name,
				when,
				detail: `gate ${plan.gateKey} satisfied by ${plan.perm.matched.join(", ") || "n/a"}`,
			},
		],
	};
}
