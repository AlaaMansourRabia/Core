import {cn} from "@corensystem/coren-utils";
import {ArrowLeft, Loader2, Menu, MoreVertical, PanelLeft, PanelLeftClose} from "lucide-react";
import * as React from "react";

import {Button} from "../button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "../dropdown-menu";
import {HoverTooltip} from "../tooltip";

export type AIChatHeaderVariant = "header" | "toolbar";

export interface AIChatModel {
	id: string;
	label: string;
	icon?: React.ReactNode;
	description?: string;
}

export interface AIChatMode {
	id: string;
	label: string;
	icon?: React.ReactNode;
	description?: string;
}

export interface AIChatHeaderAction {
	id: string;
	label: string;
	icon: React.ReactNode;
	onSelect: () => void;
	disabled?: boolean;
	tone?: "default" | "destructive";
}

export interface AIChatHeaderContext {
	/** Primary usage line, e.g. "Context used: 0.2%" or "12k / 200k tokens". */
	usage?: React.ReactNode;
	/** Background process line — automatically prefixed with a small spinner. */
	status?: React.ReactNode;
}

export interface AIChatHeaderProps {
	/**
	 * Layout variant.
	 * - `"toolbar"` (default): left pane toggle + context (usage + spinner status) on the left.
	 *   Right cluster leads with a hamburger overflow when more than `maxVisibleActions` actions
	 *   (or any `menuActions`) are passed.
	 * - `"header"`: model/mode dropdowns on the left. Right cluster trails with a kebab for `menuActions`.
	 */
	variant?: AIChatHeaderVariant;

	// --- toolbar variant ---
	/** When provided, renders the left pane toggle button. */
	onTogglePane?: () => void;
	/** Current state of the left pane — flips the icon between PanelLeft / PanelLeftClose. */
	paneOpen?: boolean;
	/** aria-label for the pane toggle. Defaults to "Toggle side panel". */
	paneToggleLabel?: string;
	/** Context block rendered between the pane toggle and the action cluster. */
	context?: AIChatHeaderContext;

	// --- header variant ---
	models?: AIChatModel[];
	selectedModelId?: string;
	onSelectModel?: (id: string) => void;
	modes?: AIChatMode[];
	selectedModeId?: string;
	onSelectMode?: (id: string) => void;

	// --- back mode ---
	/**
	 * When set, the left cluster collapses to a back button plus `backTitle`, hiding the variant's
	 * own left content. Used for drill-ins like the history list, so returning restores the view
	 * underneath untouched.
	 */
	onBack?: () => void;
	/** Title shown next to the back button. */
	backTitle?: React.ReactNode;
	/** aria-label for the back button. Defaults to "Back". */
	backLabel?: string;

	// --- shared ---
	/**
	 * Conversation name shown in the header. Pass it (even as `""`) to render the name slot;
	 * omit it to leave the header as it was. With `onSessionNameChange` it becomes click-to-edit.
	 */
	sessionName?: string;
	/** Commit handler for the edited name. Omit to render the name as static text. */
	onSessionNameChange?: (next: string) => void;
	/** Shown when `sessionName` is empty — the untitled state. Defaults to "New chat". */
	sessionNamePlaceholder?: string;
	/** aria-label for the rename control. Defaults to "Rename chat". */
	sessionNameLabel?: string;
	/** Right-side icon-button actions. Defaults: toolbar caps at 4; header has no cap. */
	actions?: AIChatHeaderAction[];
	/** Cap on directly-rendered actions before overflow kicks in. Overrides the variant default. */
	maxVisibleActions?: number;
	/** Additional actions hidden behind the overflow menu. */
	menuActions?: AIChatHeaderAction[];
	/** aria-label for the overflow trigger. Defaults to "More actions". */
	menuLabel?: string;
	/** Slot rendered after the variant's left content. */
	leftExtra?: React.ReactNode;
	/** Slot rendered before the right action cluster. */
	rightExtra?: React.ReactNode;

	className?: string;
}

/**
 * Bar above the AI chat conversation. Two variants share the same right-side action cluster:
 *   - `toolbar` (default) — pane toggle + context info on the left, hamburger-led overflow on the right.
 *   - `header`             — model/mode dropdowns on the left, kebab-trailing overflow on the right.
 */
