import {cn} from "@corensystem/coren-utils";
import {
	AlertTriangle,
	Award,
	BookOpen,
	Check,
	ClipboardList,
	Clock,
	CreditCard,
	Crosshair,
	Eye,
	FileText,
	HardHat,
	Home,
	Map,
	MapPin,
	Mic,
	Trash2,
	Truck,
	User,
	Users,
} from "lucide-react";
import * as React from "react";

import {Badge} from "./badge";
import {Button} from "./button";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "./dialog";
import {Input} from "./input";
import {Label} from "./label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./select";
import {toast} from "./sonner";
import {Stepper, StepperIndicator, StepperItem, StepperLabel, StepperList, StepperSeparator} from "./stepper";
import {Switch} from "./switch";
import {Textarea} from "./textarea";
import {ToggleGroup, ToggleGroupItem} from "./toggle-group";

// NewObjectTypeDialog — a four-step wizard (Metadata → Datasource → Properties → Review) for authoring
// an ontology object type, shown in a Dialog. Composed entirely from existing Core primitives:
// the built-in Stepper for the step header, plus Input, ToggleGroup, Select, Switch, Badge, and Button.
// Required Metadata fields validate inline (Next is never disabled). Data is caller-supplied; on the
// final step it emits a NewObjectTypeDraft via onCreate.

// ─── Option sets ─────────────────────────────────────────────────────────────

const STATUSES = ["Active", "Experimental", "Deprecated", "Endorsed"] as const;
const VISIBILITIES = ["Prominent", "Normal", "Hidden"] as const;
const LAYERS = ["L1 core", "L2 module", "L3 enclave", "L4 runtime"] as const;
const BASE_TYPES = ["string", "integer", "double", "boolean", "date", "timestamp", "geopoint", "array"];

type ObjectTypeStatus = (typeof STATUSES)[number];
type ObjectTypeVisibility = (typeof VISIBILITIES)[number];
type ObjectTypeLayer = (typeof LAYERS)[number];

/** Icon choices — the same lucide set the object-type table draws from. Index matches `NewObjectTypeDraft.iconIndex`. */
export const NEW_OBJECT_TYPE_ICONS: React.ComponentType<{className?: string}>[] = [
	User,
	Users,
	HardHat,
	Award,
	Clock,
	Map,
	CreditCard,
	Eye,
	Home,
	MapPin,
	Truck,
	FileText,
	BookOpen,
	Crosshair,
	ClipboardList,
	Mic,
];

/** Colour swatches for the object-type tile. */
const COLOR_CHOICES = [
	"wwc:bg-sky-400",
	"wwc:bg-blue-500",
	"wwc:bg-indigo-500",
	"wwc:bg-violet-500",
	"wwc:bg-fuchsia-500",
	"wwc:bg-pink-500",
	"wwc:bg-red-500",
	"wwc:bg-orange-500",
	"wwc:bg-amber-500",
	"wwc:bg-lime-500",
	"wwc:bg-emerald-500",
	"wwc:bg-teal-500",
	"wwc:bg-slate-500",
	"wwc:bg-slate-900",
];

const DEFAULT_GROUPS = [
	"People & Crews",
	"Compliance & Safety",
	"Access Control",
	"Sites & Projects",
	"Time & Attendance",
];

// ─── Datasources ─────────────────────────────────────────────────────────────

export type DatasourceKind = "Dataset" | "Stream" | "Restricted view" | "Media set";

export interface DatasourceDef {
	id: string;
	kind: DatasourceKind;
	name: string;
	columns: string[];
	/** Re-syncs with repeated keys — surfaces a primary-key warning downstream. */
	duplicateKeys?: boolean;
}

