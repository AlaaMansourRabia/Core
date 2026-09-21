import {cn} from "@wakecap/core-utils";
import {
	Award,
	Calendar,
	GraduationCap,
	List,
	RotateCw,
	ShieldCheck,
	Smartphone,
	TriangleAlert,
	Upload,
	User,
	Users,
	Zap,
} from "lucide-react";
import * as React from "react";

import {Avatar, AvatarFallback, AvatarImage} from "./avatar";
import {Badge} from "./badge";
import {Button} from "./button";
import {Progress} from "./progress";
import {Separator} from "./separator";
import {Skeleton} from "./skeleton";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "./tabs";
import {ToggleGroup, ToggleGroupItem} from "./toggle-group";
import {HoverTooltip} from "./tooltip";

// WorkerProfile — the profile body for a worker record, extracted from the PushPanel
// "Profile View Pattern" story. Seven icon tabs (General, Certificates, Compliance, Trainings,
// Device, Crew, Visits) over a label/value field list, under an optional identity region.
// Panel chrome (header, close, footer) is the caller's job, so this drops into a PushPanel,
// Sheet, Dialog, or a plain column.

export type WorkerProfileTabId = "general" | "certificates" | "compliance" | "trainings" | "device" | "crew" | "visits";

export interface WorkerProfileField {
	label: string;
	/** Rendered as-is — pass a Badge, a link, or plain text. */
	value: React.ReactNode;
}

/** A run of fields; consecutive groups are separated by a rule, as in the profile pattern. */
export interface WorkerProfileFieldGroup {
	id?: string;
	fields: WorkerProfileField[];
}

/** An attached file — its name, and the link to view or download it when one exists. */
export interface WorkerProfileDocument {
	name: string;
	/** View/download target. Without it the name renders as plain text. */
	url?: string;
}

export type WorkerProfileCertificateStatus = "Valid" | "Expires Soon" | "Expired";

export interface WorkerProfileCertificate {
	id: string;
	title: string;
	/** Certificate type — a lookup name, distinct from the free-text title. */
	type?: string;
	/** When the certificate was issued or completed. */
	issueDate?: string;
	expiryDate: string;
	status: WorkerProfileCertificateStatus;
	/** The attached certificate file, if one is on record. */
	document?: WorkerProfileDocument;
	/**
	 * Per-record actions — edit, delete, a "⋯" menu — rendered at the top right of this
	 * certificate's block. Omit it and the row renders as before. Tab-level actions ("Add
	 * certificate") belong in `certificatesActions` instead.
	 */
	actions?: React.ReactNode;
}

/**
 * A compliance check's attached file. {@link WorkerProfileDocument} plus `attached`, which the
 * compliance tab uses to distinguish "no file on record" from "a file we cannot link to".
 */
export interface WorkerProfileComplianceDocument extends WorkerProfileDocument {
	/** Whether a file is actually on record. Without it the document line reads as "No document". */
	attached?: boolean;
}

/** One row of the Compliance tab — a check with an optional status, choices, document, and fields. */
export interface WorkerProfileComplianceItem {
	id: string;
	/** Section title, e.g. "Background Check". */
	title: string;
	/** Right-aligned status — a plain string like "NOT SET" (shown muted/uppercase) or a node such as a Badge. */
	status?: React.ReactNode;
	/** Marks the value as system-derived: renders an "AUTO" badge before the status. */
	auto?: boolean;
	/** Segmented choices, e.g. ["Pass", "Fail", "Pending"]. */
	options?: string[];
	/**
	 * The selected option. With `onOptionChange` this is the controlled value — the choices show what
	 * you pass and nothing else, so the segment moves only once you write the new option back. Without
	 * a handler it is the initial choice only. Either way the widget keeps no record of its own.
	 */
	selectedOption?: string;
	/**
	 * A document attached to the check — its name, whether a file is on record, and the link to view
	 * it when there is one. `url` brings this to parity with {@link WorkerProfileCertificate}'s
	 * document: without it the widget could name a file but never open one, which left hosts injecting
	 * their own `<a>View</a>` into `fields` beside a dead "View document" label (issue #295).
	 *
	 * `attached` still says whether a file exists at all, so `{name, attached: false}` reads as "no
	 * document" exactly as before.
	 */
	document?: WorkerProfileComplianceDocument;
	/** Show the "Upload / replace document" action. */
	uploadable?: boolean;
	/** Extra label/value rows under the item (Expires, Assigned, Release Date…). */
	fields?: WorkerProfileField[];
	/** Muted helper text under the item. */
	note?: string;
	/**
	 * A write on this check is in flight: the choices and the upload action are disabled and the upload
	 * action shows a spinner. Without it a controlled check looks dead while the save runs — the
	 * segment cannot move until the answer comes back — and every further click is another call.
	 */
	loading?: boolean;
	/**
	 * Called when a choice is activated, with the option's own text. The widget holds no state: the
	 * control shows `selectedOption` and moves only when you write the new value back into it. Each
	 * activation is one call, in order — nothing is queued or debounced, so set `loading` while the
	 * save runs to stop the second click. Re-pressing the active choice is swallowed rather than
	 * reported, so this never fires with an empty string; a verdict has no "neither" state. Omit it and
	 * the choices toggle locally and report nothing, as before.
	 */
	onOptionChange?: (option: string) => void;
	/**
	 * Called when "Upload / replace document" is activated. The widget owns no file input and runs no
	 * upload: the host opens its own picker and writes the result back through `document`. Omit it and
	 * the action renders as it does today and does nothing.
	 */
	onUploadDocument?: () => void;
}