export function AIChatHeader({
	variant = "toolbar",
	onTogglePane,
	paneOpen,
	paneToggleLabel = "Toggle side panel",
	context,
	models,
	selectedModelId,
	onSelectModel,
	modes,
	selectedModeId,
	onSelectMode,
	onBack,
	backTitle,
	backLabel = "Back",
	sessionName,
	onSessionNameChange,
	sessionNamePlaceholder = "New chat",
	sessionNameLabel = "Rename chat",
	actions,
	maxVisibleActions,
	menuActions,
	menuLabel = "More actions",
	leftExtra,
	rightExtra,
	className,
}: AIChatHeaderProps) {
	const isToolbar = variant === "toolbar";

	// Toolbar caps at 4 by default; header has no cap.
	const effectiveCap = maxVisibleActions ?? (isToolbar ? 4 : Number.POSITIVE_INFINITY);
	const allActions = actions ?? [];
	const visibleActions = allActions.slice(0, effectiveCap);
	const overflowedActions = allActions.slice(effectiveCap);
	const combinedMenuActions = [...overflowedActions, ...(menuActions ?? [])];
	const hasOverflow = combinedMenuActions.length > 0;
	const OverflowIcon = isToolbar ? Menu : MoreVertical;

	const showModelDropdown = models !== undefined && models.length > 0 && onSelectModel !== undefined;
	const showModeDropdown = modes !== undefined && modes.length > 0 && onSelectMode !== undefined;
	const selectedModel = showModelDropdown ? (models.find((m) => m.id === selectedModelId) ?? models[0]) : undefined;
	const selectedMode = showModeDropdown ? (modes.find((m) => m.id === selectedModeId) ?? modes[0]) : undefined;

	const hasUsage = context?.usage !== undefined;
	const hasStatus = context?.status !== undefined;
	const hasContext = hasUsage || hasStatus;
	const hasPaneToggle = onTogglePane !== undefined;

	const showSessionName = sessionName !== undefined;
	const canRename = showSessionName && onSessionNameChange !== undefined;
	const [isRenaming, setIsRenaming] = React.useState(false);
	const [draft, setDraft] = React.useState(sessionName ?? "");
	const renameInputRef = React.useRef<HTMLInputElement>(null);

	// Re-seed the draft whenever the committed name changes underneath us — the name is expected to be
	// set from the conversation itself, which can land while the field is untouched.
	React.useEffect(() => {
		if (!isRenaming) setDraft(sessionName ?? "");
	}, [sessionName, isRenaming]);

	React.useEffect(() => {
		if (isRenaming) renameInputRef.current?.select();
	}, [isRenaming]);

	const commitRename = () => {
		const next = draft.trim();
		setIsRenaming(false);
		if (next !== (sessionName ?? "")) onSessionNameChange?.(next);
	};

	const cancelRename = () => {
		setDraft(sessionName ?? "");
		setIsRenaming(false);
	};

	const sessionNameNode = !showSessionName ? null : isRenaming ? (
		<input
			ref={renameInputRef}
			value={draft}
			autoFocus
			aria-label={sessionNameLabel}
			placeholder={sessionNamePlaceholder}
			onChange={(e) => setDraft(e.target.value)}
			onBlur={commitRename}
			onKeyDown={(e) => {
				if (e.key === "Enter") {
					e.preventDefault();
					commitRename();
				} else if (e.key === "Escape") {
					e.preventDefault();
					cancelRename();
				}
			}}
			// Sized to its own text rather than `flex-1` or a fixed width: either would shove the model/mode
			// dropdowns sideways the moment the field opens.
			size={Math.max(8, Math.min((draft || sessionNamePlaceholder).length, 28))}
			className="wwc:min-w-0 wwc:max-w-44 wwc:rounded wwc:border wwc:border-input wwc:bg-background wwc:px-1.5 wwc:py-0.5 wwc:text-sm wwc:font-medium wwc:text-foreground wwc:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring"
		/>
	) : canRename ? (
		<HoverTooltip content={sessionNameLabel}>
			<button
				type="button"
				onClick={() => setIsRenaming(true)}
				aria-label={sessionNameLabel}
				className={cn(
					"wwc:min-w-0 wwc:max-w-44 wwc:truncate wwc:rounded wwc:px-1.5 wwc:py-0.5 wwc:text-sm wwc:font-medium wwc:transition-colors wwc:hover:bg-muted wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring",
					sessionName ? "wwc:text-foreground" : "wwc:text-muted-foreground",
				)}
			>
				{sessionName || sessionNamePlaceholder}
			</button>
		</HoverTooltip>
	) : (
		<span
			className={cn(
				"wwc:min-w-0 wwc:max-w-44 wwc:truncate wwc:px-1.5 wwc:text-sm wwc:font-medium",
				sessionName ? "wwc:text-foreground" : "wwc:text-muted-foreground",
			)}
		>
			{sessionName || sessionNamePlaceholder}
		</span>
	);

	const overflowMenu = hasOverflow ? (
		<DropdownMenu>
			<HoverTooltip content={menuLabel}>
				<DropdownMenuTrigger asChild>
					<Button type="button" variant="ghost" icon aria-label={menuLabel}>
						<OverflowIcon />
					</Button>
				</DropdownMenuTrigger>
			</HoverTooltip>
			<DropdownMenuContent align="end" className="wwc:min-w-40">
				{combinedMenuActions.map((action) => (
					<DropdownMenuItem
						key={action.id}
						onSelect={action.onSelect}
						disabled={action.disabled}
						className={cn(
							"wwc:gap-2 wwc:[&_svg]:h-3.5 wwc:[&_svg]:w-3.5 wwc:[&_svg]:shrink-0",
							action.tone === "destructive" &&
								"wwc:text-destructive wwc:focus:text-destructive wwc:focus:bg-destructive/10",
						)}
					>
						{action.icon}
						<span>{action.label}</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	) : null;

	return (
		<div
			className={cn(
				"wwc:flex wwc:min-h-12 wwc:w-full wwc:items-center wwc:justify-between wwc:gap-3 wwc:border-b wwc:bg-card wwc:px-2 wwc:py-1.5",
				className,
			)}
		>
			<div className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-center wwc:gap-2">
				{onBack !== undefined ? (
					<>
						<HoverTooltip content={backLabel}>
							<Button
								type="button"
								variant="ghost"
								icon
								onClick={onBack}
								aria-label={backLabel}
								className="wwc:flex-shrink-0"
							>
								<ArrowLeft />
							</Button>
						</HoverTooltip>
						{backTitle !== undefined && (
							<span className="wwc:min-w-0 wwc:truncate wwc:text-sm wwc:font-medium wwc:text-foreground">
								{backTitle}
							</span>
						)}
					</>
				) : isToolbar ? (
					<>
						{hasPaneToggle && (
							<HoverTooltip content={paneToggleLabel}>
								<Button
									type="button"
									variant="ghost"
									icon
									onClick={onTogglePane}
									aria-label={paneToggleLabel}
									aria-pressed={paneOpen}
									className="wwc:flex-shrink-0 wwc:text-primary"
								>
									{paneOpen ? <PanelLeftClose /> : <PanelLeft />}
								</Button>
							</HoverTooltip>
						)}
						{sessionNameNode}
						{hasContext && (
							<div className="wwc:flex wwc:min-w-0 wwc:flex-col wwc:gap-0.5 wwc:text-xs wwc:text-muted-foreground">
								{hasUsage && <div className="wwc:truncate wwc:leading-tight">{context!.usage}</div>}
								{hasStatus && (
									<div className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:truncate wwc:leading-tight">
										<Loader2 className="wwc:h-3 wwc:w-3 wwc:flex-shrink-0 wwc:animate-spin wwc:text-primary" />
										<span className="wwc:truncate">{context!.status}</span>
									</div>
								)}
							</div>
						)}
					</>
				) : (
					<>
						{sessionNameNode}
						{showModelDropdown && selectedModel && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="sm" className="wwc:gap-1.5 wwc:px-2">
										{selectedModel.icon}
										<span className="wwc:font-medium">{selectedModel.label}</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="start" className="wwc:min-w-44">
									{models!.map((model) => (
										<DropdownMenuItem
											key={model.id}
											onSelect={() => onSelectModel?.(model.id)}
											className={cn(
												"wwc:gap-2 wwc:[&_svg]:h-3.5 wwc:[&_svg]:w-3.5 wwc:[&_svg]:shrink-0",
												model.id === selectedModel.id && "wwc:bg-accent",
											)}
										>
											{model.icon}
											<div className="wwc:flex wwc:flex-col">
												<span className="wwc:font-medium">{model.label}</span>
												{model.description && (
													<span className="wwc:text-[11px] wwc:text-muted-foreground">{model.description}</span>
												)}
											</div>
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						)}
						{showModeDropdown && selectedMode && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="sm" className="wwc:gap-1.5 wwc:px-2">
										{selectedMode.icon}
										<span className="wwc:font-medium">{selectedMode.label}</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="start" className="wwc:min-w-40">
									{modes!.map((mode) => (
										<DropdownMenuItem
											key={mode.id}
											onSelect={() => onSelectMode?.(mode.id)}
											className={cn(
												"wwc:gap-2 wwc:[&_svg]:h-3.5 wwc:[&_svg]:w-3.5 wwc:[&_svg]:shrink-0",
												mode.id === selectedMode.id && "wwc:bg-accent",
											)}
										>
											{mode.icon}
											<div className="wwc:flex wwc:flex-col">
												<span className="wwc:font-medium">{mode.label}</span>
												{mode.description && (
													<span className="wwc:text-[11px] wwc:text-muted-foreground">{mode.description}</span>
												)}
											</div>
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</>
				)}
				{leftExtra}
			</div>

			{(rightExtra !== undefined || visibleActions.length > 0 || hasOverflow) && (
				<div className="wwc:flex wwc:flex-shrink-0 wwc:items-center wwc:gap-0.5">
					{rightExtra}
					{/* Toolbar: overflow leads. Header: overflow trails. */}
					{isToolbar && overflowMenu}
					{visibleActions.map((action) => (
						<HoverTooltip key={action.id} content={action.label}>
							<Button
								type="button"
								variant="ghost"
								icon
								onClick={action.onSelect}
								disabled={action.disabled}
								aria-label={action.label}
								className={cn(action.tone === "destructive" && "wwc:text-destructive wwc:hover:text-destructive")}
							>
								{action.icon}
							</Button>
						</HoverTooltip>
					))}
					{!isToolbar && overflowMenu}
				</div>
			)}
		</div>
	);
}
