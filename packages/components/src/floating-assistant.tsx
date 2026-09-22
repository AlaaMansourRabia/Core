import {cn} from "@core/core-utils";
import {PanelRight, PictureInPicture2, X} from "lucide-react";
import * as React from "react";

import {AIChat, type AIChatSession} from "./chat/core-ai-chat";
import type {AIChatHeaderAction} from "./chat/core-ai-chat-header";
import {CoreMark} from "./core-mark";
import type {PromptContextItem} from "./prompt-input";
import {PushPanel, PushPanelContainer, PushPanelMain, PushPanelProvider} from "./push-panel";
import type {Message} from "./types/chat";

export interface FloatingAssistantProps {
	/** Conversation messages (controlled). */
	messages: Message[];
	/** Receives the next messages array. */
	onMessagesChange: (next: Message[]) => void;
	/** Consumer-owned send handler — append the user + assistant messages and toggle `isLoading`. */
	onSendMessage: (content: string) => Promise<void>;
	/** Loading state while `onSendMessage` runs. */
	isLoading: boolean;

	/** Controlled open state. Omit to let the widget manage its own. */
	open?: boolean;
	onOpenChange?: (open: boolean) => void;

	/** Trigger icon, shown bare with no chrome. Defaults to the Core brand mark. */
	icon?: React.ReactNode;
	/** Accessible label for the trigger. */
	triggerLabel?: string;
	/** Accessible label for the trigger while a detached panel is open. */
	closeLabel?: string;
	/** Hides the header's detach/dock toggle. */
	detachable?: boolean;
	/** Empty-state heading inside the panel. */
	title?: string;
	/** Empty-state subtitle. */
	subtitle?: string;
	/** Composer placeholder. */
	placeholder?: string;
	/** Quick-start prompts shown in the empty state. */
	suggestedPrompts?: string[];

	/** Conversation name shown in the panel header. Pass it (even as `""`) to render the name slot. */
	sessionName?: string;
	/** Commit handler for the edited name. Omit to render the name as static text. */
	onSessionNameChange?: (next: string) => void;
	/** Shown while `sessionName` is empty. */
	sessionNamePlaceholder?: string;
	/** Items offered by the composer's "Add context" picker. */
	availableContext?: PromptContextItem[];
	/** Enables the composer's attachment button. Receives the picked files. */
	onUploadFile?: (files: FileList) => void;
	/** Small note under the composer naming what the assistant can see — the page it is open on. */
	contextNote?: React.ReactNode;
	/** Extra header actions, rendered between the built-in history action and the close button. */
	headerActions?: AIChatHeaderAction[];
	/** Past conversations. Providing them adds the history action to the panel header. */
	sessions?: AIChatSession[];
	/** Called with the picked session id. */
	onSelectSession?: (id: string) => void;
	/** Highlights the row for the conversation currently open. */
	activeSessionId?: string;

	/** The page content the panel docks beside. It narrows as the panel opens. */
	children?: React.ReactNode;
	/** Docked panel width in px. */
	panelWidth?: number;
	/** Extra classes for the panel. */
	className?: string;
	/** Extra classes for the layout row wrapping the page content and the panel. */
	containerClassName?: string;
}

/**
 * An AI assistant that docks to the right of the page. A floating, corner-anchored trigger opens a
 * full-height panel powered by `AIChat`; the panel takes its width from the layout rather than floating
 * over it, so `children` — the page content — narrows to make room (built on `PushPanel`).
 *
 * The conversation is controlled by the consumer (`messages` + `onSendMessage`), so any domain logic can
 * drive the replies. The trigger is the bare Core brand mark with no chrome behind it, taking
 * `foreground` so it inverts with the theme; pass `icon` to swap in any other glyph.
 */