/** Compliance tab payload — an overall score plus the individual checks. */
export interface WorkerProfileCompliance {
	/** Overall score shown with a progress bar (e.g. 4 of 4). */
	score?: {value: number; total: number};
	items: WorkerProfileComplianceItem[];
	/**
	 * Rendered under the checks, inside the same column — a "Save compliance" bar, a legend, an audit
	 * line. The per-check callbacks each report one decision; a host that batches them into a single
	 * commit has nowhere else to put it, and the tab header is taken by the tab title.
	 */
	footer?: React.ReactNode;
}

/**
 * A tab whose data the host fetches — typically lazily, when the tab is opened — is neither loaded
 * nor empty while that fetch is in flight, and "empty" is a lie when it fails. Pass a state and the
 * widget shows a skeleton or an error with an optional Retry instead of the tab's empty text.
 */
export type WorkerProfileTabState =
	| {status: "loading"}
	| {
			status: "error";
			/** Overrides the tab's default wording, e.g. the server's message. */
			message?: string;
			/** Renders a Retry action. Omit it and the error is stated without one. */
			onRetry?: () => void;
	  };

/** Host wording for one tab — its name, and the text shown when it is empty or failed. */
export interface WorkerProfileTabText {
	/** The tab's name: its trigger tooltip and accessible name, and the tab header title. */
	label?: string;
	/** Replaces the tab's built-in empty text. */
	empty?: string;
	/** Replaces the tab's built-in error text. A `tabStates` error `message` still wins over it. */
	error?: string;
}

/**
 * The widget's own built-in strings, for a host that does not run in English. Field labels and
 * values are already the caller's; this covers the text the widget supplies itself. Anything left
 * out keeps today's English default, so an existing caller reads exactly as before.
 */
export interface WorkerProfileText {
	/** Per-tab wording, keyed by tab id. */
	tabs?: Partial<Record<WorkerProfileTabId, WorkerProfileTabText>>;
	/** The Retry action in a tab's error state. Default "Retry". */
	retry?: string;
	/** What the loading treatment announces to a screen reader. Default "Loading…". */
	loading?: string;
}

/** Identity region above the tabs — the worker's photo, name, and a home for worker-level actions. */
export interface WorkerProfileIdentity {
	/** Worker photo. Falls back to the name's initials, then to a person icon. */
	photoUrl?: string;
	/** Optional — some hosts keep the name in the General tab only. */
	name?: string;
	/** Secondary line, e.g. code · company · trade, or a status badge. */
	subtitle?: React.ReactNode;
	/** Worker-level actions — typically a single "⋯" menu (Edit, Replace photo, Demobilize…). */
	actions?: React.ReactNode;
}

