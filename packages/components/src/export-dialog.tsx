import {cn} from "@core/core-utils";
import {FileSpreadsheet, FileText, Plus} from "lucide-react";
import * as React from "react";

import {Button} from "./button";
import {Chip} from "./chip";
import {DateRangeTimePicker} from "./date-picker";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./dialog";
import {Label} from "./label";
import {RadioGroup, RadioGroupItem} from "./radio-group";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./select";
import {Switch} from "./switch";

/* -----------------------------------------------------------------------------
 * ExportDialog — the shared "export this list" surface.
 *
 * One decision comes first: reuse a saved template, or build a one-off export.
 * A template already carries its file type and scope, so those controls are NOT
 * offered alongside it — picking a template shows what it will produce, read-only.
 * Choosing "New export" is what unlocks file type and scope. The date range applies
 * to both — a template defines shape, not the window it covers. Authoring a template
 * is a separate flow: `onCreateTemplate` renders a "New template" action that hands off.
 *
 * It is a dialog rather than a dropdown because those choices don't fit a menu and
 * the user needs to see them together before committing.
 *
 * Controlled or uncontrolled: pass `open`/`onOpenChange` to drive it, or hand it a
 * `trigger` and let it own its own state. `onExport` receives the resolved
 * selection — this component never performs the export itself.
 *
 * Usage:
 *
 *   <ExportDialog
 *     trigger={<Button variant="outline" icon aria-label="Export"><Download /></Button>}
 *     templates={[{id: "weekly", label: "Weekly summary", fileType: "pdf", includeFilters: true}]}
 *     activeFilterCount={3}
 *     onExport={({fileType, includeFilters, templateId, dateRange}) => …}
 *   />
 * -------------------------------------------------------------------------- */

export type ExportFileType = "pdf" | "excel";

export type ExportTemplateOption = {
	id: string;
	label: string;
	/** Optional hint shown under the template select. */
	description?: string;
	/** The file type this template produces. Defaults to "pdf". */
	fileType?: ExportFileType;
	/** Whether this template exports the filtered view. Defaults to true. */
	includeFilters?: boolean;
};

export type ExportDateRange = {from: Date | undefined; to: Date | undefined};

export type ExportSubmission = {
	/** Resolved file type — from the template when one is selected. */
	fileType: ExportFileType;
	/** Resolved scope — from the template when one is selected. */
	includeFilters: boolean;
	/** Set when an existing template was chosen. */
	templateId?: string;
	/** Period the export covers. `from`/`to` are undefined when the user left it empty. */
	dateRange: ExportDateRange;
};

export interface ExportDialogProps {
	/** Controlled open state. Omit to let the dialog manage its own. */
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** Element that opens the dialog. Omit when driving `open` yourself. */
	trigger?: React.ReactNode;
	/** Saved templates to pick from. Empty/omitted leaves only the one-off export. */
	templates?: ExportTemplateOption[];
	title?: React.ReactNode;
	description?: React.ReactNode;
	defaultFileType?: ExportFileType;
	defaultIncludeFilters?: boolean;
	/** Shown beside the scope toggle so the user knows what "current filters" means. */
	activeFilterCount?: number;
	/** Seeds the date range each time the dialog opens — e.g. the range already applied to the list. */
	defaultDateRange?: ExportDateRange;
	/** When provided, a "New template" action renders bottom-left and hands off to the template flow. */
	onCreateTemplate?: () => void;
	newTemplateLabel?: React.ReactNode;
	/** Fires on Export with the resolved selection. The dialog closes afterwards. */
	onExport?: (submission: ExportSubmission) => void;
	exportLabel?: React.ReactNode;
	className?: string;
}

const FILE_TYPES: {value: ExportFileType; label: string; icon: React.ReactNode}[] = [
	{value: "pdf", label: "PDF", icon: <FileText className="wwc:h-3.5 wwc:w-3.5" />},
	{value: "excel", label: "Excel", icon: <FileSpreadsheet className="wwc:h-3.5 wwc:w-3.5" />},
];

const fileTypeLabel = (value: ExportFileType) => FILE_TYPES.find((t) => t.value === value)?.label ?? value;

