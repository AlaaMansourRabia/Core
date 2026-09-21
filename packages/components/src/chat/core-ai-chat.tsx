import {cn} from "@wakecap/core-utils";
import {Check, Clock, Copy} from "lucide-react";
import {useCallback, useEffect, useRef, useState} from "react";

import {PromptInput, type PromptAttachment, type PromptContextItem} from "../prompt-input";
import {ScrollArea} from "../scroll-area";
import {generateId, sendChatMessage} from "../services/chatService";
import {ThinkingPill} from "../thinking-pill";
import {TurnTimer} from "../turn-timer";
import type {ChartData, ChartMessage, Message, TextMessage} from "../types/chat";
import {WakecapMark} from "../wakecap-mark";
import {
	AIChatHeader,
	type AIChatHeaderAction,
	type AIChatHeaderContext,
	type AIChatMode,
	type AIChatModel,
} from "./core-ai-chat-header";
import {AIChatMessage} from "./core-ai-chat-message";

interface AIChatProps {
	/** Optional initial messages to seed the conversation. Ignored when `messages` is provided. */
	initialMessages?: Message[];
	/** API endpoint for the chat backend. Falls back to the built-in mock. Ignored when `onSendMessage` is provided. */
	apiEndpoint?: string;
	/** Placeholder for the input field. */
	placeholder?: string;
	/** Suggested prompts shown in the empty state. */
	suggestedPrompts?: string[];
	/** Heading shown in the empty state, under the brand mark. */
	emptyTitle?: string;
	/** Subtitle under the empty-state heading. */
	emptySubtitle?: string;
	/** Available context items for the "Add context" popover. Omit to hide that button. */
	availableContext?: PromptContextItem[];
	/** Enable file uploads. Provide a callback to handle the FileList. */
	onUploadFile?: (files: FileList) => void;

	// --- Controlled state (all three are additive, backwards-compatible) ---
	/** Controlled messages. When provided alongside `onMessagesChange`, AIChat does not manage messages internally. */
	messages?: Message[];
	/** Required when `messages` is provided — receives the next messages array. */
	onMessagesChange?: (next: Message[]) => void;
	/** Custom send handler. When provided, replaces the bundled `sendChatMessage` call entirely. */
	onSendMessage?: (content: string, attachments?: PromptAttachment[]) => Promise<void>;
	/** Controlled loading state. Required when `onSendMessage` is provided. */
	isLoading?: boolean;

	// --- Header / toolbar bar (one component, two variants) ---
	/**
	 * Picks the variant of `AIChatHeader` rendered above the messages.
	 * - `"toolbar"` (default): left pane toggle + context info on the left.
	 * - `"header"`: model + mode dropdowns on the left.
	 */
	headerVariant?: "header" | "toolbar";

	// toolbar variant
	/** When provided, the toolbar renders a left pane toggle wired to this handler. */
	onTogglePane?: () => void;
	/** Whether the consumer's side panel is currently open. Flips the toggle icon. */
	paneOpen?: boolean;
	/** Context block (usage + spinner status) shown between the pane toggle and the actions. */
	headerContext?: AIChatHeaderContext;

	// header variant
	models?: AIChatModel[];
	selectedModelId?: string;
	onSelectModel?: (id: string) => void;
	modes?: AIChatMode[];
	selectedModeId?: string;
	onSelectMode?: (id: string) => void;

