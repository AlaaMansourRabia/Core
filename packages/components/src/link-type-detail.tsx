import {cn} from "@core/core-utils";
import {ArrowLeft, Link2} from "lucide-react";
import * as React from "react";

import {Badge} from "./badge";
import {Button} from "./button";
import {Card} from "./card";
import {Input} from "./input";
import {Sheet, SheetClose, SheetContent, SheetTitle} from "./sheet";
import {ToggleGroup, ToggleGroupItem} from "./toggle-group";

// The link-type detail sheet, shared by every ontology surface. Data-driven: the host supplies the
// link type, the option sets, and any host-specific sections via `extra`. Nothing about a particular
// ontology is baked in here.

const SEGMENT_ON =
	"wwc:data-[state=on]:border-primary wwc:data-[state=on]:bg-primary/10 wwc:data-[state=on]:text-primary";

const STATUS_CLASS: Record<string, string> = {
	Endorsed: "wwc:text-violet-600 wwc:dark:text-violet-400",
	Active: "wwc:text-emerald-600 wwc:dark:text-emerald-400",
	Experimental: "wwc:text-amber-600 wwc:dark:text-amber-500",
	Deprecated: "wwc:text-muted-foreground",
};

export const LINK_CARDINALITY_LABELS: {value: string; short: string}[] = [
	{value: "one-to-one", short: "1:1"},
	{value: "one-to-many", short: "1:N"},
	{value: "many-to-one", short: "N:1"},
	{value: "many-to-many", short: "M:N"},
];

export const LINK_VISIBILITIES = ["Prominent", "Normal", "Hidden"];
export const LINK_STATUSES = ["Active", "Experimental", "Deprecated"];

/** One end of a link type. `objectTypeLabel` is what the user sees; `objectTypeId` is the host's key. */
export interface LinkTypeSide {
	objectTypeId?: string;
	objectTypeLabel: string;
	apiName: string;
	displayName: string;
	visibility: string;
}

/** The neutral link-type shape both the workforce and WC3 ontologies map onto. */
export interface LinkTypeModel {
	id: string;
	/** Resource identifier, shown under the title when present. */
	rid?: string;
	sideA: LinkTypeSide;
	sideB: LinkTypeSide;
	cardinality: string;
	/** Human-readable backing, e.g. "Foreign key (crew_id → crew_id)". */
	backing: string;
	status: string;
	description?: string;
	instanceLinks?: number;
}

/** A sample of the rows a link type actually connects, listed in the Instance links card. */
export interface LinkInstanceRow {
	aCode: string;
	aName: string;
	bCode: string;
	bName: string;
}

export interface LinkTypeDetailSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	linkType: LinkTypeModel | null;
	/** Glyph for an object type, looked up by its label. Falls back to a generic link icon. */
	iconFor?: (objectTypeLabel: string) => React.ComponentType<{className?: string}> | undefined;
	/** Sample instance links. Omit to hide the sample list and show only the count. */
	instanceRows?: LinkInstanceRow[];
	cardinalities?: {value: string; short: string}[];
	statuses?: string[];
	visibilities?: string[];
	/** Fired with the edited link type when "Save changes" is pressed. */
	onSave?: (next: LinkTypeModel) => void;
	/** Opens the graph explorer focused on this relationship. Hides the button when omitted. */
	onTraverse?: () => void;
	/** Host-specific sections appended below the standard cards (e.g. a danger zone). */
	extra?: React.ReactNode;
}

function FieldLabel({children}: {children: React.ReactNode}) {
	return <span className="wwc:block wwc:text-xs wwc:font-medium wwc:text-muted-foreground">{children}</span>;
}

function TypeTile({label, iconFor}: {label: string; iconFor?: LinkTypeDetailSheetProps["iconFor"]}) {
	const Icon = iconFor?.(label) ?? Link2;
	return (
		<span className="wwc:flex wwc:h-6 wwc:w-6 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-muted wwc:text-muted-foreground">
			<Icon className="wwc:h-3.5 wwc:w-3.5" />
		</span>
	);
}