export interface WorkerProfileProps {
	/** Identity region above the tabs. Omit it and the widget renders the body only, as before. */
	identity?: WorkerProfileIdentity;
	/** General tab — one or more field groups. */
	general?: WorkerProfileFieldGroup[];
	/** Certificates tab — rendered as titled blocks with a status badge. */
	certificates?: WorkerProfileCertificate[];
	/** Actions for the Certificates tab header, e.g. an "Add certificate" button. */
	certificatesActions?: React.ReactNode;
	/**
	 * Called when a certificate's document is activated, instead of navigating to its `url`. A host
	 * whose files sit behind its own auth needs this: a bare `href` cannot carry the request, so the
	 * link opens to a 401. With a handler the document renders as a button and the host runs its own
	 * fetch-and-download. Omit it and the document stays a plain link (or plain text without a `url`).
	 */
	onCertificateDocumentClick?: (certificate: WorkerProfileCertificate) => void;
	/**
	 * Compliance tab — either the typed model (score + per-check status, choices, documents, fields)
	 * or caller-supplied content, for hosts that own their compliance UI.
	 */
	compliance?: WorkerProfileCompliance | React.ReactNode;
	/**
	 * Called when a compliance check's document is activated, instead of navigating to its `url`. The
	 * mirror of {@link WorkerProfileProps.onCertificateDocumentClick}, and for the same reason: a host
	 * whose files sit behind its own auth cannot put the request in a bare `href`. With a handler the
	 * document renders as a button and the host runs its own fetch-and-download; without one it is a
	 * link to `document.url`, or plain text when there is no url.
	 */
	onComplianceDocumentClick?: (item: WorkerProfileComplianceItem) => void;
	/** Device tab — field list (device id, battery, firmware…). */
	device?: WorkerProfileField[];
	/** Actions for the Device tab header, e.g. assign / change / unassign controls. */
	deviceActions?: React.ReactNode;
	/** Trainings tab — caller-supplied content. */
	trainings?: React.ReactNode;
	/** Crew tab — caller-supplied content. */
	crew?: React.ReactNode;
	/** Visits tab — caller-supplied content. */
	visits?: React.ReactNode;
	/**
	 * Per-tab loading / error state, taking precedence over that tab's content and empty text. Only
	 * the tabs you name are affected; the rest keep today's data-or-empty behaviour. This is what a
	 * tab-gated fetch needs — without it a request in flight and a failed one both read as "no data".
	 */
	tabStates?: Partial<Record<WorkerProfileTabId, WorkerProfileTabState>>;
	/**
	 * The tabs this host has at all — an allow-list. Omit it (or pass an empty array) and all seven
	 * render, as before.
	 *
	 * This is a different statement from "no data yet": a tab left out of `tabs` is not part of this
	 * product, so it does not appear, while a tab that is present but unsupplied shows its empty
	 * text. A host with no Visits concept wants the first, and an always-empty Visits tab reads as
	 * broken rather than as a state. Order is the widget's own; the list only says which survive.
	 */
	tabs?: WorkerProfileTabId[];
	/**
	 * Overrides the widget's own built-in text — per-tab names, empty and error wording, and the
	 * Retry and loading labels. For a host that ships another language: everything else on the
	 * surface is caller-supplied already, and without this the empty and error states stay English
	 * whatever the locale.
	 */
	text?: WorkerProfileText;
	/** Tab shown first when uncontrolled. Default "general", or the first visible tab. */
	defaultTab?: WorkerProfileTabId;
	/** Controlled active tab. Pass it with `onTabChange` to drive the tabs from outside. */
	tab?: WorkerProfileTabId;
	/** Fires whenever the active tab changes, controlled or not. */
	onTabChange?: (tab: WorkerProfileTabId) => void;
	className?: string;
}

const TAB_ICONS: {id: WorkerProfileTabId; icon: React.ElementType}[] = [
	{id: "general", icon: List},
	{id: "certificates", icon: Award},
	{id: "compliance", icon: ShieldCheck},
	{id: "trainings", icon: GraduationCap},
	{id: "device", icon: Smartphone},
	{id: "crew", icon: Users},
	{id: "visits", icon: Calendar},
];

/** Tab names — the trigger tooltip and accessible name, and the tab header title. */
const TAB_LABELS: Record<WorkerProfileTabId, string> = {
	general: "General",
	certificates: "Certificates",
	compliance: "Compliance",
	trainings: "Trainings",
	device: "Device",
	crew: "Crew",
	visits: "Visits",
};

const EMPTY_TEXT: Record<WorkerProfileTabId, string> = {
	general: "No general details.",
	certificates: "No certificates found.",
	compliance: "No compliance record.",
	trainings: "No training records found.",
	device: "No device assigned.",
	crew: "No crew assignment.",
	visits: "No visit records.",
};

/** Wording for a failed tab fetch. Names the tab, so an error never reads as "no data". */
const ERROR_TEXT: Record<WorkerProfileTabId, string> = {
	general: "Couldn't load general details.",
	certificates: "Couldn't load certificates.",
	compliance: "Couldn't load the compliance record.",
	trainings: "Couldn't load training records.",
	device: "Couldn't load device details.",
	crew: "Couldn't load the crew assignment.",
	visits: "Couldn't load visit records.",
};

/** The host's wording for a tab, falling back to the widget's own. */
function tabLabel(tab: WorkerProfileTabId, text?: WorkerProfileText) {
	return text?.tabs?.[tab]?.label ?? TAB_LABELS[tab];
}