const DEFAULT_DATASOURCES: DatasourceDef[] = [
	{
		id: "hr_roster_daily_sync",
		kind: "Dataset",
		name: "hr_roster_daily_sync",
		columns: [
			"worker_id",
			"full_name",
			"badge_number",
			"trade_id",
			"crew_id",
			"subcontractor_id",
			"employment_status",
			"hire_date",
		],
		duplicateKeys: true,
	},
	{
		id: "badge_swipe_event_stream",
		kind: "Stream",
		name: "badge_swipe_event_stream",
		columns: ["event_id", "badge_number", "zone_code", "swiped_at"],
	},
	{
		id: "training_cert_registry",
		kind: "Dataset",
		name: "training_cert_registry",
		columns: ["cert_id", "worker_id", "cert_kind", "course_id", "issued_on", "expires_on", "status"],
	},
	{
		id: "site_zone_master",
		kind: "Dataset",
		name: "site_zone_master",
		columns: ["zone_id", "zone_name", "site_id", "hazard_class", "zone_status", "max_occupancy"],
	},
	{
		id: "visitor_log_restricted_view",
		kind: "Restricted view",
		name: "visitor_log_restricted_view",
		columns: ["pass_id", "visitor_name", "host_worker_id", "valid_on"],
	},
	{
		id: "site_induction_photo_set",
		kind: "Media set",
		name: "site_induction_photo_set",
		columns: ["media_id", "worker_id", "captured_at"],
	},
	{
		id: "safety_observation_stream",
		kind: "Stream",
		name: "safety_observation_stream",
		columns: ["observation_id", "zone_id", "reported_by", "severity", "observed_at"],
	},
	{
		id: "timesheet_approved_daily",
		kind: "Dataset",
		name: "timesheet_approved_daily",
		columns: ["entry_id", "worker_id", "shift_id", "work_date", "hours_logged", "approval_status"],
	},
	{
		id: "wearable_tag_telemetry",
		kind: "Stream",
		name: "wearable_tag_telemetry",
		columns: ["tag_id", "battery_pct", "geo_location", "last_seen_at"],
	},
];

// ─── Property rows ───────────────────────────────────────────────────────────

interface WizardProperty {
	id: string;
	displayName: string;
	apiName: string;
	baseType: string;
	required: boolean;
	isPrimaryKey: boolean;
	isTitle: boolean;
}

/** The value emitted when the wizard completes. */
export interface NewObjectTypeDraft {
	displayName: string;
	pluralName: string;
	apiName: string;
	description: string;
	status: ObjectTypeStatus;
	visibility: ObjectTypeVisibility;
	layer: ObjectTypeLayer;
	groups: string[];
	iconIndex: number;
	colorIndex: number;
	datasourceIds: string[];
	properties: WizardProperty[];
	/** True when an attached datasource re-syncs with repeated keys. */
	hasDuplicateKeys: boolean;
}

const STEPS = ["Metadata", "Datasource", "Properties", "Review"] as const;

/** Blue accent for a selected/active choice — matches the wizard's design (distinct from the app's near-black primary). */
const ACCENT_ON = "wwc:border-blue-500 wwc:bg-blue-500/10 wwc:text-blue-600 wwc:dark:text-blue-400";
/** Selected-segment tint for ToggleGroup items (keyed off `data-state=on`). */
const SEGMENT_ON =
	"wwc:data-[state=on]:border-blue-500 wwc:data-[state=on]:bg-blue-500/10 wwc:data-[state=on]:text-blue-600 wwc:dark:data-[state=on]:text-blue-400";

// ─── Step header ─────────────────────────────────────────────────────────────

/** Core's built-in Stepper, laid out horizontally across the four wizard steps. */
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

/** Uppercase field label used throughout the wizard. */
function FieldLabel({children}: {children: React.ReactNode}) {
	return (
		<Label className="wwc:text-xs wwc:font-semibold wwc:tracking-wide wwc:text-muted-foreground wwc:uppercase">
			{children}
		</Label>
	);
}

// ─── Wizard ──────────────────────────────────────────────────────────────────