/** Side editor — API name, display name and visibility for one end of the relationship. */
function SideFields({
	side,
	visibilities,
	onChange,
}: {
	side: LinkTypeSide;
	visibilities: string[];
	onChange: (next: LinkTypeSide) => void;
}) {
	return (
		<div className="wwc:space-y-3">
			<FieldLabel>Side — {side.objectTypeLabel}</FieldLabel>
			<div className="wwc:space-y-1.5">
				<FieldLabel>API name</FieldLabel>
				<Input
					value={side.apiName}
					onChange={(e) => onChange({...side, apiName: e.target.value})}
					className="wwc:font-mono"
				/>
			</div>
			<div className="wwc:space-y-1.5">
				<FieldLabel>Display name</FieldLabel>
				<Input value={side.displayName} onChange={(e) => onChange({...side, displayName: e.target.value})} />
			</div>
			<div className="wwc:space-y-1.5">
				<FieldLabel>Visibility</FieldLabel>
				<ToggleGroup
					type="single"
					value={side.visibility}
					onValueChange={(v) => v && onChange({...side, visibility: v})}
					variant="outline"
					size="sm"
					className="wwc:justify-start"
				>
					{visibilities.map((v) => (
						<ToggleGroupItem key={v} value={v} className={SEGMENT_ON}>
							{v}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
			</div>
		</div>
	);
}

/** Full link-type editor rendered as a 3/4-width sheet. */
export function LinkTypeDetailSheet({
	open,
	onOpenChange,
	linkType,
	iconFor,
	instanceRows,
	cardinalities = LINK_CARDINALITY_LABELS,
	statuses = LINK_STATUSES,
	visibilities = LINK_VISIBILITIES,
	onSave,
	onTraverse,
	extra,
}: LinkTypeDetailSheetProps) {
	const [draft, setDraft] = React.useState<LinkTypeModel | null>(null);
	const [dirty, setDirty] = React.useState(false);
	const [seeded, setSeeded] = React.useState<string | null>(null);

	// Re-seed whenever a different link type is opened; edits are local until saved.
	React.useEffect(() => {
		if (open && linkType && seeded !== linkType.id) {
			setSeeded(linkType.id);
			setDraft(linkType);
			setDirty(false);
		}
		if (!open && seeded !== null) setSeeded(null);
	}, [open, linkType, seeded]);

	const current = draft && linkType && draft.id === linkType.id ? draft : linkType;
	if (!current) return null;

	const patch = (next: Partial<LinkTypeModel>) => {
		setDraft({...current, ...next});
		setDirty(true);
	};

	const sampled = instanceRows ?? [];
	const total = current.instanceLinks ?? 0;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="right"
				className="wwc:flex wwc:w-3/4 wwc:max-w-none wwc:flex-col wwc:gap-0 wwc:p-0 wwc:sm:max-w-none wwc:[&>button]:hidden"
			>
				<div className="wwc:shrink-0 wwc:border-b wwc:border-border wwc:px-6 wwc:pt-5 wwc:pb-3">
					<div className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-4">
						<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-3">
							<TypeTile label={current.sideA.objectTypeLabel} iconFor={iconFor} />
							<TypeTile label={current.sideB.objectTypeLabel} iconFor={iconFor} />
							{/* SheetContent is a Dialog underneath — Radix requires a title for the accessible name. */}
							<SheetTitle className="wwc:text-2xl wwc:font-bold wwc:tracking-tight">
								{current.sideA.objectTypeLabel} ↔ {current.sideB.objectTypeLabel}
							</SheetTitle>
							<Badge variant="secondary" className="wwc:h-6 wwc:text-xs">
								{current.cardinality}
							</Badge>
							<span className={cn("wwc:text-sm wwc:font-semibold", STATUS_CLASS[current.status])}>
								{current.status}
							</span>
						</div>
						<SheetClose asChild>
							<Button variant="link" size="sm" className="wwc:h-auto wwc:gap-1 wwc:px-0">
								← All link types
							</Button>
						</SheetClose>
					</div>
					{current.rid ? (
						<code className="wwc:mt-2 wwc:block wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
							{current.rid}
						</code>
					) : null}
				</div>

				<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto wwc:bg-muted/20 wwc:p-6">
					<div className="wwc:grid wwc:grid-cols-1 wwc:gap-6 wwc:lg:grid-cols-2">
						<Card className="wwc:p-5">
							<h3 className="wwc:mb-4 wwc:text-base wwc:font-semibold">Definition</h3>
							<div className="wwc:space-y-4">
								<div className="wwc:space-y-1.5">
									<FieldLabel>Description</FieldLabel>
									<Input value={current.description ?? ""} onChange={(e) => patch({description: e.target.value})} />
								</div>
								<div className="wwc:grid wwc:grid-cols-2 wwc:gap-4">
									<SideFields side={current.sideA} visibilities={visibilities} onChange={(sideA) => patch({sideA})} />
									<SideFields side={current.sideB} visibilities={visibilities} onChange={(sideB) => patch({sideB})} />
								</div>
								<div className="wwc:space-y-1.5">
									<FieldLabel>Cardinality</FieldLabel>
									<ToggleGroup
										type="single"
										value={current.cardinality}
										onValueChange={(v) => v && patch({cardinality: v})}
										variant="outline"
										size="sm"
										className="wwc:justify-start"
									>
										{cardinalities.map((c) => (
											<ToggleGroupItem key={c.value} value={c.value} className={SEGMENT_ON}>
												{c.short}
											</ToggleGroupItem>
										))}
									</ToggleGroup>
								</div>
								<div className="wwc:space-y-1.5">
									<FieldLabel>Backing</FieldLabel>
									<Badge variant="secondary" className="wwc:h-6 wwc:font-mono wwc:text-xs">
										{current.backing}
									</Badge>
								</div>
							</div>
						</Card>

						<div className="wwc:space-y-6">
							<Card className="wwc:p-5">
								<h3 className="wwc:mb-4 wwc:text-base wwc:font-semibold">Lifecycle</h3>
								<div className="wwc:space-y-1.5">
									<FieldLabel>Status</FieldLabel>
									<ToggleGroup
										type="single"
										value={current.status}
										onValueChange={(v) => v && patch({status: v})}
										variant="outline"
										size="sm"
										className="wwc:justify-start"
									>
										{statuses.map((s) => (
											<ToggleGroupItem key={s} value={s} className={SEGMENT_ON}>
												{s}
											</ToggleGroupItem>
										))}
									</ToggleGroup>
									<p className="wwc:pt-2 wwc:text-sm wwc:text-primary">Deprecate before deleting.</p>
								</div>
							</Card>

							<Card className="wwc:p-5">
								<h3 className="wwc:mb-4 wwc:text-base wwc:font-semibold">
									Instance links <span className="wwc:text-muted-foreground">({total})</span>
								</h3>
								<div className="wwc:space-y-1.5 wwc:text-sm">
									{sampled.map((r) => (
										<div key={`${r.aCode}-${r.bCode}`} className="wwc:flex wwc:items-center wwc:gap-2">
											<span className="wwc:font-mono wwc:text-xs wwc:text-muted-foreground">{r.aCode}</span>
											<span className="wwc:text-primary">{r.aName}</span>
											<span className="wwc:text-muted-foreground">↝</span>
											<span className="wwc:font-mono wwc:text-xs wwc:text-muted-foreground">{r.bCode}</span>
											<span className="wwc:text-primary">{r.bName}</span>
										</div>
									))}
									{/* "+N more" only makes sense once some rows are actually listed. */}
									{sampled.length > 0 && total > sampled.length ? (
										<div className="wwc:text-muted-foreground">+ {total - sampled.length} more…</div>
									) : null}
									{sampled.length === 0 ? (
										<div className="wwc:text-muted-foreground">
											{total === 0
												? "No instance links yet — run an action that creates links."
												: `${total} instance link${total === 1 ? "" : "s"} in the store.`}
										</div>
									) : null}
								</div>
								{onTraverse ? (
									<Button variant="outline" size="sm" className="wwc:mt-4" onClick={onTraverse}>
										Traverse in graph view →
									</Button>
								) : null}
							</Card>

							{extra}
						</div>
					</div>
				</div>

				{dirty ? (
					<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:justify-between wwc:gap-4 wwc:border-t wwc:border-border wwc:bg-card wwc:px-6 wwc:py-3">
						<span className="wwc:text-sm wwc:text-muted-foreground">Unsaved changes</span>
						<div className="wwc:flex wwc:items-center wwc:gap-2">
							<Button
								variant="outline"
								onClick={() => {
									setDraft(linkType);
									setDirty(false);
								}}
							>
								Discard
							</Button>
							<Button
								onClick={() => {
									onSave?.(current);
									setDirty(false);
								}}
							>
								Save changes
							</Button>
						</div>
					</div>
				) : null}
			</SheetContent>
		</Sheet>
	);
}

// ─── Page variant ────────────────────────────────────────────────────────────

export interface LinkTypeDetailPageProps extends Omit<LinkTypeDetailSheetProps, "open" | "onOpenChange" | "linkType"> {
	linkType: LinkTypeModel;
	onBack: () => void;
}

/**
 * The same editor as {@link LinkTypeDetailSheet}, laid out as a full page with a fixed header and a
 * vertical SideMenu — matching the object-type drill-in. Hosts that prefer an overlay keep the sheet.
 */
export function LinkTypeDetailPage({
	linkType,
	iconFor,
	instanceRows,
	cardinalities = LINK_CARDINALITY_LABELS,
	statuses = LINK_STATUSES,
	visibilities = LINK_VISIBILITIES,
	onBack,
	onSave,
	onTraverse,
	extra,
}: LinkTypeDetailPageProps) {
	const [draft, setDraft] = React.useState(linkType);
	const [dirty, setDirty] = React.useState(false);

	React.useEffect(() => {
		setDraft(linkType);
		setDirty(false);
	}, [linkType]);

	const current = draft.id === linkType.id ? draft : linkType;
	const patch = (next: Partial<LinkTypeModel>) => {
		setDraft({...current, ...next});
		setDirty(true);
	};

	const sampled = instanceRows ?? [];
	const total = current.instanceLinks ?? 0;

	return (
		<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col">
			{/* Fixed bar sized to PageContentHeader (compact -> min-h-12, px-3), same as the object type. */}
			<div className="wwc:flex wwc:min-h-12 wwc:shrink-0 wwc:items-center wwc:justify-between wwc:gap-3 wwc:border-b wwc:border-border wwc:bg-card wwc:px-3">
				<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-2.5">
					<Button variant="ghost" size="sm" className="wwc:gap-1.5" onClick={onBack}>
						<ArrowLeft className="wwc:h-4 wwc:w-4" />
						Back
					</Button>
					<div className="wwc:h-5 wwc:w-px wwc:shrink-0 wwc:bg-border" />
					{/* A link type joins TWO object types, so both glyphs show — same as the sheet header. */}
					<span className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-1">
						<TypeTile label={current.sideA.objectTypeLabel} iconFor={iconFor} />
						<TypeTile label={current.sideB.objectTypeLabel} iconFor={iconFor} />
					</span>
					<h1 className="wwc:truncate wwc:text-sm wwc:font-semibold">
						{current.sideA.objectTypeLabel} ↔ {current.sideB.objectTypeLabel}
					</h1>
					<Badge variant="secondary">{current.cardinality}</Badge>
					<span className={cn("wwc:text-xs wwc:font-semibold", STATUS_CLASS[current.status])}>{current.status}</span>
					{current.rid ? (
						<span className="wwc:hidden wwc:truncate wwc:font-mono wwc:text-[11px] wwc:text-muted-foreground wwc:lg:inline">
							{current.rid}
						</span>
					) : null}
				</div>
				{dirty ? (
					<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								setDraft(linkType);
								setDirty(false);
							}}
						>
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
					</div>
				) : null}
			</div>

			{/*
			 * No section nav: a link type has four short sections, so they stack. Surfaces with enough
			 * detail to scroll (the object type) put their sections in a left SideMenu instead.
			 */}
			<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto">
				<div className="wwc:w-full wwc:space-y-4 wwc:p-6">
					<Card className="wwc:p-5">
						<h3 className="wwc:mb-4 wwc:text-base wwc:font-semibold">Definition</h3>
						<div className="wwc:space-y-4">
							<div className="wwc:space-y-1.5">
								<FieldLabel>Description</FieldLabel>
								<Input value={current.description ?? ""} onChange={(e) => patch({description: e.target.value})} />
							</div>
							<div className="wwc:space-y-1.5">
								<FieldLabel>Cardinality</FieldLabel>
								<ToggleGroup
									type="single"
									value={current.cardinality}
									onValueChange={(v) => v && patch({cardinality: v})}
									variant="outline"
									size="sm"
									className="wwc:justify-start"
								>
									{cardinalities.map((c) => (
										<ToggleGroupItem key={c.value} value={c.value} className={SEGMENT_ON}>
											{c.short}
										</ToggleGroupItem>
									))}
								</ToggleGroup>
							</div>
							<div className="wwc:space-y-1.5">
								<FieldLabel>Backing</FieldLabel>
								<Badge variant="secondary" className="wwc:h-6 wwc:font-mono wwc:text-xs">
									{current.backing}
								</Badge>
							</div>
						</div>
					</Card>

					<Card className="wwc:p-5">
						<div className="wwc:grid wwc:gap-6 wwc:md:grid-cols-2">
							<SideFields side={current.sideA} visibilities={visibilities} onChange={(sideA) => patch({sideA})} />
							<SideFields side={current.sideB} visibilities={visibilities} onChange={(sideB) => patch({sideB})} />
						</div>
					</Card>

					<Card className="wwc:p-5">
						<h3 className="wwc:mb-4 wwc:text-base wwc:font-semibold">Lifecycle</h3>
						<div className="wwc:space-y-1.5">
							<FieldLabel>Status</FieldLabel>
							<ToggleGroup
								type="single"
								value={current.status}
								onValueChange={(v) => v && patch({status: v})}
								variant="outline"
								size="sm"
								className="wwc:justify-start"
							>
								{statuses.map((st) => (
									<ToggleGroupItem key={st} value={st} className={SEGMENT_ON}>
										{st}
									</ToggleGroupItem>
								))}
							</ToggleGroup>
							<p className="wwc:pt-2 wwc:text-sm wwc:text-primary">Deprecate before deleting.</p>
						</div>
					</Card>

					<Card className="wwc:p-5">
						<h3 className="wwc:mb-4 wwc:text-base wwc:font-semibold">
							Instance links <span className="wwc:text-muted-foreground">({total})</span>
						</h3>
						<div className="wwc:space-y-1.5 wwc:text-sm">
							{sampled.map((r) => (
								<div key={`${r.aCode}-${r.bCode}`} className="wwc:flex wwc:items-center wwc:gap-2">
									<span className="wwc:font-mono wwc:text-xs wwc:text-muted-foreground">{r.aCode}</span>
									<span className="wwc:text-primary">{r.aName}</span>
									<span className="wwc:text-muted-foreground">↝</span>
									<span className="wwc:font-mono wwc:text-xs wwc:text-muted-foreground">{r.bCode}</span>
									<span className="wwc:text-primary">{r.bName}</span>
								</div>
							))}
							{/* "+N more" only makes sense once some rows are actually listed. */}
							{sampled.length > 0 && total > sampled.length ? (
								<div className="wwc:text-muted-foreground">+ {total - sampled.length} more…</div>
							) : null}
							{sampled.length === 0 ? (
								<div className="wwc:text-muted-foreground">
									{total === 0
										? "No instance links yet — run an action that creates links."
										: `${total} instance link${total === 1 ? "" : "s"} in the store.`}
								</div>
							) : null}
						</div>
						{onTraverse ? (
							<Button variant="outline" size="sm" className="wwc:mt-4" onClick={onTraverse}>
								Traverse in graph view →
							</Button>
						) : null}
					</Card>

					{extra}
				</div>
			</div>
		</div>
	);
}
