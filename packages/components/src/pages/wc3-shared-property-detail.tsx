import {ArrowLeft, Plug, Plus, Share2, X} from "lucide-react";
import * as React from "react";

import {Badge} from "../badge";
import {Button} from "../button";
import {Card} from "../card";
import {ConfirmDialog} from "../confirm-dialog";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "../dropdown-menu";
import {Empty} from "../empty";
import {Input} from "../input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../table";
import {Textarea} from "../textarea";
import {HoverTooltip} from "../tooltip";

// The shared-property drill-in, ported from the prototype's SharedPropDetail (06-unified-workspace.html
// :4141). A shared property is one definition with many consumers, so the surface is the definition
// plus the three things that depend on it: the object types that consume it, the interfaces that
// require it, and the blast radius of deleting it.
//
// Neutral model on purpose: the WC3 ontology and the workforce settings page both map onto
// SharedPropertyModel, so this file never imports a fixture. Same shape as link-type-detail.tsx.

/** The prototype's value-formatting palette, in its order. `none` stands in for a null formatting. */
export const SHARED_PROPERTY_FORMATTINGS: {value: string; label: string}[] = [
	{value: "none", label: "None"},
	{value: "number", label: "Number"},
	{value: "date", label: "Date"},
	{value: "userId", label: "User ID"},
	{value: "resourceId", label: "Resource ID"},
];

/** Default pattern seeded when a formatting kind is picked; the other kinds carry no pattern. */
const PATTERN_SEED: Record<string, string> = {number: "#,##0.0", date: "YYYY-MM-DD"};

/** Only these two kinds take a pattern, so only they render the pattern input. */
const HAS_PATTERN = (kind: string | undefined) => kind === "number" || kind === "date";

export interface SharedPropertyFormatting {
	kind: string;
	pattern?: string;
}

/** The neutral shared-property shape every host maps onto. */
export interface SharedPropertyModel {
	id: string;
	/** Resource identifier, shown as a hover chip in the header when present. */
	rid?: string;
	displayName: string;
	apiName: string;
	description: string;
	baseType: string;
	formatting: SharedPropertyFormatting | null;
	typeClasses: string[];
}

/** An object type that already consumes the shared property, with the row it renders today. */
export interface SharedPropertyConsumer {
	/** The consuming object type's id. */
	id: string;
	label: string;
	icon?: React.ComponentType<{className?: string}>;
	/** The consuming property's id, so the host can remove exactly that row. */
	propertyId: string;
	/**
	 * The property row as the consumer actually renders it — the shared definition wins over the
	 * local one, so these are the values the shared property propagates (the prototype's effProp).
	 */
	effectiveDisplayName: string;
	effectiveApiName: string;
	effectiveBaseType: string;
	effectiveFormatting?: string;
	effectiveTypeClasses: string[];
}

/** An interface that requires this shared property from all its implementors. */
export interface SharedPropertyInterfaceRef {
	id: string;
	label: string;
	icon?: React.ComponentType<{className?: string}>;
}

/** An object type the shared property can still be applied to (i.e. does not consume it yet). */
export interface SharedPropertyApplyTarget {
	id: string;
	label: string;
	icon?: React.ComponentType<{className?: string}>;
}

export interface SharedPropertyDetailPageProps {
	property: SharedPropertyModel;
	/** Object types consuming the property, in list order. Empty renders the "not applied" state. */
	consumers: SharedPropertyConsumer[];
	/** Interfaces referencing the property. Defaults to none, which renders the muted fallback copy. */
	interfaces?: SharedPropertyInterfaceRef[];
	/** Types the property is NOT on yet. Empty (the default) hides the apply menu. */
	applicable?: SharedPropertyApplyTarget[];
	baseTypes?: string[];
	formattings?: {value: string; label: string}[];
	onBack: () => void;
	/** Fired with the edited definition when "Save changes" is pressed. */
	onSave?: (next: SharedPropertyModel) => void;
	onApply?: (target: SharedPropertyApplyTarget) => void;
	onRemoveConsumer?: (consumer: SharedPropertyConsumer) => void;
	onOpenConsumer?: (consumer: SharedPropertyConsumer) => void;
	onOpenInterface?: (ref: SharedPropertyInterfaceRef) => void;
	/** Omit to hide the danger zone entirely — nothing appears the host did not wire. */
	onDelete?: () => void;
	/** Return a message to reject an API-name edit (e.g. it collides with another shared property). */
	validateApiName?: (value: string) => string | null;
	/** Host-specific sections appended below the standard cards. */
	extra?: React.ReactNode;
}