export function FloatingAssistant({
	messages,
	onMessagesChange,
	onSendMessage,
	isLoading,
	open,
	onOpenChange,
	icon,
	triggerLabel = "Open assistant",
	closeLabel = "Close assistant",
	detachable = true,
	title = "Assistant",
	subtitle = "Ask a question to get started.",
	placeholder = "Ask anything…",
	suggestedPrompts,
	sessionName,
	onSessionNameChange,
	sessionNamePlaceholder,
	availableContext,
	onUploadFile,
	contextNote,
	headerActions,
	sessions,
	onSelectSession,
	activeSessionId,
	children,
	panelWidth = 420,
	className,
	containerClassName,
}: FloatingAssistantProps) {
	const [internalOpen, setInternalOpen] = React.useState(false);
	const isOpen = open ?? internalOpen;
	const setOpen = onOpenChange ?? setInternalOpen;

	// Detached: the panel leaves the layout row and floats above the trigger instead of pushing the
	// page. `floatShown` flips one frame after mount so the opacity/scale transition has a start state
	// to animate from.
	const [detached, setDetached] = React.useState(false);
	const [floatShown, setFloatShown] = React.useState(false);
	const isFloating = isOpen && detached;

	React.useEffect(() => {
		if (!isFloating) {
			setFloatShown(false);
			return;
		}
		const id = requestAnimationFrame(() => setFloatShown(true));
		return () => cancelAnimationFrame(id);
	}, [isFloating]);

	const trigger = (
		<button
			type="button"
			onClick={() => setOpen(!isFloating)}
			aria-label={isFloating ? closeLabel : triggerLabel}
			// No chrome behind the mark: it sits directly on the page, so it takes `foreground` and the
			// 48px box is hit target only. `rounded-full` is kept just to shape the focus ring.
			className="wwc:fixed wwc:bottom-6 wwc:right-6 wwc:z-50 wwc:flex wwc:h-12 wwc:w-12 wwc:items-center wwc:justify-center wwc:rounded-full wwc:text-foreground wwc:transition-transform wwc:hover:scale-105 wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring wwc:focus-visible:ring-offset-2"
		>
			{icon ?? <CoreMark className="wwc:h-8 wwc:w-8 wwc:drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]" />}
		</button>
	);

	const chat = (
		<AIChat
			className="wwc:h-full"
			messages={messages}
			onMessagesChange={onMessagesChange}
			onSendMessage={onSendMessage}
			isLoading={isLoading}
			headerVariant="toolbar"
			availableContext={availableContext}
			onUploadFile={onUploadFile}
			contextNote={contextNote}
			sessionName={sessionName}
			onSessionNameChange={onSessionNameChange}
			sessionNamePlaceholder={sessionNamePlaceholder}
			sessions={sessions}
			onSelectSession={onSelectSession}
			activeSessionId={activeSessionId}
			headerActions={[
				...(headerActions ?? []),
				...(detachable
					? [
							{
								id: "detach",
								label: detached ? "Dock panel" : "Detach panel",
								icon: detached ? (
									<PanelRight className="wwc:h-4 wwc:w-4" />
								) : (
									<PictureInPicture2 className="wwc:h-4 wwc:w-4" />
								),
								onSelect: () => setDetached((value) => !value),
							},
						]
					: []),
				// Close trails, so it keeps the rightmost slot whatever else is passed.
				{id: "close", label: "Close", icon: <X className="wwc:h-4 wwc:w-4" />, onSelect: () => setOpen(false)},
			]}
			emptyTitle={title}
			emptySubtitle={subtitle}
			placeholder={placeholder}
			suggestedPrompts={suggestedPrompts}
		/>
	);

	return (
		<PushPanelProvider open={isOpen && !detached} onOpenChange={setOpen} side="right">
			<PushPanelContainer className={cn("wwc:h-full wwc:min-h-0", containerClassName)}>
				<PushPanelMain className="wwc:min-w-0 wwc:overflow-auto">{children}</PushPanelMain>
				{/*
				 * `self-stretch` (not `h-full`) is what makes the panel full height: with no bounded parent
				 * `height: 100%` collapses to `auto`, so the panel would only be as tall as its own content.
				 * Stretching takes the row's height instead, capped at the viewport and pinned with `sticky`
				 * so the composer stays reachable on a page taller than the screen.
				 */}
				<PushPanel
					width={panelWidth}
					className={cn(
						// `PushPanel` paints `bg-card` on its inner surface; pair it with the matching text colour.
						"wwc:sticky wwc:top-0 wwc:max-h-screen wwc:self-stretch wwc:border-border wwc:text-card-foreground",
						className,
					)}
				>
					{!detached && chat}
				</PushPanel>
			</PushPanelContainer>
			{(!isOpen || detached) && trigger}
			{isFloating && (
				<div
					className="wwc:fixed wwc:z-50 wwc:flex wwc:flex-col wwc:overflow-hidden wwc:rounded-2xl wwc:border wwc:border-border wwc:bg-card wwc:text-card-foreground"
					style={{
						// Geometry and the transition are inline rather than utilities: the two hand-maintained
						// core-render.css sheets carry neither the arbitrary sizes nor the animation classes,
						// so utilities here would vanish in Studio and open-design.
						right: 24,
						bottom: 84,
						width: "min(420px, calc(100vw - 3rem))",
						// Runs from just under the host's header/tab row down to the trigger, rather than a
						// short card: 12rem is the 84px bottom offset plus room for a top bar and tab strip.
						height: "calc(100vh - 12rem)",
						// `shadow-*` utilities are deliberately no-ops — packages/tokens/src/index.css zeroes
						// every one of them for the minimal theme. A detached overlay is the one thing that has
						// to separate from the page behind it, so it sets its own.
						boxShadow: "0 16px 48px -12px rgba(0, 0, 0, 0.28), 0 4px 12px -4px rgba(0, 0, 0, 0.12)",
						opacity: floatShown ? 1 : 0,
						transform: floatShown ? "scale(1)" : "scale(0.95)",
						transformOrigin: "bottom right",
						transition: "opacity 200ms ease-out, transform 200ms ease-out",
					}}
				>
					{chat}
				</div>
			)}
		</PushPanelProvider>
	);
}