function certificateVariant(status: WorkerProfileCertificateStatus) {
	if (status === "Valid") return "default" as const;
	if (status === "Expires Soon") return "secondary" as const;
	return "destructive" as const;
}

/**
 * Tells the typed Compliance model apart from caller-supplied content. React nodes are elements,
 * arrays, or primitives — only the model is a plain object carrying an `items` array.
 */
function isComplianceModel(compliance: WorkerProfileProps["compliance"]): compliance is WorkerProfileCompliance {
	return (
		typeof compliance === "object" &&
		compliance !== null &&
		!Array.isArray(compliance) &&
		!React.isValidElement(compliance) &&
		Array.isArray((compliance as WorkerProfileCompliance).items)
	);
}

/** Up to two letters from the worker's name, for the avatar fallback. */
function initialsOf(name?: string) {
	const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
	if (parts.length === 0) return null;
	const first = parts[0]?.[0] ?? "";
	const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
	const initials = `${first}${last}`.toUpperCase();
	return initials.length > 0 ? initials : null;
}

function FieldRow({field}: {field: WorkerProfileField}) {
	return (
		<div className="wwc:flex wwc:justify-between wwc:gap-3 wwc:text-sm">
			<span className="wwc:shrink-0 wwc:text-muted-foreground">{field.label}:</span>
			<span className="wwc:text-right wwc:font-medium">{field.value}</span>
		</div>
	);
}

/** The identity strip — photo, name/subtitle, and the worker-level actions slot. */
function IdentityRegion({identity}: {identity: WorkerProfileIdentity}) {
	const initials = initialsOf(identity.name);

	return (
		<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-3 wwc:px-4 wwc:pt-4">
			<Avatar className="wwc:h-12 wwc:w-12">
				{identity.photoUrl ? <AvatarImage src={identity.photoUrl} alt={identity.name ?? "Worker photo"} /> : null}
				<AvatarFallback className="wwc:text-sm wwc:font-medium">
					{initials ?? <User className="wwc:h-5 wwc:w-5 wwc:text-muted-foreground" aria-hidden />}
				</AvatarFallback>
			</Avatar>

			<div className="wwc:min-w-0 wwc:flex-1">
				{identity.name ? <p className="wwc:truncate wwc:text-sm wwc:font-semibold">{identity.name}</p> : null}
				{identity.subtitle ? (
					<div className="wwc:truncate wwc:text-xs wwc:text-muted-foreground">{identity.subtitle}</div>
				) : null}
			</div>

			{identity.actions ? <div className="wwc:flex wwc:shrink-0 wwc:items-center">{identity.actions}</div> : null}
		</div>
	);
}

/**
 * The document cell: the host's click handler when it has one, otherwise a link to the file, and
 * plain text when neither is on record. The handler wins over the `url` — a host that routes the
 * click through its own authenticated download often has no publicly fetchable URL at all.
 */
function CertificateDocument({
	certificate,
	onDocumentClick,
}: {
	certificate: WorkerProfileCertificate;
	onDocumentClick?: (certificate: WorkerProfileCertificate) => void;
}) {
	const file = certificate.document;
	if (!file) return null;

	if (onDocumentClick) {
		return (
			<button
				type="button"
				onClick={() => onDocumentClick(certificate)}
				className="wwc:cursor-pointer wwc:underline wwc:underline-offset-2"
			>
				{file.name}
			</button>
		);
	}

	if (file.url) {
		return (
			<a href={file.url} target="_blank" rel="noreferrer" className="wwc:underline wwc:underline-offset-2">
				{file.name}
			</a>
		);
	}

	return <span className="wwc:text-muted-foreground">{file.name}</span>;
}