	// shared
	/** Right-side icon-button actions. Toolbar variant caps at 4; header has no cap by default. */
	/**
	 * Small centred note under the composer naming the context the assistant is working from — the
	 * page it is open on, typically. Rendered only when set; it is a statement, not an action.
	 */
	contextNote?: React.ReactNode;
	/**
	 * Past conversations for the built-in history view. Providing this adds a history action to the
	 * header; opening it swaps the conversation area for the list without touching the conversation,
	 * so Back restores exactly what was underneath — an existing session or an untouched new one.
	 */
	sessions?: AIChatSession[];
	/** Called with the picked session id. The history view closes itself afterwards. */
	onSelectSession?: (id: string) => void;
	/** Highlights the row for the conversation currently open. */
	activeSessionId?: string;
	/** Label for the header's history action. Defaults to "Chat history". */
	historyLabel?: string;
	/** Title shown beside the back button in the history view. Defaults to "Chat history". */
	historyTitle?: string;
	/** Shown when `sessions` is empty. Defaults to "No past conversations." */
	historyEmptyText?: string;
	/**
	 * Conversation name shown in the header. Pass it (even as `""`) to render the name slot — the
	 * empty value shows `sessionNamePlaceholder` until a name is set, which in production is expected
	 * to come from the conversation itself.
	 */
	sessionName?: string;
	/** Commit handler for the edited name. Omit to render the name as static text. */
	onSessionNameChange?: (next: string) => void;
	/** Shown while `sessionName` is empty. Defaults to "New chat". */
	sessionNamePlaceholder?: string;
	headerActions?: AIChatHeaderAction[];
	/** Additional actions hidden behind the overflow menu (kebab for header, hamburger for toolbar). */
	headerMenuActions?: AIChatHeaderAction[];
	/** Slot rendered after the variant's left content. */
	headerLeftExtra?: React.ReactNode;
	/** Slot rendered before the right action cluster. */
	headerRightExtra?: React.ReactNode;

	/**
	 * Wrap the chat in a rounded, bordered card. Defaults to `false` (full bleed) so the chat
	 * fills its parent edge-to-edge — the common case when embedding in a panel or pane. Set to
	 * `true` to render the self-contained card (rounded corners + border).
	 */
	contained?: boolean;

	/** Extra class names for the outer container. */
	className?: string;
}

/**
 * Composer height for the chat panel: two lines plus padding, against `PromptInput`'s three-line
 * default. The panel is a narrow column, so the taller default eats the conversation area.
 */
export interface AIChatSession {
	id: string;
	/** Display name — falls back to the untitled placeholder when empty. */
	name: string;
	/** Secondary line, e.g. the last message or a relative timestamp. */
	preview?: string;
	/** Secondary line suffix, e.g. "2h ago". */
	updatedAt?: string;
}

const COMPOSER_MIN_HEIGHT = 66;

const DEFAULT_PROMPTS = [
	"Summarize this report",
	"What are the key insights?",
	"Show me trends over time",
	"Suggest next actions",
];

const isDev = typeof process !== "undefined" && process.env?.NODE_ENV !== "production";

/**
 * An inline AI chat container with grey user pills and full-width assistant
 * responses (no bubble, no timestamps, no avatars). Designed to be embedded
 * directly in a page rather than popped out of a corner button.
 */
