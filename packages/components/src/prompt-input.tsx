import {cn} from "@corensystem/core-utils";
import {
	ArrowUp,
	AtSign,
	Check,
	ChevronDown,
	FileText,
	Mic,
	Paperclip,
	Plus,
	SlidersHorizontal,
	Square,
	X,
} from "lucide-react";
import * as React from "react";

import {Button} from "./button";
import {Chip, type AttachmentPreview} from "./chip";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "./dropdown-menu";
import {Popover, PopoverContent, PopoverTrigger} from "./popover";

export interface PromptAttachment {
	id: string;
	label: string;
	type?: "file" | "context";
	icon?: React.ReactNode;
	/** Secondary line shown under the label — renders the chip as a richer file card. */
	subtitle?: string;
	/** Optional hover preview content. */
	preview?: AttachmentPreview;
}

export interface PromptContextItem {
	id: string;
	label: string;
	description?: string;
	icon?: React.ReactNode;
}

/** A selectable model shown in the model-picker dropdown. */
export interface PromptModel {
	id: string;
	label: string;
	icon?: React.ReactNode;
	/** Trailing marker (e.g. a plan/region badge). */
	badge?: React.ReactNode;
	description?: string;
	/** Dim and make the option unselectable (e.g. "coming soon"). */
	disabled?: boolean;
}

/** A tool toggled from the Tools menu; active tools show as pills in the toolbar. */
export interface PromptTool {
	id: string;
	label: string;
	icon?: React.ReactNode;
}

/** An action inside the `+` menu (Upload file is added automatically from `onUploadFile`). */
export interface PromptAddAction {
	id: string;
	label: string;
	icon?: React.ReactNode;
	onSelect: () => void;
}

/** A quick-action pill rendered in a row beneath the composer. */
export interface PromptSuggestion {
	id: string;
	label: string;
	icon?: React.ReactNode;
	onSelect?: () => void;
}

export interface PromptInputProps {
	value: string;
	onChange: (value: string) => void;
	onSend: (value: string) => void;

	placeholder?: string;
	disabled?: boolean;
	/** Response generation is in progress. Keeps the textarea editable while disabling the send action. */
	submitting?: boolean;
	autoFocus?: boolean;

	/** Attachments displayed as removable chips/cards above the textarea. */
	attachments?: PromptAttachment[];
	onRemoveAttachment?: (id: string) => void;

	/** When provided, shows an "Add context" button that opens a popover with these items. */
	availableContext?: PromptContextItem[];
	onAddContext?: (item: PromptContextItem) => void;

	/** When provided, shows an "Upload file" entry inside the `+` menu (hidden file input). */
	onUploadFile?: (files: FileList) => void;
	/** File types accepted by the upload input (e.g. ".pdf,.png"). */
	acceptFileTypes?: string;
	/** Allow multiple file selection. Defaults to true. */
	multipleFiles?: boolean;

	/** Extra actions in the `+` menu, after "Upload file". */
	addActions?: PromptAddAction[];

	/** Tools shown in the Tools menu. Active ones render as removable pills in the toolbar. */
	tools?: PromptTool[];
	activeToolIds?: string[];
	onToolToggle?: (id: string) => void;

	/** Selectable models. Shows a model-picker button on the right when provided. */
	models?: PromptModel[];
	modelId?: string;
	onModelChange?: (id: string) => void;

	/** Shows a microphone button. Called on click; `recording` drives the active state. */
	onMic?: () => void;
	recording?: boolean;

	/** Quick-action pills rendered in a row below the composer. */
	suggestions?: PromptSuggestion[];

	/** Extra slots rendered just before the model selector (legacy escape hatch). */
	trailingActions?: React.ReactNode;

	/** Override the Send button icon. */
	sendLabel?: React.ReactNode;

	/** Min/max textarea heights in pixels. Defaults: 88 (≈3 lines) / 198. */
	minHeight?: number;
	maxHeight?: number;