/** One certificate — the always-present rows plus type, issue date, and document when supplied. */
function CertificateBlock({
	certificate,
	onDocumentClick,
}: {
	certificate: WorkerProfileCertificate;
	onDocumentClick?: (certificate: WorkerProfileCertificate) => void;
}) {
	const rows = (
		<>
			<FieldRow field={{label: "Certificate Title", value: certificate.title}} />
			{certificate.type ? <FieldRow field={{label: "Certificate Type", value: certificate.type}} /> : null}
			{certificate.issueDate ? <FieldRow field={{label: "Issue Date", value: certificate.issueDate}} /> : null}
			<FieldRow field={{label: "Expire Date", value: certificate.expiryDate}} />
			<FieldRow
				field={{
					label: "Status",
					value: (
						<Badge variant={certificateVariant(certificate.status)} className="wwc:h-5 wwc:text-xs">
							{certificate.status}
						</Badge>
					),
				}}
			/>
			{certificate.document ? (
				<FieldRow
					field={{
						label: "Document",
						value: <CertificateDocument certificate={certificate} onDocumentClick={onDocumentClick} />,
					}}
				/>
			) : null}
		</>
	);

	return (
		<div className="wwc:border-b wwc:pb-3 wwc:last:border-0">
			{/* The row actions sit beside the record, so the label/value rows keep their own column. */}
			{certificate.actions ? (
				<div className="wwc:flex wwc:items-start wwc:gap-2">
					<div className="wwc:min-w-0 wwc:flex-1 wwc:space-y-1.5">{rows}</div>
					<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-1">{certificate.actions}</div>
				</div>
			) : (
				<div className="wwc:space-y-1.5">{rows}</div>
			)}
		</div>
	);
}

/**
 * The compliance document's affordance, mirroring {@link CertificateDocument}'s precedence: the
 * host's click handler first, then the file's own `url`, then plain text. The handler wins over the
 * `url` because a host routing the click through its own authenticated download often has no
 * publicly fetchable URL at all.
 *
 * `attached: false` means there is no file, so neither affordance applies however the item is
 * otherwise filled in — a stale `url` beside "No document" would be the dead link issue #295 set out
 * to remove.
 */
function ComplianceDocumentAction({
	item,
	onDocumentClick,
}: {
	item: WorkerProfileComplianceItem;
	onDocumentClick?: (item: WorkerProfileComplianceItem) => void;
}) {
	const file = item.document;
	if (!file) return null;
	if (file.attached === false) return <span className="wwc:shrink-0 wwc:text-muted-foreground">No document</span>;

	if (onDocumentClick) {
		return (
			<button
				type="button"
				onClick={() => onDocumentClick(item)}
				className="wwc:shrink-0 wwc:cursor-pointer wwc:underline wwc:underline-offset-2"
			>
				View document
			</button>
		);
	}

	if (file.url) {
		return (
			<a href={file.url} target="_blank" rel="noreferrer" className="wwc:shrink-0 wwc:underline wwc:underline-offset-2">
				View document
			</a>
		);
	}

	// A name with no url and no handler: the file is on record but this host cannot open it.
	return (
		<span className="wwc:shrink-0 wwc:text-muted-foreground">{file.attached ? "View document" : "No document"}</span>
	);
}