export interface NewObjectTypeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Group facets offered on the Metadata step. */
	groups?: string[];
	/** Datasources offered on the Datasource step. */
	datasources?: DatasourceDef[];
	/**
	 * Icon palette for the tile. `NewObjectTypeDraft.iconIndex` indexes into THIS array, so a caller
	 * with its own glyph set can map the index straight back to its own icon name.
	 */
	icons?: React.ComponentType<{className?: string}>[];
	/** Property base types offered on the Properties step. Defaults to the eight common ones. */
	baseTypes?: string[];
	/** Show the L1–L4 layer selector. Off for ontologies that have no layer concept. */
	showLayer?: boolean;
	/** Fired with the assembled draft when "Create object type" is pressed. */
	onCreate?: (draft: NewObjectTypeDraft) => void;
	/**
	 * Extra fields for the FIRST step, above the wizard's own. For a host that has to ask something
	 * before the type itself is described — where the record should be filed, say. The wizard neither
	 * reads nor validates them: it renders them and leaves them to the host that supplied them.
	 */
	leadingFields?: React.ReactNode;
}

/** Four-step "New object type" wizard rendered in a Dialog. */
export function NewObjectTypeDialog({
	open,
	onOpenChange,
	groups = DEFAULT_GROUPS,
	datasources = DEFAULT_DATASOURCES,
	icons = NEW_OBJECT_TYPE_ICONS,
	baseTypes = BASE_TYPES,
	showLayer = true,
	onCreate,
	leadingFields,
}: NewObjectTypeDialogProps) {
	const [step, setStep] = React.useState(0);
	// Flips true when Next is pressed on an incomplete Metadata step, so required fields validate inline.
	const [attemptedNext, setAttemptedNext] = React.useState(false);

	// Metadata
	const [displayName, setDisplayName] = React.useState("");
	const [pluralName, setPluralName] = React.useState("");
	const [apiName, setApiName] = React.useState("");
	const [description, setDescription] = React.useState("");
	const [status, setStatus] = React.useState<ObjectTypeStatus>("Experimental");
	const [visibility, setVisibility] = React.useState<ObjectTypeVisibility>("Normal");
	const [layer, setLayer] = React.useState<ObjectTypeLayer>("L3 enclave");
	const [selectedGroups, setSelectedGroups] = React.useState<string[]>([]);
	const [iconIndex, setIconIndex] = React.useState(0);
	const [colorIndex, setColorIndex] = React.useState(1);

	// Datasource
	const [attached, setAttached] = React.useState<string[]>([]);

	// Properties
	const [properties, setProperties] = React.useState<WizardProperty[]>([]);
	const propCounter = React.useRef(0);

	const reset = React.useCallback(() => {
		setStep(0);
		setDisplayName("");
		setPluralName("");
		setApiName("");
		setDescription("");
		setStatus("Experimental");
		setVisibility("Normal");
		setLayer("L3 enclave");
		setSelectedGroups([]);
		setIconIndex(0);
		setColorIndex(1);
		setAttached([]);
		setProperties([]);
		propCounter.current = 0;
		setAttemptedNext(false);
	}, []);

	const handleOpenChange = (next: boolean) => {
		if (!next) reset();
		onOpenChange(next);
	};

	const attachedSources = datasources.filter((source) => attached.includes(source.id));
	const firstDataset = attachedSources.find((source) => source.kind === "Dataset") ?? attachedSources[0];
	const hasDuplicateKeys = attachedSources.some((source) => source.duplicateKeys);
	const metadataValid = displayName.trim().length > 0 && apiName.trim().length > 0;
	const displayNameError = attemptedNext && step === 0 && displayName.trim().length === 0;
	const apiNameError = attemptedNext && step === 0 && apiName.trim().length === 0;
	const datasourceError = attemptedNext && step === 1 && attached.length === 0;
	const propertiesError = attemptedNext && step === 2 && properties.length === 0;

	const goNext = () => {
		// Don't block the button — clicking it reveals the step's inline error and holds until it's satisfied.
		const invalid =
			(step === 0 && !metadataValid) ||
			(step === 1 && attached.length === 0) ||
			(step === 2 && properties.length === 0);
		if (invalid) {
			setAttemptedNext(true);
			return;
		}
		setAttemptedNext(false);
		setStep((value) => value + 1);
	};

	const goBack = () => {
		setAttemptedNext(false);
		setStep((value) => value - 1);
	};

	const addProperty = () => {
		propCounter.current += 1;
		const n = propCounter.current;
		const first = properties.length === 0;
		setProperties((prev) => [
			...prev,
			{
				id: `p-${n}`,
				displayName: `New property ${n}`,
				apiName: `newProperty${n}`,
				baseType: "string",
				required: true,
				isPrimaryKey: first,
				isTitle: first,
			},
		]);
	};

	const generateFromColumns = () => {
		if (!firstDataset) return;
		setProperties(
			firstDataset.columns.map((column, index) => ({
				id: `gen-${column}`,
				displayName: column
					.split("_")
					.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
					.join(" "),
				apiName: column.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()),
				baseType: "string",
				required: index === 0,
				isPrimaryKey: index === 0,
				isTitle: index === 1 || (firstDataset.columns.length === 1 && index === 0),
			})),
		);
	};

	const updateProperty = (id: string, patch: Partial<WizardProperty>) => {
		setProperties((prev) => prev.map((property) => (property.id === id ? {...property, ...patch} : property)));
	};

	const setSinglePrimaryKey = (id: string) => {
		setProperties((prev) => prev.map((property) => ({...property, isPrimaryKey: property.id === id})));
	};

	const setSingleTitle = (id: string) => {
		setProperties((prev) => prev.map((property) => ({...property, isTitle: property.id === id})));
	};

	const removeProperty = (id: string) => {
		setProperties((prev) => prev.filter((property) => property.id !== id));
	};

	const create = () => {
		onCreate?.({
			displayName: displayName.trim(),
			pluralName: pluralName.trim(),
			apiName: apiName.trim(),
			description: description.trim(),
			status,
			visibility,
			layer,
			groups: selectedGroups,
			iconIndex,
			colorIndex,
			datasourceIds: attached,
			properties,
			hasDuplicateKeys,
		});
		toast.success(`Object type “${displayName.trim()}” created`);
		handleOpenChange(false);
	};

	const primaryKey = properties.find((property) => property.isPrimaryKey);
	const titleKey = properties.find((property) => property.isTitle);

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="wwc:flex wwc:max-h-[92vh] wwc:w-[calc(100vw-2rem)] wwc:max-w-4xl wwc:flex-col wwc:gap-0 wwc:overflow-hidden wwc:p-0">
				<DialogHeader>
					<DialogTitle>New object type</DialogTitle>
				</DialogHeader>

				<div className="wwc:border-b wwc:border-border wwc:px-6 wwc:py-4">
					<WizardSteps step={step} />
				</div>

				<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-y-auto wwc:px-6 wwc:py-5">
					{step === 0 ? (
						<div className="wwc:grid wwc:grid-cols-1 wwc:gap-x-8 wwc:gap-y-5 wwc:md:grid-cols-2">
							{/* The host's own fields lead the step, spanning both columns: they are asked before the
							    type is described, not alongside it. */}
							{leadingFields && <div className="wwc:space-y-1.5 wwc:md:col-span-2">{leadingFields}</div>}
							<div className="wwc:space-y-1.5">
								<FieldLabel>Display name</FieldLabel>
								<Input
									value={displayName}
									onChange={(event) => setDisplayName(event.target.value)}
									aria-invalid={displayNameError}
									className={cn(displayNameError && "wwc:border-destructive wwc:focus-visible:ring-destructive")}
								/>
								{displayNameError ? (
									<p className="wwc:text-xs wwc:text-destructive">Display name is required.</p>
								) : (
									<p className="wwc:text-xs wwc:text-muted-foreground">e.g. “Induction session”</p>
								)}
							</div>
							<div className="wwc:space-y-1.5">
								<FieldLabel>API name</FieldLabel>
								<Input
									value={apiName}
									onChange={(event) => setApiName(event.target.value)}
									aria-invalid={apiNameError}
									className={cn(apiNameError && "wwc:border-destructive wwc:focus-visible:ring-destructive")}
								/>
								{apiNameError ? (
									<p className="wwc:text-xs wwc:text-destructive">API name is required.</p>
								) : (
									<p className="wwc:text-xs wwc:text-muted-foreground">PascalCase, stable forever</p>
								)}
							</div>

							<div className="wwc:space-y-1.5">
								<FieldLabel>Plural display name</FieldLabel>
								<Input value={pluralName} onChange={(event) => setPluralName(event.target.value)} />
							</div>
							<div className="wwc:space-y-1.5">
								<FieldLabel>Description</FieldLabel>
								<Textarea rows={2} value={description} onChange={(event) => setDescription(event.target.value)} />
								<p className="wwc:text-xs wwc:text-muted-foreground">
									Every element carries a description (best practice #8)
								</p>
							</div>

							<div className="wwc:space-y-2">
								<FieldLabel>Status</FieldLabel>
								<ToggleGroup
									type="single"
									value={status}
									onValueChange={(value) => value && setStatus(value as ObjectTypeStatus)}
									variant="outline"
									size="sm"
									className="wwc:justify-start"
								>
									{STATUSES.map((option) => (
										<ToggleGroupItem key={option} value={option} className={SEGMENT_ON}>
											{option}
										</ToggleGroupItem>
									))}
								</ToggleGroup>

								<FieldLabel>Visibility</FieldLabel>
								<ToggleGroup
									type="single"
									value={visibility}
									onValueChange={(value) => value && setVisibility(value as ObjectTypeVisibility)}
									variant="outline"
									size="sm"
									className="wwc:justify-start"
								>
									{VISIBILITIES.map((option) => (
										<ToggleGroupItem key={option} value={option} className={SEGMENT_ON}>
											{option}
										</ToggleGroupItem>
									))}
								</ToggleGroup>

								{showLayer && <FieldLabel>Layer</FieldLabel>}
								<ToggleGroup
									type="single"
									value={layer}
									onValueChange={(value) => value && setLayer(value as ObjectTypeLayer)}
									variant="outline"
									size="sm"
									className={cn("wwc:justify-start", !showLayer && "wwc:hidden")}
								>
									{LAYERS.map((option) => (
										<ToggleGroupItem key={option} value={option} className={SEGMENT_ON}>
											{option}
										</ToggleGroupItem>
									))}
								</ToggleGroup>
								<p className="wwc:text-xs wwc:text-muted-foreground">
									New types authored here default to the enclave layer
								</p>

								<FieldLabel>Groups</FieldLabel>
								<ToggleGroup
									type="multiple"
									value={selectedGroups}
									onValueChange={setSelectedGroups}
									variant="outline"
									size="sm"
									className="wwc:flex-wrap wwc:justify-start wwc:gap-2"
								>
									{groups.map((group) => (
										<ToggleGroupItem key={group} value={group} className={cn("wwc:rounded-full", SEGMENT_ON)}>
											{group}
										</ToggleGroupItem>
									))}
								</ToggleGroup>
							</div>

							<div className="wwc:space-y-2">
								<FieldLabel>Icon</FieldLabel>
								<div className="wwc:grid wwc:grid-cols-8 wwc:gap-2">
									{icons.map((Icon, index) => (
										<button
											key={(Icon as {displayName?: string}).displayName ?? index}
											type="button"
											aria-label={`Icon ${index + 1}`}
											aria-pressed={index === iconIndex}
											onClick={() => setIconIndex(index)}
											className={cn(
												"wwc:flex wwc:aspect-square wwc:items-center wwc:justify-center wwc:rounded-lg wwc:border wwc:transition-colors",
												index === iconIndex
													? ACCENT_ON
													: "wwc:border-border wwc:text-muted-foreground wwc:hover:bg-muted",
											)}
										>
											<Icon className="wwc:h-4 wwc:w-4" />
										</button>
									))}
								</div>

								<FieldLabel>Color</FieldLabel>
								<div className="wwc:flex wwc:flex-wrap wwc:gap-2">
									{COLOR_CHOICES.map((color, index) => (
										<button
											key={color}
											type="button"
											aria-label={`Color ${index + 1}`}
											aria-pressed={index === colorIndex}
											onClick={() => setColorIndex(index)}
											className={cn(
												"wwc:h-7 wwc:w-7 wwc:rounded-lg wwc:ring-offset-2 wwc:ring-offset-background wwc:transition-shadow",
												color,
												index === colorIndex && "wwc:ring-2 wwc:ring-foreground",
											)}
										/>
									))}
								</div>
							</div>
						</div>
					) : null}

					{step === 1 ? (
						<div className="wwc:space-y-3">
							<p className="wwc:text-sm wwc:text-muted-foreground">
								Attach one or more backing datasources. A dataset with duplicate keys will surface a primary-key warning
								in step 3.
							</p>
							{datasourceError ? (
								<p className="wwc:text-sm wwc:text-destructive">Attach at least one datasource to continue.</p>
							) : null}
							{datasources.map((source) => {
								const isAttached = attached.includes(source.id);
								return (
									<div
										key={source.id}
										className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-4 wwc:rounded-lg wwc:border wwc:border-border wwc:p-4"
									>
										<div className="wwc:min-w-0">
											<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
												<Badge
													variant="secondary"
													className="wwc:h-5 wwc:text-[10px] wwc:font-semibold wwc:tracking-wide wwc:uppercase"
												>
													{source.kind}
												</Badge>
												<span className="wwc:font-mono wwc:text-sm wwc:font-semibold">{source.name}</span>
												{source.duplicateKeys ? (
													<span className="wwc:inline-flex wwc:items-center wwc:gap-1 wwc:font-mono wwc:text-xs wwc:font-semibold wwc:text-amber-600 wwc:dark:text-amber-500">
														<AlertTriangle className="wwc:h-3.5 wwc:w-3.5" />
														duplicate keys
													</span>
												) : null}
											</div>
											<p className="wwc:mt-1 wwc:truncate wwc:text-xs wwc:text-muted-foreground">
												columns: {source.columns.join(", ")}
											</p>
										</div>
										<Button
											variant={isAttached ? "outline" : "default"}
											size="sm"
											className="wwc:shrink-0"
											onClick={() =>
												setAttached((prev) =>
													isAttached ? prev.filter((id) => id !== source.id) : [...prev, source.id],
												)
											}
										>
											{isAttached ? "Detach" : "Attach"}
										</Button>
									</div>
								);
							})}
						</div>
					) : null}

					{step === 2 ? (
						<div className="wwc:space-y-4">
							<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-3">
								<Button variant="outline" size="sm" onClick={addProperty}>
									+ Add property
								</Button>
								{firstDataset ? (
									<Button variant="outline" size="sm" onClick={generateFromColumns}>
										Generate from “{firstDataset.name}” columns
									</Button>
								) : null}
								<span className="wwc:ml-auto wwc:text-sm wwc:text-muted-foreground">
									{properties.length} properties · pick primary key + title key
								</span>
							</div>

							{propertiesError ? (
								<p className="wwc:text-sm wwc:text-destructive">Add at least one property to continue.</p>
							) : null}

							{hasDuplicateKeys ? (
								<div className="wwc:rounded-lg wwc:border wwc:border-amber-500/30 wwc:bg-amber-500/10 wwc:p-4 wwc:text-sm wwc:text-amber-700 wwc:dark:text-amber-300">
									<span className="wwc:inline-flex wwc:items-center wwc:gap-2 wwc:font-semibold">
										<AlertTriangle className="wwc:h-4 wwc:w-4" />
										Duplicate primary keys detected.
									</span>{" "}
									A backing datasource re-syncs rows and contains repeated keys. Confirm your key choice is stable and
									deterministic (best practice #4) or de-duplicate upstream.
								</div>
							) : null}

							{properties.length === 0 ? (
								<div className="wwc:rounded-lg wwc:border wwc:border-dashed wwc:border-border wwc:p-8 wwc:text-center wwc:text-sm wwc:text-muted-foreground">
									No properties yet. Add one, or generate them from an attached dataset’s columns.
								</div>
							) : (
								<div className="wwc:overflow-x-auto wwc:rounded-lg wwc:border wwc:border-border">
									<table className="wwc:w-full wwc:text-sm">
										<thead>
											<tr className="wwc:border-b wwc:border-border wwc:text-left wwc:text-xs wwc:font-semibold wwc:tracking-wide wwc:text-muted-foreground wwc:uppercase">
												<th className="wwc:px-3 wwc:py-2">PK</th>
												<th className="wwc:px-3 wwc:py-2">Title</th>
												<th className="wwc:px-3 wwc:py-2">Display name</th>
												<th className="wwc:px-3 wwc:py-2">API name</th>
												<th className="wwc:px-3 wwc:py-2">Base type</th>
												<th className="wwc:px-3 wwc:py-2">Req.</th>
												<th className="wwc:px-3 wwc:py-2">
													<span className="wwc:sr-only">Actions</span>
												</th>
											</tr>
										</thead>
										<tbody>
											{properties.map((property) => (
												<tr key={property.id} className="wwc:border-b wwc:border-border wwc:last:border-0">
													<td className="wwc:px-3 wwc:py-2">
														<Button
															variant="outline"
															size="sm"
															className={cn(
																"wwc:h-7 wwc:gap-1 wwc:px-2 wwc:text-xs",
																property.isPrimaryKey && ACCENT_ON,
															)}
															aria-pressed={property.isPrimaryKey}
															onClick={() => setSinglePrimaryKey(property.id)}
														>
															PK {property.isPrimaryKey ? <Check className="wwc:h-3 wwc:w-3" /> : null}
														</Button>
													</td>
													<td className="wwc:px-3 wwc:py-2">
														<Button
															variant="outline"
															size="sm"
															className={cn("wwc:h-7 wwc:gap-1 wwc:px-2 wwc:text-xs", property.isTitle && ACCENT_ON)}
															aria-pressed={property.isTitle}
															onClick={() => setSingleTitle(property.id)}
														>
															Title {property.isTitle ? <Check className="wwc:h-3 wwc:w-3" /> : null}
														</Button>
													</td>
													<td className="wwc:px-3 wwc:py-2">
														<Input
															value={property.displayName}
															onChange={(event) => updateProperty(property.id, {displayName: event.target.value})}
															className="wwc:h-8 wwc:min-w-[9rem]"
														/>
													</td>
													<td className="wwc:px-3 wwc:py-2">
														<Input
															value={property.apiName}
															onChange={(event) => updateProperty(property.id, {apiName: event.target.value})}
															className="wwc:h-8 wwc:min-w-[9rem] wwc:font-mono"
														/>
													</td>
													<td className="wwc:px-3 wwc:py-2">
														<Select
															value={property.baseType}
															onValueChange={(value) => updateProperty(property.id, {baseType: value})}
														>
															<SelectTrigger aria-label="Base type" className="wwc:h-8 wwc:w-[8.5rem]">
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																{baseTypes.map((type) => (
																	<SelectItem key={type} value={type}>
																		{type}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</td>
													<td className="wwc:px-3 wwc:py-2">
														<Switch
															checked={property.required}
															onCheckedChange={(checked) => updateProperty(property.id, {required: checked})}
															aria-label="Required"
														/>
													</td>
													<td className="wwc:px-3 wwc:py-2 wwc:text-right">
														<Button
															variant="ghost"
															size="sm"
															icon
															aria-label="Delete property"
															className="wwc:h-7 wwc:w-7 wwc:text-muted-foreground"
															onClick={() => removeProperty(property.id)}
														>
															<Trash2 className="wwc:h-4 wwc:w-4" />
														</Button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</div>
					) : null}

					{step === 3 ? (
						<div className="wwc:space-y-5">
							<div className="wwc:rounded-lg wwc:border wwc:border-emerald-500/30 wwc:bg-emerald-500/10 wwc:p-4 wwc:text-sm wwc:text-emerald-700 wwc:dark:text-emerald-300">
								<span className="wwc:font-medium">✓ Review</span> — this object type will be created
								{showLayer ? (
									<>
										{" "}
										into the <span className="wwc:font-semibold">{layer.split(" ")[0]}</span> layer
									</>
								) : null}{" "}
								with an auto-generated RID.
							</div>

							<dl className="wwc:grid wwc:grid-cols-[10rem_1fr] wwc:gap-x-4 wwc:gap-y-3 wwc:text-sm">
								<dt className="wwc:text-muted-foreground">Display / Plural</dt>
								<dd>
									<span className="wwc:font-semibold">{displayName || "—"}</span> / {pluralName || "—"}
								</dd>
								<dt className="wwc:text-muted-foreground">API name</dt>
								<dd>{apiName || "—"}</dd>
								<dt className="wwc:text-muted-foreground">Description</dt>
								<dd>{description || "—"}</dd>
								<dt className="wwc:text-muted-foreground">Status / Visibility</dt>
								<dd className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5">
									<Badge variant="secondary" className="wwc:h-5 wwc:text-xs">
										{status}
									</Badge>
									· {visibility}
									{showLayer ? (
										<>
											{" · "}
											<Badge variant="secondary" className="wwc:h-5 wwc:text-xs">
												{layer.split(" ")[0]}
											</Badge>
										</>
									) : null}
								</dd>
								<dt className="wwc:text-muted-foreground">Datasources</dt>
								<dd>
									{attachedSources.length === 0
										? "—"
										: attachedSources.map((source) => `${source.kind} “${source.name}”`).join(", ")}
								</dd>
								<dt className="wwc:text-muted-foreground">Properties</dt>
								<dd>
									{properties.length} {primaryKey ? `(PK: ${primaryKey.apiName}` : ""}
									{primaryKey && titleKey ? `, title: ${titleKey.apiName})` : primaryKey ? ")" : ""}
								</dd>
								<dt className="wwc:text-muted-foreground">Groups</dt>
								<dd>{selectedGroups.length === 0 ? "—" : selectedGroups.join(", ")}</dd>
							</dl>

							{hasDuplicateKeys ? (
								<div className="wwc:rounded-lg wwc:border wwc:border-amber-500/30 wwc:bg-amber-500/10 wwc:p-4 wwc:text-sm wwc:text-amber-700 wwc:dark:text-amber-300">
									<span className="wwc:inline-flex wwc:items-center wwc:gap-2">
										<AlertTriangle className="wwc:h-4 wwc:w-4" />
										Heads-up: an attached datasource has duplicate keys — the type will index with a warning until
										resolved.
									</span>
								</div>
							) : null}
						</div>
					) : null}
				</div>

				<DialogFooter>
					<div className="wwc:text-sm">
						<span className="wwc:text-muted-foreground">
							Step {step + 1} of {STEPS.length}
						</span>
					</div>
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						{step > 0 ? (
							<Button variant="outline" onClick={goBack}>
								← Back
							</Button>
						) : null}
						{step < STEPS.length - 1 ? (
							<Button onClick={goNext}>Next →</Button>
						) : (
							<Button onClick={create}>Create object type</Button>
						)}
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