	className?: string;
}

const LINE_HEIGHT = 22;
const PADDING_Y = 22;

/**
 * A flexible AI prompt composer. Composes:
 * - removable attachment chips / file cards
 * - an auto-resizing textarea (Enter to send, Shift+Enter for newline)
 * - a `+` menu (Upload file + custom actions)
 * - a Tools menu whose active tools appear as removable pills
 * - an "Add context" popover with a searchable list
 * - a model-picker dropdown, a mic button, and a Send button
 * - an optional row of suggestion pills beneath the composer
 */
export function PromptInput({
	value,
	onChange,
	onSend,
	placeholder = "Ask anything...",
	disabled = false,
	submitting = false,
	autoFocus = true,
	attachments,
	onRemoveAttachment,
	availableContext,
	onAddContext,
	onUploadFile,
	acceptFileTypes,
	multipleFiles = true,
	addActions,
	tools,
	activeToolIds,
	onToolToggle,
	models,
	modelId,
	onModelChange,
	onMic,
	recording = false,
	suggestions,
	trailingActions,
	sendLabel,
	minHeight = LINE_HEIGHT * 3 + PADDING_Y,
	maxHeight = LINE_HEIGHT * 8 + PADDING_Y,
	className,
}: PromptInputProps) {
	const textareaRef = React.useRef<HTMLTextAreaElement>(null);
	const fileInputRef = React.useRef<HTMLInputElement>(null);
	const [showScrollbar, setShowScrollbar] = React.useState(false);

	const hasAttachments = attachments !== undefined && attachments.length > 0;
	const canSend = !disabled && !submitting && (value.trim().length > 0 || hasAttachments);

	const handleSubmit = () => {
		if (!canSend) return;
		onSend(value.trim());
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	React.useEffect(() => {
		if (!textareaRef.current) return;
		textareaRef.current.style.height = `${minHeight}px`;
		const scrollHeight = textareaRef.current.scrollHeight;
		const newHeight = Math.min(scrollHeight, maxHeight);
		textareaRef.current.style.height = `${newHeight}px`;
		setShowScrollbar(scrollHeight > maxHeight);
	}, [value, minHeight, maxHeight]);

	React.useEffect(() => {
		if (autoFocus) textareaRef.current?.focus();
	}, [autoFocus]);

	const showAddContext = availableContext !== undefined && onAddContext !== undefined;
	const showUpload = onUploadFile !== undefined;
	const showPlusMenu = showUpload || (addActions !== undefined && addActions.length > 0);
	const showTools = tools !== undefined && tools.length > 0;
	const showModels = models !== undefined && models.length > 0;
	const activeTools = showTools ? tools.filter((t) => activeToolIds?.includes(t.id)) : [];
	const selectedModel = showModels ? (models.find((m) => m.id === modelId) ?? models[0]) : undefined;

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0 && onUploadFile) {
			onUploadFile(e.target.files);
			e.target.value = "";
		}
	};

	return (
		<div className={cn("wwc:flex wwc:w-full wwc:flex-col wwc:gap-2", className)}>
			<div
				aria-busy={submitting || undefined}
				className={cn(
					"wwc:flex wwc:w-full wwc:flex-col wwc:rounded-2xl wwc:border wwc:bg-card wwc:transition-shadow wwc:focus-within:ring-2 wwc:focus-within:ring-ring/30",
					disabled && "wwc:opacity-60",
				)}
			>
				{hasAttachments && (
					<div className="wwc:flex wwc:flex-wrap wwc:gap-1.5 wwc:px-3 wwc:pt-3">
						{attachments.map((att) => (
							<AttachmentChip key={att.id} attachment={att} onRemove={onRemoveAttachment} />
						))}
					</div>
				)}

				<textarea
					ref={textareaRef}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					disabled={disabled}
					rows={1}
					className={cn(
						"wwc:w-full wwc:resize-none wwc:bg-transparent wwc:px-4 wwc:py-3 wwc:text-sm wwc:leading-[22px] wwc:text-foreground wwc:placeholder:text-muted-foreground wwc:focus:outline-none wwc:disabled:cursor-not-allowed",
						showScrollbar ? "wwc:overflow-y-auto" : "wwc:overflow-hidden",
					)}
					style={{minHeight: `${minHeight}px`, maxHeight: `${maxHeight}px`}}
				/>

				<div className="wwc:flex wwc:items-center wwc:gap-1 wwc:px-2 wwc:pb-2">
					{showPlusMenu && (
						<AddMenu
							onUploadClick={showUpload ? () => fileInputRef.current?.click() : undefined}
							addActions={addActions}
							disabled={disabled}
						/>
					)}
					{showUpload && (
						<input
							ref={fileInputRef}
							type="file"
							className="wwc:hidden"
							accept={acceptFileTypes}
							multiple={multipleFiles}
							onChange={handleFileChange}
						/>
					)}
					{showTools && (
						<ToolsMenu tools={tools} activeToolIds={activeToolIds} onToolToggle={onToolToggle} disabled={disabled} />
					)}
					{showAddContext && (
						<AddContextButton availableContext={availableContext} onAddContext={onAddContext} disabled={disabled} />
					)}
					{activeTools.map((t) => (
						<button
							key={t.id}
							type="button"
							disabled={disabled}
							onClick={() => onToolToggle?.(t.id)}
							className="wwc:inline-flex wwc:items-center wwc:gap-1.5 wwc:rounded-full wwc:bg-primary/10 wwc:px-2.5 wwc:py-1 wwc:text-[13px] wwc:font-medium wwc:text-primary wwc:transition-colors wwc:hover:bg-primary/20"
						>
							{t.icon}
							{t.label}
							<X className="wwc:h-3 wwc:w-3" />
						</button>
					))}

					<span className="wwc:flex-1" />

					{trailingActions}
					{showModels && (
						<ModelSelect models={models} selected={selectedModel} onModelChange={onModelChange} disabled={disabled} />
					)}
					{onMic && (
						<Button
							type="button"
							variant="ghost"
							icon
							onClick={onMic}
							disabled={disabled}
							aria-label={recording ? "Stop recording" : "Start voice input"}
							aria-pressed={recording}
							className={cn("wwc:rounded-full", recording && "wwc:bg-primary/10 wwc:text-primary")}
						>
							<Mic />
						</Button>
					)}
					<Button
						type="button"
						icon
						size="sm"
						onClick={handleSubmit}
						disabled={!canSend}
						aria-label={submitting ? "Generating response" : "Send"}
						className="wwc:rounded-full"
					>
						{submitting ? <Square className="wwc:!size-3 wwc:fill-current" /> : (sendLabel ?? <ArrowUp />)}
					</Button>
				</div>
			</div>

			{suggestions !== undefined && suggestions.length > 0 && (
				<div className="wwc:flex wwc:flex-wrap wwc:gap-1.5">
					{suggestions.map((s) => (
						<button
							key={s.id}
							type="button"
							disabled={disabled}
							onClick={s.onSelect}
							className="wwc:inline-flex wwc:items-center wwc:gap-1.5 wwc:rounded-full wwc:border wwc:bg-card wwc:px-3 wwc:py-1.5 wwc:text-[13px] wwc:text-foreground wwc:transition-colors wwc:hover:bg-muted wwc:disabled:opacity-60"
						>
							{s.icon}
							{s.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

function AttachmentChip({attachment, onRemove}: {attachment: PromptAttachment; onRemove?: (id: string) => void}) {
	const defaultIcon =
		attachment.type === "context" ? <AtSign className="wwc:h-3 wwc:w-3" /> : <FileText className="wwc:h-3 wwc:w-3" />;

	// Richer file card (icon tile + name + subtitle) when a subtitle is provided.
	if (attachment.subtitle) {
		return (
			<div className="wwc:group wwc:relative wwc:flex wwc:items-center wwc:gap-2 wwc:rounded-lg wwc:border wwc:bg-muted/40 wwc:py-1.5 wwc:pl-1.5 wwc:pr-6">
				<span className="wwc:flex wwc:h-8 wwc:w-8 wwc:flex-shrink-0 wwc:items-center wwc:justify-center wwc:rounded-md wwc:bg-card wwc:text-muted-foreground">
					{attachment.icon ?? <FileText className="wwc:h-4 wwc:w-4" />}
				</span>
				<span className="wwc:min-w-0">
					<span className="wwc:block wwc:max-w-[160px] wwc:truncate wwc:text-[13px] wwc:font-medium wwc:text-foreground">
						{attachment.label}
					</span>
					<span className="wwc:block wwc:truncate wwc:text-xs wwc:text-muted-foreground">{attachment.subtitle}</span>
				</span>
				{onRemove && (
					<button
						type="button"
						onClick={() => onRemove(attachment.id)}
						aria-label={`Remove ${attachment.label}`}
						className="wwc:absolute wwc:right-1 wwc:top-1 wwc:flex wwc:h-4 wwc:w-4 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-foreground/60 wwc:text-background wwc:opacity-0 wwc:transition-opacity wwc:group-hover:opacity-100"
					>
						<X className="wwc:h-2.5 wwc:w-2.5" />
					</button>
				)}
			</div>
		);
	}

	return (
		<Chip
			variant="attachment"
			leadingIcon={attachment.icon ?? defaultIcon}
			onRemove={onRemove ? () => onRemove(attachment.id) : undefined}
			removeLabel={`Remove ${attachment.label}`}
			preview={attachment.preview}
		>
			{attachment.label}
		</Chip>
	);
}

function AddMenu({
	onUploadClick,
	addActions,
	disabled,
}: {
	onUploadClick?: () => void;
	addActions?: PromptAddAction[];
	disabled?: boolean;
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button type="button" variant="ghost" icon disabled={disabled} aria-label="Add" className="wwc:rounded-full">
					<Plus />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent side="top" align="start" className="wwc:w-52">
				{onUploadClick && (
					<DropdownMenuItem
						// Defer the file-picker click until after the menu finishes closing —
						// a synchronous <input type=file> click during Radix's teardown is
						// swallowed by the browser, so the picker never opens.
						onSelect={() => setTimeout(() => onUploadClick(), 0)}
						className="wwc:gap-2"
					>
						<Paperclip className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
						Upload file
					</DropdownMenuItem>
				)}
				{addActions?.map((a) => (
					<DropdownMenuItem key={a.id} onSelect={a.onSelect} className="wwc:gap-2">
						<span className="wwc:text-muted-foreground">{a.icon}</span>
						{a.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function ToolsMenu({
	tools,
	activeToolIds,
	onToolToggle,
	disabled,
}: {
	tools: PromptTool[];
	activeToolIds?: string[];
	onToolToggle?: (id: string) => void;
	disabled?: boolean;
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button type="button" variant="ghost" size="sm" disabled={disabled} className="wwc:gap-1.5 wwc:rounded-full">
					<SlidersHorizontal />
					<span className="wwc:hidden wwc:sm:inline">Tools</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent side="top" align="start" className="wwc:w-56">
				<DropdownMenuLabel>Tools</DropdownMenuLabel>
				{tools.map((t) => {
					const active = activeToolIds?.includes(t.id);
					return (
						<DropdownMenuItem
							key={t.id}
							onSelect={(e) => {
								e.preventDefault();
								onToolToggle?.(t.id);
							}}
							className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2"
						>
							<span className="wwc:flex wwc:items-center wwc:gap-2">
								<span className="wwc:text-muted-foreground">{t.icon}</span>
								{t.label}
							</span>
							{active && <Check className="wwc:h-4 wwc:w-4 wwc:text-primary" />}
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function ModelSelect({
	models,
	selected,
	onModelChange,
	disabled,
}: {
	models: PromptModel[];
	selected?: PromptModel;
	onModelChange?: (id: string) => void;
	disabled?: boolean;
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					disabled={disabled}
					className="wwc:gap-1.5 wwc:rounded-full wwc:text-foreground/80"
				>
					{selected?.icon}
					<span className="wwc:font-medium">{selected?.label}</span>
					<ChevronDown className="wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent side="top" align="end" className="wwc:w-64">
				<DropdownMenuLabel>Models</DropdownMenuLabel>
				{models.map((m) => (
					<DropdownMenuItem
						key={m.id}
						disabled={m.disabled}
						onSelect={() => onModelChange?.(m.id)}
						className="wwc:flex wwc:items-center wwc:gap-2"
					>
						<span className="wwc:text-muted-foreground">{m.icon}</span>
						<span className="wwc:flex-1 wwc:min-w-0">
							<span className="wwc:block wwc:truncate wwc:font-medium wwc:text-foreground">{m.label}</span>
							{m.description && (
								<span className="wwc:block wwc:truncate wwc:text-xs wwc:text-muted-foreground">{m.description}</span>
							)}
						</span>
						{m.badge ?? (m.disabled && <span className="wwc:text-[11px] wwc:text-muted-foreground">Soon</span>)}
						{m.id === selected?.id && <Check className="wwc:h-4 wwc:w-4 wwc:text-primary" />}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function AddContextButton({
	availableContext,
	onAddContext,
	disabled,
}: {
	availableContext: PromptContextItem[];
	onAddContext: (item: PromptContextItem) => void;
	disabled?: boolean;
}) {
	const [open, setOpen] = React.useState(false);
	const [query, setQuery] = React.useState("");

	const filtered = React.useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return availableContext;
		return availableContext.filter(
			(item) => item.label.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q),
		);
	}, [availableContext, query]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button type="button" variant="ghost" size="sm" disabled={disabled} className="wwc:gap-1.5 wwc:rounded-full">
					<AtSign />
					<span className="wwc:hidden wwc:sm:inline">Add context</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent side="top" align="start" sideOffset={8} className="wwc:w-72 wwc:p-0">
				<div className="wwc:border-b wwc:p-2">
					<input
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search context..."
						className="wwc:w-full wwc:bg-transparent wwc:px-2 wwc:py-1 wwc:text-sm wwc:outline-none wwc:placeholder:text-muted-foreground"
						autoFocus
					/>
				</div>
				<div className="wwc:max-h-72 wwc:overflow-y-auto wwc:p-1">
					{filtered.length === 0 ? (
						<div className="wwc:px-3 wwc:py-4 wwc:text-center wwc:text-xs wwc:text-muted-foreground">
							No context found
						</div>
					) : (
						filtered.map((item) => (
							<button
								key={item.id}
								type="button"
								onClick={() => {
									onAddContext(item);
									setOpen(false);
									setQuery("");
								}}
								className="wwc:flex wwc:w-full wwc:items-start wwc:gap-2 wwc:rounded-md wwc:px-2 wwc:py-1.5 wwc:text-left wwc:text-sm wwc:hover:bg-muted"
							>
								<span className="wwc:mt-0.5 wwc:text-muted-foreground">
									{item.icon ?? <FileText className="wwc:h-3.5 wwc:w-3.5" />}
								</span>
								<span className="wwc:flex-1 wwc:min-w-0">
									<span className="wwc:block wwc:truncate wwc:font-medium wwc:text-foreground">{item.label}</span>
									{item.description && (
										<span className="wwc:block wwc:truncate wwc:text-xs wwc:text-muted-foreground">
											{item.description}
										</span>
									)}
								</span>
							</button>
						))
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