/** One compliance check — header row (title + optional AUTO/status), choices, document, fields, and note. */
function ComplianceItemBlock({
	item,
	onDocumentClick,
}: {
	item: WorkerProfileComplianceItem;
	onDocumentClick?: (item: WorkerProfileComplianceItem) => void;
}) {
	// The group is controlled in both directions, so a host that binds `onOptionChange` late — after a
	// permissions fetch, behind a feature flag — does not flip the control from uncontrolled to
	// controlled, which React warns about and which drops the choice already on screen. Without a
	// handler the widget drives the value from its own state, matching the local toggling callers have
	// today; with one, `selectedOption` is the only source of truth.
	const [localOption, setLocalOption] = React.useState(item.selectedOption);
	// Mirror the host's value while it owns the choice, so withdrawing the handler — a permission gate
	// closing — leaves the control where the user left it instead of snapping back to the mount-time
	// value. Adjusting state during render is the sanctioned way to follow a prop; the compare keeps it
	// from looping.
	if (item.onOptionChange && localOption !== item.selectedOption) setLocalOption(item.selectedOption);
	const choice = (item.onOptionChange ? item.selectedOption : localOption) ?? "";

	return (
		<div className="wwc:space-y-2.5">
			{/* Wrapping, because the status column cannot shrink: an AUTO badge beside a "NOT SET" chip is
			    ~150px, and in a narrow profile panel that left the title's min-content width nowhere to go,
			    so the row overflowed and the chip was cut off at the panel's right edge (issue #295). Given
			    a line of its own the chip stays whole; at the widths a profile is usually read at nothing
			    wraps and the row is unchanged. */}
			<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:justify-between wwc:gap-x-3 wwc:gap-y-1">
				<h5 className="wwc:min-w-0 wwc:text-sm wwc:font-semibold">{item.title}</h5>
				{item.auto || item.status != null ? (
					// ml-auto keeps the chip right-aligned on the line it wraps onto, where justify-between
					// has nothing to push it against.
					<div className="wwc:ml-auto wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-1.5">
						{item.auto ? (
							<Badge variant="warningSoft" className="wwc:h-5 wwc:gap-1 wwc:text-[10px]">
								<Zap />
								AUTO
							</Badge>
						) : null}
						{typeof item.status === "string" ? (
							<span className="wwc:text-xs wwc:font-medium wwc:tracking-wide wwc:text-muted-foreground wwc:uppercase">
								{item.status}
							</span>
						) : (
							item.status
						)}
					</div>
				) : null}
			</div>

			{item.options && item.options.length > 0 ? (
				<ToggleGroup
					type="single"
					value={choice}
					onValueChange={(option) => {
						if (item.onOptionChange) {
							// Radix reports "" when the active choice is pressed again; a verdict has no
							// "neither" state, so that is swallowed rather than sent on as a cleared answer.
							if (option) item.onOptionChange(option);
							return;
						}
						// No handler: the choices behave exactly as they did before they could report anything,
						// re-press to clear included.
						setLocalOption(option);
					}}
					disabled={item.loading}
					aria-label={item.title}
					variant="outline"
					size="sm"
					className="wwc:justify-start wwc:gap-2"
				>
					{item.options.map((option) => (
						<ToggleGroupItem
							key={option}
							value={option}
							className={cn("wwc:text-xs", item.onOptionChange && "wwc:cursor-pointer")}
						>
							{option}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
			) : null}

			{item.document ? (
				<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-3 wwc:text-sm">
					<span className="wwc:truncate wwc:text-foreground/80">{item.document.name}</span>
					<ComplianceDocumentAction item={item} onDocumentClick={onDocumentClick} />
				</div>
			) : null}

			{item.fields?.map((field) => (
				<FieldRow key={field.label} field={field} />
			))}

			{item.uploadable ? (
				<Button
					variant="link"
					size="sm"
					className="wwc:h-auto wwc:gap-1.5 wwc:px-0"
					onClick={item.onUploadDocument}
					loading={item.loading}
				>
					{/* Button's loading state brings its own Spinner — keeping the Upload icon would show two. */}
					{item.loading ? null : <Upload />}
					Upload / replace document
				</Button>
			) : null}

			{item.note ? <p className="wwc:text-xs wwc:text-muted-foreground">{item.note}</p> : null}
		</div>
	);
}

/** The typed Compliance tab — score bar over the individual checks. */
function ComplianceBody({
	compliance,
	onDocumentClick,
}: {
	compliance: WorkerProfileCompliance;
	onDocumentClick?: (item: WorkerProfileComplianceItem) => void;
}) {
	return (
		<div className="wwc:space-y-4">
			{compliance.score ? (
				<div className="wwc:space-y-2">
					<div className="wwc:flex wwc:items-center wwc:justify-between">
						<span className="wwc:text-sm wwc:font-semibold">Compliance Score:</span>
						<span className="wwc:text-sm wwc:font-semibold wwc:text-amber-600 wwc:dark:text-amber-500">
							{compliance.score.value} / {compliance.score.total}
						</span>
					</div>
					<Progress
						value={compliance.score.total > 0 ? (compliance.score.value / compliance.score.total) * 100 : 0}
						tone="warning"
					/>
				</div>
			) : null}

			{compliance.items.map((item, index) => (
				<div key={item.id} className="wwc:space-y-4">
					{index > 0 || compliance.score ? <Separator /> : null}
					<ComplianceItemBlock item={item} onDocumentClick={onDocumentClick} />
				</div>
			))}

			{compliance.footer ? (
				<div className="wwc:space-y-4">
					{compliance.items.length > 0 || compliance.score ? <Separator /> : null}
					{compliance.footer}
				</div>
			) : null}
		</div>
	);
}

function TabBody({title, actions, children}: {title: string; actions?: React.ReactNode; children: React.ReactNode}) {
	return (
		<>
			{/* No min-height: with no actions the row is exactly the h4, so existing callers keep their spacing. */}
			<div className="wwc:mb-3 wwc:flex wwc:items-center wwc:justify-between wwc:gap-3">
				<h4 className="wwc:text-sm wwc:font-medium">{title}</h4>
				{actions ? <div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2">{actions}</div> : null}
			</div>
			{children}
		</>
	);
}

function EmptyText({tab, text}: {tab: WorkerProfileTabId; text?: WorkerProfileText}) {
	return <p className="wwc:text-sm wwc:text-muted-foreground">{text?.tabs?.[tab]?.empty ?? EMPTY_TEXT[tab]}</p>;
}

/**
 * The loading treatment, shaped like the label/value rows every typed tab renders, so a tab does not
 * change size as its data arrives.
 */
function TabSkeleton({label}: {label?: string}) {
	return (
		<div className="wwc:space-y-2.5" data-testid="worker-profile-tab-loading" aria-hidden>
			{[0, 1, 2, 3].map((row) => (
				<div key={row} className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-3">
					<Skeleton className="wwc:h-4 wwc:w-28" />
					<Skeleton className="wwc:h-4 wwc:w-20" />
				</div>
			))}
			<span className="wwc:sr-only">{label ?? "Loading…"}</span>
		</div>
	);
}

/** A failed tab fetch, stated as a failure — with the host's retry when it has one. */
function TabError({
	tab,
	state,
	text,
}: {
	tab: WorkerProfileTabId;
	state: Extract<WorkerProfileTabState, {status: "error"}>;
	text?: WorkerProfileText;
}) {
	return (
		<div role="alert" className="wwc:space-y-3">
			<div className="wwc:flex wwc:items-start wwc:gap-2 wwc:text-sm wwc:text-destructive">
				<TriangleAlert className="wwc:mt-0.5 wwc:h-4 wwc:w-4 wwc:shrink-0" aria-hidden />
				{/* The server's own message first, then the host's wording, then ours. */}
				<p>{state.message ?? text?.tabs?.[tab]?.error ?? ERROR_TEXT[tab]}</p>
			</div>
			{state.onRetry ? (
				<Button variant="outline" size="sm" className="wwc:gap-1.5" onClick={state.onRetry}>
					<RotateCw />
					{text?.retry ?? "Retry"}
				</Button>
			) : null}
		</div>
	);
}

/**
 * A tab's body, with the host-declared status winning over it. No state named for the tab and the
 * children render exactly as they did before this prop existed.
 */
function TabSlot({
	tab,
	state,
	text,
	children,
}: {
	tab: WorkerProfileTabId;
	state?: WorkerProfileTabState;
	text?: WorkerProfileText;
	children: React.ReactNode;
}) {
	if (state?.status === "loading") return <TabSkeleton label={text?.loading} />;
	if (state?.status === "error") return <TabError tab={tab} state={state} text={text} />;
	return <>{children}</>;
}

/**
 * Worker profile body — up to seven icon tabs over a worker's record, under an optional identity
 * region.
 *
 * Supply only the tabs you have data for and the rest fall back to their empty text. For a tab this
 * product will never populate, name the ones you do have in `tabs` instead — that removes the
 * trigger, rather than leaving an empty one that reads as broken.
 */
export function WorkerProfile({
	identity,
	general,
	certificates,
	certificatesActions,
	onCertificateDocumentClick,
	compliance,
	onComplianceDocumentClick,
	device,
	deviceActions,
	trainings,
	crew,
	visits,
	tabStates,
	tabs,
	text,
	defaultTab = "general",
	tab,
	onTabChange,
	className,
}: WorkerProfileProps) {
	const generalGroups = general?.filter((group) => group.fields.length > 0) ?? [];
	const complianceModel = isComplianceModel(compliance) ? compliance : null;
	const complianceNode = complianceModel ? null : (compliance as React.ReactNode);

	// The allow-list narrows the canonical order rather than replacing it, so two hosts naming the
	// same tabs in different orders still read the same.
	const visibleTabs = tabs?.length ? TAB_ICONS.filter((tabItem) => tabs.includes(tabItem.id)) : TAB_ICONS;
	const shows = (id: WorkerProfileTabId) => visibleTabs.some((tabItem) => tabItem.id === id);
	// A tab that is not rendered cannot be active; falling back to the first visible one beats a
	// panel-less widget when a host's `defaultTab` and its `tabs` disagree.
	const firstVisible = visibleTabs[0]?.id ?? "general";
	const activeDefault = shows(defaultTab) ? defaultTab : firstVisible;
	const activeTab = tab === undefined || shows(tab) ? tab : firstVisible;

	return (
		<Tabs
			// Controlled when `tab` is given, uncontrolled otherwise — Radix rejects both at once.
			{...(activeTab === undefined ? {defaultValue: activeDefault} : {value: activeTab})}
			onValueChange={onTabChange ? (value) => onTabChange(value as WorkerProfileTabId) : undefined}
			className={cn("wwc:flex wwc:flex-1 wwc:flex-col wwc:overflow-hidden", className)}
		>
			{identity ? <IdentityRegion identity={identity} /> : null}

			<div className="wwc:shrink-0 wwc:px-4 wwc:py-2">
				<TabsList>
					{/* Icon-only triggers, so the tab name lives in a hover/focus tooltip. */}
					{visibleTabs.map((tabItem) => {
						const label = tabLabel(tabItem.id, text);

						return (
							<HoverTooltip key={tabItem.id} content={label}>
								<TabsTrigger value={tabItem.id} aria-label={label}>
									<tabItem.icon className="wwc:h-4 wwc:w-4" />
								</TabsTrigger>
							</HoverTooltip>
						);
					})}
				</TabsList>
			</div>

			{shows("general") && (
				<TabsContent value="general" className="wwc:m-0 wwc:flex-1 wwc:overflow-auto wwc:p-4">
					<TabBody title={tabLabel("general", text)}>
						<TabSlot tab="general" state={tabStates?.general} text={text}>
							{generalGroups.length === 0 ? (
								<EmptyText tab="general" text={text} />
							) : (
								<div className="wwc:space-y-2.5">
									{generalGroups.map((group, index) => (
										<div key={group.id ?? index} className="wwc:space-y-2.5">
											{index > 0 && <Separator />}
											{group.fields.map((field) => (
												<FieldRow key={field.label} field={field} />
											))}
										</div>
									))}
								</div>
							)}
						</TabSlot>
					</TabBody>
				</TabsContent>
			)}

			{shows("certificates") && (
				<TabsContent value="certificates" className="wwc:m-0 wwc:flex-1 wwc:overflow-auto wwc:p-4">
					<TabBody title={tabLabel("certificates", text)} actions={certificatesActions}>
						<TabSlot tab="certificates" state={tabStates?.certificates} text={text}>
							{!certificates || certificates.length === 0 ? (
								<EmptyText tab="certificates" text={text} />
							) : (
								<div className="wwc:space-y-4">
									{certificates.map((certificate) => (
										<CertificateBlock
											key={certificate.id}
											certificate={certificate}
											onDocumentClick={onCertificateDocumentClick}
										/>
									))}
								</div>
							)}
						</TabSlot>
					</TabBody>
				</TabsContent>
			)}

			{shows("compliance") && (
				<TabsContent value="compliance" className="wwc:m-0 wwc:flex-1 wwc:overflow-auto wwc:p-4">
					<TabBody title={tabLabel("compliance", text)}>
						<TabSlot tab="compliance" state={tabStates?.compliance} text={text}>
							{complianceModel ? (
								complianceModel.items.length === 0 && !complianceModel.footer ? (
									<EmptyText tab="compliance" text={text} />
								) : (
									<ComplianceBody compliance={complianceModel} onDocumentClick={onComplianceDocumentClick} />
								)
							) : (
								(complianceNode ?? <EmptyText tab="compliance" text={text} />)
							)}
						</TabSlot>
					</TabBody>
				</TabsContent>
			)}

			{shows("trainings") && (
				<TabsContent value="trainings" className="wwc:m-0 wwc:flex-1 wwc:overflow-auto wwc:p-4">
					<TabBody title={tabLabel("trainings", text)}>
						<TabSlot tab="trainings" state={tabStates?.trainings} text={text}>
							{trainings ?? <EmptyText tab="trainings" text={text} />}
						</TabSlot>
					</TabBody>
				</TabsContent>
			)}

			{shows("device") && (
				<TabsContent value="device" className="wwc:m-0 wwc:flex-1 wwc:overflow-auto wwc:p-4">
					<TabBody title={tabLabel("device", text)} actions={deviceActions}>
						<TabSlot tab="device" state={tabStates?.device} text={text}>
							{!device || device.length === 0 ? (
								<EmptyText tab="device" text={text} />
							) : (
								<div className="wwc:space-y-2.5">
									{device.map((field) => (
										<FieldRow key={field.label} field={field} />
									))}
								</div>
							)}
						</TabSlot>
					</TabBody>
				</TabsContent>
			)}

			{shows("crew") && (
				<TabsContent value="crew" className="wwc:m-0 wwc:flex-1 wwc:overflow-auto wwc:p-4">
					<TabBody title={tabLabel("crew", text)}>
						<TabSlot tab="crew" state={tabStates?.crew} text={text}>
							{crew ?? <EmptyText tab="crew" text={text} />}
						</TabSlot>
					</TabBody>
				</TabsContent>
			)}

			{shows("visits") && (
				<TabsContent value="visits" className="wwc:m-0 wwc:flex-1 wwc:overflow-auto wwc:p-4">
					<TabBody title={tabLabel("visits", text)}>
						<TabSlot tab="visits" state={tabStates?.visits} text={text}>
							{visits ?? <EmptyText tab="visits" text={text} />}
						</TabSlot>
					</TabBody>
				</TabsContent>
			)}
		</Tabs>
	);
}