export function AIChat({
	initialMessages = [],
	apiEndpoint,
	placeholder = "Ask anything...",
	suggestedPrompts = DEFAULT_PROMPTS,
	emptyTitle = "How can I help?",
	emptySubtitle = "Start a conversation or pick a suggestion below.",
	availableContext,
	onUploadFile,
	messages: controlledMessages,
	onMessagesChange,
	onSendMessage,
	isLoading: controlledIsLoading,
	models,
	selectedModelId,
	onSelectModel,
	modes,
	selectedModeId,
	onSelectMode,
	headerVariant = "toolbar",
	onTogglePane,
	paneOpen,
	headerContext,
	contextNote,
	sessions,
	onSelectSession,
	activeSessionId,
	historyLabel = "Chat history",
	historyTitle = "Chat history",
	historyEmptyText = "No past conversations.",
	sessionName,
	onSessionNameChange,
	sessionNamePlaceholder,
	headerActions,
	headerMenuActions,
	headerLeftExtra,
	headerRightExtra,
	contained = false,
	className,
}: AIChatProps) {
	const isMessagesControlled = controlledMessages !== undefined && onMessagesChange !== undefined;
	const isLoadingControlled = controlledIsLoading !== undefined;
	const isCustomSend = onSendMessage !== undefined;

	const [internalMessages, setInternalMessages] = useState<Message[]>(controlledMessages ?? initialMessages);
	const [internalIsLoading, setInternalIsLoading] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const [attachments, setAttachments] = useState<PromptAttachment[]>([]);
	const [turnStartedAt, setTurnStartedAt] = useState<number | null>(null);
	const [turnDurations, setTurnDurations] = useState<Record<string, number>>({});
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const messages = isMessagesControlled ? controlledMessages : internalMessages;
	const isLoading = isLoadingControlled ? controlledIsLoading : internalIsLoading;

	const messagesRef = useRef(messages);
	useEffect(() => {
		messagesRef.current = messages;
	}, [messages]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
	}, [messages, isLoading]);

	// Dev-only misuse warnings.
	useEffect(() => {
		if (!isDev) return;
		if ((controlledMessages !== undefined) !== (onMessagesChange !== undefined)) {
			console.warn(
				"[AIChat] `messages` and `onMessagesChange` must be provided together. Falling back to uncontrolled behavior.",
			);
		}
		if (onSendMessage !== undefined && controlledIsLoading === undefined) {
			console.warn(
				"[AIChat] When `onSendMessage` is provided, `isLoading` must also be provided — AIChat can't infer when the consumer's async work finishes.",
			);
		}
		if (onSendMessage !== undefined && apiEndpoint !== undefined) {
			console.warn("[AIChat] `apiEndpoint` is ignored when `onSendMessage` is provided.");
		}
	}, [controlledMessages, onMessagesChange, onSendMessage, controlledIsLoading, apiEndpoint]);

	const applyMessages = useCallback(
		(next: Message[]) => {
			if (isMessagesControlled) {
				onMessagesChange!(next);
			} else {
				setInternalMessages(next);
			}
		},
		[isMessagesControlled, onMessagesChange],
	);

	const appendMessage = useCallback(
		(msg: Message) => {
			applyMessages([...messagesRef.current, msg]);
		},
		[applyMessages],
	);

	// In custom-send mode, record the turn duration when isLoading transitions from true → false.
	// Keys it on the last assistant message (assumed to be the one the consumer just appended).
	const previousLoadingRef = useRef(isLoading);
	useEffect(() => {
		const wasLoading = previousLoadingRef.current;
		previousLoadingRef.current = isLoading;
		if (!isCustomSend) return;
		if (wasLoading && !isLoading && turnStartedAt !== null) {
			const elapsed = Date.now() - turnStartedAt;
			const lastAssistant = [...messagesRef.current].reverse().find((m) => m.role === "assistant");
			if (lastAssistant && !(lastAssistant.id in turnDurations)) {
				setTurnDurations((prev) => ({...prev, [lastAssistant.id]: elapsed}));
			}
			setTurnStartedAt(null);
		}
	}, [isLoading, isCustomSend, turnStartedAt, turnDurations]);

	const handleSendMessage = useCallback(
		async (content: string) => {
			const startedAt = Date.now();

			if (isCustomSend) {
				// Consumer owns the send pipeline: messages, isLoading, errors.
				setTurnStartedAt(startedAt);
				const sentAttachments = attachments;
				setInputValue("");
				setAttachments([]);
				try {
					await onSendMessage!(content, sentAttachments);
				} catch (err) {
					// Consumer is responsible for surfacing errors. We don't append a default message.
					if (isDev) console.warn("[AIChat] onSendMessage threw:", err);
				}
				return;
			}

			// Default pipeline: bundled sendChatMessage mock.
			const userMessage: TextMessage = {
				id: generateId(),
				role: "user",
				type: "text",
				content,
				timestamp: new Date(),
				// Carried onto the message so the bubble can show what was sent with it — the composer
				// is cleared immediately below, so this is the only record of them.
				attachments: attachments.length > 0 ? attachments : undefined,
			};
			appendMessage(userMessage);
			setInputValue("");
			setAttachments([]);
			setTurnStartedAt(startedAt);
			setInternalIsLoading(true);

			try {
				const response = await sendChatMessage(content, apiEndpoint);
				const elapsed = Date.now() - startedAt;

				let assistantMessage: Message;
				if (response.chart) {
					assistantMessage = {
						id: generateId(),
						role: "assistant",
						type: "chart",
						content: response.message,
						chartData: response.chart,
						timestamp: new Date(),
						targetTab: response.targetTab,
					} as ChartMessage;
				} else {
					assistantMessage = {
						id: generateId(),
						role: "assistant",
						type: "text",
						content: response.message,
						timestamp: new Date(),
					} as TextMessage;
				}
				appendMessage(assistantMessage);
				setTurnDurations((prev) => ({...prev, [assistantMessage.id]: elapsed}));
			} catch {
				const elapsed = Date.now() - startedAt;
				const errorMessage: TextMessage = {
					id: generateId(),
					role: "assistant",
					type: "text",
					content: "Sorry, something went wrong. Please try again.",
					timestamp: new Date(),
				};
				appendMessage(errorMessage);
				setTurnDurations((prev) => ({...prev, [errorMessage.id]: elapsed}));
			} finally {
				setInternalIsLoading(false);
				setTurnStartedAt(null);
			}
		},
		[isCustomSend, onSendMessage, attachments, appendMessage, apiEndpoint],
	);

	const isEmpty = messages.length === 0;

	// The history view is a pure overlay on the conversation: nothing about `messages` or the composer
	// is touched while it is open, so going Back lands exactly where the user left off.
	const [showHistory, setShowHistory] = useState(false);
	const hasHistory = sessions !== undefined;

	const resolvedHeaderActions = hasHistory
		? [
				// Leads, so consumer actions — the panel's close button, say — keep the rightmost slot.
				{
					id: "__history",
					label: historyLabel,
					icon: <Clock />,
					onSelect: () => setShowHistory(true),
				},
				...(headerActions ?? []),
			]
		: headerActions;

	const showHeader =
		(headerVariant === "toolbar" &&
			(onTogglePane !== undefined ||
				headerContext !== undefined ||
				(headerActions !== undefined && headerActions.length > 0) ||
				(headerMenuActions !== undefined && headerMenuActions.length > 0))) ||
		(headerVariant === "header" &&
			((models !== undefined && models.length > 0) ||
				(modes !== undefined && modes.length > 0) ||
				(headerActions !== undefined && headerActions.length > 0) ||
				(headerMenuActions !== undefined && headerMenuActions.length > 0))) ||
		sessionName !== undefined ||
		hasHistory ||
		headerLeftExtra !== undefined ||
		headerRightExtra !== undefined;

	return (
		<div
			className={cn(
				"wwc:flex wwc:h-full wwc:w-full wwc:flex-col wwc:overflow-hidden wwc:bg-card",
				contained && "wwc:rounded-xl wwc:border",
				className,
			)}
		>
			{showHeader && (
				<AIChatHeader
					variant={headerVariant}
					onTogglePane={onTogglePane}
					paneOpen={paneOpen}
					context={headerContext}
					models={showHistory ? undefined : models}
					selectedModelId={selectedModelId}
					onSelectModel={onSelectModel}
					modes={showHistory ? undefined : modes}
					selectedModeId={selectedModeId}
					onSelectMode={onSelectMode}
					onBack={showHistory ? () => setShowHistory(false) : undefined}
					backTitle={showHistory ? historyTitle : undefined}
					sessionName={showHistory ? undefined : sessionName}
					onSessionNameChange={onSessionNameChange}
					sessionNamePlaceholder={sessionNamePlaceholder}
					actions={showHistory ? undefined : resolvedHeaderActions}
					menuActions={showHistory ? undefined : headerMenuActions}
					leftExtra={headerLeftExtra}
					rightExtra={headerRightExtra}
				/>
			)}
			<ScrollArea className="wwc:flex-1">
				{showHistory && sessions ? (
					sessions.length === 0 ? (
						<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:px-6 wwc:py-12">
							<p className="wwc:text-sm wwc:text-muted-foreground">{historyEmptyText}</p>
						</div>
					) : (
						<div className="wwc:flex wwc:flex-col wwc:gap-0.5 wwc:p-2">
							{sessions.map((session) => {
								const meta = [session.preview, session.updatedAt].filter(Boolean).join(" · ");
								return (
									<button
										key={session.id}
										type="button"
										onClick={() => {
											onSelectSession?.(session.id);
											setShowHistory(false);
										}}
										className={cn(
											"wwc:flex wwc:w-full wwc:flex-col wwc:gap-0.5 wwc:rounded-lg wwc:px-3 wwc:py-2 wwc:text-left wwc:transition-colors wwc:hover:bg-muted",
											session.id === activeSessionId && "wwc:bg-muted",
										)}
									>
										<span className="wwc:truncate wwc:text-sm wwc:font-medium wwc:text-foreground">
											{session.name || sessionNamePlaceholder || "New chat"}
										</span>
										{meta && <span className="wwc:truncate wwc:text-xs wwc:text-muted-foreground">{meta}</span>}
									</button>
								);
							})}
						</div>
					)
				) : isEmpty ? (
					<div className="wwc:flex wwc:h-full wwc:flex-col wwc:items-center wwc:justify-center wwc:gap-4 wwc:px-6 wwc:py-12 wwc:text-center">
						<WakecapMark className="wwc:h-12 wwc:w-12 wwc:text-foreground" />
						<div className="wwc:space-y-1">
							<h3 className="wwc:text-base wwc:font-semibold wwc:text-foreground">{emptyTitle}</h3>
							<p className="wwc:text-sm wwc:text-muted-foreground">{emptySubtitle}</p>
						</div>
					</div>
				) : (
					<div className="wwc:flex wwc:flex-col wwc:gap-4 wwc:px-4 wwc:py-4">
						{messages.map((message) => {
							const elapsed = turnDurations[message.id];
							return (
								<div key={message.id} className="wwc:flex wwc:flex-col wwc:gap-1">
									<AIChatMessage message={message} />
									{message.role === "assistant" && (
										<div className="wwc:flex wwc:items-center wwc:gap-3">
											{elapsed !== undefined && <TurnTimer done value={`${(elapsed / 1000).toFixed(1)}s`} />}
											<CopyButton text={message.content} />
										</div>
									)}
								</div>
							);
						})}
						{isLoading && turnStartedAt !== null && (
							<div className="wwc:flex wwc:flex-col wwc:gap-1">
								<ThinkingPill />
								<TurnTimer startedAt={turnStartedAt} />
							</div>
						)}
						<div ref={messagesEndRef} />
					</div>
				)}
			</ScrollArea>
			{!showHistory && isEmpty && suggestedPrompts.length > 0 && (
				<div className="wwc:flex wwc:flex-wrap wwc:justify-start wwc:gap-2 wwc:px-3 wwc:pt-1">
					{suggestedPrompts.map((prompt) => (
						<button
							key={prompt}
							type="button"
							onClick={() => handleSendMessage(prompt)}
							className="wwc:rounded-full wwc:border wwc:bg-card wwc:px-3 wwc:py-1.5 wwc:text-xs wwc:text-foreground wwc:transition-colors wwc:hover:bg-muted"
						>
							{prompt}
						</button>
					))}
				</div>
			)}
			{!showHistory && (
				<div className="wwc:p-3">
					<PromptInput
						value={inputValue}
						onChange={setInputValue}
						onSend={handleSendMessage}
						submitting={isLoading}
						placeholder={placeholder}
						minHeight={COMPOSER_MIN_HEIGHT}
						attachments={attachments}
						onRemoveAttachment={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
						availableContext={availableContext}
						onAddContext={(item) =>
							setAttachments((prev) =>
								prev.some((a) => a.id === item.id)
									? prev
									: [...prev, {id: item.id, label: item.label, type: "context", icon: item.icon}],
							)
						}
						onUploadFile={
							onUploadFile
								? (files) => {
										onUploadFile(files);
										const newAttachments = Array.from(files).map((file) => ({
											id: `file-${Date.now()}-${file.name}`,
											label: file.name,
											type: "file" as const,
										}));
										setAttachments((prev) => [...prev, ...newAttachments]);
									}
								: undefined
						}
					/>
					{contextNote !== undefined && (
						<p className="wwc:mt-1.5 wwc:truncate wwc:px-1 wwc:text-center wwc:text-xs wwc:text-muted-foreground">
							{contextNote}
						</p>
					)}
				</div>
			)}
		</div>
	);
}

function CopyButton({text}: {text: string}) {
	const [copied, setCopied] = useState(false);
	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1500);
		} catch {
			// Clipboard write may fail in restricted contexts; ignore silently.
		}
	};
	return (
		<button
			type="button"
			onClick={handleCopy}
			aria-label={copied ? "Copied" : "Copy response"}
			className="wwc:inline-flex wwc:items-center wwc:gap-1 wwc:rounded-sm wwc:p-0.5 wwc:text-[11px] wwc:text-muted-foreground wwc:transition-colors wwc:hover:text-foreground wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring"
		>
			{copied ? <Check className="wwc:h-3 wwc:w-3" /> : <Copy className="wwc:h-3 wwc:w-3" />}
		</button>
	);
}