/** Section wrapper — each block is separated by a rule, not just whitespace. */
function Section({title, children}: {title: React.ReactNode; children: React.ReactNode}) {
	return (
		<div className="wwc:border-b wwc:px-4 wwc:py-3 wwc:last:border-b-0">
			<p className="wwc:mb-2.5 wwc:text-xs wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
				{title}
			</p>
			{children}
		</div>
	);
}

/** Read-only "this is what the template produces" row. */
function SummaryRow({label, value}: {label: string; value: React.ReactNode}) {
	return (
		<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-3 wwc:py-1">
			<span className="wwc:text-xs wwc:text-muted-foreground">{label}</span>
			<span className="wwc:text-xs wwc:font-medium wwc:text-foreground">{value}</span>
		</div>
	);
}

function ExportDialog({
	open,
	onOpenChange,
	trigger,
	templates = [],
	title = "Export",
	description,
	defaultFileType = "pdf",
	defaultIncludeFilters = true,
	activeFilterCount,
	defaultDateRange,
	onCreateTemplate,
	newTemplateLabel = "New template",
	onExport,
	exportLabel = "Export",
	className,
}: ExportDialogProps) {
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
	const isControlled = open !== undefined;
	const isOpen = isControlled ? open : uncontrolledOpen;

	const hasTemplates = templates.length > 0;

	const [mode, setMode] = React.useState<"saved" | "new">(hasTemplates ? "saved" : "new");
	const [templateId, setTemplateId] = React.useState<string | undefined>(templates[0]?.id);
	// Errors stay hidden until the first submit, so an untouched form is never pre-scolded.
	const [showErrors, setShowErrors] = React.useState(false);
	const [fileType, setFileType] = React.useState<ExportFileType>(defaultFileType);
	const [includeFilters, setIncludeFilters] = React.useState(defaultIncludeFilters);
	const [dateRange, setDateRange] = React.useState<ExportDateRange>(
		defaultDateRange ?? {from: undefined, to: undefined},
	);

	// Reopening starts from the defaults again — a stale half-filled form is worse than a fresh one.
	const setOpenState = React.useCallback(
		(next: boolean) => {
			if (next) {
				setMode(hasTemplates ? "saved" : "new");
				setTemplateId(templates[0]?.id);
				setFileType(defaultFileType);
				setIncludeFilters(defaultIncludeFilters);
				setDateRange(defaultDateRange ?? {from: undefined, to: undefined});
			}
			if (!isControlled) setUncontrolledOpen(next);
			onOpenChange?.(next);
		},
		[defaultDateRange, defaultFileType, defaultIncludeFilters, hasTemplates, isControlled, onOpenChange, templates],
	);

	const selectedTemplate = templates.find((t) => t.id === templateId);
	const usingTemplate = mode === "saved" && hasTemplates;

	// A template owns its own file type and scope; the one-off export reads the live controls.
	const resolvedFileType = usingTemplate ? (selectedTemplate?.fileType ?? "pdf") : fileType;
	const resolvedIncludeFilters = usingTemplate ? (selectedTemplate?.includeFilters ?? true) : includeFilters;

	const templateError = usingTemplate && templateId === undefined ? "Select a template to export." : undefined;

	const scopeText = (on: boolean) =>
		on
			? activeFilterCount !== undefined
				? `Filtered view · ${activeFilterCount} active filter${activeFilterCount === 1 ? "" : "s"}`
				: "Filtered view"
			: "All records";

	const handleExport = () => {
		if (templateError) {
			setShowErrors(true);
			return;
		}
		onExport?.({
			fileType: resolvedFileType,
			includeFilters: resolvedIncludeFilters,
			templateId: usingTemplate ? templateId : undefined,
			dateRange,
		});
		setOpenState(false);
	};

	// Period applies to both modes — a template defines shape, not the window it covers.
	const dateSection = (
		<Section title="Date range">
			<DateRangeTimePicker
				dateRange={dateRange}
				onDateRangeChange={setDateRange}
				placeholder="Select a date range"
				className="wwc:h-8 wwc:w-full wwc:text-[13px]"
			/>
		</Section>
	);

	return (
		<Dialog open={isOpen} onOpenChange={setOpenState}>
			{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
			<DialogContent className={cn("wwc:gap-0 wwc:p-0 wwc:sm:max-w-[560px]", className)}>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					{description && <DialogDescription className="wwc:text-xs">{description}</DialogDescription>}
				</DialogHeader>

				{/* ── What to export: a saved template, or a one-off ── */}
				{hasTemplates && (
					<Section title="Export using">
						<RadioGroup
							value={mode}
							onValueChange={(v) => setMode(v as "saved" | "new")}
							className="wwc:grid-cols-2 wwc:gap-2"
						>
							{[
								{value: "saved", label: "Saved template"},
								{value: "new", label: "New export"},
							].map((option) => (
								<Label
									key={option.value}
									htmlFor={`export-mode-${option.value}`}
									className={cn(
										"wwc:flex wwc:cursor-pointer wwc:items-center wwc:gap-2 wwc:rounded-md wwc:border wwc:px-3 wwc:py-2 wwc:text-[13px] wwc:font-normal",
										mode === option.value ? "wwc:border-primary wwc:bg-accent" : "wwc:border-border",
									)}
								>
									<RadioGroupItem id={`export-mode-${option.value}`} value={option.value} />
									{option.label}
								</Label>
							))}
						</RadioGroup>
					</Section>
				)}

				{usingTemplate ? (
					/* ── Template: pick it, then see what it produces (not editable here) ── */
					<>
						<Section title="Template">
							<Select value={templateId} onValueChange={setTemplateId}>
								<SelectTrigger className="wwc:h-8 wwc:text-[13px]">
									<SelectValue placeholder="Select a template" />
								</SelectTrigger>
								<SelectContent>
									{templates.map((template) => (
										<SelectItem key={template.id} value={template.id} className="wwc:text-[13px]">
											{template.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{showErrors && templateError && (
								<p className="wwc:mt-1.5 wwc:text-xs wwc:text-destructive">{templateError}</p>
							)}
							{selectedTemplate?.description && (
								<p className="wwc:mt-1.5 wwc:text-xs wwc:text-muted-foreground">{selectedTemplate.description}</p>
							)}
							<div className="wwc:mt-3 wwc:rounded-md wwc:border wwc:bg-muted/40 wwc:px-3 wwc:py-2">
								<SummaryRow label="File type" value={fileTypeLabel(resolvedFileType)} />
								<SummaryRow label="Scope" value={scopeText(resolvedIncludeFilters)} />
							</div>
						</Section>
						{dateSection}
					</>
				) : (
					/* ── One-off: file type + scope are the user's to set ── */
					<>
						<Section title="File type">
							<div className="wwc:flex wwc:flex-wrap wwc:gap-1.5">
								{FILE_TYPES.map((type) => (
									<Chip
										key={type.value}
										size="sm"
										pressed={fileType === type.value}
										onPressedChange={(next) => next && setFileType(type.value)}
									>
										<span className="wwc:flex wwc:items-center wwc:gap-1.5">
											{type.icon}
											{type.label}
										</span>
									</Chip>
								))}
							</div>
						</Section>

						<Section title="Scope">
							<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-3">
								<Label htmlFor="export-include-filters" className="wwc:cursor-pointer wwc:font-normal">
									<span className="wwc:block wwc:text-[13px]">Apply current filters</span>
									<span className="wwc:block wwc:text-xs wwc:text-muted-foreground">{scopeText(includeFilters)}</span>
								</Label>
								<Switch id="export-include-filters" checked={includeFilters} onCheckedChange={setIncludeFilters} />
							</div>
						</Section>

						{dateSection}
					</>
				)}

				<DialogFooter className="wwc:border-t wwc:border-border wwc:px-4 wwc:py-2 wwc:sm:justify-between">
					{/* Authoring a template is its own flow — this hands off, it does not export. */}
					{onCreateTemplate ? (
						<Button variant="outline" size="sm" onClick={onCreateTemplate}>
							<Plus className="wwc:h-3.5 wwc:w-3.5" />
							{newTemplateLabel}
						</Button>
					) : (
						<span />
					)}
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						<Button variant="ghost" size="sm" onClick={() => setOpenState(false)}>
							Cancel
						</Button>
						<Button size="sm" onClick={handleExport}>
							{exportLabel}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
ExportDialog.displayName = "ExportDialog";

export {ExportDialog};