const BASE_TYPE_FALLBACK = ["string", "integer", "double", "boolean", "date", "timestamp", "geopoint", "array"];

function FieldLabel({children}: {children: React.ReactNode}) {
	return <span className="wwc:block wwc:text-xs wwc:font-medium wwc:text-muted-foreground">{children}</span>;
}

/** A glyph tile for a consuming object type or an interface. */
function Tile({icon: Icon}: {icon?: React.ComponentType<{className?: string}>}) {
	return (
		<span className="wwc:flex wwc:h-5 wwc:w-5 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded wwc:bg-muted wwc:text-muted-foreground">
			{Icon ? <Icon className="wwc:h-3 wwc:w-3" /> : <Share2 className="wwc:h-3 wwc:w-3" />}
		</span>
	);
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
 * Full-page shared-property editor.
 *
 * No section nav: the record has four sections and three of them are one to four lines, so they stack
 * — the LinkTypeDetailPage case, not the ObjectTypeDetail case. Body fills the full width.
 */
export function SharedPropertyDetailPage({
	property,
	consumers,
	interfaces = [],
	applicable = [],
	baseTypes = BASE_TYPE_FALLBACK,
	formattings = SHARED_PROPERTY_FORMATTINGS,
	onBack,
	onSave,
	onApply,
	onRemoveConsumer,
	onOpenConsumer,
	onOpenInterface,
	onDelete,
	validateApiName,
	extra,
}: SharedPropertyDetailPageProps) {
	const [draft, setDraft] = React.useState(property);
	const [dirty, setDirty] = React.useState(false);
	// The API name is rejected rather than applied when invalid, so it needs its own buffer.
	const [apiDraft, setApiDraft] = React.useState(property.apiName);
	const [apiError, setApiError] = React.useState<string | null>(null);
	const [newClass, setNewClass] = React.useState("");
	const [pendingRemove, setPendingRemove] = React.useState<SharedPropertyConsumer | null>(null);
	const [confirmDelete, setConfirmDelete] = React.useState(false);

	// Re-seed whenever a different property is opened; edits stay local until saved.
	React.useEffect(() => {
		setDraft(property);
		setApiDraft(property.apiName);
		setApiError(null);
		setDirty(false);
	}, [property]);

	const current = draft.id === property.id ? draft : property;
	const patch = (next: Partial<SharedPropertyModel>) => {
		setDraft({...current, ...next});
		setDirty(true);
	};

	const discard = () => {
		setDraft(property);
		setApiDraft(property.apiName);
		setApiError(null);
		setDirty(false);
	};

	// The prototype re-renders from the store on a rejected edit, so the input snaps back to the
	// stored value and the error explains why. Same here: reject, do not apply.
	const commitApiName = () => {
		const value = apiDraft.trim();
		if (!value) {
			setApiError("API name cannot be empty.");
			setApiDraft(current.apiName);
			return;
		}
		const error = validateApiName?.(value);
		if (error) {
			setApiError(error);
			setApiDraft(current.apiName);
			return;
		}
		setApiError(null);
		patch({apiName: value});
	};

	const setFormattingKind = (kind: string) => {
		if (kind === "none") {
			patch({formatting: null});
			return;
		}
		// Keep an existing pattern when switching kinds; otherwise seed the prototype's default.
		patch({formatting: {kind, pattern: current.formatting?.pattern || PATTERN_SEED[kind] || ""}});
	};

	const addTypeClass = () => {
		const value = newClass.trim();
		if (!value || current.typeClasses.includes(value)) {
			setNewClass("");
			return;
		}
		patch({typeClasses: [...current.typeClasses, value]});
		setNewClass("");
	};

	return (
		<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col">
			{/* Fixed bar sized to PageContentHeader (compact -> min-h-12, px-3), same as every drill-in. */}
			<div className="wwc:flex wwc:min-h-12 wwc:shrink-0 wwc:items-center wwc:justify-between wwc:gap-3 wwc:border-b wwc:border-border wwc:bg-card wwc:px-3">
				<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-2.5">
					<Button variant="ghost" size="sm" className="wwc:gap-1.5" onClick={onBack}>
						<ArrowLeft className="wwc:h-4 wwc:w-4" />
						Back
					</Button>
					<div className="wwc:h-5 wwc:w-px wwc:shrink-0 wwc:bg-border" />
					<Share2 className="wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-muted-foreground" />
					<h1 className="wwc:truncate wwc:text-sm wwc:font-semibold">{current.displayName}</h1>
					<Badge variant="neutralSoft" className="wwc:font-normal">
						{current.baseType}
					</Badge>
					<Badge variant="secondary">
						{consumers.length} consumer{consumers.length === 1 ? "" : "s"}
					</Badge>
					<span className="wwc:hidden wwc:truncate wwc:font-mono wwc:text-[11px] wwc:text-muted-foreground wwc:lg:inline">
						{current.apiName}
					</span>
				</div>
				<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2">
					{current.rid ? (
						<span className="wwc:hidden wwc:lg:inline">
							<RidChip rid={current.rid} />
						</span>
					) : null}
					{dirty ? (
						<>
							<Button variant="outline" size="sm" onClick={discard}>
								Discard
							</Button>
							<Button
								size="sm"
								onClick={() => {
									onSave?.(current);
									setDirty(false);
								}}
							>
								Save changes
							</Button>
						</>
					) : null}
				</div>
			</div>

			<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto">
				<div className="wwc:w-full wwc:space-y-4 wwc:p-6">
					<Card className="wwc:p-5">
						<h3 className="wwc:mb-4 wwc:text-base wwc:font-semibold">
							Definition{" "}
							<span className="wwc:text-sm wwc:font-normal wwc:text-muted-foreground">
								edits propagate live to every consumer below
							</span>
						</h3>
						<div className="wwc:space-y-4">
							<div className="wwc:grid wwc:gap-4 wwc:md:grid-cols-2">
								<div className="wwc:space-y-1.5">
									<FieldLabel>Display name</FieldLabel>
									<Input value={current.displayName} onChange={(e) => patch({displayName: e.target.value})} />
								</div>
								<div className="wwc:space-y-1.5">
									<FieldLabel>API name</FieldLabel>
									<Input
										value={apiDraft}
										onChange={(e) => setApiDraft(e.target.value)}
										onBlur={commitApiName}
										onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
										aria-invalid={apiError !== null}
										className="wwc:font-mono"
									/>
									{apiError ? <span className="wwc:block wwc:text-xs wwc:text-destructive">{apiError}</span> : null}
								</div>
								<div className="wwc:space-y-1.5">
									<FieldLabel>Base type</FieldLabel>
									<Select value={current.baseType} onValueChange={(v) => patch({baseType: v})}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{baseTypes.map((t) => (
												<SelectItem key={t} value={t}>
													{t}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="wwc:space-y-1.5">
									<FieldLabel>Value formatting</FieldLabel>
									<div className="wwc:flex wwc:items-center wwc:gap-2">
										<Select value={current.formatting?.kind ?? "none"} onValueChange={setFormattingKind}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{formattings.map((f) => (
													<SelectItem key={f.value} value={f.value}>
														{f.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{/* Only number and date carry a pattern, so the input appears only for those. */}
										{HAS_PATTERN(current.formatting?.kind) ? (
											<Input
												value={current.formatting?.pattern ?? ""}
												onChange={(e) =>
													patch({
														formatting: {kind: current.formatting?.kind ?? "number", pattern: e.target.value},
													})
												}
												aria-label="Formatting pattern"
												className="wwc:w-[9rem] wwc:shrink-0 wwc:font-mono"
											/>
										) : null}
									</div>
								</div>
							</div>
							<div className="wwc:space-y-1.5">
								<FieldLabel>Description</FieldLabel>
								<Textarea rows={2} value={current.description} onChange={(e) => patch({description: e.target.value})} />
							</div>
							<div className="wwc:space-y-1.5">
								<FieldLabel>Type classes</FieldLabel>
								<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
									{current.typeClasses.map((tc) => (
										<Badge key={tc} variant="neutralSoft" className="wwc:gap-1 wwc:font-normal">
											{tc}
											<button
												type="button"
												aria-label={`Remove ${tc}`}
												onClick={() => patch({typeClasses: current.typeClasses.filter((x) => x !== tc)})}
												className="wwc:transition-colors wwc:hover:text-foreground"
											>
												<X className="wwc:h-3 wwc:w-3" />
											</button>
										</Badge>
									))}
									<Input
										value={newClass}
										onChange={(e) => setNewClass(e.target.value)}
										onBlur={addTypeClass}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												addTypeClass();
											}
										}}
										placeholder="add class ↵"
										aria-label="Add type class"
										className="wwc:h-7 wwc:w-[9rem]"
									/>
								</div>
							</div>
						</div>
					</Card>

					<Card className="wwc:p-5">
						<div className="wwc:mb-4 wwc:flex wwc:items-center wwc:justify-between wwc:gap-3">
							<h3 className="wwc:text-base wwc:font-semibold">
								Used by {consumers.length} object type{consumers.length === 1 ? "" : "s"}
							</h3>
							{/* Only types that do not consume it yet are offered, so no option is a no-op. */}
							{onApply && applicable.length > 0 ? (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button size="sm" className="wwc:gap-1.5">
											<Plus className="wwc:h-3.5 wwc:w-3.5" />
											Apply to object type
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="wwc:max-h-80 wwc:overflow-auto">
										{applicable.map((t) => (
											<DropdownMenuItem key={t.id} onSelect={() => onApply(t)} className="wwc:gap-2">
												<Tile icon={t.icon} />
												{t.label}
											</DropdownMenuItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							) : null}
						</div>

						{consumers.length === 0 ? (
							<Empty
								icon={<Plug className="wwc:h-6 wwc:w-6" />}
								title="Not applied anywhere yet"
								description="No object type consumes this shared property, so edits here propagate nowhere."
								action={
									onApply && applicable.length > 0 ? (
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button size="sm">Apply to an object type</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="center" className="wwc:max-h-80 wwc:overflow-auto">
												{applicable.map((t) => (
													<DropdownMenuItem key={t.id} onSelect={() => onApply(t)} className="wwc:gap-2">
														<Tile icon={t.icon} />
														{t.label}
													</DropdownMenuItem>
												))}
											</DropdownMenuContent>
										</DropdownMenu>
									) : undefined
								}
							/>
						) : (
							<div className="wwc:overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Object type</TableHead>
											<TableHead>Rendered property row (live)</TableHead>
											<TableHead className="wwc:text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{consumers.map((c) => (
											<TableRow key={c.id}>
												<TableCell>
													<span className="wwc:flex wwc:items-center wwc:gap-2 wwc:whitespace-nowrap wwc:font-medium">
														<Tile icon={c.icon} />
														{c.label}
													</span>
												</TableCell>
												{/*
												 * The effective row, not the local one: this column is the whole point of the
												 * surface — it shows what the shared definition propagates into each consumer.
												 */}
												<TableCell>
													<span className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
														<span className="wwc:font-medium">{c.effectiveDisplayName}</span>
														<span className="wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
															{c.effectiveApiName} : {c.effectiveBaseType}
														</span>
														{c.effectiveFormatting ? (
															<Badge variant="neutralSoft" className="wwc:font-normal">
																{c.effectiveFormatting}
															</Badge>
														) : null}
														{c.effectiveTypeClasses.map((tc) => (
															<Badge key={tc} variant="neutralSoft" className="wwc:font-normal">
																{tc}
															</Badge>
														))}
													</span>
												</TableCell>
												<TableCell>
													<span className="wwc:flex wwc:items-center wwc:justify-end wwc:gap-1">
														{onOpenConsumer ? (
															<Button variant="ghost" size="sm" onClick={() => onOpenConsumer(c)}>
																Open →
															</Button>
														) : null}
														{onRemoveConsumer ? (
															<Button
																variant="ghost"
																size="sm"
																className="wwc:text-destructive wwc:hover:text-destructive"
																onClick={() => setPendingRemove(c)}
															>
																Remove
															</Button>
														) : null}
													</span>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</Card>

					<Card className="wwc:p-5">
						<h3 className="wwc:mb-4 wwc:text-base wwc:font-semibold">
							Used in {interfaces.length} interface{interfaces.length === 1 ? "" : "s"}
						</h3>
						{interfaces.length === 0 ? (
							<p className="wwc:text-sm wwc:text-muted-foreground">
								Not referenced by any interface. Interfaces can require this shared property from all implementors.
							</p>
						) : (
							<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
								{interfaces.map((i) => (
									<button
										key={i.id}
										type="button"
										onClick={() => onOpenInterface?.(i)}
										className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:rounded-full wwc:border wwc:border-border wwc:px-2.5 wwc:py-1 wwc:text-xs wwc:transition-colors wwc:hover:border-primary wwc:hover:text-primary"
									>
										<Tile icon={i.icon} />
										{i.label}
									</button>
								))}
							</div>
						)}
					</Card>

					{extra}

					{onDelete ? (
						<Card className="wwc:p-5">
							<h3 className="wwc:mb-4 wwc:text-base wwc:font-semibold wwc:text-destructive">Danger zone</h3>
							<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-4">
								<div>
									<p className="wwc:text-sm wwc:font-medium">Delete this shared property</p>
									<p className="wwc:text-sm wwc:text-muted-foreground">
										{consumers.length} consuming type{consumers.length === 1 ? "" : "s"} keep local copies; central
										governance is lost.
									</p>
								</div>
								<Button
									variant="outline"
									size="sm"
									className="wwc:shrink-0 wwc:border-destructive/40 wwc:text-destructive"
									onClick={() => setConfirmDelete(true)}
								>
									Delete…
								</Button>
							</div>
						</Card>
					) : null}
				</div>
			</div>

			<ConfirmDialog
				open={pendingRemove !== null}
				onOpenChange={(o) => !o && setPendingRemove(null)}
				destructive
				title="Remove from type"
				description={
					<>
						Remove shared property <span className="wwc:font-medium wwc:text-foreground">{current.displayName}</span>{" "}
						from <span className="wwc:font-medium wwc:text-foreground">{pendingRemove?.label}</span>? The property row
						is removed from that type.
					</>
				}
				confirmLabel="Remove"
				onConfirm={() => {
					if (pendingRemove) onRemoveConsumer?.(pendingRemove);
					setPendingRemove(null);
				}}
			/>

			<ConfirmDialog
				open={confirmDelete}
				onOpenChange={setConfirmDelete}
				destructive
				title="Delete shared property"
				description={
					<>
						Delete <span className="wwc:font-medium wwc:text-foreground">{current.displayName}</span>?{" "}
						{consumers.length} consumer{consumers.length === 1 ? "" : "s"} will be detached to local copies.
					</>
				}
				confirmLabel="Delete"
				onConfirm={() => {
					setConfirmDelete(false);
					onDelete?.();
				}}
			/>
		</div>
	);
}
